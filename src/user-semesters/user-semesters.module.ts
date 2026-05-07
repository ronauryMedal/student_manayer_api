import { Module } from '@nestjs/common';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { UserSemestersController } from './user-semesters.controller';
import { UserSemestersService } from './user-semesters.service';

@Module({
  controllers: [UserSemestersController],
  providers: [UserSemestersService, RolesGuard],
})
export class UserSemestersModule {}
