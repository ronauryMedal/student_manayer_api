<<<<<<< HEAD
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  Min,
} from 'class-validator';
import { CreateCareerDto } from './create-career.dto';

export class CreateMyCareerDto extends CreateCareerDto {
  @ApiPropertyOptional({
    default: true,
    description:
      'Si es true, esta carrera pasa a ser tu plan activo (actualiza tu inscripción)',
  })
  @IsOptional()
  @IsBoolean()
  activate?: boolean;

  @ApiPropertyOptional({
    description: 'Cuatrimestre actual al activar el plan',
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
=======
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

/** Body alineado con `POST /careers/me` del contrato frontend. */
export class CreateMyCareerDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  institution: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @Min(0)
  totalCredits: number;

  @IsNumber()
  @Min(1)
  totalSemester: number;

  @IsBoolean()
  @IsOptional()
  activate?: boolean;

  @IsNumber()
  @Min(1)
  @IsOptional()
>>>>>>> 3eeabf6d5f601d2b708dd1d0ac618f9f4f07bcda
  currentSemester?: number;
}
