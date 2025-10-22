use axum::{routing::post, Json, Router, Extension};
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use uuid::Uuid;
use argon2::{Argon2, password_hash::{PasswordHasher, SaltString, PasswordVerifier, PasswordHash}};
use jsonwebtoken::{encode, Header, EncodingKey};
use sqlx::Row;

use crate::state::AppState;

#[derive(Deserialize)]
pub struct SignupRequest { pub email: String, pub password: String }

#[derive(Deserialize)]
pub struct LoginRequest { pub email: String, pub password: String }

#[derive(Serialize)]
pub struct AuthResponse { pub token: String }

#[derive(Serialize)]
struct Claims { sub: String, email: String, exp: usize }

pub fn router() -> Router {
    Router::new()
        .route("/api/auth/signup", post(signup))
        .route("/api/auth/login", post(login))
}

async fn signup(Extension(state): Extension<Arc<AppState>>, Json(payload): Json<SignupRequest>) -> Result<Json<AuthResponse>, axum::http::StatusCode> {
    // Check if user already exists
    let existing = sqlx::query("SELECT id FROM users WHERE email = ?")
        .bind(&payload.email)
        .fetch_optional(&state.pool)
        .await
        .map_err(|_| axum::http::StatusCode::INTERNAL_SERVER_ERROR)?;

    if existing.is_some() {
        return Err(axum::http::StatusCode::CONFLICT);
    }

    let id = Uuid::new_v4().to_string();
    let salt = SaltString::generate(&mut rand::thread_rng());
    let password_hash = Argon2::default()
        .hash_password(payload.password.as_bytes(), &salt)
        .map_err(|_| axum::http::StatusCode::INTERNAL_SERVER_ERROR)?
        .to_string();

    sqlx::query(r#"INSERT INTO users (id, email, password_hash) VALUES (?, ?, ?)"#)
        .bind(&id)
        .bind(&payload.email)
        .bind(&password_hash)
        .execute(&state.pool)
        .await
        .map_err(|_| axum::http::StatusCode::INTERNAL_SERVER_ERROR)?;

    let token = issue_jwt(&state, &id, &payload.email);
    Ok(Json(AuthResponse { token }))
}

async fn login(Extension(state): Extension<Arc<AppState>>, Json(payload): Json<LoginRequest>) -> Result<Json<AuthResponse>, axum::http::StatusCode> {
    let user = sqlx::query("SELECT id, email, password_hash FROM users WHERE email = ?")
        .bind(&payload.email)
        .fetch_optional(&state.pool)
        .await
        .map_err(|_| axum::http::StatusCode::INTERNAL_SERVER_ERROR)?;

    match user {
        Some(u) => {
            let uid: String = u.get("id");
            let uemail: String = u.get("email");
            let upw: String = u.get("password_hash");
            let parsed_hash = PasswordHash::new(&upw).map_err(|_| axum::http::StatusCode::INTERNAL_SERVER_ERROR)?;

            if Argon2::default().verify_password(payload.password.as_bytes(), &parsed_hash).is_ok() {
                let token = issue_jwt(&state, &uid, &uemail);
                Ok(Json(AuthResponse { token }))
            } else {
                Err(axum::http::StatusCode::UNAUTHORIZED)
            }
        }
        None => Err(axum::http::StatusCode::UNAUTHORIZED)
    }
}

fn issue_jwt(state: &AppState, user_id: &str, email: &str) -> String {
    let exp = (chrono::Utc::now() + chrono::Duration::days(7)).timestamp() as usize;
    let claims = Claims { sub: user_id.to_string(), email: email.to_string(), exp };
    encode(&Header::default(), &claims, &EncodingKey::from_secret(state.jwt_secret.as_bytes())).unwrap_or_default()
}


