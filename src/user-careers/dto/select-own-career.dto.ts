import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class SelectOwnCareerDto {
  @IsString()
  @IsNotEmpty()
  careerId: string;

  @IsInt()
  @Min(1)
  currentSemester: number;
}
