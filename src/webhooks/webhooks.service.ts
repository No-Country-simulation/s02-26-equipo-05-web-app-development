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
    // Inicializamos Stripe. Asegúrate de tener STRIPE_SECRET_KEY en tu .env
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
      apiVersion: '2023-10-16' as any,
    });
  }

  async handleStripeWebhook(signature: string, rawBody: Buffer) {
    let event: Stripe.Event;

    // --- SEGURIDAD: Validación de Firma ---
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

    // --- ESCENARIO 1: IDEMPOTENCIA ---
    // Usamos event_id que es tu columna con Unique Key
    const existingEvent = await this.logRepository.findOne({
      where: { event_id: event.id }
    });

    if (existingEvent && existingEvent.processed) {
      this.logger.log(`Evento ${event.id} ya fue procesado anteriormente.`);
      return { received: true };
    }

    // --- GUARDADO DEL LOG (Tarea 1) ---
    // Si no existía el log, lo creamos. Si existía pero no estaba procesado, lo usamos.
    let log = existingEvent;
    if (!log) {
      log = this.logRepository.create({
        event_id: event.id,
        event_type: event.type,
        source: 'stripe',
        payload: event,
        processed: false,
      });
      await this.logRepository.save(log);
    }

    // --- ESCENARIO 2 Y 3: LÓGICA DE NEGOCIO ---
    try {
      switch (event.type) {
        case 'payment_intent.succeeded':
          const paymentIntent = event.data.object as Stripe.PaymentIntent;
          this.logger.log(`💰 Pago exitoso detectado: ${paymentIntent.id}`);
          // Crear la orden usando los datos del metadata
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
          this.logger.log(`✅ Orden creada exitosamente: ${order.id}`);
          break;

        case 'payment_intent.payment_failed':
          const args = event.data.object as Stripe.PaymentIntent;
          this.logger.warn(`❌ Pago fallido: ${event.id}`);

          // También registramos la orden fallida para tener historial
          await this.ordersService.create({
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
          break;

        default:
          this.logger.log(`Evento recibido: ${event.type}`);
      }

      // Marcamos como procesado exitosamente en tu columna 'processed'
      await this.logRepository.update({ event_id: event.id }, { processed: true });

    } catch (error) {
      // Si algo falla, usamos tu columna 'processing_error'
      await this.logRepository.update(
        { event_id: event.id },
        { processing_error: error.message }
      );
      throw error;
    }

    return { received: true };
  }
}