import { Controller, Post, Body } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) { }

  @Post('create-intent')
  async createIntent(@Body() createPaymentIntentDto: CreatePaymentIntentDto) {
    return this.paymentsService.createPaymentIntent(
      createPaymentIntentDto.plan_id,
      createPaymentIntentDto.lead_id,
      createPaymentIntentDto.company_name,
      createPaymentIntentDto.registration_state,
      createPaymentIntentDto.entity_type,
    );
  }
}
