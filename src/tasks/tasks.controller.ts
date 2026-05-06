import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseGuards } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Request } from 'express';
import { User } from '@prisma/client';
import { JwtAuthGuard } from 'src/auth/JwtAuthGuard/Jwt-auth.guard';
import { ApiBearerAuth, ApiBody, ApiOperation } from '@nestjs/swagger';
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @ApiOperation({ summary: 'Crear una nueva tarea' })
  @ApiBearerAuth()
  @ApiBody({ type: CreateTaskDto })
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createTaskDto: CreateTaskDto, @Req() req: Request & { user: User }) {
    return this.tasksService.create(createTaskDto, req.user.id as string);
  }

  @ApiOperation({ summary: 'Obtener todas las tareas' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Req() req: Request & { user: User }) {
    return this.tasksService.findAll(req.user.id as string);
  }

  @ApiOperation({ summary: 'Obtener una tarea específica' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: Request & { user: User }) {
    return this.tasksService.findOne(id, req.user.id as string);
  }

  @ApiOperation({ summary: 'Actualizar una tarea' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto, @Req() req: Request & { user: User }) {
    return this.tasksService.update(id, updateTaskDto, req.user.id as string);
  }

  @ApiOperation({ summary: 'Eliminar una tarea' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: Request & { user: User }) {
    return this.tasksService.remove(id, req.user.id as string);
  }
}
