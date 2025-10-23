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
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        * {{ margin: 0; padding: 0; box-sizing: border-box; }}
        body {{
            font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: #0a0a0a;
            color: #fff;
            line-height: 1.6;
        }}
        .container {{
            max-width: 600px;
            margin: 0 auto;
            background: linear-gradient(135deg, #1a1a1a 0%, #0f0f0f 100%);
            border: 1px solid #2a2a2a;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
        }}
        .header {{
            background: linear-gradient(135deg, #c4a747 0%, #d4b757 100%);
            padding: 40px 20px;
            text-align: center;
        }}
        .header h1 {{
            margin: 0;
            color: #000;
            font-family: 'Forum', cursive;
            font-size: 32px;
            font-weight: 700;
            letter-spacing: 2px;
        }}
        .content {{
            padding: 40px 30px;
        }}
        .order-id-box {{
            background: #1a1a1a;
            border: 2px solid #c4a747;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
            text-align: center;
        }}
        .order-id-label {{
            color: #999;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 2px;
            margin-bottom: 8px;
            display: block;
        }}
        .order-id-value {{
            color: #c4a747;
            font-size: 20px;
            font-weight: 700;
            font-family: 'Courier New', monospace;
            letter-spacing: 1px;
        }}
        .info-line {{
            color: #b8b8b8;
            font-size: 13px;
            margin: 8px 0;
            line-height: 1.6;
        }}
        .section-title {{
            color: #c4a747;
            font-size: 18px;
            font-weight: 700;
            margin: 30px 0 15px 0;
            letter-spacing: 1px;
        }}
        table {{
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }}
        thead {{
            background: #1a1a1a;
            border-bottom: 2px solid #c4a747;
        }}
        th {{
            padding: 12px;
            text-align: left;
            color: #c4a747;
            font-weight: 700;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }}
        td {{
            padding: 12px;
            border-bottom: 1px solid #2a2a2a;
            color: #ddd;
        }}
        .totals {{
            margin: 30px 0;
            padding: 20px 0;
            border-top: 2px solid #2a2a2a;
            border-bottom: 2px solid #2a2a2a;
        }}
        .total-row {{
            display: flex;
            justify-content: space-between;
            margin: 12px 0;
            color: #b8b8b8;
            font-size: 14px;
        }}
        .total-row.grand-total {{
            font-size: 18px;
            font-weight: 700;
            color: #c4a747;
            margin-top: 15px;
            padding-top: 15px;
            border-top: 1px solid #2a2a2a;
        }}
        .total-row.discount {{
            color: #4ade80;
        }}
        .cta-button {{
            display: inline-block;
            background: linear-gradient(135deg, #c4a747 0%, #d4b757 100%);
            color: #000;
            padding: 14px 32px;
            border-radius: 8px;
            text-decoration: none;
            font-weight: 700;
            letter-spacing: 1px;
            margin-top: 25px;
            font-size: 14px;
            text-transform: uppercase;
            transition: transform 0.3s ease;
        }}
        .cta-button:hover {{
            transform: scale(1.05);
        }}
        .footer {{
            background: #1a1a1a;
            padding: 25px;
            text-align: center;
            color: #999;
            font-size: 12px;
            border-top: 1px solid #2a2a2a;
        }}
        .footer p {{ margin: 0; }}
        .divider {{ height: 1px; background: #2a2a2a; margin: 30px 0; }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>✓ Order Confirmed</h1>
        </div>
        <div class="content">
            <p style="color: #c8c8c8; font-size: 15px; margin-bottom: 15px;">
                Thank you for your order! We're preparing it now.
            </p>

            <div class="order-id-box">
                <span class="order-id-label">Order ID</span>
                <div class="order-id-value">{}</div>
            </div>

            <div class="info-line"><strong>Email:</strong> {}</div>
            <div class="info-line"><strong>Date:</strong> {}</div>

            <h3 class="section-title">Items Ordered</h3>
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

            <p style="text-align: center; color: #999; font-size: 13px; margin: 20px 0;">
                A confirmation email has been sent. You can view your complete invoice anytime.
            </p>

            <div style="text-align: center;">
                <a href="{}/thank-you/{}" class="cta-button">View Invoice</a>
            </div>
        </div>
        <div class="footer">
            <p style="margin-bottom: 8px;">Thank you for dining with us!</p>
            <p style="color: #666; font-size: 11px;">© {} - All Rights Reserved</p>
        </div>
    </div>
</body>
</html>"#,
        order_id,
        email,
        chrono::Local::now().format("%B %d, %Y").to_string(),
        items_html,
        subtotal,
        if discount > 0.01 { 
            format!("<div class=\"total-row discount\"><span>Discount:</span><span>-€{:.2}</span></div>", discount) 
        } else { 
            String::new() 
        },
        total,
        app_url,
        order_id,
        chrono::Local::now().format("%Y").to_string()
    )
}

#[allow(dead_code)]
pub fn gift_coupon_html(code: &str, value: f64, _email: &str, app_url: &str) -> String {
    format!(
        r#"<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        * {{ margin: 0; padding: 0; box-sizing: border-box; }}
        body {{
            font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: #0a0a0a;
            color: #fff;
            line-height: 1.6;
        }}
        .container {{
            max-width: 600px;
            margin: 0 auto;
            background: linear-gradient(135deg, #1a1a1a 0%, #0f0f0f 100%);
            border: 1px solid #2a2a2a;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
        }}
        .header {{
            background: linear-gradient(135deg, #c4a747 0%, #d4b757 100%);
            padding: 40px 20px;
            text-align: center;
        }}
        .header h1 {{
            margin: 0;
            color: #000;
            font-family: 'Forum', cursive;
            font-size: 36px;
            font-weight: 700;
            letter-spacing: 2px;
        }}
        .content {{
            padding: 40px 30px;
        }}
        .coupon-display {{
            background: #1a1a1a;
            border: 3px dashed #c4a747;
            border-radius: 12px;
            padding: 30px;
            margin: 30px 0;
            text-align: center;
        }}
        .coupon-label {{
            color: #999;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 2px;
            margin-bottom: 15px;
            display: block;
        }}
        .coupon-code {{
            color: #c4a747;
            font-size: 28px;
            font-weight: 700;
            font-family: 'Courier New', monospace;
            letter-spacing: 3px;
            word-break: break-all;
            margin: 15px 0;
            padding: 15px;
            background: rgba(0, 0, 0, 0.3);
            border-radius: 8px;
        }}
        .coupon-value {{
            color: #4ade80;
            font-size: 24px;
            font-weight: 700;
            margin-top: 15px;
        }}
        .highlight-box {{
            background: #1a1a1a;
            border-left: 4px solid #c4a747;
            padding: 20px;
            border-radius: 8px;
            margin: 25px 0;
            color: #ddd;
            font-size: 14px;
        }}
        .highlight-box strong {{
            color: #c4a747;
        }}
        .section-title {{
            color: #c4a747;
            font-size: 18px;
            font-weight: 700;
            margin: 30px 0 15px 0;
            letter-spacing: 1px;
        }}
        .instruction-list {{
            list-style: none;
            padding: 0;
            margin: 15px 0;
        }}
        .instruction-list li {{
            color: #b8b8b8;
            margin: 12px 0;
            padding-left: 30px;
            position: relative;
            font-size: 14px;
        }}
        .instruction-list li:before {{
            content: "→";
            position: absolute;
            left: 0;
            color: #c4a747;
            font-weight: 700;
        }}
        .info-box {{
            background: #1a1a1a;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
            color: #b8b8b8;
            font-size: 13px;
            line-height: 1.8;
        }}
        .info-box strong {{
            color: #ddd;
        }}
        .cta-button {{
            display: inline-block;
            background: linear-gradient(135deg, #c4a747 0%, #d4b757 100%);
            color: #000;
            padding: 14px 32px;
            border-radius: 8px;
            text-decoration: none;
            font-weight: 700;
            letter-spacing: 1px;
            margin-top: 25px;
            font-size: 14px;
            text-transform: uppercase;
            transition: transform 0.3s ease;
        }}
        .cta-button:hover {{
            transform: scale(1.05);
        }}
        .footer {{
            background: #1a1a1a;
            padding: 25px;
            text-align: center;
            color: #999;
            font-size: 12px;
            border-top: 1px solid #2a2a2a;
        }}
        .footer p {{ margin: 0; }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎁 Gift Coupon</h1>
        </div>
        <div class="content">
            <p style="color: #c8c8c8; font-size: 15px; margin-bottom: 15px;">
                Thank you for your gift coupon purchase! Here's your exclusive coupon code.
            </p>

            <div class="coupon-display">
                <span class="coupon-label">Your Coupon Code</span>
                <div class="coupon-code">{}</div>
                <div class="coupon-value">Value: €{:.2}</div>
            </div>

            <div class="highlight-box">
                <strong>✨ 10% Bonus Applied!</strong><br>
                You purchased €{:.2} and received <strong>€{:.2}</strong> in total coupon value.
            </div>

            <h3 class="section-title">How to Use Your Coupon</h3>
            <ul class="instruction-list">
                <li>Browse our delicious menu at <strong>{}/menu</strong></li>
                <li>Add items to your cart</li>
                <li>At checkout, enter code <strong>{}</strong></li>
                <li>Your coupon value will be applied to your order</li>
                <li>If your coupon exceeds your order total, the remaining balance is saved for next time!</li>
            </ul>

            <div class="info-box">
                <strong>📌 Important Details:</strong><br>
                • <strong>Expires:</strong> Never - use anytime you want<br>
                • <strong>Transferable:</strong> Share with friends and family<br>
                • <strong>No Restrictions:</strong> Use on any menu items
            </div>

            <div style="text-align: center;">
                <a href="{}/menu" class="cta-button">Start Shopping Now</a>
            </div>
        </div>
        <div class="footer">
            <p style="margin-bottom: 8px;">Keep your coupon code safe and secure!</p>
            <p style="color: #666; font-size: 11px;">© {} - All Rights Reserved</p>
        </div>
    </div>
</body>
</html>"#,
        code,
        value,
        value / 1.1,  // base amount
        value,
        app_url,
        code,
        app_url,
        chrono::Local::now().format("%Y").to_string()
    )
}

