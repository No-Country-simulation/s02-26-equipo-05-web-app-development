import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { EmailService } from '../email/email.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,
    private readonly emailService: EmailService,
  ) {}

async create(createOrderDto: CreateOrderDto) {
  // 1. Extraemos el lead_id del DTO
  const { lead_id, ...orderData } = createOrderDto;

  // 2. Creamos la instancia asignando el ID al objeto de relación 'lead'
  const order = this.ordersRepository.create({
    ...orderData,
    lead: { id: lead_id } as any // Forzamos el vínculo con el ID que ya tienes
  });

  const savedOrder = await this.ordersRepository.save(order);

  // 3. Ahora SÍ, buscamos la orden completa incluyendo los datos del lead
  const orderWithLead = await this.ordersRepository.findOne({
    where: { id: savedOrder.id },
    relations: ['lead'], 
  });

  // 4. Si el lead existe y tiene email, enviamos el correo
  if (orderWithLead?.lead?.email) {
    try {
      await this.emailService.sendOrderConfirmation(orderWithLead);
      console.log('📧 Intento de envío de correo exitoso');
    } catch (error) {
      console.error('Error enviando email:', error.message);
    }
  }

  return orderWithLead;
}

  async findAll() {
    return await this.ordersRepository.find({ relations: ['lead'] });
  }

  async findOne(id: string) {
    const order = await this.ordersRepository.findOne({
      where: { id },
      relations: ['lead'],
    });
    if (!order) throw new NotFoundException(`Order with ID ${id} not found`);
    return order;
  }

  async update(id: string, updateOrderDto: UpdateOrderDto) {
    const order = await this.ordersRepository.preload({
      id,
      ...updateOrderDto,
    });
    if (!order) throw new NotFoundException(`Order with ID ${id} not found`);
    return await this.ordersRepository.save(order);
  }

  async remove(id: string) {
    const order = await this.findOne(id);
    await this.ordersRepository.remove(order);
    return { deleted: true };
  }
}