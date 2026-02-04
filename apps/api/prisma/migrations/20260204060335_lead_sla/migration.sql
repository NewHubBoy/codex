-- AlterTable
ALTER TABLE "Lead" ADD COLUMN     "lastActivityAt" TIMESTAMP(3),
ADD COLUMN     "nextFollowUpAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Opportunity" ADD COLUMN     "lastStageChangedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE INDEX "Lead_firstFollowUpDueAt_idx" ON "Lead"("firstFollowUpDueAt");

-- CreateIndex
CREATE INDEX "Lead_nextFollowUpAt_idx" ON "Lead"("nextFollowUpAt");

-- CreateIndex
CREATE INDEX "Lead_lastActivityAt_idx" ON "Lead"("lastActivityAt");

-- CreateIndex
CREATE INDEX "Opportunity_lastStageChangedAt_idx" ON "Opportunity"("lastStageChangedAt");
