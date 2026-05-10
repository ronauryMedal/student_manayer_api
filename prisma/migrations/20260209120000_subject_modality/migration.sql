-- CreateEnum
CREATE TYPE "SubjectModality" AS ENUM ('IN_PERSON', 'VIRTUAL', 'HYBRID');

-- AlterTable
ALTER TABLE "Subject" ADD COLUMN "modality" "SubjectModality" NOT NULL DEFAULT 'IN_PERSON';
