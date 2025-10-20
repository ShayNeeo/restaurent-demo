use axum::Router;
use tower::ServiceBuilder;
// removed unused import
use dotenvy::dotenv;
use std::{net::SocketAddr, sync::Arc};
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

mod state;
mod db;
mod routes;
mod payments;

#[tokio::main]
async fn main() {
    dotenv().ok();
    tracing_subscriber::registry()
        .with(tracing_subscriber::EnvFilter::new(
            std::env::var("RUST_LOG").unwrap_or_else(|_| "info".to_string()),
        ))
        .with(tracing_subscriber::fmt::layer())
        .init();

    let database_url = std::env::var("DATABASE_URL").unwrap_or_else(|_| "sqlite://./app.db".into());
    let pool = db::init_pool(&database_url).await.expect("db");
    let jwt_secret = std::env::var("JWT_SECRET").unwrap_or_else(|_| "dev_secret".into());
    let app_url = std::env::var("APP_URL").unwrap_or_else(|_| "http://localhost:5173".into());
    let stripe_secret = std::env::var("STRIPE_SECRET_KEY").ok();
    let smtp_host = std::env::var("SMTP_HOST").ok();
    let smtp_port = std::env::var("SMTP_PORT").ok().and_then(|v| v.parse().ok());
    let smtp_username = std::env::var("SMTP_USERNAME").ok();
    let smtp_password = std::env::var("SMTP_PASSWORD").ok();
    let smtp_from = std::env::var("SMTP_FROM").ok();

    let paypal_client_id = std::env::var("PAYPAL_CLIENT_ID").ok();
    let paypal_secret = std::env::var("PAYPAL_SECRET").ok();
    let paypal_api_base = std::env::var("PAYPAL_API_BASE").unwrap_or_else(|_| "https://api-m.sandbox.paypal.com".into());
    let paypal_webhook_id = std::env::var("PAYPAL_WEBHOOK_ID").ok();

    let state = Arc::new(state::AppState { pool, jwt_secret, stripe_secret, app_url, smtp_host, smtp_port, smtp_username, smtp_password, smtp_from, paypal_client_id, paypal_secret, paypal_api_base, paypal_webhook_id });

    let app_router: Router<_> = routes::build_router(state);

    let addr = SocketAddr::from(([127, 0, 0, 1], 8080));
    tracing::info!("listening on {}", addr);
    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
    let svc = ServiceBuilder::new().service(app_router);
    axum::serve(listener, svc).await.unwrap();
}


