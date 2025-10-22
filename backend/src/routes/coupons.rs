use axum::{routing::post, Json, Router, Extension};
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use sqlx::Row;

use crate::state::AppState;

#[derive(Deserialize)]
pub struct ApplyCouponRequest { pub code: String, pub cart: Option<Vec<CartItem>> }

#[derive(Deserialize)]
#[allow(dead_code)]
pub struct CartItem { pub product_id: String, pub name: String, pub unit_amount: i64, pub quantity: i64, pub currency: String }

#[derive(Serialize)]
pub struct ApplyCouponResponse { pub valid: bool, pub amount_off: Option<i64>, pub percent_off: Option<i64> }

pub fn router() -> Router {
    Router::new().route("/api/coupons/apply", post(apply))
}

async fn apply(Extension(state): Extension<Arc<AppState>>, Json(payload): Json<ApplyCouponRequest>) -> Json<ApplyCouponResponse> {
    let code = payload.code.trim().to_uppercase();
    // Gift code support: if exists in gift_codes with remaining > 0, apply up to cart total
    if let Ok(Some(g)) = sqlx::query(r#"SELECT remaining_cents FROM gift_codes WHERE code = ?"#)
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

    // Regular coupon
    if let Ok(Some(r)) = sqlx::query(r#"SELECT percent_off, amount_off, remaining_uses FROM coupons WHERE code = ?"#)
        .bind(&code)
        .fetch_optional(&state.pool)
        .await
    {
        let remaining: i64 = r.get::<i64, _>("remaining_uses");
        if remaining > 0 {
            let amount_off: Option<i64> = r.try_get("amount_off").ok();
            let percent_off: Option<i64> = r.try_get("percent_off").ok();
            return Json(ApplyCouponResponse { valid: true, amount_off, percent_off });
        }
    }

    Json(ApplyCouponResponse { valid: false, amount_off: None, percent_off: None })
}


