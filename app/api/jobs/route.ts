import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { JobStatus } from '@prisma/client';
import { jobQuerySchema } from '@/lib/validation/jobs';
export async function GET(req: NextRequest){
 const parsed=jobQuerySchema.safeParse(Object.fromEntries(req.nextUrl.searchParams.entries()));
 if(!parsed.success) return NextResponse.json({error:'Invalid query'},{status:400});
 const {q,location,company,employmentType,experienceLevel,remoteType,minSalary,sort='newest',page,limit}=parsed.data;
 const where:any={status:JobStatus.ACTIVE};
 if(q) where.OR=[{title:{contains:q,mode:'insensitive'}},{description:{contains:q,mode:'insensitive'}}];
 if(location) where.location={contains:location,mode:'insensitive'};
 if(employmentType) where.employmentType=employmentType;
 if(experienceLevel) where.experienceLevel=experienceLevel;
 if(remoteType) where.remoteType=remoteType;
 if(minSalary) where.salaryMin={gte:minSalary};
 if(company) where.employer={companyProfile:{companyName:{contains:company,mode:'insensitive'}}};
 const orderBy = sort==='oldest'?[{createdAt:'asc' as const},{id:'asc' as const}]:sort==='salary_high'?[{salaryMax:'desc' as const},{createdAt:'desc' as const},{id:'desc' as const}]:sort==='salary_low'?[{salaryMin:'asc' as const},{createdAt:'desc' as const},{id:'desc' as const}]:[{createdAt:'desc' as const},{id:'desc' as const}];
 const [jobs,total]=await Promise.all([
 prisma.jobListing.findMany({where,orderBy,skip:(page-1)*limit,take:limit,include:{employer:{include:{companyProfile:true}},_count:{select:{applications:true,bookmarks:true}}}}),
 prisma.jobListing.count({where})
 ]);
 return NextResponse.json({jobs,total,page,pages:Math.ceil(total/limit)});
}
