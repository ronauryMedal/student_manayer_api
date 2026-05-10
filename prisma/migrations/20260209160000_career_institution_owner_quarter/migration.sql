-- AlterTable Career
ALTER TABLE "Career" ADD COLUMN "institution" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Career" ADD COLUMN "ownerUserId" TEXT;

CREATE INDEX "Career_ownerUserId_idx" ON "Career"("ownerUserId");

ALTER TABLE "Career" ADD CONSTRAINT "Career_ownerUserId_fkey" FOREIGN KEY ("ownerUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AlterTable Subject: cuatrimestre
ALTER TABLE "Subject" RENAME COLUMN "semesterNumber" TO "quarterNumber";
