import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailModule } from '../email/email.module'; //
import { EventEmitterModule } from '@nestjs/event-emitter';
import { LeadsService } from './service/leads.service';
import { LeadsController } from './controller/leads.controller';
import { Lead } from './entities/lead.entity';
import { PipedriveSyncService } from './service/pipedrive-sync.service';

/**
 * Módulo encargado de la gestión de Leads.
 * 
 * Se encarga de:
 * - Persistir leads en la base de datos.
 * - Exponer endpoints para CRUD de leads.
 * - Emitir eventos cuando se crean o actualizan leads.
 * - Sincronizar automáticamente con Pipedrive en background.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([Lead]), 
    EmailModule,
    EventEmitterModule.forRoot({ global: true }),
  ],
  controllers: [LeadsController],
  providers: [LeadsService, PipedriveSyncService], 
  exports: [LeadsService],
})
export class LeadsModule {}