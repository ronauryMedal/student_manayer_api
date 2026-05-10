import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class CreateCareerDto {
  @ApiProperty({ example: 'Ingeniería de Software' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'Universidad Nacional',
    description: 'Institución; permite repetir el nombre de carrera en otra institución',
  })
  @IsString()
  @IsNotEmpty()
  institution: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  @IsNotEmpty()
  totalCredits: number;

  @ApiProperty({
    description: 'Cantidad de cuatrimestres (o períodos) del plan',
    example: 12,
  })
  @IsNumber()
  @Min(1)
  totalSemester: number;
}
