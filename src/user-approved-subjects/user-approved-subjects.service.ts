import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserApprovedSubjectDto } from './dto/create-user-approved-subject.dto';
import { UpdateUserApprovedSubjectDto } from './dto/update-user-approved-subject.dto';

@Injectable()
export class UserApprovedSubjectsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUserApprovedSubjectDto: CreateUserApprovedSubjectDto) {
    const [user, subject] = await Promise.all([
      this.prisma.user.findUnique({
        where: { id: createUserApprovedSubjectDto.userId },
      }),
      this.prisma.subject.findUnique({
        where: { id: createUserApprovedSubjectDto.subjectId },
      }),
    ]);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!subject) {
      throw new NotFoundException('Subject not found');
    }

    const existing = await this.prisma.userApprovedSubject.findFirst({
      where: {
        userId: createUserApprovedSubjectDto.userId,
        subjectId: createUserApprovedSubjectDto.subjectId,
      },
    });

    if (existing) {
      throw new ConflictException('This subject is already approved by this user');
    }

    const approvedAt = createUserApprovedSubjectDto.approvedAt
      ? new Date(createUserApprovedSubjectDto.approvedAt)
      : new Date();

    return this.prisma.userApprovedSubject.create({
      data: {
        userId: createUserApprovedSubjectDto.userId,
        subjectId: createUserApprovedSubjectDto.subjectId,
        approvedAt,
      },
      include: {
        user: true,
        subject: true,
      },
    });
  }

  async findAll() {
    return this.prisma.userApprovedSubject.findMany({
      include: {
        user: true,
        subject: true,
      },
    });
  }

  async findOne(id: string) {
    const item = await this.prisma.userApprovedSubject.findUnique({
      where: { id },
      include: {
        user: true,
        subject: true,
      },
    });

    if (!item) {
      throw new NotFoundException('UserApprovedSubject relation not found');
    }

    return item;
  }

  async update(
    id: string,
    updateUserApprovedSubjectDto: UpdateUserApprovedSubjectDto,
  ) {
    const current = await this.prisma.userApprovedSubject.findUnique({
      where: { id },
    });

    if (!current) {
      throw new NotFoundException('UserApprovedSubject relation not found');
    }

    const targetUserId = updateUserApprovedSubjectDto.userId ?? current.userId;
    const targetSubjectId =
      updateUserApprovedSubjectDto.subjectId ?? current.subjectId;

    const [user, subject] = await Promise.all([
      this.prisma.user.findUnique({ where: { id: targetUserId } }),
      this.prisma.subject.findUnique({ where: { id: targetSubjectId } }),
    ]);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!subject) {
      throw new NotFoundException('Subject not found');
    }

    const duplicate = await this.prisma.userApprovedSubject.findFirst({
      where: {
        id: { not: id },
        userId: targetUserId,
        subjectId: targetSubjectId,
      },
    });

    if (duplicate) {
      throw new ConflictException('This subject is already approved by this user');
    }

    return this.prisma.userApprovedSubject.update({
      where: { id },
      data: {
        userId: updateUserApprovedSubjectDto.userId,
        subjectId: updateUserApprovedSubjectDto.subjectId,
        approvedAt: updateUserApprovedSubjectDto.approvedAt
          ? new Date(updateUserApprovedSubjectDto.approvedAt)
          : undefined,
      },
      include: {
        user: true,
        subject: true,
      },
    });
  }

  async remove(id: string) {
    const item = await this.prisma.userApprovedSubject.findUnique({
      where: { id },
    });

    if (!item) {
      throw new NotFoundException('UserApprovedSubject relation not found');
    }

    return this.prisma.userApprovedSubject.delete({
      where: { id },
    });
  }

  async findMine(userId: string) {
    return this.prisma.userApprovedSubject.findMany({
      where: { userId },
      include: {
        subject: {
          include: {
            career: true,
            schedules: {
              orderBy: [{ weekday: 'asc' }, { startTime: 'asc' }],
            },
          },
        },
      },
      orderBy: { approvedAt: 'desc' },
    });
  }

  async addMySubject(userId: string, subjectId: string) {
    const userCareer = await this.prisma.userCareer.findFirst({
      where: { userId },
    });

    if (!userCareer) {
      throw new BadRequestException(
        'Primero debes inscribirte en una carrera antes de agregar materias',
      );
    }

    const subject = await this.prisma.subject.findUnique({
      where: { id: subjectId },
      include: { career: true },
    });

    if (!subject) {
      throw new NotFoundException('Subject not found');
    }

    if (subject.career.ownerUserId !== userId) {
      throw new ForbiddenException(
        'Solo puedes registrar materias de planes (carreras) que tú creaste',
      );
    }

    if (subject.careerId !== userCareer.careerId) {
      throw new ForbiddenException(
        'Esta materia no pertenece a la carrera en la que estás inscrito',
      );
    }

    const existing = await this.prisma.userApprovedSubject.findFirst({
      where: { userId, subjectId },
    });

    if (existing) {
      throw new ConflictException('Ya tienes registrada esta materia');
    }

    return this.prisma.userApprovedSubject.create({
      data: {
        userId,
        subjectId,
        approvedAt: new Date(),
      },
      include: {
        subject: {
          include: {
            career: true,
            schedules: {
              orderBy: [{ weekday: 'asc' }, { startTime: 'asc' }],
            },
          },
        },
      },
    });
  }

  async removeMine(userId: string, enrollmentId: string) {
    const item = await this.prisma.userApprovedSubject.findFirst({
      where: { id: enrollmentId, userId },
    });

    if (!item) {
      throw new NotFoundException('Inscripción a materia no encontrada');
    }

    return this.prisma.userApprovedSubject.delete({
      where: { id: enrollmentId },
    });
  }
}
