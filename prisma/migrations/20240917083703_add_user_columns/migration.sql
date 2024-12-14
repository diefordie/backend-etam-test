/*
  Warnings:

  - You are about to drop the column `description` on the `Test` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Test` table. All the data in the column will be lost.
  - You are about to drop the `multiplechoice` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `authorId` to the `Test` table without a default value. This is not possible if the table is not empty.
  - Added the required column `testDescription` to the `Test` table without a default value. This is not possible if the table is not empty.
  - Added the required column `adsBalance` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userPhoto` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Test" DROP CONSTRAINT "Test_userId_fkey";

-- AlterTable
ALTER TABLE "Test" DROP COLUMN "description",
DROP COLUMN "userId",
ADD COLUMN     "authorId" TEXT NOT NULL,
ADD COLUMN     "testDescription" TEXT NOT NULL,
ALTER COLUMN "price" SET DATA TYPE DECIMAL(65,30);

-- AlterTable
ALTER TABLE "User" 
ADD COLUMN "adsBalance" DECIMAL(65,30) DEFAULT 0, 
ADD COLUMN "userPhoto" TEXT DEFAULT '';

-- DropTable
DROP TABLE "multiplechoice";

-- CreateTable
CREATE TABLE "History" (
    "id" TEXT NOT NULL,
    "testId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "History_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Author" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "handphoneNum" TEXT NOT NULL,
    "authorPhoto" TEXT NOT NULL,
    "bank" TEXT NOT NULL,
    "accountBank" TEXT NOT NULL,
    "profit" INTEGER NOT NULL,
    "isApproved" BOOLEAN NOT NULL,

    CONSTRAINT "Author_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Favourite" (
    "id" TEXT NOT NULL,
    "testId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Favourite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Multiplechoice" (
    "id" TEXT NOT NULL,
    "testId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "questionPhoto" TEXT NOT NULL,
    "weight" INTEGER NOT NULL,
    "discussion" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Multiplechoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Result" (
    "id" TEXT NOT NULL,
    "testId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,

    CONSTRAINT "Result_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Detail_result" (
    "id" TEXT NOT NULL,
    "resultId" TEXT NOT NULL,
    "userAnswer" TEXT NOT NULL,

    CONSTRAINT "Detail_result_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Option" (
    "id" TEXT NOT NULL,
    "multiplechoiceId" TEXT NOT NULL,
    "optionDescription" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,

    CONSTRAINT "Option_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "testId" TEXT NOT NULL,
    "paymentMethod" TEXT NOT NULL,
    "paymentTime" TIMESTAMP(3) NOT NULL,
    "price" INTEGER NOT NULL,
    "total" INTEGER NOT NULL,
    "status" TEXT NOT NULL,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Testimoni" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "comment" TEXT NOT NULL,

    CONSTRAINT "Testimoni_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Test" ADD CONSTRAINT "Test_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "Author"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "History" ADD CONSTRAINT "History_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "History" ADD CONSTRAINT "History_testId_fkey" FOREIGN KEY ("testId") REFERENCES "Test"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Author" ADD CONSTRAINT "Author_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favourite" ADD CONSTRAINT "Favourite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favourite" ADD CONSTRAINT "Favourite_testId_fkey" FOREIGN KEY ("testId") REFERENCES "Test"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Multiplechoice" ADD CONSTRAINT "Multiplechoice_testId_fkey" FOREIGN KEY ("testId") REFERENCES "Test"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Result" ADD CONSTRAINT "Result_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Result" ADD CONSTRAINT "Result_testId_fkey" FOREIGN KEY ("testId") REFERENCES "Test"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Detail_result" ADD CONSTRAINT "Detail_result_resultId_fkey" FOREIGN KEY ("resultId") REFERENCES "Result"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Option" ADD CONSTRAINT "Option_multiplechoiceId_fkey" FOREIGN KEY ("multiplechoiceId") REFERENCES "Multiplechoice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Testimoni" ADD CONSTRAINT "Testimoni_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
