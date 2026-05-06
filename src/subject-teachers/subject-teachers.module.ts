import { Module } from '@nestjs/common';
import { SubjectTeachersController } from './subject-teachers.controller';
import { SubjectTeachersService } from './subject-teachers.service';

@Module({
  controllers: [SubjectTeachersController],
  providers: [SubjectTeachersService],
})
export class SubjectTeachersModule {}
