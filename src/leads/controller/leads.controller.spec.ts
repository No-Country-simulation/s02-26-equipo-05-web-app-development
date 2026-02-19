import { Test, TestingModule } from '@nestjs/testing';
import { LeadsController } from './leads.controller';
import { LeadsService } from '../service/leads.service';
import { CreateLeadDto } from '../dto/create-lead.dto';
import { UpdateLeadDto } from '../dto/update-lead.dto';

/**
 * Tests unitarios para el LeadsController.
 * Se mockea LeadsService para aislar la lógica del controlador.
 */
describe('LeadsController', () => {
  let controller: LeadsController;
  let mockLeadsService: Partial<Record<keyof LeadsService, jest.Mock>>;

  beforeEach(async () => {
    // Mock de los métodos del servicio
    mockLeadsService = {
      create: jest.fn(dto => ({ id: 'uuid', ...dto })),
      findAll: jest.fn(() => [{ id: 'uuid', first_name: 'Juan', last_name: 'Perez', email: 'test@example.com' }]),
      findOne: jest.fn(id => ({ id, first_name: 'Juan', last_name: 'Perez', email: 'test@example.com' })),
      update: jest.fn((id, dto) => ({ id, ...dto })),
      remove: jest.fn(() => undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [LeadsController],
      providers: [{ provide: LeadsService, useValue: mockLeadsService }],
    }).compile();

    controller = module.get<LeadsController>(LeadsController);
  });

  /** Verifica que el controlador esté definido */
  it('debe estar definido', () => {
    expect(controller).toBeDefined();
  });

  /** Test para create() */
  it('create() debe llamar al servicio y retornar un lead', () => {
    const dto: CreateLeadDto = {
      email: 'test@example.com',
      first_name: 'Juan',
      last_name: 'Perez',
    };
    expect(controller.create(dto)).toEqual({ id: 'uuid', ...dto });
    expect(mockLeadsService.create).toHaveBeenCalledWith(dto);
  });

  /** Test para findAll() */
  it('findAll() debe retornar todos los leads', () => {
    expect(controller.findAll()).toEqual([
      { id: 'uuid', first_name: 'Juan', last_name: 'Perez', email: 'test@example.com' },
    ]);
    expect(mockLeadsService.findAll).toHaveBeenCalled();
  });

  /** Test para findOne() */
  it('findOne() debe retornar un lead por id', () => {
    const id = '123';
    expect(controller.findOne(id)).toEqual({
      id,
      first_name: 'Juan',
      last_name: 'Perez',
      email: 'test@example.com',
    });
    expect(mockLeadsService.findOne).toHaveBeenCalledWith(id);
  });

  /** Test para update() */
  it('update() debe actualizar un lead y retornar el lead actualizado', () => {
    const id = '123';
    const dto: UpdateLeadDto = { first_name: 'Pedro' };
    expect(controller.update(id, dto)).toEqual({ id, ...dto });
    expect(mockLeadsService.update).toHaveBeenCalledWith(id, dto);
  });

  /** Test para remove() */
  it('remove() debe llamar al servicio para eliminar un lead', () => {
    const id = '123';
    expect(controller.remove(id)).toBeUndefined();
    expect(mockLeadsService.remove).toHaveBeenCalledWith(id);
  });
});
