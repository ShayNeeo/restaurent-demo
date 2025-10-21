use axum::{routing::get, Json, Router};
use serde::Serialize;

#[derive(Serialize)]
struct Health { ok: bool }

pub fn router() -> Router {
    Router::new().route("/api/health", get(handler))
}

async fn handler() -> Json<Health> {
    Json(Health { ok: true })
}

