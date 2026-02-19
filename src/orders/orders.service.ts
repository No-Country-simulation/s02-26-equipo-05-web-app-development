import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Order, OrderStatus } from './entities/order.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) { }

  async create(createOrderDto: CreateOrderDto) {
    try {
      const order = this.orderRepository.create({
        ...createOrderDto,
        status: createOrderDto.status || OrderStatus.PENDING,
        lead: createOrderDto.lead_id ? { id: createOrderDto.lead_id } as any : null,
      });

      return await this.orderRepository.save(order);
    } catch (error) {
      throw new InternalServerErrorException(`Error creating order: ${error.message}`);
    }
  }

  findAll() {
    return this.orderRepository.find({ relations: ['lead'] });
  }

  findOne(id: number) {
    // El ID es string (uuid), ajustamos firma si es necesario o casteamos si viene como number
    return `This action returns a #${id} order`;
  }

  // ... (otros métodos)


  update(id: number, updateOrderDto: UpdateOrderDto) {
    return `This action updates a #${id} order`;
  }

  remove(id: number) {
    return `This action removes a #${id} order`;
  }
}
