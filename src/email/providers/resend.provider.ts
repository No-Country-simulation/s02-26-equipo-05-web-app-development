import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';
import { IEmailProvider } from '../interfaces/email-provider.interface';

@Injectable()
export class ResendProvider implements IEmailProvider {
  private resend: Resend;
  private readonly logger = new Logger(ResendProvider.name);

  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY);
  }

  async send(to: string, subject: string, html: string): Promise<void> {
    try {
      const { error } = await this.resend.emails.send({
        from: 'Simulacion <onboarding@resend.dev>',
        to: [to],
        subject,
        html,
      });

      if (error) {
        this.logger.error(`Error de Resend: ${error.message}`);
      }
    } catch (err) {
      this.logger.error('Fallo crítico enviando email', err);
    }
  }
}