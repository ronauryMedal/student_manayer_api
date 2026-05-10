import { SubjectModality } from '@prisma/client';
import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

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

  @IsString()
  @IsNotEmpty()
  careerId: string;
}
