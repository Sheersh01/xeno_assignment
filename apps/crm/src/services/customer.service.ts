import { prisma } from "../lib/prisma";

export async function getCustomers(query?: string) {
  return prisma.customer.findMany({
    where: query
      ? {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { email: { contains: query, mode: "insensitive" } },
            { city: { contains: query, mode: "insensitive" } },
          ],
        }
      : undefined,
    orderBy: {
      totalSpend: "desc",
    },
    take: 50, // Limit to top 50 to ensure fast response and prevent massive payloads
  });
}

export async function getCustomerById(id: string) {
  return prisma.customer.findUnique({
    where: {
      id,
    },
    include: {
      orders: true,
    },
  });
}

export async function getSegments() {
  return prisma.segment.findMany();
}