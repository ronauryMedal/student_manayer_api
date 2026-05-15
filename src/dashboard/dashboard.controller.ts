import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/JwtAuthGuard/Jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { DashboardService } from './dashboard.service';

@ApiTags('dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @ApiOperation({
    summary: 'Inicio del estudiante',
    description:
      'Tareas pendientes + materias del cuatrimestre actual (según tu UserCareer) con horarios y profesores asignados.',
  })
  @Get('me')
  @Roles(Role.STUDENT)
  getMyHome(@Req() req: { user?: { id?: string } }) {
    return this.dashboardService.getStudentHome(req.user?.id as string);
  }
}
