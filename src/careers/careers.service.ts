import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateCareerDto } from './dto/create-career.dto';
import { CreateMyCareerDto } from './dto/create-my-career.dto';
import { UpdateCareerDto } from './dto/update-career.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CareersService {

  constructor(private readonly prisma: PrismaService) {}

  async create(createCareerDto: CreateCareerDto) {
    const career = await this.prisma.career.create({
      data: {
        name: createCareerDto.name,
        description: createCareerDto.description,
        totalCredits: createCareerDto.totalCredits,
        totalSemester: createCareerDto.totalSemester,
        institution: createCareerDto.institution?.trim() ?? '',
        ownerUserId: null,
      },
    });
    return career;
  }

  /** Carreras creadas por el estudiante (`GET /careers/me`). */
  async findMine(userId: string) {
    if (!userId) {
      throw new UnauthorizedException();
    }
    return this.prisma.career.findMany({
      where: { ownerUserId: userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Crea un plan personal y, si `activate !== false`, deja esa carrera como
   * inscripción activa (crea o actualiza `UserCareer`).
   */
  async createForStudent(userId: string, dto: CreateMyCareerDto) {
    if (!userId) {
      throw new UnauthorizedException();
    }

    const totalSemester = Math.max(1, Math.floor(Number(dto.totalSemester)));
    let currentSemester = Math.floor(Number(dto.currentSemester ?? 1));
    if (!Number.isFinite(currentSemester)) {
      currentSemester = 1;
    }
    currentSemester = Math.min(Math.max(1, currentSemester), totalSemester);

    const description = (dto.description ?? '').trim() || 'Sin descripción';

    const career = await this.prisma.career.create({
      data: {
        name: dto.name.trim(),
        institution: dto.institution.trim(),
        description,
        totalCredits: dto.totalCredits,
        totalSemester,
        ownerUserId: userId,
      },
    });

    const activate = dto.activate !== false;
    if (activate) {
      const existing = await this.prisma.userCareer.findFirst({
        where: { userId },
      });
      if (existing) {
        await this.prisma.userCareer.update({
          where: { id: existing.id },
          data: {
            careerId: career.id,
            currentSemester: currentSemester,
          },
        });
      } else {
        await this.prisma.userCareer.create({
          data: {
            userId,
            careerId: career.id,
            currentSemester: currentSemester,
          },
        });
      }
    }

    return career;
  }

  async findAll() {
    const careers = await this.prisma.career.findMany( {
      include: {
        subjects: true,
        userCareers: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            semesters: true,
          },
        },
      },
    });
  }

  async createMyCareer(userId: string, dto: CreateMyCareerDto) {
    const activate = dto.activate !== false;
    const currentSemester = dto.currentSemester ?? 1;

    return this.prisma.$transaction(async (tx) => {
      const career = await tx.career.create({
        data: {
          name: dto.name,
          institution: dto.institution,
          description: dto.description,
          totalCredits: dto.totalCredits,
          totalSemester: dto.totalSemester,
          ownerUserId: userId,
        },
      });

      if (activate) {
        if (currentSemester > career.totalSemester) {
          throw new BadRequestException(
            `El cuatrimestre actual no puede superar ${career.totalSemester}`,
          );
        }
        const existing = await tx.userCareer.findFirst({ where: { userId } });
        if (existing) {
          await tx.userCareer.update({
            where: { id: existing.id },
            data: { careerId: career.id, currentSemester },
          });
        } else {
          await tx.userCareer.create({
            data: {
              userId,
              careerId: career.id,
              currentSemester,
            },
          });
        }
      }

      return tx.career.findUniqueOrThrow({
        where: { id: career.id },
        include: careerInclude,
      });
    });
  }

  async findAllAdmin() {
    return this.prisma.career.findMany({
      include: careerInclude,
      orderBy: [{ institution: 'asc' }, { name: 'asc' }],
    });
  }

  async findMine(ownerUserId: string) {
    return this.prisma.career.findMany({
      where: { ownerUserId },
      include: careerInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  private assertCanReadCareer(
    career: { ownerUserId: string | null },
    requester: { id: string; role: Role },
  ) {
    if (requester.role === Role.ADMIN) {
      return;
    }
    if (career.ownerUserId !== requester.id) {
      throw new ForbiddenException(
        'Solo puedes ver carreras que tú creaste',
      );
    }
  }

  async findOneForRequester(
    id: string,
    requester: { id: string; role: Role },
  ) {
    const career = await this.prisma.career.findUnique({
      where: { id },
      include: careerInclude,
    });
    if (!career) {
      throw new NotFoundException('Career not found');
    }
    this.assertCanReadCareer(career, requester);
    return career;
  }

  private assertCanMutateCareer(
    career: { ownerUserId: string | null },
    requester: { id: string; role: Role },
  ) {
    if (requester.role === Role.ADMIN) {
      return;
    }
    if (career.ownerUserId !== requester.id) {
      throw new ForbiddenException(
        'Solo puedes editar o eliminar carreras que tú creaste',
      );
    }
  }

  async updateForRequester(
    id: string,
    updateCareerDto: UpdateCareerDto,
    requester: { id: string; role: Role },
  ) {
    const career = await this.prisma.career.findUnique({ where: { id } });
    if (!career) {
      throw new NotFoundException('Career not found');
    }
    this.assertCanMutateCareer(career, requester);
    if (requester.role === Role.STUDENT && career.ownerUserId === null) {
      throw new ForbiddenException(
        'No puedes modificar carreras del catálogo administrativo',
      );
    }
    return this.prisma.career.update({
      where: { id },
      data: updateCareerDto,
      include: careerInclude,
    });
  }

  async removeForRequester(
    id: string,
    requester: { id: string; role: Role },
  ) {
    const career = await this.prisma.career.findUnique({ where: { id } });
    if (!career) {
      throw new NotFoundException('Career not found');
    }
    this.assertCanMutateCareer(career, requester);
    if (requester.role === Role.STUDENT && career.ownerUserId === null) {
      throw new ForbiddenException(
        'No puedes eliminar carreras del catálogo administrativo',
      );
    }
    return this.prisma.career.delete({
      where: { id },
    });
  }
}
