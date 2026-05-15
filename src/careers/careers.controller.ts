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

  @ApiOperation({ summary: 'Crear carrera en catálogo (admin)' })
  @Post()
  @Roles(Role.ADMIN)
  create(@Body() createCareerDto: CreateCareerDto) {
    return this.careersService.createAdminCatalog(createCareerDto);
  }

  @ApiOperation({
    summary: 'Mis carreras creadas',
    description: 'Solo las carreras donde tú eres el dueño del plan',
  })
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
  @Roles(Role.ADMIN)
  findAllAdmin() {
    return this.careersService.findAllAdmin();
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Req() req: { user?: { id?: string; role?: Role } },
  ) {
    return this.careersService.findOneForRequester(id, {
      id: req.user?.id as string,
      role: req.user?.role as Role,
    });
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCareerDto: UpdateCareerDto,
    @Req() req: { user?: { id?: string; role?: Role } },
  ) {
    return this.careersService.updateForRequester(id, updateCareerDto, {
      id: req.user?.id as string,
      role: req.user?.role as Role,
    });
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @Req() req: { user?: { id?: string; role?: Role } },
  ) {
    return this.careersService.removeForRequester(id, {
      id: req.user?.id as string,
      role: req.user?.role as Role,
    });
  }
}
