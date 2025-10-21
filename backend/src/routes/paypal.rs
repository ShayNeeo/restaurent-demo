use axum::{routing::get, Router, extract::Query, response::Redirect, Extension};
use serde::Deserialize;
use std::sync::Arc;
use uuid::Uuid;
use crate::{state::AppState, payments::capture_paypal_order};
use crate::email::send_email;

#[derive(Deserialize)]
struct ReturnParams { token: Option<String> }
// cleaned duplicate imports

pub fn router() -> Router {
    // In production, capture PayPal order IDs on return and finalize order/gift coupon.
    Router::new()
        .route("/api/paypal/return", get(paypal_return))
        .route("/api/paypal/cancel", get(|| async { "CANCEL" }))
        .route("/api/paypal/gift/return", get(paypal_gift_return))
        .route("/api/paypal/gift/cancel", get(|| async { "CANCEL" }))
}

async fn paypal_return() -> Redirect {
    Redirect::to("/thank-you")
}

async fn paypal_gift_return(Extension(state): Extension<Arc<AppState>>, Query(params): Query<ReturnParams>) -> Redirect {
    if let Some(order_id) = params.token {
        if let Ok(captured) = capture_paypal_order(&state, &order_id).await {
            if captured.status == "COMPLETED" {
                let code = Uuid::new_v4().to_string().replace('-', "");
                let _ = sqlx::query(r#"INSERT INTO gift_codes (code, value_cents, remaining_cents) VALUES (?, ?, ?)"#)
                    .bind(&code)
                    .bind(0_i64)
                    .bind(0_i64)
                    .execute(&state.pool)
                    .await;
                // if we stored a pending email, send confirmation
                if let Ok(row) = sqlx::query(r#"SELECT email FROM pending_gifts WHERE order_id = ?"#)
                    .bind(&order_id)
                    .fetch_optional(&state.pool)
                    .await
                {
                    if let Some(r) = row { if let Ok(email) = r.try_get::<String, _>("email") { if !email.is_empty() {
                        let _ = send_email(&state, &email, "Your Gift Coupon", &format!("Your gift coupon code: {}", code)).await;
                    }}}
                }
                return Redirect::to(&format!("/thank-you?code={}", code));
            }
        }
    }
    Redirect::to("/thank-you")
}

