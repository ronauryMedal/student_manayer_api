/**
 * Seed alineado con el esquema actual:
 * - Career: institution, ownerUserId (null = catálogo admin)
 * - Subject: quarterNumber, modality, building/section/courseNumber (presencial/híbrido)
 * - SubjectSchedule, SubjectTeacher, UserCareer, UserSemester, UserApprovedSubject, etc.
 *
 * Orden de borrado: hijos → padres (respeta FKs).
 */
const {
  PrismaClient,
  Role,
  GradeType,
  NotificationType,
  Weekday,
  SubjectModality,
} = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function safeDeleteMany(model, label) {
  try {
    await model.deleteMany();
  } catch (e) {
    if (e.code === 'P2021') {
      console.warn(`[seed] Omitido deleteMany en ${label}: tabla no existe (ejecuta migrate deploy).`);
    } else {
      throw e;
    }
  }
}

async function main() {
  const passwordHash = await bcrypt.hash('12345678', 10);

  await safeDeleteMany(prisma.message, 'Message');
  await safeDeleteMany(prisma.notification, 'Notification');
  await safeDeleteMany(prisma.calification, 'calification');
  await safeDeleteMany(prisma.task, 'Task');
  await safeDeleteMany(prisma.userApprovedSubject, 'UserApprovedSubject');
  await safeDeleteMany(prisma.subjectTeacher, 'SubjectTeacher');
  await safeDeleteMany(prisma.subjectSchedule, 'SubjectSchedule');
  await safeDeleteMany(prisma.userSemester, 'UserSemester');
  await safeDeleteMany(prisma.userCareer, 'UserCareer');
  await safeDeleteMany(prisma.subject, 'Subject');
  await safeDeleteMany(prisma.teacher, 'Teacher');
  await safeDeleteMany(prisma.career, 'Career');
  await safeDeleteMany(prisma.user, 'User');

  const admin = await prisma.user.create({
    data: {
      name: 'Administrador',
      email: 'admin@study.com',
      password: passwordHash,
      role: Role.ADMIN,
    },
  });

  const student = await prisma.user.create({
    data: {
      name: 'Estudiante Demo',
      email: 'student@study.com',
      password: passwordHash,
      role: Role.STUDENT,
    },
  });

  const studentMaria = await prisma.user.create({
    data: {
      name: 'Maria Lopez',
      email: 'maria@study.com',
      password: passwordHash,
      role: Role.STUDENT,
    },
  });

  // --- Carreras ---
  // Catálogo admin (GET /careers solo admin)
  const careerCatalog = await prisma.career.create({
    data: {
      name: 'Ingenieria de Software (plantilla catalogo)',
      institution: 'Universidad Demo (catalogo)',
      description:
        'Carrera de referencia sin dueno. No usable por estudiante en POST /user-careers/me.',
      totalCredits: 240,
      totalSemester: 12,
      ownerUserId: null,
    },
  });

  // Plan activo del estudiante demo (mismo nombre de carrera, otra institución que la de Maria)
  const careerStudentMain = await prisma.career.create({
    data: {
      name: 'Ingenieria de Software',
      institution: 'Universidad Demo',
      description: 'Carrera orientada al desarrollo de software',
      totalCredits: 240,
      totalSemester: 12,
      ownerUserId: null,
    },
  });

  // Carrera de catalogo con materia ficticia opcional? Skip - student can't use catalog for enroll

  const teachers = await prisma.$transaction([
    prisma.teacher.create({
      data: {
        name: 'Ana Martinez',
        email: 'ana.martinez@study.com',
      },
    }),
    prisma.teacher.create({
      data: {
        name: 'Carlos Perez',
        email: 'carlos.perez@study.com',
      },
    }),
    prisma.teacher.create({
      data: {
        name: 'Laura Gimenez',
        email: 'laura.gimenez@study.com',
      },
    }),
  ]);
  const [teacher1, teacher2, teacher3] = teachers;

  // --- Materias del plan principal (student) ---
  const subjectProg = await prisma.subject.create({
    data: {
      name: 'Programacion I',
      credits: 4,
      quarterNumber: 1,
      careerId: careerStudentMain.id,
      modality: SubjectModality.IN_PERSON,
      building: 'Edificio Central',
      section: 'A',
      courseNumber: 'PROG-2026-01',
    },
  });

  await prisma.subjectSchedule.createMany({
    data: [
      {
        subjectId: subjectProg.id,
        weekday: Weekday.MONDAY,
        startTime: new Date(Date.UTC(1970, 0, 1, 8, 0, 0, 0)),
        endTime: new Date(Date.UTC(1970, 0, 1, 10, 0, 0, 0)),
        room: 'Aula 101',
      },
      {
        subjectId: subjectProg.id,
        weekday: Weekday.FRIDAY,
        startTime: new Date(Date.UTC(1970, 0, 1, 18, 0, 0, 0)),
        endTime: new Date(Date.UTC(1970, 0, 1, 20, 0, 0, 0)),
        room: 'Lab 2',
      },
    ],
  });

  const subjectBd = await prisma.subject.create({
    data: {
      name: 'Base de Datos I',
      credits: 4,
      quarterNumber: 2,
      careerId: careerStudentMain.id,
      modality: SubjectModality.IN_PERSON,
      building: 'Edificio Tecnologia',
      section: 'B',
      courseNumber: 'BD-2026-02',
    },
  });

  await prisma.subjectSchedule.create({
    data: {
      subjectId: subjectBd.id,
      weekday: Weekday.WEDNESDAY,
      startTime: new Date(Date.UTC(1970, 0, 1, 14, 0, 0, 0)),
      endTime: new Date(Date.UTC(1970, 0, 1, 16, 0, 0, 0)),
      room: 'Aula 204',
    },
  });

  // Misma carrera, mismo cuatrimestre que Prog I: varias materias en un periodo
  const subjectWebVirtual = await prisma.subject.create({
    data: {
      name: 'Introduccion Web (virtual)',
      credits: 3,
      quarterNumber: 1,
      careerId: careerStudentMain.id,
      modality: SubjectModality.VIRTUAL,
      building: null,
      section: null,
      courseNumber: null,
    },
  });

  const subjectArqHybrid = await prisma.subject.create({
    data: {
      name: 'Arquitectura de Software',
      credits: 3,
      quarterNumber: 3,
      careerId: careerStudentMain.id,
      modality: SubjectModality.HYBRID,
      building: 'Edificio Central',
      section: 'C',
      courseNumber: 'ARQ-2026-03',
    },
  });

  await prisma.subjectSchedule.create({
    data: {
      subjectId: subjectArqHybrid.id,
      weekday: Weekday.TUESDAY,
      startTime: new Date(Date.UTC(1970, 0, 1, 10, 0, 0, 0)),
      endTime: new Date(Date.UTC(1970, 0, 1, 12, 30, 0, 0)),
      room: 'Aula 305 / Meet',
    },
  });

  await prisma.subjectTeacher.createMany({
    data: [
      { subjectId: subjectProg.id, teacherId: teacher1.id },
      { subjectId: subjectBd.id, teacherId: teacher2.id },
      { subjectId: subjectWebVirtual.id, teacherId: teacher1.id },
      { subjectId: subjectArqHybrid.id, teacherId: teacher1.id },
      { subjectId: subjectArqHybrid.id, teacherId: teacher3.id },
    ],
  });

  const userCareerStudent = await prisma.userCareer.create({
    data: {
      userId: student.id,
      careerId: careerStudentMain.id,
      currentSemester: 2,
    },
  });

  await prisma.userSemester.createMany({
    data: [
      { userCareerId: userCareerStudent.id, number: 1, isActive: false },
      { userCareerId: userCareerStudent.id, number: 2, isActive: true },
      { userCareerId: userCareerStudent.id, number: 3, isActive: false },
    ],
  });

  await prisma.task.createMany({
    data: [
      {
        title: 'Practica de funciones',
        description: 'Resolver ejercicios de funciones en JS',
        dueDate: new Date('2026-05-20T23:59:00.000Z'),
        userId: student.id,
        subjectId: subjectProg.id,
      },
      {
        title: 'Modelo entidad-relacion',
        description: 'Disenar diagrama ER del proyecto',
        dueDate: new Date('2026-05-25T23:59:00.000Z'),
        userId: student.id,
        subjectId: subjectBd.id,
      },
      {
        title: 'Lectura HTML semantico',
        dueDate: new Date('2026-06-01T23:59:00.000Z'),
        userId: student.id,
        subjectId: subjectWebVirtual.id,
      },
    ],
  });

  await prisma.calification.createMany({
    data: [
      {
        score: 85,
        maxScore: 100,
        type: GradeType.EXAM,
        userId: student.id,
        subjectId: subjectProg.id,
      },
      {
        score: 7.5,
        maxScore: 10,
        type: GradeType.PROJECT,
        userId: student.id,
        subjectId: subjectBd.id,
      },
    ],
  });

  await prisma.userApprovedSubject.createMany({
    data: [
      { userId: student.id, subjectId: subjectProg.id },
      { userId: student.id, subjectId: subjectWebVirtual.id },
    ],
  });

  // --- Maria: plan corto (1 cuatrimestre), solo virtual ---
  const careerMaria = await prisma.career.create({
    data: {
      name: 'UX Basico',
      institution: 'Plataforma Online Demo',
      description: 'Curso corto para probar totalSemester = 1 y creditos bajos',
      totalCredits: 30,
      totalSemester: 1,
      ownerUserId: studentMaria.id,
    },
  });

  const subjectMariaUx = await prisma.subject.create({
    data: {
      name: 'Fundamentos de UX',
      credits: 30,
      quarterNumber: 1,
      careerId: careerMaria.id,
      modality: SubjectModality.VIRTUAL,
      building: null,
      section: null,
      courseNumber: null,
    },
  });

  await prisma.subjectTeacher.create({
    data: { subjectId: subjectMariaUx.id, teacherId: teacher3.id },
  });

  const userCareerMaria = await prisma.userCareer.create({
    data: {
      userId: studentMaria.id,
      careerId: careerMaria.id,
      currentSemester: 1,
    },
  });

  await prisma.userSemester.create({
    data: { userCareerId: userCareerMaria.id, number: 1, isActive: true },
  });

  await prisma.userApprovedSubject.create({
    data: { userId: studentMaria.id, subjectId: subjectMariaUx.id },
  });

  await prisma.task.create({
    data: {
      title: 'Mapa de empatia',
      dueDate: new Date('2026-06-10T23:59:00.000Z'),
      userId: studentMaria.id,
      subjectId: subjectMariaUx.id,
    },
  });

  await prisma.notification.createMany({
    data: [
      {
        userId: student.id,
        title: 'Recordatorio de tarea',
        message: 'Tienes una tarea pendiente para Programacion I.',
        type: NotificationType.TASK_REMINDER,
        isRead: false,
      },
      {
        userId: studentMaria.id,
        title: 'Bienvenida',
        message: 'Completá tu primera tarea en Fundamentos de UX.',
        type: NotificationType.GENERAL,
        isRead: false,
      },
    ],
  });

  await prisma.message.create({
    data: {
      senderId: admin.id,
      receiverId: student.id,
      content: 'Bienvenido a Study Manager API (seed).',
    },
  });

  console.log('');
  console.log('========== SEED OK ==========');
  console.log('');
  console.log('Usuarios (password en todos: 12345678)');
  console.log('  ADMIN   ', admin.email);
  console.log('  STUDENT ', student.email, ' — plan largo + 2 carreras propias (1 inscrita)');
  console.log('  STUDENT ', studentMaria.email, ' — plan corto 1 cuatrimestre');
  console.log('');
  console.log('IDs utiles (copiar a Postman/Swagger si hace falta)');
  console.log('  careerCatalog (solo admin):     ', careerCatalog.id);
  console.log('  careerStudentMain (owner demo): ', careerStudentMain.id);
  console.log('  careerMaria:                    ', careerMaria.id);
  console.log('  subjectProg / subjectBd / subjectWebVirtual / subjectArqHybrid');
  console.log('    ', subjectProg.id, subjectBd.id, subjectWebVirtual.id, subjectArqHybrid.id);
  console.log('');
  console.log('Que probar');
  console.log('  - Login student@study.com -> GET /careers/me (2 carreras), GET /subjects/me');
  console.log('  - POST /user-approved-subjects/me con subjectBd (misma carrera inscrita)');
  console.log('  - POST /subject-teachers/me con teacherId existente y subjectId propio');
  console.log('  - Login admin@study.com -> GET /careers (incluye catalogo + personales)');
  console.log('  - maria@study.com -> flujo curso corto + una materia virtual');
  console.log('');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
