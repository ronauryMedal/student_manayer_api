import { IsDateString, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateTaskDto {
    @IsString()
    @IsNotEmpty()
    title: string;
    @IsString()
    @IsOptional()
    description?: string;
    @IsDateString()
    @IsNotEmpty()
    dueDate: string;

    @IsString()
    @IsNotEmpty()
    subjectId: string;
}
