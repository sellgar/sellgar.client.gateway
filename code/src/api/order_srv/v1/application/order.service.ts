import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { validateOrReject } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { ClientPrincipal } from '../../../identity_srv/v1/session.types';
import { OrderServiceClient } from '../data/order-service.client';
import { ScopedOrderEntity } from '../data/scoped-order.entity';
import { OrderEntity } from '../domain/order.entity';
import { OrderConfirmationEntity } from '../domain/order-confirmation.entity';
import { CreateDraftDto } from '../presentation/dto/create-draft.dto';
import { ConfirmOrderDto } from '../presentation/dto/confirm-order.dto';
import { OrderCommandDto } from '../presentation/dto/order-command.dto';
import { OrderLinkDto } from '../presentation/dto/order-link.dto';
import { PayLinkedOrderDto } from '../presentation/dto/pay-linked-order.dto';

@Injectable()
export class OrderService {
  constructor(
    private readonly config: ConfigService,
    private readonly client: OrderServiceClient,
  ) {}

  draft(principal: ClientPrincipal, input: CreateDraftDto) {
    return this.client.request('order.draft.create', { ...input, ...this.scope(principal) }, OrderEntity);
  }

  get(principal: ClientPrincipal, orderUuid: string) {
    return this.client.request('order.get', { orderUuid, ...this.scope(principal) }, OrderEntity);
  }

  confirm(principal: ClientPrincipal, orderUuid: string, input: ConfirmOrderDto) {
    return this.client.request(
      'order.confirm',
      { ...input, orderUuid, ...this.scope(principal) },
      OrderConfirmationEntity,
    );
  }

  pay(principal: ClientPrincipal, orderUuid: string, input: OrderCommandDto) {
    return this.client.request('order.pay', { ...input, orderUuid, ...this.scope(principal) }, OrderEntity);
  }

  async linked(input: OrderLinkDto) {
    const order = plainToInstance(OrderEntity, await this.resolve(input), { excludeExtraneousValues: true });
    await validateOrReject(order);
    return order;
  }

  async payLinked(input: PayLinkedOrderDto) {
    const order = await this.resolve(input);
    return this.client.request(
      'order.pay',
      {
        commandId: input.commandId,
        orderUuid: order.uuid,
        ownerUuid: order.snapshot.ownerUuid,
        shopUuid: order.snapshot.shop.uuid,
      },
      OrderEntity,
    );
  }

  private async resolve(input: OrderLinkDto) {
    const order = await this.client.request(
      'order.getByAccessToken',
      { accessToken: input.accessToken },
      ScopedOrderEntity,
    );
    if (
      order.uuid !== input.orderUuid ||
      order.snapshot.shop.uuid !== this.config.getOrThrow<string>('STOREFRONT_SHOP_UUID')
    )
      throw new NotFoundException('Order not found');
    return order;
  }

  private scope(principal: ClientPrincipal) {
    return { ownerUuid: principal.ownerUuid, shopUuid: this.config.getOrThrow<string>('STOREFRONT_SHOP_UUID') };
  }
}
