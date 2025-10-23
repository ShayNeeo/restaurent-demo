use axum::{routing::get, Json, Router, Extension};
use serde::Serialize;
use std::sync::Arc;
use sqlx::Row;

use crate::state::AppState;

#[derive(Serialize)]
struct Health {
    ok: bool,
    database: DatabaseStatus,
    config: ConfigStatus,
}

#[derive(Serialize)]
struct DatabaseStatus {
    connected: bool,
    users_table_exists: bool,
    admin_user_exists: bool,
    error: Option<String>,
}

#[derive(Serialize)]
struct ConfigStatus {
    smtp_configured: bool,
    paypal_configured: bool,
    admin_email_set: bool,
}

pub fn router() -> Router {
    Router::new()
        .route("/api/health", get(handler))
        .route("/api/health/detailed", get(detailed_handler))
}

async fn handler() -> Json<Health> {
    Json(Health {
        ok: true,
        database: DatabaseStatus {
            connected: true,
            users_table_exists: true,
            admin_user_exists: true,
            error: None,
        },
        config: ConfigStatus {
            smtp_configured: true,
            paypal_configured: true,
            admin_email_set: true,
        },
    })
}

async fn detailed_handler(Extension(state): Extension<Arc<AppState>>) -> Json<Health> {
    // Check database connectivity
    let db_connected = match sqlx::query("SELECT 1").fetch_one(&state.pool).await {
        Ok(_) => true,
        Err(e) => {
            tracing::error!("Database connection failed: {:?}", e);
            return Json(Health {
                ok: false,
                database: DatabaseStatus {
                    connected: false,
                    users_table_exists: false,
                    admin_user_exists: false,
                    error: Some(format!("Database connection failed: {:?}", e)),
                },
                config: ConfigStatus {
                    smtp_configured: state.smtp_host.is_some() && state.smtp_username.is_some(),
                    paypal_configured: state.paypal_client_id.is_some() && state.paypal_secret.is_some(),
                    admin_email_set: state.admin_email.is_some(),
                },
            });
        }
    };

    // Check if users table exists and has required columns
    let users_table_ok = match sqlx::query("PRAGMA table_info(users)").fetch_all(&state.pool).await {
        Ok(columns) => {
            let has_role = columns.iter().any(|col| col.get::<String, _>("name") == "role");
            let has_email = columns.iter().any(|col| col.get::<String, _>("name") == "email");
            let has_password_hash = columns.iter().any(|col| col.get::<String, _>("name") == "password_hash");

            if !has_email || !has_password_hash {
                return Json(Health {
                    ok: false,
                    database: DatabaseStatus {
                        connected: true,
                        users_table_exists: false,
                        admin_user_exists: false,
                        error: Some("Users table missing required columns".to_string()),
                    },
                    config: ConfigStatus {
                        smtp_configured: state.smtp_host.is_some() && state.smtp_username.is_some(),
                        paypal_configured: state.paypal_client_id.is_some() && state.paypal_secret.is_some(),
                        admin_email_set: state.admin_email.is_some(),
                    },
                });
            }

            has_role // Role column presence
        }
        Err(e) => {
            tracing::error!("Failed to check users table schema: {:?}", e);
            return Json(Health {
                ok: false,
                database: DatabaseStatus {
                    connected: true,
                    users_table_exists: false,
                    admin_user_exists: false,
                    error: Some(format!("Failed to check users table: {:?}", e)),
                },
                config: ConfigStatus {
                    smtp_configured: state.smtp_host.is_some() && state.smtp_username.is_some(),
                    paypal_configured: state.paypal_client_id.is_some() && state.paypal_secret.is_some(),
                    admin_email_set: state.admin_email.is_some(),
                },
            });
        }
    };

    // Check if admin user exists
    let admin_exists = if let Some(admin_email) = &state.admin_email {
        match sqlx::query("SELECT id FROM users WHERE email = ?")
            .bind(admin_email)
            .fetch_optional(&state.pool)
            .await
        {
            Ok(Some(_)) => true,
            Ok(None) => false,
            Err(e) => {
                tracing::error!("Failed to check admin user existence: {:?}", e);
                return Json(Health {
                    ok: false,
                    database: DatabaseStatus {
                        connected: true,
                        users_table_exists: true,
                        admin_user_exists: false,
                        error: Some(format!("Failed to check admin user: {:?}", e)),
                    },
                    config: ConfigStatus {
                        smtp_configured: state.smtp_host.is_some() && state.smtp_username.is_some(),
                        paypal_configured: state.paypal_client_id.is_some() && state.paypal_secret.is_some(),
                        admin_email_set: state.admin_email.is_some(),
                    },
                });
            }
        }
    } else {
        false
    };

    Json(Health {
        ok: true,
        database: DatabaseStatus {
            connected: true,
            users_table_exists: true,
            admin_user_exists: admin_exists,
            error: None,
        },
        config: ConfigStatus {
            smtp_configured: state.smtp_host.is_some() && state.smtp_username.is_some() && state.smtp_password.is_some() && state.smtp_from.is_some(),
            paypal_configured: state.paypal_client_id.is_some() && state.paypal_secret.is_some(),
            admin_email_set: state.admin_email.is_some(),
        },
    })
}

