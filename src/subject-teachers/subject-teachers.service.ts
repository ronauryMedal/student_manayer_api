import { Injectable } from '@nestjs/common';
import { CreateSubjectTeacherDto } from './dto/create-subject-teacher.dto';
import { UpdateSubjectTeacherDto } from './dto/update-subject-teacher.dto';

@Injectable()
export class SubjectTeachersService {
  create(createSubjectTeacherDto: CreateSubjectTeacherDto) {
    return {
      message: 'TODO: Implement create subject-teacher logic',
      payload: createSubjectTeacherDto,
    };
  }

  findAll() {
    return { message: 'TODO: Implement find all subject-teacher logic' };
  }

  findOne(id: string) {
    return { message: `TODO: Implement find subject-teacher ${id} logic` };
  }

  update(id: string, updateSubjectTeacherDto: UpdateSubjectTeacherDto) {
    return {
      message: `TODO: Implement update subject-teacher ${id} logic`,
      payload: updateSubjectTeacherDto,
    };
  }

  remove(id: string) {
    return { message: `TODO: Implement remove subject-teacher ${id} logic` };
  }
}
