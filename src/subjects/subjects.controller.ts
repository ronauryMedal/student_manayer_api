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
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';
import { SubjectsService } from './subjects.service';

@ApiTags('subjects')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('subjects')
export class SubjectsController {
  constructor(private readonly subjectsService: SubjectsService) {}

  @Post()
  @Roles(Role.ADMIN)
  create(@Body() createSubjectDto: CreateSubjectDto) {
    return this.subjectsService.create(createSubjectDto);
  }

  @ApiOperation({
    summary: 'Crear materia en mi carrera',
    description: '`careerId` debe ser una carrera creada por ti (owner).',
  })
  @Post('me')
  @Roles(Role.STUDENT)
  createMine(
    @Body() createSubjectDto: CreateSubjectDto,
    @Req() req: { user?: { id?: string } },
  ) {
    return this.subjectsService.createMine(
      req.user?.id as string,
      createSubjectDto,
    );
  }

  @Get()
  @Roles(Role.ADMIN)
  findAll() {
    return this.subjectsService.findAll();
  }

  @ApiOperation({ summary: 'Materias de mis carreras (planes que yo creé)' })
  @Get('me')
  @Roles(Role.STUDENT)
  findMine(@Req() req: { user?: { id?: string } }) {
    return this.subjectsService.findMine(req.user?.id as string);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Req() req: { user?: { id?: string; role?: Role } },
  ) {
    return this.subjectsService.findOneForRequester(id, {
      id: req.user?.id as string,
      role: req.user?.role as Role,
    });
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateSubjectDto: UpdateSubjectDto,
    @Req() req: { user?: { id?: string; role?: Role } },
  ) {
    return this.subjectsService.updateForRequester(
      id,
      updateSubjectDto,
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
    return this.subjectsService.removeForRequester(id, {
      id: req.user?.id as string,
      role: req.user?.role as Role,
    });
  }
}
