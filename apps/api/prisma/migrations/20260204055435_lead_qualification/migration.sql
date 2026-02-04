-- AlterTable
ALTER TABLE "Activity" ADD COLUMN     "content" TEXT,
ADD COLUMN     "nextFollowUpAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Lead" ADD COLUMN     "companyName" TEXT,
ADD COLUMN     "contactName" TEXT,
ADD COLUMN     "disqualifyNote" TEXT,
ADD COLUMN     "disqualifyReason" TEXT,
ADD COLUMN     "email" TEXT,
ADD COLUMN     "firstFollowUpDueAt" TIMESTAMP(3),
ADD COLUMN     "initialNeed" TEXT,
ADD COLUMN     "phone" TEXT;
