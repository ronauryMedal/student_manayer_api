import {IsDate, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateTaskDto {
    @IsString()
    @IsNotEmpty()
    title: string;
    @IsString()
    @IsOptional()
    description?: string;
    @IsDate()
    @IsNotEmpty()
    dueDate: Date;

    @IsString()
    @IsNotEmpty()
    subjectId: string;

    @IsString()
    @IsNotEmpty()
    userId: string;
}
