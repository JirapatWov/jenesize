import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { PrismaService } from '../database/prisma.service';

describe('ProductsService', () => {
  let service: ProductsService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: PrismaService,
          useValue: {
            product: {
              findMany: jest.fn(),
              findUnique: jest.fn(),
              create: jest.fn(),
              delete: jest.fn(),
            },
            offer: {
              findFirst: jest.fn(),
              update: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAllProducts', () => {
    it('should return an array of products', async () => {
      const mockProducts = [
        {
          id: '1',
          title: 'Test Product',
          imageUrl: 'https://example.com/image.jpg',
          createdAt: new Date(),
          updatedAt: new Date(),
          offers: [],
          _count: { links: 0 },
        },
      ];

      jest.spyOn(prismaService.product, 'findMany').mockResolvedValue(mockProducts);

      const result = await service.getAllProducts();

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });
  });
});

