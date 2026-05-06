import { PartialType } from '@nestjs/swagger';
import { CreateTeacherDto } from './create-teacher.dto';
import { IsEmail, IsOptional, IsString } from 'class-validator';

export class UpdateTeacherDto extends PartialType(CreateTeacherDto) {
    @IsString()
    @IsOptional()
    name?: string;
    @IsEmail()
    @IsString()
    @IsOptional()
    email?: string;
}
