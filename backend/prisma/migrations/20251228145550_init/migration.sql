-- CreateTable
CREATE TABLE `NguoiDung` (
    `id` CHAR(26) NOT NULL,
    `ho_ten` VARCHAR(191) NOT NULL,
    `so_dien_thoai` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NULL,
    `dia_chi` VARCHAR(191) NOT NULL,
    `anh_dai_dien` VARCHAR(191) NULL,
    `ten_dang_nhap` VARCHAR(191) NOT NULL,
    `mat_khau_ma_hoa` VARCHAR(191) NOT NULL,
    `vai_tro` ENUM('QUAN_LY', 'TAI_XE', 'KHACH_HANG') NOT NULL,
    `so_lan_dang_nhap_sai` INTEGER NOT NULL,
    `trang_thai_tai_khoan` ENUM('ACTIVE', 'LOCKED', 'PENDING', 'DISABLED') NOT NULL,
    `thoi_gian_tao` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `thoi_gian_cap_nhat` DATETIME(3) NOT NULL,

    UNIQUE INDEX `NguoiDung_so_dien_thoai_key`(`so_dien_thoai`),
    UNIQUE INDEX `NguoiDung_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TaiXeProfile` (
    `id` CHAR(26) NOT NULL,
    `nguoi_dung_id` CHAR(26) NOT NULL,
    `so_giay_phep_lai_xe` VARCHAR(191) NOT NULL,
    `hang_bang_lai` VARCHAR(191) NOT NULL,
    `ngay_het_han_gplx` DATE NOT NULL,
    `kinh_nghiem_nam` INTEGER NOT NULL,
    `trang_thai_cong_tac` ENUM('DANG_HOAT_DONG', 'TAM_NGUNG', 'NGHI_VIEC') NOT NULL,
    `mat_khau_ma_hoa` VARCHAR(191) NOT NULL,
    `vai_tro` ENUM('QUAN_LY', 'TAI_XE', 'KHACH_HANG') NOT NULL,
    `so_lan_dang_nhap_sai` INTEGER NOT NULL,
    `trang_thai_tai_khoan` ENUM('ACTIVE', 'LOCKED', 'PENDING', 'DISABLED') NOT NULL,
    `thoi_gian_tao` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `thoi_gian_cap_nhat` DATETIME(3) NOT NULL,

    UNIQUE INDEX `TaiXeProfile_nguoi_dung_id_key`(`nguoi_dung_id`),
    UNIQUE INDEX `TaiXeProfile_so_giay_phep_lai_xe_key`(`so_giay_phep_lai_xe`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DonHang` (
    `id` CHAR(26) NOT NULL,
    `ma_don_hang` VARCHAR(191) NOT NULL,
    `khach_hang_id` CHAR(26) NOT NULL,
    `nguoi_tao_id` CHAR(26) NOT NULL,
    `kho_gui_id` CHAR(26) NOT NULL,
    `kho_nhan_id` CHAR(26) NULL,
    `dia_chi_nhan` VARCHAR(191) NOT NULL,
    `dia_chi_giao` VARCHAR(191) NOT NULL,
    `tong_khoi_luong` DECIMAL(14, 2) NOT NULL,
    `tong_tien_hang` DECIMAL(14, 2) NOT NULL,
    `phi_van_chuyen` DECIMAL(14, 2) NOT NULL,
    `giam_gia` DECIMAL(14, 2) NOT NULL,
    `tong_thanh_toan` DECIMAL(14, 2) NOT NULL,
    `trang_thai_don_hang` ENUM('TAO_MOI', 'CHO_XAC_NHAN', 'DA_PHAN_CONG', 'DANG_VAN_CHUYEN', 'DA_GIAO', 'GIAO_KHONG_THANH_CONG', 'DA_HUY') NOT NULL,
    `hinh_thuc_thanh_toan` ENUM('COD', 'ONLINE') NOT NULL,
    `thoi_gian_dat` DATETIME(3) NULL,
    `thoi_gian_du_kien_giao` DATETIME(3) NULL,
    `thoi_gian_hoan_thanh` DATETIME(3) NULL,
    `ghi_chu` VARCHAR(191) NULL,
    `thoi_gian_tao` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `thoi_gian_cap_nhat` DATETIME(3) NOT NULL,

    UNIQUE INDEX `DonHang_ma_don_hang_key`(`ma_don_hang`),
    INDEX `DonHang_khach_hang_id_idx`(`khach_hang_id`),
    INDEX `DonHang_nguoi_tao_id_idx`(`nguoi_tao_id`),
    INDEX `DonHang_kho_gui_id_idx`(`kho_gui_id`),
    INDEX `DonHang_kho_nhan_id_idx`(`kho_nhan_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ChiTietDonHang` (
    `id` CHAR(26) NOT NULL,
    `don_hang_id` CHAR(26) NOT NULL,
    `ma_dich_vu` CHAR(26) NOT NULL,
    `ten_hang_hoa` VARCHAR(191) NOT NULL,
    `mo_ta` VARCHAR(191) NOT NULL,
    `so_luong` INTEGER NOT NULL,
    `don_vi_tinh` VARCHAR(191) NOT NULL,
    `khoi_luong` DECIMAL(14, 2) NOT NULL,
    `don_gia` DECIMAL(14, 2) NOT NULL,
    `thanh_tien` DECIMAL(14, 2) NOT NULL,
    `thoi_gian_tao` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `thoi_gian_cap_nhat` DATETIME(3) NOT NULL,

    INDEX `ChiTietDonHang_don_hang_id_idx`(`don_hang_id`),
    INDEX `ChiTietDonHang_ma_dich_vu_idx`(`ma_dich_vu`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ThanhToan` (
    `id` CHAR(26) NOT NULL,
    `don_hang_id` CHAR(26) NOT NULL,
    `khach_hang_id` CHAR(26) NOT NULL,
    `so_tien` DECIMAL(14, 2) NOT NULL,
    `phuong_thuc` ENUM('COD', 'ONLINE') NOT NULL,
    `trang_thai` ENUM('PENDING', 'SUCCESS', 'FAILED', 'CANCELLED', 'REFUNDED') NOT NULL DEFAULT 'PENDING',
    `ma_giao_dich` VARCHAR(191) NULL,
    `nha_cung_cap` VARCHAR(191) NULL,
    `noi_dung_thanh_toan` VARCHAR(191) NULL,
    `thoi_gian_thanh_toan` DATETIME(3) NULL,
    `thoi_gian_tao` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `thoi_gian_cap_nhat` DATETIME(3) NOT NULL,

    UNIQUE INDEX `ThanhToan_ma_giao_dich_key`(`ma_giao_dich`),
    INDEX `ThanhToan_don_hang_id_idx`(`don_hang_id`),
    INDEX `ThanhToan_khach_hang_id_idx`(`khach_hang_id`),
    INDEX `ThanhToan_trang_thai_idx`(`trang_thai`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PhuongTien` (
    `id` CHAR(26) NOT NULL,
    `bien_kiem_soat` VARCHAR(191) NOT NULL,
    `loai_phuong_tien` VARCHAR(191) NOT NULL,
    `hang_xe` VARCHAR(191) NOT NULL,
    `model` VARCHAR(191) NOT NULL,
    `nam_san_xuat` INTEGER NOT NULL,
    `tai_trong_toi_da` DECIMAL(14, 2) NOT NULL,
    `the_tich_thung` DECIMAL(14, 2) NOT NULL,
    `trang_thai` ENUM('SAN_SANG', 'DANG_VAN_CHUYEN', 'BAO_DUONG', 'HU_HONG', 'NGUNG_HOAT_DONG') NOT NULL,
    `ngay_dang_kiem` DATE NOT NULL,
    `ngay_het_han_dang_kiem` DATE NOT NULL,
    `ghi_chu` VARCHAR(191) NULL,
    `thoi_gian_tao` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `thoi_gian_cap_nhat` DATETIME(3) NOT NULL,

    UNIQUE INDEX `PhuongTien_bien_kiem_soat_key`(`bien_kiem_soat`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `KhoHang` (
    `id` CHAR(26) NOT NULL,
    `ma_kho` VARCHAR(191) NOT NULL,
    `ten_kho` VARCHAR(191) NOT NULL,
    `dia_chi` VARCHAR(191) NOT NULL,
    `tinh_thanh` VARCHAR(191) NOT NULL,
    `quan_huyen` VARCHAR(191) NOT NULL,
    `phuong_xa` VARCHAR(191) NOT NULL,
    `loai_kho` ENUM('KHO_CHINH', 'KHO_TRUNG_CHUYEN', 'KHO_LUU_TRU') NOT NULL,
    `suc_chua_toi_da` DECIMAL(14, 2) NULL,
    `trang_thai` ENUM('HOAT_DONG', 'TAM_DUNG', 'DONG_CUA') NOT NULL,
    `ghi_chu` VARCHAR(191) NULL,
    `thoi_gian_tao` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `thoi_gian_cap_nhat` DATETIME(3) NOT NULL,

    UNIQUE INDEX `KhoHang_ma_kho_key`(`ma_kho`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DichVuVanChuyen` (
    `id` CHAR(26) NOT NULL,
    `ma_dich_vu` VARCHAR(191) NOT NULL,
    `ten_dich_vu` VARCHAR(191) NOT NULL,
    `mo_ta` VARCHAR(191) NOT NULL,
    `loai_dich_vu` ENUM('NOI_TINH', 'LIEN_TINH') NOT NULL,
    `don_vi_tinh` VARCHAR(191) NOT NULL,
    `gia_co_ban` DECIMAL(14, 2) NOT NULL,
    `chinh_sach_gia` VARCHAR(191) NOT NULL,
    `trang_thai` ENUM('HOAT_DONG', 'TAM_DUNG', 'NGUNG_CUNG_CAP') NOT NULL,
    `thoi_gian_tao` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `thoi_gian_cap_nhat` DATETIME(3) NOT NULL,

    UNIQUE INDEX `DichVuVanChuyen_ma_dich_vu_key`(`ma_dich_vu`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PhanCongDonHang` (
    `id` CHAR(26) NOT NULL,
    `don_hang_id` CHAR(26) NOT NULL,
    `tai_xe_id` CHAR(26) NOT NULL,
    `phuong_tien_id` CHAR(26) NOT NULL,
    `thoi_gian_phan_cong` DATETIME(3) NOT NULL,
    `thoi_gian_ket_thuc_du_kien` DATETIME(3) NOT NULL,
    `trang_thai_phan_cong` ENUM('MOI', 'DA_XAC_NHAN', 'DANG_THUC_HIEN', 'HOAN_THANH', 'HUY') NOT NULL,
    `ghi_chu` VARCHAR(191) NULL,
    `thoi_gian_tao` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `thoi_gian_cap_nhat` DATETIME(3) NOT NULL,

    INDEX `PhanCongDonHang_don_hang_id_idx`(`don_hang_id`),
    INDEX `PhanCongDonHang_tai_xe_id_idx`(`tai_xe_id`),
    INDEX `PhanCongDonHang_phuong_tien_id_idx`(`phuong_tien_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `TaiXeProfile` ADD CONSTRAINT `TaiXeProfile_nguoi_dung_id_fkey` FOREIGN KEY (`nguoi_dung_id`) REFERENCES `NguoiDung`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DonHang` ADD CONSTRAINT `DonHang_khach_hang_id_fkey` FOREIGN KEY (`khach_hang_id`) REFERENCES `NguoiDung`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DonHang` ADD CONSTRAINT `DonHang_nguoi_tao_id_fkey` FOREIGN KEY (`nguoi_tao_id`) REFERENCES `NguoiDung`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DonHang` ADD CONSTRAINT `DonHang_kho_gui_id_fkey` FOREIGN KEY (`kho_gui_id`) REFERENCES `KhoHang`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DonHang` ADD CONSTRAINT `DonHang_kho_nhan_id_fkey` FOREIGN KEY (`kho_nhan_id`) REFERENCES `KhoHang`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ChiTietDonHang` ADD CONSTRAINT `ChiTietDonHang_don_hang_id_fkey` FOREIGN KEY (`don_hang_id`) REFERENCES `DonHang`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ChiTietDonHang` ADD CONSTRAINT `ChiTietDonHang_ma_dich_vu_fkey` FOREIGN KEY (`ma_dich_vu`) REFERENCES `DichVuVanChuyen`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ThanhToan` ADD CONSTRAINT `ThanhToan_don_hang_id_fkey` FOREIGN KEY (`don_hang_id`) REFERENCES `DonHang`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ThanhToan` ADD CONSTRAINT `ThanhToan_khach_hang_id_fkey` FOREIGN KEY (`khach_hang_id`) REFERENCES `NguoiDung`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PhanCongDonHang` ADD CONSTRAINT `PhanCongDonHang_don_hang_id_fkey` FOREIGN KEY (`don_hang_id`) REFERENCES `DonHang`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PhanCongDonHang` ADD CONSTRAINT `PhanCongDonHang_tai_xe_id_fkey` FOREIGN KEY (`tai_xe_id`) REFERENCES `NguoiDung`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PhanCongDonHang` ADD CONSTRAINT `PhanCongDonHang_phuong_tien_id_fkey` FOREIGN KEY (`phuong_tien_id`) REFERENCES `PhuongTien`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
