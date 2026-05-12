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
  currentSemester?: number;
}
