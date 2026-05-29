-- Add richer compensation metadata and view tracking to job listings.
CREATE TYPE "SalaryDisplayType" AS ENUM ('NOT_SPECIFIED', 'FLAT', 'RANGE');
CREATE TYPE "SalaryTaxType" AS ENUM ('UNSPECIFIED', 'NET', 'GROSS');

ALTER TABLE "JobListing"
ADD COLUMN "salaryDisplayType" "SalaryDisplayType" NOT NULL DEFAULT 'NOT_SPECIFIED',
ADD COLUMN "salaryTaxType" "SalaryTaxType" NOT NULL DEFAULT 'UNSPECIFIED',
ADD COLUMN "viewCount" INTEGER NOT NULL DEFAULT 0;

UPDATE "JobListing"
SET "salaryDisplayType" = CASE
  WHEN "salaryMin" IS NULL AND "salaryMax" IS NULL THEN 'NOT_SPECIFIED'::"SalaryDisplayType"
  WHEN "salaryMin" IS NOT NULL AND "salaryMax" IS NOT NULL AND "salaryMin" = "salaryMax" THEN 'FLAT'::"SalaryDisplayType"
  ELSE 'RANGE'::"SalaryDisplayType"
END;
