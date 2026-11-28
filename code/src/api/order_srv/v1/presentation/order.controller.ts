import { Body, Controller, Header, Get, Param, ParseUUIDPipe, Post, Req, UseGuards } from '@nestjs/common';
import { SessionGuard } from '../../../identity_srv/v1/session.guard';
import { SessionRequest } from '../../../identity_srv/v1/session.types';
import { OrderService } from '../application/order.service';
import { CreateDraftDto } from './dto/create-draft.dto';
import { ConfirmOrderDto } from './dto/confirm-order.dto';
import { OrderCommandDto } from './dto/order-command.dto';

@Controller('v1/orders')
@UseGuards(SessionGuard)
export class OrderController {
  constructor(private readonly orders: OrderService) {}

  @Header('Cache-Control', 'no-store')
  @Post('drafts')
  draft(
    @Req()
    req: SessionRequest,
    @Body()
    input: CreateDraftDto,
  ) {
    return this.orders.draft(req.principal!, input);
  }

  @Header('Cache-Control', 'no-store')
  @Get(':uuid')
  get(
    @Req()
    req: SessionRequest,
    @Param('uuid', ParseUUIDPipe)
    uuid: string,
  ) {
    return this.orders.get(req.principal!, uuid);
  }

  @Header('Cache-Control', 'no-store')
  @Post(':uuid/confirm')
  confirm(
    @Req()
    req: SessionRequest,
    @Param('uuid', ParseUUIDPipe)
    uuid: string,
    @Body()
    input: ConfirmOrderDto,
  ) {
    return this.orders.confirm(req.principal!, uuid, input);
  }

  @Header('Cache-Control', 'no-store')
  @Post(':uuid/pay')
  pay(
    @Req()
    req: SessionRequest,
    @Param('uuid', ParseUUIDPipe)
    uuid: string,
    @Body()
    input: OrderCommandDto,
  ) {
    return this.orders.pay(req.principal!, uuid, input);
  }
}
