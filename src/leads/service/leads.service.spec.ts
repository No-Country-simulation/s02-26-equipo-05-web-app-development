import { Test, TestingModule } from '@nestjs/testing';
import { LeadsService } from './leads.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Lead } from '../entities/lead.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Repository } from 'typeorm';
import { CreateLeadDto } from '../dto/create-lead.dto';

/**
 * Pruebas unitarias para el servicio de Leads
 */
describe('LeadsService', () => {
  let service: LeadsService;
  let repo: Repository<Lead>;
  let eventEmitter: EventEmitter2;

  const mockRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
    find: jest.fn(),
  };

  const mockEventEmitter = { emit: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LeadsService,
        { provide: getRepositoryToken(Lead), useValue: mockRepository },
        { provide: EventEmitter2, useValue: mockEventEmitter },
      ],
    }).compile();

    service = module.get<LeadsService>(LeadsService);
    repo = module.get<Repository<Lead>>(getRepositoryToken(Lead));
    eventEmitter = module.get<EventEmitter2>(EventEmitter2);
  });

  it('Debe estar definido', () => {
    expect(service).toBeDefined();
  });

  it('Debe crear un nuevo lead y emitir evento', async () => {
    const dto: CreateLeadDto = {
      email: 'test@example.com',
      first_name: 'Juan',
      last_name: 'Perez',
      phone: '1234567890',
      utm_source: 'google',
      utm_medium: 'cpc',
      utm_campaign: 'promo',
    };

    mockRepository.findOne.mockResolvedValue(null);
    mockRepository.create.mockReturnValue(dto);
    mockRepository.save.mockResolvedValue(dto);

    const result = await service.create(dto);

    expect(result).toEqual(dto);
    expect(eventEmitter.emit).toHaveBeenCalledWith('lead.created', dto);
  });

  it('Debe actualizar lead existente y emitir evento', async () => {
    const existingLead = {
      email: 'test@example.com',
      first_name: 'Old',
      last_name: 'Name',
      phone: '111',
    };
    const dto: CreateLeadDto = {
      email: 'test@example.com',
      first_name: 'Juan',
      last_name: 'Perez',
      phone: '1234567890',
      utm_source: 'google',
      utm_medium: 'cpc',
      utm_campaign: 'promo',
    };

    mockRepository.findOne.mockResolvedValue(existingLead);
    mockRepository.save.mockResolvedValue({ ...existingLead, ...dto });

    const result = await service.create(dto);

    expect(result.first_name).toEqual('Juan');
    expect(eventEmitter.emit).toHaveBeenCalledWith('lead.updated', { ...existingLead, ...dto });
  });
});
