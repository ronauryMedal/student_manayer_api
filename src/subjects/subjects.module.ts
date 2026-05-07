import { Module } from '@nestjs/common';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { SubjectsController } from './subjects.controller';
import { SubjectsService } from './subjects.service';

@Module({
  controllers: [SubjectsController],
  providers: [SubjectsService, RolesGuard],
})
export class SubjectsModule {}
