import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class CreateUserCareerDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  careerId: string;

  @IsInt()
  @Min(1)
  currentSemester: number;
}
