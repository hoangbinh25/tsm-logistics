/*
  Warnings:

  - You are about to drop the column `ten_dang_nhap` on the `NguoiDung` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `NguoiDung` DROP COLUMN `ten_dang_nhap`,
    MODIFY `dia_chi` VARCHAR(191) NULL;
