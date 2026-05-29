-- CareerWave initial database migration
-- Generated for PostgreSQL + Prisma.

CREATE TYPE "UserRole" AS ENUM ('JOB_SEEKER', 'EMPLOYER', 'ADMIN');
CREATE TYPE "AccountStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'DELETED');
CREATE TYPE "EmploymentType" AS ENUM ('FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'FREELANCE', 'TEMPORARY');
CREATE TYPE "RemoteType" AS ENUM ('ON_SITE', 'HYBRID', 'REMOTE');
CREATE TYPE "ExperienceLevel" AS ENUM ('INTERN', 'JUNIOR', 'MID', 'SENIOR', 'LEAD', 'MANAGER');
CREATE TYPE "JobStatus" AS ENUM ('DRAFT', 'ACTIVE', 'PAUSED', 'CLOSED', 'DELETED');
CREATE TYPE "ApplicationStatus" AS ENUM ('SUBMITTED', 'REVIEWING', 'ACCEPTED', 'REJECTED', 'WITHDRAWN');
CREATE TYPE "DocumentType" AS ENUM ('CV', 'COVER_LETTER', 'CERTIFICATE', 'PORTFOLIO', 'OTHER');
CREATE TYPE "NotificationType" AS ENUM ('APPLICATION_SUBMITTED', 'APPLICATION_REVIEWING', 'APPLICATION_ACCEPTED', 'APPLICATION_REJECTED', 'APPLICATION_WITHDRAWN', 'NEW_APPLICANT', 'JOB_PAUSED', 'JOB_CLOSED');
CREATE TYPE "InterviewStatus" AS ENUM ('NOT_SCHEDULED', 'SCHEDULED', 'COMPLETED', 'CANCELLED');

CREATE TABLE "User" (
  "id" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "passwordHash" TEXT NOT NULL,
  "role" "UserRole" NOT NULL,
  "status" "AccountStatus" NOT NULL DEFAULT 'ACTIVE',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "UserProfile" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "fullName" TEXT NOT NULL,
  "phone" TEXT,
  "location" TEXT,
  "headline" TEXT,
  "bio" TEXT,
  "skills" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "education" JSONB,
  "workExperience" JSONB,
  "websiteUrl" TEXT,
  "linkedinUrl" TEXT,
  "githubUrl" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "UserProfile_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Employer" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Employer_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CompanyProfile" (
  "id" TEXT NOT NULL,
  "employerId" TEXT NOT NULL,
  "companyName" TEXT NOT NULL,
  "companyEmail" TEXT NOT NULL,
  "phone" TEXT,
  "websiteUrl" TEXT,
  "location" TEXT,
  "industry" TEXT,
  "employeeCount" TEXT,
  "description" TEXT,
  "logoUrl" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CompanyProfile_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "RefreshToken" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "tokenHash" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "revokedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "JobListing" (
  "id" TEXT NOT NULL,
  "employerId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "requirements" TEXT NOT NULL,
  "benefits" TEXT,
  "location" TEXT NOT NULL,
  "salaryMin" INTEGER,
  "salaryMax" INTEGER,
  "currency" TEXT NOT NULL DEFAULT 'EUR',
  "employmentType" "EmploymentType" NOT NULL,
  "remoteType" "RemoteType" NOT NULL,
  "experienceLevel" "ExperienceLevel" NOT NULL,
  "status" "JobStatus" NOT NULL DEFAULT 'DRAFT',
  "expiresAt" TIMESTAMP(3),
  "publishedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "JobListing_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Application" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "jobId" TEXT NOT NULL,
  "status" "ApplicationStatus" NOT NULL DEFAULT 'SUBMITTED',
  "coverLetter" TEXT,
  "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "reviewedAt" TIMESTAMP(3),
  "withdrawnAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Application_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "UploadedDocument" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "applicationId" TEXT,
  "type" "DocumentType" NOT NULL,
  "originalName" TEXT NOT NULL,
  "fileName" TEXT NOT NULL,
  "fileUrl" TEXT NOT NULL,
  "mimeType" TEXT NOT NULL,
  "sizeBytes" INTEGER NOT NULL,
  "isDefaultCv" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "UploadedDocument_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Bookmark" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "jobId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Bookmark_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Notification" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "type" "NotificationType" NOT NULL,
  "title" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "readAt" TIMESTAMP(3),
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "InterviewNote" (
  "id" TEXT NOT NULL,
  "applicationId" TEXT NOT NULL,
  "employerId" TEXT NOT NULL,
  "status" "InterviewStatus" NOT NULL DEFAULT 'NOT_SCHEDULED',
  "scheduledAt" TIMESTAMP(3),
  "contactEmail" TEXT,
  "contactPhone" TEXT,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "InterviewNote_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE INDEX "User_role_idx" ON "User"("role");
CREATE INDEX "User_status_idx" ON "User"("status");
CREATE INDEX "User_createdAt_idx" ON "User"("createdAt");
CREATE UNIQUE INDEX "UserProfile_userId_key" ON "UserProfile"("userId");
CREATE UNIQUE INDEX "Employer_userId_key" ON "Employer"("userId");
CREATE UNIQUE INDEX "CompanyProfile_employerId_key" ON "CompanyProfile"("employerId");
CREATE INDEX "CompanyProfile_companyName_idx" ON "CompanyProfile"("companyName");
CREATE INDEX "CompanyProfile_location_idx" ON "CompanyProfile"("location");
CREATE INDEX "CompanyProfile_industry_idx" ON "CompanyProfile"("industry");
CREATE UNIQUE INDEX "RefreshToken_tokenHash_key" ON "RefreshToken"("tokenHash");
CREATE INDEX "RefreshToken_userId_idx" ON "RefreshToken"("userId");
CREATE INDEX "RefreshToken_expiresAt_idx" ON "RefreshToken"("expiresAt");
CREATE INDEX "RefreshToken_revokedAt_idx" ON "RefreshToken"("revokedAt");
CREATE UNIQUE INDEX "JobListing_slug_key" ON "JobListing"("slug");
CREATE INDEX "JobListing_employerId_idx" ON "JobListing"("employerId");
CREATE INDEX "JobListing_status_idx" ON "JobListing"("status");
CREATE INDEX "JobListing_publishedAt_idx" ON "JobListing"("publishedAt");
CREATE INDEX "JobListing_createdAt_idx" ON "JobListing"("createdAt");
CREATE INDEX "JobListing_location_idx" ON "JobListing"("location");
CREATE INDEX "JobListing_employmentType_idx" ON "JobListing"("employmentType");
CREATE INDEX "JobListing_remoteType_idx" ON "JobListing"("remoteType");
CREATE INDEX "JobListing_experienceLevel_idx" ON "JobListing"("experienceLevel");
CREATE INDEX "JobListing_salaryMin_salaryMax_idx" ON "JobListing"("salaryMin", "salaryMax");
CREATE UNIQUE INDEX "Application_userId_jobId_key" ON "Application"("userId", "jobId");
CREATE INDEX "Application_userId_idx" ON "Application"("userId");
CREATE INDEX "Application_jobId_idx" ON "Application"("jobId");
CREATE INDEX "Application_status_idx" ON "Application"("status");
CREATE INDEX "Application_submittedAt_idx" ON "Application"("submittedAt");
CREATE INDEX "UploadedDocument_userId_idx" ON "UploadedDocument"("userId");
CREATE INDEX "UploadedDocument_applicationId_idx" ON "UploadedDocument"("applicationId");
CREATE INDEX "UploadedDocument_type_idx" ON "UploadedDocument"("type");
CREATE INDEX "UploadedDocument_isDefaultCv_idx" ON "UploadedDocument"("isDefaultCv");
CREATE UNIQUE INDEX "Bookmark_userId_jobId_key" ON "Bookmark"("userId", "jobId");
CREATE INDEX "Bookmark_userId_idx" ON "Bookmark"("userId");
CREATE INDEX "Bookmark_jobId_idx" ON "Bookmark"("jobId");
CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");
CREATE INDEX "Notification_readAt_idx" ON "Notification"("readAt");
CREATE INDEX "Notification_createdAt_idx" ON "Notification"("createdAt");
CREATE INDEX "InterviewNote_applicationId_idx" ON "InterviewNote"("applicationId");
CREATE INDEX "InterviewNote_employerId_idx" ON "InterviewNote"("employerId");
CREATE INDEX "InterviewNote_status_idx" ON "InterviewNote"("status");
CREATE INDEX "InterviewNote_scheduledAt_idx" ON "InterviewNote"("scheduledAt");

ALTER TABLE "UserProfile" ADD CONSTRAINT "UserProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Employer" ADD CONSTRAINT "Employer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CompanyProfile" ADD CONSTRAINT "CompanyProfile_employerId_fkey" FOREIGN KEY ("employerId") REFERENCES "Employer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "JobListing" ADD CONSTRAINT "JobListing_employerId_fkey" FOREIGN KEY ("employerId") REFERENCES "Employer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Application" ADD CONSTRAINT "Application_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Application" ADD CONSTRAINT "Application_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "JobListing"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UploadedDocument" ADD CONSTRAINT "UploadedDocument_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UploadedDocument" ADD CONSTRAINT "UploadedDocument_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Bookmark" ADD CONSTRAINT "Bookmark_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Bookmark" ADD CONSTRAINT "Bookmark_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "JobListing"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "InterviewNote" ADD CONSTRAINT "InterviewNote_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "InterviewNote" ADD CONSTRAINT "InterviewNote_employerId_fkey" FOREIGN KEY ("employerId") REFERENCES "Employer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
