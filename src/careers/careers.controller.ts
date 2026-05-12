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
import { CareersService } from './careers.service';
import { CreateCareerDto } from './dto/create-career.dto';
import { CreateMyCareerDto } from './dto/create-my-career.dto';
import { UpdateCareerDto } from './dto/update-career.dto';

@ApiTags('careers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('careers')
export class CareersController {
  constructor(private readonly careersService: CareersService) {}

  @Post()
  @Roles(Role.ADMIN)
  create(@Body() createCareerDto: CreateCareerDto) {
    return this.careersService.create(createCareerDto);
  }

  @Get('me')
  @Roles(Role.STUDENT)
  findMine(@Req() req: { user?: { id?: string } }) {
    return this.careersService.findMine(req.user?.id as string);
  }

  @Post('me')
  @Roles(Role.STUDENT)
  createMine(
    @Body() dto: CreateMyCareerDto,
    @Req() req: { user?: { id?: string } },
  ) {
    return this.careersService.createForStudent(req.user?.id as string, dto);
  }

  @Get()
  findAll() {
    return this.careersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.careersService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  update(@Param('id') id: string, @Body() updateCareerDto: UpdateCareerDto) {
    return this.careersService.update(id, updateCareerDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.careersService.remove(id);
  }
}
