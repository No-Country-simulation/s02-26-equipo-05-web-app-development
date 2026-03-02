import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import * as crypto from 'crypto';
import { firstValueFrom } from 'rxjs';
import { Lead } from '../leads/entities/lead.entity';
import { Order } from '../orders/entities/order.entity';

@Injectable()
export class TrackingService {
  private readonly logger = new Logger(TrackingService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  private hashData(data: string | undefined | null): string | undefined {
    if (!data) return undefined;
    return crypto.createHash('sha256').update(data.trim().toLowerCase()).digest('hex');
  }

  async trackLead(lead: Lead, clientIp?: string, clientUserAgent?: string): Promise<void> {
    const hashedEmail = this.hashData(lead.email);
    const hashedPhone = lead.phone ? this.hashData(lead.phone) : undefined;

    const userData: Record<string, any> = {
      em: [hashedEmail],
    };
    if (hashedPhone) {
      userData.ph = [hashedPhone];
    }
    if (clientIp) userData.client_ip_address = clientIp;
    if (clientUserAgent) userData.client_user_agent = clientUserAgent;
    
    // Meta Click ID
    if (lead.fbclid) userData.fbc = `fb.1.${Math.floor(Date.now() / 1000)}.${lead.fbclid}`;

    await Promise.allSettled([
      this.sendMetaEvent('Lead', userData, {
        event_time: Math.floor(Date.now() / 1000),
        action_source: 'website',
        event_source_url: this.configService.get<string>('WEBSITE_URL') || 'http://localhost:3000',
      }),
      this.sendGA4Event('generate_lead', {
        client_id: lead.id,
        events: [
          {
            name: 'generate_lead',
            params: {
              currency: 'USD',
              value: 0.00,
              // UTMs y Click IDs para GA4
              ...(lead.gclid && { gclid: lead.gclid }),
              campaign_id: lead.utm_campaign,
              source: lead.utm_source,
              medium: lead.utm_medium,
              campaign: lead.utm_campaign,
            },
          },
        ],
      })
    ]);
  }

  async trackPurchase(order: Order, clientIp?: string, clientUserAgent?: string): Promise<void> {
    const lead = order.lead;
    const hashedEmail = lead ? this.hashData(lead.email) : undefined;
    const hashedPhone = lead?.phone ? this.hashData(lead.phone) : undefined;

    const userData: Record<string, any> = {};
    if (hashedEmail) userData.em = [hashedEmail];
    if (hashedPhone) userData.ph = [hashedPhone];
    if (clientIp) userData.client_ip_address = clientIp;
    if (clientUserAgent) userData.client_user_agent = clientUserAgent;

    // Meta Click ID
    if (lead?.fbclid) userData.fbc = `fb.1.${Math.floor(Date.now() / 1000)}.${lead.fbclid}`;

    const clientId = lead ? lead.id : 'unknown';

    await Promise.allSettled([
      this.sendMetaEvent('Purchase', userData, {
        event_time: Math.floor(Date.now() / 1000),
        action_source: 'website',
        event_source_url: this.configService.get<string>('WEBSITE_URL') || 'http://localhost:3000',
        custom_data: {
          currency: 'USD',
          value: order.amount / 100,
          order_id: order.id,
        }
      }),
      this.sendGA4Event('purchase', {
        client_id: clientId,
        events: [
          {
            name: 'purchase',
            params: {
              currency: 'USD',
              value: order.amount / 100,
              transaction_id: order.id,
              // UTMs y Click IDs para GA4
              ...(lead?.gclid && { gclid: lead.gclid }),
              campaign_id: lead?.utm_campaign,
              source: lead?.utm_source,
              medium: lead?.utm_medium,
              campaign: lead?.utm_campaign,
            },
          },
        ],
      })
    ]);
  }

  private async sendMetaEvent(eventName: string, userData: any, customData: any): Promise<void> {
    const pixelId = this.configService.get<string>('META_PIXEL_ID');
    const accessToken = this.configService.get<string>('META_ACCESS_TOKEN');

    if (!pixelId || !accessToken) {
      this.logger.debug(`Meta CAPI credentials missing, skipping ${eventName} event.`);
      return;
    }

    const payload = {
      data: [
        {
          event_name: eventName,
          event_time: customData.event_time,
          action_source: customData.action_source,
          event_source_url: customData.event_source_url,
          user_data: userData,
          ...(customData.custom_data ? { custom_data: customData.custom_data } : {})
        }
      ]
    };

    const url = `https://graph.facebook.com/v19.0/${pixelId}/events?access_token=${accessToken}`;

    try {
      await firstValueFrom(this.httpService.post(url, payload));
      this.logger.log(`Meta ${eventName} event sent successfully`);
    } catch (error: any) {
      this.logger.error(
        `Failed to send Meta ${eventName} event: ${error.message}`,
        error.response?.data
      );
    }
  }

  private async sendGA4Event(eventName: string, payloadData: any): Promise<void> {
    const measurementId = this.configService.get<string>('GA4_MEASUREMENT_ID');
    const apiSecret = this.configService.get<string>('GA4_API_SECRET');

    if (!measurementId || !apiSecret) {
      this.logger.debug(`GA4 credentials missing, skipping ${eventName} event.`);
      return;
    }

    const url = `https://www.google-analytics.com/mp/collect?measurement_id=${measurementId}&api_secret=${apiSecret}`;

    try {
      await firstValueFrom(this.httpService.post(url, payloadData));
      this.logger.log(`GA4 ${eventName} event sent successfully`);
    } catch (error: any) {
      this.logger.error(
        `Failed to send GA4 ${eventName} event: ${error.message}`,
        error.response?.data
      );
    }
  }
}
