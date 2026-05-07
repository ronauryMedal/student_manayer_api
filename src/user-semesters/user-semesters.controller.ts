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
import { CreateUserSemesterDto } from './dto/create-user-semester.dto';
import { UpdateUserSemesterDto } from './dto/update-user-semester.dto';
import { UserSemestersService } from './user-semesters.service';

@ApiTags('user-semesters')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('user-semesters')
export class UserSemestersController {
  constructor(private readonly userSemestersService: UserSemestersService) {}

  @Post()
  @Roles(Role.ADMIN)
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
  @Roles(Role.ADMIN)
  update(
    @Param('id') id: string,
    @Body() updateUserSemesterDto: UpdateUserSemesterDto,
  ) {
    return this.userSemestersService.update(id, updateUserSemesterDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.userSemestersService.remove(id);
  }
}
