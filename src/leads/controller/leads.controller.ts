import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { LeadsService } from '../service/leads.service';
import { CreateLeadDto } from '../dto/create-lead.dto';
import { UpdateLeadDto } from '../dto/update-lead.dto';

/**
 * Controlador para la gestión de Leads.
 * Permite crear, listar, actualizar y eliminar leads.
 */
@Controller('leads')
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  /**
   * Crea un nuevo Lead o actualiza uno existente.
   * Retorna 201 Created inmediatamente.
   * @param createLeadDto Datos del lead a crear o actualizar.
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createLeadDto: CreateLeadDto) {
    return this.leadsService.create(createLeadDto);
  }

  /**
   * Obtiene todos los Leads existentes.
   */
  @Get()
  findAll() {
    return this.leadsService.findAll();
  }

  /**
   * Obtiene un Lead específico por ID.
   * @param id ID del lead a consultar.
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.leadsService.findOne(id);
  }

  /**
   * Actualiza un Lead existente.
   * @param id ID del lead a actualizar.
   * @param updateLeadDto Datos del lead a actualizar.
   */
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateLeadDto: UpdateLeadDto) {
    return this.leadsService.update(id, updateLeadDto);
  }

  /**
   * Elimina un Lead existente.
   * Retorna 204 No Content.
   * @param id ID del lead a eliminar.
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.leadsService.remove(id);
  }
}
