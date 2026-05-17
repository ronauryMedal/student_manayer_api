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
import { TeachersService } from './teachers.service';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';

@ApiTags('teachers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('teachers')
export class TeachersController {
  constructor(private readonly teachersService: TeachersService) {}

  @Post()
  @Roles(Role.ADMIN)
  create(@Body() createTeacherDto: CreateTeacherDto) {
    return this.teachersService.createAdminCatalog(createTeacherDto);
  }

  @ApiOperation({ summary: 'Mis profesores (los que yo creé)' })
  @Get('me')
  @Roles(Role.STUDENT)
  findMine(@Req() req: { user?: { id?: string } }) {
    return this.teachersService.findMine(req.user?.id as string);
  }

  @ApiOperation({
    summary: 'Crear profesor para mis materias',
    description:
      'Crea un docente en tu lista personal. Luego enlázalo con POST /subject-teachers/me',
  })
  @Post('me')
  @Roles(Role.STUDENT)
  createMine(
    @Body() dto: CreateTeacherDto,
    @Req() req: { user?: { id?: string } },
  ) {
    return this.teachersService.createForStudent(req.user?.id as string, dto);
  }

  @Get()
  @Roles(Role.ADMIN)
  findAll() {
    return this.teachersService.findAllAdmin();
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Req() req: { user?: { id?: string; role?: Role } },
  ) {
    return this.teachersService.findOneForRequester(id, {
      id: req.user?.id as string,
      role: req.user?.role as Role,
    });
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateTeacherDto: UpdateTeacherDto,
    @Req() req: { user?: { id?: string; role?: Role } },
  ) {
    return this.teachersService.updateForRequester(id, updateTeacherDto, {
      id: req.user?.id as string,
      role: req.user?.role as Role,
    });
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @Req() req: { user?: { id?: string; role?: Role } },
  ) {
    return this.teachersService.removeForRequester(id, {
      id: req.user?.id as string,
      role: req.user?.role as Role,
    });
  }
}
