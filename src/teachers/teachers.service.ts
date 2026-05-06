import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class TeachersService {

  constructor(private readonly prisma: PrismaService) {}  

  async create(createTeacherDto: CreateTeacherDto) {
    const teacher = await this.prisma.teacher.create({
      data: {
        ...createTeacherDto,
      },
    });
    return teacher;
  }

  async findAll() {
    const teachers = await this.prisma.teacher.findMany({
      include: {
        subjects: true,
      },
    });
    return teachers;
  }

  async findOne(id: string) {
    const teacher = await this.prisma.teacher.findUnique({
      where: { id },
      include: {
        subjects: true,
      },
    });
    if (!teacher) {
      throw new NotFoundException('Teacher not found');
    }
    return teacher;
  }

  async update(id: string, updateTeacherDto: UpdateTeacherDto) {
    const updatedTeacher = await this.prisma.teacher.update({
      where: { id },
      data: updateTeacherDto,
    });
    if (!updatedTeacher) {
      throw new NotFoundException('Teacher not found');
    }
    return updatedTeacher;
  }

  async remove(id: string) {
    const deletedTeacher = await this.prisma.teacher.delete({
      where: { id },
    });
    if (!deletedTeacher) {
      throw new NotFoundException('Teacher not found');
    }
    return deletedTeacher;
  }
}
