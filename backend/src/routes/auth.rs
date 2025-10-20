use axum::{routing::post, Json, Router, extract::State};
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use uuid::Uuid;
use argon2::{Argon2, password_hash::{PasswordHasher, SaltString, PasswordVerifier, PasswordHash}};
use jsonwebtoken::{encode, Header, EncodingKey};

use crate::state::AppState;

#[derive(Deserialize)]
pub struct SignupRequest { pub email: String, pub password: String }

#[derive(Deserialize)]
pub struct LoginRequest { pub email: String, pub password: String }

#[derive(Serialize)]
pub struct AuthResponse { pub token: String }

#[derive(Serialize)]
struct Claims { sub: String, email: String, exp: usize }

pub fn router() -> Router<Arc<AppState>> {
    Router::new()
        .route("/api/auth/signup", post(signup))
        .route("/api/auth/login", post(login))
}

async fn signup(State(state): State<Arc<AppState>>, Json(payload): Json<SignupRequest>) -> Json<AuthResponse> {
    let id = Uuid::new_v4().to_string();
    let salt = SaltString::generate(&mut rand::thread_rng());
    let password_hash = Argon2::default().hash_password(payload.password.as_bytes(), &salt).unwrap().to_string();
    let _ = sqlx::query!(
        r#"INSERT INTO users (id, email, password_hash) VALUES (?, ?, ?)"#,
        id,
        payload.email,
        password_hash
    )
    .execute(&state.pool)
    .await;
    let token = issue_jwt(&state, &id, &payload.email);
    Json(AuthResponse { token })
}

async fn login(State(state): State<Arc<AppState>>, Json(payload): Json<LoginRequest>) -> Json<AuthResponse> {
    let user = sqlx::query!("SELECT id, email, password_hash FROM users WHERE email = ?", payload.email)
        .fetch_optional(&state.pool)
        .await
        .unwrap();
    if let Some(u) = user {
        let parsed_hash = PasswordHash::new(&u.password_hash).unwrap();
        if Argon2::default().verify_password(payload.password.as_bytes(), &parsed_hash).is_ok() {
            let token = issue_jwt(&state, &u.id, &u.email);
            return Json(AuthResponse { token });
        }
    }
    Json(AuthResponse { token: String::new() })
}

fn issue_jwt(state: &AppState, user_id: &str, email: &str) -> String {
    let exp = (chrono::Utc::now() + chrono::Duration::days(7)).timestamp() as usize;
    let claims = Claims { sub: user_id.to_string(), email: email.to_string(), exp };
    encode(&Header::default(), &claims, &EncodingKey::from_secret(state.jwt_secret.as_bytes())).unwrap_or_default()
}


