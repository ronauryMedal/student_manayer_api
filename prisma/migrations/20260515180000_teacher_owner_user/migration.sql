-- AlterTable
ALTER TABLE "Teacher" ADD COLUMN "ownerUserId" TEXT;

-- CreateIndex
CREATE INDEX "Teacher_ownerUserId_idx" ON "Teacher"("ownerUserId");

-- AddForeignKey
ALTER TABLE "Teacher" ADD CONSTRAINT "Teacher_ownerUserId_fkey" FOREIGN KEY ("ownerUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
