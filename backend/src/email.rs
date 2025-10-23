use crate::state::AppState;
use anyhow::Result;
use lettre::{Message, SmtpTransport, Transport};
use lettre::transport::smtp::authentication::Credentials;

pub async fn send_email(state: &AppState, to: &str, subject: &str, body: &str) -> Result<()> {
    // Check if SMTP is configured
    let from = match state.smtp_from.as_ref() {
        Some(f) => f,
        None => {
            tracing::error!("SMTP_FROM not configured");
            return Err(anyhow::anyhow!("SMTP configuration incomplete: missing FROM address"));
        }
    };

    let host = match state.smtp_host.as_ref() {
        Some(h) => h,
        None => {
            tracing::error!("SMTP_HOST not configured");
            return Err(anyhow::anyhow!("SMTP configuration incomplete: missing HOST"));
        }
    };

    let port = state.smtp_port.unwrap_or(587);
    let username = match state.smtp_username.as_ref() {
        Some(u) => u,
        None => {
            tracing::error!("SMTP_USERNAME not configured");
            return Err(anyhow::anyhow!("SMTP configuration incomplete: missing USERNAME"));
        }
    };

    let password = match state.smtp_password.as_ref() {
        Some(p) => p,
        None => {
            tracing::error!("SMTP_PASSWORD not configured");
            return Err(anyhow::anyhow!("SMTP configuration incomplete: missing PASSWORD"));
        }
    };

    tracing::info!("Attempting to send email to {} via {}:{} (from: {})", to, host, port, from);

    // Build email message
    let email = match Message::builder()
        .from(from.parse()?)
        .to(to.parse()?)
        .subject(subject)
        .body(body.to_string())
    {
        Ok(msg) => msg,
        Err(e) => {
            tracing::error!("Failed to build email message: {:?}", e);
            return Err(anyhow::anyhow!("Failed to build email message: {:?}", e));
        }
    };

    // Build SMTP transport with proper error handling
    let mailer = match SmtpTransport::relay(host) {
        Ok(transport) => transport.port(port),
        Err(e) => {
            tracing::error!("Failed to create SMTP transport for {}: {:?}", host, e);
            return Err(anyhow::anyhow!("Failed to create SMTP transport: {:?}", e));
        }
    };

    let mailer = mailer
        .credentials(Credentials::new(username.clone(), password.clone()))
        .build();

    // Send email
    match mailer.send(&email) {
        Ok(_) => {
            tracing::info!("Email sent successfully to {}", to);
            Ok(())
        }
        Err(e) => {
            tracing::error!("Failed to send email to {} via SMTP: {:?}", to, e);
            tracing::error!("SMTP Error details - Host: {}, Port: {}, Username: {}", host, port, username);

            // Check for specific error types
            let error_msg = if e.to_string().contains("authentication") {
                "SMTP authentication failed. Please check username and password."
            } else if e.to_string().contains("connection") {
                "SMTP connection failed. Please check host and port."
            } else if e.to_string().contains("tls") {
                "SMTP TLS/SSL connection failed. Please check security settings."
            } else {
                "Unknown SMTP error occurred."
            };

            Err(anyhow::anyhow!("{} Original error: {:?}", error_msg, e))
        }
    }
}

