use axum::{Router, Extension};
use std::sync::Arc;

use crate::state::AppState;

pub mod health;
pub mod products;
pub mod coupons;
pub mod checkout;
pub mod auth;
pub mod gift_coupons;
pub mod webhooks;
pub mod paypal;
pub mod admin;

pub fn build_router(state: Arc<AppState>) -> Router {
    Router::new()
        .merge(health::router())
        .merge(products::router())
        .merge(coupons::router())
        .merge(checkout::router())
        .merge(auth::router())
        .merge(gift_coupons::router())
        .merge(webhooks::router())
        .merge(paypal::router())
        .merge(admin::router())
        .layer(Extension(state))
}

