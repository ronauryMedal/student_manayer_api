import { IsNotEmpty, IsString } from 'class-validator';

export class CreateSubjectTeacherDto {
  @IsString()
  @IsNotEmpty()
  subjectId: string;

  @IsString()
  @IsNotEmpty()
  teacherId: string;
}
