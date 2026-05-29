import {
  ApplicationStatus,
  DocumentType,
  EmploymentType,
  ExperienceLevel,
  InterviewStatus,
  JobStatus,
  NotificationType,
  PrismaClient,
  RemoteType,
  SalaryDisplayType,
  SalaryTaxType,
  UserRole,
} from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

const companySeed = [
  {
    email: "hr@kozloduy-npp.example.com",
    name: "Kozloduy NPP",
    industry: "Energy / Nuclear Power",
    employeeCount: "3,500",
    location: "Kozloduy, Bulgaria",
    logoUrl: "/uploads/company-logos/knpp.svg",
    description: "Kozloduy Nuclear Power Plant is one of Bulgaria's most important energy employers, offering engineering, IT, safety, operations, and administrative roles.",
    jobs: [
      ["Electrical Systems Engineer", "Maintain and improve electrical systems supporting plant operations.", "Electrical engineering degree\nKnowledge of industrial safety standards\nStrong analytical mindset", "Stable employer\nTraining programs\nAdditional health benefits", "Kozloduy, Bulgaria", EmploymentType.FULL_TIME, RemoteType.ON_SITE, ExperienceLevel.MID, SalaryDisplayType.RANGE, SalaryTaxType.GROSS, 2800, 4200],
      ["Cybersecurity Monitoring Specialist", "Support monitoring, incident response, and security reporting for critical infrastructure systems.", "Networking basics\nSecurity monitoring experience\nCareful documentation", "Critical infrastructure experience\nMentorship\nCareer development", "Kozloduy / Hybrid", EmploymentType.FULL_TIME, RemoteType.HYBRID, ExperienceLevel.JUNIOR, SalaryDisplayType.FLAT, SalaryTaxType.NET, 3000, 3000],
    ],
  },
  {
    email: "careers@kaufland.example.com",
    name: "Kaufland Bulgaria",
    industry: "Retail",
    employeeCount: "6,500",
    location: "Sofia, Bulgaria",
    logoUrl: "/uploads/company-logos/k.svg",
    description: "Kaufland Bulgaria is a major retail chain with roles in stores, logistics, marketing, finance, IT, and head office operations.",
    jobs: [
      ["Store Operations Manager", "Lead daily store operations, team performance, stock planning, and customer experience.", "Retail leadership experience\nPeople management skills\nStrong organization", "Performance bonuses\nEmployee discounts\nTraining academy", "Sofia, Bulgaria", EmploymentType.FULL_TIME, RemoteType.ON_SITE, ExperienceLevel.MANAGER, SalaryDisplayType.RANGE, SalaryTaxType.GROSS, 3200, 5200],
      ["Junior Data Analyst", "Work with commercial and operations data to build reports and support better business decisions.", "Excel and SQL basics\nAttention to detail\nInterest in retail analytics", "Hybrid work\nLearning budget\nModern reporting tools", "Sofia / Hybrid", EmploymentType.FULL_TIME, RemoteType.HYBRID, ExperienceLevel.JUNIOR, SalaryDisplayType.RANGE, SalaryTaxType.NET, 2200, 3200],
    ],
  },
  {
    email: "jobs@billa.example.com",
    name: "Billa Bulgaria",
    industry: "Retail / FMCG",
    employeeCount: "5,500",
    location: "Sofia, Bulgaria",
    logoUrl: "/uploads/company-logos/billa.svg",
    description: "Billa Bulgaria operates supermarkets across the country and hires for retail, logistics, finance, marketing, and technology teams.",
    jobs: [
      ["Category Management Assistant", "Support product category planning, supplier communication, and campaign analysis.", "Good Excel skills\nBusiness interest\nOrganized communication", "Food vouchers\nDiscounts\nCareer path in retail", "Sofia, Bulgaria", EmploymentType.FULL_TIME, RemoteType.HYBRID, ExperienceLevel.JUNIOR, SalaryDisplayType.FLAT, SalaryTaxType.NET, 2100, 2100],
      ["Warehouse Shift Coordinator", "Coordinate warehouse shifts, deliveries, and team tasks for efficient logistics operations.", "Logistics experience\nTeam coordination\nShift availability", "Transport support\nBonuses\nStable schedule", "Elin Pelin, Bulgaria", EmploymentType.FULL_TIME, RemoteType.ON_SITE, ExperienceLevel.MID, SalaryDisplayType.RANGE, SalaryTaxType.GROSS, 2400, 3400],
    ],
  },
  {
    email: "people@lukoil.example.com",
    name: "Lukoil Neftochim Burgas",
    industry: "Oil / Manufacturing",
    employeeCount: "3,200",
    location: "Burgas, Bulgaria",
    logoUrl: "/uploads/company-logos/luk.svg",
    description: "Lukoil Neftochim Burgas is a large industrial employer with engineering, production, maintenance, safety, and IT roles.",
    jobs: [
      ["Process Automation Engineer", "Work on process control systems and automation improvements in industrial production.", "PLC/SCADA knowledge\nEngineering background\nSafety-first mindset", "Industrial scale projects\nTraining\nAdditional benefits", "Burgas, Bulgaria", EmploymentType.FULL_TIME, RemoteType.ON_SITE, ExperienceLevel.MID, SalaryDisplayType.RANGE, SalaryTaxType.GROSS, 3000, 5000],
      ["IT Support Specialist", "Support internal users, hardware, software, and business systems across the organization.", "Windows support\nBasic networking\nGood communication", "Stable team\nLearning opportunities\nCompany benefits", "Burgas, Bulgaria", EmploymentType.FULL_TIME, RemoteType.ON_SITE, ExperienceLevel.JUNIOR, SalaryDisplayType.NOT_SPECIFIED, SalaryTaxType.UNSPECIFIED, null, null],
    ],
  },
  {
    email: "talent@dskbank.example.com",
    name: "Bank DSK",
    industry: "Banking / Finance",
    employeeCount: "5,500",
    location: "Sofia, Bulgaria",
    logoUrl: "/uploads/company-logos/dsk.svg",
    description: "Bank DSK is one of Bulgaria's largest banks, hiring in software development, risk, analytics, branch operations, and customer service.",
    jobs: [
      ["Backend Java Developer", "Build and maintain banking services, integrations, and internal platforms.", "Java/Spring experience\nSQL knowledge\nUnderstanding of APIs", "Hybrid work\nPrivate healthcare\nAnnual bonus", "Sofia / Hybrid", EmploymentType.FULL_TIME, RemoteType.HYBRID, ExperienceLevel.MID, SalaryDisplayType.RANGE, SalaryTaxType.NET, 4500, 7000],
      ["Risk Reporting Analyst", "Prepare reports and support risk monitoring for banking products and portfolios.", "Finance or statistics background\nExcel/SQL\nAnalytical thinking", "Professional certificates\nHybrid schedule\nMentorship", "Sofia, Bulgaria", EmploymentType.FULL_TIME, RemoteType.HYBRID, ExperienceLevel.JUNIOR, SalaryDisplayType.FLAT, SalaryTaxType.GROSS, 2800, 2800],
    ],
  },
  {
    email: "jobs@vivacom.example.com",
    name: "Vivacom",
    industry: "Telecommunications",
    employeeCount: "4,500",
    location: "Sofia, Bulgaria",
    logoUrl: "/uploads/company-logos/viva.svg",
    description: "Vivacom is a telecom and technology employer with teams in networking, customer operations, sales, engineering, and software.",
    jobs: [
      ["Network Operations Specialist", "Monitor telecom systems, investigate incidents, and coordinate fixes with engineering teams.", "Networking basics\nShift readiness\nTroubleshooting mindset", "Telecom training\nCareer growth\nEmployee plans", "Sofia, Bulgaria", EmploymentType.FULL_TIME, RemoteType.HYBRID, ExperienceLevel.JUNIOR, SalaryDisplayType.RANGE, SalaryTaxType.NET, 2300, 3600],
      ["React Frontend Developer", "Develop customer-facing portals and internal tools with React and TypeScript.", "React\nTypeScript\nCSS/Tailwind experience", "Hybrid work\nModern stack\nExtra vacation days", "Remote / Bulgaria", EmploymentType.FULL_TIME, RemoteType.REMOTE, ExperienceLevel.MID, SalaryDisplayType.RANGE, SalaryTaxType.NET, 4000, 6500],
    ],
  },
  {
    email: "careers@nek.example.com",
    name: "National Electric Company",
    industry: "Energy",
    employeeCount: "3,500",
    location: "Sofia, Bulgaria",
    logoUrl: "/uploads/company-logos/nek.svg",
    description: "National Electric Company works in electricity generation, trading, and energy infrastructure management.",
    jobs: [
      ["Energy Market Analyst", "Analyze energy market data, prepare forecasts, and support trading decisions.", "Energy market interest\nExcel/Power BI\nAnalytical skills", "Strategic projects\nTraining\nStable employer", "Sofia, Bulgaria", EmploymentType.FULL_TIME, RemoteType.HYBRID, ExperienceLevel.MID, SalaryDisplayType.RANGE, SalaryTaxType.GROSS, 3000, 4600],
      ["Hydro Plant Maintenance Technician", "Support technical maintenance and inspection tasks for hydro power assets.", "Technical education\nMechanical/electrical knowledge\nTravel readiness", "Field experience\nSafety training\nLong-term work", "Bulgaria", EmploymentType.FULL_TIME, RemoteType.ON_SITE, ExperienceLevel.JUNIOR, SalaryDisplayType.NOT_SPECIFIED, SalaryTaxType.UNSPECIFIED, null, null],
    ],
  },
  {
    email: "hr@aurubis.example.com",
    name: "Aurubis Bulgaria",
    industry: "Metals / Manufacturing",
    employeeCount: "1,100",
    location: "Pirdop, Bulgaria",
    logoUrl: "/uploads/company-logos/aur.svg",
    description: "Aurubis Bulgaria is a major copper producer with roles in engineering, production, maintenance, environment, and automation.",
    jobs: [
      ["Environmental Compliance Specialist", "Support environmental reporting, compliance checks, and sustainability initiatives.", "Environmental science background\nStrong documentation\nEnglish skills", "Sustainability projects\nTraining\nTransport support", "Pirdop, Bulgaria", EmploymentType.FULL_TIME, RemoteType.ON_SITE, ExperienceLevel.MID, SalaryDisplayType.RANGE, SalaryTaxType.GROSS, 2600, 4200],
      ["Industrial Automation Technician", "Maintain sensors, controllers, and automation equipment in a production environment.", "Automation basics\nElectrical knowledge\nShift availability", "Hands-on training\nStable salary\nBenefits package", "Pirdop, Bulgaria", EmploymentType.FULL_TIME, RemoteType.ON_SITE, ExperienceLevel.JUNIOR, SalaryDisplayType.FLAT, SalaryTaxType.NET, 2500, 2500],
    ],
  },
  {
    email: "recruitment@sopharma.example.com",
    name: "Sopharma",
    industry: "Pharmaceuticals",
    employeeCount: "3,300",
    location: "Sofia, Bulgaria",
    logoUrl: "/uploads/company-logos/sop.svg",
    description: "Sopharma is a Bulgarian pharmaceutical group hiring in manufacturing, quality, logistics, sales, and IT.",
    jobs: [
      ["Quality Assurance Specialist", "Support quality processes, documentation, and compliance in pharmaceutical production.", "Pharma or chemistry background\nAttention to detail\nGMP knowledge is a plus", "Healthcare benefits\nTraining\nStable employer", "Sofia, Bulgaria", EmploymentType.FULL_TIME, RemoteType.ON_SITE, ExperienceLevel.JUNIOR, SalaryDisplayType.RANGE, SalaryTaxType.GROSS, 2300, 3500],
      ["ERP Systems Consultant", "Support ERP users, process improvements, and reporting workflows across departments.", "ERP experience\nSQL basics\nBusiness process thinking", "Hybrid work\nCross-team projects\nLearning budget", "Sofia / Hybrid", EmploymentType.FULL_TIME, RemoteType.HYBRID, ExperienceLevel.MID, SalaryDisplayType.RANGE, SalaryTaxType.NET, 4200, 6200],
    ],
  },
  {
    email: "jobs@bdz.example.com",
    name: "Bulgarian State Railways",
    industry: "Transport / Rail",
    employeeCount: "8,000+",
    location: "Sofia, Bulgaria",
    logoUrl: "/uploads/company-logos/bdz.svg",
    description: "Bulgarian State Railways is a national transport employer with operations, engineering, logistics, IT, and customer service roles.",
    jobs: [
      ["Rail Operations Dispatcher", "Coordinate train movement information and operational communication with station teams.", "Calm under pressure\nGood communication\nShift availability", "Transport benefits\nTraining\nStable public employer", "Sofia, Bulgaria", EmploymentType.FULL_TIME, RemoteType.ON_SITE, ExperienceLevel.JUNIOR, SalaryDisplayType.FLAT, SalaryTaxType.NET, 2200, 2200],
      ["Infrastructure Project Coordinator", "Help coordinate rail infrastructure projects, documentation, timelines, and stakeholders.", "Project coordination\nTechnical interest\nExcel and reporting", "National projects\nCareer growth\nBenefits", "Sofia / Hybrid", EmploymentType.FULL_TIME, RemoteType.HYBRID, ExperienceLevel.MID, SalaryDisplayType.RANGE, SalaryTaxType.GROSS, 2800, 4300],
    ],
  },
];

async function main() {
  console.log("Seeding CareerWave database...");

  await prisma.interviewNote.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.bookmark.deleteMany();
  await prisma.uploadedDocument.deleteMany();
  await prisma.application.deleteMany();
  await prisma.jobListing.deleteMany();
  await prisma.companyProfile.deleteMany();
  await prisma.employer.deleteMany();
  await prisma.userProfile.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("Password123!", 12);

  const seekers = await Promise.all([
    prisma.user.create({
      data: {
        email: "maria.petkova@example.com",
        passwordHash,
        role: UserRole.JOB_SEEKER,
        profile: {
          create: {
            fullName: "Maria Petkova",
            phone: "+359 888 123 456",
            location: "Sofia, Bulgaria",
            headline: "Junior Frontend Developer",
            bio: "Motivated junior developer focused on React, TypeScript, and accessible user interfaces.",
            skills: ["React", "TypeScript", "TailwindCSS", "HTML", "CSS"],
            education: [{ school: "Technical University Sofia", degree: "Computer Systems", years: "2022 - present" }],
            workExperience: [{ company: "Freelance", role: "Web Assistant", years: "2024 - 2025" }],
          },
        },
        documents: {
          create: {
            type: DocumentType.CV,
            originalName: "maria-petkova-cv.pdf",
            fileName: "maria-petkova-cv.pdf",
            fileUrl: "/uploads/demo/maria-petkova-cv.pdf",
            mimeType: "application/pdf",
            sizeBytes: 128000,
            isDefaultCv: true,
          },
        },
      },
    }),
    prisma.user.create({
      data: {
        email: "ivan.georgiev@example.com",
        passwordHash,
        role: UserRole.JOB_SEEKER,
        profile: {
          create: {
            fullName: "Ivan Georgiev",
            phone: "+359 887 222 111",
            location: "Plovdiv, Bulgaria",
            headline: "QA Automation Engineer",
            bio: "QA engineer interested in automation, Playwright, API testing, and CI pipelines.",
            skills: ["QA", "Playwright", "Postman", "SQL", "GitHub Actions"],
          },
        },
        documents: {
          create: {
            type: DocumentType.CV,
            originalName: "ivan-georgiev-cv.pdf",
            fileName: "ivan-georgiev-cv.pdf",
            fileUrl: "/uploads/demo/ivan-georgiev-cv.pdf",
            mimeType: "application/pdf",
            sizeBytes: 112000,
            isDefaultCv: true,
          },
        },
      },
    }),
  ]);

  const createdJobs = [];
  const demoPostedDayOffsets = [0, 3, 1, 6, 2, 8, 4, 10, 5, 12, 7, 14, 9, 16, 11, 18, 13, 20, 15, 22];
  let jobSequence = 0;

  for (const company of companySeed) {
    const employerUser = await prisma.user.create({
      data: {
        email: company.email,
        passwordHash,
        role: UserRole.EMPLOYER,
        employer: {
          create: {
            companyProfile: {
              create: {
                companyName: company.name,
                companyEmail: company.email,
                location: company.location,
                industry: company.industry,
                employeeCount: company.employeeCount,
                description: company.description,
                logoUrl: company.logoUrl,
                websiteUrl: `https://${slugify(company.name)}.example.com`,
              },
            },
          },
        },
      },
      include: {
        employer: true,
      },
    });

    if (!employerUser.employer) continue;

    for (const [title, description, requirements, benefits, location, employmentType, remoteType, experienceLevel, salaryDisplayType, salaryTaxType, salaryMin, salaryMax] of company.jobs as any[]) {
      const dayOffset = demoPostedDayOffsets[jobSequence % demoPostedDayOffsets.length] ?? jobSequence;
      const postedAt = new Date(Date.now() - dayOffset * 24 * 60 * 60 * 1000);
      postedAt.setSeconds(0, 0);
      jobSequence += 1;

      const job = await prisma.jobListing.create({
        data: {
          employerId: employerUser.employer.id,
          title,
          slug: `${slugify(title)}-${slugify(company.name)}`,
          description,
          requirements,
          benefits,
          location,
          employmentType,
          remoteType,
          experienceLevel,
          salaryDisplayType,
          salaryTaxType,
          salaryMin,
          salaryMax,
          currency: "EUR",
          status: JobStatus.ACTIVE,
          createdAt: postedAt,
          updatedAt: postedAt,
          publishedAt: postedAt,
          viewCount: Math.floor(Math.random() * 850) + 25,
          expiresAt: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        },
      });

      createdJobs.push(job);
    }
  }

  const application = await prisma.application.create({
    data: {
      userId: seekers[0].id,
      jobId: createdJobs[0].id,
      status: ApplicationStatus.REVIEWING,
      coverLetter: "I am interested in this role because it matches my technical background and career goals.",
      documents: {
        create: {
          userId: seekers[0].id,
          type: DocumentType.CV,
          originalName: "maria-petkova-cv.pdf",
          fileName: "maria-petkova-cv.pdf",
          fileUrl: "/uploads/demo/maria-petkova-cv.pdf",
          mimeType: "application/pdf",
          sizeBytes: 128000,
          isDefaultCv: false,
        },
      },
    },
  });

  await prisma.bookmark.createMany({
    data: [
      { userId: seekers[0].id, jobId: createdJobs[3].id },
      { userId: seekers[1].id, jobId: createdJobs[5].id },
      { userId: seekers[1].id, jobId: createdJobs[7].id },
    ],
    skipDuplicates: true,
  });

  await prisma.notification.createMany({
    data: [
      {
        userId: seekers[0].id,
        type: NotificationType.APPLICATION_REVIEWING,
        title: "Application in review",
        message: "Your application is currently being reviewed.",
      },
      {
        userId: seekers[1].id,
        type: NotificationType.APPLICATION_ACCEPTED,
        title: "Profile tip",
        message: "Complete your profile and upload a fresh CV before applying.",
      },
    ],
  });

  await prisma.interviewNote.create({
    data: {
      applicationId: application.id,
      employerId: createdJobs[0].employerId,
      status: InterviewStatus.NOT_SCHEDULED,
      notes: "Candidate looks promising. Check availability for an introductory call.",
    },
  });

  console.log("Seed complete.");
  console.log("Demo password for all accounts: Password123!");
  console.log("Example job seeker: maria.petkova@example.com");
  console.log("Example employer: careers@kaufland.example.com");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
