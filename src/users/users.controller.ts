import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ForbiddenException,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/JwtAuthGuard/Jwt-auth.guard';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  private assertProgressAccess(
    requestedUserId: string,
    requester?: { id?: string; role?: Role },
  ) {
    if (requester?.role !== Role.ADMIN && requester?.id !== requestedUserId) {
      throw new ForbiddenException(
        'No tienes permisos para consultar el progreso de este usuario',
      );
    }
  }

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get(':id/progress')
  getProgress(
    @Param('id') id: string,
    @Req() req: { user?: { id?: string; role?: Role } },
  ) {
    this.assertProgressAccess(id, req.user);

    return this.usersService.getProgress(id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get(':id/progress/summary')
  getProgressSummary(
    @Param('id') id: string,
    @Req() req: { user?: { id?: string; role?: Role } },
  ) {
    this.assertProgressAccess(id, req.user);
    return this.usersService.getProgressSummary(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
