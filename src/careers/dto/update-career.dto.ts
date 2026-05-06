import { PartialType } from '@nestjs/swagger';
import { CreateCareerDto } from './create-career.dto';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateCareerDto extends PartialType(CreateCareerDto) {
    @IsString()
    @IsOptional()
    name?: string;
    @IsString()
    @IsOptional()
    description?: string;
    @IsNumber()
    @IsOptional()
    totalCredits?: number;
    @IsNumber()
    @IsOptional()
    totalSemester?  : number;
}
