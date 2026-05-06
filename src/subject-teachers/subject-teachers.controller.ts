import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { CreateSubjectTeacherDto } from './dto/create-subject-teacher.dto';
import { UpdateSubjectTeacherDto } from './dto/update-subject-teacher.dto';
import { SubjectTeachersService } from './subject-teachers.service';

@Controller('subject-teachers')
export class SubjectTeachersController {
  constructor(private readonly subjectTeachersService: SubjectTeachersService) {}

  @Post()
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
  update(
    @Param('id') id: string,
    @Body() updateSubjectTeacherDto: UpdateSubjectTeacherDto,
  ) {
    return this.subjectTeachersService.update(id, updateSubjectTeacherDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.subjectTeachersService.remove(id);
  }
}
