import { Module } from '@nestjs/common';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { UserCareersController } from './user-careers.controller';
import { UserCareersService } from './user-careers.service';

@Module({
  controllers: [UserCareersController],
  providers: [UserCareersService, RolesGuard],
  exports: [UserCareersService],
})
export class UserCareersModule {}
