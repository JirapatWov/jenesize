'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/lib/api';
import { Package, Megaphone, Link2, MousePointerClick } from 'lucide-react';

export default function AdminDashboard() {
  const [overview, setOverview] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOverview();
  }, []);

  const loadOverview = async () => {
    try {
      const data = await api.getDashboardOverview();
      setOverview(data);
    } catch (error) {
      console.error('Failed to load overview:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const stats = [
    {
      name: 'Total Products',
      value: overview?.totalProducts || 0,
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      name: 'Active Campaigns',
      value: overview?.totalCampaigns || 0,
      icon: Megaphone,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      name: 'Affiliate Links',
      value: overview?.totalLinks || 0,
      icon: Link2,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      name: 'Total Clicks',
      value: overview?.totalClicks || 0,
      icon: MousePointerClick,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Dashboard Overview</h2>
        <p className="text-muted-foreground">
          Welcome to your affiliate platform management dashboard
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.name}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.name}</CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Top Campaigns */}
      {overview?.topCampaigns && overview.topCampaigns.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Campaigns</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {overview.topCampaigns.map((campaign: any) => (
                <div key={campaign.campaignId} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{campaign.campaignName}</p>
                    <p className="text-sm text-muted-foreground">
                      {campaign.totalLinks} links • {campaign.totalProducts} products
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{campaign.totalClicks} clicks</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top Products */}
      {overview?.topProducts && overview.topProducts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {overview.topProducts.map((product: any) => (
                <div key={product.productId} className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium">{product.productTitle}</p>
                    <p className="text-sm text-muted-foreground">
                      Lazada: {product.clicksByMarketplace.LAZADA} • Shopee: {product.clicksByMarketplace.SHOPEE}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{product.totalClicks} clicks</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Activity */}
      {overview?.recentClicks && overview.recentClicks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Clicks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {overview.recentClicks.slice(0, 5).map((click: any, index: number) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex-1">
                    <p className="font-medium">{click.productTitle}</p>
                    <p className="text-xs text-muted-foreground">
                      {click.campaignName} • {click.marketplace}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {new Date(click.timestamp).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

