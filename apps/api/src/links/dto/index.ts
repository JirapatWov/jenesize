import { IsString, IsNotEmpty, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Marketplace } from '@affiliate/database';

export class CreateLinkDto {
  @ApiProperty({ example: 'clxxx-product-id' })
  @IsString()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({ example: 'clxxx-campaign-id' })
  @IsString()
  @IsNotEmpty()
  campaignId: string;

  @ApiProperty({ enum: Marketplace, example: Marketplace.LAZADA })
  @IsEnum(Marketplace)
  @IsNotEmpty()
  marketplace: Marketplace;
}

