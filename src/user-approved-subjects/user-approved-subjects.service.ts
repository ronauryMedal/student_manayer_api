import { Injectable } from '@nestjs/common';
import { CreateUserApprovedSubjectDto } from './dto/create-user-approved-subject.dto';
import { UpdateUserApprovedSubjectDto } from './dto/update-user-approved-subject.dto';

@Injectable()
export class UserApprovedSubjectsService {
  create(createUserApprovedSubjectDto: CreateUserApprovedSubjectDto) {
    return {
      message: 'TODO: Implement create user approved subject logic',
      payload: createUserApprovedSubjectDto,
    };
  }

  findAll() {
    return { message: 'TODO: Implement find all user approved subjects logic' };
  }

  findOne(id: string) {
    return { message: `TODO: Implement find user approved subject ${id} logic` };
  }

  update(
    id: string,
    updateUserApprovedSubjectDto: UpdateUserApprovedSubjectDto,
  ) {
    return {
      message: `TODO: Implement update user approved subject ${id} logic`,
      payload: updateUserApprovedSubjectDto,
    };
  }

  remove(id: string) {
    return { message: `TODO: Implement remove user approved subject ${id} logic` };
  }
}
