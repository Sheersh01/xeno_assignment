import { prisma } from "../lib/prisma";

export async function getCustomers() {
  return prisma.customer.findMany({
    take: 50,
    orderBy: {
      totalSpend: "desc",
    },
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