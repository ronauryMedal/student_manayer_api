import { Module } from '@nestjs/common';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { UserApprovedSubjectsController } from './user-approved-subjects.controller';
import { UserApprovedSubjectsService } from './user-approved-subjects.service';

@Module({
  controllers: [UserApprovedSubjectsController],
  providers: [UserApprovedSubjectsService, RolesGuard],
})
export class UserApprovedSubjectsModule {}
