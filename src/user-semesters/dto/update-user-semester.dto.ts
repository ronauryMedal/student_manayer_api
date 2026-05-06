import { PartialType } from '@nestjs/swagger';
import { CreateUserSemesterDto } from './create-user-semester.dto';

export class UpdateUserSemesterDto extends PartialType(CreateUserSemesterDto) {}
