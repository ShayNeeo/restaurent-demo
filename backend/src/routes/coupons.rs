use axum::{routing::post, Json, Router, extract::State};
use serde::{Deserialize, Serialize};
use std::sync::Arc;

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
    let row = sqlx::query!(
        r#"SELECT code, percent_off, amount_off, remaining_uses FROM coupons WHERE code = ?"#,
        code
    )
    .fetch_optional(&state.pool)
    .await
    .ok()
    .flatten();

    if let Some(r) = row {
        if r.remaining_uses > 0 {
            return Json(ApplyCouponResponse { valid: true, amount_off: r.amount_off, percent_off: r.percent_off });
        }
    }

    Json(ApplyCouponResponse { valid: false, amount_off: None, percent_off: None })
}


