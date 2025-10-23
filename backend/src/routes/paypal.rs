use axum::{routing::get, Router, extract::Query, response::Redirect, Extension};
use serde::Deserialize;
use std::sync::Arc;
use uuid::Uuid;
use sqlx::Row;
use crate::{state::AppState, payments::capture_paypal_order};
use crate::email::send_email;
use axum::http::header::HeaderMap;

#[derive(Deserialize)]
struct ReturnParams { token: Option<String> }

#[derive(Deserialize)]
#[allow(dead_code)]
struct Claims { sub: String, email: String, exp: usize }
// cleaned duplicate imports

pub fn router() -> Router {
    // In production, capture PayPal order IDs on return and finalize order/gift coupon.
    Router::new()
        .route("/api/paypal/return", get(paypal_return))
        .route("/api/paypal/cancel", get(|| async { "CANCEL" }))
        .route("/api/paypal/gift/return", get(paypal_gift_return))
        .route("/api/paypal/gift/cancel", get(|| async { "CANCEL" }))
}

async fn paypal_return(Extension(state): Extension<Arc<AppState>>, _headers: HeaderMap, Query(params): Query<ReturnParams>) -> Redirect {
    if let Some(order_id) = params.token {
        tracing::info!("PayPal return callback received for order_id: {}", order_id);
        
        match capture_paypal_order(&state, &order_id).await {
            Ok(captured) => {
                tracing::info!("PayPal order captured. Status: {}", captured.status);
                
                if captured.status == "COMPLETED" {
                    tracing::info!("PayPal order {} is COMPLETED, proceeding to finalize...", order_id);
                    
                    // finalize any pending order
                    match sqlx::query(r#"SELECT user_id, email, amount_cents, items_json FROM pending_orders WHERE order_id = ?"#)
                        .bind(&order_id)
                        .fetch_optional(&state.pool)
                        .await
                    {
                        Ok(row) => {
                            if let Some(r) = row {
                                tracing::info!("Found pending order for {}, finalizing...", order_id);
                                
                                let user_id: Option<String> = r.try_get("user_id").ok();
                                let email: String = r.try_get("email").unwrap_or_default();
                                let amount_cents: i64 = r.try_get("amount_cents").unwrap_or(0);
                                let items_json: String = r.try_get("items_json").unwrap_or_default();

                                tracing::info!("Order details - Email: {}, Amount: {}¢, Items: {}", email, amount_cents, items_json);

                                // parse items
                                let parsed: serde_json::Value = serde_json::from_str(&items_json).unwrap_or(serde_json::json!({}));
                                let coupon_code = parsed.get("coupon_code").and_then(|v| v.as_str()).map(|s| s.to_string());
                                let items = parsed.get("cart").and_then(|v| v.as_array()).cloned().unwrap_or_default();

                                // Create order record
                                let order_db_id = Uuid::new_v4().to_string();
                                tracing::info!("Creating order record: {}", order_db_id);
                                
                                let _ = sqlx::query(r#"INSERT INTO orders (id, user_id, email, total_cents, coupon_code, items_json) VALUES (?, ?, ?, ?, ?, ?)"#)
                                    .bind(&order_db_id)
                                    .bind(user_id.as_deref())
                                    .bind(&email)
                                    .bind(amount_cents)
                                    .bind(coupon_code.as_deref())
                                    .bind(&items_json)
                                    .execute(&state.pool)
                                    .await;

                                // Insert order items
                                for it in &items {
                                    let pid = it.get("product_id").and_then(|v| v.as_str()).unwrap_or("");
                                    let qty = it.get("quantity").and_then(|v| v.as_i64()).unwrap_or(1);
                                    let unit = it.get("unit_amount").and_then(|v| v.as_i64()).unwrap_or(0);
                                    let _ = sqlx::query(r#"INSERT INTO order_items (id, order_id, product_id, quantity, unit_amount) VALUES (?, ?, ?, ?, ?)"#)
                                        .bind(Uuid::new_v4().to_string())
                                        .bind(&order_db_id)
                                        .bind(pid)
                                        .bind(qty)
                                        .bind(unit)
                                        .execute(&state.pool)
                                        .await;
                                }

                                // Decrement coupon remaining uses or gift balance
                                if let Some(code) = coupon_code.clone() {
                                    // Try as regular coupon
                                    let _ = sqlx::query(r#"UPDATE coupons SET remaining_uses = MAX(remaining_uses - 1, 0) WHERE code = ?"#)
                                        .bind(&code)
                                        .execute(&state.pool)
                                        .await;
                                }
                                // If it's a gift code: decrement remaining_cents by applied discount (if present)
                                if let Some(code) = coupon_code {
                                    if let Some(disc) = parsed.get("discount_cents").and_then(|v| v.as_i64()) {
                                        let _ = sqlx::query(r#"UPDATE gift_codes SET remaining_cents = MAX(remaining_cents - ?, 0) WHERE code = ?"#)
                                            .bind(disc)
                                            .bind(&code)
                                            .execute(&state.pool)
                                            .await;
                                        // Optional: delete if zero
                                        let _ = sqlx::query(r#"DELETE FROM gift_codes WHERE code = ? AND remaining_cents <= 0"#)
                                            .bind(&code)
                                            .execute(&state.pool)
                                            .await;
                                    }
                                }

                                // Send basic invoice email if configured
                                if !email.is_empty() {
                                    // build itemized lines using the parsed items
                                    let mut lines = String::new();
                                    for it in &items {
                                        let name = it.get("name").and_then(|v| v.as_str()).unwrap_or("Product");
                                        let qty = it.get("quantity").and_then(|v| v.as_i64()).unwrap_or(1);
                                        let unit = it.get("unit_amount").and_then(|v| v.as_i64()).unwrap_or(0);
                                        lines.push_str(&format!("- {} x{} @ €{:.2}\n", name, qty, unit as f64 / 100.0));
                                    }
                                    let body = format!(
                                        "Thank you for your order!\n\nItems:\n{}\nTotal paid: €{:.2}\n\nOrder ID: {}\n\nYou can view your invoice at: {}/thank-you/{}",
                                        lines,
                                        amount_cents as f64 / 100.0,
                                        order_db_id,
                                        state.app_url,
                                        order_db_id
                                    );
                                    
                                    // Send email with better error reporting
                                    match send_email(&state, &email, "Your Order Confirmation", &body).await {
                                        Ok(_) => {
                                            tracing::info!("Order confirmation email sent successfully to {}", email);
                                        }
                                        Err(e) => {
                                            tracing::error!("Failed to send order confirmation email to {}: {:?}", email, e);
                                        }
                                    }
                                }

                                // cleanup pending
                                let delete_result = sqlx::query(r#"DELETE FROM pending_orders WHERE order_id = ?"#)
                                    .bind(&order_id)
                                    .execute(&state.pool)
                                    .await;
                                
                                match delete_result {
                                    Ok(_) => {
                                        tracing::info!("Successfully deleted pending_order {} and created final order {}", order_id, order_db_id);
                                    }
                                    Err(e) => {
                                        tracing::error!("Failed to delete pending_order {}: {:?}", order_id, e);
                                    }
                                }

                                return Redirect::to(&format!("/thank-you/{}", order_db_id));
                            } else {
                                tracing::warn!("PayPal order {} completed but no pending_orders entry found in database", order_id);
                            }
                        }
                        Err(e) => {
                            tracing::error!("Failed to query pending_orders for {}: {:?}", order_id, e);
                        }
                    }
                } else {
                    tracing::warn!("PayPal order {} has status '{}', not COMPLETED", order_id, captured.status);
                }
            }
            Err(e) => {
                tracing::error!("Failed to capture PayPal order {}: {:?}", order_id, e);
            }
        }
    } else {
        tracing::warn!("PayPal return called without order_id token parameter");
    }
    
    tracing::info!("PayPal return: redirecting to generic /thank-you (order was not finalized)");
    Redirect::to("/thank-you")
}

async fn paypal_gift_return(Extension(state): Extension<Arc<AppState>>, Query(params): Query<ReturnParams>) -> Redirect {
    if let Some(order_id) = params.token {
        tracing::info!("PayPal gift return callback received for order_id: {}", order_id);
        
        if let Ok(captured) = capture_paypal_order(&state, &order_id).await {
            if captured.status == "COMPLETED" {
                tracing::info!("PayPal gift order {} captured with status COMPLETED", order_id);
                
                // determine purchased amount and grant +10% bonus
                let mut base_amount: i64 = 0;
                let mut email: String = String::new();
                if let Ok(row) = sqlx::query(r#"SELECT email, amount_cents FROM pending_gifts WHERE order_id = ?"#)
                    .bind(&order_id)
                    .fetch_optional(&state.pool)
                    .await {
                    if let Some(r) = row {
                        base_amount = r.try_get::<i64, _>("amount_cents").unwrap_or(0);
                        email = r.try_get::<String, _>("email").unwrap_or_default();
                    }
                }
                
                let bonus = ((base_amount as f64) * 0.10).round() as i64;
                let total_value = base_amount + bonus;
                let code = Uuid::new_v4().to_string().replace('-', "");
                
                tracing::info!("Creating gift code: {}, value: {}¢ (base: {}¢ + bonus: {}¢)", code, total_value, base_amount, bonus);
                
                let _ = sqlx::query(r#"INSERT INTO gift_codes (code, value_cents, remaining_cents, purchaser_email) VALUES (?, ?, ?, ?)"#)
                    .bind(&code)
                    .bind(total_value)
                    .bind(total_value)
                    .bind(&email)
                    .execute(&state.pool)
                    .await;
                
                // Create an order record for this gift purchase
                let order_db_id = Uuid::new_v4().to_string();
                let gift_json = serde_json::json!({
                    "type": "gift_coupon",
                    "code": code,
                    "base_amount_cents": base_amount,
                    "bonus_cents": bonus,
                    "total_value_cents": total_value
                }).to_string();
                
                tracing::info!("Creating order record for gift purchase: {}", order_db_id);
                
                let _ = sqlx::query(r#"INSERT INTO orders (id, email, total_cents, currency, items_json) VALUES (?, ?, ?, 'EUR', ?)"#)
                    .bind(&order_db_id)
                    .bind(&email)
                    .bind(total_value)
                    .bind(&gift_json)
                    .execute(&state.pool)
                    .await;
                
                // if we stored a pending email, send confirmation
                if let Ok(row) = sqlx::query(r#"SELECT email FROM pending_gifts WHERE order_id = ?"#)
                    .bind(&order_id)
                    .fetch_optional(&state.pool)
                    .await
                {
                    if let Some(r) = row {
                        if let Ok(email) = r.try_get::<String, _>("email") {
                            if !email.is_empty() {
                                let body = format!(
                                    "Thank you for your gift coupon purchase!\n\nYour gift coupon code: {}\nValue: €{:.2}\n\nYou can use this code at checkout to get €{:.2} off your order.\n\nView your purchase: {}/thank-you/{}",
                                    code,
                                    total_value as f64 / 100.0,
                                    total_value as f64 / 100.0,
                                    state.app_url,
                                    order_db_id
                                );

                                match send_email(&state, &email, "Your Gift Coupon", &body).await {
                                    Ok(_) => {
                                        tracing::info!("Gift coupon email sent successfully to {}", email);
                                    }
                                    Err(e) => {
                                        tracing::error!("Failed to send gift coupon email to {}: {:?}", email, e);
                                    }
                                }
                            }
                        }
                    }
                }

                // cleanup pending gift
                let _ = sqlx::query(r#"DELETE FROM pending_gifts WHERE order_id = ?"#)
                    .bind(&order_id)
                    .execute(&state.pool)
                    .await;

                tracing::info!("Gift coupon order finalized. Redirecting to /thank-you/{}", order_db_id);
                return Redirect::to(&format!("/thank-you/{}", order_db_id));
            } else {
                tracing::warn!("PayPal gift order {} has status '{}', not COMPLETED", order_id, captured.status);
            }
        } else {
            tracing::error!("Failed to capture PayPal gift order {}", order_id);
        }
    } else {
        tracing::warn!("PayPal gift return called without order_id token parameter");
    }
    
    tracing::info!("PayPal gift return: redirecting to generic /thank-you (order was not finalized)");
    Redirect::to("/thank-you")
}


