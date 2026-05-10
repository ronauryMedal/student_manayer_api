import { IsDateString, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateUserApprovedSubjectDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  subjectId: string;

  @IsDateString()
  @IsOptional()
  approvedAt?: string;
}
