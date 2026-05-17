import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateSubjectTeacherDto } from './dto/create-subject-teacher.dto';
import { UpdateSubjectTeacherDto } from './dto/update-subject-teacher.dto';

const relationInclude = {
  subject: true,
  teacher: true,
} as const;

@Injectable()
export class SubjectTeachersService {
  constructor(private readonly prisma: PrismaService) {}

  private async assertSubjectOwnedByUser(subjectId: string, userId: string) {
    const subject = await this.prisma.subject.findUnique({
      where: { id: subjectId },
      include: { career: true },
    });
    if (!subject) {
      throw new NotFoundException('Subject not found');
    }
    if (subject.career.ownerUserId !== userId) {
      throw new ForbiddenException(
        'Solo puedes asignar profesores a materias de carreras que tú creaste',
      );
    }
    return subject;
  }

  private assertRelationManagedBy(
    relation: {
      subject: { career: { ownerUserId: string | null } };
    },
    requester: { id: string; role: Role },
  ) {
    if (requester.role === Role.ADMIN) {
      return;
    }
    if (relation.subject.career.ownerUserId !== requester.id) {
      throw new ForbiddenException(
        'No tienes permiso para gestionar esta asignación',
      );
    }
  }

  private assertTeacherOwnedByStudent(
    teacher: { ownerUserId: string | null },
    userId: string,
  ) {
    if (teacher.ownerUserId !== userId) {
      throw new ForbiddenException(
        'Solo puedes asignar profesores que tú creaste (POST /teachers/me)',
      );
    }
  }

  private async createInternal(createSubjectTeacherDto: CreateSubjectTeacherDto) {
    const [subject, teacher] = await Promise.all([
      this.prisma.subject.findUnique({
        where: { id: createSubjectTeacherDto.subjectId },
      }),
      this.prisma.teacher.findUnique({
        where: { id: createSubjectTeacherDto.teacherId },
      }),
    ]);

    if (!subject) {
      throw new NotFoundException('Subject not found');
    }

    if (!teacher) {
      throw new NotFoundException('Teacher not found');
    }

    const existingRelation = await this.prisma.subjectTeacher.findFirst({
      where: {
        subjectId: createSubjectTeacherDto.subjectId,
        teacherId: createSubjectTeacherDto.teacherId,
      },
    });

    if (existingRelation) {
      throw new ConflictException(
        'This teacher is already assigned to this subject',
      );
    }

    return this.prisma.subjectTeacher.create({
      data: createSubjectTeacherDto,
      include: relationInclude,
    });
  }

  async create(createSubjectTeacherDto: CreateSubjectTeacherDto) {
    return this.createInternal(createSubjectTeacherDto);
  }

  async createMine(
    userId: string,
    createSubjectTeacherDto: CreateSubjectTeacherDto,
  ) {
    await this.assertSubjectOwnedByUser(
      createSubjectTeacherDto.subjectId,
      userId,
    );
    const teacher = await this.prisma.teacher.findUnique({
      where: { id: createSubjectTeacherDto.teacherId },
    });
    if (!teacher) {
      throw new NotFoundException('Teacher not found');
    }
    this.assertTeacherOwnedByStudent(teacher, userId);
    return this.createInternal(createSubjectTeacherDto);
  }

  async findAllAdmin() {
    return this.prisma.subjectTeacher.findMany({
      include: relationInclude,
    });
  }

  async findMine(userId: string) {
    return this.prisma.subjectTeacher.findMany({
      where: { subject: { career: { ownerUserId: userId } } },
      include: relationInclude,
      orderBy: { id: 'asc' },
    });
  }

  async findOneForRequester(
    id: string,
    requester: { id: string; role: Role },
  ) {
    const relation = await this.findOneWithCareerOrThrow(id);
    this.assertRelationManagedBy(relation, requester);
    return relation;
  }

  private async findOneWithCareerOrThrow(id: string) {
    const relation = await this.prisma.subjectTeacher.findUnique({
      where: { id },
      include: {
        subject: { include: { career: true } },
        teacher: true,
      },
    });
    if (!relation) {
      throw new NotFoundException('SubjectTeacher relation not found');
    }
    return relation;
  }

  async updateForRequester(
    id: string,
    updateSubjectTeacherDto: UpdateSubjectTeacherDto,
    requester: { id: string; role: Role },
  ) {
    const relation = await this.findOneWithCareerOrThrow(id);
    this.assertRelationManagedBy(relation, requester);

    const targetSubjectId =
      updateSubjectTeacherDto.subjectId ?? relation.subjectId;
    const targetTeacherId =
      updateSubjectTeacherDto.teacherId ?? relation.teacherId;

    if (requester.role === Role.STUDENT) {
      await this.assertSubjectOwnedByUser(targetSubjectId, requester.id);
    }

    const [subject, teacher] = await Promise.all([
      this.prisma.subject.findUnique({
        where: { id: targetSubjectId },
      }),
      this.prisma.teacher.findUnique({
        where: { id: targetTeacherId },
      }),
    ]);

    if (!subject) {
      throw new NotFoundException('Subject not found');
    }

    if (!teacher) {
      throw new NotFoundException('Teacher not found');
    }

    if (requester.role === Role.STUDENT) {
      this.assertTeacherOwnedByStudent(teacher, requester.id);
    }

    const duplicate = await this.prisma.subjectTeacher.findFirst({
      where: {
        id: { not: id },
        subjectId: targetSubjectId,
        teacherId: targetTeacherId,
      },
    });

    if (duplicate) {
      throw new ConflictException(
        'This teacher is already assigned to this subject',
      );
    }

    return this.prisma.subjectTeacher.update({
      where: { id },
      data: updateSubjectTeacherDto,
      include: relationInclude,
    });
  }

  async removeForRequester(
    id: string,
    requester: { id: string; role: Role },
  ) {
    const relation = await this.findOneWithCareerOrThrow(id);
    this.assertRelationManagedBy(relation, requester);

    return this.prisma.subjectTeacher.delete({
      where: { id },
    });
  }
}
