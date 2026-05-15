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
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/JwtAuthGuard/Jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { AssignMyTeacherDto } from './dto/assign-my-teacher.dto';
import { CreateSubjectTeacherDto } from './dto/create-subject-teacher.dto';
import { UpdateSubjectTeacherDto } from './dto/update-subject-teacher.dto';
import { SubjectTeachersService } from './subject-teachers.service';

@ApiTags('subject-teachers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('subject-teachers')
export class SubjectTeachersController {
  constructor(private readonly subjectTeachersService: SubjectTeachersService) {}

  @Post()
  @Roles(Role.ADMIN)
  create(@Body() createSubjectTeacherDto: CreateSubjectTeacherDto) {
    return this.subjectTeachersService.create(createSubjectTeacherDto);
  }

  @ApiOperation({
    summary: 'Asignar profesor a mi materia',
    description:
      'La materia debe ser de una carrera que tú creaste. El profesor debe ser uno que tú creaste (POST /teachers/me).',
  })
  @Post('me')
  @Roles(Role.STUDENT)
  assignMine(
    @Body() dto: AssignMyTeacherDto,
    @Req() req: { user?: { id?: string } },
  ) {
    return this.subjectTeachersService.createMine(req.user?.id as string, dto);
  }

  @Get()
  @Roles(Role.ADMIN)
  findAll() {
    return this.subjectTeachersService.findAllAdmin();
  }

  @ApiOperation({ summary: 'Mis asignaciones profesor–materia' })
  @Get('me')
  @Roles(Role.STUDENT)
  findMine(@Req() req: { user?: { id?: string } }) {
    return this.subjectTeachersService.findMine(req.user?.id as string);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Req() req: { user?: { id?: string; role?: Role } },
  ) {
    return this.subjectTeachersService.findOneForRequester(id, {
      id: req.user?.id as string,
      role: req.user?.role as Role,
    });
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateSubjectTeacherDto: UpdateSubjectTeacherDto,
    @Req() req: { user?: { id?: string; role?: Role } },
  ) {
    return this.subjectTeachersService.updateForRequester(
      id,
      updateSubjectTeacherDto,
      {
        id: req.user?.id as string,
        role: req.user?.role as Role,
      },
    );
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @Req() req: { user?: { id?: string; role?: Role } },
  ) {
    return this.subjectTeachersService.removeForRequester(id, {
      id: req.user?.id as string,
      role: req.user?.role as Role,
    });
  }
}
