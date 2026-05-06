import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { CreateUserSemesterDto } from './dto/create-user-semester.dto';
import { UpdateUserSemesterDto } from './dto/update-user-semester.dto';
import { UserSemestersService } from './user-semesters.service';

@Controller('user-semesters')
export class UserSemestersController {
  constructor(private readonly userSemestersService: UserSemestersService) {}

  @Post()
  create(@Body() createUserSemesterDto: CreateUserSemesterDto) {
    return this.userSemestersService.create(createUserSemesterDto);
  }

  @Get()
  findAll() {
    return this.userSemestersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userSemestersService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateUserSemesterDto: UpdateUserSemesterDto,
  ) {
    return this.userSemestersService.update(id, updateUserSemesterDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userSemestersService.remove(id);
  }
}
