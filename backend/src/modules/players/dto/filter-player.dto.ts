import { BadRequestException } from '@nestjs/common/exceptions/index.js';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
} from 'class-validator';

export enum PlayerSortOptions {
  NAME = 'name',
  VALUE_ASC = 'value_asc',
  VALUE_DESC = 'value_desc',
  AGE_ASC = 'age_asc',
  AGE_DESC = 'age_desc',
  POSITION = 'position',
}

export class FilterPlayerDto {
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'search deve ter no mínimo 2 caracteres' })
  @Transform(({ value }) => {
    if (typeof value === 'string' && value.trim() === '') {
      throw new BadRequestException({ message: 'search não pode ser vazio' });
    }
    return typeof value === 'string' ? value.trim() : value;
  })
  search?: string;

  @IsOptional()
  @IsEnum(['GOL', 'ZAG', 'LAT', 'MEI', 'ATA'])
  position?: 'GOL' | 'ZAG' | 'LAT' | 'MEI' | 'ATA';

  @IsOptional()
  @IsEnum(['APTO', 'MAL_CONDICIONADO', 'DOENTE'])
  condition?: 'APTO' | 'MAL_CONDICIONADO' | 'DOENTE';

  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    throw new BadRequestException({ message: 'O parâmetro free aceita apenas "true" ou "false" estritamente em minúsculas.' });
  })
  @IsBoolean()
  free?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  club_id?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(16)
  @Max(45)
  min_age?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(16)
  @Max(45)
  max_age?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  min_value?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  max_value?: number;

  @IsOptional()
  @IsEnum(PlayerSortOptions, {
    message: 'sort deve ser um dos seguintes valores: name, value_asc, value_desc, age_asc, age_desc, position',
  })
  sort?: PlayerSortOptions = PlayerSortOptions.NAME;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number = 10;
}