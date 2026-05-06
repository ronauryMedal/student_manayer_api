import { IsInt, Min } from 'class-validator';

export class UpdateUserCareerDto {
  @IsInt()
  @Min(1)
  currentSemester: number;
}
