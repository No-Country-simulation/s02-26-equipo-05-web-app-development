import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Lead } from '../entities/lead.entity';
import { CreateLeadDto } from '../dto/create-lead.dto';
import { UpdateLeadDto } from '../dto/update-lead.dto';

@Injectable()
export class LeadsService {
  constructor(
    @InjectRepository(Lead)
    private readonly leadRepository: Repository<Lead>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Crea un nuevo Lead o actualiza uno existente según el email.
   * Emite un evento 'lead.created' o 'lead.updated' de forma asíncrona.
   * @param createLeadDto Datos de contacto del Lead
   * @returns El Lead creado o actualizado
   */
  async create(createLeadDto: CreateLeadDto): Promise<Lead> {
    let lead = await this.leadRepository.findOne({
      where: { email: createLeadDto.email },
    });

    if (lead) {
      lead.first_name = createLeadDto.first_name;
      lead.last_name = createLeadDto.last_name;
      lead.phone = createLeadDto.phone ?? lead.phone;
      lead.utm_source = createLeadDto.utm_source ?? lead.utm_source;
      lead.utm_medium = createLeadDto.utm_medium ?? lead.utm_medium;
      lead.utm_campaign = createLeadDto.utm_campaign ?? lead.utm_campaign;

      const updatedLead = await this.leadRepository.save(lead);
      this.eventEmitter.emit('lead.updated', updatedLead);
      return updatedLead;
    }

    lead = this.leadRepository.create(createLeadDto);
    const savedLead = await this.leadRepository.save(lead);
    this.eventEmitter.emit('lead.created', savedLead);
    return savedLead;
  }

  /**
   * Obtiene todos los Leads ordenados por fecha de creación descendente
   * @returns Lista de Leads
   */
  async findAll(): Promise<Lead[]> {
    return this.leadRepository.find({ order: { created_at: 'DESC' } });
  }

  /**
   * Obtiene un Lead por su ID
   * @param id ID del Lead
   * @returns Lead encontrado
   * @throws NotFoundException si el Lead no existe
   */
  async findOne(id: string): Promise<Lead> {
    const lead = await this.leadRepository.findOne({ where: { id } });
    if (!lead) {
      throw new NotFoundException('Lead no encontrado');
    }
    return lead;
  }

  /**
   * Actualiza un Lead existente
   * @param id ID del Lead
   * @param updateLeadDto Datos a actualizar
   * @returns Lead actualizado
   */
  async update(id: string, updateLeadDto: UpdateLeadDto): Promise<Lead> {
    const lead = await this.findOne(id);
    Object.assign(lead, updateLeadDto);
    return this.leadRepository.save(lead);
  }

  /**
   * Elimina un Lead por su ID
   * @param id ID del Lead
   */
  async remove(id: string): Promise<void> {
    const lead = await this.findOne(id);
    await this.leadRepository.remove(lead);
  }
}
