use axum::{routing::post, Json, Router, Extension, http::StatusCode};
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use sqlx::Row;

use crate::state::AppState;

#[derive(Deserialize)]
pub struct ApplyCouponRequest { pub code: String, pub cart: Option<Vec<CartItem>> }

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
#[allow(dead_code)]
pub struct CartItem { pub product_id: String, pub name: String, pub unit_amount: i64, pub quantity: i64, pub currency: String }

#[derive(Serialize)]
pub struct ApplyCouponResponse { pub valid: bool, pub amount_off: Option<i64>, pub percent_off: Option<i64> }

#[derive(Serialize)]
pub struct ValidateQRResponse {
    pub id: String,
    pub code: String,
    pub balance: i64,
    pub customer_email: String,
}

#[derive(Deserialize)]
pub struct ValidateQRRequest {
    pub code: String,
}

pub fn router() -> Router {
    Router::new()
        .route("/api/coupons/apply", post(apply))
        .route("/api/coupons/validate", post(validate_qr))
}

async fn apply(Extension(state): Extension<Arc<AppState>>, Json(payload): Json<ApplyCouponRequest>) -> Json<ApplyCouponResponse> {
    let code = payload.code.trim();
    let code_upper = code.to_uppercase();
    
    // Gift code support: if exists in gift_codes with remaining > 0, apply up to cart total
    // Use COLLATE NOCASE for case-insensitive matching (gift codes are lowercase UUIDs)
    if let Ok(Some(g)) = sqlx::query(r#"SELECT remaining_cents FROM gift_codes WHERE code = ? COLLATE NOCASE"#)
        .bind(&code)
        .fetch_optional(&state.pool)
        .await
    {
        let remaining: i64 = g.get::<i64, _>("remaining_cents");
        if remaining > 0 {
            // derive cart total
            let total: i64 = payload.cart.as_ref().map(|c| c.iter().map(|i| i.unit_amount * i.quantity).sum()).unwrap_or(0);
            let apply_amount = remaining.min(total);
            if apply_amount > 0 { return Json(ApplyCouponResponse { valid: true, amount_off: Some(apply_amount), percent_off: None }); }
        }
    }

    // Regular coupon (uppercase)
    if let Ok(Some(r)) = sqlx::query(r#"SELECT percent_off, amount_off, remaining_uses FROM coupons WHERE code = ?"#)
        .bind(&code_upper)
        .fetch_optional(&state.pool)
        .await
    {
        let remaining: i64 = r.get::<i64, _>("remaining_uses");
        if remaining > 0 {
            let amount_off: Option<i64> = r.try_get("amount_off").ok();
            let percent_off: Option<i64> = r.try_get("percent_off").ok();
            
            // Only mark as valid if at least one discount type is actually set to a positive value
            let has_valid_discount = 
                (amount_off.is_some() && amount_off.unwrap_or(0) > 0) ||
                (percent_off.is_some() && percent_off.unwrap_or(0) > 0);
            
            if has_valid_discount {
            return Json(ApplyCouponResponse { valid: true, amount_off, percent_off });
            }
        }
    }

    Json(ApplyCouponResponse { valid: false, amount_off: None, percent_off: None })
}

async fn validate_qr(
    Extension(state): Extension<Arc<AppState>>,
    Json(payload): Json<ValidateQRRequest>,
) -> Result<Json<ValidateQRResponse>, StatusCode> {
    let code = payload.code.trim();
    let code_lower = code.to_lowercase();

    // Check if it's a gift code (UUID format)
    if let Ok(Some(row)) = sqlx::query(
        r#"SELECT id, code, remaining_cents as balance, customer_email FROM gift_codes WHERE code = ? COLLATE NOCASE"#
    )
    .bind(&code)
    .fetch_optional(&state.pool)
    .await
    {
        let id: String = row.try_get("id").unwrap_or_default();
        let code: String = row.try_get("code").unwrap_or_default();
        let balance: i64 = row.try_get("balance").unwrap_or(0);
        let customer_email: String = row.try_get("customer_email").unwrap_or_default();

        if balance > 0 {
            return Ok(Json(ValidateQRResponse {
                id,
                code,
                balance,
                customer_email,
            }));
        }
    }

    // Check regular coupons
    if let Ok(Some(row)) = sqlx::query(
        r#"SELECT id, code, remaining_uses, amount_off, percent_off FROM coupons WHERE code = ?"#
    )
    .bind(&code_lower.to_uppercase())
    .fetch_optional(&state.pool)
    .await
    {
        let remaining: i64 = row.try_get("remaining_uses").unwrap_or(0);
        if remaining > 0 {
            let id: String = row.try_get("id").unwrap_or_default();
            let code: String = row.try_get("code").unwrap_or_default();
            // For regular coupons, use amount_off as balance if available
            let balance: i64 = row
                .try_get::<i64, _>("amount_off")
                .unwrap_or(0)
                .max(row.try_get::<i64, _>("percent_off").unwrap_or(0));

            return Ok(Json(ValidateQRResponse {
                id,
                code,
                balance,
                customer_email: "manager@restaurant.local".to_string(),
            }));
        }
    }

    Err(StatusCode::NOT_FOUND)
}


