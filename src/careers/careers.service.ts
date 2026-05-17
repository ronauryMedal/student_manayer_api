import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCareerDto } from './dto/create-career.dto';
import { CreateMyCareerDto } from './dto/create-my-career.dto';
import { UpdateCareerDto } from './dto/update-career.dto';

const careerInclude = {
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
} as const;

@Injectable()
export class CareersService {
  constructor(private readonly prisma: PrismaService) {}

  async createAdminCatalog(createCareerDto: CreateCareerDto) {
    return this.prisma.career.create({
      data: {
        name: createCareerDto.name,
        description: createCareerDto.description,
        totalCredits: createCareerDto.totalCredits,
        totalSemester: createCareerDto.totalSemester,
        institution: createCareerDto.institution?.trim() ?? '',
        ownerUserId: null,
      },
      include: careerInclude,
    });
  }

  async findAllAdmin() {
    return this.prisma.career.findMany({
      include: careerInclude,
      orderBy: [{ institution: 'asc' }, { name: 'asc' }],
    });
  }

  async findMine(userId: string) {
    if (!userId) {
      throw new UnauthorizedException();
    }
    return this.prisma.career.findMany({
      where: { ownerUserId: userId },
      include: careerInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

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
        institution: (dto.institution ?? '').trim(),
        description,
        totalCredits: dto.totalCredits,
        totalSemester,
        ownerUserId: userId,
      },
    });

    const activate = dto.activate !== false;
    if (activate) {
      if (currentSemester > career.totalSemester) {
        throw new BadRequestException(
          `El cuatrimestre actual no puede superar ${career.totalSemester}`,
        );
      }
      const existing = await this.prisma.userCareer.findFirst({
        where: { userId },
      });
      if (existing) {
        await this.prisma.userCareer.update({
          where: { id: existing.id },
          data: {
            careerId: career.id,
            currentSemester,
          },
        });
      } else {
        await this.prisma.userCareer.create({
          data: {
            userId,
            careerId: career.id,
            currentSemester,
          },
        });
      }
    }

    return this.prisma.career.findUniqueOrThrow({
      where: { id: career.id },
      include: careerInclude,
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
    if (career.ownerUserId === null) {
      throw new ForbiddenException(
        'No puedes modificar carreras del catálogo administrativo',
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
    return this.prisma.career.delete({
      where: { id },
    });
  }
}
