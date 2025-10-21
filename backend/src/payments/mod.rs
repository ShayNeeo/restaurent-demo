use serde::{Deserialize, Serialize};
use anyhow::Result;

use crate::state::AppState;

#[derive(Serialize)]
struct PayPalOrderAmount { currency_code: String, value: String }

#[derive(Serialize)]
struct PayPalPurchaseUnit { amount: PayPalOrderAmount, description: Option<String> }

#[derive(Serialize)]
struct PayPalOrderCreate { intent: String, purchase_units: Vec<PayPalPurchaseUnit>, application_context: PayPalAppCtx }

#[derive(Serialize)]
struct PayPalAppCtx { return_url: String, cancel_url: String }

#[derive(Deserialize)]
struct PayPalTokenResp { access_token: String, token_type: String }

#[derive(Deserialize)]
pub struct PayPalOrderLink { pub rel: String, pub href: String }

#[derive(Deserialize)]
pub struct PayPalOrderResp { pub id: String, pub links: Vec<PayPalOrderLink> }

pub async fn get_paypal_access_token(state: &AppState) -> Result<String> {
    let client_id = state.paypal_client_id.as_ref().ok_or_else(|| anyhow::anyhow!("missing paypal client id"))?;
    let secret = state.paypal_secret.as_ref().ok_or_else(|| anyhow::anyhow!("missing paypal secret"))?;
    let url = format!("{}/v1/oauth2/token", state.paypal_api_base);
    let resp = reqwest::Client::new()
        .post(url)
        .basic_auth(client_id, Some(secret))
        .form(&[("grant_type", "client_credentials")])
        .send().await?;
    let body: PayPalTokenResp = resp.json().await?;
    Ok(format!("{} {}", body.token_type, body.access_token))
}

pub async fn create_paypal_order(state: &AppState, value_eur: i64, return_path: &str, cancel_path: &str, description: Option<String>) -> Result<PayPalOrderResp> {
    let bearer = get_paypal_access_token(state).await?;
    let url = format!("{}/v2/checkout/orders", state.paypal_api_base);
    let body = PayPalOrderCreate {
        intent: "CAPTURE".into(),
        purchase_units: vec![PayPalPurchaseUnit {
            amount: PayPalOrderAmount { currency_code: "EUR".into(), value: format!("{}.{:02}", value_eur / 100, value_eur % 100) },
            description,
        }],
        application_context: PayPalAppCtx {
            return_url: format!("{}{}", state.app_url, return_path),
            cancel_url: format!("{}{}", state.app_url, cancel_path),
        }
    };
    let resp = reqwest::Client::new()
        .post(url)
        .bearer_auth(bearer.trim_start_matches("Bearer "))
        .json(&body)
        .send().await?;
    let body: PayPalOrderResp = resp.json().await?;
    Ok(body)
}

pub fn find_approval_url(order: &PayPalOrderResp) -> Option<String> {
    order.links.iter().find(|l| l.rel == "approve").map(|l| l.href.clone())
}

#[derive(Deserialize)]
struct PayPalCaptureResp { id: String, status: String }

pub async fn capture_paypal_order(state: &AppState, order_id: &str) -> Result<PayPalCaptureResp> {
    let bearer = get_paypal_access_token(state).await?;
    let url = format!("{}/v2/checkout/orders/{}/capture", state.paypal_api_base, order_id);
    let resp = reqwest::Client::new()
        .post(url)
        .bearer_auth(bearer.trim_start_matches("Bearer "))
        .send().await?;
    let body: PayPalCaptureResp = resp.json().await?;
    Ok(body)
}

