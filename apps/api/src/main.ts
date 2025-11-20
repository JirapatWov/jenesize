import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors({
    origin: process.env.WEB_URL || 'http://localhost:3000',
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    })
  );

  // Swagger API documentation
  const config = new DocumentBuilder()
    .setTitle('Affiliate Platform API')
    .setDescription('API for affiliate link management and price comparison')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth', 'Authentication endpoints')
    .addTag('products', 'Product management')
    .addTag('campaigns', 'Campaign management')
    .addTag('links', 'Affiliate link generation')
    .addTag('analytics', 'Analytics and statistics')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.API_PORT || 3001;
  await app.listen(port);
  
  console.log(`🚀 API server is running on: http://localhost:${port}`);
  console.log(`📚 API documentation available at: http://localhost:${port}/api/docs`);
}

bootstrap();

