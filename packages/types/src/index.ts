// User types
export interface User {
  id: string;
  email: string;
  name: string;
  password?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface JwtPayload {
  sub: string;
  email: string;
  iat?: number;
  exp?: number;
}

// Product types
export enum Marketplace {
  LAZADA = 'LAZADA',
  SHOPEE = 'SHOPEE',
}

export interface Product {
  id: string;
  title: string;
  imageUrl: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Offer {
  id: string;
  productId: string;
  marketplace: Marketplace;
  storeName: string;
  price: number;
  currency: string;
  externalUrl: string;
  externalId: string;
  lastCheckedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductWithOffers extends Product {
  offers: Offer[];
}

// Campaign types
export interface Campaign {
  id: string;
  name: string;
  slug: string;
  description?: string;
  utmCampaign: string;
  utmSource?: string;
  utmMedium?: string;
  startAt?: Date;
  endAt?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Link types
export interface Link {
  id: string;
  productId: string;
  campaignId: string;
  marketplace: Marketplace;
  shortCode: string;
  targetUrl: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface LinkWithDetails extends Link {
  product?: Product;
  campaign?: Campaign;
  clickCount?: number;
}

// Click tracking types
export interface Click {
  id: string;
  linkId: string;
  timestamp: Date;
  referrer?: string;
  userAgent?: string;
  ipHash?: string;
}

// Analytics types
export interface ClickStats {
  totalClicks: number;
  uniqueClicks: number;
  clicksByMarketplace: Record<Marketplace, number>;
  clicksByDate: Array<{
    date: string;
    clicks: number;
  }>;
}

export interface CampaignStats {
  campaignId: string;
  campaignName: string;
  totalClicks: number;
  totalProducts: number;
  totalLinks: number;
  ctr?: number;
}

export interface ProductStats {
  productId: string;
  productTitle: string;
  totalClicks: number;
  clicksByMarketplace: Record<Marketplace, number>;
  bestOffer?: Offer;
}

export interface DashboardOverview {
  totalCampaigns: number;
  totalProducts: number;
  totalLinks: number;
  totalClicks: number;
  topCampaigns: CampaignStats[];
  topProducts: ProductStats[];
  recentClicks: Array<{
    timestamp: Date;
    productTitle: string;
    campaignName: string;
    marketplace: Marketplace;
  }>;
}

// API Request/Response types
export interface CreateProductDto {
  url: string;
  marketplace?: Marketplace;
}

export interface CreateCampaignDto {
  name: string;
  slug?: string;
  description?: string;
  utmCampaign: string;
  utmSource?: string;
  utmMedium?: string;
  startAt?: Date;
  endAt?: Date;
}

export interface UpdateCampaignDto {
  name?: string;
  description?: string;
  utmCampaign?: string;
  utmSource?: string;
  utmMedium?: string;
  startAt?: Date;
  endAt?: Date;
  isActive?: boolean;
}

export interface CreateLinkDto {
  productId: string;
  campaignId: string;
  marketplace: Marketplace;
}

export interface RegisterDto {
  email: string;
  password: string;
  name: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

// Marketplace adapter types
export interface MarketplaceProduct {
  externalId: string;
  title: string;
  imageUrl: string;
  storeName: string;
  price: number;
  currency: string;
  url: string;
}

export interface MarketplaceAdapter {
  marketplace: Marketplace;
  parseUrl(url: string): { isValid: boolean; sku?: string };
  fetchProduct(urlOrSku: string): Promise<MarketplaceProduct>;
  buildAffiliateUrl(externalUrl: string, utmParams: Record<string, string>): string;
}
