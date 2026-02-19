import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn
} from 'typeorm';
import { Lead } from '../../leads/entities/lead.entity';

export enum OrderStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  FAILED = 'FAILED',
}

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Lead)
  @JoinColumn({ name: 'lead_id' })
  lead: Lead;

  // @Column({ name: 'lead_id', nullable: true })
  // leadId: string;

  @Column('int') // Centavos
  amount: number;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status: OrderStatus;

  @Column({ unique: true, nullable: true })
  stripe_payment_intent_id: string;

  @Column({ unique: true })
  order_number: string;

  // Escenario 2: JSONB para el snapshot del producto
  @Column({ type: 'jsonb', nullable: true })
  items: any;

  @Column({ nullable: true })
  company_name: string;

  @Column({ nullable: true })
  entity_type: string;

  @Column({ nullable: true })
  registration_state: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
