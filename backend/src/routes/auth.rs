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

#[derive(Deserialize)]
pub struct ResetPasswordRequest { pub email: String, pub new_password: String }

#[derive(Serialize)]
pub struct AuthResponse { pub token: String }

#[derive(Serialize)]
struct Claims { sub: String, email: String, exp: usize }

pub fn router() -> Router {
    Router::new()
        .route("/api/auth/signup", post(signup))
        .route("/api/auth/login", post(login))
        .route("/api/auth/reset-password", post(reset_password))
        .route("/api/auth/setup-admin", post(setup_admin))
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

async fn reset_password(Extension(state): Extension<Arc<AppState>>, Json(payload): Json<ResetPasswordRequest>) -> Result<Json<AuthResponse>, axum::http::StatusCode> {
    tracing::info!("Password reset attempt for email: {}", payload.email);

    // Check if user is admin
    let user = sqlx::query("SELECT role FROM users WHERE email = ?")
        .bind(&payload.email)
        .fetch_optional(&state.pool)
        .await
        .map_err(|_| axum::http::StatusCode::INTERNAL_SERVER_ERROR)?;

    let is_admin = match user {
        Some(u) => {
            let role: String = u.get("role");
            role == "admin"
        }
        None => {
            tracing::warn!("Password reset attempted for non-existent user: {}", payload.email);
            return Err(axum::http::StatusCode::NOT_FOUND);
        }
    };

    if !is_admin {
        tracing::warn!("Password reset denied for non-admin user: {}", payload.email);
        return Err(axum::http::StatusCode::FORBIDDEN);
    }

    // Validate password strength
    if payload.new_password.len() < 6 {
        tracing::warn!("Password reset failed: password too short");
        return Err(axum::http::StatusCode::BAD_REQUEST);
    }

    // Hash the new password
    let salt = SaltString::generate(&mut rand::thread_rng());

    let password_hash = match Argon2::default()
        .hash_password(payload.new_password.as_bytes(), &salt)
    {
        Ok(hash) => hash.to_string(),
        Err(e) => {
            tracing::error!("Failed to hash password: {:?}", e);
            return Err(axum::http::StatusCode::INTERNAL_SERVER_ERROR);
        }
    };


    // Update the password in database
    let result = sqlx::query(r#"UPDATE users SET password_hash = ? WHERE email = ?"#)
        .bind(&password_hash)
        .bind(&payload.email)
        .execute(&state.pool)
        .await;

    match result {
        Ok(exec_result) => {
            let rows_affected = exec_result.rows_affected();
            tracing::info!("Password update affected {} rows", rows_affected);

            if rows_affected == 0 {
                tracing::warn!("Password update affected 0 rows for email: {}", payload.email);
                return Err(axum::http::StatusCode::NOT_FOUND);
            }
        }
        Err(e) => {
            tracing::error!("Database error updating password: {:?}", e);
            return Err(axum::http::StatusCode::INTERNAL_SERVER_ERROR);
        }
    }

    // Issue new token
    let user = match sqlx::query("SELECT id FROM users WHERE email = ?")
        .bind(&payload.email)
        .fetch_one(&state.pool)
        .await
    {
        Ok(u) => u,
        Err(sqlx::Error::RowNotFound) => {
            tracing::error!("User not found after password update: {}", payload.email);
            return Err(axum::http::StatusCode::NOT_FOUND);
        }
        Err(e) => {
            tracing::error!("Database error fetching user after password update: {:?}", e);
            return Err(axum::http::StatusCode::INTERNAL_SERVER_ERROR);
        }
    };

    let user_id: String = match user.try_get("id") {
        Ok(id) => id,
        Err(e) => {
            tracing::error!("Failed to get user ID from database row: {:?}", e);
            return Err(axum::http::StatusCode::INTERNAL_SERVER_ERROR);
        }
    };

    let token = issue_jwt(&state, &user_id, &payload.email);
    tracing::info!("Password reset successful for user: {}", payload.email);

    Ok(Json(AuthResponse { token }))
}

async fn setup_admin(Extension(state): Extension<Arc<AppState>>, Json(payload): Json<SignupRequest>) -> Result<Json<AuthResponse>, axum::http::StatusCode> {
    tracing::info!("Admin setup attempt for email: {}", payload.email);

    // Check if user already exists
    let existing = sqlx::query("SELECT id, role FROM users WHERE email = ?")
        .bind(&payload.email)
        .fetch_optional(&state.pool)
        .await
        .map_err(|e| {
            tracing::error!("Database error checking user existence: {:?}", e);
            axum::http::StatusCode::INTERNAL_SERVER_ERROR
        })?;

    if let Some(user) = existing {
        tracing::info!("Admin user already exists, attempting login instead");
        // User exists, try to login instead
        return login(Extension(state), Json(LoginRequest {
            email: payload.email,
            password: payload.password,
        })).await;
    }

    // Create admin user
    let id = Uuid::new_v4().to_string();
    let salt = SaltString::generate(&mut rand::thread_rng());

    let password_hash = match Argon2::default()
        .hash_password(payload.password.as_bytes(), &salt)
    {
        Ok(hash) => hash.to_string(),
        Err(e) => {
            tracing::error!("Failed to hash password: {:?}", e);
            return Err(axum::http::StatusCode::INTERNAL_SERVER_ERROR);
        }
    };

    // Insert admin user - try with role first, fallback without if column doesn't exist
    let insert_result = sqlx::query(r#"INSERT INTO users (id, email, password_hash, role) VALUES (?, ?, ?, ?)"#)
        .bind(&id)
        .bind(&payload.email)
        .bind(&password_hash)
        .bind("admin")
        .execute(&state.pool)
        .await;

    match insert_result {
        Ok(_) => {
            tracing::info!("Admin user created successfully: {}", payload.email);
        }
        Err(sqlx::Error::ColumnNotFound(_)) => {
            // Role column doesn't exist, try without it
            tracing::info!("Role column not found, creating user without role");
            match sqlx::query(r#"INSERT INTO users (id, email, password_hash) VALUES (?, ?, ?)"#)
                .bind(&id)
                .bind(&payload.email)
                .bind(&password_hash)
                .execute(&state.pool)
                .await
            {
                Ok(_) => {
                    tracing::info!("Admin user created successfully (without role): {}", payload.email);
                }
                Err(e) => {
                    tracing::error!("Failed to create admin user (without role): {:?}", e);
                    return Err(axum::http::StatusCode::INTERNAL_SERVER_ERROR);
                }
            }
        }
        Err(e) => {
            tracing::error!("Failed to create admin user: {:?}", e);
            return Err(axum::http::StatusCode::INTERNAL_SERVER_ERROR);
        }
    }

    let token = issue_jwt(&state, &id, &payload.email);
    tracing::info!("Admin setup successful for user: {}", payload.email);

    Ok(Json(AuthResponse { token }))
}

fn issue_jwt(state: &AppState, user_id: &str, email: &str) -> String {
    let exp = (chrono::Utc::now() + chrono::Duration::days(7)).timestamp() as usize;
    let claims = Claims { sub: user_id.to_string(), email: email.to_string(), exp };
    encode(&Header::default(), &claims, &EncodingKey::from_secret(state.jwt_secret.as_bytes())).unwrap_or_default()
}


