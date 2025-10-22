use axum::{routing::{get, post, delete, patch}, extract::{Query, Path}, Json, Router, http::HeaderMap, Extension};
use serde::Serialize;
use serde::Deserialize;
use jsonwebtoken::{DecodingKey, Validation, decode};
use std::sync::Arc;
use sqlx::{Row, Column};

use crate::state::AppState;

#[derive(Deserialize)]
#[allow(dead_code)]
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
        .route("/api/admin/columns", get(columns_for_table))
        .route("/api/admin/insert", post(generic_insert))
        .route("/api/admin/delete", post(generic_delete))
        .route("/api/admin/users/:email", patch(update_user_role))
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

#[derive(Deserialize)]
struct ColumnsQuery { table: String }

#[derive(Serialize)]
struct ColumnInfo { name: String, r#type: String, notnull: bool, pk: bool, dflt_value: Option<String> }

fn sanitize_table(input: &str) -> String {
    input.chars().filter(|c| c.is_ascii_alphanumeric() || *c == '_').collect()
}

async fn columns_for_table(Extension(state): Extension<Arc<AppState>>, headers: HeaderMap, Query(q): Query<ColumnsQuery>) -> Result<Json<Vec<ColumnInfo>>, axum::http::StatusCode> {
    if !require_admin(&headers, &state) { return Err(axum::http::StatusCode::UNAUTHORIZED); }
    let t = sanitize_table(&q.table);
    let sql = format!("PRAGMA table_info({})", t);
    let rows = sqlx::query(&sql).fetch_all(&state.pool).await.map_err(|_| axum::http::StatusCode::BAD_REQUEST)?;
    let mut cols = Vec::new();
    for r in rows {
        let name: String = r.get("name");
        let ty: String = r.get("type");
        let notnull: i64 = r.get("notnull");
        let pk: i64 = r.get("pk");
        let dflt_value: Option<String> = r.try_get("dflt_value").ok();
        cols.push(ColumnInfo { name, r#type: ty, notnull: notnull != 0, pk: pk != 0, dflt_value });
    }
    Ok(Json(cols))
}

#[derive(Deserialize)]
struct GenericInsertPayload { table: String, values: serde_json::Map<String, serde_json::Value> }

async fn generic_insert(Extension(state): Extension<Arc<AppState>>, headers: HeaderMap, Json(payload): Json<GenericInsertPayload>) -> Result<Json<serde_json::Value>, axum::http::StatusCode> {
    if !require_admin(&headers, &state) { return Err(axum::http::StatusCode::UNAUTHORIZED); }
    let t = sanitize_table(&payload.table);
    if payload.values.is_empty() { return Err(axum::http::StatusCode::BAD_REQUEST); }
    let cols: Vec<String> = payload.values.keys().cloned().collect();
    let placeholders = vec!["?"; cols.len()].join(", ");
    let sql = format!("INSERT INTO {} ({}) VALUES ({})", t, cols.join(", "), placeholders);
    let mut q = sqlx::query(&sql);
    for c in &cols {
        let v = payload.values.get(c).unwrap();
        match v {
            serde_json::Value::Number(n) => {
                if let Some(i) = n.as_i64() { q = q.bind(i); }
                else if let Some(f) = n.as_f64() { q = q.bind(f); }
                else { q = q.bind(n.to_string()); }
            }
            serde_json::Value::Bool(b) => { q = q.bind(*b as i64); }
            serde_json::Value::String(s) => { q = q.bind(s); }
            _ => { q = q.bind(v.to_string()); }
        }
    }
    q.execute(&state.pool).await.map_err(|_| axum::http::StatusCode::BAD_REQUEST)?;
    Ok(Json(serde_json::json!({"ok": true})))
}

#[derive(Deserialize)]
struct GenericDeletePayload { table: String, key: String, value: serde_json::Value }

async fn generic_delete(Extension(state): Extension<Arc<AppState>>, headers: HeaderMap, Json(payload): Json<GenericDeletePayload>) -> Result<Json<serde_json::Value>, axum::http::StatusCode> {
    if !require_admin(&headers, &state) { return Err(axum::http::StatusCode::UNAUTHORIZED); }
    let t = sanitize_table(&payload.table);
    let key = sanitize_table(&payload.key);
    let sql = format!("DELETE FROM {} WHERE {} = ?", t, key);
    let mut q = sqlx::query(&sql);
    match payload.value {
        serde_json::Value::Number(n) => { if let Some(i) = n.as_i64() { q = q.bind(i); } else { q = q.bind(n.to_string()); } }
        serde_json::Value::Bool(b) => { q = q.bind(b as i64); }
        serde_json::Value::String(ref s) => { q = q.bind(s); }
        _ => { q = q.bind(payload.value.to_string()); }
    }
    q.execute(&state.pool).await.map_err(|_| axum::http::StatusCode::BAD_REQUEST)?;
    Ok(Json(serde_json::json!({"ok": true})))
}

#[derive(Deserialize)]
struct UpdateUserRequest { role: Option<String> }

async fn update_user_role(
    Extension(state): Extension<Arc<AppState>>,
    headers: HeaderMap,
    Path(email): Path<String>,
    Json(payload): Json<UpdateUserRequest>
) -> Result<Json<serde_json::Value>, axum::http::StatusCode> {
    if !require_admin(&headers, &state) {
        return Err(axum::http::StatusCode::UNAUTHORIZED);
    }

    // Update user role, defaulting to 'customer' if no role provided
    let role = payload.role.as_deref().unwrap_or("customer");

    sqlx::query(r#"UPDATE users SET role = ? WHERE email = ?"#)
        .bind(role)
        .bind(&email)
        .execute(&state.pool)
        .await
        .map_err(|_| axum::http::StatusCode::BAD_REQUEST)?;

    Ok(Json(serde_json::json!({"ok": true})))
}


