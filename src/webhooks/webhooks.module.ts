import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WebhookLog } from './entities/webhook-log.entity';
import { WebhooksService } from './webhooks.service';
import { WebhooksController } from './webhooks.controller';
import { OrdersModule } from '../orders/orders.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([WebhookLog]),
    OrdersModule,
  ],
  controllers: [WebhooksController],
  providers: [WebhooksService],
})
export class WebhooksModule { }