use axum::{routing::post, Json, Router, Extension};
use serde::{Deserialize, Serialize};
use std::sync::Arc;

use crate::{state::AppState, payments::{create_paypal_order, find_approval_url}};

#[derive(Deserialize)]
pub struct CartItem { pub product_id: String, pub name: String, pub unit_amount: i64, pub quantity: i64, pub currency: String }

#[derive(Deserialize)]
pub struct CheckoutRequest { pub cart: Vec<CartItem>, pub coupon: Option<String>, pub email: Option<String> }

#[derive(Serialize)]
pub struct CheckoutResponse { pub url: String }

pub fn router() -> Router {
    Router::new().route("/api/checkout", post(start))
}

async fn start(Extension(state): Extension<Arc<AppState>>, Json(payload): Json<CheckoutRequest>) -> Json<CheckoutResponse> {
    // Prefer PayPal if configured
    if state.paypal_client_id.is_some() && state.paypal_secret.is_some() {
        let total_cents: i64 = payload.cart.iter().map(|i| i.unit_amount * i.quantity).sum();
        if let Ok(order) = create_paypal_order(&state, total_cents, "/paypal/return", "/paypal/cancel", Some("Cart checkout".into())).await {
            if let Some(approval) = find_approval_url(&order) { return Json(CheckoutResponse { url: approval }); }
        }
    }
    // Stripe stub remains for later enablement
    if state.stripe_secret.is_some() { /* keep as stub */ }
    // Fallback
    Json(CheckoutResponse { url: format!("{}/thank-you", state.app_url) })
}


