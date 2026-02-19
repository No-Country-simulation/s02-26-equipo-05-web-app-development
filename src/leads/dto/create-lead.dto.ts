import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Matches,
} from 'class-validator';
import { Transform } from 'class-transformer';

/**
 * DTO para la creación o actualización de un Lead.
 * Valida los datos de contacto obligatorios y los campos UTM opcionales.
 */
export class CreateLeadDto {
  /**
   * Correo electrónico del lead.
   * Se normaliza a minúsculas y sin espacios.
   * Es el identificador único para el proceso de upsert.
   */
  @Transform(({ value }) => value?.toLowerCase().trim())
  @IsNotEmpty()
  @IsEmail()
  @MaxLength(150)
  email: string;

  /**
   * Nombre del lead.
   * No puede estar vacío y se eliminan espacios laterales.
   */
  @Transform(({ value }) => value?.trim())
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  first_name: string;

  /**
   * Apellido del lead.
   * No puede estar vacío y se eliminan espacios laterales.
   */
  @Transform(({ value }) => value?.trim())
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  last_name: string;

  /**
   * Teléfono del lead.
   * Campo opcional con validación de formato internacional flexible.
   */
  @Transform(({ value }) => value?.trim())
  @IsOptional()
  @IsString()
  @MaxLength(30)
  @Matches(/^[0-9+\-\s()]*$/, {
    message: 'phone must be a valid phone number format',
  })
  phone?: string;

  /**
   * UTM source para atribución de marketing.
   */
  @Transform(({ value }) => value?.trim())
  @IsOptional()
  @IsString()
  @MaxLength(100)
  utm_source?: string;

  /**
   * UTM medium para atribución de marketing.
   */
  @Transform(({ value }) => value?.trim())
  @IsOptional()
  @IsString()
  @MaxLength(100)
  utm_medium?: string;

  /**
   * UTM campaign para atribución de marketing.
   */
  @Transform(({ value }) => value?.trim())
  @IsOptional()
  @IsString()
  @MaxLength(150)
  utm_campaign?: string;
}
