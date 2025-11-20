import { IsString, IsNotEmpty, IsOptional, IsDateString, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCampaignDto {
  @ApiProperty({ example: 'Summer Deal 2025' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'summer-deal-2025' })
  @IsString()
  @IsOptional()
  slug?: string;

  @ApiPropertyOptional({ example: 'Hot deals for summer! Get the best prices.' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 'summer2025' })
  @IsString()
  @IsNotEmpty()
  utmCampaign: string;

  @ApiPropertyOptional({ example: 'website' })
  @IsString()
  @IsOptional()
  utmSource?: string;

  @ApiPropertyOptional({ example: 'affiliate' })
  @IsString()
  @IsOptional()
  utmMedium?: string;

  @ApiPropertyOptional({ example: '2025-06-01T00:00:00.000Z' })
  @IsDateString()
  @IsOptional()
  startAt?: Date;

  @ApiPropertyOptional({ example: '2025-08-31T23:59:59.999Z' })
  @IsDateString()
  @IsOptional()
  endAt?: Date;
}

export class UpdateCampaignDto {
  @ApiPropertyOptional({ example: 'Summer Deal 2025 - Extended' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: 'Extended until end of September!' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 'summer2025' })
  @IsString()
  @IsOptional()
  utmCampaign?: string;

  @ApiPropertyOptional({ example: 'website' })
  @IsString()
  @IsOptional()
  utmSource?: string;

  @ApiPropertyOptional({ example: 'affiliate' })
  @IsString()
  @IsOptional()
  utmMedium?: string;

  @ApiPropertyOptional({ example: '2025-06-01T00:00:00.000Z' })
  @IsDateString()
  @IsOptional()
  startAt?: Date;

  @ApiPropertyOptional({ example: '2025-09-30T23:59:59.999Z' })
  @IsDateString()
  @IsOptional()
  endAt?: Date;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

