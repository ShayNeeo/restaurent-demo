use axum::{routing::get, Router, extract::Query, response::Redirect, Extension};
use serde::Deserialize;
use std::sync::Arc;
use uuid::Uuid;
use sqlx::Row;
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

async fn paypal_return(Extension(state): Extension<Arc<AppState>>, Query(params): Query<ReturnParams>) -> Redirect {
    if let Some(order_id) = params.token {
        if let Ok(captured) = capture_paypal_order(&state, &order_id).await {
            if captured.status == "COMPLETED" {
                // finalize any pending order
                if let Ok(row) = sqlx::query(r#"SELECT email, amount_cents, items_json FROM pending_orders WHERE order_id = ?"#)
                    .bind(&order_id)
                    .fetch_optional(&state.pool)
                    .await
                {
                    if let Some(r) = row {
                        let email: String = r.try_get("email").unwrap_or_default();
                        let amount_cents: i64 = r.try_get("amount_cents").unwrap_or(0);
                        let items_json: String = r.try_get("items_json").unwrap_or_default();

                        // parse items
                        let parsed: serde_json::Value = serde_json::from_str(&items_json).unwrap_or(serde_json::json!({}));
                        let coupon_code = parsed.get("coupon_code").and_then(|v| v.as_str()).map(|s| s.to_string());

                        // Create order record
                        let order_db_id = Uuid::new_v4().to_string();
                        let _ = sqlx::query(r#"INSERT INTO orders (id, email, total_cents, coupon_code) VALUES (?, ?, ?, ?)"#)
                            .bind(&order_db_id)
                            .bind(&email)
                            .bind(amount_cents)
                            .bind(coupon_code.as_deref())
                            .execute(&state.pool)
                            .await;

                        // Decrement coupon remaining uses if applied
                        if let Some(code) = coupon_code {
                            let _ = sqlx::query(r#"UPDATE coupons SET remaining_uses = MAX(remaining_uses - 1, 0) WHERE code = ?"#)
                                .bind(&code)
                                .execute(&state.pool)
                                .await;
                        }

                        // Send basic invoice email if configured
                        if !email.is_empty() {
                            let _ = send_email(&state, &email, "Your Order Confirmation", &format!("Thank you for your order! Total: €{:.2}", amount_cents as f64 / 100.0)).await;
                        }

                        // cleanup pending
                        let _ = sqlx::query(r#"DELETE FROM pending_orders WHERE order_id = ?"#)
                            .bind(&order_id)
                            .execute(&state.pool)
                            .await;
                    }
                }
                return Redirect::to("/thank-you");
            }
        }
    }
    Redirect::to("/thank-you")
}

async fn paypal_gift_return(Extension(state): Extension<Arc<AppState>>, Query(params): Query<ReturnParams>) -> Redirect {
    if let Some(order_id) = params.token {
        if let Ok(captured) = capture_paypal_order(&state, &order_id).await {
            if captured.status == "COMPLETED" {
                // determine purchased amount and grant +10% bonus
                let mut base_amount: i64 = 0;
                if let Ok(row) = sqlx::query(r#"SELECT email, amount_cents FROM pending_gifts WHERE order_id = ?"#)
                    .bind(&order_id)
                    .fetch_optional(&state.pool)
                    .await {
                    if let Some(r) = row { base_amount = r.try_get::<i64, _>("amount_cents").unwrap_or(0); }
                }
                let bonus = ((base_amount as f64) * 0.10).round() as i64;
                let total_value = base_amount + bonus;
                let code = Uuid::new_v4().to_string().replace('-', "");
                let _ = sqlx::query(r#"INSERT INTO gift_codes (code, value_cents, remaining_cents) VALUES (?, ?, ?)"#)
                    .bind(&code)
                    .bind(total_value)
                    .bind(total_value)
                    .execute(&state.pool)
                    .await;
                // if we stored a pending email, send confirmation
                if let Ok(row) = sqlx::query(r#"SELECT email FROM pending_gifts WHERE order_id = ?"#)
                    .bind(&order_id)
                    .fetch_optional(&state.pool)
                    .await
                {
                    if let Some(r) = row { if let Ok(email) = r.try_get::<String, _>("email") { if !email.is_empty() {
                        let _ = send_email(&state, &email, "Your Gift Coupon", &format!("Your gift coupon code: {} (value €{:.2})", code, total_value as f64 / 100.0)).await;
                    }}}
                }
                // cleanup pending
                let _ = sqlx::query(r#"DELETE FROM pending_gifts WHERE order_id = ?"#)
                    .bind(&order_id)
                    .execute(&state.pool)
                    .await;
                return Redirect::to(&format!("/thank-you?code={}", code));
            }
        }
    }
    Redirect::to("/thank-you")
}

