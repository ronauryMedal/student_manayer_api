import { Weekday } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsMilitaryTime,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateSubjectScheduleDto {
  @ApiProperty({ enum: Weekday, example: Weekday.MONDAY })
  @IsEnum(Weekday)
  weekday: Weekday;

  @ApiProperty({
    description: 'Hora de inicio en formato 24h (HH:mm)',
    example: '08:00',
  })
  @IsMilitaryTime()
  startTime: string;

  @ApiProperty({
    description: 'Hora de fin en formato 24h (HH:mm)',
    example: '10:00',
  })
  @IsMilitaryTime()
  endTime: string;

  @ApiPropertyOptional({ example: 'Aula 101' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  room?: string;
}
