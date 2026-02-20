import { Injectable } from '@nestjs/common';
import { ResendProvider } from './providers/resend.provider';

@Injectable()
export class EmailService {
  constructor(private readonly emailProvider: ResendProvider) {}

  async sendOrderConfirmation(order: any): Promise<void> {
    const subject = `Gracias por tu compra #${order.order_number}`;
    const html = `<h1>Gracias por tu compra #${order.order_number}</h1>`;
    
    const recipient = order.lead?.email;

    if (recipient) {
      await this.emailProvider.send(recipient, subject, html);
    } else {
      console.warn('No se pudo enviar el correo: La orden no tiene un lead con email válido.');
    }
  }
}