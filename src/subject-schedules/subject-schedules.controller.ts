import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
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
  findBySubject(
    @Param('subjectId') subjectId: string,
    @Req() req: { user?: { id?: string; role?: Role } },
  ) {
    return this.subjectSchedulesService.findBySubject(subjectId, {
      id: req.user?.id as string,
      role: req.user?.role as Role,
    });
  }

  @ApiOperation({
    summary: 'Agregar un bloque horario',
    description: 'Admin o dueño del plan (carrera) al que pertenece la materia.',
  })
  @ApiParam({ name: 'subjectId', description: 'ID de la materia' })
  @Post()
  create(
    @Param('subjectId') subjectId: string,
    @Body() dto: CreateSubjectScheduleDto,
    @Req() req: { user?: { id?: string; role?: Role } },
  ) {
    return this.subjectSchedulesService.create(subjectId, dto, {
      id: req.user?.id as string,
      role: req.user?.role as Role,
    });
  }

  @ApiOperation({ summary: 'Actualizar un bloque horario' })
  @ApiParam({ name: 'subjectId', description: 'ID de la materia' })
  @ApiParam({ name: 'scheduleId', description: 'ID del horario' })
  @Patch(':scheduleId')
  update(
    @Param('subjectId') subjectId: string,
    @Param('scheduleId') scheduleId: string,
    @Body() dto: UpdateSubjectScheduleDto,
    @Req() req: { user?: { id?: string; role?: Role } },
  ) {
    return this.subjectSchedulesService.update(
      subjectId,
      scheduleId,
      dto,
      {
        id: req.user?.id as string,
        role: req.user?.role as Role,
      },
    );
  }

  @ApiOperation({ summary: 'Eliminar un bloque horario' })
  @ApiParam({ name: 'subjectId', description: 'ID de la materia' })
  @ApiParam({ name: 'scheduleId', description: 'ID del horario' })
  @Delete(':scheduleId')
  remove(
    @Param('subjectId') subjectId: string,
    @Param('scheduleId') scheduleId: string,
    @Req() req: { user?: { id?: string; role?: Role } },
  ) {
    return this.subjectSchedulesService.remove(subjectId, scheduleId, {
      id: req.user?.id as string,
      role: req.user?.role as Role,
    });
  }
}
