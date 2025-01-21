-- AlterTable
ALTER TABLE `Task` ADD COLUMN `isDeleted` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `User` ADD COLUMN `isDeleted` BOOLEAN NOT NULL DEFAULT false;
