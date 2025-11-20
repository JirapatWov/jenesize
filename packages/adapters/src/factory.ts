import { Marketplace, MarketplaceAdapter } from '@affiliate/types';
import { LazadaAdapter } from './lazada.adapter';
import { ShopeeAdapter } from './shopee.adapter';

export class MarketplaceAdapterFactory {
  private static adapters: Map<Marketplace, MarketplaceAdapter> = new Map([
    [Marketplace.LAZADA, new LazadaAdapter()],
    [Marketplace.SHOPEE, new ShopeeAdapter()],
  ]);

  static getAdapter(marketplace: Marketplace | string): MarketplaceAdapter {
    const adapter = this.adapters.get(marketplace as Marketplace);
    if (!adapter) {
      throw new Error(`No adapter found for marketplace: ${marketplace}`);
    }
    return adapter;
  }

  static detectMarketplace(url: string): Marketplace | null {
    for (const [marketplace, adapter] of this.adapters) {
      const parsed = adapter.parseUrl(url);
      if (parsed.isValid) {
        return marketplace;
      }
    }
    return null;
  }
}

