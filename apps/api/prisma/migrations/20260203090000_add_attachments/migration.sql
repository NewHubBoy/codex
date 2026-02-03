-- CreateTable
CREATE TABLE "Attachment" (
    "id" TEXT NOT NULL,
    "serialId" SERIAL NOT NULL,
    "tenantId" TEXT NOT NULL,
    "orgUnitId" TEXT,
    "ownerId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "fileName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "checksumSha256" TEXT,
    "storageProvider" TEXT NOT NULL DEFAULT 'S3',
    "bucket" TEXT NOT NULL,
    "objectKey" TEXT NOT NULL,
    "url" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Attachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AttachmentLink" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "orgUnitId" TEXT,
    "ownerId" TEXT,
    "attachmentId" TEXT NOT NULL,
    "relatedType" TEXT NOT NULL,
    "relatedId" TEXT NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AttachmentLink_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Attachment_serialId_key" ON "Attachment"("serialId");

-- CreateIndex
CREATE INDEX "Attachment_tenantId_idx" ON "Attachment"("tenantId");

-- CreateIndex
CREATE INDEX "Attachment_ownerId_idx" ON "Attachment"("ownerId");

-- CreateIndex
CREATE INDEX "Attachment_orgUnitId_idx" ON "Attachment"("orgUnitId");

-- CreateIndex
CREATE INDEX "AttachmentLink_tenantId_idx" ON "AttachmentLink"("tenantId");

-- CreateIndex
CREATE INDEX "AttachmentLink_attachmentId_idx" ON "AttachmentLink"("attachmentId");

-- CreateIndex
CREATE INDEX "AttachmentLink_relatedType_relatedId_idx" ON "AttachmentLink"("relatedType", "relatedId");

-- CreateIndex
CREATE UNIQUE INDEX "AttachmentLink_attachmentId_relatedType_relatedId_key" ON "AttachmentLink"("attachmentId", "relatedType", "relatedId");

-- AddForeignKey
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttachmentLink" ADD CONSTRAINT "AttachmentLink_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttachmentLink" ADD CONSTRAINT "AttachmentLink_attachmentId_fkey" FOREIGN KEY ("attachmentId") REFERENCES "Attachment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
