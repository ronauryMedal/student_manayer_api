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
    return careers;
  }

  async findOne(id: string) {
    const career = await this.prisma.career.findUnique({
      where: { id },
      include: {
        subjects: true,
        userCareers: {
          include: {
            user: true,
            semesters: {
              select: {
                id: true,
                number: true,
                isActive: true,
              },
            },
          },
        },
      },
    });
    if (!career) {
      throw new NotFoundException('Career not found');
    }
    return career;
  }

  async update(id: string, updateCareerDto: UpdateCareerDto) {
    const career = await this.prisma.career.findUnique({
      where: { id },
    });
    if (!career) {
      throw new NotFoundException('Career not found');
    }
    return this.prisma.career.update({
      where: { id },
      data: updateCareerDto,
    });
  }

  async remove(id: string) {
    const career = await this.prisma.career.findUnique({
      where: { id },
    });
    if (!career) {
      throw new NotFoundException('Career not found');
    }
    return this.prisma.career.delete({
      where: { id },
    });
  }
}
