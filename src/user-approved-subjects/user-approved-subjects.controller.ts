import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { CreateUserApprovedSubjectDto } from './dto/create-user-approved-subject.dto';
import { UpdateUserApprovedSubjectDto } from './dto/update-user-approved-subject.dto';
import { UserApprovedSubjectsService } from './user-approved-subjects.service';

@Controller('user-approved-subjects')
export class UserApprovedSubjectsController {
  constructor(
    private readonly userApprovedSubjectsService: UserApprovedSubjectsService,
  ) {}

  @Post()
  create(@Body() createUserApprovedSubjectDto: CreateUserApprovedSubjectDto) {
    return this.userApprovedSubjectsService.create(createUserApprovedSubjectDto);
  }

  @Get()
  findAll() {
    return this.userApprovedSubjectsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userApprovedSubjectsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateUserApprovedSubjectDto: UpdateUserApprovedSubjectDto,
  ) {
    return this.userApprovedSubjectsService.update(
      id,
      updateUserApprovedSubjectDto,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userApprovedSubjectsService.remove(id);
  }
}
