'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'];

export default function AnalyticsPage() {
  const [trends, setTrends] = useState<any[]>([]);
  const [campaignStats, setCampaignStats] = useState<any[]>([]);
  const [productStats, setProductStats] = useState<any[]>([]);
  const [marketplaceComparison, setMarketplaceComparison] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const [trendsData, campaignsData, productsData, marketplaceData] = await Promise.all([
        api.getClickTrends(7),
        api.getCampaignStats(),
        api.getProductStats(),
        api.getMarketplaceComparison(),
      ]);

      setTrends(trendsData);
      setCampaignStats(campaignsData);
      setProductStats(productsData.slice(0, 5)); // Top 5 products
      setMarketplaceComparison(marketplaceData);
    } catch (error) {
      console.error('Failed to load analytics:', error);
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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Analytics Dashboard</h2>
        <p className="text-muted-foreground">
          Track your campaign performance and click statistics
        </p>
      </div>

      {/* Click Trends Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Click Trends (Last 7 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="clicks"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Marketplace Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Marketplace Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={marketplaceComparison}
                  dataKey="totalClicks"
                  nameKey="marketplace"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={(entry) => `${entry.marketplace}: ${entry.totalClicks}`}
                >
                  {marketplaceComparison.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>

            <div className="space-y-4">
              {marketplaceComparison.map((marketplace, index) => (
                <div
                  key={marketplace.marketplace}
                  className="p-4 border rounded-lg"
                  style={{ borderColor: COLORS[index % COLORS.length] }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">{marketplace.marketplace}</h4>
                    <Badge>{marketplace.totalClicks} clicks</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                    <div>
                      <p>Total Links</p>
                      <p className="font-medium text-foreground">{marketplace.totalLinks}</p>
                    </div>
                    <div>
                      <p>Avg. Clicks/Link</p>
                      <p className="font-medium text-foreground">
                        {marketplace.averageClicksPerLink}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Campaign Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Campaign Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={campaignStats.slice(0, 5)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="campaignName" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="totalClicks" fill="#3b82f6" name="Total Clicks" />
              <Bar dataKey="totalLinks" fill="#10b981" name="Total Links" />
            </BarChart>
          </ResponsiveContainer>

          <div className="mt-6 space-y-3">
            {campaignStats.slice(0, 5).map((campaign, index) => (
              <div
                key={campaign.campaignId}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  >
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium">{campaign.campaignName}</p>
                    <p className="text-sm text-muted-foreground">
                      {campaign.totalProducts} products • {campaign.totalLinks} links
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-lg">{campaign.totalClicks}</p>
                  <p className="text-xs text-muted-foreground">clicks</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Products */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Products</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {productStats.map((product, index) => (
              <div
                key={product.productId}
                className="flex items-start justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start gap-3 flex-1">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  >
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{product.productTitle}</p>
                    <div className="flex gap-4 mt-2 text-sm">
                      <div className="flex items-center gap-1">
                        <Badge variant="outline">Lazada</Badge>
                        <span className="text-muted-foreground">
                          {product.clicksByMarketplace.LAZADA} clicks
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Badge variant="outline">Shopee</Badge>
                        <span className="text-muted-foreground">
                          {product.clicksByMarketplace.SHOPEE} clicks
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-lg">{product.totalClicks}</p>
                  <p className="text-xs text-muted-foreground">total clicks</p>
                </div>
              </div>
            ))}
          </div>

          {productStats.length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              No product data available yet
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

