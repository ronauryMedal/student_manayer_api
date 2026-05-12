import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateMySubjectDto } from './dto/create-my-subject.dto';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';

@Injectable()
export class SubjectsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createSubjectDto: CreateSubjectDto) {
    return this.prisma.subject.create({
      data: createSubjectDto,
    });
  }

  /** Materias de carreras creadas por el estudiante (`GET /subjects/me`). */
  async findMine(studentUserId: string) {
    if (!studentUserId) {
      throw new UnauthorizedException();
    }
    return this.prisma.subject.findMany({
      where: {
        career: {
          ownerUserId: studentUserId,
        },
      },
      include: {
        career: true,
      },
      orderBy: [{ semesterNumber: 'asc' }, { name: 'asc' }],
    });
  }

  /** Alta en el plan propio (`POST /subjects/me`). */
  async createForStudent(studentUserId: string, dto: CreateMySubjectDto) {
    if (!studentUserId) {
      throw new UnauthorizedException();
    }
    const career = await this.prisma.career.findUnique({
      where: { id: dto.careerId },
    });
    if (!career) {
      throw new NotFoundException('Career not found');
    }
    if (career.ownerUserId !== studentUserId) {
      throw new ForbiddenException(
        'Solo podés crear materias en carreras que vos creaste.',
      );
    }

    const semesterNumber = Math.max(1, Math.floor(Number(dto.quarterNumber)));

    return this.prisma.subject.create({
      data: {
        name: dto.name.trim(),
        credits: dto.credits,
        semesterNumber,
        careerId: dto.careerId,
      },
      include: {
        career: true,
      },
    });
  }

  async findAll() {
    return this.prisma.subject.findMany({
      include: {
        career: true,
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
