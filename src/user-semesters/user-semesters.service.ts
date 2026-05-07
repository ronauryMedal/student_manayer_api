import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserSemesterDto } from './dto/create-user-semester.dto';
import { UpdateUserSemesterDto } from './dto/update-user-semester.dto';

@Injectable()
export class UserSemestersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUserSemesterDto: CreateUserSemesterDto) {
    const userCareer = await this.prisma.userCareer.findUnique({
      where: { id: createUserSemesterDto.userCareerId },
      include: {
        career: true,
      },
    });

    if (!userCareer) {
      throw new NotFoundException('UserCareer relation not found');
    }

    if (createUserSemesterDto.number > userCareer.career.totalSemester) {
      throw new ConflictException(
        `Semester number cannot exceed ${userCareer.career.totalSemester}`,
      );
    }

    const existingNumber = await this.prisma.userSemester.findFirst({
      where: {
        userCareerId: createUserSemesterDto.userCareerId,
        number: createUserSemesterDto.number,
      },
    });

    if (existingNumber) {
      throw new ConflictException(
        'This semester number already exists for the selected user career',
      );
    }

    if (createUserSemesterDto.isActive) {
      await this.prisma.userSemester.updateMany({
        where: { userCareerId: createUserSemesterDto.userCareerId },
        data: { isActive: false },
      });
    }

    return this.prisma.userSemester.create({
      data: createUserSemesterDto,
      include: {
        userCareer: {
          include: {
            user: true,
            career: true,
          },
        },
      },
    });
  }

  async findAll() {
    return this.prisma.userSemester.findMany({
      include: {
        userCareer: {
          include: {
            user: true,
            career: true,
          },
        },
      },
    });
  }

  async findOne(id: string) {
    const semester = await this.prisma.userSemester.findUnique({
      where: { id },
      include: {
        userCareer: {
          include: {
            user: true,
            career: true,
          },
        },
      },
    });

    if (!semester) {
      throw new NotFoundException('UserSemester not found');
    }

    return semester;
  }

  async update(id: string, updateUserSemesterDto: UpdateUserSemesterDto) {
    const current = await this.prisma.userSemester.findUnique({
      where: { id },
      include: {
        userCareer: {
          include: { career: true },
        },
      },
    });

    if (!current) {
      throw new NotFoundException('UserSemester not found');
    }

    const targetUserCareerId =
      updateUserSemesterDto.userCareerId ?? current.userCareerId;
    const targetNumber = updateUserSemesterDto.number ?? current.number;

    const userCareer =
      targetUserCareerId === current.userCareerId
        ? current.userCareer
        : await this.prisma.userCareer.findUnique({
            where: { id: targetUserCareerId },
            include: { career: true },
          });

    if (!userCareer) {
      throw new NotFoundException('UserCareer relation not found');
    }

    if (targetNumber > userCareer.career.totalSemester) {
      throw new ConflictException(
        `Semester number cannot exceed ${userCareer.career.totalSemester}`,
      );
    }

    const duplicate = await this.prisma.userSemester.findFirst({
      where: {
        id: { not: id },
        userCareerId: targetUserCareerId,
        number: targetNumber,
      },
    });

    if (duplicate) {
      throw new ConflictException(
        'This semester number already exists for the selected user career',
      );
    }

    if (updateUserSemesterDto.isActive) {
      await this.prisma.userSemester.updateMany({
        where: { userCareerId: targetUserCareerId },
        data: { isActive: false },
      });
    }

    return this.prisma.userSemester.update({
      where: { id },
      data: updateUserSemesterDto,
      include: {
        userCareer: {
          include: {
            user: true,
            career: true,
          },
        },
      },
    });
  }

  async remove(id: string) {
    const semester = await this.prisma.userSemester.findUnique({
      where: { id },
    });

    if (!semester) {
      throw new NotFoundException('UserSemester not found');
    }

    return this.prisma.userSemester.delete({
      where: { id },
    });
  }
}
