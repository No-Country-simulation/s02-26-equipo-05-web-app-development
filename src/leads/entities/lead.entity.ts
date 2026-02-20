import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('leads') // Nombre de la tabla en la BD
export class Lead {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ nullable: true })
  email!: string;

  @Column()
  first_name!: string;

  @Column()
  last_name!: string;

  @Column({ nullable: true })
  phone?: string;

  @Column({ nullable: true })
  pipedrive_id?: string; // ID de la persona en Pipedrive CRM

  // UTM Tracking Fields
  @Column({ nullable: true })
  utm_source?: string;

  @Column({ nullable: true })
  utm_medium?: string;

  @Column({ nullable: true })
  utm_campaign?: string;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
