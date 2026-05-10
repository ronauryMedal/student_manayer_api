import { Module } from '@nestjs/common';
import { SubjectSchedulesController } from 'src/subject-schedules/subject-schedules.controller';
import { SubjectSchedulesService } from 'src/subject-schedules/subject-schedules.service';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { SubjectsController } from './subjects.controller';
import { SubjectsService } from './subjects.service';

@Module({
  controllers: [SubjectsController, SubjectSchedulesController],
  providers: [SubjectsService, SubjectSchedulesService, RolesGuard],
})
export class SubjectsModule {}
