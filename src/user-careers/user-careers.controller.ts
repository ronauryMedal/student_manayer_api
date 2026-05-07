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
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/JwtAuthGuard/Jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { CreateUserCareerDto } from './dto/create-user-career.dto';
import { SelectOwnCareerDto } from './dto/select-own-career.dto';
import { UpdateUserCareerDto } from './dto/update-user-career.dto';
import { UserCareersService } from './user-careers.service';

@ApiTags('user-careers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('user-careers')
export class UserCareersController {
  constructor(private readonly userCareersService: UserCareersService) {}

  @Post()
  @Roles(Role.ADMIN)
  create(@Body() createUserCareerDto: CreateUserCareerDto) {
    return this.userCareersService.enrollUserInCareer(
      createUserCareerDto.userId,
      createUserCareerDto.careerId,
      createUserCareerDto.currentSemester,
    );
  }

  @Post('me')
  selectMyCareer(
    @Body() selectOwnCareerDto: SelectOwnCareerDto,
    @Req() req: { user?: { id?: string } },
  ) {
    return this.userCareersService.enrollUserInCareer(
      req.user?.id as string,
      selectOwnCareerDto.careerId,
      selectOwnCareerDto.currentSemester,
    );
  }

  @Get()
  @Roles(Role.ADMIN)
  findAll() {
    return this.userCareersService.findAll();
  }

  @Get('user/:userId')
  @Roles(Role.ADMIN)
  findByUser(@Param('userId') userId: string) {
    return this.userCareersService.findByUser(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userCareersService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
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
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.userCareersService.remove(id);
  }
}
