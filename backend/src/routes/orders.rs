use axum::{routing::get, Json, Router, Extension, extract::Path};
use serde::Serialize;
use std::sync::Arc;
use sqlx::Row;

use crate::state::AppState;

#[derive(Serialize)]
pub struct OrderItem {
    pub product_id: String,
    pub quantity: i64,
    pub unit_amount: i64,
    pub name: String,
}

#[derive(Serialize)]
pub struct OrderDetails {
    pub id: String,
    pub email: String,
    pub total_cents: i64,
    pub coupon_code: Option<String>,
    pub discount_cents: i64,
    pub items: Vec<OrderItem>,
    pub created_at: String,
}

pub fn router() -> Router {
    Router::new().route("/api/orders/:id", get(get_order))
}

async fn get_order(Extension(state): Extension<Arc<AppState>>, Path(id): Path<String>) -> Result<Json<OrderDetails>, axum::http::StatusCode> {
    tracing::info!("Fetching order: {}", id);
    
    // Fetch order with proper joins to get product names
    let order_row = sqlx::query(r#"
        SELECT o.id, o.email, o.total_cents, o.coupon_code, o.created_at, o.items_json
        FROM orders o
        WHERE o.id = ?
    "#)
        .bind(&id)
        .fetch_optional(&state.pool)
        .await
        .map_err(|e| {
            tracing::error!("Database error fetching order {}: {:?}", id, e);
            axum::http::StatusCode::INTERNAL_SERVER_ERROR
        })?
        .ok_or_else(|| {
            tracing::warn!("Order not found: {}", id);
            axum::http::StatusCode::NOT_FOUND
        })?;

    let email: String = order_row.try_get("email").unwrap_or_default();
    let total_cents: i64 = order_row.try_get("total_cents").unwrap_or(0);
    let coupon_code: Option<String> = order_row.try_get("coupon_code").ok();
    let created_at: String = order_row.try_get("created_at").unwrap_or_default();
    let items_json: String = order_row.try_get("items_json").unwrap_or_default();
    
    tracing::debug!("Order found - email: {}, total: {}, coupon: {:?}, items_json: {}", 
        email, total_cents, coupon_code, items_json);
    
    // Extract discount_cents from items_json
    let mut discount_cents: i64 = 0;
    if !items_json.is_empty() {
        if let Ok(parsed) = serde_json::from_str::<serde_json::Value>(&items_json) {
            if let Some(disc) = parsed.get("discount_cents").and_then(|v| v.as_i64()) {
                discount_cents = disc;
                tracing::debug!("Extracted discount from items_json: {}", discount_cents);
            }
        } else {
            tracing::warn!("Failed to parse items_json for order {}", id);
        }
    }

    // Fetch order items with proper product name joins
    let item_rows = sqlx::query(r#"
        SELECT oi.product_id, oi.quantity, oi.unit_amount, p.name
        FROM order_items oi
        LEFT JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = ?
    "#)
        .bind(&id)
        .fetch_all(&state.pool)
        .await
        .unwrap_or_default();

    tracing::debug!("Found {} items for order {}", item_rows.len(), id);

    let items: Vec<OrderItem> = item_rows.into_iter().map(|r| {
        let product_id: String = r.try_get("product_id").unwrap_or_default();
        let quantity: i64 = r.try_get("quantity").unwrap_or(1);
        let unit_amount: i64 = r.try_get("unit_amount").unwrap_or(0);
        let name: String = r.try_get("name").unwrap_or_else(|_| "Product Item".to_string());

        OrderItem {
            product_id,
            quantity,
            unit_amount,
            name,
        }
    }).collect();

    Ok(Json(OrderDetails {
        id,
        email,
        total_cents,
        coupon_code,
        discount_cents,
        items,
        created_at,
    }))
}


