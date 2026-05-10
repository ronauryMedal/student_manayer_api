-- CreateEnum
CREATE TYPE "Weekday" AS ENUM ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY');

-- CreateTable
CREATE TABLE "SubjectSchedule" (
    "id" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "weekday" "Weekday" NOT NULL,
    "startTime" TIME(0) NOT NULL,
    "endTime" TIME(0) NOT NULL,
    "room" TEXT,

    CONSTRAINT "SubjectSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SubjectSchedule_subjectId_idx" ON "SubjectSchedule"("subjectId");

-- AddForeignKey
ALTER TABLE "SubjectSchedule" ADD CONSTRAINT "SubjectSchedule_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;
