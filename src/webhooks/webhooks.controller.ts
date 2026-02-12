import { Controller, Post, Body } from '@nestjs/common';
import { WebhooksService } from './webhooks.service';

@Controller('webhooks')
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @Post('stripe')
  async handleStripe(@Body() payload: any) {
    // ESTA ES TU TAREA: Guardar antes que nada
    await this.webhooksService.createLog('stripe', payload);
    
    return { received: true };
  }
}