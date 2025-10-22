use crate::state::AppState;
use anyhow::Result;
use lettre::{Message, SmtpTransport, Transport};

pub async fn send_email(state: &AppState, to: &str, subject: &str, body: &str) -> Result<()> {
    let from = state.smtp_from.as_ref().ok_or_else(|| anyhow::anyhow!("smtp from not set"))?;
    let host = state.smtp_host.as_ref().ok_or_else(|| anyhow::anyhow!("smtp host not set"))?;
    let port = state.smtp_port.unwrap_or(587);
    let username = state.smtp_username.as_ref().ok_or_else(|| anyhow::anyhow!("smtp username not set"))?;
    let password = state.smtp_password.as_ref().ok_or_else(|| anyhow::anyhow!("smtp password not set"))?;

    tracing::info!("Sending email to {} with subject: {}", to, subject);

    let email = Message::builder()
        .from(from.parse()?)
        .to(to.parse()?)
        .subject(subject)
        .body(body.to_string())?;

    let mailer = SmtpTransport::relay(host)?
        .port(port)
        .credentials(lettre::transport::smtp::authentication::Credentials::new(username.clone(), password.clone()))
        .build();

    match mailer.send(&email) {
        Ok(_) => {
            tracing::info!("Email sent successfully to {}", to);
            Ok(())
        }
        Err(e) => {
            tracing::error!("Failed to send email to {}: {:?}", to, e);
            Err(anyhow::anyhow!("Email send failed: {:?}", e))
        }
    }
}

