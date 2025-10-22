use axum::{routing::post, Json, Router, Extension};
use serde::{Deserialize, Serialize};
use std::sync::Arc;

use crate::{state::AppState, payments::{create_paypal_order, find_approval_url}};

#[derive(Deserialize)]
pub struct CartItem { pub product_id: String, pub name: String, pub unit_amount: i64, pub quantity: i64, pub currency: String }

#[derive(Deserialize)]
pub struct CheckoutRequest { pub cart: Vec<CartItem>, pub coupon: Option<String>, pub email: Option<String> }

#[derive(Serialize)]
pub struct CheckoutResponse { pub url: String }

pub fn router() -> Router {
    Router::new().route("/api/checkout", post(start))
}

async fn start(Extension(state): Extension<Arc<AppState>>, Json(payload): Json<CheckoutRequest>) -> Json<CheckoutResponse> {
    // compute subtotal
    let subtotal_cents: i64 = payload.cart.iter().map(|i| i.unit_amount * i.quantity).sum();

    // compute discount from coupon (if provided and valid)
    let mut discount_cents: i64 = 0;
    let mut applied_coupon: Option<String> = None;
    if let Some(code) = payload.coupon.as_ref().map(|s| s.trim().to_uppercase()).filter(|s| !s.is_empty()) {
        if let Ok(Some(row)) = sqlx::query(r#"SELECT percent_off, amount_off, remaining_uses FROM coupons WHERE code = ?"#)
            .bind(&code)
            .fetch_optional(&state.pool)
            .await
        {
            let remaining: i64 = row.try_get::<i64, _>("remaining_uses").unwrap_or(0);
            if remaining > 0 {
                if let Ok(amount) = row.try_get::<i64, _>("amount_off") { discount_cents = amount; }
                if discount_cents == 0 {
                    if let Ok(percent) = row.try_get::<i64, _>("percent_off") {
                        if percent > 0 { discount_cents = ((percent as f64 / 100.0) * subtotal_cents as f64).round() as i64; }
                    }
                }
                applied_coupon = Some(code);
            }
        }
    }

    let total_cents = std::cmp::max(0, subtotal_cents - discount_cents);

    // Prefer PayPal if configured
    if state.paypal_client_id.is_some() && state.paypal_secret.is_some() {
        if let Ok(order) = create_paypal_order(&state, total_cents, "/api/paypal/return", "/api/paypal/cancel", Some("Cart checkout".into())).await {
            // Store pending order mapping for finalization on return
            let _ = sqlx::query(r#"INSERT OR REPLACE INTO pending_orders (order_id, email, amount_cents, items_json) VALUES (?, ?, ?, ?)"#)
                .bind(&order.id)
                .bind(payload.email.as_deref().unwrap_or(""))
                .bind(total_cents)
                .bind(serde_json::json!({
                    "cart": payload.cart,
                    "coupon_code": applied_coupon,
                    "discount_cents": discount_cents
                }).to_string())
                .execute(&state.pool)
                .await;

            if let Some(approval) = find_approval_url(&order) { return Json(CheckoutResponse { url: approval }); }
        }
    }
    // Stripe stub remains for later enablement
    if state.stripe_secret.is_some() { /* keep as stub */ }
    // Fallback
    Json(CheckoutResponse { url: format!("{}/thank-you", state.app_url) })
}


