/*
  Warnings:

  - You are about to drop the column `mat_khau_ma_hoa` on the `TaiXeProfile` table. All the data in the column will be lost.
  - You are about to drop the column `so_lan_dang_nhap_sai` on the `TaiXeProfile` table. All the data in the column will be lost.
  - You are about to drop the column `trang_thai_tai_khoan` on the `TaiXeProfile` table. All the data in the column will be lost.
  - You are about to drop the column `vai_tro` on the `TaiXeProfile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `NguoiDung` MODIFY `vai_tro` ENUM('QUAN_LY', 'TAI_XE', 'KHACH_HANG') NOT NULL DEFAULT 'KHACH_HANG',
    MODIFY `so_lan_dang_nhap_sai` INTEGER NOT NULL DEFAULT 0,
    MODIFY `trang_thai_tai_khoan` ENUM('ACTIVE', 'LOCKED', 'PENDING', 'DISABLED') NOT NULL DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE `TaiXeProfile` DROP COLUMN `mat_khau_ma_hoa`,
    DROP COLUMN `so_lan_dang_nhap_sai`,
    DROP COLUMN `trang_thai_tai_khoan`,
    DROP COLUMN `vai_tro`,
    ADD COLUMN `ly_do_tu_choi` VARCHAR(191) NULL,
    ADD COLUMN `thoi_gian_duyet` DATETIME(3) NULL,
    ADD COLUMN `thoi_gian_gui_duyet` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `trang_thai_duyet` ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING';

-- CreateTable
CREATE TABLE `TaiXeGiayTo` (
    `id` CHAR(26) NOT NULL,
    `tai_xe_id` CHAR(26) NOT NULL,
    `loai` ENUM('GPLX_MAT_TRUOC', 'GPLX_MAT_SAU', 'CCCD_MAT_TRUOC', 'CCCD_MAT_SAU', 'DANG_KY_XE', 'BAO_HIEM_XE', 'CHAN_DUNG') NOT NULL,
    `file_url` VARCHAR(191) NOT NULL,
    `trang_thai` ENUM('PENDING', 'ACCEPTED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `ghi_chu` VARCHAR(191) NULL,
    `thoi_gian_tao` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `thoi_gian_cap_nhat` DATETIME(3) NOT NULL,

    UNIQUE INDEX `TaiXeGiayTo_tai_xe_id_loai_key`(`tai_xe_id`, `loai`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `TaiXeGiayTo` ADD CONSTRAINT `TaiXeGiayTo_tai_xe_id_fkey` FOREIGN KEY (`tai_xe_id`) REFERENCES `TaiXeProfile`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
