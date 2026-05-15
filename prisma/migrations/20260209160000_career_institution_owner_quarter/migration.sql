-- Índice en ownerUserId (si no existe)
CREATE INDEX IF NOT EXISTS "Career_ownerUserId_idx" ON "Career"("ownerUserId");

-- Renombrar semesterNumber → quarterNumber solo si aún no se aplicó
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Subject'
      AND column_name = 'semesterNumber'
  ) THEN
    ALTER TABLE "Subject" RENAME COLUMN "semesterNumber" TO "quarterNumber";
  END IF;
END $$;
