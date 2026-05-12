import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateCareerDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsOptional()
    institution?: string;

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
