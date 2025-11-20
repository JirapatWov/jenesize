import { Marketplace, MarketplaceProduct } from '@affiliate/types';
import { BaseMarketplaceAdapter } from './base.adapter';
import { shopeeMockProducts } from './fixtures/shopee.fixtures';

export class ShopeeAdapter extends BaseMarketplaceAdapter {
  marketplace = Marketplace.SHOPEE;

  parseUrl(url: string): { isValid: boolean; sku?: string } {
    try {
      const urlObj = new URL(url);
      
      // Check if it's a Shopee URL
      if (!urlObj.hostname.includes('shopee')) {
        return { isValid: false };
      }

      // Try to extract SKU from URL path
      const pathMatch = url.match(/\.(\d+)\.(\d+)$/);
      if (pathMatch) {
        return { isValid: true, sku: `${pathMatch[1]}.${pathMatch[2]}` };
      }

      // Try alternate pattern
      const altMatch = url.match(/-i\.(\d+)\.(\d+)/);
      if (altMatch) {
        return { isValid: true, sku: `${altMatch[1]}.${altMatch[2]}` };
      }

      return { isValid: true };
    } catch {
      // If it's not a URL, assume it's a SKU
      if (/^[A-Z0-9.]+$/i.test(url)) {
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
      throw new Error('Invalid Shopee URL or SKU');
    }

    // Check if we have a matching mock product by SKU
    if (parsed.sku) {
      const sku = parsed.sku;
      const mockProduct = shopeeMockProducts.find(
        (p) => p.externalId === sku || p.externalId.endsWith(sku)
      );
      if (mockProduct) {
        return mockProduct;
      }
    }

    // Check if URL matches any mock product URL
    const mockProduct = shopeeMockProducts.find((p) => p.url === urlOrSku);
    if (mockProduct) {
      return mockProduct;
    }

    // Return a random mock product if no match found
    const randomProduct =
      shopeeMockProducts[Math.floor(Math.random() * shopeeMockProducts.length)];
    return {
      ...randomProduct,
      externalId: parsed.sku ?? randomProduct.externalId,
    };
  }
}

