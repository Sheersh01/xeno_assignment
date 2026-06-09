import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const segments = await prisma.segment.findMany();
  
  for (const segment of segments) {
    const baseQuery = segment.query ? (typeof segment.query === 'string' ? JSON.parse(segment.query) : segment.query) : {};
    
    const prismaQuery: any = { ...baseQuery, dnd: false };

    // Map dynamic relative lastOrderDays to absolute lastOrderDate for Prisma
    if (prismaQuery.lastOrderDays) {
      prismaQuery.lastOrderDate = {};
      if (prismaQuery.lastOrderDays.gt !== undefined) {
        const date = new Date();
        date.setDate(date.getDate() - prismaQuery.lastOrderDays.gt);
        prismaQuery.lastOrderDate.lt = date;
      }
      if (prismaQuery.lastOrderDays.lt !== undefined) {
        const date = new Date();
        date.setDate(date.getDate() - prismaQuery.lastOrderDays.lt);
        prismaQuery.lastOrderDate.gt = date;
      }
      delete prismaQuery.lastOrderDays;
    }

    if (prismaQuery.city && typeof prismaQuery.city === 'string') {
      prismaQuery.city = { contains: prismaQuery.city, mode: 'insensitive' };
    }

    const count = await prisma.customer.count({
      where: prismaQuery
    });

    await prisma.segment.update({
      where: { id: segment.id },
      data: { audienceSize: count }
    });
    
    console.log(`Updated segment ${segment.name} size to ${count}`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
