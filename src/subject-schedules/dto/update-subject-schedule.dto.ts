import { PartialType } from '@nestjs/swagger';
import { CreateSubjectScheduleDto } from './create-subject-schedule.dto';

export class UpdateSubjectScheduleDto extends PartialType(
  CreateSubjectScheduleDto,
) {}
