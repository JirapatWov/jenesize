import { Marketplace, MarketplaceProduct } from '@affiliate/types';
import { BaseMarketplaceAdapter } from './base.adapter';
import { lazadaMockProducts } from './fixtures/lazada.fixtures';

export class LazadaAdapter extends BaseMarketplaceAdapter {
  marketplace = Marketplace.LAZADA;

  parseUrl(url: string): { isValid: boolean; sku?: string } {
    try {
      const urlObj = new URL(url);
      
      // Check if it's a Lazada URL
      if (!urlObj.hostname.includes('lazada')) {
        return { isValid: false };
      }

      // Try to extract SKU from URL path or query params
      const pathMatch = url.match(/\/products\/[^/]+-i?(\d+)/);
      if (pathMatch) {
        return { isValid: true, sku: pathMatch[1] };
      }

      // Check query params for item_id
      const itemId = urlObj.searchParams.get('item_id');
      if (itemId) {
        return { isValid: true, sku: itemId };
      }

      return { isValid: true };
    } catch {
      // If it's not a URL, assume it's a SKU
      if (/^[A-Z0-9]+$/i.test(url)) {
        return { isValid: true, sku: url };
      }
      return { isValid: false };
    }
  }

  async fetchProduct(urlOrSku: string): Promise<MarketplaceProduct> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    const parsed = this.parseUrl(urlOrSku);
    
    if (!parsed.isValid) {
      throw new Error('Invalid Lazada URL or SKU');
    }

    // Check if we have a matching mock product by SKU
    if (parsed.sku) {
      const sku = parsed.sku;
      const mockProduct = lazadaMockProducts.find(
        (p) => p.externalId === sku || p.externalId.endsWith(sku)
      );
      if (mockProduct) {
        return mockProduct;
      }
    }

    // Check if URL matches any mock product URL
    const mockProduct = lazadaMockProducts.find((p) => p.url === urlOrSku);
    if (mockProduct) {
      return mockProduct;
    }

    // Return a random mock product if no match found
    const randomProduct =
      lazadaMockProducts[Math.floor(Math.random() * lazadaMockProducts.length)];
    return {
      ...randomProduct,
      externalId: parsed.sku ?? randomProduct.externalId,
    };
  }
}

