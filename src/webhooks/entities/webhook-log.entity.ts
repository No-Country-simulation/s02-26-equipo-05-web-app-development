import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('webhook_logs')
export class WebhookLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  source: string; // 'stripe' o 'pipedrive'

  @Column()
  event_type: string;

  @Column({ unique: true }) // Esto es la Unique Key (UK)
  event_id: string;

  @Column({ type: 'jsonb' }) // Guarda el JSON completo
  payload: any;

  @Column({ default: false })
  processed: boolean;

  @Column({ nullable: true })
  processing_error: string;

  @CreateDateColumn()
  created_at: Date;
}