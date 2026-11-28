import { Body, Controller, Header, Post } from '@nestjs/common';
import { OrderService } from '../application/order.service';
import { OrderLinkDto } from './dto/order-link.dto';
import { PayLinkedOrderDto } from './dto/pay-linked-order.dto';

@Controller('v1/order-links')
export class OrderLinkController {
  constructor(private readonly orders: OrderService) {}

  @Header('Cache-Control', 'no-store')
  @Post('resolve')
  resolve(
    @Body()
    input: OrderLinkDto,
  ) {
    return this.orders.linked(input);
  }

  @Header('Cache-Control', 'no-store')
  @Post('pay')
  pay(
    @Body()
    input: PayLinkedOrderDto,
  ) {
    return this.orders.payLinked(input);
  }
}
