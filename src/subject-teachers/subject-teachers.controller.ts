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
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/JwtAuthGuard/Jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
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

  @Get()
  findAll() {
    return this.subjectTeachersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.subjectTeachersService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  update(
    @Param('id') id: string,
    @Body() updateSubjectTeacherDto: UpdateSubjectTeacherDto,
  ) {
    return this.subjectTeachersService.update(id, updateSubjectTeacherDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.subjectTeachersService.remove(id);
  }
}
