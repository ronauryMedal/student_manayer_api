<<<<<<< HEAD
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class AddMySubjectDto {
  @ApiProperty({ description: 'ID de la materia (debe pertenecer a tu carrera)' })
=======
import { IsNotEmpty, IsString } from 'class-validator';

/** Body de `POST /user-approved-subjects/me`. */
export class AddMySubjectDto {
>>>>>>> 3eeabf6d5f601d2b708dd1d0ac618f9f4f07bcda
  @IsString()
  @IsNotEmpty()
  subjectId: string;
}
