/*
  Warnings:

  - A unique constraint covering the columns `[serialId]` on the table `Account` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[serialId]` on the table `Activity` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[serialId]` on the table `AuditLog` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[serialId]` on the table `Contact` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[serialId]` on the table `Delivery` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[serialId]` on the table `FieldDefinition` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[serialId]` on the table `FieldGroup` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[serialId]` on the table `Lead` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[serialId]` on the table `NumberRange` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[serialId]` on the table `Opportunity` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[serialId]` on the table `Order` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[serialId]` on the table `OrderItem` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[serialId]` on the table `OrgUnit` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[serialId]` on the table `OutboxEvent` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[serialId]` on the table `Permission` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[serialId]` on the table `ProcessDefinition` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[serialId]` on the table `ProcessState` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[serialId]` on the table `ProcessTransition` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[serialId]` on the table `Product` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[serialId]` on the table `Quote` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[serialId]` on the table `QuoteItem` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[serialId]` on the table `Role` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[serialId]` on the table `Tenant` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[serialId]` on the table `Ticket` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[serialId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Account" ADD COLUMN     "serialId" SERIAL NOT NULL;

-- AlterTable
ALTER TABLE "Activity" ADD COLUMN     "serialId" SERIAL NOT NULL;

-- AlterTable
ALTER TABLE "AuditLog" ADD COLUMN     "serialId" SERIAL NOT NULL;

-- AlterTable
ALTER TABLE "Contact" ADD COLUMN     "serialId" SERIAL NOT NULL;

-- AlterTable
ALTER TABLE "Delivery" ADD COLUMN     "serialId" SERIAL NOT NULL;

-- AlterTable
ALTER TABLE "FieldDefinition" ADD COLUMN     "serialId" SERIAL NOT NULL;

-- AlterTable
ALTER TABLE "FieldGroup" ADD COLUMN     "serialId" SERIAL NOT NULL;

-- AlterTable
ALTER TABLE "Lead" ADD COLUMN     "serialId" SERIAL NOT NULL;

-- AlterTable
ALTER TABLE "NumberRange" ADD COLUMN     "serialId" SERIAL NOT NULL;

-- AlterTable
ALTER TABLE "Opportunity" ADD COLUMN     "serialId" SERIAL NOT NULL;

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "serialId" SERIAL NOT NULL;

-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "serialId" SERIAL NOT NULL;

-- AlterTable
ALTER TABLE "OrgUnit" ADD COLUMN     "serialId" SERIAL NOT NULL;

-- AlterTable
ALTER TABLE "OutboxEvent" ADD COLUMN     "serialId" SERIAL NOT NULL;

-- AlterTable
ALTER TABLE "Permission" ADD COLUMN     "serialId" SERIAL NOT NULL;

-- AlterTable
ALTER TABLE "ProcessDefinition" ADD COLUMN     "serialId" SERIAL NOT NULL;

-- AlterTable
ALTER TABLE "ProcessState" ADD COLUMN     "serialId" SERIAL NOT NULL;

-- AlterTable
ALTER TABLE "ProcessTransition" ADD COLUMN     "serialId" SERIAL NOT NULL;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "serialId" SERIAL NOT NULL;

-- AlterTable
ALTER TABLE "Quote" ADD COLUMN     "serialId" SERIAL NOT NULL;

-- AlterTable
ALTER TABLE "QuoteItem" ADD COLUMN     "serialId" SERIAL NOT NULL;

-- AlterTable
ALTER TABLE "Role" ADD COLUMN     "serialId" SERIAL NOT NULL;

-- AlterTable
ALTER TABLE "Tenant" ADD COLUMN     "serialId" SERIAL NOT NULL;

-- AlterTable
ALTER TABLE "Ticket" ADD COLUMN     "serialId" SERIAL NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "serialId" SERIAL NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Account_serialId_key" ON "Account"("serialId");

-- CreateIndex
CREATE UNIQUE INDEX "Activity_serialId_key" ON "Activity"("serialId");

-- CreateIndex
CREATE UNIQUE INDEX "AuditLog_serialId_key" ON "AuditLog"("serialId");

-- CreateIndex
CREATE UNIQUE INDEX "Contact_serialId_key" ON "Contact"("serialId");

-- CreateIndex
CREATE UNIQUE INDEX "Delivery_serialId_key" ON "Delivery"("serialId");

-- CreateIndex
CREATE UNIQUE INDEX "FieldDefinition_serialId_key" ON "FieldDefinition"("serialId");

-- CreateIndex
CREATE UNIQUE INDEX "FieldGroup_serialId_key" ON "FieldGroup"("serialId");

-- CreateIndex
CREATE UNIQUE INDEX "Lead_serialId_key" ON "Lead"("serialId");

-- CreateIndex
CREATE UNIQUE INDEX "NumberRange_serialId_key" ON "NumberRange"("serialId");

-- CreateIndex
CREATE UNIQUE INDEX "Opportunity_serialId_key" ON "Opportunity"("serialId");

-- CreateIndex
CREATE UNIQUE INDEX "Order_serialId_key" ON "Order"("serialId");

-- CreateIndex
CREATE UNIQUE INDEX "OrderItem_serialId_key" ON "OrderItem"("serialId");

-- CreateIndex
CREATE UNIQUE INDEX "OrgUnit_serialId_key" ON "OrgUnit"("serialId");

-- CreateIndex
CREATE UNIQUE INDEX "OutboxEvent_serialId_key" ON "OutboxEvent"("serialId");

-- CreateIndex
CREATE UNIQUE INDEX "Permission_serialId_key" ON "Permission"("serialId");

-- CreateIndex
CREATE UNIQUE INDEX "ProcessDefinition_serialId_key" ON "ProcessDefinition"("serialId");

-- CreateIndex
CREATE UNIQUE INDEX "ProcessState_serialId_key" ON "ProcessState"("serialId");

-- CreateIndex
CREATE UNIQUE INDEX "ProcessTransition_serialId_key" ON "ProcessTransition"("serialId");

-- CreateIndex
CREATE UNIQUE INDEX "Product_serialId_key" ON "Product"("serialId");

-- CreateIndex
CREATE UNIQUE INDEX "Quote_serialId_key" ON "Quote"("serialId");

-- CreateIndex
CREATE UNIQUE INDEX "QuoteItem_serialId_key" ON "QuoteItem"("serialId");

-- CreateIndex
CREATE UNIQUE INDEX "Role_serialId_key" ON "Role"("serialId");

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_serialId_key" ON "Tenant"("serialId");

-- CreateIndex
CREATE UNIQUE INDEX "Ticket_serialId_key" ON "Ticket"("serialId");

-- CreateIndex
CREATE UNIQUE INDEX "User_serialId_key" ON "User"("serialId");
