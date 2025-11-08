use axum::{routing::{get, post, delete, patch}, extract::{Query, Path}, Json, Router, http::HeaderMap, Extension};
use serde::Serialize;
use serde::Deserialize;
use jsonwebtoken::{DecodingKey, Validation, decode};
use std::sync::Arc;
use sqlx::{Row, Column, FromRow};
use argon2::password_hash::PasswordHasher;

use crate::state::AppState;

#[derive(Deserialize)]
#[allow(dead_code)]
struct Claims { sub: String, email: String, exp: usize }

fn extract_email_from_token(headers: &HeaderMap, state: &AppState) -> Option<String> {
    let auth = headers.get(axum::http::header::AUTHORIZATION).and_then(|v| v.to_str().ok());
    if let Some(bearer) = auth {
        if let Some(token) = bearer.strip_prefix("Bearer ") {
            if let Ok(data) = decode::<Claims>(token, &DecodingKey::from_secret(state.jwt_secret.as_bytes()), &Validation::default()) {
                return Some(data.claims.email);
            }
        }
    }
    None
}

async fn is_admin_user(email: &str, state: &AppState) -> bool {
    let result = sqlx::query("SELECT role FROM users WHERE email = ?")
        .bind(email)
        .fetch_optional(&state.pool)
        .await;

    match result {
        Ok(Some(row)) => {
            let role: String = row.get("role");
            role == "admin"
        }
        _ => false,
        }
    }

#[allow(dead_code)]
fn require_admin(headers: &HeaderMap, state: &AppState) -> bool {
    extract_email_from_token(headers, state).is_some()
}

#[derive(Serialize)]
struct Tables { tables: Vec<String> }

#[derive(Deserialize)]
struct QueryParams { table: String, limit: Option<i64> }

pub fn router() -> Router {
    Router::new()
        .route("/api/admin/tables", get(list_tables))
        .route("/api/admin/query", get(query_table))
        .route("/api/admin/coupons", get(list_coupons).post(add_coupon))
        .route("/api/admin/coupons/:code", delete(delete_coupon))
        .route("/api/admin/columns", get(columns_for_table))
        .route("/api/admin/insert", post(generic_insert))
        .route("/api/admin/delete", post(generic_delete))
        .route("/api/admin/users", get(list_users).post(add_user))
        .route("/api/admin/users/:email", patch(update_user_role).delete(delete_user))
        // Dashboard endpoints
        .route("/api/admin/stats", get(get_stats))
        .route("/api/admin/orders", get(get_orders))
        .route("/api/admin/pending-orders", get(get_pending_orders))
        .route("/api/admin/pending-orders/:order_id", delete(delete_pending_order))
        .route("/api/admin/cleanup", post(cleanup_stale_pending))
        .route("/api/admin/products", get(list_products))
        .route("/api/admin/gift-coupons", get(list_gift_coupons))
}

async fn list_tables(Extension(state): Extension<Arc<AppState>>, headers: HeaderMap) -> Result<Json<Tables>, axum::http::StatusCode> {
    let email = extract_email_from_token(&headers, &state).ok_or(axum::http::StatusCode::UNAUTHORIZED)?;
    if !is_admin_user(&email, &state).await { return Err(axum::http::StatusCode::FORBIDDEN); }
    let rows = sqlx::query_scalar::<_, String>(
        r#"SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name"#
    )
    .fetch_all(&state.pool)
    .await
    .unwrap_or_default();
    Ok(Json(Tables { tables: rows }))
}

async fn query_table(Extension(state): Extension<Arc<AppState>>, headers: HeaderMap, Query(params): Query<QueryParams>) -> Result<Json<serde_json::Value>, axum::http::StatusCode> {
    let email = extract_email_from_token(&headers, &state).ok_or(axum::http::StatusCode::UNAUTHORIZED)?;
    if !is_admin_user(&email, &state).await { return Err(axum::http::StatusCode::FORBIDDEN); }
    let limit = params.limit.unwrap_or(50).max(1).min(500);
    let sql = format!("SELECT * FROM {} LIMIT {}", params.table.replace('"', ""), limit);
    let rows = sqlx::query(&sql).fetch_all(&state.pool).await.map_err(|_| axum::http::StatusCode::BAD_REQUEST)?;
    let mut out = Vec::new();
    for row in rows {
        let mut obj = serde_json::Map::new();
        for (idx, col) in row.columns().iter().enumerate() {
            let name = Column::name(col).to_string();
            
            // Try to get as integer first
            if let Ok(val) = row.try_get::<i64, _>(idx) {
                obj.insert(name, serde_json::Value::Number(val.into()));
                continue;
            }
            
            // Try to get as float
            if let Ok(val) = row.try_get::<f64, _>(idx) {
                if let Some(num) = serde_json::Number::from_f64(val) {
                    obj.insert(name, serde_json::Value::Number(num));
                    continue;
                }
            }
            
            // Fall back to string
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
    let email = extract_email_from_token(&headers, &state).ok_or(axum::http::StatusCode::UNAUTHORIZED)?;
    if !is_admin_user(&email, &state).await { return Err(axum::http::StatusCode::FORBIDDEN); }
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
    let email = extract_email_from_token(&headers, &state).ok_or(axum::http::StatusCode::UNAUTHORIZED)?;
    if !is_admin_user(&email, &state).await { return Err(axum::http::StatusCode::FORBIDDEN); }
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
    let email = extract_email_from_token(&headers, &state).ok_or(axum::http::StatusCode::UNAUTHORIZED)?;
    if !is_admin_user(&email, &state).await { return Err(axum::http::StatusCode::FORBIDDEN); }
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
    let email = extract_email_from_token(&headers, &state).ok_or(axum::http::StatusCode::UNAUTHORIZED)?;
    if !is_admin_user(&email, &state).await { return Err(axum::http::StatusCode::FORBIDDEN); }
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
    let email = extract_email_from_token(&headers, &state).ok_or(axum::http::StatusCode::UNAUTHORIZED)?;
    if !is_admin_user(&email, &state).await { return Err(axum::http::StatusCode::FORBIDDEN); }
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
    Path(target_email): Path<String>,
    Json(payload): Json<UpdateUserRequest>
) -> Result<Json<serde_json::Value>, axum::http::StatusCode> {
    let _admin_email = extract_email_from_token(&headers, &state).ok_or(axum::http::StatusCode::UNAUTHORIZED)?;
    if !is_admin_user(&_admin_email, &state).await { return Err(axum::http::StatusCode::FORBIDDEN); }

    // Update user role, defaulting to 'customer' if no role provided
    let role = payload.role.as_deref().unwrap_or("customer");

    sqlx::query(r#"UPDATE users SET role = ? WHERE email = ?"#)
        .bind(role)
        .bind(&target_email)
        .execute(&state.pool)
        .await
        .map_err(|_| axum::http::StatusCode::BAD_REQUEST)?;

    Ok(Json(serde_json::json!({"ok": true})))
}

// Dashboard endpoints

#[derive(Serialize)]
struct Stats {
    total_orders: i64,
    total_revenue: i64,
    total_users: i64,
    pending_orders: i64,
}

async fn get_stats(Extension(state): Extension<Arc<AppState>>, headers: HeaderMap) -> Result<Json<Stats>, axum::http::StatusCode> {
    let email = extract_email_from_token(&headers, &state).ok_or(axum::http::StatusCode::UNAUTHORIZED)?;
    if !is_admin_user(&email, &state).await { return Err(axum::http::StatusCode::FORBIDDEN); }
    
    let total_orders: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM orders").fetch_one(&state.pool).await.unwrap_or(0);
    let total_revenue: i64 = sqlx::query_scalar("SELECT COALESCE(SUM(total_cents), 0) FROM orders").fetch_one(&state.pool).await.unwrap_or(0);
    let total_users: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM users").fetch_one(&state.pool).await.unwrap_or(0);
    let pending_orders: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM pending_orders").fetch_one(&state.pool).await.unwrap_or(0);
    
    Ok(Json(Stats { total_orders, total_revenue, total_users, pending_orders }))
}

#[derive(Serialize, FromRow)]
struct OrderInfo {
    id: String,
    email: Option<String>,
    total_cents: i64,
    created_at: String,
}

#[derive(Serialize, FromRow)]
struct PendingOrderInfo {
    id: String,
    email: Option<String>,
    total_cents: i64,
    created_at: String,
}

#[derive(Serialize)]
struct OrdersResponse {
    orders: Vec<OrderInfo>,
}

#[derive(Serialize)]
struct PendingOrdersResponse {
    pending_orders: Vec<PendingOrderInfo>,
}

async fn get_orders(Extension(state): Extension<Arc<AppState>>, headers: HeaderMap) -> Result<Json<OrdersResponse>, axum::http::StatusCode> {
    let email = extract_email_from_token(&headers, &state).ok_or(axum::http::StatusCode::UNAUTHORIZED)?;
    if !is_admin_user(&email, &state).await { return Err(axum::http::StatusCode::FORBIDDEN); }
    
    let orders = sqlx::query_as::<_, OrderInfo>("SELECT id, email, total_cents, created_at FROM orders ORDER BY created_at DESC LIMIT 100")
        .fetch_all(&state.pool)
        .await
        .unwrap_or_default();
    
    Ok(Json(OrdersResponse { orders }))
}

async fn get_pending_orders(Extension(state): Extension<Arc<AppState>>, headers: HeaderMap) -> Result<Json<PendingOrdersResponse>, axum::http::StatusCode> {
    let email = extract_email_from_token(&headers, &state).ok_or(axum::http::StatusCode::UNAUTHORIZED)?;
    if !is_admin_user(&email, &state).await { return Err(axum::http::StatusCode::FORBIDDEN); }
    
    // Handle case where table might not exist
    let pending_orders = match sqlx::query_as::<_, PendingOrderInfo>("SELECT order_id AS id, email, amount_cents AS total_cents, created_at FROM pending_orders ORDER BY created_at DESC LIMIT 100")
        .fetch_all(&state.pool)
        .await {
            Ok(data) => data,
            Err(_) => Vec::new(), // Table might not exist
        };
    
    Ok(Json(PendingOrdersResponse { pending_orders }))
}

#[derive(Serialize, FromRow)]
struct UserInfo {
    id: String,
    email: String,
    role: String,
    created_at: String,
}

#[derive(Serialize)]
struct UsersResponse {
    users: Vec<UserInfo>,
}

async fn list_users(Extension(state): Extension<Arc<AppState>>, headers: HeaderMap) -> Result<Json<UsersResponse>, axum::http::StatusCode> {
    let email = extract_email_from_token(&headers, &state).ok_or(axum::http::StatusCode::UNAUTHORIZED)?;
    if !is_admin_user(&email, &state).await { return Err(axum::http::StatusCode::FORBIDDEN); }
    
    let users = sqlx::query_as::<_, UserInfo>("SELECT id, email, role, created_at FROM users ORDER BY created_at DESC LIMIT 100")
        .fetch_all(&state.pool)
        .await
        .unwrap_or_default();
    
    Ok(Json(UsersResponse { users }))
}

#[derive(Serialize, FromRow)]
struct ProductInfo {
    id: String,
    name: String,
    price_cents: i64,
}

#[derive(Serialize)]
struct ProductsResponse {
    products: Vec<ProductInfo>,
}

async fn list_products(Extension(state): Extension<Arc<AppState>>, headers: HeaderMap) -> Result<Json<ProductsResponse>, axum::http::StatusCode> {
    let email = extract_email_from_token(&headers, &state).ok_or(axum::http::StatusCode::UNAUTHORIZED)?;
    if !is_admin_user(&email, &state).await { return Err(axum::http::StatusCode::FORBIDDEN); }
    
    let products = sqlx::query_as::<_, ProductInfo>("SELECT id, name, unit_amount AS price_cents FROM products ORDER BY name COLLATE NOCASE ASC LIMIT 200")
        .fetch_all(&state.pool)
        .await
        .unwrap_or_default();
    
    Ok(Json(ProductsResponse { products }))
}

#[derive(Serialize, FromRow)]
struct CouponInfo {
    code: String,
    percent_off: Option<i64>,
    amount_off: Option<i64>,
    remaining_uses: i64,
}

#[derive(Serialize)]
struct CouponsResponse {
    coupons: Vec<CouponInfo>,
}

async fn list_coupons(Extension(state): Extension<Arc<AppState>>, headers: HeaderMap) -> Result<Json<CouponsResponse>, axum::http::StatusCode> {
    let email = extract_email_from_token(&headers, &state).ok_or(axum::http::StatusCode::UNAUTHORIZED)?;
    if !is_admin_user(&email, &state).await { return Err(axum::http::StatusCode::FORBIDDEN); }
    
    let coupons = sqlx::query_as::<_, CouponInfo>("SELECT code, percent_off, amount_off, remaining_uses FROM coupons ORDER BY code")
        .fetch_all(&state.pool)
        .await
        .unwrap_or_default();
    
    Ok(Json(CouponsResponse { coupons }))
}

#[derive(Serialize, FromRow)]
struct GiftCodeInfo {
    code: String,
    value_cents: i64,
    remaining_cents: i64,
    purchaser_email: Option<String>,
    created_at: String,
}

#[derive(Serialize)]
struct GiftCouponsResponse {
    gift_coupons: Vec<GiftCodeInfo>,
}

async fn list_gift_coupons(Extension(state): Extension<Arc<AppState>>, headers: HeaderMap) -> Result<Json<GiftCouponsResponse>, axum::http::StatusCode> {
    let email = extract_email_from_token(&headers, &state).ok_or(axum::http::StatusCode::UNAUTHORIZED)?;
    if !is_admin_user(&email, &state).await { return Err(axum::http::StatusCode::FORBIDDEN); }
    
    // Handle case where table might not exist
    let gift_coupons = match sqlx::query_as::<_, GiftCodeInfo>("SELECT code, value_cents, remaining_cents, purchaser_email, created_at FROM gift_codes ORDER BY created_at DESC LIMIT 200")
        .fetch_all(&state.pool)
        .await {
            Ok(data) => data,
            Err(_) => Vec::new(), // Table might not exist
        };
    
    Ok(Json(GiftCouponsResponse { gift_coupons }))
}

#[derive(Deserialize)]
struct AddUserPayload { email: String, password: String, role: Option<String> }

async fn add_user(Extension(state): Extension<Arc<AppState>>, headers: HeaderMap, Json(payload): Json<AddUserPayload>) -> Result<Json<serde_json::Value>, axum::http::StatusCode> {
    let email = extract_email_from_token(&headers, &state).ok_or(axum::http::StatusCode::UNAUTHORIZED)?;
    if !is_admin_user(&email, &state).await { return Err(axum::http::StatusCode::FORBIDDEN); }
    
    let id = uuid::Uuid::new_v4().to_string();
    let salt = argon2::password_hash::SaltString::generate(&mut rand::thread_rng());
    let password_hash = argon2::Argon2::default()
        .hash_password(payload.password.as_bytes(), &salt)
        .map_err(|_| axum::http::StatusCode::INTERNAL_SERVER_ERROR)?
        .to_string();
    
    let role = payload.role.unwrap_or_else(|| "customer".to_string());
    
    sqlx::query(r#"INSERT INTO users (id, email, password_hash, role) VALUES (?, ?, ?, ?)"#)
        .bind(&id)
        .bind(&payload.email)
        .bind(&password_hash)
        .bind(&role)
        .execute(&state.pool)
        .await
        .map_err(|_| axum::http::StatusCode::BAD_REQUEST)?;
    
    Ok(Json(serde_json::json!({"ok": true, "id": id})))
}

async fn delete_user(Extension(state): Extension<Arc<AppState>>, headers: HeaderMap, Path(target_email): Path<String>) -> Result<Json<serde_json::Value>, axum::http::StatusCode> {
    let _admin_email = extract_email_from_token(&headers, &state).ok_or(axum::http::StatusCode::UNAUTHORIZED)?;
    if !is_admin_user(&_admin_email, &state).await { return Err(axum::http::StatusCode::FORBIDDEN); }
    
    let result = sqlx::query(r#"DELETE FROM users WHERE email = ?"#)
        .bind(&target_email)
        .execute(&state.pool)
        .await
        .map_err(|_| axum::http::StatusCode::BAD_REQUEST)?;
    
    if result.rows_affected() == 0 {
        return Err(axum::http::StatusCode::NOT_FOUND);
    }
    
    Ok(Json(serde_json::json!({"ok": true})))
}

// Cleanup endpoints for pending orders
async fn delete_pending_order(
    Extension(state): Extension<Arc<AppState>>,
    headers: HeaderMap,
    Path(order_id): Path<String>
) -> Result<Json<serde_json::Value>, axum::http::StatusCode> {
    let email = extract_email_from_token(&headers, &state).ok_or(axum::http::StatusCode::UNAUTHORIZED)?;
    if !is_admin_user(&email, &state).await { return Err(axum::http::StatusCode::FORBIDDEN); }

    let result = sqlx::query(r#"DELETE FROM pending_orders WHERE order_id = ?"#)
        .bind(&order_id)
        .execute(&state.pool)
        .await
        .map_err(|_| axum::http::StatusCode::INTERNAL_SERVER_ERROR)?;

    if result.rows_affected() == 0 {
        return Err(axum::http::StatusCode::NOT_FOUND);
    }

    Ok(Json(serde_json::json!({"ok": true, "message": format!("Deleted pending order {}", order_id)})))
}

async fn cleanup_stale_pending(
    Extension(state): Extension<Arc<AppState>>,
    headers: HeaderMap
) -> Result<Json<serde_json::Value>, axum::http::StatusCode> {
    let email = extract_email_from_token(&headers, &state).ok_or(axum::http::StatusCode::UNAUTHORIZED)?;
    if !is_admin_user(&email, &state).await { return Err(axum::http::StatusCode::FORBIDDEN); }

    // Delete pending orders older than 24 hours
    let orders_deleted = sqlx::query(r#"DELETE FROM pending_orders WHERE datetime(created_at) < datetime('now', '-24 hours')"#)
        .execute(&state.pool)
        .await
        .map_err(|_| axum::http::StatusCode::INTERNAL_SERVER_ERROR)?
        .rows_affected();

    // Delete pending gifts older than 24 hours
    let gifts_deleted = sqlx::query(r#"DELETE FROM pending_gifts WHERE datetime(created_at) < datetime('now', '-24 hours')"#)
        .execute(&state.pool)
        .await
        .map_err(|_| axum::http::StatusCode::INTERNAL_SERVER_ERROR)?
        .rows_affected();

    tracing::info!("Manual cleanup: deleted {} pending orders and {} pending gifts", orders_deleted, gifts_deleted);

    Ok(Json(serde_json::json!({
        "ok": true,
        "pending_orders_deleted": orders_deleted,
        "pending_gifts_deleted": gifts_deleted,
        "message": format!("Cleaned up {} stale orders and {} stale gifts", orders_deleted, gifts_deleted)
    })))
}

