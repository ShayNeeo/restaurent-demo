use axum::{routing::get, Router};

pub fn router() -> Router {
    // In production, capture PayPal order IDs on return and finalize order/gift coupon.
    Router::new()
        .route("/paypal/return", get(|| async { "OK" }))
        .route("/paypal/cancel", get(|| async { "CANCEL" }))
        .route("/paypal/gift/return", get(|| async { "OK" }))
        .route("/paypal/gift/cancel", get(|| async { "CANCEL" }))
}

