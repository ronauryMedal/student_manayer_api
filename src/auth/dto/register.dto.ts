import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString, MinLength } from "class-validator";

export class RegisterDto {
    @IsString()
    @IsNotEmpty()
    @ApiProperty({ example: 'Juan Perez' })
    name: string;
    @IsEmail()
    @IsNotEmpty()
    @ApiProperty({ example: 'usuario@ejemplo.com' })
    email: string;
    @IsString()
    @IsNotEmpty()
    @MinLength(8)
    @ApiProperty({ example: 'Contraseña123' })
    password: string;
}