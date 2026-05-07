const { PrismaClient, Role, GradeType, NotificationType } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('12345678', 10);

  await prisma.message.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.calification.deleteMany();
  await prisma.task.deleteMany();
  await prisma.userApprovedSubject.deleteMany();
  await prisma.subjectTeacher.deleteMany();
  await prisma.userSemester.deleteMany();
  await prisma.userCareer.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.teacher.deleteMany();
  await prisma.career.deleteMany();
  await prisma.user.deleteMany();

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

  const career = await prisma.career.create({
    data: {
      name: 'Ingenieria de Software',
      description: 'Carrera orientada al desarrollo de software',
      totalCredits: 240,
      totalSemester: 12,
    },
  });

  const subject1 = await prisma.subject.create({
    data: {
      name: 'Programacion I',
      credits: 4,
      semesterNumber: 1,
      careerId: career.id,
    },
  });

  const subject2 = await prisma.subject.create({
    data: {
      name: 'Base de Datos I',
      credits: 4,
      semesterNumber: 2,
      careerId: career.id,
    },
  });

  const teacher1 = await prisma.teacher.create({
    data: {
      name: 'Ana Martinez',
      email: 'ana.martinez@study.com',
    },
  });

  const teacher2 = await prisma.teacher.create({
    data: {
      name: 'Carlos Perez',
      email: 'carlos.perez@study.com',
    },
  });

  await prisma.subjectTeacher.createMany({
    data: [
      { subjectId: subject1.id, teacherId: teacher1.id },
      { subjectId: subject2.id, teacherId: teacher2.id },
    ],
  });

  const userCareer = await prisma.userCareer.create({
    data: {
      userId: student.id,
      careerId: career.id,
      currentSemester: 2,
    },
  });

  await prisma.userSemester.createMany({
    data: [
      { userCareerId: userCareer.id, number: 1, isActive: false },
      { userCareerId: userCareer.id, number: 2, isActive: true },
    ],
  });

  await prisma.task.createMany({
    data: [
      {
        title: 'Practica de funciones',
        description: 'Resolver ejercicios de funciones en JS',
        dueDate: new Date('2026-05-20T23:59:00.000Z'),
        userId: student.id,
        subjectId: subject1.id,
      },
      {
        title: 'Modelo entidad-relacion',
        description: 'Disenar diagrama ER del proyecto',
        dueDate: new Date('2026-05-25T23:59:00.000Z'),
        userId: student.id,
        subjectId: subject2.id,
      },
    ],
  });

  await prisma.calification.create({
    data: {
      score: 85,
      maxScore: 100,
      type: GradeType.EXAM,
      userId: student.id,
      subjectId: subject1.id,
    },
  });

  await prisma.userApprovedSubject.create({
    data: {
      userId: student.id,
      subjectId: subject1.id,
    },
  });

  await prisma.notification.create({
    data: {
      userId: student.id,
      title: 'Recordatorio de tarea',
      message: 'Tienes una tarea pendiente para Programacion I.',
      type: NotificationType.TASK_REMINDER,
      isRead: false,
    },
  });

  await prisma.message.create({
    data: {
      senderId: admin.id,
      receiverId: student.id,
      content: 'Bienvenido a Study Manager API.',
    },
  });

  console.log('Seed completado con datos de prueba.');
  console.log('Admin => admin@study.com / 12345678');
  console.log('Student => student@study.com / 12345678');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
