import { Marketplace, MarketplaceAdapter, MarketplaceProduct } from '@affiliate/types';

export abstract class BaseMarketplaceAdapter implements MarketplaceAdapter {
  abstract marketplace: Marketplace;

  abstract parseUrl(url: string): { isValid: boolean; sku?: string };

  abstract fetchProduct(urlOrSku: string): Promise<MarketplaceProduct>;

  buildAffiliateUrl(externalUrl: string, utmParams: Record<string, string>): string {
    const url = new URL(externalUrl);
    Object.entries(utmParams).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
    return url.toString();
  }
}

