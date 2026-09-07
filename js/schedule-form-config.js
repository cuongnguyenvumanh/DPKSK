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

        // Helper method to create a clean complete schedule object schema
        createEmptySubScheduleObject: function(typeCode = 'TAI_VIEN') {
            const cfg = this.CONFIG[typeCode] || this.CONFIG.TAI_VIEN;

            return {
                id: 'SCH_' + Date.now(),
                scheduleId: 'SCH_' + Date.now(),
                scheduleType: typeCode,
                loaiLich: cfg.typeLabel,

                // Section 1: Thông tin lịch & Kinh doanh
                ngayDienLich: '',
                phongKinhDoanh: '',
                canBoKinhDoanhPhuTrach: '',
                tinhTrangHopDongPAKD: '',

                // Section 2: Thời gian làm việc
                ngayKham: '',
                ngayTrienKhai: '',
                caSang: false,
                caChieu: false,
                gioSang: { batDau: '', ketThuc: '' },
                gioChieu: { batDau: '', ketThuc: '' },
                gioXeXuatPhat: '',
                gioCoMat: '',
                ghiChuThoiGian: '',

                // Section 3: Loại hình công việc & Hình thức tư vấn
                loaiHinhCongViec: [],
                hinhThucTuVan: 'TRUC_TIEP',

                // Section 4: Thông tin đơn vị & Địa điểm tổ chức KSK
                tenDonVi: '',
                tinhThanh: '',
                diaDiemKham: '',
                diaDiemToChuc: [],

                // Section 5: Số lượng khám dự kiến
                soLuongDuKien: {
                    tong: 0,
                    nam: 0,
                    nu: 0
                },
                soLuongKhach: 0,

                // Section 6: Lưu ý & Dự trù bánh sữa
                luuY: '',
                duTruBanhSua: 0,

                // Section 7: Bảng dữ liệu động (Danh mục, Nhân sự, Thiết bị)
                danhMucThucHien: [],
                duKienNhanLuc: [],
                duKienTrangThietBi: [],

                // Section 8: Đề xuất xe & Giờ chuyển mẫu
                deXuatXe: {
                    coXe: false,
                    loaiXe: '',
                    soLuongXe: 0,
                    diemDon: '',
                    diemDua: '',
                    gioXuatPhat: '',
                    gioCoMat: '',
                    gioKetThuc: '',
                    ghiChu: ''
                },
                gioChuyenMau: '',

                // Section 9: Truyền thông
                truyenThong: false,

                // Status
                trangThai: 'TAO_MOI',
                status: 'Tạo mới'
            };
        }
    };

    window.ScheduleFormConfig = ScheduleFormConfig;
})(window);
