import { 
    Entity, 
    PrimaryGeneratedColumn, 
    Column, 
    CreateDateColumn, 
    UpdateDateColumn,
    // ManyToOne,   <-- DESCOMENTAR CUANDO ALEX SUBA LEAD
    // JoinColumn   <-- DESCOMENTAR CUANDO ALEX SUBA LEAD
  } from 'typeorm';
  // import { Lead } from '../leads/lead.entity'; <-- DESCOMENTAR CUANDO EXISTA EL ARCHIVO
  
  export enum OrderStatus {
    PENDING = 'PENDING',
    PAID = 'PAID',
    FAILED = 'FAILED',
  }
  
  @Entity('orders')
  export class Order {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    // --- SECCIÓN RELACIÓN CON LEAD (Activar después) ---
    // @ManyToOne(() => Lead, (lead) => lead.orders)
    // @JoinColumn({ name: 'lead_id' })
    // lead: Lead;
    // ---------------------------------------------------
  
    @Column({ name: 'lead_id', nullable: true }) // Dejo esto temporalmente para guardar el ID aunque no esté la relación
    leadId: string;
  
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
