/**
 * MWK - SYSTEM SCHEDULE FORM CONFIGURATION & BUSINESS RULES
 * Centralized Schema & Rule Engine for Lịch tại viện, Lịch ngoại viện, and Lịch phường.
 */
(function(window) {
    const ScheduleFormConfig = {
        // Sales Departments Data Source
        SALES_DEPARTMENTS: [
            'TTKD Hà Nội',
            'TTKD Miền Bắc',
            'TTKD Miền Nam',
            'TTKD Miền Trung',
            'Phòng KSK Doanh Nghiệp 1',
            'Phòng KSK Doanh Nghiệp 2',
            'Phòng KSK Cá nhân & Trường học'
        ],

        // Sales Officers Data Source
        SALES_OFFICERS: [
            { id: 'NV0042', name: 'BS. Nguyễn Văn An (NV0042)' },
            { id: 'NV0105', name: 'Lê Hoàng Nam (NV0105)' },
            { id: 'NV0088', name: 'Trần Văn Bình (NV0088)' },
            { id: 'NV0154', name: 'Phạm Quốc Huy (NV0154)' },
            { id: 'NV0099', name: 'Trần Thị Mai (NV0099)' }
        ],

        // Contract & PAKD Status Options
        CONTRACT_PAKD_STATUSES: [
            'Đã ký hợp đồng + PAKD đã duyệt',
            'Đã ký hợp đồng + PAKD chưa duyệt',
            'Chưa ký hợp đồng',
            'PAKD đang trình ký',
            'Khác'
        ],

        // BGĐ Approval Options
        BGD_APPROVAL_OPTIONS: [
            'Chưa duyệt',
            'Đã duyệt',
            'Không yêu cầu',
            'Đang chờ duyệt'
        ],

        // Work Types
        WORK_TYPES: [
            { code: 'KHAM', label: 'Khám sức khỏe' },
            { code: 'LAY_MAU', label: 'Lấy mẫu xét nghiệm' },
            { code: 'CHUAN_BI_DO', label: 'Chuẩn bị đồ & vật tư' },
            { code: 'TU_VAN', label: 'Tư vấn sức khỏe' },
            { code: 'TRA_HO_SO', label: 'Trả hồ sơ KSK' },
            { code: 'KHAC', label: 'Khác' }
        ],

        // Master Equipment List
        EQUIPMENT_LIST: [
            'Máy siêu âm màu 4D',
            'Máy điện tâm đồ (ECG 12 chuyển đạo)',
            'Xe X-quang KTS lưu động',
            'Bộ dụng cụ khám Tai Mũi Họng',
            'Bộ dụng cụ lấy mẫu xét nghiệm',
            'Bộ khám Mắt & Đo thị lực',
            'Máy đo chức năng hô hấp'
        ],

        // Schedule Specific Configurations & Field Visibility Matrix
        CONFIG: {
            TAI_VIEN: {
                typeCode: 'TAI_VIEN',
                typeLabel: 'Lịch tại viện',
                badgeColor: 'bg-[#E8F1FB] text-[#27496D] border-[#B3CDE6]',
                headerIcon: 'fa-hospital',
                accentColor: '#27496D',
                hasXe: false,
                hasGioChuyenMau: false,
                hasBanhSua: true,
                defaultFacility: 'Medlatec Ba Đình'
            },
            NGOAI_VIEN: {
                typeCode: 'NGOAI_VIEN',
                typeLabel: 'Lịch ngoại viện',
                badgeColor: 'bg-[#FFF3E0] text-[#ED6C02] border-[#FFCC80]',
                headerIcon: 'fa-truck-medical',
                accentColor: '#ED6C02',
                hasXe: true,
                hasGioChuyenMau: true,
                hasBanhSua: true,
                defaultFacility: 'Tại trụ sở đơn vị'
            },
            LICH_PHUONG: {
                typeCode: 'LICH_PHUONG',
                typeLabel: 'Lịch phường',
                badgeColor: 'bg-[#F3E8FF] text-[#7E22CE] border-[#D8B4FE]',
                headerIcon: 'fa-building-flag',
                accentColor: '#7E22CE',
                hasXe: true,
                hasGioChuyenMau: true,
                hasBanhSua: true,
                defaultFacility: 'Trạm Y tế Phường'
            }
        },

        // Helper method to create a clean complete schedule object schema
        createEmptySubScheduleObject: function(typeCode = 'TAI_VIEN') {
            const today = new Date().toISOString().split('T')[0];
            const cfg = this.CONFIG[typeCode] || this.CONFIG.TAI_VIEN;

            return {
                id: 'SCH_' + Date.now(),
                scheduleId: 'SCH_' + Date.now(),
                scheduleType: typeCode,
                loaiLich: cfg.typeLabel,

                // Section 1: Thông tin lịch & Kinh doanh
                ngayDienLich: today,
                phongKinhDoanh: 'TTKD Hà Nội',
                canBoKinhDoanhPhuTrach: 'BS. Nguyễn Văn An (NV0042)',
                tinhTrangHopDongPAKD: 'Đã ký hợp đồng + PAKD đã duyệt',
                duyetBGD: 'Đã duyệt',

                // Section 2: Thời gian làm việc
                ngayKham: today,
                ngayTrienKhai: today,
                caSang: true,
                caChieu: false,
                gioSang: { batDau: '07:30', ketThuc: '11:00' },
                gioChieu: { batDau: '13:30', ketThuc: '17:30' },
                gioXeXuatPhat: '06:30',
                gioCoMat: '07:00',
                ghiChuThoiGian: '',

                // Section 3: Loại hình công việc & Hình thức tư vấn
                loaiHinhCongViec: ['KHAM', 'LAY_MAU'],
                hinhThucTuVan: 'TRUC_TIEP',

                // Section 4: Thông tin đơn vị & Địa điểm tổ chức KSK
                tenDonVi: 'CÔNG TY CP TẬP ĐOÀN FPT',
                tinhThanh: 'Hà Nội',
                diaDiemKham: cfg.defaultFacility,
                diaDiemToChuc: [
                    {
                        tenDiem: cfg.defaultFacility,
                        diaChi: 'Số 10 Phạm Văn Bạch, Cầu Giấy, Hà Nội',
                        gioCoMat: '07:00',
                        gioKetThuc: '17:00',
                        diemDon: 'Sảnh tòa nhà FPT',
                        diemDua: 'MEDLATEC Ba Đình',
                        ghiChu: 'Điểm khám chính'
                    }
                ],

                // Section 5: Số lượng khám dự kiến
                soLuongDuKien: {
                    tong: 100,
                    nam: 45,
                    nu: 55
                },
                soLuongKhach: 100,

                // Section 6: Lưu ý & Dự trù bánh sữa
                luuY: 'SĐT CB phụ trách: 0912345678. Bố trí luồng ưu tiên tại tầng 2.',
                duTruBanhSua: 100,

                // Section 7: Bảng dữ liệu động (Danh mục, Nhân sự, Thiết bị)
                danhMucThucHien: [
                    { stt: 1, name: 'Khám Nội tổng quát', quantity: 100, note: 'Khám lâm sàng sinh hiệu' },
                    { stt: 2, name: 'Siêu âm ổ bụng tổng quát', quantity: 100, note: 'Nhịn ăn sáng' },
                    { stt: 3, name: 'Lấy máu xét nghiệm', quantity: 100, note: 'Nhịn ăn sáng' }
                ],
                duKienNhanLuc: [
                    { stt: 1, role: 'Bác sĩ khám chính', count: 2, shift: 'Sáng', note: 'Khoa Nội' },
                    { stt: 2, role: 'Điều dưỡng lấy mẫu', count: 3, shift: 'Sáng', note: 'Kíp xét nghiệm' },
                    { stt: 3, role: 'KTV Siêu âm', count: 2, shift: 'Sáng', note: 'Phòng CĐHA' }
                ],
                duKienTrangThietBi: [
                    { stt: 1, name: 'Máy siêu âm màu 4D', quantity: 2, note: 'Kiểm tra trước ca' },
                    { stt: 2, name: 'Bộ dụng cụ lấy mẫu xét nghiệm', quantity: 100, note: 'Vật tư đóng gói sẵn' }
                ],

                // Section 8: Đề xuất xe & Giờ chuyển mẫu
                deXuatXe: {
                    coXe: cfg.hasXe,
                    loaiXe: 'Xe 16 chỗ',
                    soLuongXe: 1,
                    diemDon: 'Bệnh viện MEDLATEC Ba Đình',
                    diemDua: 'Trụ sở công ty khách hàng',
                    gioXuatPhat: '06:30',
                    gioCoMat: '07:00',
                    gioKetThuc: '17:30',
                    ghiChu: 'Chở kíp bác sĩ và thiết bị lưu động'
                },
                gioChuyenMau: '14:30',

                // Section 9: Truyền thông
                truyenThong: false,

                // Status
                trangThai: 'CHO_TONG_HOP',
                status: 'Chờ tổng hợp'
            };
        }
    };

    window.ScheduleFormConfig = ScheduleFormConfig;
})(window);
