/*
  Warnings:

  - You are about to drop the column `nama` on the `Author` table. All the data in the column will be lost.
  - You are about to drop the column `optionLabel` on the `Option` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Test` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `Transaction` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[optionId,resultId]` on the table `Detail_result` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[testId,userId,attemptNumber]` on the table `Result` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `name` to the `Author` table without a default value. This is not possible if the table is not empty.
  - Added the required column `attemptNumber` to the `Result` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `status` on the `Transaction` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('unpaid', 'pending', 'success');

-- DropForeignKey
ALTER TABLE "Test" DROP CONSTRAINT "Test_userId_fkey";

-- AlterTable
ALTER TABLE "Author" DROP COLUMN "nama",
ADD COLUMN     "name" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Detail_result" ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'draft';

-- AlterTable
ALTER TABLE "Option" DROP COLUMN "optionLabel";

-- AlterTable
ALTER TABLE "Result" ADD COLUMN     "attemptNumber" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Test" DROP COLUMN "userId",
ADD COLUMN     "isPublished" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "price" DROP NOT NULL,
ALTER COLUMN "similarity" DROP NOT NULL,
ALTER COLUMN "worktime" DROP NOT NULL,
ALTER COLUMN "review" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "price",
ALTER COLUMN "paymentTime" SET DEFAULT CURRENT_TIMESTAMP,
DROP COLUMN "status",
ADD COLUMN     "status" "TransactionStatus" NOT NULL;

-- CreateTable
CREATE TABLE "RevokedToken" (
    "id" SERIAL NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "RevokedToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RevokedToken_token_key" ON "RevokedToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "Detail_result_optionId_resultId_key" ON "Detail_result"("optionId", "resultId");

-- CreateIndex
CREATE UNIQUE INDEX "Result_testId_userId_attemptNumber_key" ON "Result"("testId", "userId", "attemptNumber");

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_testId_fkey" FOREIGN KEY ("testId") REFERENCES "Test"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RevokedToken" ADD CONSTRAINT "RevokedToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
