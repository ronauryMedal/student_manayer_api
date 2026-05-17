import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CareersModule } from './careers/careers.module';
import { TeachersModule } from './teachers/teachers.module';
import { TasksModule } from './tasks/tasks.module';
import { UserCareersModule } from './user-careers/user-careers.module';
import { SubjectTeachersModule } from './subject-teachers/subject-teachers.module';
import { SubjectsModule } from './subjects/subjects.module';
import { UserApprovedSubjectsModule } from './user-approved-subjects/user-approved-subjects.module';
import { UserSemestersModule } from './user-semesters/user-semesters.module';
import { DashboardModule } from './dashboard/dashboard.module';

@Module({
  imports: [
    PrismaModule,
    UsersModule,
    AuthModule,
    DashboardModule,
    CareersModule,
    TeachersModule,
    TasksModule,
    UserCareersModule,
    UserSemestersModule,
    SubjectsModule,
    SubjectTeachersModule,
    UserApprovedSubjectsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
