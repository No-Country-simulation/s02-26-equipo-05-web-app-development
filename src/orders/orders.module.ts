import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { Order } from './entities/order.entity';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [TypeOrmModule.forFeature([Order]),
  EmailModule,],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService], // Exportamos para usar en Webhooks
})
export class OrdersModule { }