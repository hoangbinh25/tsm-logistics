/*
  Warnings:

  - The values [ONLINE] on the enum `DonHang_hinh_thuc_thanh_toan` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the `ThanhToan` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `ThanhToan` DROP FOREIGN KEY `ThanhToan_don_hang_id_fkey`;

-- DropForeignKey
ALTER TABLE `ThanhToan` DROP FOREIGN KEY `ThanhToan_khach_hang_id_fkey`;

-- AlterTable
ALTER TABLE `DonHang` ADD COLUMN `ma_van_don_ngoai` VARCHAR(191) NULL,
    ADD COLUMN `phuong_tien_id` VARCHAR(191) NULL,
    ADD COLUMN `tai_xe_id` VARCHAR(191) NULL,
    MODIFY `trang_thai_don_hang` ENUM('TAO_MOI', 'CHO_XAC_NHAN', 'DA_PHAN_CONG', 'DANG_LAY_HANG', 'DANG_VAN_CHUYEN', 'DA_GIAO', 'GIAO_KHONG_THANH_CONG', 'DA_HUY') NOT NULL,
    MODIFY `hinh_thuc_thanh_toan` ENUM('COD') NOT NULL;

-- AlterTable
ALTER TABLE `PhuongTien` ADD COLUMN `dinh_ky_bao_duong_km` INTEGER NOT NULL DEFAULT 5000,
    ADD COLUMN `ngay_bao_duong_cuoi` DATE NULL,
    ADD COLUMN `so_km_da_di` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `vi_tri_hien_tai` VARCHAR(255) NULL;

-- DropTable
DROP TABLE `ThanhToan`;

-- CreateTable
CREATE TABLE `ThongBao` (
    `id` VARCHAR(191) NOT NULL,
    `nguoi_nhan_id` VARCHAR(191) NOT NULL,
    `tieu_de` VARCHAR(191) NOT NULL,
    `noi_dung` VARCHAR(191) NOT NULL,
    `loai_thong_bao` VARCHAR(191) NOT NULL DEFAULT 'SYSTEM',
    `da_xem` BOOLEAN NOT NULL DEFAULT false,
    `thoi_gian_tao` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SuCo` (
    `id` CHAR(26) NOT NULL,
    `tai_xe_id` CHAR(26) NOT NULL,
    `don_hang_id` CHAR(26) NULL,
    `phuong_tien_id` CHAR(26) NULL,
    `loai_su_co` ENUM('HU_HONG_XE', 'TAI_NAN', 'KET_XE', 'HANG_HOA_HU_HONG', 'SU_CO_SUC_KHOE', 'KHAC') NOT NULL,
    `mo_ta` TEXT NOT NULL,
    `vi_tri` VARCHAR(191) NULL,
    `hinh_anh` VARCHAR(191) NULL,
    `trang_thai` ENUM('MOI', 'DANG_XU_LY', 'DA_XU_LY', 'HUY') NOT NULL DEFAULT 'MOI',
    `ghi_chu_quan_ly` TEXT NULL,
    `thoi_gian_tao` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `thoi_gian_cap_nhat` DATETIME(3) NOT NULL,

    INDEX `SuCo_tai_xe_id_idx`(`tai_xe_id`),
    INDEX `SuCo_don_hang_id_idx`(`don_hang_id`),
    INDEX `SuCo_phuong_tien_id_idx`(`phuong_tien_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `DonHang` ADD CONSTRAINT `DonHang_tai_xe_id_fkey` FOREIGN KEY (`tai_xe_id`) REFERENCES `TaiXeProfile`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DonHang` ADD CONSTRAINT `DonHang_phuong_tien_id_fkey` FOREIGN KEY (`phuong_tien_id`) REFERENCES `PhuongTien`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ThongBao` ADD CONSTRAINT `ThongBao_nguoi_nhan_id_fkey` FOREIGN KEY (`nguoi_nhan_id`) REFERENCES `NguoiDung`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SuCo` ADD CONSTRAINT `SuCo_tai_xe_id_fkey` FOREIGN KEY (`tai_xe_id`) REFERENCES `TaiXeProfile`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SuCo` ADD CONSTRAINT `SuCo_don_hang_id_fkey` FOREIGN KEY (`don_hang_id`) REFERENCES `DonHang`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SuCo` ADD CONSTRAINT `SuCo_phuong_tien_id_fkey` FOREIGN KEY (`phuong_tien_id`) REFERENCES `PhuongTien`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
