#!/bin/bash

# Restaurant Demo Setup Script
# Run this script on your VPS to set up the system

echo "=== Restaurant Demo Setup ==="
echo ""

# Check if we're in the right directory
if [ ! -f "backend/Cargo.toml" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

echo "🔧 Setting up database..."
cd backend

# Create database directory if it doesn't exist
mkdir -p data

# Run migrations
echo "📊 Running database migrations..."
sqlx migrate run

if [ $? -eq 0 ]; then
    echo "✅ Database migrations completed successfully"
else
    echo "❌ Database migration failed. Check your database configuration."
    echo "Make sure DATABASE_URL is set correctly in backend/.env"
    exit 1
fi

echo ""
echo "🚀 Building backend..."
cargo build --release

if [ $? -eq 0 ]; then
    echo "✅ Backend built successfully"
else
    echo "❌ Backend build failed. Check for compilation errors."
    exit 1
fi

echo ""
echo "📧 Checking email configuration..."
if [ -f ".env" ]; then
    if grep -q "SMTP_HOST" .env && grep -q "SMTP_USERNAME" .env && grep -q "SMTP_PASSWORD" .env && grep -q "SMTP_FROM" .env; then
        echo "✅ SMTP configuration found"
    else
        echo "⚠️  SMTP configuration incomplete. Email functionality may not work."
        echo "Please set these environment variables in backend/.env:"
        echo "  SMTP_HOST=smtp-relay.brevo.com"
        echo "  SMTP_PORT=587"
        echo "  SMTP_USERNAME=your_brevo_username"
        echo "  SMTP_PASSWORD=your_brevo_api_key"
        echo "  SMTP_FROM=no-reply@yourdomain.com"
    fi
else
    echo "❌ No .env file found. Please create backend/.env with required configuration."
fi

echo ""
echo "🛡️  Admin user setup:"
echo "If you need to create an admin user, run:"
echo "curl -X POST https://yourdomain.com/api/auth/setup-admin \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{\"email\": \"your-admin@domain.com\", \"password\": \"YourPassword123\"}'"

echo ""
echo "🔍 System health check:"
echo "curl https://yourdomain.com/api/health/basic"

echo ""
echo "📝 To start the backend server:"
echo "cd backend && ./target/release/restaurent-backend"

echo ""
echo "✅ Setup complete! Your restaurant demo system is ready."
