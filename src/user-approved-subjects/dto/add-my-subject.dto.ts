import { IsNotEmpty, IsString } from 'class-validator';

/** Body de `POST /user-approved-subjects/me`. */
export class AddMySubjectDto {
  @IsString()
  @IsNotEmpty()
  subjectId: string;
}
