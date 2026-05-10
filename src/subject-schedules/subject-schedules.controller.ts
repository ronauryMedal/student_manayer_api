import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/JwtAuthGuard/Jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { CreateSubjectScheduleDto } from './dto/create-subject-schedule.dto';
import { UpdateSubjectScheduleDto } from './dto/update-subject-schedule.dto';
import { SubjectSchedulesService } from './subject-schedules.service';

@ApiTags('subject-schedules')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('subjects/:subjectId/schedules')
export class SubjectSchedulesController {
  constructor(private readonly subjectSchedulesService: SubjectSchedulesService) {}

  @ApiOperation({ summary: 'Listar bloques horarios de una materia' })
  @ApiParam({ name: 'subjectId', description: 'ID de la materia' })
  @Get()
  findBySubject(@Param('subjectId') subjectId: string) {
    return this.subjectSchedulesService.findBySubject(subjectId);
  }

  @ApiOperation({ summary: 'Agregar un bloque horario a la materia' })
  @ApiParam({ name: 'subjectId', description: 'ID de la materia' })
  @Post()
  @Roles(Role.ADMIN)
  create(
    @Param('subjectId') subjectId: string,
    @Body() dto: CreateSubjectScheduleDto,
  ) {
    return this.subjectSchedulesService.create(subjectId, dto);
  }

  @ApiOperation({ summary: 'Actualizar un bloque horario' })
  @ApiParam({ name: 'subjectId', description: 'ID de la materia' })
  @ApiParam({ name: 'scheduleId', description: 'ID del horario' })
  @Patch(':scheduleId')
  @Roles(Role.ADMIN)
  update(
    @Param('subjectId') subjectId: string,
    @Param('scheduleId') scheduleId: string,
    @Body() dto: UpdateSubjectScheduleDto,
  ) {
    return this.subjectSchedulesService.update(subjectId, scheduleId, dto);
  }

  @ApiOperation({ summary: 'Eliminar un bloque horario' })
  @ApiParam({ name: 'subjectId', description: 'ID de la materia' })
  @ApiParam({ name: 'scheduleId', description: 'ID del horario' })
  @Delete(':scheduleId')
  @Roles(Role.ADMIN)
  remove(
    @Param('subjectId') subjectId: string,
    @Param('scheduleId') scheduleId: string,
  ) {
    return this.subjectSchedulesService.remove(subjectId, scheduleId);
  }
}
