/*
  Warnings:

  - The primary key for the `UserModels` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "UserModels" DROP CONSTRAINT "UserModels_pkey",
ADD CONSTRAINT "UserModels_pkey" PRIMARY KEY ("userId", "modelId");
