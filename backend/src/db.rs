use sqlx::{sqlite::SqlitePool, Pool, Sqlite};

pub async fn init_pool(database_url: &str) -> anyhow::Result<SqlitePool> {
    let pool: Pool<Sqlite> = SqlitePool::connect(database_url).await?;
    // Run migrations (requires `backend/migrations`)
    sqlx::migrate!("./migrations").run(&pool).await?;
    Ok(pool)
}

/// Cleanup stale pending orders/gifts older than 24 hours
pub async fn cleanup_stale_pending(pool: &SqlitePool) -> anyhow::Result<()> {
    // Delete pending orders older than 24 hours
    let _ = sqlx::query(r#"DELETE FROM pending_orders WHERE datetime(created_at) < datetime('now', '-24 hours')"#)
        .execute(pool)
        .await?;
    
    // Delete pending gifts older than 24 hours
    let _ = sqlx::query(r#"DELETE FROM pending_gifts WHERE datetime(created_at) < datetime('now', '-24 hours')"#)
        .execute(pool)
        .await?;
    
    tracing::info!("Cleaned up stale pending orders and gifts");
    Ok(())
}

