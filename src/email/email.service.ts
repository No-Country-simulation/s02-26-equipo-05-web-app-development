import { Injectable } from '@nestjs/common';
import { ResendProvider } from './providers/resend.provider';

@Injectable()
export class EmailService {
  constructor(private readonly emailProvider: ResendProvider) { }

  async sendOrderConfirmation(order: any): Promise<void> {
    const subject = `Recibo Oficial - Orden #${order.order_number}`;
    const amountInDollars = (order.amount / 100).toFixed(2);

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #1e40af; border-bottom: 2px solid #1e40af; padding-bottom: 10px;">AllInOne Legal Solutions</h2>
        <h3 style="color: #334155;">¡Pago procesado con éxito!</h3>
        <p style="color: #475569; line-height: 1.6;">
          Hola, queríamos informarte que hemos recibido exitosamente el pago total por los servicios de incorporación para <strong>${order.company_name}</strong> en el estado de <strong>${order.registration_state}</strong>.
        </p>
        
        <div style="background-color: #f8fafc; padding: 15px; border-radius: 6px; margin: 20px 0;">
          <h4 style="margin-top: 0; color: #0f172a;">Resumen de tu Orden #${order.order_number}</h4>
          <table style="width: 100%; border-collapse: collapse;">
            <tr style="border-bottom: 1px solid #cbd5e1;">
              <td style="padding: 8px 0; color: #64748b;">Monto Pagado:</td>
              <td style="padding: 8px 0; text-align: right; font-weight: bold; color: #0f172a;">$${amountInDollars} USD</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b;">Tipo de Entidad:</td>
              <td style="padding: 8px 0; text-align: right; color: #0f172a;">${order.entity_type}</td>
            </tr>
          </table>
        </div>
        
        <p style="color: #475569; line-height: 1.6;">
          Nuestro equipo legal ya está revisando tus datos. Pronto recibirás los documentos oficiales de tu nueva compañía.
        </p>
        <p style="color: #94a3b8; font-size: 12px; margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 10px; text-align: center;">
          Este es un recibo automático generado por Stripe. © 2026 AllInOne Solutions.
        </p>
      </div>
    `;

    const recipient = order.lead?.email;

    if (recipient) {
      await this.emailProvider.send(recipient, subject, html);
    } else {
      console.warn('No se pudo enviar el correo: La orden no tiene un lead con email válido.');
    }
  }

  async sendWelcomeEmail(email: string, firstName: string): Promise<void> {
    const subject = 'Bienvenido a AllInOne - Tu futuro negocio comienza aquí';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #1e40af; margin: 0;">AllInOne</h1>
          <p style="color: #64748b; font-size: 14px; margin-top: 5px;">Legal Solutions</p>
        </div>
        
        <h2 style="color: #334155;">¡Hola ${firstName}! 👋</h2>
        <p style="color: #475569; line-height: 1.6; font-size: 16px;">
          Gracias por confiar en <strong>AllInOne</strong>. Hemos guardado tus datos de contacto exitosamente.
        </p>
        <p style="color: #475569; line-height: 1.6; font-size: 16px;">
          Sabemos que abrir una compañía en los Estados Unidos puede ser abrumador. Nuestro objetivo es hacer ese proceso invisible para ti. Si en algún momento necesitas pausar tu solicitud, uno de nuestros especialistas se pondrá en contacto contigo muy pronto.
        </p>
        
        <a href="https://allinonesolutionnc.com/onboarding" style="display: inline-block; background-color: #1e40af; color: white; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold; margin-top: 15px;">
          Continuar mi Solicitud
        </a>
        
        <p style="color: #94a3b8; font-size: 12px; margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 10px; text-align: center;">
          Recibes este correo porque te registraste en nuestra plataforma de Onboarding.
        </p>
      </div>
    `;

    if (email) {
      await this.emailProvider.send(email, subject, html); //
    } else {
      console.warn('No se pudo enviar el correo de bienvenida: email no proporcionado.');
    }
  }
}