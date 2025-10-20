use axum::{routing::get, Json, Router, extract::State};
use serde::Serialize;
use std::sync::Arc;
use sqlx::Row;

use crate::state::AppState;

#[derive(Serialize)]
pub struct Product { pub id: String, pub name: String, pub unit_amount: i64, pub currency: String }

#[derive(Serialize)]
pub struct ProductsResponse { pub products: Vec<Product> }

pub fn router() -> Router<Arc<AppState>> {
    Router::new().route("/api/products", get(list))
}

async fn list(State(state): State<Arc<AppState>>) -> Json<ProductsResponse> {
    let rows = sqlx::query(r#"SELECT id, name, unit_amount, currency FROM products LIMIT 20"#)
        .fetch_all(&state.pool)
        .await
        .unwrap_or_default();

    let products = rows
        .into_iter()
        .map(|r| Product {
            id: r.get::<String, _>("id"),
            name: r.get::<String, _>("name"),
            unit_amount: r.get::<i64, _>("unit_amount"),
            currency: r.get::<String, _>("currency"),
        })
        .collect();

    Json(ProductsResponse { products })
}


