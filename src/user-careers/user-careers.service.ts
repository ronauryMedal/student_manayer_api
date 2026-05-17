import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserCareersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.userCareer.findMany({
      include: {
        user: true,
        career: true,
        semesters: true,
      },
    });
  }

  async findOne(id: string) {
    const relation = await this.prisma.userCareer.findUnique({
      where: { id },
      include: {
        user: true,
        career: true,
        semesters: true,
      },
    });

    if (!relation) {
      throw new NotFoundException('UserCareer relation not found');
    }

    return relation;
  }

  /** Inscripción activa del estudiante (`GET /user-careers/me`). */
  async findActiveForUser(userId: string) {
    if (!userId) {
      throw new UnauthorizedException();
    }
    return this.prisma.userCareer.findFirst({
      where: { userId },
      include: {
        career: true,
        semesters: true,
      },
    });
  }

  async enrollUserInCareer(
    userId: string,
    careerId: string,
    currentSemester: number,
    options?: { allowReplace?: boolean; requireOwnedCareer?: boolean },
  ) {
    const [user, career] = await Promise.all([
      this.prisma.user.findUnique({ where: { id: userId } }),
      this.prisma.career.findUnique({ where: { id: careerId } }),
    ]);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!career) {
      throw new NotFoundException('Career not found');
    }

    if (options?.requireOwnedCareer) {
      if (career.ownerUserId !== userId) {
        throw new ForbiddenException(
          'Solo puedes inscribirte en carreras que tú creaste',
        );
      }
    }

    if (currentSemester > career.totalSemester) {
      throw new BadRequestException(
        `Current semester cannot exceed ${career.totalSemester}`,
      );
    }

    const existingRelation = await this.prisma.userCareer.findFirst({
      where: { userId },
    });

    const include = {
      user: true,
      career: true,
      semesters: true,
    } as const;

    if (existingRelation) {
      if (!options?.allowReplace) {
        throw new ConflictException(
          'User already has a career assigned. Only admin can change it.',
        );
      }
      return this.prisma.userCareer.update({
        where: { id: existingRelation.id },
        data: {
          careerId,
          currentSemester,
        },
        include: {
          user: true,
          career: true,
          semesters: true,
        },
      });
    }

    return this.prisma.userCareer.create({
      data: {
        userId,
        careerId,
        currentSemester,
      },
      include,
    });
  }

  async findMine(userId: string) {
    return this.prisma.userCareer.findFirst({
      where: { userId },
      include: {
        user: true,
        career: true,
        semesters: true,
      },
    });
  }

  async findByUser(userId: string) {
    return this.prisma.userCareer.findMany({
      where: { userId },
      include: {
        career: true,
        semesters: true,
      },
    });
  }

  async updateCurrentSemester(id: string, currentSemester: number) {
    const relation = await this.prisma.userCareer.findUnique({
      where: { id },
      include: {
        career: true,
      },
    });

    if (!relation) {
      throw new NotFoundException('UserCareer relation not found');
    }

    if (currentSemester > relation.career.totalSemester) {
      throw new BadRequestException(
        `Current semester cannot exceed ${relation.career.totalSemester}`,
      );
    }

    return this.prisma.userCareer.update({
      where: { id },
      data: { currentSemester },
    });
  }

  async remove(id: string) {
    const relation = await this.prisma.userCareer.findUnique({
      where: { id },
    });

    if (!relation) {
      throw new NotFoundException('UserCareer relation not found');
    }

    return this.prisma.userCareer.delete({
      where: { id },
    });
  }

  async findOneForRequester(
    id: string,
    requesterId: string,
    requesterRole: Role,
  ) {
    const relation = await this.prisma.userCareer.findUnique({
      where: { id },
      include: {
        user: true,
        career: true,
        semesters: true,
      },
    });

    if (!relation) {
      throw new NotFoundException('UserCareer relation not found');
    }

    if (requesterRole === Role.ADMIN) {
      return relation;
    }
    if (relation.userId !== requesterId) {
      throw new ForbiddenException(
        'Solo puedes ver tu propia inscripción a carrera',
      );
    }

    return relation;
  }
}
