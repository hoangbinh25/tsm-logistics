-- AlterTable
ALTER TABLE `ChiTietDonHang` ADD COLUMN `kich_thuoc` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `DonHang` ADD COLUMN `nguoi_thanh_toan` ENUM('NGUOI_GUI', 'NGUOI_NHAN') NOT NULL DEFAULT 'NGUOI_GUI',
    ADD COLUMN `tien_cod` DECIMAL(14, 2) NULL DEFAULT 0,
    MODIFY `hinh_thuc_thanh_toan` ENUM('COD', 'ONLINE') NOT NULL;
