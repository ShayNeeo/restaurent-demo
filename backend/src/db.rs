use sqlx::{sqlite::SqlitePool, Pool, Row, Sqlite};

const PRAGMA_TEMPLATE: &str = "PRAGMA table_info({table})";

pub async fn init_pool(database_url: &str) -> anyhow::Result<SqlitePool> {
    let pool: Pool<Sqlite> = SqlitePool::connect(database_url).await?;
    // Run migrations (requires `backend/migrations`)
    sqlx::migrate!("./migrations").run(&pool).await?;
    ensure_legacy_schema(&pool).await?;
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

async fn ensure_legacy_schema(pool: &SqlitePool) -> anyhow::Result<()> {
    ensure_orders_currency(pool).await?;
    ensure_orders_status(pool).await?;
    ensure_gift_codes_id(pool).await?;
    Ok(())
}

async fn column_exists(pool: &SqlitePool, table: &str, column: &str) -> anyhow::Result<bool> {
    let pragma = PRAGMA_TEMPLATE.replace("{table}", table);
    let rows = sqlx::query(&pragma).fetch_all(pool).await?;
    Ok(rows.iter().any(|row| row.try_get::<String, _>("name").map_or(false, |name| name == column)))
}

async fn ensure_orders_currency(pool: &SqlitePool) -> anyhow::Result<()> {
    if !column_exists(pool, "orders", "currency").await? {
        sqlx::query(r#"ALTER TABLE orders ADD COLUMN currency TEXT NOT NULL DEFAULT 'EUR'"#)
            .execute(pool)
            .await?;
        sqlx::query(r#"UPDATE orders SET currency = COALESCE(currency, 'EUR')"#)
            .execute(pool)
            .await?;
    }
    Ok(())
}

async fn ensure_orders_status(pool: &SqlitePool) -> anyhow::Result<()> {
    if !column_exists(pool, "orders", "status").await? {
        sqlx::query(r#"ALTER TABLE orders ADD COLUMN status TEXT NOT NULL DEFAULT 'pending'"#)
            .execute(pool)
            .await?;
        sqlx::query(r#"UPDATE orders SET status = COALESCE(status, 'completed')"#)
            .execute(pool)
            .await?;
    }
    Ok(())
}

async fn ensure_gift_codes_id(pool: &SqlitePool) -> anyhow::Result<()> {
    if !column_exists(pool, "gift_codes", "id").await? {
        sqlx::query(r#"ALTER TABLE gift_codes ADD COLUMN id TEXT"#)
            .execute(pool)
            .await?;
        sqlx::query(r#"UPDATE gift_codes SET id = lower(hex(randomblob(16))) WHERE id IS NULL OR id = ''"#)
            .execute(pool)
            .await?;
    }
    sqlx::query(r#"CREATE UNIQUE INDEX IF NOT EXISTS idx_gift_codes_id ON gift_codes(id)"#)
        .execute(pool)
        .await?;
    Ok(())
}

