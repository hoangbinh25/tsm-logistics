import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { genId26 } from '../src/types/genID';

const prisma = new PrismaClient();

async function main() {
    console.log('Starting seeding...');

    await prisma.lichLamViec.deleteMany();
    await prisma.suCo.deleteMany();
    await prisma.chiTietDonHang.deleteMany();
    await prisma.phanCongDonHang.deleteMany();
    await prisma.donHang.deleteMany();
    await prisma.taiXeGiayTo.deleteMany();
    await prisma.taiXeProfile.deleteMany();
    await prisma.khachHangProfile.deleteMany();
    await prisma.soDiaChi.deleteMany();
    await prisma.thongBao.deleteMany();
    await prisma.nguoiDung.deleteMany();
    await prisma.khoHang.deleteMany();
    await prisma.phuongTien.deleteMany();
    await prisma.dichVuVanChuyen.deleteMany();

    const hashedPassword = await bcrypt.hash('Binh12345', 10);

    // 2. Tạo Admin
    const admins = [
        { id: genId26(), name: 'Quản trị viên 1', email: 'admin@tsm.com' },
        { id: genId26(), name: 'Nguyễn Quản Lý', email: 'ly.nguyen@tsm.com' },
        { id: genId26(), name: 'Trần Điều Hành', email: 'hanh.tran@tsm.com' }
    ];

    for (const admin of admins) {
        await prisma.nguoiDung.create({
            data: {
                id: admin.id,
                ho_ten: admin.name,
                email: admin.email,
                so_dien_thoai: '0123' + Math.floor(Math.random() * 1000000),
                mat_khau_ma_hoa: hashedPassword,
                vai_tro: 'QUAN_LY',
                trang_thai_tai_khoan: 'ACTIVE'
            }
        });
    }

    // 3. Tạo Tài xế mẫu (5 tài xế)
    const driverNames = ['Nguyễn Văn Tài', 'Trần Quốc Xe', 'Lê Hoàng Lái', 'Phạm Văn Đường', 'Vũ Minh xế'];
    const driverIds = [];
    for (let i = 0; i < 5; i++) {
        const uid = genId26();
        const pid = genId26();
        driverIds.push(pid);
        await prisma.nguoiDung.create({
            data: {
                id: uid,
                ho_ten: driverNames[i],
                email: `driver${i + 1}@tsm.com`,
                so_dien_thoai: `098700000${i}`,
                mat_khau_ma_hoa: hashedPassword,
                vai_tro: 'TAI_XE',
                trang_thai_tai_khoan: 'ACTIVE',
                tai_xe_profile: {
                    create: {
                        id: pid,
                        so_giay_phep_lai_xe: `GPLX00000${i}`,
                        hang_bang_lai: i % 2 === 0 ? 'C' : 'D',
                        ngay_het_han_gplx: new Date('2030-01-01'),
                        kinh_nghiem_nam: 3 + i,
                        trang_thai_cong_tac: 'DANG_HOAT_DONG',
                        trang_thai_duyet: 'APPROVED'
                    }
                }
            }
        });
    }

    // 4. Tạo Khách hàng mẫu
    const customerIds = [];
    for (let i = 0; i < 5; i++) {
        const uid = genId26();
        customerIds.push(uid);
        await prisma.nguoiDung.create({
            data: {
                id: uid,
                ho_ten: `Khách hàng ${i + 1}`,
                email: `customer${i + 1}@gmail.com`,
                so_dien_thoai: `034500000${i}`,
                mat_khau_ma_hoa: hashedPassword,
                vai_tro: 'KHACH_HANG',
                trang_thai_tai_khoan: 'ACTIVE'
            }
        });
    }

    // 5. Tạo Kho hàng mẫu (6 kho)
    const khoData = [
        { ma: 'KHO-HN-01', ten: 'Kho Tổng Miền Bắc', tinh: 'Hà Nội', dc: '123 Giải Phóng' },
        { ma: 'KHO-BN-01', ten: 'Kho Vsip Bắc Ninh', tinh: 'Bắc Ninh', dc: 'KCN Vsip' },
        { ma: 'KHO-DN-01', ten: 'Kho Trung Chuyển Đà Nẵng', tinh: 'Đà Nẵng', dc: 'Liên Chiểu' },
        { ma: 'KHO-HCM-01', ten: 'Kho Tổng Miền Nam', tinh: 'TP.HCM', dc: 'Quận 12' },
        { ma: 'KHO-CT-01', ten: 'Kho Cần Thơ', tinh: 'Cần Thơ', dc: 'Cái Răng' },
        { ma: 'KHO-HP-01', ten: 'Kho Hải Phòng', tinh: 'Hải Phòng', dc: 'Lê Chân' }
    ];
    const khoIds = [];
    for (const k of khoData) {
        const id = genId26();
        khoIds.push(id);
        await prisma.khoHang.create({
            data: {
                id,
                ma_kho: k.ma,
                ten_kho: k.ten,
                dia_chi: k.dc,
                tinh_thanh: k.tinh,
                quan_huyen: k.tinh,
                phuong_xa: 'P. Trung Tâm',
                loai_kho: 'KHO_CHINH',
                trang_thai: 'HOAT_DONG'
            }
        });
    }

    // 6. Tạo Dịch vụ vận chuyển
    const dvIds = [];
    const dvData = [
        { ma: 'DV-NORMAL', ten: 'Giao hàng tiêu chuẩn', gia: 15000 },
        { ma: 'DV-EXPRESS', ten: 'Giao hàng hỏa tốc', gia: 35000 },
        { ma: 'DV-ECONOMY', ten: 'Giao hàng tiết kiệm', gia: 10000 },
        { ma: 'DV-COOL', ten: 'Vận chuyển hàng lạnh', gia: 50000 }
    ];
    for (const d of dvData) {
        const id = genId26();
        dvIds.push(id);
        await prisma.dichVuVanChuyen.create({
            data: {
                id,
                ma_dich_vu: d.ma,
                ten_dich_vu: d.ten,
                mo_ta: `Dịch vụ ${d.ten} chất lượng cao`,
                loai_dich_vu: 'LIEN_TINH',
                don_vi_tinh: 'KG',
                gia_co_ban: d.gia,
                chinh_sach_gia: 'Theo cân nặng và khoảng cách',
                trang_thai: 'HOAT_DONG'
            }
        });
    }

    // 7. Tạo Phương tiện mẫu (6 xe)
    const vehicleIds = [];
    const vehicleModels = [
        { bien: '29C-111.11', hang: 'Hino', model: '300', tai: 1500 },
        { bien: '29C-222.22', hang: 'Isuzu', model: 'QKR', tai: 2500 },
        { bien: '51D-333.33', hang: 'Thaco', model: 'Ollin', tai: 3500 },
        { bien: '43A-444.44', hang: 'Hyundai', model: 'Mighty', tai: 5000 },
        { bien: '65C-555.55', hang: 'Suzuki', model: 'Carry', tai: 500 },
        { bien: '15C-666.66', hang: 'Dongfeng', model: 'B180', tai: 8000 }
    ];
    for (const v of vehicleModels) {
        const id = genId26();
        vehicleIds.push(id);
        await prisma.phuongTien.create({
            data: {
                id,
                bien_kiem_soat: v.bien,
                loai_phuong_tien: 'Xe tải',
                hang_xe: v.hang,
                model: v.model,
                nam_san_xuat: 2021,
                tai_trong_toi_da: v.tai,
                the_tich_thung: v.tai / 200,
                trang_thai: 'SAN_SANG',
                ngay_dang_kiem: new Date('2024-01-01'),
                ngay_het_han_dang_kiem: new Date('2025-01-01'),
                so_km_da_di: 5000 + Math.floor(Math.random() * 10000),
                dinh_ky_bao_duong_km: 5000
            }
        });
    }

    // 8. Tạo Đơn hàng mẫu (10 đơn)
    for (let i = 0; i < 10; i++) {
        const orderId = genId26();
        const khoGui = khoIds[i % khoIds.length];
        const status: any = ['TAO_MOI', 'DA_PHAN_CONG', 'DANG_VAN_CHUYEN', 'DA_GIAO'][i % 4];

        await prisma.donHang.create({
            data: {
                id: orderId,
                ma_don_hang: `ORD-${2026}${i.toString().padStart(4, '0')}`,
                khach_hang_id: customerIds[i % customerIds.length],
                nguoi_tao_id: admins[0].id,
                kho_gui_id: khoGui,
                dia_chi_nhan: `Số ${i + 1} Đường Lê Duẩn, Quận ${i + 1}, TP.HCM`,
                dia_chi_giao: `Số ${i + 5} Đường Cách Mạng Tháng 8, Quận ${i + 1}, Đà Nẵng`,
                tong_khoi_luong: 10 + i,
                tong_tien_hang: 500000 + i * 100000,
                phi_van_chuyen: 50000,
                giam_gia: 0,
                tong_thanh_toan: 550000 + i * 100000,
                trang_thai_don_hang: status,
                hinh_thuc_thanh_toan: 'COD',
                tai_xe_id: status !== 'TAO_MOI' ? driverIds[i % driverIds.length] : null,
                phuong_tien_id: status !== 'TAO_MOI' ? vehicleIds[i % vehicleIds.length] : null,
                thoi_gian_tao: new Date()
            }
        });
    }

    console.log('Seeding completed successfully!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
