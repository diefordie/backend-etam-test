/*
  Warnings:

  - You are about to drop the column `status` on the `Transaction` table. All the data in the column will be lost.
  - Added the required column `pageName` to the `Multiplechoice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `Test` table without a default value. This is not possible if the table is not empty.
  - Added the required column `paymentStatus` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Transaction` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Type" AS ENUM ('PilihanGanda', 'Essay');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'FAILED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "WithdrawalStatus" AS ENUM ('PENDING', 'PROCESSING', 'SUCCESS', 'FAILED');

-- AlterTable
ALTER TABLE "Multiplechoice" ADD COLUMN     "pageName" TEXT NOT NULL,
ALTER COLUMN "questionPhoto" DROP NOT NULL,
ALTER COLUMN "weight" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "Test" ADD COLUMN     "type" "Type" NOT NULL;

-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "status",
ADD COLUMN     "paymentId" TEXT,
ADD COLUMN     "paymentStatus" "PaymentStatus" NOT NULL,
ADD COLUMN     "userId" TEXT NOT NULL,
ALTER COLUMN "paymentMethod" DROP NOT NULL,
ALTER COLUMN "paymentTime" DROP NOT NULL,
ALTER COLUMN "total" DROP NOT NULL;

-- DropEnum
DROP TYPE "TransactionStatus";

-- CreateTable
CREATE TABLE "Withdrawal" (
    "id" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "bankCode" TEXT NOT NULL,
    "accountNumber" TEXT NOT NULL,
    "accountName" TEXT NOT NULL,
    "status" "WithdrawalStatus" NOT NULL DEFAULT 'PENDING',
    "reference" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Withdrawal_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Withdrawal" ADD CONSTRAINT "Withdrawal_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "Author"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
