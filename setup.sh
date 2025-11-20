#!/bin/bash

# Affiliate Platform Setup Script
# This script automates the initial setup process

set -e

echo "🚀 Starting Affiliate Platform Setup..."
echo ""

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo "❌ pnpm is not installed. Please install it first:"
    echo "   npm install -g pnpm"
    exit 1
fi

echo "✅ pnpm is installed"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker Desktop first."
    exit 1
fi

echo "✅ Docker is installed"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
pnpm install

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo ""
    echo "📝 Creating .env file..."
    cat > .env << EOF
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/affiliate_db?schema=public"
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=affiliate_db
POSTGRES_PORT=5432

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=redis123
REDIS_URL="redis://:redis123@localhost:6379"

# JWT
JWT_SECRET=your-secret-key-change-this-in-production
JWT_REFRESH_SECRET=your-refresh-secret-key-change-this-in-production
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# API
API_PORT=3001
API_URL=http://localhost:3001

# Web
NEXT_PUBLIC_API_URL=http://localhost:3001
WEB_PORT=3000

# Environment
NODE_ENV=development
EOF
    echo "✅ .env file created"
else
    echo "⚠️  .env file already exists, skipping..."
fi

# Start Docker services
echo ""
echo "🐳 Starting Docker services (PostgreSQL & Redis)..."
pnpm docker:up

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 5

# Generate Prisma client
echo ""
echo "🔧 Generating Prisma client..."
pnpm db:generate

# Push database schema
echo ""
echo "📊 Pushing database schema..."
pnpm db:push

# Seed database
echo ""
echo "🌱 Seeding database with sample data..."
pnpm db:seed

echo ""
echo "✨ Setup complete!"
echo ""
echo "📌 Next steps:"
echo "   1. Start the development servers: pnpm dev"
echo "   2. Open the web app: http://localhost:3000"
echo "   3. Access the API docs: http://localhost:3001/api/docs"
echo "   4. Login with: admin@example.com / Admin123!"
echo ""
echo "Happy coding! 🚀"

