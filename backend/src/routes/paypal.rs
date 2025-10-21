use axum::{routing::get, Router, extract::Query, response::Redirect, Extension};
use serde::Deserialize;
use std::sync::Arc;
use uuid::Uuid;

use crate::{state::AppState, payments::capture_paypal_order};

#[derive(Deserialize)]
struct ReturnParams { token: Option<String> }
use std::sync::Arc;
use crate::state::AppState;

pub fn router() -> Router {
    // In production, capture PayPal order IDs on return and finalize order/gift coupon.
    Router::new()
        .route("/paypal/return", get(paypal_return))
        .route("/paypal/cancel", get(|| async { "CANCEL" }))
        .route("/paypal/gift/return", get(paypal_gift_return))
        .route("/paypal/gift/cancel", get(|| async { "CANCEL" }))
}

async fn paypal_return() -> Redirect {
    Redirect::to("/thank-you")
}

async fn paypal_gift_return(Extension(state): Extension<Arc<AppState>>, Query(params): Query<ReturnParams>) -> Redirect {
    if let Some(order_id) = params.token {
        if let Ok(captured) = capture_paypal_order(&state, &order_id).await {
            if captured.status == "COMPLETED" {
                let code = Uuid::new_v4().to_string().replace('-', "");
                let _ = sqlx::query(r#"INSERT INTO gift_codes (code, value_cents, remaining_cents) VALUES (?, ?, ?)"#)
                    .bind(&code)
                    .bind(0_i64)
                    .bind(0_i64)
                    .execute(&state.pool)
                    .await;
                return Redirect::to(&format!("/thank-you?code={}", code));
            }
        }
    }
    Redirect::to("/thank-you")
}

