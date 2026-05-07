import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateSubjectTeacherDto } from './dto/create-subject-teacher.dto';
import { UpdateSubjectTeacherDto } from './dto/update-subject-teacher.dto';

@Injectable()
export class SubjectTeachersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createSubjectTeacherDto: CreateSubjectTeacherDto) {
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
      include: {
        subject: true,
        teacher: true,
      },
    });
  }

  async findAll() {
    return this.prisma.subjectTeacher.findMany({
      include: {
        subject: true,
        teacher: true,
      },
    });
  }

  async findOne(id: string) {
    const relation = await this.prisma.subjectTeacher.findUnique({
      where: { id },
      include: {
        subject: true,
        teacher: true,
      },
    });

    if (!relation) {
      throw new NotFoundException('SubjectTeacher relation not found');
    }

    return relation;
  }

  async update(id: string, updateSubjectTeacherDto: UpdateSubjectTeacherDto) {
    const relation = await this.prisma.subjectTeacher.findUnique({
      where: { id },
    });

    if (!relation) {
      throw new NotFoundException('SubjectTeacher relation not found');
    }

    const targetSubjectId = updateSubjectTeacherDto.subjectId ?? relation.subjectId;
    const targetTeacherId = updateSubjectTeacherDto.teacherId ?? relation.teacherId;

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
      include: {
        subject: true,
        teacher: true,
      },
    });
  }

  async remove(id: string) {
    const relation = await this.prisma.subjectTeacher.findUnique({
      where: { id },
    });

    if (!relation) {
      throw new NotFoundException('SubjectTeacher relation not found');
    }

    return this.prisma.subjectTeacher.delete({
      where: { id },
    });
  }
}
