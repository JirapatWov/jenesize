# Affiliate Platform - Jenosize Lead Engineer Assignment

> A full-stack web application for affiliate link management and price comparison between Lazada and Shopee marketplaces.

**Demo URL:** _(To be deployed)_  
**Admin Access:** `/admin`  
**Sample Campaign:** "Summer Deal 2025"  
**Test Credentials:** `admin@example.com` / `Admin123!`

---

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Getting Started](#getting-started)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [Deployment](#deployment)
- [Future Improvements](#future-improvements)

---

## 🎯 Overview

This project is a comprehensive affiliate platform that allows administrators to:

1. **Add products** from Lazada or Shopee marketplaces
2. **Compare prices** across both platforms automatically
3. **Create campaigns** with UTM tracking parameters
4. **Generate affiliate links** for products within campaigns
5. **Track clicks** and analyze performance metrics
6. **Display public landing pages** with product comparisons and purchase CTAs

The platform is built as a **monorepo** using **pnpm workspaces**, featuring a **NestJS backend** and **Next.js 14 frontend** with modern development practices.

---

## 🏗️ Architecture

### System Architecture Diagram

```mermaid
graph TB
    subgraph "Frontend - Next.js 14"
        Web[Web App]
        Admin[Admin Panel]
        Landing[Campaign Landing Pages]
    end

    subgraph "Backend - NestJS"
        API[API Gateway]
        Auth[Auth Module]
        Products[Products Module]
        Campaigns[Campaigns Module]
        Links[Links Module]
        Analytics[Analytics Module]
    end

    subgraph "Shared Packages"
        Types[TypeScript Types]
        Database[Prisma ORM]
        Adapters[Marketplace Adapters]
    end

    subgraph "Data Layer"
        Postgres[(PostgreSQL)]
        Redis[(Redis Cache)]
    end

    subgraph "External"
        Lazada[Lazada Mocks]
        Shopee[Shopee Mocks]
    end

    Web --> API
    Admin --> API
    Landing --> API

    API --> Auth
    API --> Products
    API --> Campaigns
    API --> Links
    API --> Analytics

    Products --> Adapters
    Links --> Redis

    Auth --> Database
    Products --> Database
    Campaigns --> Database
    Links --> Database
    Analytics --> Database

    Database --> Postgres

    Adapters --> Lazada
    Adapters --> Shopee
```

### Monorepo Structure

```
jenosize-affiliate-platform/
├── apps/
│   ├── api/                    # NestJS Backend API
│   │   ├── src/
│   │   │   ├── auth/          # JWT authentication
│   │   │   ├── products/      # Product & offer management
│   │   │   ├── campaigns/     # Campaign management
│   │   │   ├── links/         # Affiliate link generation
│   │   │   ├── analytics/     # Analytics & statistics
│   │   │   ├── database/      # Prisma service
│   │   │   └── redis/         # Redis service
│   │   └── test/              # E2E tests
│   │
│   └── web/                    # Next.js 14 Frontend
│       ├── src/
│       │   ├── app/           # App Router pages
│       │   │   ├── admin/     # Admin panel
│       │   │   ├── campaigns/ # Public landing pages
│       │   │   ├── login/     # Authentication
│       │   │   └── register/
│       │   ├── components/    # UI components
│       │   └── lib/           # Utils & API client
│       └── public/
│
├── packages/
│   ├── types/                  # Shared TypeScript types
│   ├── database/               # Prisma schema & client
│   │   └── prisma/
│   │       ├── schema.prisma
│   │       └── seed.ts
│   └── adapters/               # Marketplace adapters
│       ├── src/
│       │   ├── lazada.adapter.ts
│       │   ├── shopee.adapter.ts
│       │   └── fixtures/      # Mock data
│       └── factory.ts
│
├── infra/
│   └── docker-compose.yml      # PostgreSQL + Redis
│
└── .github/
    └── workflows/
        └── ci.yml              # GitHub Actions
```

---

## 🚀 Tech Stack

### Frontend

- **Next.js 14** - App Router, Server Components, SSR
- **React 18** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **shadcn/ui** - Component library
- **Recharts** - Data visualization
- **Lucide Icons** - Icon library

### Backend

- **NestJS** - Node.js framework
- **TypeScript** - Type safety
- **Prisma** - ORM for PostgreSQL
- **PostgreSQL** - Relational database
- **Redis** - Caching & session storage
- **JWT** - Authentication
- **Passport** - Auth strategies
- **bcrypt** - Password hashing
- **nanoid** - Short URL generation
- **Swagger** - API documentation

### DevOps

- **pnpm** - Fast, disk-efficient package manager
- **Docker** - Containerization
- **GitHub Actions** - CI/CD
- **ESLint** - Linting
- **Prettier** - Code formatting
- **Jest** - Testing

---

## ✨ Features

### Core Features (MVP)

#### 1. Product & Price Comparison

- ✅ Add products via Lazada/Shopee URL or SKU
- ✅ Fetch product data (title, image, price, store)
- ✅ Display best price badge
- ✅ Mock adapters with JSON fixtures
- ✅ Periodic price refresh (cron job every 6 hours)

#### 2. Affiliate Link Generator

- ✅ Create campaigns with UTM parameters
- ✅ Generate short links (`/go/{shortCode}`)
- ✅ Track clicks with metadata (referrer, user-agent, IP hash)
- ✅ Fast redirects via Redis caching

#### 3. Promotion Landing Page

- ✅ Public campaign pages (`/campaigns/{slug}`)
- ✅ Product cards with price comparison
- ✅ "Buy on Lazada/Shopee" CTAs
- ✅ Automatic click tracking on redirect

#### 4. Analytics Dashboard

- ✅ Click count per product/campaign/marketplace
- ✅ CTR calculations
- ✅ Top-performing products leaderboard
- ✅ 7-day click trends chart
- ✅ Marketplace comparison (pie chart)

### Additional Features

- ✅ User authentication (JWT with refresh tokens)
- ✅ Role-based admin panel
- ✅ Responsive design (mobile-friendly)
- ✅ Real-time price comparison
- ✅ Campaign management interface
- ✅ Link management dashboard

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** >= 18.0.0
- **pnpm** >= 8.0.0
- **Docker** & **Docker Compose**

### Installation

1. **Clone the repository**

```bash
git clone <repository-url>
cd je
```

2. **Install dependencies**

```bash
pnpm install
```

3. **Set up environment variables**

Create `.env` files in the root directory:

```bash
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/affiliate_db?schema=public"

# Redis
REDIS_URL="redis://:redis123@localhost:6379"
REDIS_PASSWORD=redis123

# JWT
JWT_SECRET=your-secret-key-change-in-production
JWT_REFRESH_SECRET=your-refresh-secret-key
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
```

4. **Start Docker services**

```bash
pnpm docker:up
```

5. **Generate Prisma client**

```bash
pnpm db:generate
```

6. **Run database migrations**

```bash
pnpm db:push
```

7. **Seed the database**

```bash
pnpm db:seed
```

This creates:

- Admin user: `admin@example.com` / `Admin123!`
- 3 sample products (Matcha Powder, Yoga Mat, Wireless Earbuds)
- "Summer Deal 2025" campaign
- 6 affiliate links (2 per product)
- 50 sample clicks for analytics

8. **Start development servers**

```bash
# Start both API and Web (parallel)
pnpm dev

# Or start individually:
pnpm dev:api    # API on http://localhost:3001
pnpm dev:web    # Web on http://localhost:3000
```

### Access the Application

- **Frontend:** http://localhost:3000
- **API:** http://localhost:3001
- **API Docs:** http://localhost:3001/api/docs (Swagger)
- **Prisma Studio:** `pnpm db:studio`

---

## 📚 API Documentation

### Authentication Endpoints

| Method | Endpoint         | Description          |
| ------ | ---------------- | -------------------- |
| POST   | `/auth/register` | Register new user    |
| POST   | `/auth/login`    | Login user           |
| POST   | `/auth/refresh`  | Refresh access token |
| POST   | `/auth/logout`   | Logout user          |
| GET    | `/auth/me`       | Get current user     |

### Product Endpoints

| Method | Endpoint                | Description          | Auth |
| ------ | ----------------------- | -------------------- | ---- |
| POST   | `/products`             | Add product from URL | ✅   |
| GET    | `/products`             | List all products    | ❌   |
| GET    | `/products/:id`         | Get product details  | ❌   |
| GET    | `/products/:id/offers`  | Get price comparison | ❌   |
| POST   | `/products/:id/refresh` | Refresh prices       | ✅   |
| DELETE | `/products/:id`         | Delete product       | ✅   |

### Campaign Endpoints

| Method | Endpoint                | Description                   | Auth |
| ------ | ----------------------- | ----------------------------- | ---- |
| POST   | `/campaigns`            | Create campaign               | ✅   |
| GET    | `/campaigns`            | List campaigns                | ❌   |
| GET    | `/campaigns/:id`        | Get campaign by ID            | ✅   |
| GET    | `/campaigns/slug/:slug` | Get campaign by slug (public) | ❌   |
| PATCH  | `/campaigns/:id`        | Update campaign               | ✅   |
| DELETE | `/campaigns/:id`        | Delete campaign               | ✅   |

### Link Endpoints

| Method | Endpoint         | Description             | Auth |
| ------ | ---------------- | ----------------------- | ---- |
| POST   | `/links`         | Generate affiliate link | ✅   |
| GET    | `/links`         | List links              | ✅   |
| DELETE | `/links/:id`     | Delete link             | ✅   |
| GET    | `/go/:shortCode` | Redirect & track click  | ❌   |

### Analytics Endpoints

| Method | Endpoint                            | Description            | Auth |
| ------ | ----------------------------------- | ---------------------- | ---- |
| GET    | `/analytics/dashboard`              | Dashboard overview     | ✅   |
| GET    | `/analytics/campaigns`              | Campaign statistics    | ✅   |
| GET    | `/analytics/products`               | Product statistics     | ✅   |
| GET    | `/analytics/trends`                 | Click trends (7 days)  | ✅   |
| GET    | `/analytics/marketplace-comparison` | Marketplace comparison | ✅   |

**Full API Documentation:** http://localhost:3001/api/docs

---

## 🧪 Testing

### Run All Tests

```bash
pnpm test
```

### Run Tests by Package

```bash
# API tests
pnpm --filter api test

# API E2E tests
pnpm --filter api test:e2e

# With coverage
pnpm --filter api test:cov
```

### Test Structure

```
apps/api/
├── src/
│   ├── auth/auth.service.spec.ts
│   └── products/products.service.spec.ts
└── test/
    └── app.e2e-spec.ts
```

---

## 🚀 Deployment

### Deployment-Ready Architecture

This project is ready to deploy on:

- **Frontend:** Vercel
- **Backend:** Render
- **Database:** Supabase
- **Redis:** Render

---

## 🎯 Key Design Decisions

### 1. Monorepo with pnpm Workspaces

**Why:** Easier code sharing, consistent versioning, and simplified dependency management across frontend, backend, and shared packages.

### 2. Mock Marketplace Adapters

**Why:** Real API integration requires merchant accounts and approval. Mock adapters provide:

- Reliable testing environment
- No API rate limits
- Predictable data
- Easy to swap with real APIs later

### 3. Redis for Link Caching

**Why:** Affiliate link redirects should be extremely fast. Redis provides:

- Sub-millisecond response times
- Reduced database load
- Better user experience
- Scalability for high traffic

### 4. JWT with Refresh Tokens

**Why:** Secure authentication with:

- Short-lived access tokens (15 minutes)
- Long-lived refresh tokens (7 days)
- Stateless authentication
- Easy to scale horizontally

### 5. Prisma ORM

**Why:** Type-safe database access with:

- Auto-generated TypeScript types
- Easy migrations
- Great developer experience
- Excellent performance

### 6. Next.js App Router

**Why:** Modern React framework with:

- Server Components for better performance
- Built-in API routes
- Excellent SEO
- Simple deployment

---

## 🔮 Future Improvements

### Short-term (1-2 weeks)

- [ ] **Real API Integration**
  - Integrate Lazada Affiliate API
  - Integrate Shopee Affiliate API
  - Implement rate limiting and caching strategies

- [ ] **Advanced Analytics**
  - Conversion tracking
  - Revenue attribution
  - Funnel analysis
  - Custom date ranges

- [ ] **Enhanced UX**
  - Product image carousel
  - Advanced filtering & sorting
  - Wishlist functionality
  - Price drop alerts

### Medium-term (1-2 months)

- [ ] **A/B Testing**
  - Campaign variants
  - Landing page optimization
  - CTA testing

- [ ] **Notifications**
  - Email campaigns
  - Price drop notifications
  - Performance alerts

- [ ] **SEO Optimization**
  - Dynamic meta tags
  - Structured data (Schema.org)
  - Sitemap generation
  - OpenGraph images

### Long-term (3+ months)

- [ ] **Multi-marketplace**
  - Support for more platforms (Amazon, Tokopedia, etc.)
  - Universal product catalog
  - Cross-platform analytics

- [ ] **Advanced Features**
  - AI-powered product recommendations
  - Automated campaign optimization
  - Influencer management
  - Affiliate network

- [ ] **Scale & Performance**
  - CDN integration
  - Image optimization
  - Database sharding
  - Load balancing

---

## 📝 License

This project is created as a test assignment for Jenosize.
