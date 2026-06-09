-- AlterEnum
ALTER TYPE "EventType" ADD VALUE 'REPLIED';

-- AlterTable
ALTER TABLE "Campaign" ADD COLUMN     "abTestCompleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "abTestCompletedAt" TIMESTAMP(3),
ADD COLUMN     "abTestSampleSize" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "abTestStartedAt" TIMESTAMP(3),
ADD COLUMN     "aiInsight" TEXT,
ADD COLUMN     "variants" JSONB,
ADD COLUMN     "winnerIndex" INTEGER;

-- AlterTable
ALTER TABLE "Communication" ADD COLUMN     "variantIndex" INTEGER;

-- AlterTable
ALTER TABLE "Customer" ADD COLUMN     "dnd" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "dndReason" TEXT;
