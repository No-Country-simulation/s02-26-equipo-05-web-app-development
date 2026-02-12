import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WebhookLog } from './entities/webhook-log.entity';

@Injectable()
export class WebhooksService {
  constructor(
    @InjectRepository(WebhookLog)
    private readonly logRepository: Repository<WebhookLog>,
  ) { }

  async createLog(source: string, payload: any) {
    const newLog = this.logRepository.create({
      source,
      event_id: payload.id,
      event_type: payload.type,
      payload: payload,
      processed: false,
    });
    return await this.logRepository.save(newLog);
  }
}