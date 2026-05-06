import { IsBoolean, IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class CreateUserSemesterDto {
  @IsString()
  @IsNotEmpty()
  userCareerId: string;

  @IsInt()
  @Min(1)
  number: number;

  @IsBoolean()
  isActive: boolean;
}
