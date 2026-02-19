import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

/**
 * Entidad que representa un Lead
 */
@Entity({ name: 'leads' })
export class Lead {
  /** ID único del lead (UUID) */
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  /** Email del lead (único) */
  @Index({ unique: true })
  @Column({ type: 'varchar', length: 150 })
  email!: string;

  /** Primer nombre del lead */
  @Column({ type: 'varchar', length: 100 })
  first_name!: string;

  /** Apellido del lead */
  @Column({ type: 'varchar', length: 100 })
  last_name!: string;

  /** Teléfono del lead (opcional) */
  @Column({ type: 'varchar', length: 30, nullable: true })
  phone?: string;

  /** ID de la persona en Pipedrive (opcional) */
  @Column({ type: 'varchar', length: 50, nullable: true })
  pipedrive_id?: string;

  /** Fuente UTM (opcional) */
  @Index()
  @Column({ type: 'varchar', length: 100, nullable: true })
  utm_source?: string;

  /** Medio UTM (opcional) */
  @Index()
  @Column({ type: 'varchar', length: 100, nullable: true })
  utm_medium?: string;

  /** Campaña UTM (opcional) */
  @Index()
  @Column({ type: 'varchar', length: 150, nullable: true })
  utm_campaign?: string;

  /** Fecha de creación */
  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date;

  /** Fecha de última actualización */
  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at!: Date;
}
