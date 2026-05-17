import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Role, SubjectModality } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateMySubjectDto } from './dto/create-my-subject.dto';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';

const subjectInclude = {
  career: true,
  schedules: {
    orderBy: [
      { weekday: 'asc' as const },
      { startTime: 'asc' as const },
    ],
  },
  teachers: {
    include: {
      teacher: true,
    },
  },
};

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

  private parseModality(value: string | undefined): SubjectModality {
    if (
      value &&
      (Object.values(SubjectModality) as string[]).includes(value)
    ) {
      return value as SubjectModality;
    }
    return SubjectModality.IN_PERSON;
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

  private async assertQuarterInCareerPlan(
    careerId: string,
    quarterNumber: number,
  ) {
    const career = await this.prisma.career.findUnique({
      where: { id: careerId },
    });
    if (!career) {
      throw new NotFoundException('Career not found');
    }
    if (quarterNumber < 1 || quarterNumber > career.totalSemester) {
      throw new BadRequestException(
        `quarterNumber debe estar entre 1 y ${career.totalSemester} (cuatrimestres del plan)`,
      );
    }
  }

  private assertSubjectReadableBy(
    subject: { career: { ownerUserId: string | null } },
    requester: { id: string; role: Role },
  ) {
    if (requester.role === Role.ADMIN) {
      return;
    }
    if (subject.career.ownerUserId !== requester.id) {
      throw new ForbiddenException(
        'Solo puedes ver materias de carreras que tú creaste',
      );
    }
  }

  private assertSubjectMutableBy(
    subject: { career: { ownerUserId: string | null } },
    requester: { id: string; role: Role },
  ) {
    if (requester.role === Role.ADMIN) {
      return;
    }
    if (subject.career.ownerUserId !== requester.id) {
      throw new ForbiddenException(
        'Solo puedes modificar materias de carreras que tú creaste',
      );
    }
  }

  private async createInternal(createSubjectDto: CreateSubjectDto) {
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

    await this.assertQuarterInCareerPlan(
      createSubjectDto.careerId,
      createSubjectDto.quarterNumber,
    );

    const campusData =
      modality === SubjectModality.VIRTUAL
        ? { building: null, section: null, courseNumber: null }
        : { building, section, courseNumber };

    return this.prisma.subject.create({
      data: {
        name: createSubjectDto.name,
        credits: createSubjectDto.credits,
        quarterNumber: createSubjectDto.quarterNumber,
        careerId: createSubjectDto.careerId,
        modality,
        ...campusData,
      },
      include: subjectInclude,
    });
  }

  async create(createSubjectDto: CreateSubjectDto) {
    return this.createInternal(createSubjectDto);
  }

  async findAll() {
    return this.prisma.subject.findMany({
      include: subjectInclude,
      orderBy: [{ quarterNumber: 'asc' }, { name: 'asc' }],
    });
  }

  async findMine(studentUserId: string) {
    if (!studentUserId) {
      throw new UnauthorizedException();
    }
    return this.prisma.subject.findMany({
      where: {
        career: {
          ownerUserId: studentUserId,
        },
      },
      include: subjectInclude,
      orderBy: [{ quarterNumber: 'asc' }, { name: 'asc' }],
    });
  }

  async createForStudent(studentUserId: string, dto: CreateMySubjectDto) {
    if (!studentUserId) {
      throw new UnauthorizedException();
    }
    const career = await this.prisma.career.findUnique({
      where: { id: dto.careerId },
    });
    if (!career) {
      throw new NotFoundException('Career not found');
    }
    if (career.ownerUserId !== studentUserId) {
      throw new ForbiddenException(
        'Solo podés crear materias en carreras que vos creaste.',
      );
    }

    const quarterNumber = Math.max(1, Math.floor(Number(dto.quarterNumber)));
    await this.assertQuarterInCareerPlan(dto.careerId, quarterNumber);

    const modality =
      (dto.modality as SubjectModality | undefined) ??
      SubjectModality.IN_PERSON;
    const building = this.trimOrUndefined(dto.building ?? undefined);
    const section = this.trimOrUndefined(dto.section ?? undefined);
    const courseNumber = this.trimOrUndefined(dto.courseNumber ?? undefined);

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
        name: dto.name.trim(),
        credits: dto.credits,
        quarterNumber,
        careerId: dto.careerId,
        modality,
        ...campusData,
      },
      include: subjectInclude,
    });
  }

  async findOneForRequester(
    id: string,
    requester: { id: string; role: Role },
  ) {
    const subject = await this.prisma.subject.findUnique({
      where: { id },
      include: subjectInclude,
    });
    if (!subject) {
      throw new NotFoundException('Subject not found');
    }
    this.assertSubjectReadableBy(subject, requester);
    return subject;
  }

  async updateForRequester(
    id: string,
    updateSubjectDto: UpdateSubjectDto,
    requester: { id: string; role: Role },
  ) {
    const subject = await this.prisma.subject.findUnique({
      where: { id },
      include: { career: true },
    });

    if (!subject) {
      throw new NotFoundException('Subject not found');
    }

    this.assertSubjectMutableBy(subject, requester);

    const targetCareerId =
      updateSubjectDto.careerId ?? subject.careerId;
    if (
      requester.role === Role.STUDENT &&
      updateSubjectDto.careerId &&
      updateSubjectDto.careerId !== subject.careerId
    ) {
      const newCareer = await this.prisma.career.findUnique({
        where: { id: updateSubjectDto.careerId },
      });
      if (!newCareer) {
        throw new NotFoundException('Career not found');
      }
      if (newCareer.ownerUserId !== requester.id) {
        throw new ForbiddenException(
          'No puedes mover materias a una carrera que no es tuya',
        );
      }
    }

    const modality =
      updateSubjectDto.modality ?? subject.modality;
    const building =
      updateSubjectDto.building !== undefined
        ? (this.trimOrUndefined(updateSubjectDto.building) ?? null)
        : subject.building;
    const section =
      updateSubjectDto.section !== undefined
        ? (this.trimOrUndefined(updateSubjectDto.section) ?? null)
        : subject.section;
    const courseNumber =
      updateSubjectDto.courseNumber !== undefined
        ? (this.trimOrUndefined(updateSubjectDto.courseNumber) ?? null)
        : subject.courseNumber;

    this.assertCampusFieldsForModality(modality, {
      building,
      section,
      courseNumber,
    });

    const quarterNumber =
      updateSubjectDto.quarterNumber ?? subject.quarterNumber;
    await this.assertQuarterInCareerPlan(targetCareerId, quarterNumber);

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
      include: subjectInclude,
    });
  }

  async removeForRequester(
    id: string,
    requester: { id: string; role: Role },
  ) {
    const subject = await this.prisma.subject.findUnique({
      where: { id },
      include: { career: true },
    });

    if (!subject) {
      throw new NotFoundException('Subject not found');
    }

    this.assertSubjectMutableBy(subject, requester);

    return this.prisma.subject.delete({
      where: { id },
    });
  }
}
