use axum::{routing::post, Json, Router, Extension, http::HeaderMap};
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use sqlx::Row;
use jsonwebtoken::{decode, DecodingKey, Validation};

use crate::{state::AppState, payments::{create_paypal_order, find_approval_url}};

#[derive(Deserialize)]
pub struct BuyGiftRequest { pub amount_eur: i64, pub email: Option<String> }

#[derive(Serialize)]
pub struct BuyGiftResponse { pub url: String }

#[derive(Deserialize)]
struct Claims { sub: String, email: String, exp: usize }

pub fn router() -> Router {
    Router::new().route("/api/gift-coupons/buy", post(buy))
}

async fn buy(Extension(state): Extension<Arc<AppState>>, headers: HeaderMap, Json(payload): Json<BuyGiftRequest>) -> Json<BuyGiftResponse> {
    let amount_cents = payload.amount_eur * 100;
    let bonus_cents = (amount_cents as f64 * 0.10).round() as i64;
    let _total_value = amount_cents + bonus_cents;

    if state.paypal_client_id.is_some() && state.paypal_secret.is_some() {
        if let Ok(order) = create_paypal_order(&state, amount_cents, "/api/paypal/gift/return", "/api/paypal/gift/cancel", Some(format!("Gift coupon {} cents (+{} bonus)", amount_cents, bonus_cents))).await {
            // Save pending gift mapping for email delivery after capture
            // Always prefer authenticated user's email from database over provided email
            let user_email = if let Some(auth) = headers.get(axum::http::header::AUTHORIZATION).and_then(|v| v.to_str().ok()) {
                if let Some(token) = auth.strip_prefix("Bearer ") {
                    if let Ok(data) = decode::<Claims>(token, &DecodingKey::from_secret(state.jwt_secret.as_bytes()), &Validation::default()) {
                        // Try to get email from users table using user_id from JWT
                        if let Ok(Some(row)) = sqlx::query(r#"SELECT email FROM users WHERE id = ?"#)
                            .bind(&data.claims.sub)
                            .fetch_optional(&state.pool)
                            .await
                        {
                            if let Ok(email) = row.try_get::<String, _>("email") {
                                email
                            } else {
                                payload.email.as_deref().unwrap_or("").to_string()
                            }
                        } else {
                            payload.email.as_deref().unwrap_or("").to_string()
                        }
                    } else {
                        payload.email.as_deref().unwrap_or("").to_string()
                    }
                } else {
                    payload.email.as_deref().unwrap_or("").to_string()
                }
            } else {
                payload.email.as_deref().unwrap_or("").to_string()
            };

            tracing::info!("Creating pending gift for order {} with email: '{}'", order.id, user_email);

            let _ = sqlx::query(r#"INSERT OR REPLACE INTO pending_gifts (order_id, email, amount_cents) VALUES (?, ?, ?)"#)
                .bind(&order.id)
                .bind(&user_email)
                .bind(amount_cents)
                .execute(&state.pool)
                .await;

            if let Some(approval) = find_approval_url(&order) {
                tracing::info!("PayPal order created successfully: {}", order.id);
                return Json(BuyGiftResponse { url: approval });
            }
        }
    }

    tracing::warn!("Failed to create PayPal order for gift coupon");
    Json(BuyGiftResponse { url: format!("{}/thank-you", state.app_url) })
}


