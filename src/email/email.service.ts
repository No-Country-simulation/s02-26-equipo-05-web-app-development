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

  async sendWelcomeEmail(email: string, firstName: string): Promise<void> {
    const subject = '¡Bienvenido a AllInOne!';
    const html = `
      <h1>Hola ${firstName},</h1>
      <p>Bienvenido a <strong>AllinOne</strong>. Estamos felices de tenerte con nosotros.</p>
      <p>Pronto nos pondremos en contacto contigo para darte más detalles.</p>
    `;

    if (email) {
      await this.emailProvider.send(email, subject, html); //
    } else {
      console.warn('No se pudo enviar el correo de bienvenida: email no proporcionado.');
    }
  }
}