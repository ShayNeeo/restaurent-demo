use axum::{routing::get, Json, Router, Extension};
use serde::Serialize;
use std::sync::Arc;
use sqlx::Row;

use crate::state::AppState;

#[derive(Serialize)]
pub struct Product { 
    pub id: String, 
    pub name: String, 
    pub unit_amount: i64, 
    pub currency: String,
    pub image_url: Option<String>,
    pub description: Option<String>,
    pub category: Option<String>,
    pub allergens: Option<String>,
    pub additives: Option<String>,
    pub spice_level: Option<String>,
    pub serving_size: Option<String>,
    pub dietary_tags: Option<String>,
    pub ingredients: Option<String>
}

#[derive(Serialize)]
pub struct ProductsResponse { pub products: Vec<Product> }

pub fn router() -> Router {
    Router::new().route("/api/products", get(list))
}

async fn list(Extension(state): Extension<Arc<AppState>>) -> Json<ProductsResponse> {
    let rows = sqlx::query(r#"SELECT id, name, unit_amount, currency, image_url, description, category, allergens, additives, spice_level, serving_size, dietary_tags, ingredients FROM products ORDER BY category, name COLLATE NOCASE ASC LIMIT 200"#)
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
            image_url: r.try_get::<String, _>("image_url").ok(),
            description: r.try_get::<String, _>("description").ok(),
            category: r.try_get::<String, _>("category").ok(),
            allergens: r.try_get::<String, _>("allergens").ok(),
            additives: r.try_get::<String, _>("additives").ok(),
            spice_level: r.try_get::<String, _>("spice_level").ok(),
            serving_size: r.try_get::<String, _>("serving_size").ok(),
            dietary_tags: r.try_get::<String, _>("dietary_tags").ok(),
            ingredients: r.try_get::<String, _>("ingredients").ok(),
        })
        .collect();

    Json(ProductsResponse { products })
}


