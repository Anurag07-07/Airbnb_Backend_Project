/*
  Warnings:

  - You are about to drop the column `key` on the `idempotencykey` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[idemkey]` on the table `IdempotencyKey` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `idemkey` to the `IdempotencyKey` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `IdempotencyKey_key_key` ON `idempotencykey`;

-- AlterTable
ALTER TABLE `idempotencykey` DROP COLUMN `key`,
    ADD COLUMN `idemkey` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `IdempotencyKey_idemkey_key` ON `IdempotencyKey`(`idemkey`);
