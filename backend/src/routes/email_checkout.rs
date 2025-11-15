use axum::{routing::post, Json, Router, Extension, http::StatusCode};
use serde::Deserialize;
use std::sync::Arc;

use crate::state::AppState;
use crate::email::send_html_email;

#[derive(Deserialize)]
pub struct SendCheckoutEmailRequest {
    pub customer_email: String,
    pub order_id: String,
    pub total_amount: i64,
    pub items: Vec<serde_json::Value>,
}

pub fn router() -> Router {
    Router::new().route("/api/email/send-checkout", post(send_checkout_email))
}

async fn send_checkout_email(
    Extension(state): Extension<Arc<AppState>>,
    Json(payload): Json<SendCheckoutEmailRequest>,
) -> Result<Json<serde_json::Value>, StatusCode> {
    let checkout_url = format!(
        "{}/checkout?order_id={}",
        state.app_url, payload.order_id
    );

    let total_euros = (payload.total_amount as f64) / 100.0;

    let html_body = format!(
        r#"
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                body {{ font-family: Arial, sans-serif; background-color: #f5f5f5; }}
                .container {{ max-width: 600px; margin: 20px auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }}
                .header {{ color: #333; border-bottom: 2px solid #e67e22; padding-bottom: 10px; margin-bottom: 20px; }}
                .content {{ color: #666; line-height: 1.6; }}
                .amount {{ font-size: 24px; font-weight: bold; color: #e67e22; margin: 20px 0; }}
                .button {{ display: inline-block; background-color: #e67e22; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }}
                .footer {{ color: #999; font-size: 12px; margin-top: 20px; padding-top: 10px; border-top: 1px solid #eee; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h2>Restaurant Order Confirmation</h2>
                </div>
                <div class="content">
                    <p>Hello,</p>
                    <p>Your order has been prepared by our kitchen team. Please complete your payment using the link below:</p>
                    <div class="amount">
                        €{:.2}
                    </div>
                    <p>
                        <a href="{}" class="button">Complete Payment via PayPal</a>
                    </p>
                    <p>Order ID: <strong>{}</strong></p>
                    <p style="color: #e67e22; font-weight: bold;">Please complete payment within 2 hours of placing your order.</p>
                </div>
                <div class="footer">
                    <p>This is an automated message. Please do not reply to this email.</p>
                </div>
            </div>
        </body>
        </html>
        "#,
        total_euros, checkout_url, payload.order_id
    );

    match send_html_email(
        &state,
        &payload.customer_email,
        "Complete Your Payment - Restaurant Order",
        &html_body,
    )
    .await
    {
        Ok(_) => {
            tracing::info!(
                "Checkout email sent to {} for order {}",
                payload.customer_email,
                payload.order_id
            );
            Ok(Json(serde_json::json!({
                "success": true,
                "message": "Checkout email sent successfully"
            })))
        }
        Err(e) => {
            tracing::error!(
                "Failed to send checkout email to {}: {:?}",
                payload.customer_email,
                e
            );
            Err(StatusCode::INTERNAL_SERVER_ERROR)
        }
    }
}

