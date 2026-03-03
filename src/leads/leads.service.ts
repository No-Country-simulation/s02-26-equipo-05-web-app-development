import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lead } from './entities/lead.entity'; //
import { CreateLeadDto } from './dto/create-lead.dto'; //
import { UpdateLeadDto } from './dto/update-lead.dto'; //
import { EmailService } from '../email/email.service'; //
import { TrackingService } from '../tracking/tracking.service'; //

@Injectable()
export class LeadsService {
  constructor(
    @InjectRepository(Lead)
    private readonly leadsRepository: Repository<Lead>,
    private readonly emailService: EmailService, //
    private readonly trackingService: TrackingService, //
  ) { }

  async create(createLeadDto: CreateLeadDto) {
    try {
      // 1. Guardar en BD
      const newLead = this.leadsRepository.create(createLeadDto);
      const savedLead = await this.leadsRepository.save(newLead);

      // 2. Aquí iría la llamada a Pipedrive
      // await this.pipedriveService.createPerson(savedLead);

      // 3. Enviar correo de bienvenida
      await this.emailService.sendWelcomeEmail(savedLead.email, savedLead.first_name);

      // 4. Track Lead en GA4 y Meta
      await this.trackingService.trackLead(savedLead).catch(e => {
        // Ignoramos errores de tracking para no fallar la creación del lead
        console.error('Error tracking lead:', e.message);
      });

      return savedLead;
    } catch (error) {
      throw new InternalServerErrorException('Error al crear el lead o enviar el email');
    }
  }

  async findAll() {
    return await this.leadsRepository.find();
  }

  async findOne(id: string) { // Cambiado a string por UUID
    const lead = await this.leadsRepository.findOneBy({ id });
    if (!lead) throw new NotFoundException(`Lead con ID ${id} no encontrado`);
    return lead;
  }

  async update(id: string, updateLeadDto: UpdateLeadDto) {
    const lead = await this.leadsRepository.preload({
      id: id,
      ...updateLeadDto,
    });
    if (!lead) throw new NotFoundException(`Lead con ID ${id} no existe`);
    return await this.leadsRepository.save(lead);
  }

  async remove(id: string) {
    const lead = await this.findOne(id);
    return await this.leadsRepository.remove(lead);
  }
}