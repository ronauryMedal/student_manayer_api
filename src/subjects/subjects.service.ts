import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SubjectModality } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';

@Injectable()
export class SubjectsService {
  constructor(private readonly prisma: PrismaService) {}

  private trimOrUndefined(s: string | undefined | null): string | undefined {
    if (s === undefined || s === null) {
      return undefined;
    }
    const t = s.trim();
    return t.length ? t : undefined;
  }

  private assertCampusFieldsForModality(
    modality: SubjectModality,
    campus: {
      building?: string | null;
      section?: string | null;
      courseNumber?: string | null;
    },
  ) {
    if (modality === SubjectModality.VIRTUAL) {
      return;
    }
    const missing: string[] = [];
    if (!campus.building?.trim()) {
      missing.push('building (edificio)');
    }
    if (!campus.section?.trim()) {
      missing.push('section (sección)');
    }
    if (!campus.courseNumber?.trim()) {
      missing.push('courseNumber (número del curso)');
    }
    if (missing.length > 0) {
      throw new BadRequestException(
        `Para modalidad presencial o híbrida debes indicar: ${missing.join(', ')}`,
      );
    }
  }

  async create(createSubjectDto: CreateSubjectDto) {
    const modality =
      createSubjectDto.modality ?? SubjectModality.IN_PERSON;
    const building = this.trimOrUndefined(createSubjectDto.building);
    const section = this.trimOrUndefined(createSubjectDto.section);
    const courseNumber = this.trimOrUndefined(createSubjectDto.courseNumber);

    this.assertCampusFieldsForModality(modality, {
      building: building ?? null,
      section: section ?? null,
      courseNumber: courseNumber ?? null,
    });

    const campusData =
      modality === SubjectModality.VIRTUAL
        ? { building: null, section: null, courseNumber: null }
        : { building, section, courseNumber };

    return this.prisma.subject.create({
      data: {
        name: createSubjectDto.name,
        credits: createSubjectDto.credits,
        semesterNumber: createSubjectDto.semesterNumber,
        careerId: createSubjectDto.careerId,
        modality,
        ...campusData,
      },
      include: {
        career: true,
        schedules: { orderBy: [{ weekday: 'asc' }, { startTime: 'asc' }] },
        teachers: {
          include: {
            teacher: true,
          },
        },
      },
    });
  }

  async findAll() {
    return this.prisma.subject.findMany({
      include: {
        career: true,
        schedules: { orderBy: [{ weekday: 'asc' }, { startTime: 'asc' }] },
        teachers: {
          include: {
            teacher: true,
          },
        },
      },
    });
  }

  async findOne(id: string) {
    const subject = await this.prisma.subject.findUnique({
      where: { id },
      include: {
        career: true,
        schedules: { orderBy: [{ weekday: 'asc' }, { startTime: 'asc' }] },
        teachers: {
          include: {
            teacher: true,
          },
        },
      },
    });

    if (!subject) {
      throw new NotFoundException('Subject not found');
    }

    return subject;
  }

  async update(id: string, updateSubjectDto: UpdateSubjectDto) {
    const subject = await this.prisma.subject.findUnique({
      where: { id },
    });

    if (!subject) {
      throw new NotFoundException('Subject not found');
    }

    const modality =
      updateSubjectDto.modality ?? subject.modality;
    const building =
      updateSubjectDto.building !== undefined
        ? this.trimOrUndefined(updateSubjectDto.building) ?? null
        : subject.building;
    const section =
      updateSubjectDto.section !== undefined
        ? this.trimOrUndefined(updateSubjectDto.section) ?? null
        : subject.section;
    const courseNumber =
      updateSubjectDto.courseNumber !== undefined
        ? this.trimOrUndefined(updateSubjectDto.courseNumber) ?? null
        : subject.courseNumber;

    this.assertCampusFieldsForModality(modality, {
      building,
      section,
      courseNumber,
    });

    const campusPatch =
      modality === SubjectModality.VIRTUAL
        ? { building: null, section: null, courseNumber: null }
        : {
            ...(updateSubjectDto.building !== undefined
              ? { building }
              : {}),
            ...(updateSubjectDto.section !== undefined ? { section } : {}),
            ...(updateSubjectDto.courseNumber !== undefined
              ? { courseNumber }
              : {}),
          };

    const {
      building: _b,
      section: _s,
      courseNumber: _c,
      modality: _m,
      ...scalarFields
    } = updateSubjectDto;

    return this.prisma.subject.update({
      where: { id },
      data: {
        ...scalarFields,
        ...(updateSubjectDto.modality !== undefined ? { modality } : {}),
        ...campusPatch,
      },
      include: {
        career: true,
        schedules: { orderBy: [{ weekday: 'asc' }, { startTime: 'asc' }] },
        teachers: {
          include: {
            teacher: true,
          },
        },
      },
    });
  }

  async remove(id: string) {
    const subject = await this.prisma.subject.findUnique({
      where: { id },
    });

    if (!subject) {
      throw new NotFoundException('Subject not found');
    }

    return this.prisma.subject.delete({
      where: { id },
    });
  }
}
