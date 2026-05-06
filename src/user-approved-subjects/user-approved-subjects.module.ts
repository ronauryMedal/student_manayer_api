import { Module } from '@nestjs/common';
import { UserApprovedSubjectsController } from './user-approved-subjects.controller';
import { UserApprovedSubjectsService } from './user-approved-subjects.service';

@Module({
  controllers: [UserApprovedSubjectsController],
  providers: [UserApprovedSubjectsService],
})
export class UserApprovedSubjectsModule {}
