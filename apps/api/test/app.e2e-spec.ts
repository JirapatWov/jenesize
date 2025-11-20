import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';

describe('API (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET) - should return 404 for root path', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(404);
  });
  
  it('/auth/register (POST) - should register a new user', () => {
    const uniqueEmail = `test${Date.now()}@example.com`;
    return request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: uniqueEmail,
        name: 'Test User',
        password: 'Password123!',
      })
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('accessToken');
        expect(res.body).toHaveProperty('refreshToken');
      });
  });

  afterAll(async () => {
    await app.close();
  });
});

