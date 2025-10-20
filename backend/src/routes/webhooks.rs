use axum::{routing::post, Router};
use std::sync::Arc;
use crate::state::AppState;

pub fn router() -> Router<Arc<AppState>> {
    // Placeholder; add Stripe webhook signature verification and handlers here
    Router::new().route("/api/webhooks/stripe", post(|| async { "ok" }))
}

