'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDate } from '@/lib/utils';
import { ExternalLink, TrendingDown } from 'lucide-react';

export default function CampaignLandingPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [campaign, setCampaign] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCampaign();
  }, [slug]);

  const loadCampaign = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/campaigns/slug/${slug}`
      );
      if (!response.ok) throw new Error('Campaign not found');
      const data = await response.json();
      setCampaign(data);
    } catch (error) {
      console.error('Failed to load campaign:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Campaign Not Found</h1>
          <p className="text-muted-foreground">
            The campaign you're looking for doesn't exist or has been removed.
          </p>
        </div>
      </div>
    );
  }

  if (!campaign.isActive) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Campaign Ended</h1>
          <p className="text-muted-foreground">
            This campaign is no longer active.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900">{campaign.name}</h1>
            {campaign.description && (
              <p className="mt-2 text-lg text-gray-600">{campaign.description}</p>
            )}
            {campaign.endAt && (
              <p className="mt-2 text-sm text-muted-foreground">
                Ends: {formatDate(campaign.endAt)}
              </p>
            )}
          </div>
        </div>
      </header>

      {/* Products Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {campaign.products && campaign.products.length > 0 ? (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {campaign.products.map((product: any) => {
              const lazadaOffer = product.offers?.find((o: any) => o.marketplace === 'LAZADA');
              const shopeeOffer = product.offers?.find((o: any) => o.marketplace === 'SHOPEE');
              const lazadaLink = product.links?.find((l: any) => l.marketplace === 'LAZADA');
              const shopeeLink = product.links?.find((l: any) => l.marketplace === 'SHOPEE');

              const priceDiff =
                lazadaOffer && shopeeOffer
                  ? Math.abs(lazadaOffer.price - shopeeOffer.price)
                  : 0;

              return (
                <Card key={product.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {/* Product Image */}
                      <div className="relative h-64 w-full bg-gray-100 rounded-lg overflow-hidden">
                        <Image
                          src={product.imageUrl}
                          alt={product.title}
                          fill
                          className="object-cover"
                        />
                        {product.bestPrice && (
                          <div className="absolute top-3 right-3">
                            <Badge className="bg-green-600 text-white">
                              Best Price
                            </Badge>
                          </div>
                        )}
                      </div>

                      {/* Product Info */}
                      <div>
                        <h3 className="font-semibold text-lg line-clamp-2 mb-2">
                          {product.title}
                        </h3>

                        {/* Best Price */}
                        {product.bestPrice && (
                          <div className="mb-3">
                            <p className="text-2xl font-bold text-green-600">
                              {formatCurrency(product.bestPrice)}
                            </p>
                            {priceDiff > 0 && (
                              <div className="flex items-center gap-1 text-sm text-green-600 mt-1">
                                <TrendingDown className="h-4 w-4" />
                                <span>Save {formatCurrency(priceDiff)}</span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Price Comparison */}
                        <div className="space-y-2 mb-4">
                          {lazadaOffer && (
                            <div className="flex items-center justify-between p-2 bg-orange-50 rounded">
                              <div>
                                <p className="text-sm font-medium text-orange-800">Lazada</p>
                                <p className="text-xs text-orange-600">{lazadaOffer.storeName}</p>
                              </div>
                              <p className="font-semibold text-orange-800">
                                {formatCurrency(lazadaOffer.price, lazadaOffer.currency)}
                              </p>
                            </div>
                          )}
                          {shopeeOffer && (
                            <div className="flex items-center justify-between p-2 bg-red-50 rounded">
                              <div>
                                <p className="text-sm font-medium text-red-800">Shopee</p>
                                <p className="text-xs text-red-600">{shopeeOffer.storeName}</p>
                              </div>
                              <p className="font-semibold text-red-800">
                                {formatCurrency(shopeeOffer.price, shopeeOffer.currency)}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* CTA Buttons */}
                        <div className="space-y-2">
                          {lazadaLink && (
                            <a
                              href={`/go/${lazadaLink.shortCode}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block"
                            >
                              <Button
                                className="w-full bg-orange-600 hover:bg-orange-700"
                                size="lg"
                              >
                                <ExternalLink className="mr-2 h-4 w-4" />
                                Buy on Lazada
                              </Button>
                            </a>
                          )}
                          {shopeeLink && (
                            <a
                              href={`/go/${shopeeLink.shortCode}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block"
                            >
                              <Button
                                className="w-full bg-red-600 hover:bg-red-700"
                                size="lg"
                              >
                                <ExternalLink className="mr-2 h-4 w-4" />
                                Buy on Shopee
                              </Button>
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-lg text-gray-600">
              No products available in this campaign yet.
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-sm text-gray-500">
            Powered by Affiliate Platform • Compare prices and get the best deals
          </p>
        </div>
      </footer>
    </div>
  );
}

