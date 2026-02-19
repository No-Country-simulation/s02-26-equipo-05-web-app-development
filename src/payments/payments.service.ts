import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

import { PlanType } from './dto/create-payment-intent.dto';

@Injectable()
export class PaymentsService {
    private stripe: Stripe;
    private readonly STATE_FEE_CENTS = 10300; // $103.00

    private readonly PRICES = {
        [PlanType.STARTER]: 29900,         // $299.00
        [PlanType.TAX_COMPLIANCE]: 199900, // $1999.00
        [PlanType.BUSINESS_BOX]: 299900,   // $2999.00
    };

    constructor(private configService: ConfigService) {
        this.stripe = new Stripe(this.configService.get<string>('STRIPE_SECRET_KEY') || '', {
            apiVersion: '2023-10-16' as any,
        });
    }

    async createPaymentIntent(
        planId: PlanType,
        leadId?: string,
        companyName?: string,
        registrationState?: string,
        entityType?: string
    ) {
        try {
            const basePrice = this.PRICES[planId];
            if (!basePrice) {
                throw new InternalServerErrorException('Invalid Plan ID');
            }

            const totalAmount = basePrice + this.STATE_FEE_CENTS;

            const paymentIntent = await this.stripe.paymentIntents.create({
                amount: totalAmount,
                currency: 'usd',
                metadata: {
                    lead_id: leadId || null,
                    plan_id: planId,
                    company_name: companyName || null,
                    registration_state: registrationState || null,
                    entity_type: entityType || null,
                },
                payment_method_types: ['card'],
            });

            return {
                clientSecret: paymentIntent.client_secret,
                amount: totalAmount,
                plan_price: basePrice,
                state_fee: this.STATE_FEE_CENTS
            };
        } catch (error) {
            throw new InternalServerErrorException(`Error creating PaymentIntent: ${error.message}`);
        }
    }
}
