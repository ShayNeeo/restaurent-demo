use axum::{routing::post, Json, Router, Extension};
use serde::{Deserialize, Serialize};
use std::sync::Arc;

use crate::{state::AppState, email::send_email};

#[derive(Deserialize)]
pub struct TestEmailRequest {
    pub to: String,
    pub subject: String,
    pub body: String,
}

#[derive(Serialize)]
pub struct TestEmailResponse {
    pub success: bool,
    pub message: String,
}

pub fn router() -> Router {
    Router::new().route("/api/test-email", post(send_test_email))
}

async fn send_test_email(
    Extension(state): Extension<Arc<AppState>>,
    Json(payload): Json<TestEmailRequest>,
) -> Json<TestEmailResponse> {
    // Basic email validation
    if payload.to.trim().is_empty() || !payload.to.contains('@') {
        return Json(TestEmailResponse {
            success: false,
            message: "Invalid email address".to_string(),
        });
    }

    if payload.subject.trim().is_empty() {
        return Json(TestEmailResponse {
            success: false,
            message: "Subject cannot be empty".to_string(),
        });
    }

    if payload.body.trim().is_empty() {
        return Json(TestEmailResponse {
            success: false,
            message: "Body cannot be empty".to_string(),
        });
    }

    // Check if SMTP is configured
    if state.smtp_host.is_none() || state.smtp_username.is_none() || state.smtp_password.is_none() || state.smtp_from.is_none() {
        tracing::error!("SMTP configuration incomplete");
        return Json(TestEmailResponse {
            success: false,
            message: "SMTP configuration incomplete. Please check environment variables: SMTP_HOST, SMTP_USERNAME, SMTP_PASSWORD, SMTP_FROM".to_string(),
        });
    }

    tracing::info!("Attempting to send test email to: {} (subject: {})", payload.to, payload.subject);

    // Send the email
    match send_email(&state, &payload.to, &payload.subject, &payload.body).await {
        Ok(_) => {
            tracing::info!("Test email sent successfully to {}", payload.to);
            Json(TestEmailResponse {
                success: true,
                message: "Email sent successfully".to_string(),
            })
        }
        Err(e) => {
            tracing::error!("Failed to send test email to {}: {:?}", payload.to, e);
            // The error message from the email module should now be more descriptive
            Json(TestEmailResponse {
                success: false,
                message: format!("Failed to send email: {}", e),
            })
        }
    }
}
