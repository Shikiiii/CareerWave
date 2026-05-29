import { prisma } from "@/lib/prisma";

export function slugifyJobTitle(title: string) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .slice(0, 80) || "job";
}

export async function createUniqueJobSlug(title: string) {
  const base = slugifyJobTitle(title);
  let slug = base;
  let counter = 1;

  while (await prisma.jobListing.findUnique({ where: { slug }, select: { id: true } })) {
    counter += 1;
    slug = `${base}-${counter}`;
  }

  return slug;
}
