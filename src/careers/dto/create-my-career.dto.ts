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
  currentSemester?: number;
}
