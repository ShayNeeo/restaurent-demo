use axum::{routing::post, Json, Router, extract::State};
use serde::{Deserialize, Serialize};
use std::sync::Arc;

use crate::{state::AppState, payments::{create_paypal_order, find_approval_url}};

#[derive(Deserialize)]
pub struct BuyGiftRequest { pub amount_eur: i64 }

#[derive(Serialize)]
pub struct BuyGiftResponse { pub url: String }

pub fn router() -> Router<Arc<AppState>> {
    Router::new().route("/api/gift-coupons/buy", post(buy))
}

async fn buy(State(state): State<Arc<AppState>>, Json(payload): Json<BuyGiftRequest>) -> Json<BuyGiftResponse> {
    let amount_cents = payload.amount_eur * 100;
    let bonus_cents = (amount_cents as f64 * 0.10).round() as i64;
    let _total_value = amount_cents + bonus_cents;
    if state.paypal_client_id.is_some() && state.paypal_secret.is_some() {
        if let Ok(order) = create_paypal_order(&state, amount_cents, "/paypal/gift/return", "/paypal/gift/cancel", Some(format!("Gift coupon {} cents (+{} bonus)", amount_cents, bonus_cents))).await {
            if let Some(approval) = find_approval_url(&order) { return Json(BuyGiftResponse { url: approval }); }
        }
    }
    Json(BuyGiftResponse { url: format!("{}/thank-you", state.app_url) })
}


