import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('analytics')
@Controller('analytics')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get dashboard overview statistics' })
  @ApiResponse({ status: 200, description: 'Dashboard overview data' })
  async getDashboardOverview() {
    return this.analyticsService.getDashboardOverview();
  }

  @Get('campaigns')
  @ApiOperation({ summary: 'Get campaign statistics' })
  @ApiQuery({ name: 'campaignId', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Campaign statistics' })
  async getCampaignStats(@Query('campaignId') campaignId?: string) {
    return this.analyticsService.getCampaignStats(campaignId);
  }

  @Get('products')
  @ApiOperation({ summary: 'Get product statistics' })
  @ApiQuery({ name: 'productId', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Product statistics' })
  async getProductStats(@Query('productId') productId?: string) {
    return this.analyticsService.getProductStats(productId);
  }

  @Get('trends')
  @ApiOperation({ summary: 'Get click trends over time' })
  @ApiQuery({ name: 'days', required: false, type: Number, example: 7 })
  @ApiResponse({ status: 200, description: 'Click trends data' })
  async getClickTrends(@Query('days') days?: string) {
    return this.analyticsService.getClickTrends(days ? parseInt(days, 10) : 7);
  }

  @Get('marketplace-comparison')
  @ApiOperation({ summary: 'Compare performance across marketplaces' })
  @ApiResponse({ status: 200, description: 'Marketplace comparison data' })
  async getMarketplaceComparison() {
    return this.analyticsService.getMarketplaceComparison();
  }
}

