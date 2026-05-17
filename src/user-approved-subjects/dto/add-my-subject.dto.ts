import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class AddMySubjectDto {
  @ApiProperty({ description: 'ID de la materia (debe pertenecer a tu carrera)' })
  @IsString()
  @IsNotEmpty()
  subjectId: string;
}
