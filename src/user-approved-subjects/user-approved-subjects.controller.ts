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
import { AddMySubjectDto } from './dto/add-my-subject.dto';
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

  @Get('me')
  @Roles(Role.STUDENT)
  findMine(@Req() req: { user?: { id?: string } }) {
    return this.userApprovedSubjectsService.findMine(req.user?.id as string);
  }

  @Post('me')
  @Roles(Role.STUDENT)
  enrollMine(
    @Body() dto: AddMySubjectDto,
    @Req() req: { user?: { id?: string } },
  ) {
    return this.userApprovedSubjectsService.enrollMine(
      req.user?.id as string,
      dto.subjectId,
    );
  }

  @Delete('me/:id')
  @Roles(Role.STUDENT)
  removeMine(
    @Param('id') id: string,
    @Req() req: { user?: { id?: string } },
  ) {
    return this.userApprovedSubjectsService.removeMine(req.user?.id as string, id);
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
