import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { PriceUpdateService } from './price-update.service';

@Module({
  controllers: [ProductsController],
  providers: [ProductsService, PriceUpdateService],
  exports: [ProductsService],
})
export class ProductsModule {}

