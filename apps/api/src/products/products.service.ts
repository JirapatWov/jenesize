import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Marketplace } from '@affiliate/database';
import { PrismaService } from '../database/prisma.service';
import { MarketplaceAdapterFactory } from '@affiliate/adapters';
import { CreateProductDto } from './dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async createProduct(createProductDto: CreateProductDto) {
    const { url, marketplace: providedMarketplace } = createProductDto;

    // Detect marketplace if not provided
    let marketplace = providedMarketplace;
    if (!marketplace) {
      marketplace = MarketplaceAdapterFactory.detectMarketplace(url);
      if (!marketplace) {
        throw new BadRequestException('Could not detect marketplace from URL');
      }
    }

    // Get adapter and fetch product data
    const adapter = MarketplaceAdapterFactory.getAdapter(marketplace);
    const marketplaceProduct = await adapter.fetchProduct(url);

    // Check if product with this external ID already exists
    const existingOffer = await this.prisma.offer.findFirst({
      where: {
        externalId: marketplaceProduct.externalId,
        marketplace: marketplace,
      },
      include: { product: true },
    });

    if (existingOffer) {
      // Update existing offer
      await this.prisma.offer.update({
        where: { id: existingOffer.id },
        data: {
          price: marketplaceProduct.price,
          lastCheckedAt: new Date(),
        },
      });

      return this.getProductById(existingOffer.productId);
    }

    // Create new product with offer
    const product = await this.prisma.product.create({
      data: {
        title: marketplaceProduct.title,
        imageUrl: marketplaceProduct.imageUrl,
        offers: {
          create: {
            marketplace: marketplace,
            storeName: marketplaceProduct.storeName,
            price: marketplaceProduct.price,
            currency: marketplaceProduct.currency,
            externalUrl: marketplaceProduct.url,
            externalId: marketplaceProduct.externalId,
          },
        },
      },
      include: {
        offers: true,
      },
    });

    return product;
  }

  async getAllProducts() {
    const products = await this.prisma.product.findMany({
      include: {
        offers: {
          orderBy: { price: 'asc' },
        },
        _count: {
          select: { links: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return products.map((product) => ({
      ...product,
      bestPrice: product.offers.length > 0 ? Math.min(...product.offers.map((o) => o.price)) : null,
      linksCount: product._count.links,
    }));
  }

  async getProductById(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        offers: {
          orderBy: { price: 'asc' },
        },
        links: {
          include: {
            campaign: true,
            _count: {
              select: { clicks: true },
            },
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return {
      ...product,
      bestPrice: product.offers.length > 0 ? Math.min(...product.offers.map((o) => o.price)) : null,
      bestOffer: product.offers.length > 0 ? product.offers[0] : null,
    };
  }

  async getProductOffers(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        offers: {
          orderBy: { price: 'asc' },
        },
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const bestOffer = product.offers.length > 0 ? product.offers[0] : null;

    return {
      product: {
        id: product.id,
        title: product.title,
        imageUrl: product.imageUrl,
      },
      offers: product.offers.map((offer) => ({
        ...offer,
        isBestPrice: bestOffer ? offer.id === bestOffer.id : false,
      })),
      priceRange: product.offers.length > 0
        ? {
            min: Math.min(...product.offers.map((o) => o.price)),
            max: Math.max(...product.offers.map((o) => o.price)),
            currency: product.offers[0].currency,
          }
        : null,
    };
  }

  async deleteProduct(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    await this.prisma.product.delete({
      where: { id },
    });

    return { message: 'Product deleted successfully' };
  }

  async refreshProductPrices(productId: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      include: { offers: true },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const updates = [];

    for (const offer of product.offers) {
      try {
        const adapter = MarketplaceAdapterFactory.getAdapter(offer.marketplace);
        const marketplaceProduct = await adapter.fetchProduct(offer.externalUrl);

        updates.push(
          this.prisma.offer.update({
            where: { id: offer.id },
            data: {
              price: marketplaceProduct.price,
              lastCheckedAt: new Date(),
            },
          })
        );
      } catch (error) {
        console.error(`Failed to update offer ${offer.id}:`, error);
      }
    }

    await Promise.all(updates);

    return this.getProductById(productId);
  }
}

