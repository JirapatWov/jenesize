import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateCampaignDto, UpdateCampaignDto } from './dto';

@Injectable()
export class CampaignsService {
  constructor(private prisma: PrismaService) {}

  async createCampaign(createCampaignDto: CreateCampaignDto) {
    const { slug, ...data } = createCampaignDto;

    // Generate slug from name if not provided
    const campaignSlug = slug || this.generateSlug(data.name);

    // Check if slug already exists
    const existingCampaign = await this.prisma.campaign.findUnique({
      where: { slug: campaignSlug },
    });

    if (existingCampaign) {
      throw new ConflictException('Campaign with this slug already exists');
    }

    const campaign = await this.prisma.campaign.create({
      data: {
        ...data,
        slug: campaignSlug,
      },
    });

    return campaign;
  }

  async getAllCampaigns(includeInactive = false) {
    const campaigns = await this.prisma.campaign.findMany({
      where: includeInactive ? {} : { isActive: true },
      include: {
        _count: {
          select: {
            links: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return campaigns.map((campaign) => ({
      ...campaign,
      linksCount: campaign._count.links,
    }));
  }

  async getCampaignById(id: string) {
    const campaign = await this.prisma.campaign.findUnique({
      where: { id },
      include: {
        links: {
          include: {
            product: {
              include: {
                offers: true,
              },
            },
            _count: {
              select: { clicks: true },
            },
          },
        },
      },
    });

    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    return {
      ...campaign,
      totalClicks: campaign.links.reduce((sum, link) => sum + link._count.clicks, 0),
    };
  }

  async getCampaignBySlug(slug: string) {
    const campaign = await this.prisma.campaign.findUnique({
      where: { slug },
      include: {
        links: {
          include: {
            product: {
              include: {
                offers: {
                  orderBy: { price: 'asc' },
                },
              },
            },
          },
        },
      },
    });

    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    // Group links by product
    const productsMap = new Map();
    campaign.links.forEach((link) => {
      if (!productsMap.has(link.productId)) {
        productsMap.set(link.productId, {
          ...link.product,
          links: [],
        });
      }
      productsMap.get(link.productId).links.push({
        id: link.id,
        marketplace: link.marketplace,
        shortCode: link.shortCode,
      });
    });

    return {
      id: campaign.id,
      name: campaign.name,
      slug: campaign.slug,
      description: campaign.description,
      startAt: campaign.startAt,
      endAt: campaign.endAt,
      isActive: campaign.isActive,
      products: Array.from(productsMap.values()).map((product) => ({
        id: product.id,
        title: product.title,
        imageUrl: product.imageUrl,
        offers: product.offers,
        links: product.links,
        bestPrice: product.offers.length > 0 ? Math.min(...product.offers.map((o) => o.price)) : null,
      })),
    };
  }

  async updateCampaign(id: string, updateCampaignDto: UpdateCampaignDto) {
    const campaign = await this.prisma.campaign.findUnique({
      where: { id },
    });

    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    const updatedCampaign = await this.prisma.campaign.update({
      where: { id },
      data: updateCampaignDto,
    });

    return updatedCampaign;
  }

  async deleteCampaign(id: string) {
    const campaign = await this.prisma.campaign.findUnique({
      where: { id },
    });

    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    await this.prisma.campaign.delete({
      where: { id },
    });

    return { message: 'Campaign deleted successfully' };
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}

