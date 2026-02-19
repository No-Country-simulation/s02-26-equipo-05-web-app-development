import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export enum PlanType {
    STARTER = 'starter',
    TAX_COMPLIANCE = 'tax_compliance',
    BUSINESS_BOX = 'business_in_a_box',
}

export class CreatePaymentIntentDto {
    @IsEnum(PlanType)
    @IsNotEmpty()
    plan_id: PlanType;

    @IsString()
    @IsOptional()
    lead_id?: string;

    @IsString()
    @IsOptional()
    company_name?: string;

    @IsString()
    @IsOptional()
    registration_state?: string;

    @IsString()
    @IsOptional()
    entity_type?: string;
}
