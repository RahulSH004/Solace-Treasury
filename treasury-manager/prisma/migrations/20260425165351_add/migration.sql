/*
  Warnings:

  - Added the required column `repoOwner` to the `Team` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Team" ADD COLUMN     "repoOwner" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "Member_teamId_idx" ON "Member"("teamId");

-- CreateIndex
CREATE INDEX "Transaction_teamId_idx" ON "Transaction"("teamId");
