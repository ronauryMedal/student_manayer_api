import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

/** Body de `POST /subjects/me` (alineado con el front Ionic). */
export class CreateMySubjectDto {
  @IsString()
  @IsNotEmpty()
  careerId: string;

  @IsInt()
  @Min(1)
  quarterNumber: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(256)
  name: string;

  @IsInt()
  @Min(0)
  credits: number;

  /** El modelo Prisma aún no persiste modalidad; se acepta por compatibilidad. */
  @IsString()
  @IsOptional()
  modality?: string;

  @IsString()
  @IsOptional()
  building?: string | null;

  @IsString()
  @IsOptional()
  section?: string | null;

  @IsString()
  @IsOptional()
  courseNumber?: string | null;
}
