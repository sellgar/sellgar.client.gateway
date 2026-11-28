import { randomUUID } from 'node:crypto';
import { INestApplication, Logger, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { of, throwError } from 'rxjs';
import request from 'supertest';
import { AllExceptionsFilter } from '@/common/exceptions/all-exception.filter';
import { IDENTITY_COMMAND_SERVICE } from '../../../identity_srv/v1/identity.gateway';
import { ApiOrderV1Module } from '../api.module';
import { ORDER_COMMAND_SERVICE } from '../data/order-service.constants';

describe('Customer checkout boundary', () => {
  let app: INestApplication;
  const send = jest.fn(),
    identity = jest.fn();
  const ownerUuid = randomUUID(),
    shopUuid = randomUUID(),
    sessionUuid = randomUUID();
  const orderUuid = randomUUID(),
    cartUuid = randomUUID(),
    recordUuid = randomUUID();
  const accessToken = 'a'.repeat(43);
  const snapshot = {
    ownerUuid,
    cartUuid,
    shop: { uuid: shopUuid, name: 'Магазин' },
    currencyCode: 'RUB',
    itemsTotal: '199.00',
    items: [
      {
        recordUuid,
        offerUuid: randomUUID(),
        productUuid: randomUUID(),
        variantUuid: randomUUID(),
        productName: 'Тарелка',
        variantName: 'Белая',
        article: null,
        clarifications: [],
        imageUuid: null,
        quantity: 1,
        expectedItemVersion: '2',
        unitPrice: { uuid: randomUUID(), value: '199.00', currencyCode: 'RUB' },
        subtotal: '199.00',
      },
    ],
  };
  const order = {
    uuid: orderUuid,
    version: '1',
    status: 'draft',
    snapshotVersion: 1,
    snapshot,
    email: null,
    paymentUuid: null,
    paymentProvider: null,
    paymentDueAt: null,
    failureCode: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const auth = (req: request.Test) =>
    req.set('Cookie', 'client.sid=test-session').set('x-device-id', 'device').set('User-Agent', 'Checkout test');

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          ignoreEnvFile: true,
          load: [
            () => ({
              STOREFRONT_SHOP_UUID: shopUuid,
              AUTH_COOKIE: 'client.sid',
              AUTH_COOKIE_SECURE: false,
              SOCKET_TICKET_SECRET: 'secret-longer-than-thirty-two-characters',
              SOCKET_TICKET_AUDIENCE: 'realtime',
            }),
          ],
        }),
        ApiOrderV1Module,
      ],
    })
      .overrideProvider(ORDER_COMMAND_SERVICE)
      .useValue({ send })
      .overrideProvider(IDENTITY_COMMAND_SERVICE)
      .useValue({ send: identity })
      .compile();
    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    app.useGlobalFilters(new AllExceptionsFilter());
    await app.init();
  });
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
    identity.mockReturnValue(
      of({
        data: {
          status: 'active',
          userId: null,
          ownerUuid,
          sessionId: sessionUuid,
          expiresAt: new Date(Date.now() + 3600000).toISOString(),
        },
      }),
    );
    send.mockReturnValue(of(order));
  });
  afterEach(() => jest.restoreAllMocks());
  afterAll(async () => app.close());

  it('requires session for owner operations; accepts only server-derived owner and shop', async () => {
    await request(app.getHttpServer()).get(`/v1/orders/${orderUuid}`).expect(401);
    expect(send).not.toHaveBeenCalled();
    const commandId = randomUUID();
    const result = await auth(request(app.getHttpServer()).post('/v1/orders/drafts'))
      .send({
        commandId,
        cartUuid,
        ownerUuid: randomUUID(),
        shopUuid: randomUUID(),
        itemsTotal: '0.01',
        items: [{ recordUuid, quantity: 1, expectedItemVersion: '2', unitPrice: '0.01' }],
      })
      .expect(201);
    expect(send).toHaveBeenCalledWith(
      { cmd: 'order.draft.create' },
      { commandId, cartUuid, ownerUuid, shopUuid, items: [{ recordUuid, quantity: 1, expectedItemVersion: '2' }] },
    );
    expect(result.body.snapshot.ownerUuid).toBeUndefined();
    expect(result.body.snapshot.cartUuid).toBeUndefined();
    expect(result.body.snapshot.items[0].expectedItemVersion).toBeUndefined();
    expect(result.headers['cache-control']).toBe('no-store');
  });

  it('rejects empty/duplicate selections and malformed email before Order', async () => {
    const base = { commandId: randomUUID(), cartUuid };
    await auth(request(app.getHttpServer()).post('/v1/orders/drafts'))
      .send({ ...base, items: [] })
      .expect(400);
    const item = { recordUuid, quantity: 1, expectedItemVersion: '2' };
    await auth(request(app.getHttpServer()).post('/v1/orders/drafts'))
      .send({ ...base, items: [item, item] })
      .expect(400);
    await auth(request(app.getHttpServer()).post(`/v1/orders/${orderUuid}/confirm`))
      .send({ commandId: randomUUID(), email: 'invalid' })
      .expect(400);
    expect(send).not.toHaveBeenCalled();
  });

  it('returns the personal capability only in confirmation, and passes command UUID unchanged', async () => {
    const commandId = randomUUID();
    send.mockReturnValue(of({ order: { ...order, status: 'confirming', email: 'buyer@example.org' }, accessToken }));
    const result = await auth(request(app.getHttpServer()).post(`/v1/orders/${orderUuid}/confirm`))
      .send({ commandId, email: 'buyer@example.org' })
      .expect(201);
    expect(result.body.accessToken).toBe(accessToken);
    expect(result.body.order.snapshot.ownerUuid).toBeUndefined();
    expect(send).toHaveBeenCalledWith(
      { cmd: 'order.confirm' },
      { ownerUuid, shopUuid, orderUuid, commandId, email: 'buyer@example.org' },
    );
  });

  it('opens a personal link without a session, but rejects a capability for a different order or shop', async () => {
    const response = await request(app.getHttpServer())
      .post('/v1/order-links/resolve')
      .send({ orderUuid, accessToken })
      .expect(201);
    expect(response.body.snapshot.ownerUuid).toBeUndefined();
    expect(identity).not.toHaveBeenCalled();
    expect(send).toHaveBeenCalledWith({ cmd: 'order.getByAccessToken' }, { accessToken });
    await request(app.getHttpServer())
      .post('/v1/order-links/resolve')
      .send({ orderUuid: randomUUID(), accessToken })
      .expect(404);
    send.mockReturnValue(
      of({ ...order, snapshot: { ...snapshot, shop: { uuid: randomUUID(), name: 'Другой магазин' } } }),
    );
    await request(app.getHttpServer()).post('/v1/order-links/resolve').send({ orderUuid, accessToken }).expect(404);
  });

  it('authorizes linked payment from the verified snapshot, never from request owner identifiers', async () => {
    const commandId = randomUUID();
    send.mockImplementation(({ cmd }) =>
      of(cmd === 'order.getByAccessToken' ? order : { ...order, status: 'processing' }),
    );
    await request(app.getHttpServer())
      .post('/v1/order-links/pay')
      .send({ orderUuid, accessToken, commandId, ownerUuid: randomUUID() })
      .expect(201);
    expect(send).toHaveBeenLastCalledWith({ cmd: 'order.pay' }, { commandId, orderUuid, ownerUuid, shopUuid });
  });

  it('preserves upstream failures and refuses malformed snapshots; no public test-result command', async () => {
    send.mockReturnValue(throwError(() => ({ statusCode: 409, message: 'Order not ready' })));
    await auth(request(app.getHttpServer()).post(`/v1/orders/${orderUuid}/pay`))
      .send({ commandId: randomUUID() })
      .expect(409);
    send.mockReturnValue(of({ ...order, snapshot: { ...snapshot, itemsTotal: 199 } }));
    await auth(request(app.getHttpServer()).get(`/v1/orders/${orderUuid}`)).expect(502);
    await request(app.getHttpServer()).post('/v1/payment/test/result').send({ outcome: 'succeeded' }).expect(404);
  });
});
