import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { nanoid } from 'nanoid';
import * as crypto from 'crypto';
import { PrismaService } from '../database/prisma.service';
import { RedisService } from '../redis/redis.service';
import { MarketplaceAdapterFactory } from '@affiliate/adapters';
import { CreateLinkDto } from './dto';

@Injectable()
export class LinksService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  async createLink(createLinkDto: CreateLinkDto) {
    const { productId, campaignId, marketplace } = createLinkDto;

    // Verify product exists
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      include: {
        offers: {
          where: { marketplace },
        },
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (product.offers.length === 0) {
      throw new NotFoundException(`No offer found for ${marketplace} marketplace`);
    }

    // Verify campaign exists
    const campaign = await this.prisma.campaign.findUnique({
      where: { id: campaignId },
    });

    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    // Check if link already exists
    const existingLink = await this.prisma.link.findUnique({
      where: {
        productId_campaignId_marketplace: {
          productId,
          campaignId,
          marketplace,
        },
      },
    });

    if (existingLink) {
      return existingLink;
    }

    // Generate short code
    const shortCode = nanoid(8);

    // Build affiliate URL with UTM parameters
    const offer = product.offers[0];
    const adapter = MarketplaceAdapterFactory.getAdapter(marketplace);
    
    const utmParams: Record<string, string> = {
      utm_campaign: campaign.utmCampaign,
    };
    
    if (campaign.utmSource) {
      utmParams.utm_source = campaign.utmSource;
    }
    
    if (campaign.utmMedium) {
      utmParams.utm_medium = campaign.utmMedium;
    }

    const targetUrl = adapter.buildAffiliateUrl(offer.externalUrl, utmParams);

    // Create link
    const link = await this.prisma.link.create({
      data: {
        productId,
        campaignId,
        marketplace,
        shortCode,
        targetUrl,
      },
      include: {
        product: true,
        campaign: true,
      },
    });

    // Cache in Redis for fast redirects
    await this.redis.set(
      `link:${shortCode}`,
      JSON.stringify({
        id: link.id,
        targetUrl: link.targetUrl,
      }),
      86400 // 24 hours TTL
    );

    return link;
  }

  async getAllLinks(campaignId?: string) {
    const links = await this.prisma.link.findMany({
      where: campaignId ? { campaignId } : {},
      include: {
        product: true,
        campaign: true,
        _count: {
          select: { clicks: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return links.map((link) => ({
      ...link,
      clickCount: link._count.clicks,
      shortUrl: `/go/${link.shortCode}`,
    }));
  }

  async getLinkByShortCode(shortCode: string) {
    // Try Redis cache first
    const cached = await this.redis.get(`link:${shortCode}`);
    if (cached) {
      return JSON.parse(cached);
    }

    // Fallback to database
    const link = await this.prisma.link.findUnique({
      where: { shortCode },
    });

    if (!link) {
      throw new NotFoundException('Link not found');
    }

    // Cache for next time
    await this.redis.set(
      `link:${shortCode}`,
      JSON.stringify({
        id: link.id,
        targetUrl: link.targetUrl,
      }),
      86400
    );

    return {
      id: link.id,
      targetUrl: link.targetUrl,
    };
  }

  async trackClick(
    linkId: string,
    referrer?: string,
    userAgent?: string,
    ipAddress?: string,
  ) {
    // Hash IP address for privacy
    const ipHash = ipAddress
      ? crypto.createHash('sha256').update(ipAddress).digest('hex').substring(0, 16)
      : undefined;

    // Create click record
    await this.prisma.click.create({
      data: {
        linkId,
        referrer,
        userAgent,
        ipHash,
      },
    });

    // Increment click counter in Redis
    await this.redis.incr(`clicks:${linkId}`);
  }

  async deleteLink(id: string) {
    const link = await this.prisma.link.findUnique({
      where: { id },
    });

    if (!link) {
      throw new NotFoundException('Link not found');
    }

    // Remove from Redis cache
    await this.redis.del(`link:${link.shortCode}`);

    await this.prisma.link.delete({
      where: { id },
    });

    return { message: 'Link deleted successfully' };
  }
}

