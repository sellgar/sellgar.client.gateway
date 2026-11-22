import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { of } from 'rxjs';
import request from 'supertest';

import { ProductGateway } from './gateway/product.gateway';
import { StoreProductGateway } from './gateway/store-product.gateway';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';

describe('Storefront category query HTTP contract', () => {
  let app: INestApplication;
  const categoryUuid = 'be250838-85f9-41fa-b9f3-99aba3590640';
  const shopUuid = 'c5da1f34-cdf6-4c48-8db0-b183b5accbe9';
  const send = jest.fn().mockReturnValue(of({ items: [], meta: { limit: 50, nextToken: null } }));
  const policy = {
    shopUuid,
    productShowing: true,
    variantShowing: true,
    availableMin: 1,
  };

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        ProductsService,
        StoreProductGateway,
        { provide: 'STORE_COMMAND_SERVICE', useValue: { send } },
        { provide: ConfigService, useValue: new ConfigService({ STOREFRONT_SHOP_UUID: shopUuid }) },
        { provide: ProductGateway, useValue: { getByUuid: jest.fn(), getBrand: jest.fn() } },
      ],
    }).compile();
    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  });

  beforeEach(() => send.mockClear());
  afterAll(async () => app.close());

  it('passes category and search through both DTOs while enforcing storefront scope', async () => {
    const result = await request(app.getHttpServer())
      .get('/v1/products')
      .query({
        categoryUuid,
        brandCode: 'apple',
        search: '  телефон  ',
        shopUuid: categoryUuid,
        productShowing: false,
        availableMin: 0,
      })
      .expect(200);

    expect(send).toHaveBeenCalledWith(
      { cmd: 'store.offer.getAll' },
      { query: expect.objectContaining({ ...policy, categoryUuid, brandCode: 'apple', search: 'телефон' }) },
    );
    expect(result.body).toEqual({ items: [], meta: { limit: 50, nextToken: null } });
  });

  it('preserves the unfiltered contract when categoryUuid is omitted', async () => {
    await request(app.getHttpServer()).get('/v1/products').expect(200);

    expect(send).toHaveBeenCalledWith({ cmd: 'store.offer.getAll' }, { query: expect.objectContaining(policy) });
    expect(send.mock.calls[0][1].query.categoryUuid).toBeUndefined();
    expect(send.mock.calls[0][1].query.productStatus).toBeUndefined();
    expect(send.mock.calls[0][1].query.variantStatus).toBeUndefined();
  });

  it('passes several categories as an array without changing the storefront policy', async () => {
    await request(app.getHttpServer())
      .get(`/v1/products?categoryUuid=${categoryUuid}&categoryUuid=${shopUuid}`)
      .expect(200);
    expect(send).toHaveBeenCalledWith(
      { cmd: 'store.offer.getAll' },
      { query: expect.objectContaining({ ...policy, categoryUuid: [categoryUuid, shopUuid] }) },
    );
  });

  it.each(['', 'invalid', `${categoryUuid}&categoryUuid=invalid`])(
    'rejects malformed categories before contacting Store: %s',
    async (value) => {
      await request(app.getHttpServer()).get(`/v1/products?categoryUuid=${value}`).expect(400);
      expect(send).not.toHaveBeenCalled();
    },
  );

  it('passes several brands to Store alongside category and storefront scope', async () => {
    await request(app.getHttpServer())
      .get('/v1/products')
      .query({ brandCode: ['apple', 'samsung'], categoryUuid })
      .expect(200);
    expect(send).toHaveBeenCalledWith(
      { cmd: 'store.offer.getAll' },
      {
        query: expect.objectContaining({ ...policy, categoryUuid, brandCode: ['apple', 'samsung'] }),
      },
    );
  });

  it.each(['', 'a'.repeat(257)])('rejects invalid brand codes before Store: %s', async (brandCode) => {
    await request(app.getHttpServer()).get('/v1/products').query({ brandCode }).expect(400);
    expect(send).not.toHaveBeenCalled();
  });
});
