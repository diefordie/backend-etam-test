/*
  Warnings:

  - Made the column `adsBalance` on table `User` required. This step will fail if there are existing NULL values in that column.
  - Made the column `userPhoto` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "User" ALTER COLUMN "adsBalance" SET NOT NULL,
ALTER COLUMN "adsBalance" DROP DEFAULT,
ALTER COLUMN "userPhoto" SET NOT NULL,
ALTER COLUMN "userPhoto" DROP DEFAULT;
