import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';

const teacherInclude = {
  subjects: {
    include: {
      subject: true,
    },
  },
} as const;

@Injectable()
export class TeachersService {
  constructor(private readonly prisma: PrismaService) {}

  async createAdminCatalog(createTeacherDto: CreateTeacherDto) {
    return this.prisma.teacher.create({
      data: {
        name: createTeacherDto.name.trim(),
        email: createTeacherDto.email?.trim() || null,
        ownerUserId: null,
      },
      include: teacherInclude,
    });
  }

  /** Profesores creados por el estudiante (`GET /teachers/me`). */
  async findMine(userId: string) {
    if (!userId) {
      throw new UnauthorizedException();
    }
    return this.prisma.teacher.findMany({
      where: { ownerUserId: userId },
      include: teacherInclude,
      orderBy: { name: 'asc' },
    });
  }

  /** Alta propia (`POST /teachers/me`). */
  async createForStudent(userId: string, dto: CreateTeacherDto) {
    if (!userId) {
      throw new UnauthorizedException();
    }
    return this.prisma.teacher.create({
      data: {
        name: dto.name.trim(),
        email: dto.email?.trim() || null,
        ownerUserId: userId,
      },
      include: teacherInclude,
    });
  }

  async findAllAdmin() {
    return this.prisma.teacher.findMany({
      include: teacherInclude,
      orderBy: { name: 'asc' },
    });
  }

  private assertCanReadTeacher(
    teacher: { ownerUserId: string | null },
    requester: { id: string; role: Role },
  ) {
    if (requester.role === Role.ADMIN) {
      return;
    }
    if (teacher.ownerUserId !== requester.id) {
      throw new ForbiddenException(
        'Solo puedes ver profesores que tú creaste',
      );
    }
  }

  private assertCanMutateTeacher(
    teacher: { ownerUserId: string | null },
    requester: { id: string; role: Role },
  ) {
    if (requester.role === Role.ADMIN) {
      return;
    }
    if (teacher.ownerUserId !== requester.id) {
      throw new ForbiddenException(
        'Solo puedes editar o eliminar profesores que tú creaste',
      );
    }
  }

  async findOneForRequester(
    id: string,
    requester: { id: string; role: Role },
  ) {
    const teacher = await this.prisma.teacher.findUnique({
      where: { id },
      include: teacherInclude,
    });
    if (!teacher) {
      throw new NotFoundException('Teacher not found');
    }
    this.assertCanReadTeacher(teacher, requester);
    return teacher;
  }

  async updateForRequester(
    id: string,
    updateTeacherDto: UpdateTeacherDto,
    requester: { id: string; role: Role },
  ) {
    const teacher = await this.prisma.teacher.findUnique({ where: { id } });
    if (!teacher) {
      throw new NotFoundException('Teacher not found');
    }
    this.assertCanMutateTeacher(teacher, requester);
    return this.prisma.teacher.update({
      where: { id },
      data: updateTeacherDto,
      include: teacherInclude,
    });
  }

  async removeForRequester(
    id: string,
    requester: { id: string; role: Role },
  ) {
    const teacher = await this.prisma.teacher.findUnique({ where: { id } });
    if (!teacher) {
      throw new NotFoundException('Teacher not found');
    }
    this.assertCanMutateTeacher(teacher, requester);
    return this.prisma.teacher.delete({
      where: { id },
    });
  }
}
