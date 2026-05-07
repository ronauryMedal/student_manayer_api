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
import { CreateUserApprovedSubjectDto } from './dto/create-user-approved-subject.dto';
import { UpdateUserApprovedSubjectDto } from './dto/update-user-approved-subject.dto';
import { UserApprovedSubjectsService } from './user-approved-subjects.service';

@ApiTags('user-approved-subjects')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('user-approved-subjects')
export class UserApprovedSubjectsController {
  constructor(
    private readonly userApprovedSubjectsService: UserApprovedSubjectsService,
  ) {}

  @Post()
  @Roles(Role.ADMIN)
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
  @Roles(Role.ADMIN)
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
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.userApprovedSubjectsService.remove(id);
  }
}
