import { SubjectModality } from '@prisma/client';
import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateSubjectDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsInt()
  @Min(1)
  credits: number;

  @IsInt()
  @Min(1)
  semesterNumber: number;

  @IsEnum(SubjectModality)
  @IsOptional()
  modality?: SubjectModality;

  @ApiPropertyOptional({
    description:
      'Edificio. Obligatorio si modality es IN_PERSON o HYBRID (o el valor por defecto IN_PERSON).',
  })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  building?: string;

  @ApiPropertyOptional({
    description:
      'Sección o grupo. Obligatorio si modality es IN_PERSON o HYBRID.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  section?: string;

  @ApiPropertyOptional({
    description:
      'Número o código del curso. Obligatorio si modality es IN_PERSON o HYBRID.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  courseNumber?: string;

  @IsString()
  @IsNotEmpty()
  careerId: string;
}
