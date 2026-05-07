import { Module } from '@nestjs/common';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { CareersService } from './careers.service';
import { CareersController } from './careers.controller';

@Module({
  controllers: [CareersController],
  providers: [CareersService, RolesGuard],
})
export class CareersModule {}
