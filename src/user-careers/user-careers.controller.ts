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
import { CreateUserCareerDto } from './dto/create-user-career.dto';
import { UpdateUserCareerDto } from './dto/update-user-career.dto';
import { UserCareersService } from './user-careers.service';

@ApiTags('user-careers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('user-careers')
export class UserCareersController {
  constructor(private readonly userCareersService: UserCareersService) {}

  
  @Post()
  create(@Body() createUserCareerDto: CreateUserCareerDto) {
    return this.userCareersService.enrollUserInCareer(
      createUserCareerDto.userId,
      createUserCareerDto.careerId,
      createUserCareerDto.currentSemester,
    );
  }

  @Get()
  findAll() {
    return this.userCareersService.findAll();
  }

  @Get('user/:userId')
  findByUser(@Param('userId') userId: string) {
    return this.userCareersService.findByUser(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userCareersService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateUserCareerDto: UpdateUserCareerDto,
  ) {
    return this.userCareersService.updateCurrentSemester(
      id,
      updateUserCareerDto.currentSemester,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userCareersService.remove(id);
  }
}
