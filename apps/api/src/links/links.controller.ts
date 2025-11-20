import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { LinksService } from './links.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateLinkDto } from './dto';

@ApiTags('links')
@Controller('links')
export class LinksController {
  constructor(private linksService: LinksService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Generate affiliate link' })
  @ApiResponse({ status: 201, description: 'Link successfully created' })
  @ApiResponse({ status: 404, description: 'Product or campaign not found' })
  async createLink(@Body() createLinkDto: CreateLinkDto) {
    return this.linksService.createLink(createLinkDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all affiliate links' })
  @ApiQuery({ name: 'campaignId', required: false, type: String })
  @ApiResponse({ status: 200, description: 'List of all links' })
  async getAllLinks(@Query('campaignId') campaignId?: string) {
    return this.linksService.getAllLinks(campaignId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete an affiliate link' })
  @ApiResponse({ status: 200, description: 'Link successfully deleted' })
  @ApiResponse({ status: 404, description: 'Link not found' })
  async deleteLink(@Param('id') id: string) {
    return this.linksService.deleteLink(id);
  }
}

