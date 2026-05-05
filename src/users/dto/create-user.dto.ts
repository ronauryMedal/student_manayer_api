import { ApiProperty } from "@nestjs/swagger";
import { Role } from "@prisma/client";
import { IsString, IsNotEmpty, IsEmail } from "class-validator";


export class CreateUserDto {
    @IsString()
    @IsNotEmpty()
    name: string;
    @IsEmail()
    @IsNotEmpty()
    email: string;
    @IsString()
    @IsNotEmpty()
    password: string;
}
