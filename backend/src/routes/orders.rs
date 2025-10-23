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
    pub items: Vec<OrderItem>,
    pub created_at: String,
}

pub fn router() -> Router {
    Router::new().route("/api/orders/:id", get(get_order))
}

async fn get_order(Extension(state): Extension<Arc<AppState>>, Path(id): Path<String>) -> Result<Json<OrderDetails>, axum::http::StatusCode> {
    // Fetch order
    let order_row = sqlx::query(r#"SELECT id, email, total_cents, coupon_code, created_at, items_json FROM orders WHERE id = ?"#)
        .bind(&id)
        .fetch_optional(&state.pool)
        .await
        .map_err(|_| axum::http::StatusCode::INTERNAL_SERVER_ERROR)?
        .ok_or(axum::http::StatusCode::NOT_FOUND)?;

    let email: String = order_row.try_get("email").unwrap_or_default();
    let total_cents: i64 = order_row.try_get("total_cents").unwrap_or(0);
    let coupon_code: Option<String> = order_row.try_get("coupon_code").ok();
    let created_at: String = order_row.try_get("created_at").unwrap_or_default();
    let items_json: Option<String> = order_row.try_get("items_json").ok();

    // Fetch order items
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

    // Create a helper function to find product name from JSON data
    let find_name_in_json = |product_id: &String, json_data: &str| -> Option<String> {
        if let Ok(parsed) = serde_json::from_str::<serde_json::Value>(json_data) {
            if let Some(cart) = parsed.get("cart") {
                if let Some(cart_array) = cart.as_array() {
                    for item in cart_array {
                        if let Some(pid) = item.get("product_id") {
                            if let Some(pid_str) = pid.as_str() {
                                if pid_str == product_id {
                                    if let Some(name) = item.get("name") {
                                        if let Some(name_str) = name.as_str() {
                                            return Some(name_str.to_string());
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        None
    };

    let items: Vec<OrderItem> = item_rows.into_iter().map(|r| {
        let product_id: String = r.try_get("product_id").unwrap_or_default();
        let quantity: i64 = r.try_get("quantity").unwrap_or(1);
        let unit_amount: i64 = r.try_get("unit_amount").unwrap_or(0);
        let name_from_db: Result<String, _> = r.try_get("name");

        // If we have a name from the products table, use it
        // Otherwise, try to get it from the stored JSON data
        let name = if name_from_db.is_ok() {
            name_from_db.unwrap()
        } else if let Some(ref json_data) = items_json {
            find_name_in_json(&product_id, json_data).unwrap_or_else(|| "Product Item".to_string())
        } else {
            "Product Item".to_string()
        };

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
        items,
        created_at,
    }))
}


