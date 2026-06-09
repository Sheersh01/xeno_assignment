import { prisma } from "../lib/prisma";

export async function getSegments() {
  return prisma.segment.findMany();
}

export async function createSegment(data: any) {
  return prisma.segment.create({
    data,
  });
}