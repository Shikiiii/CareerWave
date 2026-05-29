# Database explanation

CareerWave uses PostgreSQL with Prisma ORM.

## Main entities

### User

Stores authentication identity:

- email
- password hash
- role
- account status

Roles:

- `JOB_SEEKER`
- `EMPLOYER`
- `ADMIN`

### UserProfile

Stores job seeker profile data:

- full name
- phone
- location
- headline
- bio
- skills
- education
- work experience
- social links

One user has one profile.

### Employer

Connects a user account to employer-specific features.

One employer belongs to one user.

### CompanyProfile

Stores firm/company information:

- company name
- company email
- phone
- website
- location
- industry
- employee count
- description
- logo URL

One employer has one company profile.

### JobListing

Stores job posts:

- title
- slug
- description
- requirements
- benefits
- location
- salary min/max
- currency
- employment type
- remote type
- experience level
- status
- published date
- expiry date

Each job belongs to one employer.

### Application

Connects a job seeker to a job listing.

Important fields:

- user ID
- job ID
- status
- cover letter
- submitted date
- reviewed date
- withdrawn date

A unique constraint on `(userId, jobId)` prevents duplicate applications.

### UploadedDocument

Stores CVs and application attachments:

- owner user
- optional application
- document type
- original file name
- stored file name
- file URL
- MIME type
- size
- default CV flag

### Bookmark

Stores saved jobs for job seekers.

A unique constraint on `(userId, jobId)` prevents duplicate bookmarks.

### Notification

Stores notifications for both job seekers and employers.

Examples:

- new applicant
- application reviewing
- application accepted
- application rejected

### InterviewNote

Stores employer-side notes for accepted/reviewed applications:

- application
- employer
- interview status
- scheduled date
- contact email/phone
- notes

## Important enums

### ApplicationStatus

```txt
SUBMITTED
REVIEWING
ACCEPTED
REJECTED
WITHDRAWN
```

### JobStatus

```txt
DRAFT
ACTIVE
PAUSED
CLOSED
DELETED
```

### EmploymentType

```txt
FULL_TIME
PART_TIME
CONTRACT
INTERNSHIP
FREELANCE
TEMPORARY
```

### RemoteType

```txt
ON_SITE
HYBRID
REMOTE
```

### ExperienceLevel

```txt
INTERN
JUNIOR
MID
SENIOR
LEAD
MANAGER
```

## Relationship summary

```txt
User 1 -> 1 UserProfile
User 1 -> 1 Employer
Employer 1 -> 1 CompanyProfile
Employer 1 -> many JobListing
JobListing 1 -> many Application
User 1 -> many Application
Application 1 -> many UploadedDocument
User 1 -> many UploadedDocument
User 1 -> many Bookmark
JobListing 1 -> many Bookmark
User 1 -> many Notification
Application 1 -> many InterviewNote
Employer 1 -> many InterviewNote
```
