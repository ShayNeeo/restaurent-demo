use crate::state::AppState;
use anyhow::Result;
use lettre::{Message, SmtpTransport, Transport};
use lettre::transport::smtp::authentication::Credentials;

pub async fn send_email(state: &AppState, to: &str, subject: &str, body: &str) -> Result<()> {
    send_email_with_html(state, to, subject, body, false).await
}

#[allow(dead_code)]
pub async fn send_html_email(state: &AppState, to: &str, subject: &str, html_body: &str) -> Result<()> {
    send_email_with_html(state, to, subject, html_body, true).await
}

async fn send_email_with_html(state: &AppState, to: &str, subject: &str, body: &str, is_html: bool) -> Result<()> {
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

    tracing::info!("Attempting to send {} email to {} via {}:{} (from: {})", 
        if is_html { "HTML" } else { "text" }, to, host, port, from);

    // Build email with appropriate content type
    let content_type = if is_html {
        lettre::message::header::ContentType::TEXT_HTML
    } else {
        lettre::message::header::ContentType::TEXT_PLAIN
    };

    let email = match Message::builder()
        .from(from.parse()?)
        .to(to.parse()?)
        .subject(subject)
        .singlepart(
            lettre::message::SinglePart::builder()
                .header(content_type)
                .body(body.to_string())
        )
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

// HTML Email Templates
#[allow(dead_code)]
pub fn order_confirmation_html(order_id: &str, email: &str, items_html: &str, subtotal: f64, discount: f64, total: f64, app_url: &str) -> String {
    format!(
        r#"<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body {{ font-family: 'DM Sans', Arial, sans-serif; background: #111827; color: #fff; margin: 0; padding: 20px; }}
        .container {{ max-width: 600px; margin: 0 auto; background: #1f2937; border-radius: 12px; overflow: hidden; border: 1px solid #374151; }}
        .header {{ background: linear-gradient(135deg, #ffd700 0%, #f59517 100%); padding: 30px 20px; text-align: center; }}
        .header h1 {{ margin: 0; color: #000; font-size: 28px; }}
        .content {{ padding: 30px 20px; }}
        .order-id {{ background: #111827; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center; }}
        .order-id label {{ color: #9ca3af; font-size: 12px; display: block; margin-bottom: 5px; }}
        .order-id value {{ color: #ffd700; font-size: 18px; font-weight: 700; display: block; }}
        table {{ width: 100%; border-collapse: collapse; margin: 20px 0; }}
        th, td {{ padding: 12px; text-align: left; border-bottom: 1px solid #374151; }}
        th {{ background: #111827; color: #ffd700; font-weight: 700; }}
        .totals {{ margin: 20px 0; padding: 20px 0; border-top: 2px solid #374151; border-bottom: 2px solid #374151; }}
        .total-row {{ display: flex; justify-content: space-between; margin: 8px 0; }}
        .grand-total {{ font-size: 20px; font-weight: 700; color: #ffd700; margin-top: 12px; }}
        .footer {{ background: #111827; padding: 20px; text-align: center; color: #9ca3af; font-size: 12px; }}
        .button {{ display: inline-block; background: #ffd700; color: #000; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 700; margin-top: 20px; }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>✓ Order Confirmed</h1>
        </div>
        <div class="content">
            <p>Thank you for your order!</p>
            
            <div class="order-id">
                <label>ORDER ID</label>
                <value>{}</value>
            </div>
            
            <p style="color: #9ca3af; font-size: 14px;">
                <strong>Email:</strong> {}<br>
                <strong>Date:</strong> {}
            </p>
            
            <h3 style="color: #ffd700; margin-top: 20px;">Items Ordered:</h3>
            <table>
                <thead>
                    <tr>
                        <th>Item</th>
                        <th>Qty</th>
                        <th>Price</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
                    {}
                </tbody>
            </table>
            
            <div class="totals">
                <div class="total-row">
                    <span>Subtotal:</span>
                    <span>€{:.2}</span>
                </div>
                {}
                <div class="total-row grand-total">
                    <span>Total Paid:</span>
                    <span>€{:.2}</span>
                </div>
            </div>
            
            <p style="text-align: center; color: #9ca3af; font-size: 14px;">
                A confirmation email has been sent. You can view your complete invoice anytime.
            </p>
            
            <div style="text-align: center;">
                <a href="{}/thank-you/{}" class="button">View Invoice</a>
            </div>
        </div>
        <div class="footer">
            <p style="margin: 0;">Thank you for your order!</p>
        </div>
    </div>
</body>
</html>"#,
        order_id,
        email,
        chrono::Local::now().format("%B %d, %Y"),
        items_html,
        subtotal,
        if discount > 0.01 { format!("<div class=\"total-row\" style=\"color: #ffd700;\"><span>Discount:</span><span>-€{:.2}</span></div>", discount) } else { String::new() },
        total,
        app_url,
        order_id
    )
}

#[allow(dead_code)]
pub fn gift_coupon_html(code: &str, value: f64, _email: &str, app_url: &str) -> String {
    format!(
        r#"<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body {{ font-family: 'DM Sans', Arial, sans-serif; background: #111827; color: #fff; margin: 0; padding: 20px; }}
        .container {{ max-width: 600px; margin: 0 auto; background: #1f2937; border-radius: 12px; overflow: hidden; border: 1px solid #374151; }}
        .header {{ background: linear-gradient(135deg, #ffd700 0%, #f59517 100%); padding: 30px 20px; text-align: center; }}
        .header h1 {{ margin: 0; color: #000; font-size: 28px; }}
        .content {{ padding: 30px 20px; }}
        .coupon-box {{ background: #111827; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; border: 2px dashed #ffd700; }}
        .coupon-label {{ color: #9ca3af; font-size: 12px; text-transform: uppercase; margin-bottom: 10px; }}
        .coupon-code {{ color: #ffd700; font-size: 24px; font-weight: 700; font-family: monospace; letter-spacing: 2px; margin: 10px 0; }}
        .coupon-value {{ color: #10b981; font-size: 18px; margin-top: 10px; }}
        .highlight {{ background: #ffd70022; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #ffd700; }}
        .button {{ display: inline-block; background: #ffd700; color: #000; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 700; margin-top: 20px; }}
        .footer {{ background: #111827; padding: 20px; text-align: center; color: #9ca3af; font-size: 12px; }}
        .bullet {{ margin: 10px 0; padding-left: 20px; }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎁 Gift Coupon</h1>
        </div>
        <div class="content">
            <p>Thank you for your gift coupon purchase!</p>
            
            <div class="coupon-box">
                <div class="coupon-label">Your Coupon Code</div>
                <div class="coupon-code">{}</div>
                <div class="coupon-value">Value: €{:.2}</div>
            </div>
            
            <div class="highlight">
                <strong>✨ 10% Bonus Applied!</strong><br>
                You purchased €{:.2} and received €{:.2} in coupon value.
            </div>
            
            <h3 style="color: #ffd700;">How to Use Your Coupon:</h3>
            <div class="bullet">1. Add items to your cart on our menu</div>
            <div class="bullet">2. Enter code <strong style="color: #ffd700;">{}</strong> at checkout</div>
            <div class="bullet">3. Your coupon value will be applied to your order</div>
            <div class="bullet">4. If your coupon value is more than your order total, the remaining balance is saved for next time!</div>
            
            <p style="color: #9ca3af; font-size: 14px; margin-top: 20px;">
                <strong>Expires:</strong> No expiration - use anytime!<br>
                <strong>Transferable:</strong> Share with friends and family
            </p>
            
            <div style="text-align: center;">
                <a href="{}/menu" class="button">Start Shopping</a>
            </div>
        </div>
        <div class="footer">
            <p style="margin: 0;">Keep your coupon code safe and secure!</p>
        </div>
    </div>
</body>
</html>"#,
        code,
        value,
        value / 1.1,  // base amount
        value,
        code,
        app_url
    )
}

