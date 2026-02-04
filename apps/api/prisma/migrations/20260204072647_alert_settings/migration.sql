-- CreateEnum
CREATE TYPE "AlertSettingScope" AS ENUM ('TENANT', 'ORG_UNIT', 'USER');

-- CreateTable
CREATE TABLE "AlertSetting" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "scopeType" "AlertSettingScope" NOT NULL,
    "scopeId" TEXT NOT NULL,
    "inactiveDays" INTEGER NOT NULL DEFAULT 7,
    "staleDays" INTEGER NOT NULL DEFAULT 7,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AlertSetting_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AlertSetting_tenantId_idx" ON "AlertSetting"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "AlertSetting_tenantId_scopeType_scopeId_key" ON "AlertSetting"("tenantId", "scopeType", "scopeId");

-- AddForeignKey
ALTER TABLE "AlertSetting" ADD CONSTRAINT "AlertSetting_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
