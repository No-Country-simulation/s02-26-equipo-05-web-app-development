import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { Lead } from '../leads/entities/lead.entity'; 
import { Order } from '../orders/entities/order.entity';

@Injectable()
export class PipedriveService {
  private readonly logger = new Logger(PipedriveService.name);
  private readonly apiUrl = 'https://api.pipedrive.com/v1';
  private readonly apiToken: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.apiToken = this.configService.get<string>('PIPEDRIVE_API_TOKEN')?? '';
  }

  
  async createPerson(lead: Lead): Promise<number> {
    try {
      
      const searchUrl = `${this.apiUrl}/persons/search?term=${lead.email}&api_token=${this.apiToken}`;
      const searchResponse = await firstValueFrom(this.httpService.get(searchUrl));
      
      const items = searchResponse.data.data.items;

      if (items && items.length > 0) {
        const existingId = items[0].item.id;
        this.logger.log(`Persona ya existe en Pipedrive: ID ${existingId}`);
        return existingId;
      }

      const createUrl = `${this.apiUrl}/persons?api_token=${this.apiToken}`;
      
      const newPersonPayload = {
        name: `${lead.first_name} ${lead.last_name}`,
        email: [lead.email],
        phone: lead.phone ? [lead.phone] : [], 
      };

      const createResponse = await firstValueFrom(this.httpService.post(createUrl, newPersonPayload));
      const newId = createResponse.data.data.id;
      
      this.logger.log(`Nueva persona creada en Pipedrive: ID ${newId}`);
      return newId;

    } catch (error) {
      this.logger.error('Error en createPerson (Pipedrive)', error.response?.data || error.message);
      throw error; 
    }
  }

  
  async createDeal(order: Order, personId: number): Promise<void> {
    try {
      const dealUrl = `${this.apiUrl}/deals?api_token=${this.apiToken}`;
      
      // NOTA: Como 'amount' está en centavos (ej: 5000), lo dividimos por 100 para Pipedrive (ej: 50.00)
      const dealValue = order.amount / 100;

      const dealPayload = {
        title: `Venta Web - Orden #${order.order_number}`, 
        value: dealValue,
        currency: 'USD',
        status: 'won', 
        person_id: personId,
      };

      await firstValueFrom(this.httpService.post(dealUrl, dealPayload));
      this.logger.log(`Deal creado exitosamente para la orden ${order.order_number}`);

    } catch (error) {
      this.logger.error('Error creando Deal en Pipedrive', error.response?.data || error.message);
      throw error;
    }
  }
}