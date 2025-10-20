use axum::{routing::post, Json, Router, extract::State};
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use sqlx::Row;

use crate::state::AppState;

#[derive(Deserialize)]
pub struct ApplyCouponRequest { pub code: String }

#[derive(Serialize)]
pub struct ApplyCouponResponse { pub valid: bool, pub amount_off: Option<i64>, pub percent_off: Option<i64> }

pub fn router() -> Router<Arc<AppState>> {
    Router::new().route("/api/coupons/apply", post(apply))
}

async fn apply(State(state): State<Arc<AppState>>, Json(payload): Json<ApplyCouponRequest>) -> Json<ApplyCouponResponse> {
    let code = payload.code.trim().to_uppercase();
    let row = sqlx::query(r#"SELECT code, percent_off, amount_off, remaining_uses FROM coupons WHERE code = ?"#)
        .bind(&code)
        .fetch_optional(&state.pool)
        .await
        .ok()
        .flatten();

    if let Some(r) = row {
        let remaining: i64 = r.get::<i64, _>("remaining_uses");
        if remaining > 0 {
            let amount_off: Option<i64> = r.try_get("amount_off").ok();
            let percent_off: Option<i64> = r.try_get("percent_off").ok();
            return Json(ApplyCouponResponse { valid: true, amount_off, percent_off });
        }
    }

    Json(ApplyCouponResponse { valid: false, amount_off: None, percent_off: None })
}


