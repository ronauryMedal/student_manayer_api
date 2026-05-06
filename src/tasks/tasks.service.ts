import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createTaskDto: CreateTaskDto, userId: string) {
    const task = await this.prisma.task.create({
      data: {
        ...createTaskDto,
        userId: userId,
        subjectId: createTaskDto.subjectId,
      },
    });
    return task;
  }

  async findAll(userId: string) {
    const tasks = await this.prisma.task.findMany({
      where: { userId },
      include: {
        user: true,
        subject: true,
      },
    });
    return tasks;
  }

  async findOne(id: string, userId: string) {
    const task = await this.prisma.task.findFirst({
      where: { id, userId },
      include: {
        user: true,
        subject: true,
      },
    });
    if (!task) {
      throw new NotFoundException('Task not found');
    }
    return task;
  }

  async update(id: string, updateTaskDto: UpdateTaskDto, userId: string) {
    const task = await this.prisma.task.findFirst({
      where: { id, userId },
    });
    if (!task) {
      throw new NotFoundException('Task not found');
    }
    return this.prisma.task.update({
      where: { id },
      data: updateTaskDto,
    });
    
  }

  async remove(id: string, userId: string) {
    const task = await this.prisma.task.findFirst({
      where: { id, userId },
    });
    if (!task) {
      throw new NotFoundException('Task not found');
    }
    return this.prisma.task.delete({
      where: { id },
    });
  }
}
