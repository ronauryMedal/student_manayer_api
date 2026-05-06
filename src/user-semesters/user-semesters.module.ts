import { Module } from '@nestjs/common';
import { UserSemestersController } from './user-semesters.controller';
import { UserSemestersService } from './user-semesters.service';

@Module({
  controllers: [UserSemestersController],
  providers: [UserSemestersService],
})
export class UserSemestersModule {}
