use sqlx::{sqlite::SqlitePool, Pool, Sqlite};

pub async fn init_pool(database_url: &str) -> anyhow::Result<SqlitePool> {
    let pool: Pool<Sqlite> = SqlitePool::connect(database_url).await?;
    // Run migrations (requires `backend/migrations`)
    sqlx::migrate!("./migrations").run(&pool).await?;
    Ok(pool)
}

