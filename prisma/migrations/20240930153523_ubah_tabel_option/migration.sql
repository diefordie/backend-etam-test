-- CreateEnum
CREATE TYPE "OptionLabel" AS ENUM ('A', 'B', 'C', 'D');

-- AlterTable
ALTER TABLE "Option" ADD COLUMN     "optionLabel" "OptionLabel";
