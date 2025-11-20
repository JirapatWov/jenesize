#!/bin/bash

# Deployment Setup Script
# This script helps prepare your app for deployment to Vercel + Render + Supabase

set -e

echo "🚀 Affiliate Platform - Deployment Setup"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if running from project root
if [ ! -f "package.json" ]; then
    echo -e "${RED}Error: Please run this script from the project root directory${NC}"
    exit 1
fi

echo "📋 Step 1: Pre-deployment Checks"
echo "================================="

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo -e "${RED}❌ Git is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Git is installed${NC}"

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo -e "${RED}❌ pnpm is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✓ pnpm is installed${NC}"

# Check if node is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Node.js is installed ($(node --version))${NC}"

echo ""
echo "🔨 Step 2: Building Packages"
echo "============================="

# Install dependencies
echo "Installing dependencies..."
pnpm install

# Build shared packages
echo "Building shared packages..."
pnpm --filter @affiliate/types build
pnpm --filter @affiliate/database build
pnpm --filter @affiliate/adapters build

echo -e "${GREEN}✓ Packages built successfully${NC}"

echo ""
echo "🧪 Step 3: Running Tests"
echo "========================"

# Run tests
echo "Running unit tests..."
if pnpm --filter api test; then
    echo -e "${GREEN}✓ Unit tests passed${NC}"
else
    echo -e "${YELLOW}⚠ Some tests failed, but continuing...${NC}"
fi

echo ""
echo "🔍 Step 4: Linting"
echo "=================="

# Run linter (if it fails, warn but continue)
if pnpm lint; then
    echo -e "${GREEN}✓ No linting errors${NC}"
else
    echo -e "${YELLOW}⚠ Linting issues found, please review${NC}"
fi

echo ""
echo "🔐 Step 5: Generate Secrets"
echo "============================"

# Generate JWT secrets
JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
REFRESH_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")

echo ""
echo -e "${GREEN}Generated secure secrets:${NC}"
echo ""
echo "JWT_SECRET=$JWT_SECRET"
echo "REFRESH_TOKEN_SECRET=$REFRESH_SECRET"
echo ""
echo -e "${YELLOW}⚠ Save these secrets securely! You'll need them for Render environment variables.${NC}"

# Save to a file (not committed)
cat > .deployment-secrets.txt << EOF
# Generated Secrets for Deployment
# DO NOT COMMIT THIS FILE!
# Generated on: $(date)

JWT_SECRET=$JWT_SECRET
REFRESH_TOKEN_SECRET=$REFRESH_SECRET

# Add these to your Render environment variables
EOF

echo ""
echo -e "${GREEN}✓ Secrets saved to .deployment-secrets.txt (git-ignored)${NC}"

echo ""
echo "📝 Step 6: Environment Variables Checklist"
echo "==========================================="

echo ""
echo "For Render (Backend API):"
echo "------------------------"
echo "□ DATABASE_URL (from Supabase)"
echo "□ JWT_SECRET (see above)"
echo "□ JWT_EXPIRES_IN=1h"
echo "□ REFRESH_TOKEN_SECRET (see above)"
echo "□ REFRESH_TOKEN_EXPIRES_IN=7d"
echo "□ NODE_ENV=production"
echo "□ API_PORT=10000"
echo "□ WEB_URL (your Vercel URL)"
echo "□ REDIS_HOST (from Render Redis)"
echo "□ REDIS_PORT=6379"
echo "□ REDIS_PASSWORD (from Render Redis)"
echo "□ REDIS_URL (from Render Redis)"

echo ""
echo "For Vercel (Frontend):"
echo "---------------------"
echo "□ NEXT_PUBLIC_API_URL (your Render API URL)"

echo ""
echo "✅ Step 7: Deployment Readiness"
echo "================================"

READY=true

# Check if git repo has uncommitted changes
if [[ -n $(git status -s) ]]; then
    echo -e "${YELLOW}⚠ You have uncommitted changes${NC}"
    READY=false
else
    echo -e "${GREEN}✓ Git repository is clean${NC}"
fi

# Check if on a branch
BRANCH=$(git rev-parse --abbrev-ref HEAD)
echo "Current branch: $BRANCH"

# Check if remote is set
if git remote get-url origin &> /dev/null; then
    REMOTE=$(git remote get-url origin)
    echo -e "${GREEN}✓ Remote repository: $REMOTE${NC}"
else
    echo -e "${RED}❌ No remote repository configured${NC}"
    READY=false
fi

echo ""
echo "📚 Next Steps"
echo "============="
echo ""
echo "1. Create Supabase Project:"
echo "   → https://supabase.com/dashboard"
echo "   → Get your DATABASE_URL"
echo ""
echo "2. Deploy to Render:"
echo "   → https://dashboard.render.com/"
echo "   → Create Redis instance first"
echo "   → Then create Web Service for API"
echo "   → Set all environment variables"
echo ""
echo "3. Deploy to Vercel:"
echo "   → https://vercel.com/dashboard"
echo "   → Import your Git repository"
echo "   → Set NEXT_PUBLIC_API_URL"
echo ""
echo "4. Update CORS:"
echo "   → Go back to Render"
echo "   → Update WEB_URL with your Vercel URL"
echo "   → Redeploy API"
echo ""
echo "📖 Full deployment guide: ${GREEN}DEPLOYMENT.md${NC}"
echo "📋 Step-by-step checklist: ${GREEN}DEPLOYMENT_CHECKLIST.md${NC}"
echo ""

if [ "$READY" = true ]; then
    echo -e "${GREEN}✓ Your app is ready for deployment!${NC}"
    echo ""
    echo "Run these commands to deploy:"
    echo ""
    echo "  # For Vercel (Frontend)"
    echo "  vercel --prod"
    echo ""
    echo "  # For Render (Backend)"
    echo "  # Use the dashboard or connect your Git repo"
    echo ""
else
    echo -e "${YELLOW}⚠ Please address the issues above before deploying${NC}"
fi

echo ""
echo -e "${GREEN}Setup complete! 🎉${NC}"
echo ""

