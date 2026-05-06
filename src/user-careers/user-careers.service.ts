import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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

  async enrollUserInCareer(
    userId: string,
    careerId: string,
    currentSemester: number,
  ) {
    const existingRelation = await this.prisma.userCareer.findFirst({
      where: { userId, careerId },
    });

    if (existingRelation) {
      throw new ConflictException('User is already enrolled in this career');
    }

    return this.prisma.userCareer.create({
      data: {
        userId,
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
    });

    if (!relation) {
      throw new NotFoundException('UserCareer relation not found');
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
}
