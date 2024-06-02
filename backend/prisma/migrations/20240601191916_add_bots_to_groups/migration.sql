/*
  Warnings:

  - Added the required column `groupId` to the `Bot` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Bot` ADD COLUMN `groupId` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `Bot` ADD CONSTRAINT `Bot_groupId_fkey` FOREIGN KEY (`groupId`) REFERENCES `Group`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
