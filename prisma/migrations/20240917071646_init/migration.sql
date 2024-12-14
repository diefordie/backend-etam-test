-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN', 'AUTHOR');

-- CreateEnum
CREATE TYPE "Category" AS ENUM ('CPNS', 'UTBK');

-- CreateTable
CREATE TABLE "USER" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "USER_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Test" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "category" "Category" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "similarity" DECIMAL(65,30) NOT NULL,
    "worktime" INTEGER NOT NULL,
    "review" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Test_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "multiplechoice" (
    "id" TEXT NOT NULL,
    "testId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "gambar" TEXT NOT NULL,
    "file" TEXT NOT NULL,
    "weight" INTEGER NOT NULL,

    CONSTRAINT "multiplechoice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "USER_email_key" ON "USER"("email");

-- AddForeignKey
ALTER TABLE "Test" ADD CONSTRAINT "Test_userId_fkey" FOREIGN KEY ("userId") REFERENCES "USER"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
