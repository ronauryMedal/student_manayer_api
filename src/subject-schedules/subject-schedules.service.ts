import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateSubjectScheduleDto } from './dto/create-subject-schedule.dto';
import { UpdateSubjectScheduleDto } from './dto/update-subject-schedule.dto';

@Injectable()
export class SubjectSchedulesService {
  constructor(private readonly prisma: PrismaService) {}

  private timeStringToUtcDate(hm: string): Date {
    const [h, m] = hm.split(':').map(Number);
    if (
      Number.isNaN(h) ||
      Number.isNaN(m) ||
      h < 0 ||
      h > 23 ||
      m < 0 ||
      m > 59
    ) {
      throw new BadRequestException('Horario inválido');
    }
    return new Date(Date.UTC(1970, 0, 1, h, m, 0, 0));
  }

  private assertEndAfterStart(start: Date, end: Date) {
    if (end.getTime() <= start.getTime()) {
      throw new BadRequestException(
        'La hora de fin debe ser posterior a la de inicio',
      );
    }
  }

  async assertSubjectExists(subjectId: string) {
    const subject = await this.prisma.subject.findUnique({
      where: { id: subjectId },
    });
    if (!subject) {
      throw new NotFoundException('Subject not found');
    }
    return subject;
  }

  async findBySubject(subjectId: string) {
    await this.assertSubjectExists(subjectId);
    return this.prisma.subjectSchedule.findMany({
      where: { subjectId },
      orderBy: [{ weekday: 'asc' }, { startTime: 'asc' }],
    });
  }

  async create(subjectId: string, dto: CreateSubjectScheduleDto) {
    await this.assertSubjectExists(subjectId);
    const startTime = this.timeStringToUtcDate(dto.startTime);
    const endTime = this.timeStringToUtcDate(dto.endTime);
    this.assertEndAfterStart(startTime, endTime);

    return this.prisma.subjectSchedule.create({
      data: {
        subjectId,
        weekday: dto.weekday,
        startTime,
        endTime,
        room: dto.room,
      },
    });
  }

  async update(
    subjectId: string,
    scheduleId: string,
    dto: UpdateSubjectScheduleDto,
  ) {
    const existing = await this.prisma.subjectSchedule.findFirst({
      where: { id: scheduleId, subjectId },
    });

    if (!existing) {
      throw new NotFoundException('Horario no encontrado para esta materia');
    }

    const startTime =
      dto.startTime !== undefined
        ? this.timeStringToUtcDate(dto.startTime)
        : existing.startTime;
    const endTime =
      dto.endTime !== undefined
        ? this.timeStringToUtcDate(dto.endTime)
        : existing.endTime;
    this.assertEndAfterStart(startTime, endTime);

    return this.prisma.subjectSchedule.update({
      where: { id: scheduleId },
      data: {
        weekday: dto.weekday,
        startTime: dto.startTime !== undefined ? startTime : undefined,
        endTime: dto.endTime !== undefined ? endTime : undefined,
        room: dto.room,
      },
    });
  }

  async remove(subjectId: string, scheduleId: string) {
    const existing = await this.prisma.subjectSchedule.findFirst({
      where: { id: scheduleId, subjectId },
    });

    if (!existing) {
      throw new NotFoundException('Horario no encontrado para esta materia');
    }

    return this.prisma.subjectSchedule.delete({
      where: { id: scheduleId },
    });
  }
}
