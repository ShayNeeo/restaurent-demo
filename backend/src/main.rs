use axum::Router;
// removed unused import
use dotenvy::dotenv;
use std::{net::SocketAddr, sync::Arc};
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

mod state;
mod db;
mod routes;
mod payments;
mod email;

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
    let admin_email = std::env::var("ADMIN_EMAIL").ok();

    // Log configuration status (without exposing sensitive data)
    tracing::info!("Backend starting with configuration:");
    tracing::info!("Database: {}", database_url);
    tracing::info!("App URL: {}", app_url);
    tracing::info!("SMTP configured: {}", smtp_host.is_some() && smtp_username.is_some() && smtp_password.is_some() && smtp_from.is_some());
    tracing::info!("PayPal configured: {}", paypal_client_id.is_some() && paypal_secret.is_some());

    let state = Arc::new(state::AppState { pool, jwt_secret, stripe_secret, app_url, smtp_host, smtp_port, smtp_username, smtp_password, smtp_from, paypal_client_id, paypal_secret, paypal_api_base, paypal_webhook_id, admin_email });

    // Spawn background cleanup task
    let cleanup_pool = state.pool.clone();
    tokio::spawn(async move {
        let mut interval = tokio::time::interval(tokio::time::Duration::from_secs(3600)); // Run every hour
        loop {
            interval.tick().await;
            if let Err(e) = db::cleanup_stale_pending(&cleanup_pool).await {
                tracing::error!("Cleanup task failed: {:?}", e);
            }
        }
    });

    let app_router: Router<_> = routes::build_router(state);

    let addr = SocketAddr::from(([127, 0, 0, 1], 8080));
    tracing::info!("listening on {}", addr);
    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
    axum::serve(listener, app_router.into_make_service()).await.unwrap();
}


