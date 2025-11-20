import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../database/prisma.service';
import { MarketplaceAdapterFactory } from '@affiliate/adapters';

@Injectable()
export class PriceUpdateService {
  private readonly logger = new Logger(PriceUpdateService.name);

  constructor(private prisma: PrismaService) {}

  // Run every 6 hours
  @Cron(CronExpression.EVERY_6_HOURS)
  async handlePriceUpdate() {
    this.logger.log('Starting scheduled price update...');

    try {
      const offers = await this.prisma.offer.findMany({
        where: {
          lastCheckedAt: {
            lt: new Date(Date.now() - 6 * 60 * 60 * 1000), // Older than 6 hours
          },
        },
        take: 100, // Update 100 offers at a time
      });

      this.logger.log(`Found ${offers.length} offers to update`);

      for (const offer of offers) {
        try {
          const adapter = MarketplaceAdapterFactory.getAdapter(offer.marketplace);
          const marketplaceProduct = await adapter.fetchProduct(offer.externalUrl);

          await this.prisma.offer.update({
            where: { id: offer.id },
            data: {
              price: marketplaceProduct.price,
              lastCheckedAt: new Date(),
            },
          });

          this.logger.debug(`Updated offer ${offer.id} - New price: ${marketplaceProduct.price}`);
        } catch (error) {
          this.logger.error(`Failed to update offer ${offer.id}:`, error);
        }

        // Add small delay to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      this.logger.log('Price update completed successfully');
    } catch (error) {
      this.logger.error('Price update failed:', error);
    }
  }
}

