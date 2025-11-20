import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { Marketplace } from '@affiliate/database';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getDashboardOverview() {
    // Get counts
    const [totalCampaigns, totalProducts, totalLinks, totalClicks] = await Promise.all([
      this.prisma.campaign.count({ where: { isActive: true } }),
      this.prisma.product.count(),
      this.prisma.link.count(),
      this.prisma.click.count(),
    ]);

    // Get top campaigns
    const campaigns = await this.prisma.campaign.findMany({
      where: { isActive: true },
      include: {
        links: {
          include: {
            _count: {
              select: { clicks: true },
            },
          },
        },
      },
      take: 5,
      orderBy: { createdAt: 'desc' },
    });

    const topCampaigns = campaigns
      .map((campaign) => ({
        campaignId: campaign.id,
        campaignName: campaign.name,
        totalClicks: campaign.links.reduce((sum, link) => sum + link._count.clicks, 0),
        totalProducts: new Set(campaign.links.map((l) => l.productId)).size,
        totalLinks: campaign.links.length,
      }))
      .sort((a, b) => b.totalClicks - a.totalClicks)
      .slice(0, 5);

    // Get top products
    const products = await this.prisma.product.findMany({
      include: {
        links: {
          include: {
            _count: {
              select: { clicks: true },
            },
          },
        },
        offers: {
          orderBy: { price: 'asc' },
          take: 1,
        },
      },
      take: 10,
    });

    const topProducts = products
      .map((product) => {
        const clicksByMarketplace: Record<Marketplace, number> = {
          [Marketplace.LAZADA]: 0,
          [Marketplace.SHOPEE]: 0,
        };

        let totalClicks = 0;
        product.links.forEach((link) => {
          const clicks = link._count.clicks;
          totalClicks += clicks;
          clicksByMarketplace[link.marketplace] += clicks;
        });

        return {
          productId: product.id,
          productTitle: product.title,
          totalClicks,
          clicksByMarketplace,
          bestOffer: product.offers[0] || null,
        };
      })
      .sort((a, b) => b.totalClicks - a.totalClicks)
      .slice(0, 5);

    // Get recent clicks
    const recentClicks = await this.prisma.click.findMany({
      take: 10,
      orderBy: { timestamp: 'desc' },
      include: {
        link: {
          include: {
            product: true,
            campaign: true,
          },
        },
      },
    });

    const recentClicksFormatted = recentClicks.map((click) => ({
      timestamp: click.timestamp,
      productTitle: click.link.product.title,
      campaignName: click.link.campaign.name,
      marketplace: click.link.marketplace,
    }));

    return {
      totalCampaigns,
      totalProducts,
      totalLinks,
      totalClicks,
      topCampaigns,
      topProducts,
      recentClicks: recentClicksFormatted,
    };
  }

  async getCampaignStats(campaignId?: string) {
    const where = campaignId ? { id: campaignId } : { isActive: true };

    const campaigns = await this.prisma.campaign.findMany({
      where,
      include: {
        links: {
          include: {
            _count: {
              select: { clicks: true },
            },
          },
        },
      },
    });

    return campaigns.map((campaign) => {
      const totalClicks = campaign.links.reduce((sum, link) => sum + link._count.clicks, 0);
      const uniqueProducts = new Set(campaign.links.map((l) => l.productId)).size;

      return {
        campaignId: campaign.id,
        campaignName: campaign.name,
        slug: campaign.slug,
        totalClicks,
        totalProducts: uniqueProducts,
        totalLinks: campaign.links.length,
        isActive: campaign.isActive,
        startAt: campaign.startAt,
        endAt: campaign.endAt,
        ctr: campaign.links.length > 0 ? (totalClicks / campaign.links.length).toFixed(2) : '0',
      };
    });
  }

  async getProductStats(productId?: string) {
    const where = productId ? { id: productId } : {};

    const products = await this.prisma.product.findMany({
      where,
      include: {
        links: {
          include: {
            _count: {
              select: { clicks: true },
            },
          },
        },
        offers: {
          orderBy: { price: 'asc' },
          take: 1,
        },
      },
    });

    return products.map((product) => {
      const clicksByMarketplace: Record<Marketplace, number> = {
        [Marketplace.LAZADA]: 0,
        [Marketplace.SHOPEE]: 0,
      };

      let totalClicks = 0;
      product.links.forEach((link) => {
        const clicks = link._count.clicks;
        totalClicks += clicks;
        clicksByMarketplace[link.marketplace] += clicks;
      });

      return {
        productId: product.id,
        productTitle: product.title,
        imageUrl: product.imageUrl,
        totalClicks,
        totalLinks: product.links.length,
        clicksByMarketplace,
        bestOffer: product.offers[0] || null,
      };
    });
  }

  async getClickTrends(days = 7) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const clicks = await this.prisma.click.findMany({
      where: {
        timestamp: {
          gte: startDate,
        },
      },
      orderBy: { timestamp: 'asc' },
    });

    // Group by date
    const clicksByDate = new Map<string, number>();
    
    // Initialize all dates with 0
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (days - 1 - i));
      const dateStr = date.toISOString().split('T')[0];
      clicksByDate.set(dateStr, 0);
    }

    // Count clicks per date
    clicks.forEach((click) => {
      const dateStr = click.timestamp.toISOString().split('T')[0];
      clicksByDate.set(dateStr, (clicksByDate.get(dateStr) || 0) + 1);
    });

    return Array.from(clicksByDate.entries()).map(([date, clicks]) => ({
      date,
      clicks,
    }));
  }

  async getMarketplaceComparison() {
    const links = await this.prisma.link.findMany({
      include: {
        _count: {
          select: { clicks: true },
        },
      },
    });

    const stats = {
      [Marketplace.LAZADA]: {
        totalLinks: 0,
        totalClicks: 0,
      },
      [Marketplace.SHOPEE]: {
        totalLinks: 0,
        totalClicks: 0,
      },
    };

    links.forEach((link) => {
      stats[link.marketplace].totalLinks++;
      stats[link.marketplace].totalClicks += link._count.clicks;
    });

    return Object.entries(stats).map(([marketplace, data]) => ({
      marketplace,
      totalLinks: data.totalLinks,
      totalClicks: data.totalClicks,
      averageClicksPerLink: data.totalLinks > 0
        ? (data.totalClicks / data.totalLinks).toFixed(2)
        : '0',
    }));
  }
}

