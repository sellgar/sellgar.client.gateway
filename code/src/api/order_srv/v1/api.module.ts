import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ApiIdentityV1Module } from '../../identity_srv/v1/api.module';
import { OrderService } from './application/order.service';
import { OrderServiceClient } from './data/order-service.client';
import { ORDER_COMMAND_SERVICE } from './data/order-service.constants';
import { OrderController } from './presentation/order.controller';
import { OrderLinkController } from './presentation/order-link.controller';

@Module({
  imports: [
    ApiIdentityV1Module,
    ClientsModule.registerAsync([
      {
        name: ORDER_COMMAND_SERVICE,
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [
              {
                hostname: config.getOrThrow('AMQP_HOSTNAME'),
                port: config.getOrThrow('AMQP_PORT'),
                username: config.getOrThrow('AMQP_USERNAME'),
                password: config.getOrThrow('AMQP_PASSWORD'),
              },
            ],
            queue: config.getOrThrow<string>('AMQP_ORDER_SRV_COMMAND_QUEUE'),
            queueOptions: { durable: true },
          },
        }),
      },
    ]),
  ],
  controllers: [OrderController, OrderLinkController],
  providers: [OrderService, OrderServiceClient],
})
export class ApiOrderV1Module {}
