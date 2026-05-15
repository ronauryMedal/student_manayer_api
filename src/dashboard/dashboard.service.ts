import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

const subjectHomeInclude = {
  career: true,
  schedules: {
    orderBy: [
      { weekday: 'asc' as const },
      { startTime: 'asc' as const },
    ],
  },
  teachers: {
    include: { teacher: true },
  },
};

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  /** Datos agregados para la pantalla de inicio del estudiante. */
  async getStudentHome(userId: string) {
    const userCareer = await this.prisma.userCareer.findFirst({
      where: { userId },
      include: { career: true, semesters: true },
    });

    const pendingTasks = await this.prisma.task.findMany({
      where: { userId, isCompleted: false },
      orderBy: { dueDate: 'asc' },
      take: 50,
      include: {
        subject: {
          include: {
            schedules: {
              orderBy: [{ weekday: 'asc' }, { startTime: 'asc' }],
            },
            career: { select: { id: true, name: true } },
          },
        },
      },
    });

    if (!userCareer) {
      return {
        userCareer: null,
        currentQuarter: null,
        pendingTasks,
        subjectsThisQuarter: [],
      };
    }

    const currentQuarter = userCareer.currentSemester;

    const subjectsThisQuarter = await this.prisma.subject.findMany({
      where: {
        careerId: userCareer.careerId,
        quarterNumber: currentQuarter,
      },
      include: subjectHomeInclude,
      orderBy: [{ name: 'asc' }],
    });

    return {
      userCareer: {
        id: userCareer.id,
        currentSemester: userCareer.currentSemester,
        career: userCareer.career,
        semesters: userCareer.semesters,
      },
      currentQuarter,
      pendingTasks,
      subjectsThisQuarter,
    };
  }
}
