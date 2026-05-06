import { IsEmail, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateTeacherDto {
    @IsString()
    @IsNotEmpty()
    name: string;
    @IsEmail()
    @IsString()
    @IsOptional()
    email?: string;
}
