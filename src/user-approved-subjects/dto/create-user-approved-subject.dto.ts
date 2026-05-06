import { IsDateString, IsNotEmpty, IsString } from 'class-validator';

export class CreateUserApprovedSubjectDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  subjectId: string;

  @IsDateString()
  approvedAt: string;
}
