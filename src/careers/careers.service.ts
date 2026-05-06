import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCareerDto } from './dto/create-career.dto';
import { UpdateCareerDto } from './dto/update-career.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CareersService {

  constructor(private readonly prisma: PrismaService) {}

  async create(createCareerDto: CreateCareerDto) {
    const career = await this.prisma.career.create({
      data: {
        ...createCareerDto,
      },
    });
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
