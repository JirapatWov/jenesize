# Deployment Guide

This guide covers deploying the Affiliate Platform to production using:

- **Vercel** (Frontend - Next.js)
- **Render** (Backend - NestJS API)
- **Supabase** (Database - PostgreSQL)

## Prerequisites

1. **Accounts:**
   - [Vercel Account](https://vercel.com/signup)
   - [Render Account](https://render.com/register)
   - [Supabase Account](https://supabase.com/dashboard/sign-up)

2. **Tools:**
   - Git repository (GitHub, GitLab, or Bitbucket)
   - pnpm installed locally

## Step 1: Deploy Database (Supabase)

### 1.1 Create Supabase Project

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Click **"New Project"**
3. Fill in:
   - **Name**: `affiliate-platform`
   - **Database Password**: Generate a secure password (save it!)
   - **Region**: Choose closest to your users
   - **Pricing Plan**: Free tier is sufficient for testing

4. Wait for the project to be created (~2 minutes)

### 1.2 Get Database Connection String

1. Go to **Settings** → **Database**
2. Scroll down to **Connection string** section
3. Select **"URI"** mode
4. Copy the connection string. It looks like:

   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
   ```

5. Replace `[YOUR-PASSWORD]` with your actual database password

### 1.3 Run Database Migrations

```bash
# Set the DATABASE_URL temporarily
export DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"

# Generate Prisma Client
pnpm db:generate

# Push schema to Supabase
pnpm db:push

# Seed the database (optional)
pnpm db:seed
```

## Step 2: Deploy Backend API (Render)

### 2.1 Create Render Web Service

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"Web Service"**
3. Connect your Git repository
4. Configure the service:

   **Basic Settings:**
   - **Name**: `affiliate-api`
   - **Region**: Choose same as Supabase
   - **Branch**: `main`
   - **Root Directory**: `apps/api`
   - **Runtime**: `Node`
   - **Build Command**:
     ```bash
     cd ../.. && pnpm install && pnpm --filter @affiliate/types build && pnpm --filter @affiliate/database build && pnpm --filter @affiliate/adapters build && cd apps/api && pnpm build
     ```
   - **Start Command**:
     ```bash
     node dist/main.js
     ```

   **Advanced Settings:**
   - **Instance Type**: Free (for testing) or Starter ($7/month for production)
   - **Auto-Deploy**: Yes

### 2.2 Set Environment Variables

In Render dashboard, go to **Environment** tab and add:

```bash
# Database
DATABASE_URL=postgresql://affiliate_bn63_user:DHYpQAsa49LF7xTxqGYyhHatHZrUWjKw@dpg-d4flqb8dl3ps73d23gc0-a.singapore-postgres.render.com/affiliate_bn63

# JWT
JWT_SECRET=your-super-secret-jwt-key-here-change-this-in-production
JWT_EXPIRES_IN=1h
REFRESH_TOKEN_SECRET=your-refresh-token-secret-here
REFRESH_TOKEN_EXPIRES_IN=7d

# API
NODE_ENV=production
API_PORT=10000
WEB_URL=https://your-app.vercel.app

# Redis (Render Redis)
REDIS_HOST=red-d4flvb6r433s73cveku0.render.com
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password
REDIS_URL=redis://red-d4flvb6r433s73cveku0:6379
```

**Note:** For Redis, you need to create a separate Redis instance on Render:

- Click **"New +"** → **"Redis"**
- Copy the connection details to environment variables above

### 2.3 Deploy

1. Click **"Create Web Service"**
2. Wait for deployment (~3-5 minutes)
3. Your API will be available at: `https://affiliate-api.onrender.com`

## Step 3: Deploy Frontend (Vercel)

### 3.1 Prepare for Vercel

Create `vercel.json` in project root (already created below).

### 3.2 Deploy to Vercel

**Option A: Using Vercel CLI**

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

**Option B: Using Vercel Dashboard**

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Import your Git repository
4. Configure:
   - **Framework Preset**: Next.js
   - **Root Directory**: `apps/web`
   - **Build Command**:
     ```bash
     cd ../.. && pnpm install && pnpm --filter @affiliate/types build && cd apps/web && pnpm build
     ```
   - **Output Directory**: `.next`
   - **Install Command**: `pnpm install`

### 3.3 Set Environment Variables

In Vercel dashboard, go to **Settings** → **Environment Variables**:

```bash
NEXT_PUBLIC_API_URL=https://affiliate-api.onrender.com
```

### 3.4 Redeploy

After adding environment variables:

1. Go to **Deployments** tab
2. Click **"..."** on latest deployment
3. Click **"Redeploy"**

Your frontend will be available at: `https://your-app.vercel.app`

## Step 4: Update CORS

After deploying, update the backend CORS configuration:

In Render dashboard, update the `WEB_URL` environment variable:

```bash
WEB_URL=https://your-app.vercel.app
```

This allows your Vercel frontend to communicate with your Render backend.

## Step 5: Verify Deployment

### Test API

```bash
curl https://affiliate-api.onrender.com/api/docs
```

### Test Frontend

Visit: `https://your-app.vercel.app`

### Test End-to-End

1. Register a user
2. Create a product
3. Create a campaign
4. Generate an affiliate link
5. Test the redirect at `/go/{shortCode}`

## Environment Variables Summary

### Supabase (Database)

- No environment variables needed (just connection string)

### Render (Backend API)

```bash
DATABASE_URL=
JWT_SECRET=
JWT_EXPIRES_IN=1h
REFRESH_TOKEN_SECRET=
REFRESH_TOKEN_EXPIRES_IN=7d
NODE_ENV=production
API_PORT=10000
WEB_URL=https://your-app.vercel.app
REDIS_HOST=
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_URL=
```

### Vercel (Frontend)

```bash
NEXT_PUBLIC_API_URL=https://affiliate-api.onrender.com
```

## Troubleshooting

### API Not Starting on Render

**Issue**: Build fails or app crashes

**Solutions:**

1. Check Render logs: Dashboard → Your Service → Logs
2. Verify all environment variables are set
3. Ensure `DATABASE_URL` is correct
4. Check that Redis is running

### Frontend Can't Connect to API

**Issue**: CORS errors or "Failed to fetch"

**Solutions:**

1. Verify `NEXT_PUBLIC_API_URL` in Vercel
2. Check `WEB_URL` in Render matches your Vercel domain
3. Redeploy both services after changes

### Database Connection Issues

**Issue**: "Can't connect to database"

**Solutions:**

1. Verify Supabase is running
2. Check `DATABASE_URL` format
3. Ensure IP allowlist in Supabase (should be 0.0.0.0/0 for Render)
4. Run migrations: `pnpm db:push`

### Build Fails

**Issue**: Build command fails on Render/Vercel

**Solutions:**

1. Ensure monorepo packages are built in correct order
2. Check that `pnpm` is installed
3. Verify build commands include workspace dependencies

## Performance Optimization

### Enable Caching

- Vercel automatically caches static assets
- Render caches Docker layers

### Database Connection Pooling

Add to `DATABASE_URL`:

```
?pgbouncer=true&connection_limit=1
```

### API Response Caching

Already implemented with Redis in the code.

## Monitoring

### Render

- Dashboard → Your Service → Metrics
- View logs, CPU, memory usage

### Vercel

- Dashboard → Your Project → Analytics
- View page views, errors, performance

### Supabase

- Dashboard → Your Project → Database → Logs
- Monitor queries, connections

## Costs

### Free Tier Limits

**Supabase (Free)**

- 500 MB database space
- 1 GB file storage
- 2 GB bandwidth
- Suitable for: Testing, small projects

**Render (Free)**

- Spins down after 15 min inactivity
- 750 hours/month
- Shared CPU
- Suitable for: Demos, testing

**Vercel (Hobby - Free)**

- 100 GB bandwidth
- Unlimited websites
- 6,000 build minutes
- Suitable for: Personal projects

### Production Pricing (Recommended)

**Supabase Pro**: $25/month

- 8 GB database space
- 100 GB file storage
- 250 GB bandwidth

**Render Starter**: $7/month

- Always on
- Shared CPU
- 512 MB RAM

**Vercel Pro**: $20/month

- Unlimited bandwidth
- Advanced analytics
- Team collaboration

**Total**: ~$52/month for production-ready deployment

## Continuous Deployment

Both Vercel and Render support automatic deployments:

1. **Push to main branch** → Automatically deploys
2. **Create pull request** → Preview deployment
3. **Merge PR** → Production deployment

### GitHub Actions (Optional)

Already configured in `.github/workflows/ci.yml`:

- Runs tests on every push
- Lints code
- Ensures quality before deployment

## Custom Domain

### Vercel

1. Go to Settings → Domains
2. Add your domain
3. Update DNS records as instructed

### Render

1. Go to Settings → Custom Domains
2. Add your domain
3. Update DNS records as instructed

## Security Checklist

Before going live:

- [ ] Change all secrets and passwords
- [ ] Enable HTTPS (automatic on Vercel/Render)
- [ ] Set strong `JWT_SECRET` and `REFRESH_TOKEN_SECRET`
- [ ] Review and restrict CORS origins
- [ ] Enable rate limiting (if needed)
- [ ] Set up monitoring and alerts
- [ ] Configure database backups in Supabase
- [ ] Review Supabase RLS policies
- [ ] Enable 2FA on all accounts (Vercel, Render, Supabase)

## Backup Strategy

### Database (Supabase)

- Automatic daily backups (Pro plan)
- Manual backups: Dashboard → Database → Backups

### Code

- Git repository serves as backup
- Keep production branch protected

## Rollback Procedure

### If deployment fails:

**Vercel:**

1. Go to Deployments
2. Find previous working deployment
3. Click "..." → "Promote to Production"

**Render:**

1. Go to your service
2. Click "Manual Deploy"
3. Select previous commit

**Database:**

1. Supabase → Database → Backups
2. Restore from backup

## Support

- **Vercel**: [Documentation](https://vercel.com/docs)
- **Render**: [Documentation](https://render.com/docs)
- **Supabase**: [Documentation](https://supabase.com/docs)

## Next Steps

After successful deployment:

1. Set up custom domain
2. Configure monitoring and alerts
3. Set up database backups
4. Implement rate limiting
5. Add more comprehensive tests
6. Set up staging environment
7. Configure CI/CD pipeline
8. Add error tracking (Sentry)
9. Set up analytics (Google Analytics, Plausible)
10. Create user documentation
