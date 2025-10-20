use axum::{routing::post, Router};

pub fn router() -> Router {
    // Placeholder; add Stripe webhook signature verification and handlers here
    Router::new().route("/api/webhooks/stripe", post(|| async { "ok" }))
}

