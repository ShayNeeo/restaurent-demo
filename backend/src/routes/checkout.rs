use axum::{routing::post, Json, Router, Extension, http::HeaderMap};
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use sqlx::Row;
use jsonwebtoken::{DecodingKey, Validation, decode};

use crate::{state::AppState, payments::{create_paypal_order, find_approval_url}};

#[derive(Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CartItem { pub product_id: String, pub name: String, pub unit_amount: i64, pub quantity: i64, pub currency: String }

#[derive(Deserialize)]
pub struct CheckoutRequest { pub cart: Vec<CartItem>, pub coupon: Option<String>, pub email: Option<String> }

#[derive(Serialize)]
pub struct CheckoutResponse { pub url: String }

pub fn router() -> Router {
    Router::new().route("/api/checkout", post(start))
}

#[derive(Deserialize)]
#[allow(dead_code)]
struct Claims { sub: String, email: String, exp: usize }

async fn start(Extension(state): Extension<Arc<AppState>>, headers: HeaderMap, Json(payload): Json<CheckoutRequest>) -> Json<CheckoutResponse> {
    // compute subtotal
    let subtotal_cents: i64 = payload.cart.iter().map(|i| i.unit_amount * i.quantity).sum();

    // compute discount from coupon (if provided and valid)
    let mut discount_cents: i64 = 0;
    let mut applied_coupon: Option<String> = None;
    if let Some(raw_code) = payload.coupon.as_ref().map(|s| s.trim()).filter(|s| !s.is_empty()) {
        let code_upper = raw_code.to_uppercase();
        
        // First check for gift code (case-insensitive, stored as lowercase UUID)
        if let Ok(Some(g)) = sqlx::query(r#"SELECT remaining_cents FROM gift_codes WHERE code = ? COLLATE NOCASE"#)
            .bind(&raw_code)
            .fetch_optional(&state.pool)
            .await
        {
            let remaining: i64 = g.get::<i64, _>("remaining_cents");
            if remaining > 0 {
                discount_cents = remaining.min(subtotal_cents);
                applied_coupon = Some(raw_code.to_string());
            }
        } else if let Ok(Some(row)) = sqlx::query(r#"SELECT percent_off, amount_off, remaining_uses FROM coupons WHERE code = ?"#)
            .bind(&code_upper)
            .fetch_optional(&state.pool)
            .await
        {
            let remaining: i64 = row.get::<i64, _>("remaining_uses");
            if remaining > 0 {
                let amount_off: Option<i64> = row.try_get("amount_off").ok();
                let percent_off: Option<i64> = row.try_get("percent_off").ok();
                
                // Only apply discount if at least one valid discount type exists
                let has_valid_discount = 
                    (amount_off.is_some() && amount_off.unwrap_or(0) > 0) ||
                    (percent_off.is_some() && percent_off.unwrap_or(0) > 0);
                
                if has_valid_discount {
                // Apply fixed amount discount if available
                if let Some(amount) = amount_off {
                        if amount > 0 {
                    discount_cents = amount;
                        }
                }
                
                // Apply percentage discount if available (and no fixed amount was applied)
                if discount_cents == 0 {
                    if let Some(percent) = percent_off {
                        if percent > 0 {
                            discount_cents = ((percent as f64 / 100.0) * subtotal_cents as f64).round() as i64;
                        }
                    }
                }
                
                applied_coupon = Some(code_upper);
                }
            }
        }
    }

    let total_cents = std::cmp::max(0, subtotal_cents - discount_cents);

    // extract user_id and email from JWT if provided
    let mut user_id: Option<String> = None;
    let mut user_email: Option<String> = None;
    if let Some(auth) = headers.get(axum::http::header::AUTHORIZATION).and_then(|v| v.to_str().ok()) {
        if let Some(token) = auth.strip_prefix("Bearer ") {
            if let Ok(data) = decode::<Claims>(token, &DecodingKey::from_secret(state.jwt_secret.as_bytes()), &Validation::default()) {
                user_id = Some(data.claims.sub);
                user_email = Some(data.claims.email);
            }
        }
    }

    // Prefer PayPal if configured
    if state.paypal_client_id.is_some() && state.paypal_secret.is_some() {
        if let Ok(order) = create_paypal_order(&state, total_cents, "/api/paypal/return", "/api/paypal/cancel", Some("Cart checkout".into())).await {
            // Always prefer the authenticated user's email from JWT over any provided email
            let final_email = user_email.unwrap_or_else(|| payload.email.as_deref().unwrap_or("").to_string());

            let _ = sqlx::query(r#"INSERT OR REPLACE INTO pending_orders (order_id, user_id, email, amount_cents, items_json) VALUES (?, ?, ?, ?, ?)"#)
                .bind(&order.id)
                .bind(user_id.as_deref())
                .bind(&final_email)
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
    // Stripe integration removed as it's not implemented
    // Fallback
    Json(CheckoutResponse { url: format!("{}/thank-you", state.app_url) })
}


