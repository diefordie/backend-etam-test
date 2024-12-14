/*
  Warnings:

  - Added the required column `optionId` to the `Detail_result` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Test` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Detail_result" ADD COLUMN     "optionId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Test" ADD COLUMN     "userId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Test" ADD CONSTRAINT "Test_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Detail_result" ADD CONSTRAINT "Detail_result_optionId_fkey" FOREIGN KEY ("optionId") REFERENCES "Option"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
