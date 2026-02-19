import { IsNotEmpty, IsNumber, IsOptional, IsString, IsEnum } from 'class-validator';
import { OrderStatus } from '../entities/order.entity';

export class CreateOrderDto {
    @IsString()
    @IsNotEmpty()
    stripe_payment_intent_id: string;

    @IsNumber()
    @IsNotEmpty()
    amount: number;

    @IsString()
    @IsNotEmpty()
    order_number: string;

    @IsOptional()
    items?: any;

    @IsString()
    @IsOptional()
    company_name?: string;

    @IsString()
    @IsOptional()
    entity_type?: string;

    @IsString()
    @IsOptional()
    registration_state?: string;

    @IsString()
    @IsOptional()
    lead_id?: string;

    @IsEnum(OrderStatus)
    @IsOptional()
    status?: OrderStatus;
}
