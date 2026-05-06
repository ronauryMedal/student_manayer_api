import { PartialType } from '@nestjs/swagger';
import { CreateUserApprovedSubjectDto } from './create-user-approved-subject.dto';

export class UpdateUserApprovedSubjectDto extends PartialType(
  CreateUserApprovedSubjectDto,
) {}
