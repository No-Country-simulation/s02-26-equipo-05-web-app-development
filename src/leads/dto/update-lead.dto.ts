import { PartialType } from '@nestjs/mapped-types';
import { CreateLeadDto } from './create-lead.dto';

/**
 * DTO para actualizar un Lead.
 * Hereda todas las propiedades de CreateLeadDto pero las hace opcionales.
 * Esto permite actualizar solo algunos campos de un Lead existente.
 */
export class UpdateLeadDto extends PartialType(CreateLeadDto) {}
