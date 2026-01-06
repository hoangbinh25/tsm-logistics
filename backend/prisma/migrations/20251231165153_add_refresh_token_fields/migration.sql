-- AlterTable
ALTER TABLE `NguoiDung` ADD COLUMN `access_token_hash` VARCHAR(191) NULL,
    ADD COLUMN `refresh_token_hash` VARCHAR(191) NULL,
    ADD COLUMN `refresh_token_iat` DATETIME(3) NULL,
    MODIFY `mat_khau_ma_hoa` VARCHAR(191) NULL;
