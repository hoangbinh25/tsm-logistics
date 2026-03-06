-- CreateTable
CREATE TABLE `KhachHangProfile` (
    `id` CHAR(26) NOT NULL,
    `nguoi_dung_id` CHAR(26) NOT NULL,
    `ma_so_thue` VARCHAR(191) NULL,
    `ten_cong_ty` VARCHAR(191) NULL,
    `han_muc_cong_no` DECIMAL(14, 2) NOT NULL DEFAULT 0,
    `du_no_hien_tai` DECIMAL(14, 2) NOT NULL DEFAULT 0,
    `thoi_gian_tao` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `thoi_gian_cap_nhat` DATETIME(3) NOT NULL,

    UNIQUE INDEX `KhachHangProfile_nguoi_dung_id_key`(`nguoi_dung_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SoDiaChi` (
    `id` CHAR(26) NOT NULL,
    `nguoi_dung_id` CHAR(26) NOT NULL,
    `ho_ten` VARCHAR(191) NOT NULL,
    `so_dien_thoai` VARCHAR(191) NOT NULL,
    `tinh_thanh` VARCHAR(191) NOT NULL,
    `quan_huyen` VARCHAR(191) NOT NULL,
    `phuong_xa` VARCHAR(191) NOT NULL,
    `dia_chi_chi_tiet` VARCHAR(191) NOT NULL,
    `is_default` BOOLEAN NOT NULL DEFAULT false,
    `thoi_gian_tao` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `thoi_gian_cap_nhat` DATETIME(3) NOT NULL,

    INDEX `SoDiaChi_nguoi_dung_id_idx`(`nguoi_dung_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ThanhToan` (
    `id` VARCHAR(191) NOT NULL,
    `don_hang_id` CHAR(26) NOT NULL,
    `so_tien` DECIMAL(14, 2) NOT NULL,
    `phuong_thuc` VARCHAR(191) NOT NULL DEFAULT 'VNPAY',
    `trang_thai` ENUM('PENDING', 'SUCCESS', 'FAILED') NOT NULL DEFAULT 'PENDING',
    `ma_giao_dich` VARCHAR(191) NULL,
    `ngan_hang` VARCHAR(191) NULL,
    `thoi_gian_tao` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `thoi_gian_cap_nhat` DATETIME(3) NOT NULL,

    INDEX `ThanhToan_don_hang_id_idx`(`don_hang_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `LichLamViec` (
    `id` CHAR(26) NOT NULL,
    `tai_xe_id` CHAR(26) NOT NULL,
    `ngay_lam_viec` DATE NOT NULL,
    `ca_lam_viec` VARCHAR(191) NULL,
    `trang_thai` VARCHAR(191) NOT NULL DEFAULT 'CHO_DUYET',
    `ghi_chu` TEXT NULL,
    `thoi_gian_tao` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `thoi_gian_cap_nhat` DATETIME(3) NOT NULL,

    INDEX `LichLamViec_tai_xe_id_idx`(`tai_xe_id`),
    UNIQUE INDEX `LichLamViec_tai_xe_id_ngay_lam_viec_key`(`tai_xe_id`, `ngay_lam_viec`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `KhachHangProfile` ADD CONSTRAINT `KhachHangProfile_nguoi_dung_id_fkey` FOREIGN KEY (`nguoi_dung_id`) REFERENCES `NguoiDung`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SoDiaChi` ADD CONSTRAINT `SoDiaChi_nguoi_dung_id_fkey` FOREIGN KEY (`nguoi_dung_id`) REFERENCES `NguoiDung`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ThanhToan` ADD CONSTRAINT `ThanhToan_don_hang_id_fkey` FOREIGN KEY (`don_hang_id`) REFERENCES `DonHang`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LichLamViec` ADD CONSTRAINT `LichLamViec_tai_xe_id_fkey` FOREIGN KEY (`tai_xe_id`) REFERENCES `TaiXeProfile`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
