import { Module } from '@nestjs/common';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { TeachersService } from './teachers.service';
import { TeachersController } from './teachers.controller';

@Module({
  controllers: [TeachersController],
  providers: [TeachersService, RolesGuard],
})
export class TeachersModule {}
