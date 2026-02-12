import { Controller, Post, Headers, Req, BadRequestException } from '@nestjs/common'; // <-- Añadimos estos
import { WebhooksService } from './webhooks.service';

@Controller('webhooks')
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @Post('stripe')
  async handleStripe(
    @Headers('stripe-signature') sig: string,
    @Req() req: any 
  ) {
    if (!sig) {
      throw new BadRequestException('Falta la firma de Stripe');
    }
    
    // IMPORTANTE: Pasamos req.rawBody para que Stripe pueda validar la firma
    return await this.webhooksService.handleStripeWebhook(sig, req.rawBody);
  }
}