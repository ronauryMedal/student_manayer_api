import { PartialType } from '@nestjs/swagger';
import { CreateTaskDto } from './create-task.dto';
import { IsDate, IsOptional, IsString } from 'class-validator';

export class UpdateTaskDto extends PartialType(CreateTaskDto) {
    @IsString()
    @IsOptional()
    title?: string;
    @IsString()
    @IsOptional()
    description?: string;
    @IsDate()
    @IsOptional()
    dueDate?: Date;
}
