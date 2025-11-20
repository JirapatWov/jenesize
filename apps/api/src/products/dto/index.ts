import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Marketplace } from '@affiliate/database';

export class CreateProductDto {
  @ApiProperty({
    example: 'https://www.lazada.co.th/products/matcha-powder-123',
    description: 'Marketplace product URL or SKU',
  })
  @IsString()
  @IsNotEmpty()
  url: string;

  @ApiPropertyOptional({
    enum: Marketplace,
    example: Marketplace.LAZADA,
    description: 'Marketplace (auto-detected if not provided)',
  })
  @IsEnum(Marketplace)
  @IsOptional()
  marketplace?: Marketplace;
}

