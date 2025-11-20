import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { CampaignsService } from './campaigns.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateCampaignDto, UpdateCampaignDto } from './dto';

@ApiTags('campaigns')
@Controller('campaigns')
export class CampaignsController {
  constructor(private campaignsService: CampaignsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new campaign' })
  @ApiResponse({ status: 201, description: 'Campaign successfully created' })
  @ApiResponse({ status: 409, description: 'Campaign with this slug already exists' })
  async createCampaign(@Body() createCampaignDto: CreateCampaignDto) {
    return this.campaignsService.createCampaign(createCampaignDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all campaigns' })
  @ApiQuery({ name: 'includeInactive', required: false, type: Boolean })
  @ApiResponse({ status: 200, description: 'List of all campaigns' })
  async getAllCampaigns(@Query('includeInactive') includeInactive?: string) {
    return this.campaignsService.getAllCampaigns(includeInactive === 'true');
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get campaign by slug (for public landing pages)' })
  @ApiResponse({ status: 200, description: 'Campaign details with products' })
  @ApiResponse({ status: 404, description: 'Campaign not found' })
  async getCampaignBySlug(@Param('slug') slug: string) {
    return this.campaignsService.getCampaignBySlug(slug);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get campaign by ID' })
  @ApiResponse({ status: 200, description: 'Campaign details' })
  @ApiResponse({ status: 404, description: 'Campaign not found' })
  async getCampaignById(@Param('id') id: string) {
    return this.campaignsService.getCampaignById(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a campaign' })
  @ApiResponse({ status: 200, description: 'Campaign successfully updated' })
  @ApiResponse({ status: 404, description: 'Campaign not found' })
  async updateCampaign(@Param('id') id: string, @Body() updateCampaignDto: UpdateCampaignDto) {
    return this.campaignsService.updateCampaign(id, updateCampaignDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a campaign' })
  @ApiResponse({ status: 200, description: 'Campaign successfully deleted' })
  @ApiResponse({ status: 404, description: 'Campaign not found' })
  async deleteCampaign(@Param('id') id: string) {
    return this.campaignsService.deleteCampaign(id);
  }
}

