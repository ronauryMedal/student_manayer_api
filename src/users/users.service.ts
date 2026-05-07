import { Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UsersService {

  constructor(private readonly prisma: PrismaService) {}



  async create(createUserDto: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        ...createUserDto,
        password: hashedPassword,
      },
    });
    return user;
  }

  async findAll() {
    const users = await this.prisma.user.findMany();
    return users;
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const data: {
      name?: string;
      email?: string;
      password?: string;
    } = {
      name: updateUserDto.name,
      email: updateUserDto.email,
    };
    if (updateUserDto.password !== undefined) {
      data.password = await bcrypt.hash(updateUserDto.password, 10);
    }
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    return this.prisma.user.delete({
      where: { id },
    });
  }

  async getProgress(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const userCareers = await this.prisma.userCareer.findMany({
      where: { userId },
      include: {
        career: true,
      },
    });

    const progressByCareer = await Promise.all(
      userCareers.map(async (userCareer) => {
        const approvedSubjects = await this.prisma.userApprovedSubject.findMany({
          where: {
            userId,
            subject: {
              careerId: userCareer.careerId,
            },
          },
          select: {
            subject: {
              select: {
                id: true,
                name: true,
                credits: true,
              },
            },
          },
        });

        const approvedCredits = approvedSubjects.reduce(
          (sum, item) => sum + item.subject.credits,
          0,
        );
        const totalCredits = userCareer.career.totalCredits;
        const pendingCredits = Math.max(totalCredits - approvedCredits, 0);
        const progressPercent =
          totalCredits > 0
            ? Number(((approvedCredits / totalCredits) * 100).toFixed(2))
            : 0;

        return {
          userCareerId: userCareer.id,
          career: {
            id: userCareer.career.id,
            name: userCareer.career.name,
            totalCredits,
            totalSemester: userCareer.career.totalSemester,
          },
          currentSemester: userCareer.currentSemester,
          approvedCredits,
          pendingCredits,
          progressPercent,
          approvedSubjects: approvedSubjects.map((item) => item.subject),
        };
      }),
    );

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      careers: progressByCareer,
    };
  }

  async getProgressSummary(userId: string) {
    const progress = await this.getProgress(userId);
    const careers = progress.careers;

    if (careers.length === 0) {
      return {
        user: progress.user,
        hasCareer: false,
        activeCareer: null,
        approvedCredits: 0,
        pendingCredits: 0,
        progressPercent: 0,
      };
    }

    const activeCareer = careers.reduce((prev, current) =>
      current.currentSemester > prev.currentSemester ? current : prev,
    );

    return {
      user: progress.user,
      hasCareer: true,
      activeCareer: {
        userCareerId: activeCareer.userCareerId,
        ...activeCareer.career,
        currentSemester: activeCareer.currentSemester,
      },
      approvedCredits: activeCareer.approvedCredits,
      pendingCredits: activeCareer.pendingCredits,
      progressPercent: activeCareer.progressPercent,
    };
  }
}
