use axum::{routing::post, Json, Router, Extension};
use serde::Deserialize;
use std::sync::Arc;
use sqlx::Row;
use uuid::Uuid;

use crate::{state::AppState, payments::capture_paypal_order};

#[derive(Deserialize)]
struct PayPalWebhookBody {
    id: String,
    status: String,
    purchase_units: Vec<PayPalPurchaseUnit>,
}

#[derive(Deserialize)]
struct PayPalPurchaseUnit {
    amount: PayPalAmount,
}

#[derive(Deserialize)]
struct PayPalAmount {
    currency_code: String,
    value: String,
}

pub fn router() -> Router {
    Router::new()
        .route("/api/webhooks/paypal", post(paypal_webhook))
        .route("/api/webhooks/stripe", post(|| async { "ok" }))
}

async fn paypal_webhook(
    Extension(state): Extension<Arc<AppState>>,
    Json(payload): Json<PayPalWebhookBody>,
) -> Json<serde_json::Value> {
    tracing::info!("Received PayPal webhook for order: {} with status: {}", payload.id, payload.status);

    // Log purchase details for debugging
    for unit in &payload.purchase_units {
        tracing::info!("Purchase unit amount: {} {}", unit.amount.currency_code, unit.amount.value);
    }

    // Only process completed payments
    if payload.status != "COMPLETED" {
        tracing::info!("Ignoring non-completed payment status: {}", payload.status);
        return Json(serde_json::json!({"status": "ignored", "reason": "non-completed status"}));
    }

    // Check if this order already exists
    if let Ok(Some(_)) = sqlx::query(r#"SELECT id FROM orders WHERE id = ?"#)
        .bind(&payload.id)
        .fetch_optional(&state.pool)
        .await
    {
        tracing::info!("Order {} already processed", payload.id);
        return Json(serde_json::json!({"status": "already_processed"}));
    }

    // Try to capture the order and process it
    match capture_paypal_order(&state, &payload.id).await {
        Ok(captured) => {
            if captured.status == "COMPLETED" {
                // Find the pending order and process it
                if let Ok(Some(row)) = sqlx::query(r#"SELECT email, amount_cents, items_json FROM pending_orders WHERE order_id = ?"#)
                    .bind(&payload.id)
                    .fetch_optional(&state.pool)
                    .await
                {
                    // Process the order (similar to paypal_return logic)
                    // Extract data from the webhook payload and database
                    let email: String = row.try_get("email").unwrap_or_default();
                    let amount_cents: i64 = row.try_get("amount_cents").unwrap_or(0);
                    let items_json: String = row.try_get("items_json").unwrap_or_default();

                    // Parse items for processing
                    let parsed: serde_json::Value = serde_json::from_str(&items_json).unwrap_or(serde_json::json!({}));
                    let items = parsed.get("cart").and_then(|v| v.as_array()).cloned().unwrap_or_default();

                    // Create order record (similar logic as in paypal.rs)
                    let order_db_id = Uuid::new_v4().to_string();
                    let _ = sqlx::query(r#"INSERT INTO orders (id, email, total_cents, items_json) VALUES (?, ?, ?, ?)"#)
                        .bind(&order_db_id)
                        .bind(&email)
                        .bind(amount_cents)
                        .bind(&items_json)
                        .execute(&state.pool)
                        .await;

                    // Insert order items
                    for item in &items {
                        if let (Some(product_id), Some(quantity), Some(unit_amount)) = (
                            item.get("product_id").and_then(|v| v.as_str()),
                            item.get("quantity").and_then(|v| v.as_i64()),
                            item.get("unit_amount").and_then(|v| v.as_i64())
                        ) {
                            let _ = sqlx::query(r#"INSERT INTO order_items (id, order_id, product_id, quantity, unit_amount) VALUES (?, ?, ?, ?, ?)"#)
                                .bind(Uuid::new_v4().to_string())
                                .bind(&order_db_id)
                                .bind(product_id)
                                .bind(quantity)
                                .bind(unit_amount)
                                .execute(&state.pool)
                                .await;
                        }
                    }

                    // Send confirmation email (similar logic as in paypal.rs)
                    if !email.is_empty() {
                        let mut lines = String::new();
                        for item in &items {
                            if let (Some(name), Some(qty), Some(unit)) = (
                                item.get("name").and_then(|v| v.as_str()),
                                item.get("quantity").and_then(|v| v.as_i64()),
                                item.get("unit_amount").and_then(|v| v.as_i64())
                            ) {
                                lines.push_str(&format!("- {} x{} @ €{:.2}\n", name, qty, unit as f64 / 100.0));
                            }
                        }

                        let body = format!(
                            "Thank you for your order!\n\nItems:\n{}\nTotal paid: €{:.2}\n\nOrder ID: {}\n\nYou can view your invoice at: {}/thank-you/{}",
                            lines,
                            amount_cents as f64 / 100.0,
                            order_db_id,
                            state.app_url,
                            order_db_id
                        );

                        // Use the email module to send confirmation
                        if let Err(e) = crate::email::send_email(&state, &email, "Your Order Confirmation", &body).await {
                            tracing::error!("Failed to send webhook order confirmation email to {}: {:?}", email, e);
                        }
                    }

                    // Clean up pending order
                    let _ = sqlx::query(r#"DELETE FROM pending_orders WHERE order_id = ?"#)
                        .bind(&payload.id)
                        .execute(&state.pool)
                        .await;

                    tracing::info!("Successfully processed webhook for order: {}", payload.id);
                    return Json(serde_json::json!({"status": "processed", "order_id": payload.id}));
                }
            }
        }
        Err(e) => {
            tracing::error!("Failed to capture PayPal order {}: {:?}", payload.id, e);
        }
    }

    Json(serde_json::json!({"status": "failed", "order_id": payload.id}))
}

