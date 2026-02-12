import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly configService: ConfigService,
  ) {}

  @Get()
  getHello(): string {
    return `NestJS + Supabase funcionando correctamente

PORT: ${this.configService.get('PORT')}
Supabase DEV URL: ${this.configService.get('SUPABASE_URL')}
Environment: ${this.configService.get('NODE_ENV')}
Pipedrive Token: ${this.configService.get('PIPEDRIVE_API_TOKEN') ? 'Configurado' : 'Pendiente'}`;
  }
}
