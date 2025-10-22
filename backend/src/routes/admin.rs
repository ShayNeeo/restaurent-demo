use axum::{routing::{get, post, delete}, extract::{Query, Path}, Json, Router, http::HeaderMap, Extension};
use serde::Serialize;
use serde::Deserialize;
use jsonwebtoken::{DecodingKey, Validation, decode};
use std::sync::Arc;
use sqlx::{Row, Column};

use crate::state::AppState;

#[derive(Deserialize)]
struct Claims { sub: String, email: String, exp: usize }

fn require_admin(headers: &HeaderMap, state: &AppState) -> bool {
    let auth = headers.get(axum::http::header::AUTHORIZATION).and_then(|v| v.to_str().ok());
    let expected = state.admin_email.as_deref();
    if let (Some(bearer), Some(admin_email)) = (auth, expected) {
        if let Some(token) = bearer.strip_prefix("Bearer ") {
            if let Ok(data) = decode::<Claims>(token, &DecodingKey::from_secret(state.jwt_secret.as_bytes()), &Validation::default()) {
                return data.claims.email.eq_ignore_ascii_case(admin_email);
            }
        }
    }
    false
}

#[derive(Serialize)]
struct Tables { tables: Vec<String> }

#[derive(Deserialize)]
struct QueryParams { table: String, limit: Option<i64> }

pub fn router() -> Router {
    Router::new()
        .route("/api/admin/tables", get(list_tables))
        .route("/api/admin/query", get(query_table))
        .route("/api/admin/coupons", post(add_coupon))
        .route("/api/admin/coupons/:code", delete(delete_coupon))
}

async fn list_tables(Extension(state): Extension<Arc<AppState>>, headers: HeaderMap) -> Result<Json<Tables>, axum::http::StatusCode> {
    if !require_admin(&headers, &state) { return Err(axum::http::StatusCode::UNAUTHORIZED); }
    let rows = sqlx::query_scalar::<_, String>(
        r#"SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name"#
    )
    .fetch_all(&state.pool)
    .await
    .unwrap_or_default();
    Ok(Json(Tables { tables: rows }))
}

async fn query_table(Extension(state): Extension<Arc<AppState>>, headers: HeaderMap, Query(params): Query<QueryParams>) -> Result<Json<serde_json::Value>, axum::http::StatusCode> {
    if !require_admin(&headers, &state) { return Err(axum::http::StatusCode::UNAUTHORIZED); }
    let limit = params.limit.unwrap_or(50).max(1).min(500);
    let sql = format!("SELECT * FROM {} LIMIT {}", params.table.replace('"', ""), limit);
    let rows = sqlx::query(&sql).fetch_all(&state.pool).await.map_err(|_| axum::http::StatusCode::BAD_REQUEST)?;
    let mut out = Vec::new();
    for row in rows {
        let mut obj = serde_json::Map::new();
        for (idx, col) in row.columns().iter().enumerate() {
            let name = Column::name(col).to_string();
            let val: Result<String, _> = row.try_get(idx);
            obj.insert(name, serde_json::Value::String(val.unwrap_or_default()));
        }
        out.push(serde_json::Value::Object(obj));
    }
    Ok(Json(serde_json::Value::Array(out)))
}

#[derive(Deserialize)]
struct AddCouponPayload { code: String, percent_off: Option<i64>, amount_off: Option<i64>, remaining_uses: i64 }

async fn add_coupon(Extension(state): Extension<Arc<AppState>>, headers: HeaderMap, Json(payload): Json<AddCouponPayload>) -> Result<Json<serde_json::Value>, axum::http::StatusCode> {
    if !require_admin(&headers, &state) { return Err(axum::http::StatusCode::UNAUTHORIZED); }
    let _ = sqlx::query(r#"INSERT OR REPLACE INTO coupons (code, percent_off, amount_off, remaining_uses) VALUES (?, ?, ?, ?)"#)
        .bind(payload.code.trim().to_uppercase())
        .bind(payload.percent_off)
        .bind(payload.amount_off)
        .bind(payload.remaining_uses.max(0))
        .execute(&state.pool)
        .await
        .map_err(|_| axum::http::StatusCode::BAD_REQUEST)?;
    Ok(Json(serde_json::json!({"ok": true})))
}

async fn delete_coupon(Extension(state): Extension<Arc<AppState>>, headers: HeaderMap, Path(code): Path<String>) -> Result<Json<serde_json::Value>, axum::http::StatusCode> {
    if !require_admin(&headers, &state) { return Err(axum::http::StatusCode::UNAUTHORIZED); }
    let _ = sqlx::query(r#"DELETE FROM coupons WHERE code = ?"#)
        .bind(code.trim().to_uppercase())
        .execute(&state.pool)
        .await
        .map_err(|_| axum::http::StatusCode::BAD_REQUEST)?;
    Ok(Json(serde_json::json!({"ok": true})))
}


