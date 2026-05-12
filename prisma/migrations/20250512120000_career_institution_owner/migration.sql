-- AlterTable
ALTER TABLE "Career" ADD COLUMN "institution" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Career" ADD COLUMN "ownerUserId" TEXT;

-- AddForeignKey
ALTER TABLE "Career" ADD CONSTRAINT "Career_ownerUserId_fkey" FOREIGN KEY ("ownerUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
