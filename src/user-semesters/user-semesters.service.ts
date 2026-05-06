import { Injectable } from '@nestjs/common';
import { CreateUserSemesterDto } from './dto/create-user-semester.dto';
import { UpdateUserSemesterDto } from './dto/update-user-semester.dto';

@Injectable()
export class UserSemestersService {
  create(createUserSemesterDto: CreateUserSemesterDto) {
    return {
      message: 'TODO: Implement create user semester logic',
      payload: createUserSemesterDto,
    };
  }

  findAll() {
    return { message: 'TODO: Implement find all user semesters logic' };
  }

  findOne(id: string) {
    return { message: `TODO: Implement find user semester ${id} logic` };
  }

  update(id: string, updateUserSemesterDto: UpdateUserSemesterDto) {
    return {
      message: `TODO: Implement update user semester ${id} logic`,
      payload: updateUserSemesterDto,
    };
  }

  remove(id: string) {
    return { message: `TODO: Implement remove user semester ${id} logic` };
  }
}
