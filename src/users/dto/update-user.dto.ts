import { PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';
import { IsString, IsNotEmpty, IsEmail, IsOptional } from "class-validator";

export class UpdateUserDto extends PartialType(CreateUserDto) {
    @IsString()
    @IsOptional()
    name?: string;
    @IsEmail()
    @IsOptional()
    email?: string;
    @IsString()
    @IsOptional()
    password?: string;
}
