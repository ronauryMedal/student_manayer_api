import { Module } from '@nestjs/common';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { SubjectTeachersController } from './subject-teachers.controller';
import { SubjectTeachersService } from './subject-teachers.service';

@Module({
  controllers: [SubjectTeachersController],
  providers: [SubjectTeachersService, RolesGuard],
})
export class SubjectTeachersModule {}
