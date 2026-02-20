import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrdersService } from '../orders/orders.service';
import { WebhookLog } from './entities/webhook-log.entity';
import { OrderStatus } from '../orders/entities/order.entity';
import Stripe from 'stripe';

@Injectable()
export class WebhooksService {
  private stripe: Stripe;
  private readonly logger = new Logger(WebhooksService.name);

  constructor(
    @InjectRepository(WebhookLog)
    private readonly logRepository: Repository<WebhookLog>,
    private readonly ordersService: OrdersService,
  ) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
      apiVersion: '2023-10-16' as any,
    });
  }

  async handleStripeWebhook(signature: string, rawBody: Buffer) {
    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(
        rawBody,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET || ''
      );
    } catch (err) {
      this.logger.error(`Falla de validación de firma: ${err.message}`);
      throw new BadRequestException(`Webhook Error: ${err.message}`);
    }

    const existingEvent = await this.logRepository.findOne({
      where: { event_id: event.id }
    });

    if (existingEvent && existingEvent.processed) {
      this.logger.log(`Evento ${event.id} ya fue procesado anteriormente.`);
      return { received: true };
    }

    let log = existingEvent;
    if (!log) {
      log = this.logRepository.create({
        event_id: event.id,
        event_type: event.type,
        source: 'stripe',
        payload: event as any,
        processed: false,
      });
      await this.logRepository.save(log);
    }

    try {
      switch (event.type) {
        case 'payment_intent.succeeded': {
          const paymentIntent = event.data.object as Stripe.PaymentIntent;
          this.logger.log(`💰 Pago exitoso detectado: ${paymentIntent.id}`);
          
          const { metadata, amount } = paymentIntent;
          
          const order = await this.ordersService.create({
            stripe_payment_intent_id: paymentIntent.id,
            amount: amount,
            order_number: `ORD-${Date.now()}`,
            lead_id: metadata.lead_id || undefined,
            company_name: metadata.company_name,
            entity_type: metadata.entity_type,
            registration_state: metadata.registration_state,
            items: { plan_id: metadata.plan_id },
            status: OrderStatus.PAID,
          });

          // ✅ SOLUCIÓN AL ERROR TS18047:
          // Solo intentamos acceder a order.id si 'order' no es null/undefined
          if (order) {
            this.logger.log(`✅ Orden creada exitosamente: ${order.id}`);
          } else {
            this.logger.error(`❌ El servicio de órdenes no devolvió una orden válida.`);
          }
          break;
        }

        case 'payment_intent.payment_failed': {
          const args = event.data.object as Stripe.PaymentIntent;
          this.logger.warn(`❌ Pago fallido: ${event.id}`);

          const failedOrder = await this.ordersService.create({
            stripe_payment_intent_id: args.id,
            amount: args.amount,
            order_number: `ORD-FAILED-${Date.now()}`,
            lead_id: args.metadata.lead_id || undefined,
            company_name: args.metadata.company_name,
            entity_type: args.metadata.entity_type,
            registration_state: args.metadata.registration_state,
            items: { plan_id: args.metadata.plan_id },
            status: OrderStatus.FAILED,
          });

          if (failedOrder) {
            this.logger.log(`⚠️ Registro de orden fallida guardado: ${failedOrder.id}`);
          }
          break;
        }

        default:
          this.logger.log(`Evento recibido: ${event.type}`);
      }

      await this.logRepository.update({ event_id: event.id }, { processed: true });

    } catch (error) {
      await this.logRepository.update(
        { event_id: event.id },
        { processing_error: error.message }
      );
      throw error;
    }

    return { received: true };
  }
}