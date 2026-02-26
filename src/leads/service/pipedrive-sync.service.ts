import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import { Lead } from '../entities/lead.entity';

@Injectable()
export class PipedriveSyncService {
  private readonly logger = new Logger(PipedriveSyncService.name);
  private readonly token: string;

  /**
   * Inicializa el servicio de sincronización con Pipedrive
   * @param config Servicio de configuración para obtener el token de Pipedrive
   * @throws Error si no se encuentra la variable de entorno PIPEDRIVE_API_TOKEN
   */
  constructor(private readonly config: ConfigService) {
    this.token = this.config.get<string>('PIPEDRIVE_API_TOKEN')!;
    if (!this.token) {
      throw new Error('PIPEDRIVE_API_TOKEN no definido en el archivo .env');
    }
  }

  /**
   * Maneja los eventos de creación y actualización de leads
   * @param payload Objeto Lead emitido desde el servicio de leads
   */
  @OnEvent('lead.created', { async: true })
  @OnEvent('lead.updated', { async: true })
  async handleLeadEvents(payload: Lead) {
    // 1. Validación de seguridad: Si no hay email o nombre, no intentamos sincronizar
    if (!payload || !payload.email) {
      this.logger.warn('Sincronización cancelada: El lead no tiene un email válido.');
      return;
    }

    try {
      const url = `https://api.pipedrive.com/v1/persons?api_token=${this.token}`;

      const body = {
        name: `${payload.first_name || 'Lead'} ${payload.last_name || 'Sin Apellido'}`.trim(),
        email: [{ value: payload.email, primary: true }],
        phone: payload.phone ? [{ value: payload.phone, primary: true }] : [],
        // Podés agregar una etiqueta para saber que viene de la Web App
        visible_to: "3" 
      };

      const response = await axios.post(url, body, { timeout: 10000 });

      if (response.status === 201) {
        this.logger.log(`✅ Lead ${payload.email} sincronizado correctamente en Pipedrive.`);
      }
    } catch (err: any) {
      // 2. Log de error más detallado para debuguear rápido
      const errorMsg = err.response?.data?.error || err.message;
      this.logger.error(`❌ Error al sincronizar lead ${payload.email}: ${errorMsg}`);
    }
  }
}
