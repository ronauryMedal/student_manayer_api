import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateCareerDto {
    @IsString()
    @IsNotEmpty()
    name: string;
    @IsString()
    @IsNotEmpty()
    description: string;
    @IsNumber()
    @IsNotEmpty()
    totalCredits: number;
    @IsNumber()
    @IsNotEmpty()
    totalSemester: number;
}
