import { Controller, Post, Headers, Req, BadRequestException } from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import { Request } from 'express';
import { WebhooksService } from './webhooks.service';

@Controller('webhooks')
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) { }

  @Post('stripe')
  async handleStripe(
    @Headers('stripe-signature') sig: string,
    @Req() req: RawBodyRequest<Request>
  ) {
    if (!sig) {
      throw new BadRequestException('Falta la firma de Stripe');
    }

    const rawBody = req.rawBody;
    if (!rawBody) {
      throw new BadRequestException('Falta el rawBody. Asegúrate de que rawBody: true esté en main.ts');
    }

    // IMPORTANTE: Pasamos req.rawBody para que Stripe pueda validar la firma
    return await this.webhooksService.handleStripeWebhook(sig, rawBody);
  }
}