import { Module } from '@nestjs/common';
import { UserCareersController } from './user-careers.controller';
import { UserCareersService } from './user-careers.service';

@Module({
  controllers: [UserCareersController],
  providers: [UserCareersService],
  exports: [UserCareersService],
})
export class UserCareersModule {}
