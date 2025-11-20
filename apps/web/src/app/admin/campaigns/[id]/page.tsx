'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { ArrowLeft, Link2, Copy, MousePointerClick } from 'lucide-react';

export default function CampaignDetailPage() {
  const params = useParams();
  const campaignId = params.id as string;
  const [campaign, setCampaign] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCampaign();
    loadProducts();
  }, [campaignId]);

  const loadCampaign = async () => {
    try {
      const data = await api.getCampaign(campaignId);
      setCampaign(data);
    } catch (error) {
      console.error('Failed to load campaign:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      const data = await api.getProducts();
      setProducts(data);
    } catch (error) {
      console.error('Failed to load products:', error);
    }
  };

  const handleGenerateLink = async (productId: string, marketplace: string) => {
    try {
      await api.createLink(productId, campaignId, marketplace);
      loadCampaign();
    } catch (error: any) {
      alert(error.message || 'Failed to generate link');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="text-center py-12">
        <p>Campaign not found</p>
        <Link href="/admin/campaigns">
          <Button className="mt-4">Back to Campaigns</Button>
        </Link>
      </div>
    );
  }

  const productsInCampaign = campaign.links?.reduce((acc: any, link: any) => {
    if (!acc[link.productId]) {
      acc[link.productId] = {
        ...link.product,
        links: [],
      };
    }
    acc[link.productId].links.push(link);
    return acc;
  }, {});

  const availableProducts = products.filter(
    (p) => !productsInCampaign[p.id]
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/campaigns">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">{campaign.name}</CardTitle>
              {campaign.description && (
                <p className="text-muted-foreground mt-1">{campaign.description}</p>
              )}
            </div>
            <Badge variant={campaign.isActive ? 'default' : 'secondary'}>
              {campaign.isActive ? 'Active' : 'Inactive'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-sm text-muted-foreground">Total Products</p>
              <p className="text-2xl font-bold">{Object.keys(productsInCampaign).length}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Links</p>
              <p className="text-2xl font-bold">{campaign.links?.length || 0}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Clicks</p>
              <p className="text-2xl font-bold">{campaign.totalClicks || 0}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products in Campaign */}
      {Object.values(productsInCampaign).length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Products & Affiliate Links</h3>
          {Object.values(productsInCampaign).map((product: any) => (
            <Card key={product.id}>
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <div className="relative h-24 w-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    <Image
                      src={product.imageUrl}
                      alt={product.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold mb-2">{product.title}</h4>
                    <div className="space-y-2">
                      {product.links.map((link: any) => (
                        <div
                          key={link.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <Badge>{link.marketplace}</Badge>
                            <code className="text-sm bg-white px-2 py-1 rounded">
                              /go/{link.shortCode}
                            </code>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <MousePointerClick className="h-4 w-4" />
                              <span>{link._count?.clicks || 0}</span>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              copyToClipboard(
                                `${window.location.origin}/go/${link.shortCode}`
                              )
                            }
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Available Products */}
      {availableProducts.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Add Products to Campaign</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {availableProducts.map((product) => (
              <Card key={product.id}>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="relative h-32 w-full bg-gray-100 rounded-lg overflow-hidden">
                      <Image
                        src={product.imageUrl}
                        alt={product.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-medium text-sm line-clamp-2">{product.title}</p>
                      {product.bestPrice && (
                        <p className="text-sm font-semibold text-green-600">
                          {formatCurrency(product.bestPrice)}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      {product.offers?.map((offer: any) => (
                        <Button
                          key={offer.marketplace}
                          size="sm"
                          variant="outline"
                          className="w-full"
                          onClick={() => handleGenerateLink(product.id, offer.marketplace)}
                        >
                          <Link2 className="mr-2 h-3 w-3" />
                          Generate {offer.marketplace} Link
                        </Button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {availableProducts.length === 0 && Object.keys(productsInCampaign).length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground">
              No products available. Please add products first.
            </p>
            <Link href="/admin/products">
              <Button className="mt-4">Go to Products</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

