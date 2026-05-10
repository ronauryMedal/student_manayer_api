import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';

@Injectable()
export class SubjectsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createSubjectDto: CreateSubjectDto) {
    return this.prisma.subject.create({
      data: createSubjectDto,
      include: {
        career: true,
        schedules: { orderBy: [{ weekday: 'asc' }, { startTime: 'asc' }] },
        teachers: {
          include: {
            teacher: true,
          },
        },
      },
    });
  }

  async findAll() {
    return this.prisma.subject.findMany({
      include: {
        career: true,
        schedules: { orderBy: [{ weekday: 'asc' }, { startTime: 'asc' }] },
        teachers: {
          include: {
            teacher: true,
          },
        },
      },
    });
  }

  async findOne(id: string) {
    const subject = await this.prisma.subject.findUnique({
      where: { id },
      include: {
        career: true,
        schedules: { orderBy: [{ weekday: 'asc' }, { startTime: 'asc' }] },
        teachers: {
          include: {
            teacher: true,
          },
        },
      },
    });

    if (!subject) {
      throw new NotFoundException('Subject not found');
    }

    return subject;
  }

  async update(id: string, updateSubjectDto: UpdateSubjectDto) {
    const subject = await this.prisma.subject.findUnique({
      where: { id },
    });

    if (!subject) {
      throw new NotFoundException('Subject not found');
    }

    return this.prisma.subject.update({
      where: { id },
      data: updateSubjectDto,
      include: {
        career: true,
        schedules: { orderBy: [{ weekday: 'asc' }, { startTime: 'asc' }] },
        teachers: {
          include: {
            teacher: true,
          },
        },
      },
    });
  }

  async remove(id: string) {
    const subject = await this.prisma.subject.findUnique({
      where: { id },
    });

    if (!subject) {
      throw new NotFoundException('Subject not found');
    }

    return this.prisma.subject.delete({
      where: { id },
    });
  }
}
