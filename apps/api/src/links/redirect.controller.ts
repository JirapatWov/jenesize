import { Controller, Get, Param, Res, Req, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiExcludeEndpoint } from '@nestjs/swagger';
import { Response, Request } from 'express';
import { LinksService } from './links.service';

@ApiTags('redirect')
@Controller('go')
export class RedirectController {
  constructor(private linksService: LinksService) {}

  @Get(':shortCode')
  @ApiOperation({ summary: 'Redirect to affiliate link and track click' })
  @ApiResponse({ status: 302, description: 'Redirect to marketplace URL' })
  @ApiResponse({ status: 404, description: 'Link not found' })
  async redirect(
    @Param('shortCode') shortCode: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const link = await this.linksService.getLinkByShortCode(shortCode);

      // Track click asynchronously (don't wait for it)
      this.linksService.trackClick(
        link.id,
        req.headers.referer,
        req.headers['user-agent'],
        req.ip,
      ).catch((error) => {
        console.error('Failed to track click:', error);
      });

      // Redirect to target URL
      res.redirect(302, link.targetUrl);
    } catch (error) {
      if (error instanceof NotFoundException) {
        res.status(404).send('Link not found');
      } else {
        throw error;
      }
    }
  }
}

