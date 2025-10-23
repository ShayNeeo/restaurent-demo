use sqlx::sqlite::SqlitePool;

#[derive(Clone)]
pub struct AppState {
    pub pool: SqlitePool,
    pub jwt_secret: String,
    pub app_url: String,
    pub smtp_host: Option<String>,
    pub smtp_port: Option<u16>,
    pub smtp_username: Option<String>,
    pub smtp_password: Option<String>,
    pub smtp_from: Option<String>,
    pub paypal_client_id: Option<String>,
    pub paypal_secret: Option<String>,
    pub paypal_api_base: String,
    pub admin_email: Option<String>,
}

