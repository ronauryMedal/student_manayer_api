import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

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

  @IsString()
  @IsNotEmpty()
  careerId: string;
}
