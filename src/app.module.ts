import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as Joi from 'joi';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LeadsModule } from './leads/leads.module';
import { OrdersModule } from './orders/orders.module';
import { WebhooksModule } from './webhooks/webhooks.module';
import { PaymentsModule } from './payments/payments.module';
import { EmailModule } from './email/email.module';
import { PipedriveModule } from './pipedrive/pipedrive.module';
import { TrackingModule } from './tracking/tracking.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        PORT: Joi.number().default(3000),
        DATABASE_URL: Joi.string().required(),
        STRIPE_SECRET_KEY: Joi.string().required(),
        STRIPE_WEBHOOK_SECRET: Joi.string().required(),
        PIPEDRIVE_API_TOKEN: Joi.string().required(),
        RESEND_API_KEY: Joi.string().required(),
        META_PIXEL_ID: Joi.string().optional(),
        META_ACCESS_TOKEN: Joi.string().optional(),
        GA4_MEASUREMENT_ID: Joi.string().optional(),
        GA4_API_SECRET: Joi.string().optional(),
      }),
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get<string>('DATABASE_URL'),
        ssl: {
          rejectUnauthorized: false,
        },
        autoLoadEntities: true,
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    LeadsModule,
    OrdersModule,
    WebhooksModule,
    PaymentsModule,
    EmailModule,
    PipedriveModule,
    TrackingModule,
  ],
  controllers: [AppController],
  providers: [AppService],
  
})
export class AppModule { }
