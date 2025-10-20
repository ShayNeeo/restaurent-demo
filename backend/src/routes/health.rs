use axum::{routing::get, Json, Router};
use std::sync::Arc;
use crate::state::AppState;
use serde::Serialize;

#[derive(Serialize)]
struct Health { ok: bool }

pub fn router() -> Router<Arc<AppState>> {
    Router::new().route("/api/health", get(handler))
}

async fn handler() -> Json<Health> {
    Json(Health { ok: true })
}

