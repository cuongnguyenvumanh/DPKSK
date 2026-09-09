/**
 * MWK - SYSTEM DATA STORE (SINGLE SOURCE OF TRUTH)
 * Centralized Data Management for Categories, Facilities, Staff Quotas, Allowances, and Reports.
 */
(function(window) {
    const STORAGE_KEYS = {
        CATEGORIES: 'mwk_categories_master_data',
        FACILITIES: 'mwk_facilities_master_data_v2',
        ALLOWANCE: 'mwk_allowance_data',
        REPORT_DOAN_KHAM: 'mwk_report_doan_kham_data',
        REPORT_NHAN_SU: 'mwk_report_nhan_su_data',
        KSK_SCHEDULE: 'mwk_ksk_schedule_clean_real_v5',
        WEEKLY_SCHEDULES: 'mwk_weekly_schedules_v1',
        APPROVAL_SCHEDULES: 'mwk_approval_schedules_v1',
        CONFIG_DINH_MUC: 'mwk_config_dinh_muc_data_v2',
        MATRIX_DINH_MUC_TAI_VIEN: 'mwk_matrix_dinh_muc_tai_vien_v2',
        MATRIX_DINH_MUC_KIEM_NHIEM: 'mwk_matrix_dinh_muc_kiem_nhiem_v1',
        MATRIX_DINH_MUC_DIEU_PHOI_BKH: 'mwk_matrix_dinh_muc_dieu_phoi_bkh_v1',
        MATRIX_DINH_MUC_CHUYEN_KHOA: 'mwk_matrix_dinh_muc_chuyen_khoa_v1',
        MATRIX_DINH_MUC_NGOAI_VIEN: 'mwk_matrix_dinh_muc_ngoai_vien_v1'
    };

    // Auto-purge all legacy mock schedule keys from localStorage
    (function purgeLegacyMockStorage() {
        try {
            const currentCleanKey = STORAGE_KEYS.KSK_SCHEDULE;
            for (let i = localStorage.length - 1; i >= 0; i--) {
                const key = localStorage.key(i);
                if (key && key.includes('ksk_schedule') && key !== currentCleanKey) {
                    localStorage.removeItem(key);
                }
            }
        } catch (e) {}
    })();

    // Default Initial Master Data for Categories (Danh mục khám)
    const DEFAULT_CATEGORIES = [
        { id: 1, name: 'Siêu âm ổ bụng tổng quát', locations: ['Ba Đình', 'Cầu Giấy', 'Ngoại viện'], notes: 'Yêu cầu nhịn ăn 6-8h, uống nhiều nước căng bàng quang', status: true },
        { id: 2, name: 'Khám Nội tổng quát', locations: ['Ba Đình', 'Tây Hồ', 'Thanh Xuân', 'Vĩnh Phúc'], notes: 'Khám lâm sàng đo sinh hiệu, tim phổi, tiêu hóa', status: true },
        { id: 3, name: 'Điện tâm đồ (ECG 12 chuyển đạo)', locations: ['Cầu Giấy', 'Tại viện'], notes: 'Đánh giá nhịp tim và các rối loạn dẫn truyền cơ tim', status: true },
        { id: 4, name: 'Lấy máu xét nghiệm', locations: ['Ba Đình', 'Cầu Giấy', 'Ngoại viện', 'Tại viện', 'Thanh Xuân', 'Tây Hồ', 'Vĩnh Phúc', 'Bắc Ninh', 'Nghệ An'], notes: 'Nhịn ăn sáng tối thiểu 8-10 tiếng trước khi lấy mẫu', status: true },
        { id: 5, name: 'Chụp X-quang Ngực thẳng KTS', locations: ['Ba Đình', 'Cầu Giấy', 'Tại viện'], notes: 'Thực hiện tại phòng CĐHA, chống chỉ định phụ nữ có thai', status: false },
        { id: 6, name: 'Khám Mắt & Đo thị lực', locations: ['Ba Đình', 'Cầu Giấy', 'Thanh Xuân', 'Tây Hồ'], notes: 'Kiểm tra thị lực không kính, có kính và khả năng nhận biết sắc giác', status: true },
        { id: 7, name: 'Khám Tai Mũi Họng', locations: ['Ba Đình', 'Cầu Giấy', 'Vĩnh Phúc', 'Bắc Ninh'], notes: 'Nội soi tai mũi họng tầm soát bệnh lý đường hô hấp trên', status: true },
        { id: 8, name: 'Xét nghiệm Đường huyết (Glucose)', locations: ['Ba Đình', 'Cầu Giấy', 'Ngoại viện', 'Tại viện'], notes: 'Đánh giá chỉ số đường huyết tĩnh mạch lúc đói', status: false },
        { id: 9, name: 'Khám Răng Hàm Mặt', locations: ['Ba Đình', 'Cầu Giấy', 'Thanh Xuân'], notes: 'Kiểm tra cao răng, sâu răng và tổn thương niêm mạc miệng', status: true },
        { id: 10, name: 'Khám Sản phụ khoa', locations: ['Ba Đình', 'Cầu Giấy', 'Tại viện'], notes: 'Khám tầm soát và thực hiện soi cổ tử cung dành cho nữ', status: true },
        { id: 11, name: 'Đo Mật độ xương (DEXA 2 vị trí)', locations: ['Ba Đình', 'Cầu Giấy', 'Tại viện'], notes: 'Tầm soát loãng xương toàn thân bằng phương pháp DEXA', status: true },
        { id: 12, name: 'Nội soi Dạ dày - Đại tràng', locations: ['Ba Đình', 'Cầu Giấy'], notes: 'Nội soi tiêu hóa không đau có gây mê ngắn', status: false },
        { id: 13, name: 'Siêu âm Tuyến giáp & Vú', locations: ['Ba Đình', 'Cầu Giấy', 'Ngoại viện', 'Tây Hồ'], notes: 'Tầm soát u cục và tổn thương tuyến giáp, tuyến vú', status: true },
        { id: 14, name: 'Đo Chức năng hô hấp (Khí phế cầu)', locations: ['Ba Đình', 'Thanh Xuân'], notes: 'Đánh giá thông khí phổi và các rối loạn hô hấp', status: true },
        { id: 15, name: 'Xét nghiệm Tầm soát Ung thư (Marker ung thư)', locations: ['Ba Đình', 'Cầu Giấy', 'Ngoại viện', 'Tại viện', 'Bắc Ninh', 'Nghệ An'], notes: 'Định lượng các dấu ấn sinh học ung thư trong máu', status: true }
    ];

    // Default Initial Master Data for Facilities (Cơ sở khám / Vị trí)
    const DEFAULT_FACILITIES = [
        { id: 1, name: 'Ba Đình', addr: '123 Đội Cấn', note: 'Cạnh tòa ABC', status: true },
        { id: 2, name: 'Cầu Giấy', addr: '99 Cầu Giấy', note: 'Cạnh tòa BCA', status: true },
        { id: 3, name: 'Ngoại viện', addr: 'Khám lưu động', note: '', status: true },
        { id: 4, name: 'Cà Mau', addr: '123 Cà Mau', note: 'cạnh tòa NMM', status: false },
        { id: 5, name: 'Tại viện', addr: 'Khám tại bệnh viện MEDLATEC', note: 'Tất cả các khoa', status: true },
        { id: 6, name: 'Thanh Xuân', addr: '03 Khuất Duy Tiến, Thanh Xuân', note: 'Phòng khám Đa khoa', status: true },
        { id: 7, name: 'Tây Hồ', addr: '99 Trích Sài, Tây Hồ', note: 'Trung tâm xét nghiệm', status: true },
        { id: 8, name: 'Vĩnh Phúc', addr: '119 Nguyễn Tất Thành, Vĩnh Yên', note: 'Chi nhánh Vĩnh Phúc', status: true },
        { id: 9, name: 'Quảng Bình', addr: '28 Lý Thường Kiệt, Đồng Hới', note: 'Chi nhánh Quảng Bình', status: true },
        { id: 10, name: 'Bắc Ninh', addr: '233 Nguyễn Trãi, Bắc Ninh', note: 'Chi nhánh Bắc Ninh', status: true },
        { id: 11, name: 'Nghệ An', addr: 'Đại lộ V.I. Lê Nin, Vinh', note: 'Chi nhánh Nghệ An', status: true }
    ];

    // Default Initial Data for Staff Quota (Định mức nhân sự)
    const DEFAULT_STAFF_QUOTA = [
        { id: 1, category: 'Khám Nội tổng quát', deployForm: 'Tại viện', position: 'Bác sĩ', maxStaff: 2, note: '' },
        { id: 2, category: 'Khám Nội tổng quát', deployForm: 'Ngoại viện', position: 'Bác sĩ', maxStaff: 3, note: 'Khám đoàn lưu động' },
        { id: 3, category: 'Khám Nội tổng quát', deployForm: 'Tại viện', position: 'Điều dưỡng', maxStaff: 1, note: '' },
        { id: 4, category: 'Siêu âm ổ bụng tổng quát', deployForm: 'Ngoại viện', position: 'Kỹ thuật viên', maxStaff: 2, note: '' },
        { id: 5, category: 'Lấy máu xét nghiệm', deployForm: 'Ngoại viện', position: 'Điều dưỡng', maxStaff: 3, note: 'Áp dụng cho đoàn khám lớn' },
        { id: 6, category: 'Khám Mắt & Đo thị lực', deployForm: 'Tại viện', position: 'Bác sĩ', maxStaff: 1, note: 'Đo thị lực & soi đáy mắt' },
        { id: 7, category: 'Khám Tai Mũi Họng', deployForm: 'Ngoại viện', position: 'Bác sĩ', maxStaff: 1, note: 'Khám nội soi TMH' },
        { id: 8, category: 'Khám Răng Hàm Mặt', deployForm: 'Tại viện', position: 'Bác sĩ', maxStaff: 1, note: 'Khám nha khoa' },
        { id: 9, category: 'Điện tâm đồ (ECG 12 chuyển đạo)', deployForm: 'Ngoại viện', position: 'Kỹ thuật viên', maxStaff: 2, note: 'Ghi điện tim ca sáng' },
        { id: 10, category: 'Khám Sản phụ khoa', deployForm: 'Tại viện', position: 'Bác sĩ', maxStaff: 2, note: 'Dành riêng cho nhân sự nữ' },
        { id: 11, category: 'Khám Sản phụ khoa', deployForm: 'Ngoại viện', position: 'Điều dưỡng', maxStaff: 1, note: 'Hỗ trợ khám nữ' },
        { id: 12, category: 'Siêu âm Tuyến giáp & Vú', deployForm: 'Tại viện', position: 'Kỹ thuật viên', maxStaff: 2, note: 'Tầm soát u cục' },
        { id: 13, category: 'Đo Chức năng hô hấp (Khí phế cầu)', deployForm: 'Ngoại viện', position: 'Kỹ thuật viên', maxStaff: 1, note: 'Đo phế dung' }
    ];

    // Default Initial Data for Allowances (Cấu hình phụ cấp)
    const DEFAULT_ALLOWANCE = [
        { id: 1, type: 'Đến sớm', object: 'CTV', unit: 'Tiền/giờ', value: '100,000 đ', rawValue: 100000, note: 'Check-in sớm hơn kế hoạch' },
        { id: 2, type: 'Về muộn', object: 'CBNV', unit: 'Tiền/giờ', value: '120,000 đ', rawValue: 120000, note: 'Check-out muộn hơn kế hoạch' },
        { id: 3, type: 'Đến sớm', object: 'CBNV', unit: '% lương', value: '10 %', rawValue: 10, note: 'Tính theo phần trăm lương giờ' },
        { id: 4, type: 'Về muộn', object: 'CTV', unit: 'Tiền/giờ', value: '150,000 đ', rawValue: 150000, note: 'Ca làm việc kíp đêm muộn' }
    ];

    // Default Initial Reports for Báo cáo đoàn khám (Module 1)
    const DEFAULT_DOAN_KHAM_REPORTS = [
        { id: 1, code: 'DK-2026-001', name: 'Khám SK Định kỳ Tập đoàn Viettel 2026', date: '2026-08-15', location: 'Ba Đình', customerType: 'Doanh nghiệp', scheduleType: 'Lịch tuần', status: 'Đang thực hiện' },
        { id: 2, code: 'DK-2026-002', name: 'Khám Tầm soát Bệnh viện Bưu Điện', date: '2026-08-14', location: 'Cầu Giấy', customerType: 'Cơ quan nhà nước', scheduleType: 'Lịch tuần', status: 'Hoàn thành' },
        { id: 3, code: 'DK-2026-003', name: 'Khám Lưu động Công ty Samsung Thái Nguyên', date: '2026-08-12', location: 'Ngoại viện', customerType: 'Doanh nghiệp', scheduleType: 'Lịch phát sinh', status: 'Đang thực hiện' },
        { id: 4, code: 'DK-2026-004', name: 'Khám SK Học sinh Trường THPT Chuyên KHTN', date: '2026-08-10', location: 'Thanh Xuân', customerType: 'Trường học', scheduleType: 'Lịch tuần', status: 'Hoàn thành' },
        { id: 5, code: 'DK-2026-005', name: 'Khám SK Cán bộ Ngân hàng Vietcombank', date: '2026-08-08', location: 'Tây Hồ', customerType: 'Doanh nghiệp', scheduleType: 'Lịch tuần', status: 'Hoàn thành' },
        { id: 6, code: 'DK-2026-006', name: 'Khám Chuyên sâu Đoàn Ngoại giao VP Chính phủ', date: '2026-08-05', location: 'Tại viện', customerType: 'Cơ quan nhà nước', scheduleType: 'Lịch phát sinh', status: 'Đã hủy' },
        { id: 7, code: 'DK-2026-007', name: 'Khám SK Định kỳ Công ty Honda Việt Nam', date: '2026-08-02', location: 'Vĩnh Phúc', customerType: 'Doanh nghiệp', scheduleType: 'Lịch phát sinh', status: 'Hoàn thành' },
        { id: 8, code: 'DK-2026-008', name: 'Khám SK Cán bộ Tập đoàn Vingroup', date: '2026-07-28', location: 'Ba Đình', customerType: 'Doanh nghiệp', scheduleType: 'Lịch tuần', status: 'Hoàn thành' },
        { id: 9, code: 'DK-2026-009', name: 'Khám SK Tổng quát Trường ĐH Bách Khoa', date: '2026-07-25', location: 'Cầu Giấy', customerType: 'Trường học', scheduleType: 'Lịch phát sinh', status: 'Chờ xác nhận' },
        { id: 10, code: 'DK-2026-010', name: 'Khám SK Đoàn làm phim VTV', date: '2026-07-20', location: 'Ngoại viện', customerType: 'Doanh nghiệp', scheduleType: 'Lịch phát sinh', status: 'Hoàn thành' },
        { id: 11, code: 'DK-2026-011', name: 'Khám Tầm soát Ung thư Chi nhánh Bắc Ninh', date: '2026-07-15', location: 'Bắc Ninh', customerType: 'Cá nhân / Khác', scheduleType: 'Lịch phát sinh', status: 'Đã hủy' },
        { id: 12, code: 'DK-2026-012', name: 'Khám SK Cán bộ Sở Y tế Nghệ An', date: '2026-07-10', location: 'Nghệ An', customerType: 'Cơ quan nhà nước', scheduleType: 'Lịch tuần', status: 'Hoàn thành' }
    ];

    // Default Initial Reports for Báo cáo nhân sự (Module 2)
    const DEFAULT_NHAN_SU_REPORTS = [
        { id: 1, name: 'BS. Nguyễn Văn An', staffType: 'Bác sĩ', specialty: 'Nội khoa', degree: 'Chuyên khoa II', position: 'Bác sĩ khám chính', facility: 'Ba Đình', trips: 28, isCBNV: true },
        { id: 2, name: 'ĐD. Trần Thị Bích', staffType: 'Điều dưỡng', specialty: 'Nội khoa', degree: 'Cử nhân', position: 'Trưởng kíp điều dưỡng', facility: 'Ba Đình', trips: 24, isCBNV: true },
        { id: 3, name: 'BS. Lê Hoàng Cường', staffType: 'Bác sĩ', specialty: 'CĐHA & Siêu âm', degree: 'Thạc sĩ', position: 'Bác sĩ siêu âm', facility: 'Cầu Giấy', trips: 22, isCBNV: true },
        { id: 4, name: 'KTV. Phạm Quốc Dũng', staffType: 'Kỹ thuật viên', specialty: 'Xét nghiệm', degree: 'Cử nhân', position: 'Lấy máu xét nghiệm', facility: 'Cầu Giấy', trips: 19, isCBNV: false },
        { id: 5, name: 'BS. Võ Thị Minh Em', staffType: 'Bác sĩ', specialty: 'Sản phụ khoa', degree: 'Chuyên khoa I', position: 'Bác sĩ phụ khoa', facility: 'Tại viện', trips: 18, isCBNV: true },
        { id: 6, name: 'ĐD. Hoàng Văn Giang', staffType: 'Điều dưỡng', specialty: 'Ngoại khoa', degree: 'Cao đẳng', position: 'Đo sinh hiệu & Thể lực', facility: 'Thanh Xuân', trips: 17, isCBNV: false },
        { id: 7, name: 'BS. Đỗ Mỹ Hạnh', staffType: 'Bác sĩ', specialty: 'Mắt', degree: 'Chuyên khoa I', position: 'Bác sĩ khám Mắt', facility: 'Tây Hồ', trips: 16, isCBNV: true },
        { id: 8, name: 'KTV. Ngô Tấn Khoa', staffType: 'Kỹ thuật viên', specialty: 'CĐHA & Siêu âm', degree: 'Cử nhân', position: 'Chụp X-Quang', facility: 'Vĩnh Phúc', trips: 15, isCBNV: false },
        { id: 9, name: 'BS. Bùi Anh Tuấn', staffType: 'Bác sĩ', specialty: 'Tai Mũi Họng', degree: 'Tiến sĩ', position: 'Bác sĩ khám TMH', facility: 'Bắc Ninh', trips: 14, isCBNV: true },
        { id: 10, name: 'HL. Vũ Thị Lan', staffType: 'Hộ lý', specialty: 'Khác', degree: 'Trung cấp', position: 'Hỗ trợ luồng khám', facility: 'Nghệ An', trips: 12, isCBNV: false }
    ];

    // Default Initial Data for Lịch KSK (KSK Schedules) - Seed Data for Interconnected Flow Demo
    const DEFAULT_KSK_SCHEDULE = [
        {
            id: 1,
            code: 'LK-2026-001',
            maLich: 'LK-2026-001',
            teamName: 'Công ty CP Tập đoàn FPT',
            customerName: 'Công ty CP Tập đoàn FPT',
            contactPerson: 'Nguyễn Vũ Mạnh Cường',
            contactPhone: '0912345678',
            contactEmail: 'cuongnvm@fpt.com.vn',
            customerType: 'Doanh nghiệp',
            examDate: '2026-08-24',
            session: 'Sáng',
            startTime: '07:30',
            endTime: '11:00',
            loaiLich: 'Lịch tại viện',
            scheduleForm: 'Lịch tuần',
            facility: 'Ba Đình',
            examLocation: '42-44 Nghĩa Dũng, Phúc Xá, Ba Đình, Hà Nội',
            soLuong: 450,
            estimatedCount: 450,
            tongNhanSu: 26,
            personInCharge: 'Nguyễn Văn An',
            status: 'Chờ tổng hợp',
            trangThai: 'CHO_TONG_HOP',
            daGuiTongHop: true,
            ngayGuiTongHop: '2026-08-20T08:30:00.000Z',
            pakdStatus: 'Đã có PAKD',
            generalNote: 'Đoàn khám định kỳ hàng năm cho 450 cán bộ nhân viên FPT Software.',
            requestNote: 'Bố trí lối đi ưu tiên và tiếp đón riêng tại Tầng 2.',
            step2Data: {
                taiVien: [
                    {
                        id: 'SCH001',
                        scheduleId: 'SCH001',
                        maLich: 'SCH001',
                        ngayKham: '2026-09-08',
                        session: 'Sáng',
                        startTime: '07:30',
                        endTime: '11:30',
                        soLuongKhach: 100,
                        tongNhanSu: 12,
                        facility: 'Medlatec Ba Đình',
                        diaDiemKham: '42-44 Nghĩa Dũng, Ba Đình',
                        trangThai: 'TAO_MOI',
                        status: 'Tạo mới'
                    },
                    {
                        id: 'SCH002',
                        scheduleId: 'SCH002',
                        maLich: 'SCH002',
                        ngayKham: '2026-09-09',
                        session: 'Sáng',
                        startTime: '07:30',
                        endTime: '11:30',
                        soLuongKhach: 80,
                        tongNhanSu: 10,
                        facility: 'Medlatec Ba Đình',
                        diaDiemKham: '42-44 Nghĩa Dũng, Ba Đình',
                        trangThai: 'CHO_TONG_HOP',
                        status: 'Chờ tổng hợp'
                    },
                    {
                        id: 'SCH003',
                        scheduleId: 'SCH003',
                        maLich: 'SCH003',
                        ngayKham: '2026-09-10',
                        session: 'Chiều',
                        startTime: '13:30',
                        endTime: '17:00',
                        soLuongKhach: 120,
                        tongNhanSu: 14,
                        facility: 'Medlatec Ba Đình',
                        diaDiemKham: '42-44 Nghĩa Dũng, Ba Đình',
                        trangThai: 'DA_TONG_HOP',
                        status: 'Đã tổng hợp'
                    }
                ],
                ngoaiVien: [
                    {
                        id: 'SCH004',
                        scheduleId: 'SCH004',
                        maLich: 'SCH004',
                        ngayKham: '2026-09-11',
                        session: 'Sáng',
                        startTime: '08:00',
                        endTime: '11:30',
                        soLuongKhach: 150,
                        tongNhanSu: 16,
                        facility: 'Ngoại viện',
                        diaDiemKham: 'Tòa nhà FPT Cầu Giấy',
                        trangThai: 'CHO_DUYET',
                        status: 'Chờ duyệt'
                    },
                    {
                        id: 'SCH005',
                        scheduleId: 'SCH005',
                        maLich: 'SCH005',
                        ngayKham: '2026-09-12',
                        session: 'Chiều',
                        startTime: '13:30',
                        endTime: '17:00',
                        soLuongKhach: 200,
                        tongNhanSu: 18,
                        facility: 'Ngoại viện',
                        diaDiemKham: 'Tòa nhà FPT Cầu Giấy',
                        trangThai: 'DA_DUYET',
                        status: 'Đã duyệt'
                    },
                    {
                        id: 'SCH006',
                        scheduleId: 'SCH006',
                        maLich: 'SCH006',
                        ngayKham: '2026-09-13',
                        session: 'Sáng',
                        startTime: '07:30',
                        endTime: '11:30',
                        soLuongKhach: 90,
                        tongNhanSu: 10,
                        facility: 'Ngoại viện',
                        diaDiemKham: 'Tòa nhà FPT Cầu Giấy',
                        trangThai: 'CHO_DIEU_PHOI',
                        status: 'Chờ điều phối'
                    }
                ],
                lichPhuong: [
                    {
                        id: 'SCH007',
                        scheduleId: 'SCH007',
                        maLich: 'SCH007',
                        ngayKham: '2026-09-14',
                        session: 'Chiều',
                        startTime: '13:30',
                        endTime: '17:00',
                        soLuongKhach: 180,
                        tongNhanSu: 15,
                        facility: 'Trạm Y tế Phúc Xá',
                        diaDiemKham: 'Trạm Y tế Phường Phúc Xá',
                        trangThai: 'DA_DIEU_PHOI',
                        status: 'Đã điều phối'
                    },
                    {
                        id: 'SCH008',
                        scheduleId: 'SCH008',
                        maLich: 'SCH008',
                        ngayKham: '2026-09-15',
                        session: 'Sáng',
                        startTime: '08:00',
                        endTime: '11:30',
                        soLuongKhach: 250,
                        tongNhanSu: 22,
                        facility: 'Trạm Y tế Phúc Xá',
                        diaDiemKham: 'Trạm Y tế Phường Phúc Xá',
                        trangThai: 'HOAN_THANH',
                        status: 'Hoàn thành'
                    }
                ]
            },
            categories: ['Khám Nội tổng quát', 'Siêu âm ổ bụng tổng quát', 'Lấy máu xét nghiệm', 'Khám Mắt & Đo thị lực', 'Khám Tai Mũi Họng'],
            locations: ['Tầng 1 - Tiếp đón & Khám Nội', 'Tầng 2 - Phòng Siêu âm 01 & 02', 'Tầng 3 - Phòng Xét nghiệm'],
            staff: [
                { id: 1, name: 'BS. Nguyễn Văn An', role: 'Bác sĩ khám chính', count: 2, shift: 'Sáng' },
                { id: 2, name: 'ĐD. Trần Thị Bích', role: 'Điều dưỡng lấy mẫu', count: 4, shift: 'Sáng' },
                { id: 3, name: 'KTV. Lê Hoàng Cường', role: 'KTV Siêu âm', count: 2, shift: 'Sáng' }
            ]
        },
        {
            id: 2,
            code: 'LK-2026-002',
            maLich: 'LK-2026-002',
            teamName: 'Ngân hàng VPBank - Chi nhánh Đông Đô',
            customerName: 'Ngân hàng VPBank - Chi nhánh Đông Đô',
            contactPerson: 'Trần Thị Mai',
            contactPhone: '0987654321',
            contactEmail: 'maitt@vpbank.com.vn',
            customerType: 'Doanh nghiệp',
            examDate: '2026-08-25',
            session: 'Chiều',
            startTime: '13:30',
            endTime: '17:00',
            loaiLich: 'Lịch ngoại viện',
            scheduleForm: 'Lịch phát sinh',
            facility: 'Cầu Giấy',
            examLocation: 'Tòa nhà VPBank Tower, 89 Láng Hạ, Đống Đa, Hà Nội',
            soLuong: 180,
            estimatedCount: 180,
            tongNhanSu: 18,
            personInCharge: 'Lê Hoàng Nam',
            status: 'Chờ tổng hợp',
            trangThai: 'CHO_TONG_HOP',
            daGuiTongHop: true,
            ngayGuiTongHop: '2026-08-21T09:15:00.000Z',
            pakdStatus: 'Không có PAKD',
            generalNote: 'Khám sức khỏe tổng quát ngoại viện cho cán bộ khối ngân hàng.',
            requestNote: 'Mang theo xe khám lưu động X-quang kỹ thuật số.',
            categories: ['Khám Nội tổng quát', 'Lấy máu xét nghiệm', 'Chụp X-quang Ngực thẳng KTS', 'Điện tâm đồ (ECG 12 chuyển đạo)'],
            locations: ['Sảnh Tòa nhà VPBank', 'Xe X-quang lưu động'],
            staff: [
                { id: 1, name: 'BS. Võ Thị Minh Em', role: 'Bác sĩ trưởng đoàn', count: 1, shift: 'Chiều' },
                { id: 2, name: 'KTV. Ngô Tấn Khoa', role: 'KTV X-quang', count: 2, shift: 'Chiều' }
            ]
        },
        {
            id: 3,
            code: 'LK-2026-003',
            maLich: 'LK-2026-003',
            teamName: 'Công ty TNHH Phần mềm MISA (Công ty ABC)',
            customerName: 'Công ty TNHH Phần mềm MISA',
            contactPerson: 'Phạm Quốc Huy',
            contactPhone: '0904112233',
            contactEmail: 'huypq@misa.com.vn',
            customerType: 'Doanh nghiệp',
            examDate: '2026-08-24',
            session: 'Sáng',
            startTime: '07:30',
            endTime: '11:30',
            loaiLich: 'Lịch tại viện',
            scheduleForm: 'Lịch tuần',
            facility: 'Ba Đình',
            examLocation: '42-44 Nghĩa Dũng, Ba Đình, Hà Nội',
            soLuong: 100,
            estimatedCount: 100,
            tongNhanSu: 12,
            personInCharge: 'Nguyễn Văn An',
            status: 'Đã duyệt',
            trangThai: 'DA_DUYET_TONG_HOP',
            daGuiTongHop: true,
            ngayGuiTongHop: '2026-08-19T10:00:00.000Z',
            ngayDuyetTongHop: '2026-08-20T14:00:00.000Z',
            nguoiTongHop: 'Trần Thị Mai (Cán bộ Tổng hợp)',
            pakdStatus: 'Đã có PAKD',
            generalNote: 'Đoàn khám định kỳ cho 100 kỹ sư phần mềm MISA (Công ty ABC).',
            requestNote: 'Cung cấp kết quả điện tử qua email.',
            categories: ['Khám Nội tổng quát', 'Siêu âm ổ bụng tổng quát', 'Lấy máu xét nghiệm', 'Khám Mắt & Đo thị lực'],
            locations: ['Tầng 1 - Tiếp đón', 'Tầng 2 - Siêu âm'],
            staff: [
                { id: 1, name: 'BS. Nguyễn Văn An', role: 'Bác sĩ khám chính', count: 1, shift: 'Sáng' },
                { id: 2, name: 'ĐD. Hoàng Văn Giang', role: 'Điều dưỡng', count: 2, shift: 'Sáng' }
            ]
        },
        {
            id: 4,
            code: 'LK-2026-004',
            maLich: 'LK-2026-004',
            teamName: 'Tổng Công ty Điện lực Hà Nội (Công ty XYZ)',
            customerName: 'Tổng Công ty Điện lực Hà Nội',
            contactPerson: 'Hoàng Văn Tuấn',
            contactPhone: '0936778899',
            contactEmail: 'tuanhv@evnhanoi.vn',
            customerType: 'Cơ quan nhà nước',
            examDate: '2026-08-25',
            session: 'Sáng',
            startTime: '08:00',
            endTime: '11:30',
            loaiLich: 'Lịch ngoại viện',
            scheduleForm: 'Lịch tuần',
            facility: 'Ba Đình',
            examLocation: '69 Đinh Tiên Hoàng, Hoàn Kiếm, Hà Nội',
            soLuong: 150,
            estimatedCount: 150,
            tongNhanSu: 16,
            personInCharge: 'Trần Văn Bình',
            status: 'Đã duyệt',
            trangThai: 'DA_DUYET_TONG_HOP',
            daGuiTongHop: true,
            ngayGuiTongHop: '2026-08-19T11:30:00.000Z',
            ngayDuyetTongHop: '2026-08-20T15:00:00.000Z',
            nguoiTongHop: 'Trần Thị Mai (Cán bộ Tổng hợp)',
            pakdStatus: 'Đã có PAKD',
            generalNote: 'Khám sức khỏe nghề nghiệp cho 150 cán bộ điện lực (Công ty XYZ).',
            requestNote: 'Bố trí kíp xét nghiệm độc hại và đo chức năng hô hấp.',
            categories: ['Khám Nội tổng quát', 'Đo Chức năng hô hấp (Khí phế cầu)', 'Lấy máu xét nghiệm'],
            locations: ['Hội trường EVN', 'Xe lưu động'],
            staff: [
                { id: 1, name: 'BS. Bùi Anh Tuấn', role: 'Bác sĩ', count: 2, shift: 'Sáng' }
            ]
        },
        {
            id: 5,
            code: 'LK-2026-005',
            maLich: 'LK-2026-005',
            teamName: 'UBND Phường Phúc Xá (Công ty DEF)',
            customerName: 'UBND Phường Phúc Xá',
            contactPerson: 'Nguyễn Thị Hoa',
            contactPhone: '0915443322',
            contactEmail: 'hoant@phucxa.gov.vn',
            customerType: 'Cơ quan nhà nước',
            examDate: '2026-08-27',
            session: 'Chiều',
            startTime: '13:30',
            endTime: '17:00',
            loaiLich: 'Lịch phường',
            scheduleForm: 'Lịch phát sinh',
            facility: 'Ba Đình',
            examLocation: 'Trạm Y tế Phường Phúc Xá, Ba Đình, Hà Nội',
            soLuong: 80,
            estimatedCount: 80,
            tongNhanSu: 10,
            personInCharge: 'Lê Hoàng Nam',
            status: 'Đã duyệt',
            trangThai: 'DA_DUYET_TONG_HOP',
            daGuiTongHop: true,
            ngayGuiTongHop: '2026-08-20T14:00:00.000Z',
            ngayDuyetTongHop: '2026-08-21T10:00:00.000Z',
            nguoiTongHop: 'Trần Thị Mai (Cán bộ Tổng hợp)',
            pakdStatus: 'Không có PAKD',
            generalNote: 'Khám sức khỏe cộng đồng cho 80 người (Công ty DEF).',
            requestNote: 'Chuẩn bị mẫu phiếu tư vấn sức khỏe.',
            categories: ['Khám Nội tổng quát', 'Khám Mắt & Đo thị lực', 'Khám Tai Mũi Họng'],
            locations: ['Trạm Y tế Phường'],
            staff: [
                { id: 1, name: 'BS. Đỗ Mỹ Hạnh', role: 'Bác sĩ', count: 1, shift: 'Chiều' }
            ]
        },
        {
            id: 6,
            code: 'LK-2026-006',
            maLich: 'LK-2026-006',
            teamName: 'Công ty Dược phẩm Traphaco (Tuần 2)',
            customerName: 'Công ty Dược phẩm Traphaco',
            contactPerson: 'Bùi Thị Lan',
            contactPhone: '0918776655',
            contactEmail: 'lanbt@traphaco.com.vn',
            customerType: 'Doanh nghiệp',
            examDate: '2026-09-02',
            session: 'Sáng',
            startTime: '07:30',
            endTime: '11:30',
            loaiLich: 'Lịch tại viện',
            scheduleForm: 'Lịch tuần',
            facility: 'Ba Đình',
            examLocation: 'Khuất Duy Tiến, Thanh Xuân, Hà Nội',
            soLuong: 110,
            estimatedCount: 110,
            tongNhanSu: 12,
            personInCharge: 'Lê Hoàng Nam',
            status: 'Đã duyệt',
            trangThai: 'DA_DUYET_TONG_HOP',
            daGuiTongHop: true,
            ngayGuiTongHop: '2026-08-22T09:00:00.000Z',
            ngayDuyetTongHop: '2026-08-23T11:00:00.000Z',
            nguoiTongHop: 'Trần Thị Mai (Cán bộ Tổng hợp)',
            pakdStatus: 'Đã có PAKD',
            generalNote: 'Lịch thuộc Tuần 36 (02/09/2026) dùng để kiểm tra việc chặn gom khác tuần.',
            requestNote: 'Thực hiện danh mục khám chuyên sâu mắt & hô hấp.',
            categories: ['Khám Nội tổng quát', 'Khám Mắt & Đo thị lực', 'Đo Chức năng hô hấp (Khí phế cầu)'],
            locations: ['Tầng 1 - Tiếp đón'],
            staff: [
                { id: 1, name: 'BS. Lê Hoàng Cường', role: 'Bác sĩ', count: 1, shift: 'Sáng' }
            ]
        }
    ];

    const SCHEDULE_STATUS_CONFIG = {
        TAO_MOI: {
            label: "Tạo mới",
            className: "status-new"
        },
        CHO_TONG_HOP: {
            label: "Chờ tổng hợp",
            className: "status-pending-summary"
        },
        DA_TONG_HOP: {
            label: "Đã tổng hợp",
            className: "status-summary"
        },
        CHO_DUYET: {
            label: "Chờ duyệt",
            className: "status-pending-approval"
        },
        DA_DUYET: {
            label: "Đã duyệt",
            className: "status-approved"
        },
        CHO_DIEU_PHOI: {
            label: "Chờ điều phối",
            className: "status-pending-coordination"
        },
        DA_DIEU_PHOI: {
            label: "Đã điều phối",
            className: "status-coordinated"
        },
        HOAN_THANH: {
            label: "Hoàn thành",
            className: "status-completed"
        },
        TRA_LAI: {
            label: "Trả lại",
            className: "status-returned"
        }
    };

    function normalizeScheduleStatusKey(rawStatus) {
        if (!rawStatus) return 'TAO_MOI';
        const st = String(rawStatus).trim();
        const upper = st.toUpperCase();

        if (st === 'Tạo mới' || upper === 'TAO_MOI' || upper === 'DA_TAO' || upper === 'NHAP' || st === 'Nháp' || st === 'Chưa gửi') {
            return 'TAO_MOI';
        }
        if (st === 'Trả lại' || upper === 'TRA_LAI' || upper === 'TRA_CHINH_SUA') {
            return 'TRA_LAI';
        }
        if (st === 'Chờ tổng hợp' || upper === 'CHO_TONG_HOP') {
            return 'CHO_TONG_HOP';
        }
        if (st === 'Đã tổng hợp' || upper === 'DA_TONG_HOP' || upper === 'DA_GUI_TONG_HOP' || st === 'Đã gửi tổng hợp' || upper === 'DA_GOM_LICH_TUAN' || st === 'Đã gom lịch tuần') {
            return 'DA_TONG_HOP';
        }
        if (st === 'Chờ duyệt' || upper === 'CHO_DUYET' || upper === 'CHO_CB_DUYET' || upper === 'DANG_DUYET_BUOC_1' || upper === 'DANG_DUYET_BUOC_2') {
            return 'CHO_DUYET';
        }
        if (st === 'Đã duyệt' || upper === 'DA_DUYET' || upper === 'DA_DUYET_TONG_HOP') {
            return 'DA_DUYET';
        }
        if (st === 'Chờ điều phối' || upper === 'CHO_DIEU_PHOI' || upper === 'CHO_XU_LY_PHAT_SINH') {
            return 'CHO_DIEU_PHOI';
        }
        if (st === 'Đã điều phối' || upper === 'DA_DIEU_PHOI' || upper === 'DANG_THUC_HIEN' || st === 'Đang thực hiện') {
            return 'DA_DIEU_PHOI';
        }
        if (st === 'Hoàn thành' || upper === 'HOAN_THANH') {
            return 'HOAN_THANH';
        }

        return SCHEDULE_STATUS_CONFIG[upper] ? upper : 'TAO_MOI';
    }

    function renderScheduleStatus(scheduleOrStatus) {
        const rawStatus = (typeof scheduleOrStatus === 'object' && scheduleOrStatus !== null)
            ? (scheduleOrStatus.trangThai || scheduleOrStatus.status)
            : scheduleOrStatus;

        const key = normalizeScheduleStatusKey(rawStatus);
        const config = SCHEDULE_STATUS_CONFIG[key];

        if (!config) {
            return `<span class="schedule-status status-unknown">Chưa xác định</span>`;
        }

        return `<span class="schedule-status ${config.className}">${config.label}</span>`;
    }

    const MWKDataStore = {
        SCHEDULE_STATUS_CONFIG: SCHEDULE_STATUS_CONFIG,
        normalizeScheduleStatusKey: normalizeScheduleStatusKey,
        renderScheduleStatus: renderScheduleStatus,

        formatExamDateRange: function(item) {
            if (!item) return '-';
            if (typeof item === 'string') {
                const parts = item.split('-');
                if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
                return item;
            }

            const formatDateStr = (dStr) => {
                if (!dStr) return '';
                if (dStr.includes('T')) dStr = dStr.split('T')[0];
                if (dStr.includes('/')) return dStr;
                const parts = dStr.split('-');
                if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
                return dStr;
            };

            let tuVal = item.tuNgay || item.examDateFrom || item.startDate || item.fromDate || item.examDate || item.ngayKham || item.ngayTrienKhai || '';
            let denVal = item.denNgay || item.examDateTo || item.endDate || item.toDate || item.tuNgay || item.examDate || item.ngayKham || item.ngayTrienKhai || '';

            // Compute range from child schedules if present
            const children = item.childSchedules || (typeof this.getChildSchedules === 'function' ? this.getChildSchedules(item.id || item.tongLichId) : []);
            if (Array.isArray(children) && children.length > 0) {
                let childDates = [];
                children.forEach(c => {
                    if (c.tuNgay) childDates.push(c.tuNgay);
                    if (c.denNgay) childDates.push(c.denNgay);
                    if (c.examDate) childDates.push(c.examDate);
                    if (c.ngayKham) childDates.push(c.ngayKham);
                });
                if (childDates.length > 0) {
                    const normalized = childDates.map(d => {
                        if (!d) return null;
                        if (d.includes('T')) d = d.split('T')[0];
                        if (d.includes('/')) {
                            const p = d.split('/');
                            if (p.length === 3) return `${p[2]}-${p[1].padStart(2, '0')}-${p[0].padStart(2, '0')}`;
                        }
                        return d;
                    }).filter(Boolean);
                    normalized.sort();
                    if (normalized.length > 0) {
                        tuVal = normalized[0];
                        denVal = normalized[normalized.length - 1];
                    }
                }
            }

            if (!tuVal && !denVal) {
                return item.thoiGianKham || '-';
            }

            if (!tuVal) tuVal = denVal;
            if (!denVal) denVal = tuVal;

            const formattedStart = formatDateStr(tuVal);
            const formattedEnd = formatDateStr(denVal);

            if (formattedStart && formattedEnd && formattedStart !== formattedEnd) {
                return `${formattedStart} - ${formattedEnd}`;
            }
            return formattedStart || formattedEnd || '-';
        },

        // --- 1. CATEGORIES (DANH MỤC KHÁM) ---
        getCategories: function() {
            const data = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
            if (!data) {
                this.saveCategories(DEFAULT_CATEGORIES);
                return DEFAULT_CATEGORIES;
            }
            try { return JSON.parse(data); } catch(e) { return DEFAULT_CATEGORIES; }
        },
        getActiveCategories: function() {
            return this.getCategories().filter(c => c.status === true);
        },
        getCategoryById: function(id) { return this.getCategories().find(c => c.id === id); },
        saveCategories: function(list) {
            localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(list));
            window.dispatchEvent(new CustomEvent('mwk_categories_changed', { detail: list }));
        },
        addCategory: function(item) {
            const list = this.getCategories();
            const newId = list.length > 0 ? Math.max(...list.map(c => c.id)) + 1 : 1;
            list.unshift({ id: newId, ...item });
            this.saveCategories(list);
            return newId;
        },
        updateCategory: function(id, updatedFields) {
            const list = this.getCategories();
            const index = list.findIndex(c => c.id === id);
            if (index !== -1) {
                list[index] = { id, ...updatedFields };
                this.saveCategories(list);
            }
        },
        deleteCategory: function(id) {
            const list = this.getCategories().filter(c => c.id !== id);
            this.saveCategories(list);
        },

        // --- 2. FACILITIES (CƠ SỞ KHÁM / VỊ TRÍ) ---
        getFacilities: function() {
            const data = localStorage.getItem(STORAGE_KEYS.FACILITIES);
            if (!data) {
                this.saveFacilities(DEFAULT_FACILITIES);
                return DEFAULT_FACILITIES;
            }
            try { 
                const parsed = JSON.parse(data);
                if (Array.isArray(parsed)) {
                    return parsed;
                }
                this.saveFacilities(DEFAULT_FACILITIES);
                return DEFAULT_FACILITIES;
            } catch(e) { return DEFAULT_FACILITIES; }
        },
        getActiveFacilities: function() { return this.getFacilities().filter(f => f.status === true); },
        getFacilityById: function(id) { return this.getFacilities().find(f => f.id === id); },
        saveFacilities: function(list) {
            localStorage.setItem(STORAGE_KEYS.FACILITIES, JSON.stringify(list));
            window.dispatchEvent(new CustomEvent('mwk_facilities_changed', { detail: list }));
        },
        addFacility: function(item) {
            const list = this.getFacilities();
            const newId = list.length > 0 ? Math.max(...list.map(f => f.id)) + 1 : 1;
            list.unshift({ id: newId, ...item });
            this.saveFacilities(list);
            return newId;
        },
        updateFacility: function(id, updatedFields) {
            const list = this.getFacilities();
            const index = list.findIndex(f => f.id === id);
            if (index !== -1) {
                list[index] = { id, ...updatedFields };
                this.saveFacilities(list);
            }
        },
        deleteFacility: function(id) {
            const list = this.getFacilities().filter(f => f.id !== id);
            this.saveFacilities(list);
        },
        checkFacilityDailyCapacity: function(facilityName, examDate, additionalCount, excludeId = null) {
            const facilities = this.getFacilities();
            const fac = facilities.find(f => f.name === facilityName);
            if (!fac || !fac.maxCapacityPerDay || fac.maxCapacityPerDay <= 0) {
                return { exceeded: false, maxCapacity: 0, currentSum: 0, requested: additionalCount, totalAfter: additionalCount };
            }

            const maxCap = parseInt(fac.maxCapacityPerDay);
            const allSchedules = this.getKskSchedules();
            const existingSum = allSchedules
                .filter(s => s.facility === facilityName && s.examDate === examDate && s.id !== excludeId && s.status !== 'Trả lại')
                .reduce((sum, s) => sum + (parseInt(s.estimatedCount) || 0), 0);

            const totalAfter = existingSum + (parseInt(additionalCount) || 0);
            return {
                exceeded: totalAfter > maxCap,
                maxCapacity: maxCap,
                currentSum: existingSum,
                requested: parseInt(additionalCount) || 0,
                totalAfter: totalAfter
            };
        },

        // --- 4. ALLOWANCE (CẤU HÌNH PHỤ CẤP) ---
        getAllowances: function() {
            const data = localStorage.getItem(STORAGE_KEYS.ALLOWANCE);
            if (!data) {
                this.saveAllowances(DEFAULT_ALLOWANCE);
                return DEFAULT_ALLOWANCE;
            }
            try { return JSON.parse(data); } catch(e) { return DEFAULT_ALLOWANCE; }
        },
        getAllowanceById: function(id) { return this.getAllowances().find(a => a.id === id); },
        saveAllowances: function(list) {
            localStorage.setItem(STORAGE_KEYS.ALLOWANCE, JSON.stringify(list));
            window.dispatchEvent(new CustomEvent('mwk_allowances_changed', { detail: list }));
        },
        addAllowance: function(item) {
            const list = this.getAllowances();
            const newId = list.length > 0 ? Math.max(...list.map(a => a.id)) + 1 : 1;
            list.unshift({ id: newId, ...item });
            this.saveAllowances(list);
            return newId;
        },
        updateAllowance: function(id, updatedFields) {
            const list = this.getAllowances();
            const index = list.findIndex(a => a.id === id);
            if (index !== -1) {
                list[index] = { id, ...updatedFields };
                this.saveAllowances(list);
            }
        },
        deleteAllowance: function(id) {
            const list = this.getAllowances().filter(a => a.id !== id);
            this.saveAllowances(list);
        },

        // --- 5. REPORT DOAN KHAM (MODULE 1) ---
        getDoanKhamReports: function() {
            const data = localStorage.getItem(STORAGE_KEYS.REPORT_DOAN_KHAM);
            if (!data) {
                localStorage.setItem(STORAGE_KEYS.REPORT_DOAN_KHAM, JSON.stringify(DEFAULT_DOAN_KHAM_REPORTS));
                return DEFAULT_DOAN_KHAM_REPORTS;
            }
            try { return JSON.parse(data); } catch(e) { return DEFAULT_DOAN_KHAM_REPORTS; }
        },

        // --- 6. REPORT NHAN SU (MODULE 2) ---
        getNhanSuReports: function() {
            const data = localStorage.getItem(STORAGE_KEYS.REPORT_NHAN_SU);
            if (!data) {
                localStorage.setItem(STORAGE_KEYS.REPORT_NHAN_SU, JSON.stringify(DEFAULT_NHAN_SU_REPORTS));
                return DEFAULT_NHAN_SU_REPORTS;
            }
            try { return JSON.parse(data); } catch(e) { return DEFAULT_NHAN_SU_REPORTS; }
        },

        // --- 7. KSK SCHEDULE (LỊCH KSK) ---
        normalizeKskScheduleItem: function(item) {
            if (!item) return item;
            
            const s = { ...item };
            
            // Sync status & trangThai & daGuiTongHop
            const st = s.status || s.trangThai || 'Nháp';
            if (st === 'Chờ tổng hợp' || st === 'CHO_TONG_HOP') {
                s.status = 'Chờ tổng hợp';
                s.trangThai = 'CHO_TONG_HOP';
                s.daGuiTongHop = true;
            } else if (st === 'Đã duyệt' || st === 'DA_DUYET_TONG_HOP') {
                s.status = 'Đã duyệt';
                s.trangThai = 'DA_DUYET_TONG_HOP';
                s.daGuiTongHop = true;
            } else if (st === 'Đã gom lịch tuần' || st === 'DA_GOM_LICH_TUAN') {
                s.status = 'Đã gom lịch tuần';
                s.trangThai = 'DA_GOM_LICH_TUAN';
                s.daGuiTongHop = true;
            } else if (st === 'Trả lại' || st === 'TRA_CHINH_SUA') {
                s.status = 'Trả lại';
                s.trangThai = 'TRA_CHINH_SUA';
                s.daGuiTongHop = false;
            } else if (st === 'Chờ duyệt' || st === 'CHO_DUYET') {
                s.status = 'Chờ duyệt';
                s.trangThai = 'CHO_DUYET';
            } else if (st === 'Hoàn thành' || st === 'HOAN_THANH') {
                s.status = 'Hoàn thành';
                s.trangThai = 'HOAN_THANH';
            } else {
                s.status = s.status || 'Nháp';
                s.trangThai = s.trangThai || 'NHAP';
                s.daGuiTongHop = s.daGuiTongHop === true;
            }

            // Map Vietnamese & English field names bidirectionally
            s.maLich = s.maLich || s.code || '';
            s.code = s.code || s.maLich || '';

            s.tenDoanKham = s.tenDoanKham || s.teamName || '';
            s.teamName = s.teamName || s.tenDoanKham || '';
            
            s.khachHang = s.khachHang || s.customerName || '';
            s.customerName = s.customerName || s.khachHang || '';
            
            s.ngayKham = s.ngayKham || s.examDate || '';
            s.examDate = s.examDate || s.ngayKham || '';
            s.tuNgay = s.tuNgay || s.examDateFrom || s.startDate || s.fromDate || '';
            s.denNgay = s.denNgay || s.examDateTo || s.endDate || s.toDate || '';
            
            s.buoi = s.buoi || s.session || 'Sáng';
            s.session = s.session || s.buoi || 'Sáng';
            
            s.gioBatDau = s.gioBatDau || s.startTime || '07:30';
            s.startTime = s.startTime || s.gioBatDau || '07:30';
            
            s.gioKetThuc = s.gioKetThuc || s.endTime || '11:30';
            s.endTime = s.endTime || s.gioKetThuc || '11:30';
            
            s.soLuong = s.soLuong !== undefined ? s.soLuong : (s.estimatedCount !== undefined ? s.estimatedCount : 0);
            s.estimatedCount = s.estimatedCount !== undefined ? s.estimatedCount : s.soLuong;
            
            s.nguonLich = s.nguonLich || s.scheduleForm || 'Lịch tuần';
            s.scheduleForm = s.scheduleForm || s.nguonLich || 'Lịch tuần';
            
            s.coSoThucHien = s.coSoThucHien || s.facility || 'Ba Đình';
            s.facility = s.facility || s.coSoThucHien || 'Ba Đình';
            
            s.nguoiTao = s.nguoiTao || s.personInCharge || s.cbPhuTrach || s.cbkd || 'Nguyễn Văn An';
            s.cbPhuTrach = s.cbPhuTrach || s.personInCharge || s.nguoiTao || s.cbkd || 'Nguyễn Văn An';
            s.personInCharge = s.personInCharge || s.cbPhuTrach || s.nguoiTao || s.cbkd || 'Nguyễn Văn An';
            s.cbkd = s.cbkd || s.personInCharge || s.nguoiTao || s.cbPhuTrach || 'Nguyễn Văn An';
            
            s.danhMucKham = s.danhMucKham || s.categories || [];
            s.categories = s.categories || s.danhMucKham || [];
            
            s.tuVan = s.tuVan || s.generalNote || '';
            s.generalNote = s.generalNote || s.tuVan || '';
            
            s.luuY = s.luuY || s.requestNote || '';
            s.requestNote = s.requestNote || s.luuY || '';

            if (typeof s.suDungPAKD !== 'boolean') {
                s.suDungPAKD = s.pakdStatus === 'Có PAKD' || s.pakdStatus === 'Đã có PAKD' || s.phuongAnKinhDoanh === 'Có PAKD' || s.phuongAnKinhDoanh === 'Đã có PAKD' || s.pakd === true || s.isPakd === true;
            }
            s.pakdStatus = s.suDungPAKD ? 'Có PAKD' : 'Không có PAKD';
            s.phuongAnKinhDoanh = s.pakdStatus;

            return s;
        },
        getKskSchedules: function() {
            const data = localStorage.getItem(STORAGE_KEYS.KSK_SCHEDULE);
            if (!data) {
                this.saveKskSchedules(DEFAULT_KSK_SCHEDULE);
                return DEFAULT_KSK_SCHEDULE.map(s => this.normalizeKskScheduleItem(s));
            }
            try { 
                const parsed = JSON.parse(data); 
                if (Array.isArray(parsed)) {
                    return parsed.map(s => this.normalizeKskScheduleItem(s));
                }
                return DEFAULT_KSK_SCHEDULE.map(s => this.normalizeKskScheduleItem(s));
            } catch(e) { 
                return DEFAULT_KSK_SCHEDULE.map(s => this.normalizeKskScheduleItem(s));
            }
        },
        getKskScheduleById: function(id) {
            if (id === null || id === undefined) return null;
            const strId = String(id);
            return this.getKskSchedules().find(s => 
                String(s.id) === strId || 
                String(s.unitId) === strId || 
                String(s.code) === strId ||
                String(s.customerCode) === strId ||
                String(s.maDoiTuong) === strId
            );
        },
        getScheduleStatusInfo: function(schedule) {
            const rawStatus = (typeof schedule === 'object' && schedule !== null)
                ? (schedule.trangThai ?? schedule.status)
                : schedule;

            const key = normalizeScheduleStatusKey(rawStatus);
            const config = SCHEDULE_STATUS_CONFIG[key] || { label: 'Chưa xác định', className: 'status-unknown' };

            return {
                label: config.label,
                className: config.className,
                badgeHtml: `<span class="schedule-status ${config.className}">${config.label}</span>`
            };
        },
        formatExamDateRange: function(item) {
            if (!item) return '-';

            const fmt = function(str) {
                if (!str) return '';
                if (typeof str !== 'string') return '';
                const trimmed = str.trim();
                if (!trimmed) return '';
                if (trimmed.includes('/')) return trimmed;
                const parts = trimmed.split('-');
                if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
                return trimmed;
            };

            let tuVal = item.tuNgay || item.examDateFrom || item.startDate || item.fromDate || '';
            let denVal = item.denNgay || item.examDateTo || item.endDate || item.toDate || '';

            if (!tuVal || !denVal) {
                const childList = item.childSchedules || [
                    ...(item.step2Data?.taiVien || []),
                    ...(item.step2Data?.ngoaiVien || []),
                    ...(item.step2Data?.lichPhuong || [])
                ];
                const dates = childList
                    .map(c => c.ngayKham || c.examDate || c.date)
                    .filter(Boolean)
                    .sort();
                if (dates.length > 0) {
                    if (!tuVal) tuVal = dates[0];
                    if (!denVal) denVal = dates[dates.length - 1];
                }
            }

            if (!tuVal) tuVal = item.examDate || item.ngayKham || '';
            if (!denVal) denVal = tuVal;

            const startStr = fmt(tuVal);
            const endStr = fmt(denVal);

            if (startStr && endStr && startStr !== endStr) {
                return `${startStr} - ${endStr}`;
            }
            if (startStr) return startStr;
            if (endStr) return endStr;
            if (item.thoiGianKham) return item.thoiGianKham;

            return '-';
        },
        isScheduleLocked: function(scheduleOrStatus) {
            const rawStatus = (typeof scheduleOrStatus === 'object' && scheduleOrStatus !== null)
                ? (scheduleOrStatus.trangThai ?? scheduleOrStatus.status)
                : scheduleOrStatus;

            if (!rawStatus) return false;
            const key = normalizeScheduleStatusKey(rawStatus);

            if (key === 'TAO_MOI' || key === 'TRA_LAI') {
                return false;
            }

            return true;
        },
        canEditSchedule: function(unitOrSchedule) {
            if (!unitOrSchedule) return false;
            const childs = this.getUnitChildSchedules(unitOrSchedule);
            if (childs && childs.length > 0) {
                return childs.some(child => !this.isScheduleLocked(child));
            }
            return !this.isScheduleLocked(unitOrSchedule);
        },
        canDeleteSchedule: function(unitOrSchedule) {
            return this.canEditSchedule(unitOrSchedule);
        },
        canSendSchedule: function(unitOrSchedule) {
            if (!unitOrSchedule) return false;
            const childs = this.getUnitChildSchedules(unitOrSchedule);
            if (childs && childs.length > 0) {
                return childs.some(child => !this.isScheduleLocked(child));
            }
            return false;
        },
        canViewSchedule: function(unitOrSchedule) {
            return true;
        },
        getUnitChildSchedules: function(unitIdOrObj) {
            let unit = typeof unitIdOrObj === 'object' && unitIdOrObj !== null 
                ? unitIdOrObj 
                : this.getKskScheduleById(unitIdOrObj);
            if (!unit) return [];

            let childSchedules = [];

            function normalizeChildStatus(rawStatus) {
                return normalizeScheduleStatusKey(rawStatus);
            }

            if (unit.step2Data) {
                const tv = (unit.step2Data.taiVien || []).map((i, idx) => {
                    const st = normalizeChildStatus(i.trangThai || i.status);
                    return {
                        ...i,
                        scheduleId: i.scheduleId || i.id || i.maLich || `SCH-TV-${idx + 1}`,
                        id: i.id || i.scheduleId || i.maLich || `SCH-TV-${idx + 1}`,
                        unitId: unit.id || unit.code,
                        maLich: i.maLich || `Lịch tại viện #${idx + 1}`,
                        scheduleType: 'TAI_VIEN',
                        typeLabel: 'Tại viện',
                        trangThai: st,
                        status: i.status || 'Chờ tổng hợp',
                        lyDoTra: i.lyDoTra || i.reason || ''
                    };
                });
                const nv = (unit.step2Data.ngoaiVien || []).map((i, idx) => {
                    const st = normalizeChildStatus(i.trangThai || i.status);
                    return {
                        ...i,
                        scheduleId: i.scheduleId || i.id || i.maLich || `SCH-NV-${idx + 1}`,
                        id: i.id || i.scheduleId || i.maLich || `SCH-NV-${idx + 1}`,
                        unitId: unit.id || unit.code,
                        maLich: i.maLich || `Lịch ngoại viện #${idx + 1}`,
                        scheduleType: 'NGOAI_VIEN',
                        typeLabel: 'Ngoại viện',
                        trangThai: st,
                        status: i.status || 'Chờ tổng hợp',
                        lyDoTra: i.lyDoTra || i.reason || ''
                    };
                });
                const lp = (unit.step2Data.lichPhuong || []).map((i, idx) => {
                    const st = normalizeChildStatus(i.trangThai || i.status);
                    return {
                        ...i,
                        scheduleId: i.scheduleId || i.id || i.maLich || `SCH-LP-${idx + 1}`,
                        id: i.id || i.scheduleId || i.maLich || `SCH-LP-${idx + 1}`,
                        unitId: unit.id || unit.code,
                        maLich: i.maLich || `Lịch phường #${idx + 1}`,
                        scheduleType: 'LICH_PHUONG',
                        typeLabel: 'Phường',
                        trangThai: st,
                        status: i.status || 'Chờ tổng hợp',
                        lyDoTra: i.lyDoTra || i.reason || ''
                    };
                });
                childSchedules = [...tv, ...nv, ...lp];
            } else if (childSchedules.length === 0) {
                // Fallback only for legacy items without step2Data defined
                let schType = 'TAI_VIEN';
                let typeLabel = 'Tại viện';
                const loaiStr = unit.loaiLich || '';
                if (loaiStr.includes('Ngoại viện')) { schType = 'NGOAI_VIEN'; typeLabel = 'Ngoại viện'; }
                else if (loaiStr.includes('Phường')) { schType = 'LICH_PHUONG'; typeLabel = 'Phường'; }

                const isRet = unit.status === 'Trả lại' || unit.trangThai === 'TRA_LAI' || unit.trangThai === 'TRA_CHINH_SUA';
                const st = isRet ? 'TRA_LAI' : normalizeChildStatus(unit.trangThai || unit.status);

                childSchedules.push({
                    scheduleId: unit.code || `SCH-${unit.id}`,
                    id: unit.code || `SCH-${unit.id}`,
                    unitId: unit.id || unit.code,
                    maLich: unit.code || `SCH-${unit.id}`,
                    name: unit.teamName || unit.customerName,
                    scheduleType: schType,
                    typeLabel: typeLabel,
                    trangThai: st,
                    status: unit.status || 'Chờ tổng hợp',
                    lyDoTra: unit.lyDoTra || '',
                    soLuongKhach: unit.estimatedCount || unit.soLuong || 0,
                    tongNhanSu: unit.tongNhanSu || 0
                });
            }

            return childSchedules;
        },
        getReturnedSchedules: function(unitIdOrObj) {
            const childs = this.getUnitChildSchedules(unitIdOrObj);
            return childs.filter(s => 
                s.trangThai === 'TRA_LAI' || 
                s.status === 'Trả lại' || 
                s.trangThai === 'TRA_CHINH_SUA' || 
                s.status === 'Bị trả' ||
                s.status === 'Trả chính sửa'
            );
        },
        getScheduleTypeSummary: function(unitIdOrObj) {
            const childs = this.getUnitChildSchedules(unitIdOrObj);
            let taiVien = 0;
            let ngoaiVien = 0;
            let phuong = 0;

            childs.forEach(c => {
                if (c.scheduleType === 'TAI_VIEN') taiVien++;
                else if (c.scheduleType === 'NGOAI_VIEN') ngoaiVien++;
                else if (c.scheduleType === 'LICH_PHUONG') phuong++;
            });

            const returnedList = childs.filter(s => 
                s.trangThai === 'TRA_LAI' || 
                s.status === 'Trả lại' || 
                s.trangThai === 'TRA_CHINH_SUA' || 
                s.status === 'Bị trả' ||
                s.status === 'Trả chính sửa'
            );

            return {
                total: childs.length,
                taiVien: taiVien,
                ngoaiVien: ngoaiVien,
                phuong: phuong,
                returned: returnedList.length,
                returnedSchedules: returnedList,
                childSchedules: childs
            };
        },
        getSchedulesByUnit: function(unitIdOrObj) {
            const childs = this.getUnitChildSchedules(unitIdOrObj);
            if (childs && childs.length > 0) return childs;
            
            const targetUnitId = typeof unitIdOrObj === 'object' && unitIdOrObj !== null
                ? (unitIdOrObj.unitId || unitIdOrObj.customerCode || unitIdOrObj.maDoiTuong || unitIdOrObj.id || unitIdOrObj.code)
                : unitIdOrObj;

            if (!targetUnitId) return [];

            const allSchedules = this.getKskSchedules();
            const matchingMaster = allSchedules.filter(s => 
                String(s.id) === String(targetUnitId) || 
                String(s.code) === String(targetUnitId) || 
                String(s.customerCode) === String(targetUnitId) || 
                String(s.maDoiTuong) === String(targetUnitId)
            );

            let result = [];
            matchingMaster.forEach(m => {
                result.push(...this.getUnitChildSchedules(m));
            });
            return result;
        },
        getUnitScheduleSummary: function(unitIdOrObj) {
            return this.getScheduleTypeSummary(unitIdOrObj);
        },
        syncDraftToDataStore: function(storageKey = 'mwk_create_schedule_draft') {
            const draftJson = sessionStorage.getItem(storageKey);
            if (!draftJson) return null;
            try {
                const draft = JSON.parse(draftJson);
                if (!draft) return null;

                const customerCode = (draft.customerCode && draft.customerCode.trim()) || (draft.maDoiTuong && draft.maDoiTuong.trim()) || ('KAD' + String(Date.now()).slice(-6));
                const customerName = draft.customerName || draft.tenDonVi || draft.teamName || 'Đơn vị khám sức khỏe';
                const contactPerson = draft.contactPerson || customerName;

                draft.customerCode = customerCode;
                draft.maDoiTuong = customerCode;
                sessionStorage.setItem(storageKey, JSON.stringify(draft));

                let existingList = this.getKskSchedules();
                let existingItem = draft.editId ? existingList.find(s => String(s.id) === String(draft.editId) || (s.customerCode && s.customerCode === customerCode)) : null;

                const step2Data = draft.step2Data || { ngoaiVien: [], taiVien: [], lichPhuong: [] };
                ['taiVien', 'ngoaiVien', 'lichPhuong'].forEach(typeKey => {
                    if (Array.isArray(step2Data[typeKey])) {
                        step2Data[typeKey].forEach(child => {
                            child.unitId = customerCode;
                            if (!child.trangThai) child.trangThai = 'TAO_MOI';
                        });
                    }
                });

                const countNV = (step2Data.ngoaiVien || []).length;
                const countTV = (step2Data.taiVien || []).length;
                const countLP = (step2Data.lichPhuong || []).length;
                const totalChilds = countNV + countTV + countLP;

                const loaiLichTypes = [];
                if (countNV > 0) loaiLichTypes.push('Lịch ngoại viện');
                if (countTV > 0) loaiLichTypes.push('Lịch tại viện');
                if (countLP > 0) loaiLichTypes.push('Lịch phường');
                if (loaiLichTypes.length === 0) loaiLichTypes.push('Lịch tại viện');

                if (existingItem) {
                    this.updateKskSchedule(existingItem.id, {
                        customerName: customerName,
                        teamName: customerName,
                        contactPerson: contactPerson,
                        customerCode: customerCode,
                        maDoiTuong: customerCode,
                        loaiLich: loaiLichTypes.join(', '),
                        loaiLichTypes: loaiLichTypes,
                        tongSoLichCount: totalChilds,
                        tuNgay: draft.tuNgay || draft.examDateFrom || draft.examDate,
                        denNgay: draft.denNgay || draft.examDateTo || draft.tuNgay || draft.examDate,
                        examDate: draft.examDate || draft.tuNgay,
                        ngayKham: draft.ngayKham || draft.tuNgay,
                        thoiGianKham: draft.thoiGianKham,
                        step2Data: step2Data
                    });
                    return existingItem.id;
                } else {
                    const newItem = {
                        teamName: customerName,
                        customerName: customerName,
                        contactPerson: contactPerson,
                        customerCode: customerCode,
                        maDoiTuong: customerCode,
                        scheduleForm: 'Lịch tuần',
                        loaiLich: loaiLichTypes.join(', '),
                        loaiLichTypes: loaiLichTypes,
                        tongSoLichCount: totalChilds,
                        estimatedCount: draft.estimatedCount || draft.soLuongKhach || 180,
                        soLuong: draft.estimatedCount || draft.soLuongKhach || 180,
                        tongNhanSu: 18,
                        facility: 'MEDLATEC Ba Đình',
                        personInCharge: draft.cbkd || 'Nguyễn Văn An',
                        nguoiTao: draft.cbkd || 'Nguyễn Văn An',
                        status: 'Tạo mới',
                        trangThai: 'TAO_MOI',
                        daGuiTongHop: false,
                        suDungPAKD: draft.suDungPAKD !== undefined ? draft.suDungPAKD : (draft.pakdStatus === 'Có PAKD' || draft.pakdStatus === 'Đã có PAKD'),
                        pakdStatus: draft.pakdStatus || 'Có PAKD',
                        tuNgay: draft.tuNgay || draft.examDateFrom || draft.examDate,
                        denNgay: draft.denNgay || draft.examDateTo || draft.tuNgay || draft.examDate,
                        examDate: draft.examDate || draft.tuNgay,
                        ngayKham: draft.ngayKham || draft.tuNgay,
                        thoiGianKham: draft.thoiGianKham,
                        step2Data: step2Data
                    };
                    const newId = this.addKskSchedule(newItem);
                    return newId;
                }
            } catch (e) {
                console.error("Lỗi syncDraftToDataStore:", e);
                return null;
            }
        },
        getSchedules: function() {
            return this.getKskSchedules();
        },
        addSchedule: function(schedule, actorName) {
            return this.addKskSchedule(schedule, actorName);
        },
        updateSchedule: function(id, updatedFields, actorName) {
            return this.updateKskSchedule(id, updatedFields, actorName);
        },
        deleteSchedule: function(id) {
            return this.deleteKskSchedule(id);
        },
        getSchedule: function(id) {
            return this.getKskScheduleById(id);
        },
        saveKskSchedules: function(list) {
            localStorage.setItem(STORAGE_KEYS.KSK_SCHEDULE, JSON.stringify(list));
            window.dispatchEvent(new CustomEvent('mwk_ksk_schedules_changed', { detail: list }));
        },
        addKskSchedule: function(item, actorName = 'Nguyễn Văn An (Cán bộ lập lịch)') {
            const list = this.getKskSchedules();
            const newId = list.length > 0 ? Math.max(...list.map(s => s.id)) + 1 : 1;
            const newCode = item.code || ('LK-2026-' + String(newId).padStart(3, '0'));
            
            const now = new Date();
            const timeStr = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')} - ${String(now.getDate()).padStart(2,'0')}/${String(now.getMonth()+1).padStart(2,'0')}/${now.getFullYear()}`;
            
            const history = [];
            if (item.status === 'Chờ tổng hợp' || item.trangThai === 'CHO_TONG_HOP') {
                item.status = 'Chờ tổng hợp';
                item.trangThai = 'CHO_TONG_HOP';
                item.daGuiTongHop = true;
                item.ngayGuiTongHop = item.ngayGuiTongHop || new Date().toISOString();

                history.push({
                    actor: actorName,
                    timestamp: timeStr,
                    action: 'Gửi CB Tổng hợp',
                    details: 'Tạo mới và gửi hồ sơ cho Cán bộ Tổng hợp.'
                });
            }
            history.push({
                actor: actorName,
                timestamp: timeStr,
                action: 'Tạo mới lịch khám sức khỏe',
                details: 'Khởi tạo thông tin lịch KSK thành công.'
            });

            const newItem = this.normalizeKskScheduleItem({ id: newId, code: newCode, ...item, history: history });
            list.unshift(newItem);
            this.saveKskSchedules(list);
            return newId;
        },
        updateKskSchedule: function(id, updatedFields, actorName = 'Nguyễn Văn An (Cán bộ lập lịch)') {
            const list = this.getKskSchedules();
            const strId = String(id);
            const index = list.findIndex(s => 
                String(s.id) === strId || 
                String(s.unitId) === strId || 
                String(s.code) === strId
            );
            if (index !== -1) {
                const oldItem = list[index];
                const existingHistory = Array.isArray(oldItem.history) ? oldItem.history : [];

                const targetStatus = updatedFields.status || updatedFields.trangThai;
                let actionName = 'Cập nhật thông tin lịch';

                if (targetStatus) {
                    if (targetStatus === 'Chờ tổng hợp' || targetStatus === 'CHO_TONG_HOP') {
                        actionName = 'Gửi CB Tổng hợp';
                        updatedFields.status = 'Chờ tổng hợp';
                        updatedFields.trangThai = 'CHO_TONG_HOP';
                        updatedFields.daGuiTongHop = true;
                        if (!updatedFields.ngayGuiTongHop) {
                            updatedFields.ngayGuiTongHop = new Date().toISOString();
                        }
                    }
                    else if (targetStatus === 'Đã duyệt' || targetStatus === 'DA_DUYET_TONG_HOP') {
                        actionName = 'CB Tổng hợp phê duyệt';
                        updatedFields.status = 'Đã duyệt';
                        updatedFields.trangThai = 'DA_DUYET_TONG_HOP';
                        updatedFields.daGuiTongHop = true;
                        if (!updatedFields.ngayDuyetTongHop) {
                            updatedFields.ngayDuyetTongHop = new Date().toISOString();
                        }
                        if (!updatedFields.nguoiTongHop) {
                            updatedFields.nguoiTongHop = actorName;
                        }
                    }
                    else if (targetStatus === 'Trả lại' || targetStatus === 'TRA_CHINH_SUA') {
                        actionName = 'Trả lại CB Tổng hợp';
                        updatedFields.status = 'Trả lại';
                        updatedFields.trangThai = 'TRA_CHINH_SUA';
                        updatedFields.daGuiTongHop = false;
                    }
                    else if (targetStatus === 'Chờ duyệt' || targetStatus === 'CHO_DUYET') {
                        actionName = 'Gửi duyệt Lịch tuần';
                        updatedFields.status = 'Chờ duyệt';
                        updatedFields.trangThai = 'CHO_DUYET';
                    }
                    else if (targetStatus === 'Hoàn thành' || targetStatus === 'HOAN_THANH') {
                        actionName = 'Hoàn thành điều phối';
                        updatedFields.status = 'Hoàn thành';
                        updatedFields.trangThai = 'HOAN_THANH';
                    }
                }

                const changes = [];
                const fieldLabels = {
                    teamName: 'Tên đoàn khám',
                    tenDoanKham: 'Tên đoàn khám',
                    customerName: 'Tên khách hàng',
                    khachHang: 'Tên khách hàng',
                    scheduleForm: 'Nguồn lịch',
                    nguonLich: 'Nguồn lịch',
                    loaiLich: 'Loại lịch',
                    examDate: 'Ngày khám',
                    ngayKham: 'Ngày khám',
                    facility: 'Cơ sở thực hiện',
                    coSoThucHien: 'Cơ sở thực hiện',
                    examLocation: 'Địa điểm khám',
                    estimatedCount: 'Số lượng dự kiến',
                    soLuong: 'Số lượng dự kiến',
                    status: 'Trạng thái',
                    trangThai: 'Trạng thái'
                };

                for (let key in updatedFields) {
                    if (fieldLabels[key] && oldItem[key] !== undefined && String(oldItem[key]) !== String(updatedFields[key])) {
                        let oldV = String(oldItem[key] || 'Trống');
                        let newV = String(updatedFields[key] || 'Trống');
                        if (key === 'estimatedCount' || key === 'soLuong') {
                            oldV = `${oldV} người`;
                            newV = `${newV} người`;
                        }
                        changes.push({
                            field: fieldLabels[key],
                            oldVal: oldV,
                            newVal: newV
                        });
                    }
                }

                const now = new Date();
                const timeStr = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')} - ${String(now.getDate()).padStart(2,'0')}/${String(now.getMonth()+1).padStart(2,'0')}/${now.getFullYear()}`;

                const historyEntry = {
                    actor: actorName,
                    timestamp: timeStr,
                    action: actionName
                };
                if (updatedFields.lyDoTra) {
                    historyEntry.details = `Lý do trả về: ${updatedFields.lyDoTra}`;
                } else if (changes.length > 0) {
                    historyEntry.changes = changes;
                } else {
                    historyEntry.details = 'Hiệu chỉnh thông tin chi tiết lịch KSK.';
                }

                const updatedItem = { ...oldItem, ...updatedFields, history: [historyEntry, ...existingHistory] };
                list[index] = updatedItem;
                this.saveKskSchedules(list);
            }
        },
        deleteKskSchedule: function(id) {
            const strId = String(id);
            const list = this.getKskSchedules().filter(s => 
                String(s.id) !== strId && 
                String(s.unitId) !== strId && 
                String(s.code) !== strId
            );
            this.saveKskSchedules(list);
        },
        deleteChildScheduleFromUnit: function(unitId, scheduleId) {
            let unit = this.getKskScheduleById(unitId);
            if (!unit) {
                const allSchedules = this.getKskSchedules();
                unit = allSchedules.find(m => {
                    const childs = this.getUnitChildSchedules(m);
                    return childs.some(c => String(c.id) === String(scheduleId) || String(c.scheduleId) === String(scheduleId));
                });
            }
            if (!unit || !unit.step2Data) return false;

            const strSubId = String(scheduleId);
            let deleted = false;

            ['taiVien', 'ngoaiVien', 'lichPhuong'].forEach(key => {
                if (Array.isArray(unit.step2Data[key])) {
                    const beforeLen = unit.step2Data[key].length;
                    unit.step2Data[key] = unit.step2Data[key].filter(c => 
                        String(c.id) !== strSubId && 
                        String(c.scheduleId) !== strSubId && 
                        String(c.maLich) !== strSubId
                    );
                    if (unit.step2Data[key].length < beforeLen) {
                        deleted = true;
                    }
                }
            });

            if (deleted) {
                this.updateKskSchedule(unit.id, { step2Data: unit.step2Data });
            }
            return deleted;
        },
        getKskScheduleHistory: function(id) {
            const item = this.getKskScheduleById(id);
            if (!item) return [];
            if (Array.isArray(item.history) && item.history.length > 0) {
                return item.history;
            }
            const now = new Date();
            const timeStr = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')} - ${String(now.getDate()).padStart(2,'0')}/${String(now.getMonth()+1).padStart(2,'0')}/${now.getFullYear()}`;
            return [
                {
                    actor: item.personInCharge || 'Nguyễn Văn An (Cán bộ lập lịch)',
                    timestamp: item.createdAt || timeStr,
                    action: 'Tạo mới lịch khám sức khỏe',
                    details: `Khởi tạo thành công đợt khám KSK cho đơn vị ${item.customerName || item.teamName || 'Đơn vị'}. Quy mô: ${item.tongSoLich || '1 Lịch tại viện'}.`
                }
            ];
        },

        // --- WEEKLY SCHEDULES (TỔNG HỢP LỊCH TUẦN) ---
        getWeeklySchedules: function() {
            const data = localStorage.getItem(STORAGE_KEYS.WEEKLY_SCHEDULES);
            if (!data) return [];
            try {
                return JSON.parse(data) || [];
            } catch(e) {
                return [];
            }
        },
        saveWeeklySchedules: function(list) {
            localStorage.setItem(STORAGE_KEYS.WEEKLY_SCHEDULES, JSON.stringify(list));
            window.dispatchEvent(new CustomEvent('mwk_weekly_schedules_changed', { detail: list }));
        },
        addWeeklySchedule: function(item) {
            const list = this.getWeeklySchedules();
            const existingIndex = list.findIndex(w => w.weekId === item.weekId);
            if (existingIndex !== -1) {
                list[existingIndex] = { ...list[existingIndex], ...item };
            } else {
                list.unshift(item);
            }
            this.saveWeeklySchedules(list);
            return item.weekId;
        },
        updateWeeklySchedule: function(weekId, updatedFields) {
            const list = this.getWeeklySchedules();
            const index = list.findIndex(w => w.weekId === weekId);
            if (index !== -1) {
                list[index] = { ...list[index], ...updatedFields };
                this.saveWeeklySchedules(list);
            }
        },

        // Master list for missing services
        getMissingServicesMasterData: function() {
            return [
                "Ngoại", "Da liễu", "Tai mũi họng", "Răng hàm mặt", "Sản", "Nội", "Mắt", 
                "Điện tim", "Xquang", "Siêu âm", "Lấy mẫu", "Điện não", "Hô hấp", "Thần kinh"
            ];
        },

        // --- 3. CẤU HÌNH ĐỊNH MỨC (5 TAB) ---
        getMatrixFacilities: function() {
            const data = localStorage.getItem('mwk_matrix_facilities_custom');
            if (data) {
                try {
                    const list = JSON.parse(data);
                    return list.map(f => ({
                        ...f,
                        mode: f.mode || (f.hasShifts ? 'MORNING_AFTERNOON' : 'FULL_DAY')
                    }));
                } catch(e) {}
            }
            return [
                { code: 'TH', name: 'TÂY HỒ', region: 'Bắc', theme: 'amber', mode: 'MORNING_AFTERNOON' },
                { code: 'BD', name: 'BA ĐÌNH', region: 'Bắc', theme: 'rose', mode: 'MORNING_AFTERNOON' },
                { code: 'TX', name: 'THANH XUÂN', region: 'Bắc', theme: 'sky', mode: 'MORNING_AFTERNOON' },
                { code: 'CG', name: 'CẦU GIẤY', region: 'Bắc', theme: 'yellow', mode: 'MORNING_AFTERNOON' },
                { code: 'VP', name: 'VĨNH PHÚC', region: 'Bắc', theme: 'purple', mode: 'MORNING_AFTERNOON' },
                { code: 'THA', name: 'THANH HOÁ', region: 'Trung', theme: 'orange', mode: 'MORNING_AFTERNOON' },
                { code: 'CT', name: 'CẦN THƠ', region: 'Nam', theme: 'emerald', mode: 'MORNING_AFTERNOON' },
                { code: 'HCM', name: 'HCM', region: 'Nam', theme: 'stone', mode: 'MORNING_AFTERNOON' },
                { code: 'NA', name: 'NGHỆ AN', region: 'Trung', theme: 'teal', mode: 'FULL_DAY' },
                { code: 'QB', name: 'QUẢNG BÌNH', region: 'Trung', theme: 'warm', mode: 'FULL_DAY' }
            ];
        },
        saveMatrixFacilities: function(facList) {
            localStorage.setItem('mwk_matrix_facilities_custom', JSON.stringify(facList));
        },

        getMatrixRowDefinitions: function() {
            const data = localStorage.getItem('mwk_matrix_rows_custom_v1');
            if (data) {
                try { return JSON.parse(data); } catch(e) {}
            }
            return [
                { id: '1', parentGroupId: null, stt: '1', name: 'Tổng KH phục vụ tại viện/ ngày (ps 10%, quá 10% dừng)', type: 'text', isGroupHeader: true, isShifted: false, group: 'Nhóm 1: Tổng KH phục vụ' },
                { id: '1.1', parentGroupId: '1', stt: '1,1', name: 'Định mức KH tại viện tối đa có bổ sung kíp nhân sự/ sáng', type: 'text', isGroupHeader: false, isShifted: false, group: 'Nhóm 1: Tổng KH phục vụ' },
                { id: '1.2', parentGroupId: '1', stt: '1,2', name: 'Định mức KH tại viện tối đa có bổ sung kíp nhân sự/ chiều', type: 'text', isGroupHeader: false, isShifted: false, group: 'Nhóm 1: Tổng KH phục vụ' },
                
                { id: '2', parentGroupId: null, stt: '2', name: 'Định mức KH tại viện/ ngày ( nhân sự tại các điểm khám kiêm không bổ sung kíp', type: 'header', isGroupHeader: true, isShifted: true, group: 'Nhóm 2: Định mức chuyên khoa' },
                { id: '2.1', parentGroupId: '2', stt: '2,1', name: 'Siêu âm ( chỉ định)', type: 'number', isGroupHeader: false, isShifted: true, group: 'Nhóm 2: Định mức chuyên khoa' },
                { id: '2.2', parentGroupId: '2', stt: '2,2', name: 'Xquang', type: 'number', isGroupHeader: false, isShifted: true, group: 'Nhóm 2: Định mức chuyên khoa' },
                { id: '2.3', parentGroupId: '2', stt: '2,3', name: 'Điện Tim', type: 'number', isGroupHeader: false, isShifted: true, group: 'Nhóm 2: Định mức chuyên khoa' },
                { id: '2.4', parentGroupId: '2', stt: '2,4', name: 'Lấy mẫu', type: 'number', isGroupHeader: false, isShifted: true, group: 'Nhóm 2: Định mức chuyên khoa' },
                { id: '2.5', parentGroupId: '2', stt: '2,5', name: 'Khám Nội', type: 'number', isGroupHeader: false, isShifted: true, group: 'Nhóm 2: Định mức chuyên khoa' },
                { id: '2.6', parentGroupId: '2', stt: '2,6', name: 'Khám mắt', type: 'number', isGroupHeader: false, isShifted: true, group: 'Nhóm 2: Định mức chuyên khoa' },
                { id: '2.7', parentGroupId: '2', stt: '2,7', name: 'Khám Tai mũi họng', type: 'number', isGroupHeader: false, isShifted: true, group: 'Nhóm 2: Định mức chuyên khoa' },
                { id: '2.8', parentGroupId: '2', stt: '2,8', name: 'Khám Răng hàm mặt', type: 'text', isGroupHeader: false, isShifted: true, group: 'Nhóm 2: Định mức chuyên khoa' },
                { id: '2.9', parentGroupId: '2', stt: '2,9', name: 'Khám sản phụ khoa', type: 'number', isGroupHeader: false, isShifted: true, group: 'Nhóm 2: Định mức chuyên khoa' },
                { id: '2.10', parentGroupId: '2', stt: '2,10', name: 'Khám sản phụ khoa+ NSCTC', type: 'number', isGroupHeader: false, isShifted: true, group: 'Nhóm 2: Định mức chuyên khoa' },
                { id: '2.11', parentGroupId: '2', stt: '2,11', name: 'Khám da liễu', type: 'number', isGroupHeader: false, isShifted: true, group: 'Nhóm 2: Định mức chuyên khoa' },

                { id: 'notes', parentGroupId: null, stt: '3', name: 'CÁC DỊCH VỤ THIẾU CK VÀ YC', type: 'multiline', isGroupHeader: true, isShifted: false, group: 'Nhóm 3: Dịch vụ thiếu CK & YC' },
                
                { id: '4', parentGroupId: null, stt: '4', name: 'Đầu mối phụ trách triển khai KSK tại điểm', type: 'person', isGroupHeader: false, isShifted: false, group: 'Nhóm 4: Đầu mối triển khai' },
                { id: '5', parentGroupId: null, stt: '5', name: 'Đầu mối phụ trách hậu cần KSK tại điểm', type: 'person', isGroupHeader: false, isShifted: false, group: 'Nhóm 5: Đầu mối hậu cần' },
                { id: '6', parentGroupId: null, stt: '6', name: 'CBQL KSK phụ trách tại HN', type: 'person', isGroupHeader: false, isShifted: false, group: 'Nhóm 6: CBQL KSK' },
                { id: '7', parentGroupId: null, stt: '7', name: 'Đầu mối hỗ trợ triển khai của BV/PK', type: 'person', isGroupHeader: false, isShifted: false, group: 'Nhóm 7: Đầu mối hỗ trợ' },
                { id: '8', parentGroupId: null, stt: '8', name: 'GĐ tại các BV/PK', type: 'person', isGroupHeader: false, isShifted: false, group: 'Nhóm 8: Giám đốc BV/PK' }
            ];
        },
        saveMatrixRowDefinitions: function(rowsList) {
            localStorage.setItem('mwk_matrix_rows_custom_v1', JSON.stringify(rowsList));
        },

        getNormalizedMatrixEntries: function() {
            const versionKey = 'mwk_matrix_excel_v30_dynamic';
            if (localStorage.getItem('mwk_matrix_version_key') !== versionKey) {
                localStorage.removeItem(STORAGE_KEYS.MATRIX_DINH_MUC_TAI_VIEN);
                localStorage.setItem('mwk_matrix_version_key', versionKey);
            }

            const data = localStorage.getItem(STORAGE_KEYS.MATRIX_DINH_MUC_TAI_VIEN);
            if (!data) {
                const initial = this.getDefaultNormalizedMatrixData();
                this.saveNormalizedMatrixEntries(initial);
                return initial;
            }
            try { return JSON.parse(data); } catch(e) { return this.getDefaultNormalizedMatrixData(); }
        },

        saveNormalizedMatrixEntries: function(entries) {
            localStorage.setItem(STORAGE_KEYS.MATRIX_DINH_MUC_TAI_VIEN, JSON.stringify(entries));
            window.dispatchEvent(new CustomEvent('mwk_matrix_dinh_muc_changed', { detail: entries }));
        },

        updateNormalizedMatrixCell: function(itemId, facilityName, shift, newValue) {
            const entries = this.getNormalizedMatrixEntries();
            const index = entries.findIndex(e => e.itemId === itemId && e.facility === facilityName && e.shift === shift);
            if (index !== -1) {
                entries[index].value = newValue;
            } else {
                entries.push({ itemId, facility: facilityName, shift, value: newValue });
            }
            this.saveNormalizedMatrixEntries(entries);
        },

        getPivotedMatrixData: function(regionFilter = '', searchVal = '') {
            const allFacilities = this.getMatrixFacilities();
            const filteredFacilities = allFacilities.filter(f => !regionFilter || f.region === regionFilter);
            const entries = this.getNormalizedMatrixEntries();
            const rows = this.getMatrixRowDefinitions();

            const valueMap = {};
            entries.forEach(e => {
                const mapKey = `${e.itemId}_${e.facility}_${e.shift || 'Full'}`;
                valueMap[mapKey] = e.value;
            });

            const filteredRows = rows.filter(r => {
                if (!searchVal) return true;
                const searchLower = searchVal.toLowerCase();
                let haystack = (r.stt + ' ' + r.name + ' ' + r.group).toLowerCase();
                filteredFacilities.forEach(f => {
                    haystack += ` ${valueMap[`${r.id}_${f.name}_Full`] || ''} ${valueMap[`${r.id}_${f.name}_Sang`] || ''} ${valueMap[`${r.id}_${f.name}_Chieu`] || ''}`;
                });
                return haystack.includes(searchLower);
            });

            return {
                facilities: filteredFacilities,
                rows: filteredRows.map(r => {
                    const facValues = {};
                    filteredFacilities.forEach(f => {
                        facValues[f.name] = {
                            Full: valueMap[`${r.id}_${f.name}_Full`] !== undefined ? valueMap[`${r.id}_${f.name}_Full`] : '',
                            Sang: valueMap[`${r.id}_${f.name}_Sang`] !== undefined ? valueMap[`${r.id}_${f.name}_Sang`] : '',
                            Chieu: valueMap[`${r.id}_${f.name}_Chieu`] !== undefined ? valueMap[`${r.id}_${f.name}_Chieu`] : ''
                        };
                    });
                    return { ...r, facValues };
                })
            };
        },

        getDefaultNormalizedMatrixData: function() {
            const entries = [];

            const r1Data = { 'TÂY HỒ': '500-600', 'BA ĐÌNH': '240', 'THANH XUÂN': '240', 'CẦU GIẤY': '240', 'VĨNH PHÚC': '120', 'THANH HOÁ': '100', 'CẦN THƠ': '200', 'HCM': '90', 'NGHỆ AN': '100', 'QUẢNG BÌNH': '100' };
            Object.keys(r1Data).forEach(f => entries.push({ itemId: '1', facility: f, shift: 'Full', value: r1Data[f] }));

            const r11Data = { 'TÂY HỒ': '250-300', 'BA ĐÌNH': '120', 'THANH XUÂN': '120', 'CẦU GIẤY': '120', 'VĨNH PHÚC': '60', 'THANH HOÁ': '50', 'CẦN THƠ': '100', 'HCM': '40', 'NGHỆ AN': '50', 'QUẢNG BÌNH': '50' };
            Object.keys(r11Data).forEach(f => entries.push({ itemId: '1.1', facility: f, shift: 'Full', value: r11Data[f] }));

            const r12Data = { 'TÂY HỒ': '250-300', 'BA ĐÌNH': '120', 'THANH XUÂN': '120', 'CẦU GIẤY': '120', 'VĨNH PHÚC': '60', 'THANH HOÁ': '50', 'CẦN THƠ': '100', 'HCM': '50', 'NGHỆ AN': '50', 'QUẢNG BÌNH': '50' };
            Object.keys(r12Data).forEach(f => entries.push({ itemId: '1.2', facility: f, shift: 'Full', value: r12Data[f] }));

            const addShiftVal = (itemId, fac, sang, chieu) => {
                entries.push({ itemId, facility: fac, shift: 'Sang', value: sang });
                entries.push({ itemId, facility: fac, shift: 'Chieu', value: chieu });
            };

            addShiftVal('2.1', 'TÂY HỒ', '25', '25'); addShiftVal('2.1', 'BA ĐÌNH', '30', '40'); addShiftVal('2.1', 'THANH XUÂN', '20', '20'); addShiftVal('2.1', 'CẦU GIẤY', '30', '30'); addShiftVal('2.1', 'VĨNH PHÚC', '30', '30'); addShiftVal('2.1', 'THANH HOÁ', '20', '20'); addShiftVal('2.1', 'CẦN THƠ', '20', '20'); addShiftVal('2.1', 'HCM', '30', '30');
            addShiftVal('2.2', 'TÂY HỒ', '30', '30'); addShiftVal('2.2', 'BA ĐÌNH', '25', '30'); addShiftVal('2.2', 'THANH XUÂN', '30', '30'); addShiftVal('2.2', 'CẦU GIẤY', '30', '30'); addShiftVal('2.2', 'VĨNH PHÚC', '30', '30'); addShiftVal('2.2', 'THANH HOÁ', '20', '20'); addShiftVal('2.2', 'CẦN THƠ', '20', '20'); addShiftVal('2.2', 'HCM', '30', '30');
            addShiftVal('2.3', 'TÂY HỒ', '30', '30'); addShiftVal('2.3', 'BA ĐÌNH', '15', '15'); addShiftVal('2.3', 'THANH XUÂN', '10', '10'); addShiftVal('2.3', 'CẦU GIẤY', '0', '0'); addShiftVal('2.3', 'VĨNH PHÚC', '30', '30'); addShiftVal('2.3', 'THANH HOÁ', '20', '20'); addShiftVal('2.3', 'CẦN THƠ', '20', '20'); addShiftVal('2.3', 'HCM', '30', '30');
            addShiftVal('2.4', 'TÂY HỒ', '25', '25'); addShiftVal('2.4', 'BA ĐÌNH', '20', '25'); addShiftVal('2.4', 'THANH XUÂN', '10', '15'); addShiftVal('2.4', 'CẦU GIẤY', '0', '0'); addShiftVal('2.4', 'VĨNH PHÚC', '30', '30'); addShiftVal('2.4', 'THANH HOÁ', '20', '20'); addShiftVal('2.4', 'CẦN THƠ', '20', '20'); addShiftVal('2.4', 'HCM', '30', '30');
            addShiftVal('2.5', 'TÂY HỒ', '25', '25'); addShiftVal('2.5', 'BA ĐÌNH', '20', '25'); addShiftVal('2.5', 'THANH XUÂN', '20', '20'); addShiftVal('2.5', 'CẦU GIẤY', '0', '0'); addShiftVal('2.5', 'VĨNH PHÚC', '30', '30'); addShiftVal('2.5', 'THANH HOÁ', '20', '20'); addShiftVal('2.5', 'CẦN THƠ', '20', '20'); addShiftVal('2.5', 'HCM', '30', '30');
            addShiftVal('2.6', 'TÂY HỒ', '30', '30'); addShiftVal('2.6', 'BA ĐÌNH', '25', '30'); addShiftVal('2.6', 'THANH XUÂN', '20', '30'); addShiftVal('2.6', 'CẦU GIẤY', '0', '0'); addShiftVal('2.6', 'VĨNH PHÚC', '30', '30'); addShiftVal('2.6', 'THANH HOÁ', '20', '20'); addShiftVal('2.6', 'CẦN THƠ', '20', '20'); addShiftVal('2.6', 'HCM', '30', '30');
            addShiftVal('2.7', 'TÂY HỒ', '30', '30'); addShiftVal('2.7', 'BA ĐÌNH', '20', '20'); addShiftVal('2.7', 'THANH XUÂN', '10', '20'); addShiftVal('2.7', 'CẦU GIẤY', '20', '20'); addShiftVal('2.7', 'VĨNH PHÚC', '30', '30'); addShiftVal('2.7', 'THANH HOÁ', '20', '20'); addShiftVal('2.7', 'CẦN THƠ', '0', '0'); addShiftVal('2.7', 'HCM', '30', '30');
            addShiftVal('2.8', 'TÂY HỒ', '30', '30'); entries.push({ itemId: '2.8', facility: 'BA ĐÌNH', shift: 'Full', value: 'Meddental' }); entries.push({ itemId: '2.8', facility: 'THANH XUÂN', shift: 'Full', value: 'Meddental' }); addShiftVal('2.8', 'VĨNH PHÚC', '30', '30'); addShiftVal('2.8', 'THANH HOÁ', '20', '20'); addShiftVal('2.8', 'CẦN THƠ', '0', '0'); addShiftVal('2.8', 'HCM', '30', '30');
            addShiftVal('2.9', 'TÂY HỒ', '15', '15'); addShiftVal('2.9', 'BA ĐÌNH', '15', '15'); addShiftVal('2.9', 'THANH XUÂN', '20', '20'); addShiftVal('2.9', 'CẦU GIẤY', '15', '15'); addShiftVal('2.9', 'VĨNH PHÚC', '30', '30'); addShiftVal('2.9', 'THANH HOÁ', '20', '20'); addShiftVal('2.9', 'CẦN THƠ', '0', '0'); addShiftVal('2.9', 'HCM', '30', '30');
            addShiftVal('2.10', 'TÂY HỒ', '15', '15'); addShiftVal('2.10', 'BA ĐÌNH', '10', '10'); addShiftVal('2.10', 'THANH XUÂN', '10', '10'); addShiftVal('2.10', 'VĨNH PHÚC', '30', '30'); addShiftVal('2.10', 'THANH HOÁ', '20', '20'); addShiftVal('2.10', 'CẦN THƠ', '0', '0');
            addShiftVal('2.11', 'TÂY HỒ', '30', '30'); addShiftVal('2.11', 'BA ĐÌNH', '30', '30'); addShiftVal('2.11', 'THANH XUÂN', '20', '30');

            entries.push({ itemId: 'notes', facility: 'THANH XUÂN', shift: 'Full', value: '-Thiếu chuyên khoa ngoại\n• Thứ hai đến thứ sáu: Từ 120 chỉ định chụp XQ đề xuất 01 xe XQ\n• Thứ bảy và chủ nhật: Từ 90 chỉ định chụp XQ thêm 01 xe chụp XQ' });
            entries.push({ itemId: 'notes', facility: 'CẦU GIẤY', shift: 'Full', value: 'Thiếu CK tai mũi họng, răng hàm mặt, da liễu, không nhận khám Nội\n=>Chỉ nhận triển khai với số lượng khám tổng quát từ 30 KH trở lên nếu khám ghép, trường hợp số lượng khám tổng quát nhỏ hơn 30 KH thì yêu cầu phải được hạch toán cả kíp trong PAKD' });
            entries.push({ itemId: 'notes', facility: 'THANH HOÁ', shift: 'Full', value: 'Thiếu Ngoại, da liễu, Răng Hàm Mặt.' });
            entries.push({ itemId: 'notes', facility: 'CẦN THƠ', shift: 'Full', value: 'Thiếu TMH, RHM, Sản' });

            const r3Data = { 'TÂY HỒ': 'Nguyễn Thị Hưng\nLê Thị An', 'BA ĐÌNH': 'Nguyễn Ngọc Anh\nQuách Văn Dũng', 'THANH XUÂN': 'Đỗ Thúy Nết\nTrương Văn Quảng', 'CẦU GIẤY': 'Vũ Văn Minh\nNguyễn Hoàng Long', 'VĨNH PHÚC': 'Trần Văn Chinh', 'THANH HOÁ': 'Trương Tiến Hưng', 'CẦN THƠ': 'Nguyễn Ngọc Kim Anh', 'HCM': 'Phạm Thị Minh Tâm', 'NGHỆ AN': 'Phạm Tiến Thành', 'QUẢNG BÌNH': 'Nguyễn Diệu' };
            Object.keys(r3Data).forEach(f => entries.push({ itemId: '3', facility: f, shift: 'Full', value: r3Data[f] }));

            const r4Data = { 'TÂY HỒ': 'Hoàng Thùy Linh', 'BA ĐÌNH': 'Nguyễn Danh Tuấn Anh', 'THANH XUÂN': 'Trương Văn Quảng', 'CẦU GIẤY': 'Nguyễn Danh Tuấn Anh', 'VĨNH PHÚC': 'Nguyễn Thị Linh', 'THANH HOÁ': 'Nguyễn Minh Trang', 'CẦN THƠ': 'Nguyễn Ngọc Kim Anh', 'HCM': 'Phạm Thị Minh Tâm', 'NGHỆ AN': 'Phạm Tiến Thành', 'QUẢNG BÌNH': 'Nguyễn Diệu' };
            Object.keys(r4Data).forEach(f => entries.push({ itemId: '4', facility: f, shift: 'Full', value: r4Data[f] }));

            const r6Data = { 'TÂY HỒ': 'TP Huyền\nPGĐ Thủy', 'BA ĐÌNH': 'TP Thắng', 'THANH XUÂN': 'TP Thắng', 'CẦU GIẤY': 'TP Thắng' };
            Object.keys(r6Data).forEach(f => entries.push({ itemId: '6', facility: f, shift: 'Full', value: r6Data[f] }));

            const r7Data = { 'TÂY HỒ': 'ĐDT Tuyền', 'BA ĐÌNH': 'ĐDT Thủy', 'THANH XUÂN': 'ĐDT Chềnh', 'CẦU GIẤY': 'HC Huyền' };
            Object.keys(r7Data).forEach(f => entries.push({ itemId: '7', facility: f, shift: 'Full', value: r7Data[f] }));

            const r8Data = { 'TÂY HỒ': 'GĐ Hải', 'BA ĐÌNH': 'GĐ Tuấn', 'THANH XUÂN': 'GĐ Năng', 'CẦU GIẤY': 'GĐ Xuân', 'VĨNH PHÚC': 'GĐ Nghiêm', 'THANH HOÁ': 'GĐ Hiệu', 'CẦN THƠ': 'GĐ Cường', 'HCM': 'GĐ Nguyên', 'NGHỆ AN': 'GĐ Thắng', 'QUẢNG BÌNH': 'GĐ Nghĩa' };
            Object.keys(r8Data).forEach(f => entries.push({ itemId: '8', facility: f, shift: 'Full', value: r8Data[f] }));

            return entries;
        },

        getConfigDinhMuc: function() {
            const data = localStorage.getItem(STORAGE_KEYS.CONFIG_DINH_MUC);
            if (!data) {
                const initial = {
                    'ngoai-vien': [
                        { id: 1, teamScale: 'Đoàn nhỏ (< 100 khách)', position: 'Bác sĩ Nội', minStaff: 1, maxStaff: 2, doctorToPatientRatio: '1 BS / 50 khách', note: 'Ca sáng gọn nhẹ', status: true },
                        { id: 2, teamScale: 'Đoàn vừa (100 - 300 khách)', position: 'Điều dưỡng lấy máu', minStaff: 3, maxStaff: 5, doctorToPatientRatio: '1 ĐD / 40 khách', note: 'Lấy mẫu sáng sớm', status: true },
                        { id: 3, teamScale: 'Đoàn lớn (300 - 800 khách)', position: 'Bác sĩ Siêu âm', minStaff: 2, maxStaff: 4, doctorToPatientRatio: '1 BS / 100 khách', note: 'Mang theo máy SA lưu động', status: true }
                    ],
                    'chuyen-khoa': [
                        { id: 1, category: 'Khám Mắt & Đo thị lực', deployForm: 'Tại viện', specialtyPosition: 'Bác sĩ Chuyên khoa Mắt', maxStaff: 2, note: 'Bác sĩ có chứng chỉ khúc xạ', status: true },
                        { id: 2, category: 'Đo Chức năng hô hấp', deployForm: 'Ngoại viện', specialtyPosition: 'Kỹ thuật viên Phế dung', maxStaff: 2, note: 'Khám đoàn lưu động', status: true }
                    ],
                    'kiem-nhiem': [
                        { id: 1, dualPosition: 'Trưởng kíp khám lưu động', primaryPosition: 'Bác sĩ Nội khoa', maxShiftsPerWeek: 4, dualAllowance: '300,000 đ/ca', note: 'Quản lý chuyên môn & đoàn', status: true },
                        { id: 2, dualPosition: 'Hỗ trợ đo sinh hiệu', primaryPosition: 'Điều dưỡng', maxShiftsPerWeek: 6, dualAllowance: '150,000 đ/ca', note: 'Kiêm đo huyết áp & thể lực', status: true }
                    ],
                    'dieu-phoi-bkh': [
                        { id: 1, teamLevel: 'Đoàn loại A (VIP / > 1000 khách)', completionTimeframe: 'Trước 3 ngày', maxTeamsPerOfficerPerDay: 2, reserveStaffRatio: '15 % dự phòng', note: 'Yêu cầu duyệt kế hoạch sớm', status: true },
                        { id: 2, teamLevel: 'Đoàn loại B (200 - 1000 khách)', completionTimeframe: 'Trước 2 ngày', maxTeamsPerOfficerPerDay: 4, reserveStaffRatio: '10 % dự phòng', note: 'Khám định kỳ doanh nghiệp', status: true }
                    ]
                };
                this.saveConfigDinhMuc(initial);
                return initial;
            }
            try { return JSON.parse(data); } catch(e) { return {}; }
        },
        saveConfigDinhMuc: function(allData) {
            localStorage.setItem(STORAGE_KEYS.CONFIG_DINH_MUC, JSON.stringify(allData));
            window.dispatchEvent(new CustomEvent('mwk_config_dinh_muc_changed', { detail: allData }));
        },
        getQuotaByTab: function(tabKey) {
            const allData = this.getConfigDinhMuc();
            return allData[tabKey] || [];
        },
        updateQuotaByTabCell: function(tabKey, itemId, field, newValue) {
            const allData = this.getConfigDinhMuc();
            if (!allData[tabKey]) return;
            const list = allData[tabKey];
            const item = list.find(i => i.id === parseInt(itemId));
            if (item) {
                item[field] = newValue;
                this.saveConfigDinhMuc(allData);
            }
        },

        getKiemNhiemMatrixData: function() {
            const raw = localStorage.getItem(STORAGE_KEYS.MATRIX_DINH_MUC_KIEM_NHIEM);
            if (raw) {
                try { return JSON.parse(raw); } catch(e) {}
            }

            const initialData = {
                groups: [
                    { id: 'g1', name: 'Lấy máu' },
                    { id: 'g2', name: 'Lấy máu + Khám' },
                    { id: 'g3', name: 'Khám' }
                ],
                sttItems: [
                    { id: 's1', groupId: 'g1', stt: 1, customerCount: 'Dưới 15' },
                    { id: 's2', groupId: 'g1', stt: 2, customerCount: 'Từ 16-30' },
                    { id: 's3', groupId: 'g1', stt: 3, customerCount: 'Từ 31-50' },
                    { id: 's4', groupId: 'g1', stt: 4, customerCount: 'Từ 51-80' },
                    { id: 's5', groupId: 'g1', stt: 5, customerCount: 'Từ 80 trở đi' },

                    { id: 's6', groupId: 'g2', stt: 6, customerCount: 'Từ 30-50' },
                    { id: 's7', groupId: 'g2', stt: 7, customerCount: 'Từ 51-100' },
                    { id: 's8', groupId: 'g2', stt: 8, customerCount: 'Trên 100' },

                    { id: 's9', groupId: 'g3', stt: 9, customerCount: 'Từ 30-50' },
                    { id: 's10', groupId: 'g3', stt: 10, customerCount: 'Từ 51-100' },
                    { id: 's11', groupId: 'g3', stt: 11, customerCount: 'Trên 100' }
                ],
                columns: [
                    { id: 'cbtk', name: 'CBTK', type: 'number' },
                    { id: 'bs_tu_van', name: 'Bác sĩ tư vấn đầu vào', type: 'number' },
                    { id: 'phat_ho_so', name: 'Phát hồ sơ', type: 'number' },
                    { id: 'nhap_lieu', name: 'Nhập liệu', type: 'number' },
                    { id: 'thu_ngan', name: 'Thu ngân', type: 'number' },
                    { id: 'lay_mau', name: 'Lấy máu', type: 'number' },
                    { id: 'luu_y', name: 'Lưu ý', type: 'textarea', isLast: true }
                ],
                entries: {
                    "s1_tn_cbtk": 1, "s1_tn_bs_tu_van": 0, "s1_tn_phat_ho_so": 1, "s1_tn_nhap_lieu": 1, "s1_tn_thu_ngan": 1, "s1_tn_lay_mau": 2, "s1_tn_luu_y": "Chuẩn bị mẫu trước 30p",
                    "s1_ktn_cbtk": 1, "s1_ktn_bs_tu_van": 0, "s1_ktn_phat_ho_so": 1, "s1_ktn_nhap_lieu": 1, "s1_ktn_thu_ngan": 0, "s1_ktn_lay_mau": 1, "s1_ktn_luu_y": "",
                    "s2_tn_cbtk": 1, "s2_tn_bs_tu_van": 1, "s2_tn_phat_ho_so": 1, "s2_tn_nhap_lieu": 1, "s2_tn_thu_ngan": 1, "s2_tn_lay_mau": 2,
                    "s3_tn_cbtk": 2, "s3_tn_bs_tu_van": 1, "s3_tn_phat_ho_so": 2, "s3_tn_nhap_lieu": 2, "s3_tn_thu_ngan": 1, "s3_tn_lay_mau": 3,
                    "s6_tn_cbtk": 2, "s6_tn_bs_tu_van": 2, "s6_tn_phat_ho_so": 2, "s6_tn_nhap_lieu": 2, "s6_tn_thu_ngan": 1, "s6_tn_lay_mau": 3,
                    "s9_tn_cbtk": 2, "s9_tn_bs_tu_van": 2, "s9_tn_phat_ho_so": 2, "s9_tn_nhap_lieu": 2, "s9_tn_thu_ngan": 1, "s9_tn_lay_mau": 0
                }
            };
            this.saveKiemNhiemMatrixData(initialData);
            return initialData;
        },

        saveKiemNhiemMatrixData: function(data) {
            localStorage.setItem(STORAGE_KEYS.MATRIX_DINH_MUC_KIEM_NHIEM, JSON.stringify(data));
            window.dispatchEvent(new CustomEvent('mwk_matrix_kiem_nhiem_changed', { detail: data }));
        },

        getBkhMatrixData: function() {
            const raw = localStorage.getItem(STORAGE_KEYS.MATRIX_DINH_MUC_DIEU_PHOI_BKH);
            if (raw) {
                try { return JSON.parse(raw); } catch(e) {}
            }

            const initialData = {
                doctorSpecialties: [
                    { id: 'bkh_doc_1', name: 'Tư vấn đầu vào', maxCapacity: '15', note: 'Tổng <=45 KH' },
                    { id: 'bkh_doc_2', name: 'Tư vấn đầu ra', maxCapacity: '10', note: '' },
                    { id: 'bkh_doc_3', name: 'Nội', maxCapacity: '20', note: '' },
                    { id: 'bkh_doc_4', name: 'Ngoại', maxCapacity: '6', note: '' },
                    { id: 'bkh_doc_5', name: 'Sản', maxCapacity: '5', note: '' },
                    { id: 'bkh_doc_6', name: 'Nhi', maxCapacity: '2', note: '' },
                    { id: 'bkh_doc_7', name: 'TMH', maxCapacity: '8', note: '' },
                    { id: 'bkh_doc_8', name: 'TMH Nội soi', maxCapacity: '4', note: '' },
                    { id: 'bkh_doc_9', name: 'RHM', maxCapacity: '8', note: '' },
                    { id: 'bkh_doc_10', name: 'Mắt', maxCapacity: '8', note: '' },
                    { id: 'bkh_doc_11', name: 'Da liễu', maxCapacity: '10', note: '' },
                    { id: 'bkh_doc_12', name: 'CĐHA', maxCapacity: '20', note: '' },
                    { id: 'bkh_doc_13', name: 'CĐHA Mạch', maxCapacity: '2', note: '' },
                    { id: 'bkh_doc_14', name: 'CĐHA Tim', maxCapacity: '2', note: '' },
                    { id: 'bkh_doc_15', name: 'CĐHA (Tim, mạch)', maxCapacity: '0', note: '' },
                    { id: 'bkh_doc_16', name: 'Tiêm chủng', maxCapacity: '2', note: 'Tổng có 4 CTV tiêm chủng' }
                ],
                nurseTechnicians: [
                    { id: 'bkh_nur_1', name: 'Thu ngân, nhập liệu', maxCapacity: '12 (NV MED)', note: '' },
                    { id: 'bkh_nur_2', name: 'Tiếp đón', maxCapacity: '25 (10 cb đạt tiếp đón)', note: '' },
                    { id: 'bkh_nur_3', name: 'Phát hồ sơ tại viện', maxCapacity: '12 (nhân viên PKSK)', note: '' },
                    { id: 'bkh_nur_4', name: 'Phát hồ sơ ngoại viện', maxCapacity: '30', note: '' },
                    { id: 'bkh_nur_5', name: 'Lấy mẫu', maxCapacity: '50', note: '' },
                    { id: 'bkh_nur_6', name: 'Phụ nội soi TMH', maxCapacity: '4 (phụ tại viện:1, ngoại viện:3)', note: '' },
                    { id: 'bkh_nur_7', name: 'Phụ nội soi CTC', maxCapacity: '4', note: '' },
                    { id: 'bkh_nur_8', name: 'Phụ khám sản', maxCapacity: '6', note: '' },
                    { id: 'bkh_nur_9', name: 'Điện tim', maxCapacity: '10', note: '' },
                    { id: 'bkh_nur_10', name: 'Chỉ mắt + đo TKX', maxCapacity: '14 (đo tkx 4)', note: '' },
                    { id: 'bkh_nur_11', name: 'KTV XQ', maxCapacity: '10', note: '' },
                    { id: 'bkh_nur_12', name: 'Phụ siêu âm viết tay', maxCapacity: '20', note: '' },
                    { id: 'bkh_nur_13', name: 'Phụ đánh máy siêu âm', maxCapacity: '20', note: '' },
                    { id: 'bkh_nur_14', name: 'Điện não', maxCapacity: 'ko có NS CTV', note: '' },
                    { id: 'bkh_nur_15', name: 'Đo LHN', maxCapacity: '2', note: '' },
                    { id: 'bkh_nur_16', name: 'Đo loãng xương', maxCapacity: '2', note: '' },
                    { id: 'bkh_nur_17', name: 'Tiêm chủng', maxCapacity: '2', note: '' },
                    { id: 'bkh_nur_18', name: 'Đo thính lực', maxCapacity: '1 (nhân viên med hoặc thuê kcbnn)', note: '' },
                    { id: 'bkh_nur_19', name: 'Cân đo', maxCapacity: '25', note: '' }
                ]
            };
            this.saveBkhMatrixData(initialData);
            return initialData;
        },

        saveBkhMatrixData: function(data) {
            localStorage.setItem(STORAGE_KEYS.MATRIX_DINH_MUC_DIEU_PHOI_BKH, JSON.stringify(data));
            window.dispatchEvent(new CustomEvent('mwk_matrix_bkh_changed', { detail: data }));
        },

        getChuyenKhoaMatrixData: function() {
            const raw = localStorage.getItem(STORAGE_KEYS.MATRIX_DINH_MUC_CHUYEN_KHOA);
            if (raw) {
                try { return JSON.parse(raw); } catch(e) {}
            }

            const initialData = {
                thuongQuy: {
                    customerGroups: [
                        { id: 'truong_hoc', name: 'Trường học' },
                        { id: 'doanh_nghiep', name: 'Cơ quan & Doanh nghiệp' },
                        { id: 'ngan_hang', name: 'Khối ngân hàng' },
                        { id: 'khu_cong_nghiep', name: 'Khu công nghiệp' }
                    ],
                    items: [
                        {
                            id: 'tq_1',
                            category: 'BS Nội tư vấn đầu vào',
                            values: {
                                "truong_hoc_sang": "70-90", "truong_hoc_chieu": "50-70", "truong_hoc_ca_ngay": "120-160",
                                "doanh_nghiep_sang": "80-100", "doanh_nghiep_chieu": "60-80", "doanh_nghiep_ca_ngay": "140-180",
                                "ngan_hang_sang": "60-80", "ngan_hang_chieu": "40-60", "ngan_hang_ca_ngay": "100-140",
                                "khu_cong_nghiep_sang": "100-120", "khu_cong_nghiep_chieu": "80-100", "khu_cong_nghiep_ca_ngay": "180-220"
                            },
                            note: "Kế toán thu ngân theo số lượng BS"
                        },
                        {
                            id: 'tq_2',
                            category: 'Khám Nội tổng quát',
                            values: {
                                "truong_hoc_sang": "60-80", "truong_hoc_chieu": "40-60", "truong_hoc_ca_ngay": "100-140",
                                "doanh_nghiep_sang": "70-90", "doanh_nghiep_chieu": "50-70", "doanh_nghiep_ca_ngay": "120-160",
                                "ngan_hang_sang": "50-70", "ngan_hang_chieu": "30-50", "ngan_hang_ca_ngay": "80-120",
                                "khu_cong_nghiep_sang": "90-110", "khu_cong_nghiep_chieu": "70-90", "khu_cong_nghiep_ca_ngay": "160-200"
                            },
                            note: "Điều dưỡng hỗ trợ đo huyết áp"
                        },
                        {
                            id: 'tq_3',
                            category: 'Khám Tai Mũi Họng',
                            values: {
                                "truong_hoc_sang": "50-70", "truong_hoc_chieu": "30-50", "truong_hoc_ca_ngay": "80-120",
                                "doanh_nghiep_sang": "60-80", "doanh_nghiep_chieu": "40-60", "doanh_nghiep_ca_ngay": "100-140",
                                "ngan_hang_sang": "40-60", "ngan_hang_chieu": "20-40", "ngan_hang_ca_ngay": "60-100",
                                "khu_cong_nghiep_sang": "80-100", "khu_cong_nghiep_chieu": "60-80", "khu_cong_nghiep_ca_ngay": "140-180"
                            },
                            note: "Phụ soi TMH tại chỗ"
                        },
                        {
                            id: 'tq_4',
                            category: 'Khám Mắt & Đo thị lực',
                            values: {
                                "truong_hoc_sang": "60-80", "truong_hoc_chieu": "40-60", "truong_hoc_ca_ngay": "100-140",
                                "doanh_nghiep_sang": "60-80", "doanh_nghiep_chieu": "40-60", "doanh_nghiep_ca_ngay": "100-140",
                                "ngan_hang_sang": "50-70", "ngan_hang_chieu": "30-50", "ngan_hang_ca_ngay": "80-120",
                                "khu_cong_nghiep_sang": "70-90", "khu_cong_nghiep_chieu": "50-70", "khu_cong_nghiep_ca_ngay": "120-160"
                            },
                            note: "KTV đo khúc xạ phụ"
                        },
                        {
                            id: 'tq_5',
                            category: 'Khám Răng Hàm Mặt',
                            values: {
                                "truong_hoc_sang": "50-70", "truong_hoc_chieu": "30-50", "truong_hoc_ca_ngay": "80-120",
                                "doanh_nghiep_sang": "50-70", "doanh_nghiep_chieu": "30-50", "doanh_nghiep_ca_ngay": "80-120",
                                "ngan_hang_sang": "40-60", "ngan_hang_chieu": "20-40", "ngan_hang_ca_ngay": "60-100",
                                "khu_cong_nghiep_sang": "60-80", "khu_cong_nghiep_chieu": "40-60", "khu_cong_nghiep_ca_ngay": "100-140"
                            },
                            note: "Yêu cầu bộ dụng cụ khám vô trùng"
                        }
                    ]
                },
                tieuHoa: {
                    facilities: [
                        { id: 'ba_dinh', name: 'Ba Đình' },
                        { id: 'tay_ho', name: 'Tây Hồ' },
                        { id: 'thanh_xuan', name: 'Thanh Xuân' },
                        { id: 'cau_giay', name: 'Cầu Giấy' }
                    ],
                    items: [
                        {
                            id: 'th_1',
                            service: 'Nội soi dạ dày thường',
                            values: {
                                "ba_dinh_cong_suat": "20", "ba_dinh_thuc_hien": "10", "ba_dinh_du_kien_du": "10", "ba_dinh_ghi_chu": "Nội soi sớm nhất từ 7h",
                                "tay_ho_cong_suat": "10", "tay_ho_thuc_hien": "3", "tay_ho_du_kien_du": "7", "tay_ho_ghi_chu": "",
                                "thanh_xuan_cong_suat": "5", "thanh_xuan_thuc_hien": "2", "thanh_xuan_du_kien_du": "3", "thanh_xuan_ghi_chu": "",
                                "cau_giay_cong_suat": "10", "cau_giay_thuc_hien": "2", "cau_giay_du_kien_du": "8", "cau_giay_ghi_chu": ""
                            }
                        },
                        {
                            id: 'th_2',
                            service: 'Nội soi dạ dày gây mê',
                            values: {
                                "ba_dinh_cong_suat": "15", "ba_dinh_thuc_hien": "8", "ba_dinh_du_kien_du": "7", "ba_dinh_ghi_chu": "Bắt buộc BS gây mê",
                                "tay_ho_cong_suat": "8", "tay_ho_thuc_hien": "4", "tay_ho_du_kien_du": "4", "tay_ho_ghi_chu": "",
                                "thanh_xuan_cong_suat": "6", "thanh_xuan_thuc_hien": "3", "thanh_xuan_du_kien_du": "3", "thanh_xuan_ghi_chu": "",
                                "cau_giay_cong_suat": "12", "cau_giay_thuc_hien": "6", "cau_giay_du_kien_du": "6", "cau_giay_ghi_chu": ""
                            }
                        },
                        {
                            id: 'th_3',
                            service: 'Nội soi đại tràng gây mê',
                            values: {
                                "ba_dinh_cong_suat": "12", "ba_dinh_thuc_hien": "5", "ba_dinh_du_kien_du": "7", "ba_dinh_ghi_chu": "Làm sạch đại tràng trước",
                                "tay_ho_cong_suat": "6", "tay_ho_thuc_hien": "2", "tay_ho_du_kien_du": "4", "tay_ho_ghi_chu": "",
                                "thanh_xuan_cong_suat": "4", "thanh_xuan_thuc_hien": "1", "thanh_xuan_du_kien_du": "3", "thanh_xuan_ghi_chu": "",
                                "cau_giay_cong_suat": "8", "cau_giay_thuc_hien": "3", "cau_giay_du_kien_du": "5", "cau_giay_ghi_chu": ""
                            }
                        },
                        {
                            id: 'th_4',
                            service: 'Test hơi thở HP (C13/C14)',
                            values: {
                                "ba_dinh_cong_suat": "40", "ba_dinh_thuc_hien": "25", "ba_dinh_du_kien_du": "15", "ba_dinh_ghi_chu": "Nhịn ăn 4h trước test",
                                "tay_ho_cong_suat": "30", "tay_ho_thuc_hien": "15", "tay_ho_du_kien_du": "15", "tay_ho_ghi_chu": "",
                                "thanh_xuan_cong_suat": "20", "thanh_xuan_thuc_hien": "10", "thanh_xuan_du_kien_du": "10", "thanh_xuan_ghi_chu": "",
                                "cau_giay_cong_suat": "25", "cau_giay_thuc_hien": "12", "cau_giay_du_kien_du": "13", "cau_giay_ghi_chu": ""
                            }
                        }
                    ]
                }
            };
            this.saveChuyenKhoaMatrixData(initialData);
            return initialData;
        },

        saveChuyenKhoaMatrixData: function(data) {
            localStorage.setItem(STORAGE_KEYS.MATRIX_DINH_MUC_CHUYEN_KHOA, JSON.stringify(data));
            window.dispatchEvent(new CustomEvent('mwk_matrix_chuyen_khoa_changed', { detail: data }));
        },

        getNgoaiVienMatrixData: function() {
            const raw = localStorage.getItem(STORAGE_KEYS.MATRIX_DINH_MUC_NGOAI_VIEN);
            if (raw) {
                try { return JSON.parse(raw); } catch(e) {}
            }

            const initialData = {
                areas: [
                    {
                        id: 'ha_noi',
                        name: 'Khu vực Hà Nội',
                        subColumns: [
                            { id: 'cbtk_max', name: 'Số lượng nhân sự CBTK ngoại viện tối đa' },
                            { id: 'so_doan_ngay', name: 'Số đoàn/ngày có thể triển khai' },
                            { id: 'so_kh_buoi', name: 'Số lượng KH/buổi tương ứng' }
                        ]
                    },
                    {
                        id: 'vinh_phuc',
                        name: 'Vĩnh Phúc',
                        subColumns: [
                            { id: 'so_doan_ngay', name: 'Số đoàn/ngày có thể triển khai' },
                            { id: 'so_kh_buoi', name: 'Số lượng KH/buổi tương ứng' }
                        ]
                    },
                    {
                        id: 'thanh_hoa',
                        name: 'Thanh Hóa',
                        subColumns: [
                            { id: 'so_doan_ngay', name: 'Số đoàn/ngày có thể triển khai' },
                            { id: 'so_kh_buoi', name: 'Số lượng KH/buổi tương ứng' }
                        ]
                    },
                    {
                        id: 'hcm',
                        name: 'HCM',
                        subColumns: [
                            { id: 'so_doan_ngay', name: 'Số đoàn/ngày có thể triển khai' },
                            { id: 'so_kh_buoi', name: 'Số lượng KH/buổi tương ứng' }
                        ]
                    },
                    {
                        id: 'can_tho',
                        name: 'Cần Thơ',
                        subColumns: [
                            { id: 'so_doan_ngay', name: 'Số đoàn/ngày có thể triển khai' },
                            { id: 'so_kh_buoi', name: 'Số lượng KH/buổi tương ứng' }
                        ]
                    }
                ],
                items: [
                    {
                        id: 'nv_1',
                        targetName: 'Nhân sự phòng triển khai',
                        values: {
                            "ha_noi_cbtk_max": "13-15", "ha_noi_so_doan_ngay": "13-15", "ha_noi_so_kh_buoi": "1300-1500",
                            "vinh_phuc_so_doan_ngay": "3-5", "vinh_phuc_so_kh_buoi": "300-500",
                            "thanh_hoa_so_doan_ngay": "2-4", "thanh_hoa_so_kh_buoi": "200-400",
                            "hcm_so_doan_ngay": "5-7", "hcm_so_kh_buoi": "500-700",
                            "can_tho_so_doan_ngay": "2-3", "can_tho_so_kh_buoi": "200-300"
                        },
                        note: "Áp dụng cho ngày cao điểm"
                    },
                    {
                        id: 'nv_2',
                        targetName: 'Số đoàn/ngày',
                        values: {
                            "ha_noi_cbtk_max": "13-15", "ha_noi_so_doan_ngay": "13-15", "ha_noi_so_kh_buoi": "1300-1500",
                            "vinh_phuc_so_doan_ngay": "3-5", "vinh_phuc_so_kh_buoi": "300-500",
                            "thanh_hoa_so_doan_ngay": "2-4", "thanh_hoa_so_kh_buoi": "200-400",
                            "hcm_so_doan_ngay": "5-7", "hcm_so_kh_buoi": "500-700",
                            "can_tho_so_doan_ngay": "2-3", "can_tho_so_kh_buoi": "200-300"
                        },
                        note: "Tính cả đoàn lưu động"
                    },
                    {
                        id: 'nv_3',
                        targetName: 'Số lượng KH/buổi',
                        values: {
                            "ha_noi_cbtk_max": "1300-1500", "ha_noi_so_doan_ngay": "1300-1500", "ha_noi_so_kh_buoi": "1300-1500",
                            "vinh_phuc_so_doan_ngay": "300-500", "vinh_phuc_so_kh_buoi": "300-500",
                            "thanh_hoa_so_doan_ngay": "200-400", "thanh_hoa_so_kh_buoi": "200-400",
                            "hcm_so_doan_ngay": "500-700", "hcm_so_kh_buoi": "500-700",
                            "can_tho_so_doan_ngay": "200-300", "can_tho_so_kh_buoi": "200-300"
                        },
                        note: "Trung bình 100 KH/ca"
                    }
                ],
                businessNotes: "Số lượng đoàn nhỏ dưới 25 KH...\n5-10 nhân sự tương đương 5-10 điểm hoạt động"
            };
            this.saveNgoaiVienMatrixData(initialData);
            return initialData;
        },

        saveNgoaiVienMatrixData: function(data) {
            localStorage.setItem(STORAGE_KEYS.MATRIX_DINH_MUC_NGOAI_VIEN, JSON.stringify(data));
            window.dispatchEvent(new CustomEvent('mwk_matrix_ngoai_vien_changed', { detail: data }));
        },

        // --- DỰ KIẾN LỊCH KSK (PLANNING CALENDAR) ---
        getPlannedSchedules: function() {
            const data = localStorage.getItem('mwk_planned_schedules');
            if (data) {
                try {
                    const parsed = JSON.parse(data);
                    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
                } catch(e) {}
            }
            const seed = this.getSeedPlannedSchedules();
            this.savePlannedSchedules(seed);
            return seed;
        },
        savePlannedSchedules: function(list) {
            localStorage.setItem('mwk_planned_schedules', JSON.stringify(list));
            window.dispatchEvent(new CustomEvent('mwk_planned_schedules_changed', { detail: list }));
        },
        addPlannedSchedule: function(item) {
            const list = this.getPlannedSchedules();
            const newId = list.length > 0 ? Math.max(...list.map(s => parseInt(s.id) || 0)) + 1 : 1;
            const newItem = { id: newId, ...item };
            list.unshift(newItem);
            this.savePlannedSchedules(list);
            return newId;
        },
        getPlannedScheduleById: function(id) {
            const list = this.getPlannedSchedules();
            return list.find(s => String(s.id) === String(id));
        },
        getSeedPlannedSchedules: function() {
            const now = new Date();
            const dayOfWeek = now.getDay();
            const distanceToMon = (dayOfWeek + 6) % 7;
            const monDate = new Date(now);
            monDate.setDate(now.getDate() - distanceToMon);

            function getDateStr(offsetDays) {
                const d = new Date(monDate);
                d.setDate(monDate.getDate() + offsetDays);
                const yyyy = d.getFullYear();
                const mm = String(d.getMonth() + 1).padStart(2, '0');
                const dd = String(d.getDate()).padStart(2, '0');
                return `${yyyy}-${mm}-${dd}`;
            }

            return [
                {
                    id: 1,
                    tenDonVi: "Công ty CP Tập đoàn FPT",
                    customerCode: "FPT-2026",
                    contactPerson: "Nguyễn Vũ Mạnh Cường",
                    contactPhone: "0912345678",
                    ngayKham: getDateStr(0),
                    ca: "Sang",
                    gioBatDau: "07:30",
                    gioKetThuc: "11:00",
                    loaiLich: "Lịch tại viện",
                    coSo: "MEDLATEC Ba Đình",
                    diaDiemKham: "42-44 Nghĩa Dũng, Phúc Xá, Ba Đình, Hà Nội",
                    soLuongKhach: 250,
                    tongNhanSu: 26,
                    cbPhuTrach: "Nguyễn Văn An",
                    trangThai: "Dự kiến",
                    generalNote: "Đoàn khám định kỳ hàng năm cho 250 cán bộ nhân viên FPT Software.",
                    requestNote: "Bố trí lối đi ưu tiên và tiếp đón riêng tại Tầng 2."
                },
                {
                    id: 2,
                    tenDonVi: "Ngân hàng VPBank - Chi nhánh Đông Đô",
                    customerCode: "VPB-2026",
                    contactPerson: "Trần Thị Mai",
                    contactPhone: "0987654321",
                    ngayKham: getDateStr(0),
                    ca: "Chieu",
                    gioBatDau: "13:30",
                    gioKetThuc: "17:00",
                    loaiLich: "Lịch ngoại viện",
                    coSo: "Ngoại viện",
                    diaDiemKham: "Tòa nhà VPBank Tower, 89 Láng Hạ, Đống Đa, Hà Nội",
                    soLuongKhach: 180,
                    tongNhanSu: 18,
                    cbPhuTrach: "Lê Hoàng Nam",
                    trangThai: "Chờ xác nhận",
                    generalNote: "Khám sức khỏe tổng quát ngoại viện cho cán bộ khối ngân hàng.",
                    requestNote: "Mang theo xe khám lưu động X-quang kỹ thuật số."
                },
                {
                    id: 3,
                    tenDonVi: "Công ty TNHH Phần mềm MISA",
                    customerCode: "MISA-2026",
                    contactPerson: "Phạm Quốc Huy",
                    contactPhone: "0904112233",
                    ngayKham: getDateStr(1),
                    ca: "Sang",
                    gioBatDau: "07:30",
                    gioKetThuc: "11:30",
                    loaiLich: "Lịch tại viện",
                    coSo: "MEDLATEC Tây Hồ",
                    diaDiemKham: "99 Trích Sài, Tây Hồ, Hà Nội",
                    soLuongKhach: 120,
                    tongNhanSu: 15,
                    cbPhuTrach: "Nguyễn Văn An",
                    trangThai: "Dự kiến",
                    generalNote: "Đoàn lập trình viên và khối văn phòng.",
                    requestNote: "Bổ sung gói siêu âm tuyến giáp cho nhân viên nữ."
                },
                {
                    id: 4,
                    tenDonVi: "Tổng Công ty Điện lực Hà Nội (EVN HANOI)",
                    customerCode: "EVN-2026",
                    contactPerson: "Hoàng Văn Tuấn",
                    contactPhone: "0936778899",
                    ngayKham: getDateStr(1),
                    ca: "Sang",
                    gioBatDau: "08:00",
                    gioKetThuc: "11:30",
                    loaiLich: "Lịch ngoại viện",
                    coSo: "Ngoại viện",
                    diaDiemKham: "Trụ sở EVN HANOI, 69 Đinh Tiên Hoàng, Hoàn Kiếm, Hà Nội",
                    soLuongKhach: 310,
                    tongNhanSu: 30,
                    cbPhuTrach: "Trần Văn Bình",
                    trangThai: "Đã khoanh vùng",
                    generalNote: "Khám sức khỏe nghề nghiệp định kỳ đợt 1.",
                    requestNote: "Bố trí kíp xét nghiệm độc hại và đo chức năng hô hấp."
                },
                {
                    id: 5,
                    tenDonVi: "UBND Phường Phúc Xá",
                    customerCode: "PX-2026",
                    contactPerson: "Nguyễn Thị Hoa",
                    contactPhone: "0915443322",
                    ngayKham: getDateStr(1),
                    ca: "Chieu",
                    gioBatDau: "13:30",
                    gioKetThuc: "17:00",
                    loaiLich: "Lịch phường",
                    coSo: "MEDLATEC Ba Đình",
                    diaDiemKham: "Trạm Y tế Phường Phúc Xá, Ba Đình, Hà Nội",
                    soLuongKhach: 90,
                    tongNhanSu: 10,
                    cbPhuTrach: "Lê Hoàng Nam",
                    trangThai: "Dự kiến",
                    generalNote: "Khám sức khỏe cộng đồng cho cán bộ phường và người cao tuổi.",
                    requestNote: "Chuẩn bị mẫu phiếu tư vấn sức khỏe người cao tuổi."
                },
                {
                    id: 6,
                    tenDonVi: "Tập đoàn Vingroup - VinFast",
                    customerCode: "VIN-2026",
                    contactPerson: "Vũ Minh Anh",
                    contactPhone: "0978990011",
                    ngayKham: getDateStr(2),
                    ca: "Sang",
                    gioBatDau: "07:30",
                    gioKetThuc: "11:30",
                    loaiLich: "Lịch tại viện",
                    coSo: "MEDLATEC Ba Đình",
                    diaDiemKham: "42-44 Nghĩa Dũng, Phúc Xá, Ba Đình, Hà Nội",
                    soLuongKhach: 450,
                    tongNhanSu: 42,
                    cbPhuTrach: "Nguyễn Văn An",
                    trangThai: "Dự kiến",
                    generalNote: "Khám sức khỏe quy mô lớn cho cán bộ quản lý và kỹ sư VinFast.",
                    requestNote: "Yêu cầu mở 4 bàn khám nội và 3 máy siêu âm đồng thời."
                },
                {
                    id: 7,
                    tenDonVi: "Công ty Cổ phần Xây dựng Coteccons",
                    customerCode: "CTC-2026",
                    contactPerson: "Đỗ Văn Hùng",
                    contactPhone: "0909887766",
                    ngayKham: getDateStr(2),
                    ca: "Chieu",
                    gioBatDau: "13:30",
                    gioKetThuc: "17:00",
                    loaiLich: "Lịch ngoại viện",
                    coSo: "Ngoại viện",
                    diaDiemKham: "Công trường Coteccons, Nam Từ Liêm, Hà Nội",
                    soLuongKhach: 150,
                    tongNhanSu: 16,
                    cbPhuTrach: "Trần Văn Bình",
                    trangThai: "Chờ xác nhận",
                    generalNote: "Khám sức khỏe kỹ sư công trường.",
                    requestNote: "Cần cabin đo thính lực lưu động."
                },
                {
                    id: 8,
                    tenDonVi: "Tổng Công ty Bưu điện Việt Nam (VNPost)",
                    customerCode: "VNP-2026",
                    contactPerson: "Nguyễn Kim Ngân",
                    contactPhone: "0945667788",
                    ngayKham: getDateStr(2),
                    ca: "CaNgay",
                    gioBatDau: "07:30",
                    gioKetThuc: "17:00",
                    loaiLich: "Phát sinh",
                    coSo: "MEDLATEC Thanh Xuân",
                    diaDiemKham: "Khuất Duy Tiến, Thanh Xuân, Hà Nội",
                    soLuongKhach: 200,
                    tongNhanSu: 22,
                    cbPhuTrach: "Lê Hoàng Nam",
                    trangThai: "Phát sinh đột xuất",
                    generalNote: "Lịch bổ sung đột xuất cho bưu tá giao hàng.",
                    requestNote: "Chia làm 2 kíp sáng và chiều phục vụ dồn dập."
                },
                {
                    id: 9,
                    tenDonVi: "Công ty TNHH Samsung Electronics Việt Nam",
                    customerCode: "SEV-2026",
                    contactPerson: "Nguyễn Thùy Linh",
                    contactPhone: "0966554433",
                    ngayKham: getDateStr(3),
                    ca: "Sang",
                    gioBatDau: "07:30",
                    gioKetThuc: "11:30",
                    loaiLich: "Lịch ngoại viện",
                    coSo: "Ngoại viện",
                    diaDiemKham: "KCN Yên Phong, Bắc Ninh",
                    soLuongKhach: 500,
                    tongNhanSu: 50,
                    cbPhuTrach: "Nguyễn Văn An",
                    trangThai: "Dự kiến",
                    generalNote: "Đoàn khám ngoại viện quy mô lớn 500 nhân sự.",
                    requestNote: "Hệ thống xét nghiệm tự động tại chỗ và kíp siêu âm 8 người."
                },
                {
                    id: 10,
                    tenDonVi: "Trường Đại học Bách Khoa Hà Nội",
                    customerCode: "BKHN-2026",
                    contactPerson: "PGS.TS Nguyễn Thanh Tùng",
                    contactPhone: "0912113355",
                    ngayKham: getDateStr(3),
                    ca: "Chieu",
                    gioBatDau: "13:30",
                    gioKetThuc: "17:00",
                    loaiLich: "Lịch tại viện",
                    coSo: "MEDLATEC Ba Đình",
                    diaDiemKham: "42-44 Nghĩa Dũng, Ba Đình, Hà Nội",
                    soLuongKhach: 160,
                    tongNhanSu: 18,
                    cbPhuTrach: "Lê Hoàng Nam",
                    trangThai: "Dự kiến",
                    generalNote: "Khám sức khỏe định kỳ cho Giảng viên và Nhà khoa học.",
                    requestNote: "Phục vụ trà cà phê tại khu vực phòng chờ VIP Tầng 3."
                },
                {
                    id: 11,
                    tenDonVi: "Tập đoàn Viễn thông Viettel",
                    customerCode: "VTL-2026",
                    contactPerson: "Đặng Tiến Dũng",
                    contactPhone: "0988112244",
                    ngayKham: getDateStr(4),
                    ca: "Sang",
                    gioBatDau: "07:30",
                    gioKetThuc: "11:30",
                    loaiLich: "Lịch tại viện",
                    coSo: "MEDLATEC Tây Hồ",
                    diaDiemKham: "99 Trích Sài, Tây Hồ, Hà Nội",
                    soLuongKhach: 280,
                    tongNhanSu: 28,
                    cbPhuTrach: "Nguyễn Văn An",
                    trangThai: "Dự kiến",
                    generalNote: "Đoàn khối công nghệ và trung tâm dữ liệu Viettel.",
                    requestNote: "Yêu cầu kết quả xét nghiệm gửi bản điện tử qua app."
                },
                {
                    id: 12,
                    tenDonVi: "Ngân hàng Techcombank",
                    customerCode: "TCB-2026",
                    contactPerson: "Lê Phương Thảo",
                    contactPhone: "0934556677",
                    ngayKham: getDateStr(4),
                    ca: "Chieu",
                    gioBatDau: "13:30",
                    gioKetThuc: "17:00",
                    loaiLich: "Lịch ngoại viện",
                    coSo: "Ngoại viện",
                    diaDiemKham: "Hội sở Techcombank, 6 Quang Trung, Hoàn Kiếm, Hà Nội",
                    soLuongKhach: 210,
                    tongNhanSu: 22,
                    cbPhuTrach: "Trần Văn Bình",
                    trangThai: "Dự kiến",
                    generalNote: "Khám ngoại viện cán bộ hội sở.",
                    requestNote: "Trang bị kíp lấy mẫu xét nghiệm nhanh."
                },
                {
                    id: 13,
                    tenDonVi: "Công ty Dược phẩm Traphaco",
                    customerCode: "TRA-2026",
                    contactPerson: "Bùi Thị Lan",
                    contactPhone: "0918776655",
                    ngayKham: getDateStr(5),
                    ca: "Sang",
                    gioBatDau: "07:30",
                    gioKetThuc: "11:30",
                    loaiLich: "Lịch tại viện",
                    coSo: "MEDLATEC Thanh Xuân",
                    diaDiemKham: "Khuất Duy Tiến, Thanh Xuân, Hà Nội",
                    soLuongKhach: 110,
                    tongNhanSu: 12,
                    cbPhuTrach: "Lê Hoàng Nam",
                    trangThai: "Dự kiến",
                    generalNote: "Đoàn cán bộ nghiên cứu dược phẩm.",
                    requestNote: "Thực hiện danh mục khám chuyên sâu mắt & hô hấp."
                },
                {
                    id: 14,
                    tenDonVi: "Bệnh viện Đa khoa Hồng Ngọc (Đối tác KSK)",
                    customerCode: "HN-2026",
                    contactPerson: "BS. Hoàng Văn Khánh",
                    contactPhone: "0902334455",
                    ngayKham: getDateStr(5),
                    ca: "Chieu",
                    gioBatDau: "13:30",
                    gioKetThuc: "17:00",
                    loaiLich: "Phát sinh",
                    coSo: "MEDLATEC Ba Đình",
                    diaDiemKham: "42-44 Nghĩa Dũng, Ba Đình, Hà Nội",
                    soLuongKhach: 85,
                    tongNhanSu: 10,
                    cbPhuTrach: "Nguyễn Văn An",
                    trangThai: "Phát sinh đột xuất",
                    generalNote: "Gửi mẫu và khám hỗ trợ dịch vụ kỹ thuật cao.",
                    requestNote: "Bố trí phòng chụp CT 128 dãy."
                }
            ];
        },

        // --- 8. CB DUYỆT LỊCH KSK (APPROVAL SCHEDULES STORE) ---
        getApprovalSchedules: function() {
            const data = localStorage.getItem(STORAGE_KEYS.APPROVAL_SCHEDULES);
            if (data) {
                try {
                    const parsed = JSON.parse(data);
                    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
                } catch(e) {}
            }
            const seed = this.getSeedApprovalSchedules();
            this.saveApprovalSchedules(seed);
            return seed;
        },
        saveApprovalSchedules: function(list) {
            localStorage.setItem(STORAGE_KEYS.APPROVAL_SCHEDULES, JSON.stringify(list));
            window.dispatchEvent(new CustomEvent('mwk_approval_schedules_changed', { detail: list }));
        },
        getSeedApprovalSchedules: function() {
            return [
                {
                    tongLichId: "TONG-09-2026-001",
                    tongLichType: "LICH_TUAN",
                    unitName: "Tập đoàn Công nghệ FPT",
                    contactPerson: "Nguyễn Vũ Mạnh Cường",
                    contactPhone: "0912345678",
                    examDate: "2026-09-10",
                    status: "DA_DUYET",
                    submittedAt: "2026-09-05T08:30:00.000Z",
                    submittedBy: "Trần Thị Mai (Cán bộ Tổng hợp)",
                    childSchedules: [
                        {
                            scheduleId: "SCH001",
                            tongLichId: "TONG-09-2026-001",
                            scheduleType: "LICH_TUAN",
                            loaiHinh: "Tại viện",
                            unitName: "Công ty Cổ phần Phần mềm MISA",
                            examDate: "2026-09-10",
                            session: "Sáng (07:30 - 11:30)",
                            quantity: 120,
                            facility: "MEDLATEC Ba Đình",
                            diaDiemKham: "42-44 Nghĩa Dũng, Ba Đình, Hà Nội",
                            personInCharge: "Nguyễn Văn An",
                            status: "DA_DUYET",
                            approvalStep: 2,
                            submittedAt: "2026-09-05T08:30:00.000Z",
                            submittedBy: "Trần Thị Mai (Cán bộ Tổng hợp)",
                            deadline: null,
                            isOverdue: false,
                            categories: ["Khám Nội tổng quát", "Siêu âm ổ bụng", "Lấy máu xét nghiệm", "Khám Mắt & Đo thị lực"],
                            locations: ["Tầng 6 - Phòng 601, 602"],
                            staffCount: 12,
                            history: [
                                { actor: "BGĐ Khối KSK", timestamp: "08:30 - 05/09/2026", action: "Phê duyệt Hoàn tất", details: "BGĐ Khối KSK phê duyệt." }
                            ]
                        },
                        {
                            scheduleId: "SCH002",
                            tongLichId: "TONG-09-2026-001",
                            scheduleType: "LICH_TUAN",
                            loaiHinh: "Tại viện",
                            unitName: "Công ty TNHH Hafele Việt Nam",
                            examDate: "2026-09-10",
                            session: "Sáng (07:30 - 11:30)",
                            quantity: 100,
                            facility: "MEDLATEC Ba Đình",
                            diaDiemKham: "42-44 Nghĩa Dũng, Ba Đình, Hà Nội",
                            personInCharge: "Lê Hoàng Nam",
                            status: "DA_DUYET",
                            approvalStep: 2,
                            submittedAt: "2026-09-05T08:30:00.000Z",
                            submittedBy: "Trần Thị Mai (Cán bộ Tổng hợp)",
                            deadline: null,
                            isOverdue: false,
                            categories: ["Khám Nội", "Khám Tai Mũi Họng", "Lấy máu xét nghiệm"],
                            locations: ["Tầng 6 - Phòng 601, 602"],
                            staffCount: 10,
                            history: [
                                { actor: "BGĐ Khối KSK", timestamp: "08:30 - 05/09/2026", action: "Phê duyệt Hoàn tất", details: "BGĐ Khối KSK phê duyệt." }
                            ]
                        },
                        {
                            scheduleId: "SCH003",
                            tongLichId: "TONG-09-2026-001",
                            scheduleType: "LICH_TUAN",
                            loaiHinh: "Tại viện",
                            unitName: "Công ty Cổ phần VCP",
                            examDate: "2026-09-10",
                            session: "Sáng (07:30 - 11:30)",
                            quantity: 80,
                            facility: "MEDLATEC Ba Đình",
                            diaDiemKham: "42-44 Nghĩa Dũng, Ba Đình, Hà Nội",
                            personInCharge: "Lê Hoàng Nam",
                            status: "DA_DUYET",
                            approvalStep: 2,
                            submittedAt: "2026-09-05T08:30:00.000Z",
                            submittedBy: "Trần Thị Mai (Cán bộ Tổng hợp)",
                            deadline: null,
                            isOverdue: false,
                            categories: ["Khám Nội", "Khám Mắt", "Khám Răng Hàm Mặt"],
                            locations: ["Tầng 6 - Phòng 601, 602"],
                            staffCount: 8,
                            history: [
                                { actor: "BGĐ Khối KSK", timestamp: "08:30 - 05/09/2026", action: "Phê duyệt Hoàn tất", details: "BGĐ Khối KSK phê duyệt." }
                            ]
                        }
                    ]
                },
                {
                    tongLichId: "TONG-09-2026-002",
                    tongLichType: "LICH_TUAN",
                    unitName: "Ngân hàng VPBank - Chi nhánh Đông Đô",
                    contactPerson: "Trần Thị Mai",
                    contactPhone: "0987654321",
                    examDate: "2026-09-14",
                    status: "DA_DUYET",
                    submittedAt: "2026-09-04T09:15:00.000Z",
                    submittedBy: "Trần Thị Mai (Cán bộ Tổng hợp)",
                    childSchedules: [
                        {
                            scheduleId: "SCH004",
                            tongLichId: "TONG-09-2026-002",
                            scheduleType: "LICH_TUAN",
                            loaiHinh: "Tại viện",
                            unitName: "Ngân hàng VPBank - Chi nhánh Đông Đô",
                            examDate: "2026-09-14",
                            session: "Sáng (07:30 - 11:30)",
                            quantity: 90,
                            facility: "MEDLATEC Cầu Giấy",
                            diaDiemKham: "99 Cầu Giấy, Hà Nội",
                            personInCharge: "Nguyễn Văn An",
                            status: "DANG_DUYET_BUOC_1",
                            approvalStep: 1,
                            submittedAt: "2026-09-04T09:15:00.000Z",
                            submittedBy: "Trần Thị Mai (Cán bộ Tổng hợp)",
                            deadline: "2026-09-09T12:00:00",
                            isOverdue: false,
                            categories: ["Khám Nội", "Siêu âm tuyến giáp", "Điện tâm đồ"],
                            locations: ["Tầng 2 PK Cầu Giấy"],
                            staffCount: 10,
                            history: [
                                { actor: "Trần Thị Mai (Cán bộ Tổng hợp)", timestamp: "09:15 - 04/09/2026", action: "Gửi CB Duyệt", details: "Khởi tạo luồng duyệt." }
                            ]
                        },
                        {
                            scheduleId: "SCH005",
                            tongLichId: "TONG-09-2026-002",
                            scheduleType: "LICH_TUAN",
                            loaiHinh: "Ngoại viện",
                            unitName: "Ngân hàng VPBank - Chi nhánh Đông Đô",
                            examDate: "2026-09-15",
                            session: "Sáng (07:30 - 11:30)",
                            quantity: 110,
                            facility: "Ngoại viện",
                            diaDiemKham: "VPBank Tower 89 Láng Hạ, Đống Đa, Hà Nội",
                            personInCharge: "Lê Hoàng Nam",
                            status: "DANG_DUYET_BUOC_1",
                            approvalStep: 1,
                            submittedAt: "2026-09-04T09:15:00.000Z",
                            submittedBy: "Trần Thị Mai (Cán bộ Tổng hợp)",
                            deadline: "2026-09-09T12:00:00",
                            isOverdue: false,
                            categories: ["Khám Nội", "X-quang KTS", "Lấy máu xét nghiệm"],
                            locations: ["Hội trường Tầng 3 VPBank Tower"],
                            staffCount: 12,
                            history: [
                                { actor: "Trần Thị Mai (Cán bộ Tổng hợp)", timestamp: "09:15 - 04/09/2026", action: "Gửi CB Duyệt", details: "Khởi tạo luồng duyệt." }
                            ]
                        },
                        {
                            scheduleId: "SCH006",
                            tongLichId: "TONG-09-2026-002",
                            scheduleType: "LICH_TUAN",
                            loaiHinh: "Tại viện",
                            unitName: "Ngân hàng VPBank - Chi nhánh Đông Đô",
                            examDate: "2026-09-16",
                            session: "Chiều (13:30 - 17:00)",
                            quantity: 60,
                            facility: "MEDLATEC Thanh Xuân",
                            diaDiemKham: "03 Khuất Duy Tiến, Thanh Xuân, Hà Nội",
                            personInCharge: "Trần Văn Bình",
                            status: "DANG_DUYET_BUOC_1",
                            approvalStep: 1,
                            submittedAt: "2026-09-04T09:15:00.000Z",
                            submittedBy: "Trần Thị Mai (Cán bộ Tổng hợp)",
                            deadline: "2026-09-09T12:00:00",
                            isOverdue: false,
                            categories: ["Khám Nội", "Siêu âm ổ bụng", "Khám Răng Hàm Mặt"],
                            locations: ["Tầng 1 PK Thanh Xuân"],
                            staffCount: 7,
                            history: [
                                { actor: "Trần Thị Mai (Cán bộ Tổng hợp)", timestamp: "09:15 - 04/09/2026", action: "Gửi CB Duyệt", details: "Khởi tạo luồng duyệt." }
                            ]
                        }
                    ]
                },
                {
                    tongLichId: "TONG-09-2026-003",
                    tongLichType: "LICH_PHAT_SINH",
                    unitName: "Tổng Công ty Điện lực Hà Nội (EVN HANOI)",
                    contactPerson: "Hoàng Văn Tuấn",
                    contactPhone: "0936778899",
                    examDate: "2026-09-10",
                    status: "DANG_DUYET_BUOC_2",
                    submittedAt: "2026-09-03T14:20:00.000Z",
                    submittedBy: "Phạm Quốc Huy (Cán bộ Tổng hợp)",
                    childSchedules: [
                        {
                            scheduleId: "SCH007",
                            tongLichId: "TONG-09-2026-003",
                            scheduleType: "LICH_PHAT_SINH",
                            loaiHinh: "Ngoại viện",
                            unitName: "Tổng Công ty Điện lực Hà Nội (EVN HANOI)",
                            examDate: "2026-09-10",
                            session: "Sáng (08:00 - 11:30)",
                            quantity: 130,
                            facility: "Ngoại viện",
                            diaDiemKham: "69 Đinh Tiên Hoàng, Hoàn Kiếm, Hà Nội",
                            personInCharge: "Trần Văn Bình",
                            status: "DANG_DUYET_BUOC_2",
                            approvalStep: 2,
                            submittedAt: "2026-09-03T14:20:00.000Z",
                            submittedBy: "Phạm Quốc Huy (Cán bộ Tổng hợp)",
                            deadline: "2026-09-08T10:00:00",
                            isOverdue: false,
                            categories: ["Khám Nội nghề nghiệp", "Đo chức năng hô hấp", "Xét nghiệm độc hại"],
                            locations: ["Hội trường EVN HANOI"],
                            staffCount: 14,
                            history: [
                                { actor: "Phạm Quốc Huy (Cán bộ Tổng hợp)", timestamp: "14:20 - 03/09/2026", action: "Gửi CB Duyệt", details: "Chuyển CB Duyệt." },
                                { actor: "BGĐ Khối KHDN", timestamp: "16:45 - 04/09/2026", action: "Phê duyệt Bước 1", details: "BGĐ Khối KHDN đã duyệt. Chuyển BGĐ Khối KSK." }
                            ]
                        },
                        {
                            scheduleId: "SCH008",
                            tongLichId: "TONG-09-2026-003",
                            scheduleType: "LICH_PHAT_SINH",
                            loaiHinh: "Ngoại viện",
                            unitName: "Tổng Công ty Điện lực Hà Nội (EVN HANOI)",
                            examDate: "2026-09-11",
                            session: "Chiều (13:30 - 17:00)",
                            quantity: 70,
                            facility: "Ngoại viện",
                            diaDiemKham: "Trung tâm Thí nghiệm Điện EVN, Hà Đông",
                            personInCharge: "Trần Văn Bình",
                            status: "DANG_DUYET_BUOC_2",
                            approvalStep: 2,
                            submittedAt: "2026-09-03T14:20:00.000Z",
                            submittedBy: "Phạm Quốc Huy (Cán bộ Tổng hợp)",
                            deadline: "2026-09-08T10:00:00",
                            isOverdue: false,
                            categories: ["Khám Nội nghề nghiệp", "Đo thị lực & Sắc giác", "Lấy mẫu"],
                            locations: ["Phòng Y tế EVN Hà Đông"],
                            staffCount: 8,
                            history: [
                                { actor: "Phạm Quốc Huy (Cán bộ Tổng hợp)", timestamp: "14:20 - 03/09/2026", action: "Gửi CB Duyệt", details: "Chuyển CB Duyệt." },
                                { actor: "BGĐ Khối KHDN", timestamp: "16:45 - 04/09/2026", action: "Phê duyệt Bước 1", details: "BGĐ Khối KHDN đã duyệt. Chuyển BGĐ Khối KSK." }
                            ]
                        }
                    ]
                },
                {
                    tongLichId: "TONG-09-2026-004",
                    tongLichType: "LICH_PHUONG",
                    unitName: "UBND Phường Phúc Xá & Cụm Dân phố",
                    contactPerson: "Nguyễn Thị Hoa",
                    contactPhone: "0915443322",
                    examDate: "2026-09-09",
                    status: "QUA_HAN",
                    submittedAt: "2026-09-02T10:00:00.000Z",
                    submittedBy: "Trần Thị Mai (Cán bộ Tổng hợp)",
                    childSchedules: [
                        {
                            scheduleId: "SCH009",
                            tongLichId: "TONG-09-2026-004",
                            scheduleType: "LICH_PHUONG",
                            loaiHinh: "Phường",
                            unitName: "UBND Phường Phúc Xá & Cụm Dân phố",
                            examDate: "2026-09-09",
                            session: "Sáng (08:00 - 11:30)",
                            quantity: 80,
                            facility: "Trạm Y tế Phúc Xá",
                            diaDiemKham: "Trạm Y tế Phường Phúc Xá, Ba Đình, Hà Nội",
                            personInCharge: "Lê Hoàng Nam",
                            status: "QUA_HAN",
                            approvalStep: 1,
                            submittedAt: "2026-09-02T10:00:00.000Z",
                            submittedBy: "Trần Thị Mai (Cán bộ Tổng hợp)",
                            deadline: "2026-09-05T17:00:00",
                            isOverdue: true,
                            categories: ["Khám Nội", "Khám Mắt", "Tư vấn sức khỏe người cao tuổi"],
                            locations: ["Phòng khám Trạm Y tế"],
                            staffCount: 9,
                            history: [
                                { actor: "Trần Thị Mai (Cán bộ Tổng hợp)", timestamp: "10:00 - 02/09/2026", action: "Gửi CB Duyệt", details: "Chuyển CB Duyệt." },
                                { actor: "Hệ thống (Auto)", timestamp: "17:00 - 05/09/2026", action: "Cảnh báo Quá hạn", details: "Quá thời hạn xử lý 48h. Tự động chuyển bước duyệt tiếp theo." }
                            ]
                        },
                        {
                            scheduleId: "SCH010",
                            tongLichId: "TONG-09-2026-004",
                            scheduleType: "LICH_PHUONG",
                            loaiHinh: "Phường",
                            unitName: "UBND Phường Phúc Xá & Cụm Dân phố",
                            examDate: "2026-09-10",
                            session: "Chiều (13:30 - 17:00)",
                            quantity: 70,
                            facility: "Nhà Văn hóa Phúc Xá",
                            diaDiemKham: "Nhà Văn hóa Phường Phúc Xá, Ba Đình, Hà Nội",
                            personInCharge: "Lê Hoàng Nam",
                            status: "QUA_HAN",
                            approvalStep: 1,
                            submittedAt: "2026-09-02T10:00:00.000Z",
                            submittedBy: "Trần Thị Mai (Cán bộ Tổng hợp)",
                            deadline: "2026-09-05T17:00:00",
                            isOverdue: true,
                            categories: ["Khám Tai Mũi Họng", "Lấy máu xét nghiệm"],
                            locations: ["Hội trường Nhà Văn hóa"],
                            staffCount: 7,
                            history: [
                                { actor: "Trần Thị Mai (Cán bộ Tổng hợp)", timestamp: "10:00 - 02/09/2026", action: "Gửi CB Duyệt", details: "Chuyển CB Duyệt." },
                                { actor: "Hệ thống (Auto)", timestamp: "17:00 - 05/09/2026", action: "Cảnh báo Quá hạn", details: "Quá thời hạn xử lý 48h. Tự động chuyển bước duyệt tiếp theo." }
                            ]
                        }
                    ]
                },
                {
                    tongLichId: "TONG-09-2026-005",
                    tongLichType: "LICH_TUAN",
                    unitName: "Tập đoàn Vingroup - VinFast",
                    contactPerson: "Vũ Minh Anh",
                    contactPhone: "0978990011",
                    examDate: "2026-09-08",
                    status: "DA_DUYET",
                    submittedAt: "2026-08-30T11:00:00.000Z",
                    submittedBy: "Trần Thị Mai (Cán bộ Tổng hợp)",
                    approvedAt: "2026-09-01T15:30:00.000Z",
                    childSchedules: [
                        {
                            scheduleId: "SCH011",
                            tongLichId: "TONG-09-2026-005",
                            scheduleType: "LICH_TUAN",
                            loaiHinh: "Tại viện",
                            unitName: "Tập đoàn Vingroup - VinFast",
                            examDate: "2026-09-08",
                            session: "Sáng (07:30 - 11:30)",
                            quantity: 150,
                            facility: "MEDLATEC Ba Đình",
                            diaDiemKham: "42-44 Nghĩa Dũng, Ba Đình, Hà Nội",
                            personInCharge: "Nguyễn Văn An",
                            status: "DA_DUYET",
                            approvalStep: 2,
                            submittedAt: "2026-08-30T11:00:00.000Z",
                            submittedBy: "Trần Thị Mai (Cán bộ Tổng hợp)",
                            deadline: null,
                            isOverdue: false,
                            categories: ["Khám Nội", "Siêu âm", "Chụp CT 128 dãy"],
                            locations: ["Tầng 1 & Tầng 3 PK Ba Đình"],
                            staffCount: 18,
                            history: [
                                { actor: "Trần Thị Mai (Cán bộ Tổng hợp)", timestamp: "11:00 - 30/08/2026", action: "Gửi CB Duyệt", details: "Khởi tạo luồng duyệt." },
                                { actor: "BGĐ Khối KHDN", timestamp: "14:00 - 31/08/2026", action: "Phê duyệt Bước 1", details: "Đã phê duyệt Bước 1." },
                                { actor: "BGĐ Khối KSK", timestamp: "15:30 - 01/09/2026", action: "Phê duyệt Hoàn tất", details: "BGĐ Khối KSK đã phê duyệt thành công. Chuyển sang Cán bộ Điều phối." }
                            ]
                        },
                        {
                            scheduleId: "SCH012",
                            tongLichId: "TONG-09-2026-005",
                            scheduleType: "LICH_TUAN",
                            loaiHinh: "Tại viện",
                            unitName: "Tập đoàn Vingroup - VinFast",
                            examDate: "2026-09-09",
                            session: "Sáng (07:30 - 11:30)",
                            quantity: 150,
                            facility: "MEDLATEC Ba Đình",
                            diaDiemKham: "42-44 Nghĩa Dũng, Ba Đình, Hà Nội",
                            personInCharge: "Nguyễn Văn An",
                            status: "DA_DUYET",
                            approvalStep: 2,
                            submittedAt: "2026-08-30T11:00:00.000Z",
                            submittedBy: "Trần Thị Mai (Cán bộ Tổng hợp)",
                            deadline: null,
                            isOverdue: false,
                            categories: ["Khám Nội", "Siêu âm", "Xét nghiệm"],
                            locations: ["Tầng 1 PK Ba Đình"],
                            staffCount: 15,
                            history: [
                                { actor: "Trần Thị Mai (Cán bộ Tổng hợp)", timestamp: "11:00 - 30/08/2026", action: "Gửi CB Duyệt", details: "Khởi tạo luồng duyệt." },
                                { actor: "BGĐ Khối KHDN", timestamp: "14:00 - 31/08/2026", action: "Phê duyệt Bước 1", details: "Đã phê duyệt Bước 1." },
                                { actor: "BGĐ Khối KSK", timestamp: "15:30 - 01/09/2026", action: "Phê duyệt Hoàn tất", details: "BGĐ Khối KSK đã phê duyệt thành công. Chuyển sang Cán bộ Điều phối." }
                            ]
                        }
                    ]
                },
                {
                    tongLichId: "TONG-09-2026-006",
                    tongLichType: "LICH_PHAT_SINH",
                    unitName: "Công ty TNHH Samsung Electronics Việt Nam",
                    contactPerson: "Nguyễn Thùy Linh",
                    contactPhone: "0966554433",
                    examDate: "2026-09-12",
                    status: "TRA_LAI_TOAN_BO",
                    submittedAt: "2026-08-31T16:00:00.000Z",
                    submittedBy: "Phạm Quốc Huy (Cán bộ Tổng hợp)",
                    returnReason: "Chưa thống nhất danh mục xét nghiệm độc hại với phía doanh nghiệp.",
                    childSchedules: [
                        {
                            scheduleId: "SCH015",
                            tongLichId: "TONG-09-2026-006",
                            scheduleType: "LICH_PHAT_SINH",
                            loaiHinh: "Ngoại viện",
                            unitName: "Công ty TNHH Samsung Electronics Việt Nam",
                            examDate: "2026-09-12",
                            session: "Ca Ngày (07:30 - 17:00)",
                            quantity: 300,
                            facility: "Ngoại viện",
                            diaDiemKham: "KCN Yên Phong, Bắc Ninh",
                            personInCharge: "Nguyễn Văn An",
                            status: "TRA_LAI",
                            approvalStep: 1,
                            submittedAt: "2026-08-31T16:00:00.000Z",
                            submittedBy: "Phạm Quốc Huy (Cán bộ Tổng hợp)",
                            returnReason: "Chưa thống nhất danh mục xét nghiệm độc hại với phía doanh nghiệp.",
                            deadline: null,
                            isOverdue: false,
                            categories: ["Khám Nội", "X-quang KTS", "Xét nghiệm độc hại"],
                            locations: ["Khu khám nhà máy Samsung"],
                            staffCount: 30,
                            history: [
                                { actor: "Phạm Quốc Huy (Cán bộ Tổng hợp)", timestamp: "16:00 - 31/08/2026", action: "Gửi CB Duyệt", details: "Gửi CB Duyệt." },
                                { actor: "BGĐ Khối KHDN", timestamp: "10:15 - 01/09/2026", action: "Trả lại lịch", details: "Lý do trả lại: Chưa thống nhất danh mục xét nghiệm độc hại với phía doanh nghiệp." }
                            ]
                        }
                    ]
                }
            ];
        },
        approveSchedules: function(scheduleIds, actorName = 'BGĐ Khối KHDN') {
            const masterList = this.getApprovalSchedules();
            const now = new Date();
            const timeStr = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')} - ${String(now.getDate()).padStart(2,'0')}/${String(now.getMonth()+1).padStart(2,'0')}/${now.getFullYear()}`;

            let updatedCount = 0;
            masterList.forEach(master => {
                let allMasterApproved = true;
                master.childSchedules.forEach(child => {
                    if (scheduleIds.includes(child.scheduleId)) {
                        updatedCount++;
                        if (child.approvalStep === 1 || child.status === 'CHO_CB_DUYET' || child.status === 'DANG_DUYET_BUOC_1' || child.status === 'QUA_HAN') {
                            child.status = 'DANG_DUYET_BUOC_2';
                            child.approvalStep = 2;
                            child.isOverdue = false;
                            child.history.unshift({
                                actor: actorName,
                                timestamp: timeStr,
                                action: 'Phê duyệt Bước 1',
                                details: 'BGĐ Khối KHDN đã duyệt. Chuyển sang Bước 2: BGĐ Khối KSK.'
                            });
                        } else if (child.approvalStep === 2 || child.status === 'DANG_DUYET_BUOC_2') {
                            child.status = 'DA_DUYET';
                            child.history.unshift({
                                actor: 'BGĐ Khối KSK',
                                timestamp: timeStr,
                                action: 'Phê duyệt Hoàn tất',
                                details: 'BGĐ Khối KSK đã phê duyệt thành công. Chuyển thông tin cho Cán bộ Điều phối.'
                            });
                        }
                    }

                    if (child.status !== 'DA_DUYET') {
                        allMasterApproved = false;
                    }
                });

                if (allMasterApproved) {
                    master.status = 'DA_DUYET';
                    master.approvedAt = now.toISOString();
                } else {
                    const hasStep2 = master.childSchedules.some(c => c.status === 'DANG_DUYET_BUOC_2');
                    if (hasStep2) master.status = 'DANG_DUYET_BUOC_2';
                    else if (master.childSchedules.some(c => c.status === 'DANG_DUYET_BUOC_1')) master.status = 'DANG_DUYET_BUOC_1';
                }
            });

            this.saveApprovalSchedules(masterList);
            return updatedCount;
        },
        returnAllMasterSchedule: function(tongLichId, reason, actorName = 'BGĐ Khối KHDN') {
            const masterList = this.getApprovalSchedules();
            const targetMaster = masterList.find(m => m.tongLichId === tongLichId);
            if (!targetMaster) return false;

            const now = new Date();
            const timeStr = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')} - ${String(now.getDate()).padStart(2,'0')}/${String(now.getMonth()+1).padStart(2,'0')}/${now.getFullYear()}`;

            targetMaster.status = 'TRA_LAI_TOAN_BO';
            targetMaster.returnReason = reason;

            targetMaster.childSchedules.forEach(child => {
                child.status = 'TRA_LAI';
                child.returnReason = reason;
                child.history.unshift({
                    actor: actorName,
                    timestamp: timeStr,
                    action: 'Trả lại toàn bộ lịch tổng',
                    details: `Lý do trả lại: ${reason}`
                });
            });

            this.saveApprovalSchedules(masterList);
            return true;
        },
        returnSelectedChildSchedules: function(selectedScheduleIds, reason, actorName = 'BGĐ Khối KHDN') {
            const masterList = this.getApprovalSchedules();
            const now = new Date();
            const timeStr = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')} - ${String(now.getDate()).padStart(2,'0')}/${String(now.getMonth()+1).padStart(2,'0')}/${now.getFullYear()}`;

            const detachedPhatSinhItems = [];

            masterList.forEach(master => {
                const remainingChilds = [];
                const returnedChilds = [];

                master.childSchedules.forEach(child => {
                    if (selectedScheduleIds.includes(child.scheduleId)) {
                        returnedChilds.push(child);
                    } else {
                        remainingChilds.push(child);
                    }
                });

                if (returnedChilds.length > 0) {
                    master.childSchedules = remainingChilds;

                    if (master.childSchedules.length === 0) {
                        master.status = 'TRA_LAI_TOAN_BO';
                        master.returnReason = reason;
                    } else {
                        master.status = 'TRA_LAI_LICH_LE';
                    }

                    returnedChilds.forEach(child => {
                        const newPhatSinhCode = `PHAT-${child.scheduleId}`;
                        const detachedItem = {
                            tongLichId: `TONG-PHAT-${child.scheduleId}`,
                            tongLichType: "LICH_PHAT_SINH",
                            unitName: `${child.unitName} (Bóc tách phát sinh)`,
                            contactPerson: master.contactPerson || "Bàn giao bóc tách",
                            contactPhone: master.contactPhone || "",
                            examDate: child.examDate,
                            status: "CHO_XU_LY_PHAT_SINH",
                            submittedAt: now.toISOString(),
                            submittedBy: actorName,
                            returnReason: reason,
                            childSchedules: [
                                {
                                    ...child,
                                    scheduleId: newPhatSinhCode,
                                    tongLichId: `TONG-PHAT-${child.scheduleId}`,
                                    scheduleType: "LICH_PHAT_SINH",
                                    status: "TRA_LAI",
                                    detachedFrom: child.scheduleId,
                                    returnReason: reason,
                                    history: [
                                        {
                                            actor: actorName,
                                            timestamp: timeStr,
                                            action: 'Trả lịch lẻ - Bóc tách Lịch phát sinh',
                                            details: `Bóc tách tự động thành Lịch phát sinh độc lập (${newPhatSinhCode}). Lý do trả lại: ${reason}`
                                        },
                                        ...child.history
                                    ]
                                }
                            ]
                        };
                        detachedPhatSinhItems.push(detachedItem);
                    });
                }
            });

            if (detachedPhatSinhItems.length > 0) {
                masterList.unshift(...detachedPhatSinhItems);
            }

            this.saveApprovalSchedules(masterList);
            return detachedPhatSinhItems.length;
        },
        sendToApproval: function(weeklyItem, actorName = 'Trần Thị Mai (Cán bộ Tổng hợp)') {
            const masterList = this.getApprovalSchedules();
            const now = new Date();
            const timeStr = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')} - ${String(now.getDate()).padStart(2,'0')}/${String(now.getMonth()+1).padStart(2,'0')}/${now.getFullYear()}`;

            const newMasterId = `TONG-09-2026-${String(masterList.length + 1).padStart(3, '0')}`;
            const childItems = [];

            if (Array.isArray(weeklyItem.scheduleIds) && weeklyItem.scheduleIds.length > 0) {
                const kskList = this.getKskSchedules();
                weeklyItem.scheduleIds.forEach((schId, idx) => {
                    const foundKsk = kskList.find(k => String(k.id) === String(schId) || k.maLich === schId || k.code === schId);
                    const childCode = `SCH${String(masterList.length * 5 + idx + 1).padStart(3, '0')}`;
                    childItems.push({
                        scheduleId: childCode,
                        tongLichId: newMasterId,
                        scheduleType: weeklyItem.nguonLich === 'Lịch phát sinh' ? 'LICH_PHAT_SINH' : (weeklyItem.loaiLich === 'Lịch phường' ? 'LICH_PHUONG' : 'LICH_TUAN'),
                        loaiHinh: foundKsk ? (foundKsk.loaiLich || 'Tại viện') : 'Ngoại viện',
                        unitName: weeklyItem.tenDonVi || (foundKsk ? foundKsk.customerName : 'Đơn vị KSK'),
                        examDate: foundKsk ? foundKsk.examDate : (weeklyItem.ngayTao || '2026-09-15'),
                        session: foundKsk ? `${foundKsk.session || 'Sáng'} (${foundKsk.startTime || '07:30'} - ${foundKsk.endTime || '11:30'})` : 'Sáng (07:30 - 11:30)',
                        quantity: foundKsk ? (foundKsk.estimatedCount || 100) : (weeklyItem.tongKhach || 100),
                        facility: foundKsk ? foundKsk.facility : 'Ba Đình',
                        diaDiemKham: foundKsk ? foundKsk.examLocation : 'Địa điểm khám',
                        personInCharge: foundKsk ? foundKsk.personInCharge : 'Nguyễn Văn An',
                        status: 'CHO_CB_DUYET',
                        approvalStep: 1,
                        submittedAt: now.toISOString(),
                        submittedBy: actorName,
                        deadline: '2026-09-10T17:00:00',
                        isOverdue: false,
                        categories: foundKsk ? (foundKsk.categories || []) : ['Khám Nội', 'Lấy máu xét nghiệm'],
                        locations: foundKsk ? (foundKsk.locations || []) : ['Tầng 1'],
                        staffCount: foundKsk ? (foundKsk.tongNhanSu || 10) : 10,
                        history: [
                            { actor: actorName, timestamp: timeStr, action: 'Gửi CB Duyệt', details: `Gửi đợt lịch tổng ${newMasterId} sang CB Duyệt.` }
                        ]
                    });
                });
            } else {
                childItems.push({
                    scheduleId: `SCH${String(masterList.length * 5 + 1).padStart(3, '0')}`,
                    tongLichId: newMasterId,
                    scheduleType: weeklyItem.nguonLich === 'Lịch phát sinh' ? 'LICH_PHAT_SINH' : 'LICH_TUAN',
                    loaiHinh: weeklyItem.loaiLich || 'Tại viện',
                    unitName: weeklyItem.tenDonVi || 'Đơn vị KSK',
                    examDate: weeklyItem.ngayTao || '2026-09-15',
                    session: 'Sáng (07:30 - 11:30)',
                    quantity: weeklyItem.tongKhach || 100,
                    facility: 'Ba Đình',
                    diaDiemKham: 'Địa điểm khám KSK',
                    personInCharge: 'Nguyễn Văn An',
                    status: 'CHO_CB_DUYET',
                    approvalStep: 1,
                    submittedAt: now.toISOString(),
                    submittedBy: actorName,
                    deadline: '2026-09-10T17:00:00',
                    isOverdue: false,
                    categories: ['Khám Nội', 'Siêu âm', 'Lấy máu'],
                    locations: ['Tầng 1'],
                    staffCount: weeklyItem.tongNhanSu || 12,
                    history: [
                        { actor: actorName, timestamp: timeStr, action: 'Gửi CB Duyệt', details: `Gửi đợt lịch tổng ${newMasterId} sang CB Duyệt.` }
                    ]
                });
            }

            const newMaster = {
                tongLichId: newMasterId,
                tongLichType: weeklyItem.nguonLich === 'Lịch phát sinh' ? 'LICH_PHAT_SINH' : (weeklyItem.loaiLich === 'Lịch phường' ? 'LICH_PHUONG' : 'LICH_TUAN'),
                unitName: weeklyItem.tenDonVi || 'Đơn vị KSK',
                contactPerson: 'Cán bộ tổng hợp',
                contactPhone: '0900000000',
                examDate: childItems[0].examDate,
                status: 'CHO_CB_DUYET',
                submittedAt: now.toISOString(),
                submittedBy: actorName,
                childSchedules: childItems
            };

            masterList.unshift(newMaster);
            this.saveApprovalSchedules(masterList);
            return newMasterId;
        },

        getApprovedKskSchedules: function() {
            const result = [];
            const masterList = this.getApprovalSchedules();

            masterList.forEach(master => {
                if (Array.isArray(master.childSchedules)) {
                    master.childSchedules.forEach(child => {
                        const s = (child.status || '').toUpperCase();
                        if (s === 'DA_DUYET' || s === 'DA_DUYET_TONG_HOP') {
                            const rawType = child.scheduleType || master.tongLichType || 'LICH_TUAN';
                            const loaiHinh = child.loaiHinh || (rawType === 'LICH_PHUONG' ? 'Tại phường' : (child.facility === 'Ngoại viện' ? 'Ngoại viện' : 'Tại viện'));
                            
                            let startTime = child.startTime || '07:30';
                            let endTime = child.endTime || '11:30';
                            if (child.session && child.session.includes('(')) {
                                const match = child.session.match(/\((.*?)\)/);
                                if (match && match[1]) {
                                    const parts = match[1].split('-');
                                    if (parts.length === 2) {
                                        startTime = parts[0].trim();
                                        endTime = parts[1].trim();
                                    }
                                }
                            }

                            const item = {
                                ...child,
                                id: child.scheduleId || child.id,
                                scheduleId: child.scheduleId || child.id,
                                tongLichId: child.tongLichId || master.tongLichId,
                                unitName: child.unitName || master.unitName,
                                customerName: child.unitName || master.unitName,
                                loaiHinh: loaiHinh,
                                loaiLich: loaiHinh,
                                scheduleType: rawType,
                                examDate: child.examDate || master.examDate || '2026-09-15',
                                tuNgay: child.tuNgay || child.examDate || master.examDate || '2026-09-15',
                                denNgay: child.denNgay || child.examDate || master.examDate || '2026-09-15',
                                startTime: startTime,
                                endTime: endTime,
                                session: child.session || `Sáng (${startTime} - ${endTime})`,
                                quantity: child.quantity || child.soLuongKhach || child.soLuong || 100,
                                facility: child.facility || 'Ba Đình',
                                diaDiemKham: child.diaDiemKham || 'Medlatec Ba Đình',
                                personInCharge: child.personInCharge || master.contactPerson || 'Nguyễn Văn An',
                                status: child.status,
                                coordination: child.coordination || {
                                    thietLapStatus: 'CHUA_THIET_LAP_CBTK',
                                    cbtk: {
                                        cbtkId: '',
                                        cbtkName: '',
                                        cbtkPhone: '',
                                        cbtkTitle: '',
                                        cbtkAssignDate: '',
                                        cbtkNote: ''
                                    },
                                    staffDiagram: { bs: 0, dd: 0, ktv: 0, layMau: 0, tiepDon: 0, tuVan: 0 },
                                    dieuPhoiStatus: 'CHUA_DIEU_PHOI',
                                    coordinationStaff: []
                                }
                            };
                            result.push(item);
                        }
                    });
                }
            });

            const kskList = this.getKskSchedules();
            kskList.forEach(ksk => {
                const s = (ksk.status || ksk.trangThai || '').toUpperCase();
                if (s === 'DA_DUYET' || s === 'DA_DUYET_TONG_HOP') {
                    if (!result.some(r => String(r.scheduleId) === String(ksk.id) || String(r.scheduleId) === String(ksk.maLich))) {
                        result.push({
                            ...ksk,
                            id: ksk.id || ksk.maLich,
                            scheduleId: ksk.maLich || `KSK-${ksk.id}`,
                            unitName: ksk.customerName || ksk.teamName || 'Đơn vị KSK',
                            loaiHinh: ksk.loaiLich || 'Tại viện',
                            loaiLich: ksk.loaiLich || 'Tại viện',
                            scheduleType: ksk.scheduleForm === 'Lịch phát sinh' ? 'LICH_PHAT_SINH' : 'LICH_TUAN',
                            examDate: ksk.examDate || '2026-09-15',
                            tuNgay: ksk.tuNgay || ksk.examDate || '2026-09-15',
                            denNgay: ksk.denNgay || ksk.examDate || '2026-09-15',
                            startTime: ksk.startTime || '07:30',
                            endTime: ksk.endTime || '11:30',
                            session: ksk.session || 'Sáng (07:30 - 11:30)',
                            quantity: ksk.estimatedCount || ksk.soLuong || 100,
                            facility: ksk.facility || 'Ba Đình',
                            diaDiemKham: ksk.examLocation || 'Địa điểm khám KSK',
                            personInCharge: ksk.personInCharge || 'Nguyễn Văn An',
                            status: ksk.status || 'DA_DUYET',
                            coordination: ksk.coordination || {
                                thietLapStatus: 'CHUA_THIET_LAP_CBTK',
                                cbtk: { cbtkId: '', cbtkName: '', cbtkPhone: '', cbtkTitle: '', cbtkAssignDate: '', cbtkNote: '' },
                                staffDiagram: { bs: 0, dd: 0, ktv: 0, layMau: 0, tiepDon: 0, tuVan: 0 },
                                dieuPhoiStatus: 'CHUA_DIEU_PHOI',
                                coordinationStaff: []
                            }
                        });
                    }
                }
            });

            return result;
        },

        assignCbtkToSchedule: function(scheduleId, cbtkData) {
            let updated = false;
            const masterList = this.getApprovalSchedules();

            masterList.forEach(master => {
                if (Array.isArray(master.childSchedules)) {
                    master.childSchedules.forEach(child => {
                        if (String(child.scheduleId) === String(scheduleId) || String(child.id) === String(scheduleId)) {
                            if (!child.coordination) {
                                child.coordination = {
                                    thietLapStatus: 'CHUA_THIET_LAP_CBTK',
                                    cbtk: {},
                                    staffDiagram: {},
                                    dieuPhoiStatus: 'CHUA_DIEU_PHOI',
                                    coordinationStaff: []
                                };
                            }
                            child.coordination.cbtk = { ...cbtkData };
                            if (cbtkData && (cbtkData.cbtkId || cbtkData.cbtkName)) {
                                const hasDiagram = child.coordination.staffDiagram && Object.values(child.coordination.staffDiagram).some(v => v > 0);
                                child.coordination.thietLapStatus = hasDiagram ? 'HOAN_THANH_THIET_LAP' : 'CHUA_LAP_SO_DO';
                            } else {
                                child.coordination.thietLapStatus = 'CHUA_THIET_LAP_CBTK';
                            }
                            updated = true;
                        }
                    });
                }
            });

            if (updated) {
                this.saveApprovalSchedules(masterList);
                return true;
            }

            const kskList = this.getKskSchedules();
            kskList.forEach(ksk => {
                if (String(ksk.id) === String(scheduleId) || String(ksk.maLich) === String(scheduleId)) {
                    if (!ksk.coordination) {
                        ksk.coordination = {
                            thietLapStatus: 'CHUA_THIET_LAP_CBTK',
                            cbtk: {},
                            staffDiagram: {},
                            dieuPhoiStatus: 'CHUA_DIEU_PHOI',
                            coordinationStaff: []
                        };
                    }
                    ksk.coordination.cbtk = { ...cbtkData };
                    if (cbtkData && (cbtkData.cbtkId || cbtkData.cbtkName)) {
                        const hasDiagram = ksk.coordination.staffDiagram && Object.values(ksk.coordination.staffDiagram).some(v => v > 0);
                        ksk.coordination.thietLapStatus = hasDiagram ? 'HOAN_THANH_THIET_LAP' : 'CHUA_LAP_SO_DO';
                    } else {
                        ksk.coordination.thietLapStatus = 'CHUA_THIET_LAP_CBTK';
                    }
                    updated = true;
                }
            });

            if (updated) {
                this.saveKskSchedules(kskList);
                return true;
            }
            return false;
        },

        saveStaffDiagram: function(scheduleId, diagramData) {
            let updated = false;
            const masterList = this.getApprovalSchedules();

            masterList.forEach(master => {
                if (Array.isArray(master.childSchedules)) {
                    master.childSchedules.forEach(child => {
                        if (String(child.scheduleId) === String(scheduleId) || String(child.id) === String(scheduleId)) {
                            if (!child.coordination) {
                                child.coordination = {
                                    thietLapStatus: 'CHUA_THIET_LAP_CBTK',
                                    cbtk: {},
                                    staffDiagram: {},
                                    dieuPhoiStatus: 'CHUA_DIEU_PHOI',
                                    coordinationStaff: []
                                };
                            }
                            child.coordination.staffDiagram = { ...diagramData };
                            const hasCbtk = child.coordination.cbtk && (child.coordination.cbtk.cbtkId || child.coordination.cbtk.cbtkName);
                            child.coordination.thietLapStatus = hasCbtk ? 'HOAN_THANH_THIET_LAP' : 'CHUA_LAP_SO_DO';
                            updated = true;
                        }
                    });
                }
            });

            if (updated) {
                this.saveApprovalSchedules(masterList);
                return true;
            }

            const kskList = this.getKskSchedules();
            kskList.forEach(ksk => {
                if (String(ksk.id) === String(scheduleId) || String(ksk.maLich) === String(scheduleId)) {
                    if (!ksk.coordination) {
                        ksk.coordination = {
                            thietLapStatus: 'CHUA_THIET_LAP_CBTK',
                            cbtk: {},
                            staffDiagram: {},
                            dieuPhoiStatus: 'CHUA_DIEU_PHOI',
                            coordinationStaff: []
                        };
                    }
                    ksk.coordination.staffDiagram = { ...diagramData };
                    const hasCbtk = ksk.coordination.cbtk && (ksk.coordination.cbtk.cbtkId || ksk.coordination.cbtk.cbtkName);
                    ksk.coordination.thietLapStatus = hasCbtk ? 'HOAN_THANH_THIET_LAP' : 'CHUA_LAP_SO_DO';
                    updated = true;
                }
            });

            if (updated) {
                this.saveKskSchedules(kskList);
                return true;
            }
            return false;
        },

        assignCoordinationStaff: function(scheduleId, staffData) {
            let updated = false;
            const masterList = this.getApprovalSchedules();

            masterList.forEach(master => {
                if (Array.isArray(master.childSchedules)) {
                    master.childSchedules.forEach(child => {
                        if (String(child.scheduleId) === String(scheduleId) || String(child.id) === String(scheduleId)) {
                            if (!child.coordination) {
                                child.coordination = {
                                    thietLapStatus: 'CHUA_THIET_LAP_CBTK',
                                    cbtk: {},
                                    staffDiagram: {},
                                    dieuPhoiStatus: 'CHUA_DIEU_PHOI',
                                    coordinationStaff: []
                                };
                            }
                            child.coordination.coordinationStaff = Array.isArray(staffData) ? staffData : [];
                            child.coordination.dieuPhoiStatus = child.coordination.coordinationStaff.length > 0 ? 'HOAN_THANH' : 'CHUA_DIEU_PHOI';
                            updated = true;
                        }
                    });
                }
            });

            if (updated) {
                this.saveApprovalSchedules(masterList);
                return true;
            }

            const kskList = this.getKskSchedules();
            kskList.forEach(ksk => {
                if (String(ksk.id) === String(scheduleId) || String(ksk.maLich) === String(scheduleId)) {
                    if (!ksk.coordination) {
                        ksk.coordination = {
                            thietLapStatus: 'CHUA_THIET_LAP_CBTK',
                            cbtk: {},
                            staffDiagram: {},
                            dieuPhoiStatus: 'CHUA_DIEU_PHOI',
                            coordinationStaff: []
                        };
                    }
                    ksk.coordination.coordinationStaff = Array.isArray(staffData) ? staffData : [];
                    ksk.coordination.dieuPhoiStatus = ksk.coordination.coordinationStaff.length > 0 ? 'HOAN_THANH' : 'CHUA_DIEU_PHOI';
                    updated = true;
                }
            });

            if (updated) {
                this.saveKskSchedules(kskList);
                return true;
            }
            return false;
        },

        checkPersonnelScheduleConflict: function(params) {
            let personId, excludeId, tuNgay, denNgay, gioTu, gioDen;
            if (typeof params === 'object' && params !== null) {
                personId = params.personId || params.personName;
                excludeId = params.scheduleId || params.excludeScheduleId;
                tuNgay = params.tuNgay || params.examDate;
                denNgay = params.denNgay || params.tuNgay || params.examDate;
                gioTu = params.gioTu || params.startTime || '07:30';
                gioDen = params.gioDen || params.endTime || '17:00';
            } else {
                personId = arguments[0];
                tuNgay = arguments[1];
                denNgay = arguments[1];
                gioTu = arguments[2] || '07:30';
                gioDen = arguments[3] || '17:00';
                excludeId = arguments[4];
            }

            if (!personId) return { hasConflict: false, conflicts: [] };

            const conflicts = [];
            const approvedSchedules = this.getApprovedKskSchedules();

            function toMinutes(tStr) {
                if (!tStr) return 0;
                const p = tStr.trim().split(':');
                return (parseInt(p[0], 10) || 0) * 60 + (parseInt(p[1], 10) || 0);
            }

            const targetStartM = toMinutes(gioTu);
            const targetEndM = toMinutes(gioDen);

            approvedSchedules.forEach(sch => {
                if (excludeId && (String(sch.scheduleId) === String(excludeId) || String(sch.id) === String(excludeId))) {
                    return;
                }

                const schTu = sch.tuNgay || sch.examDate;
                const schDen = sch.denNgay || sch.tuNgay || sch.examDate;

                if (tuNgay <= schDen && denNgay >= schTu) {
                    const schStartM = toMinutes(sch.startTime || '07:30');
                    const schEndM = toMinutes(sch.endTime || '17:00');

                    if (targetStartM < schEndM && targetEndM > schStartM) {
                        const coord = sch.coordination || {};
                        const cbtk = coord.cbtk || {};
                        const staffList = coord.coordinationStaff || [];

                        let matchedRole = '';
                        if (cbtk.cbtkId === personId || cbtk.cbtkName === personId) {
                            matchedRole = 'CBTK (Trưởng đoàn)';
                        } else if (staffList.some(st => st.staffId === personId || st.name === personId)) {
                            matchedRole = 'Nhân sự điều phối';
                        }

                        if (matchedRole) {
                            conflicts.push({
                                scheduleId: sch.scheduleId || sch.id,
                                unitName: sch.unitName || sch.customerName || 'Đơn vị KSK',
                                date: sch.examDate || schTu,
                                startTime: sch.startTime || '07:30',
                                endTime: sch.endTime || '17:00',
                                role: matchedRole,
                                location: sch.diaDiemKham || sch.facility || ''
                            });
                        }
                    }
                }
            });

            return {
                hasConflict: conflicts.length > 0,
                conflicts: conflicts
            };
        },

        // --- 9. DEPLOYMENT LAYER (ĐOÀN TRIỂN KHAI) APIs ---
        getDeployments: function() {
            const rawStored = localStorage.getItem('mwk_deployments_v1');
            let metaMap = {};
            if (rawStored) {
                try { metaMap = JSON.parse(rawStored) || {}; } catch(e) {}
            }

            const approvedSchedules = this.getApprovedKskSchedules();
            const groupsMap = {};

            approvedSchedules.forEach(sch => {
                const dateKey = sch.examDate || sch.tuNgay || '2026-09-15';
                const facKey = sch.facility || sch.diaDiemKham || 'Ba Đình';
                const locKey = Array.isArray(sch.locations) && sch.locations.length > 0 ? sch.locations.join(', ') : (sch.session || 'Sáng');
                
                const groupKey = `${dateKey}___${facKey}___${locKey}`;
                if (!groupsMap[groupKey]) {
                    groupsMap[groupKey] = {
                        key: groupKey,
                        ngayThucHien: dateKey,
                        coSoKham: facKey,
                        viTriKham: locKey,
                        buoi: sch.session || 'Sáng (07:30 - 11:30)',
                        scheduleType: sch.scheduleType || 'LICH_TUAN',
                        loaiHinh: sch.loaiHinh || 'Tại viện',
                        scheduleIds: [],
                        schedules: []
                    };
                }
                groupsMap[groupKey].scheduleIds.push(sch.scheduleId);
                groupsMap[groupKey].schedules.push(sch);
            });

            const deployments = [];
            let index = 1;
            Object.keys(groupsMap).forEach(gKey => {
                const grp = groupsMap[gKey];
                const depId = `DP${String(index).padStart(3, '0')}`;
                index++;

                const storedMeta = metaMap[depId] || metaMap[gKey] || {};

                const allCategories = new Set();
                let totalPax = 0;
                grp.schedules.forEach(s => {
                    totalPax += (s.quantity || s.soLuongKhach || s.soLuong || 0);
                    if (Array.isArray(s.categories)) {
                        s.categories.forEach(c => allCategories.add(c));
                    }
                });

                const categoriesArr = Array.from(allCategories);
                const diagram = storedMeta.diagram || this.generateClinicalDiagram(categoriesArr, totalPax, grp.loaiHinh);

                const cbtk = storedMeta.cbtk || (grp.schedules[0].coordination ? grp.schedules[0].coordination.cbtk : {}) || {};
                const coordinationStaff = storedMeta.coordinationStaff || (grp.schedules[0].coordination ? grp.schedules[0].coordination.coordinationStaff : []) || [];
                
                // --- CALCULATION OF DEPLOYMENT/COORDINATION STATUS ---
                let thietLapStatus = 'CHUA_GAN_CBTK';
                const hasCbtk = cbtk && (cbtk.cbtkId || cbtk.cbtkName);

                if (!hasCbtk) {
                    thietLapStatus = 'CHUA_GAN_CBTK';
                } else if (grp.loaiHinh === 'Ngoại viện') {
                    thietLapStatus = 'CHO_DIEU_PHOI';
                } else {
                    // Tại viện & Tại phường
                    if (!storedMeta.diagram) {
                        thietLapStatus = 'DA_GAN_CBTK';
                    } else {
                        let totalNeeded = 0;
                        let totalAssigned = coordinationStaff.length;

                        (diagram || []).forEach(r => {
                            totalNeeded += (r.needBS || 0) + (r.needDD || 0);
                        });

                        if (storedMeta.isTransferred) {
                            thietLapStatus = 'CHO_DIEU_PHOI';
                        } else if (totalAssigned < totalNeeded) {
                            thietLapStatus = 'THIEU_NHAN_SU';
                        } else {
                            thietLapStatus = 'HOAN_THANH_DIEU_PHOI';
                        }
                    }
                }

                let dieuPhoiStatus = (coordinationStaff.length > 0) ? 'HOAN_THANH' : 'CHUA_DIEU_PHOI';

                deployments.push({
                    deploymentId: depId,
                    groupKey: gKey,
                    ngayThucHien: grp.ngayThucHien,
                    coSoKham: grp.coSoKham,
                    viTriKham: grp.viTriKham,
                    buoi: grp.buoi,
                    scheduleType: grp.scheduleType,
                    loaiHinh: storedMeta.loaiHinh || grp.loaiHinh,
                    totalPax: totalPax,
                    scheduleIds: grp.scheduleIds,
                    schedules: grp.schedules,
                    categories: categoriesArr,
                    cbtk: cbtk,
                    diagram: diagram,
                    coordinationStaff: coordinationStaff,
                    thietLapStatus: thietLapStatus,
                    dieuPhoiStatus: dieuPhoiStatus,
                    isTransferred: !!storedMeta.isTransferred
                });
            });

            return deployments;
        },

        getDeployment: function(depId) {
            const list = this.getDeployments();
            return list.find(d => d.deploymentId === depId || d.groupKey === depId);
        },

        saveDeploymentMeta: function(depId, metaObj) {
            const rawStored = localStorage.getItem('mwk_deployments_v1');
            let metaMap = {};
            if (rawStored) {
                try { metaMap = JSON.parse(rawStored) || {}; } catch(e) {}
            }

            metaMap[depId] = {
                ...(metaMap[depId] || {}),
                ...metaObj
            };

            localStorage.setItem('mwk_deployments_v1', JSON.stringify(metaMap));
            window.dispatchEvent(new CustomEvent('mwk_deployments_changed', { detail: metaMap }));

            const targetDep = this.getDeployment(depId);
            if (targetDep && Array.isArray(targetDep.scheduleIds)) {
                targetDep.scheduleIds.forEach(schId => {
                    if (metaObj.cbtk) this.assignCbtkToSchedule(schId, metaObj.cbtk);
                    if (metaObj.coordinationStaff) this.assignCoordinationStaff(schId, metaObj.coordinationStaff);
                });
            }
            return true;
        },

        saveDeploymentCbtk: function(depId, cbtkData) {
            return this.saveDeploymentMeta(depId, { cbtk: cbtkData });
        },

        saveDeploymentDiagram: function(depId, diagramData) {
            return this.saveDeploymentMeta(depId, { diagram: diagramData });
        },

        assignDeploymentStaff: function(depId, staffList) {
            return this.saveDeploymentMeta(depId, { coordinationStaff: staffList });
        },

        transferDeploymentToCoordination: function(depId) {
            return this.saveDeploymentMeta(depId, { isTransferred: true, thietLapStatus: 'CHO_DIEU_PHOI' });
        },

        generateClinicalDiagram: function(categories, totalPax, loaiHinh) {
            if (loaiHinh === 'Ngoại viện') return [];

            const p = totalPax || 100;
            return [
                {
                    floor: 'Tầng 6',
                    locationName: 'Phòng Khám Nội',
                    specialty: 'Khám Nội tổng quát',
                    needBS: Math.max(1, Math.ceil(p / 80)),
                    needDD: 1,
                    pakdBS: Math.max(1, Math.ceil(p / 80)),
                    pakdDD: 1,
                    assignedBS: 0,
                    assignedDD: 0,
                    equipmentNeed: 'Ống nghe, Huyết áp kế, Nhiệt kế'
                },
                {
                    floor: 'Tầng 6',
                    locationName: 'Khu vực Lấy mẫu',
                    specialty: 'Lấy máu xét nghiệm',
                    needBS: 0,
                    needDD: Math.max(1, Math.ceil(p / 60)),
                    pakdBS: 0,
                    pakdDD: Math.max(1, Math.ceil(p / 60)),
                    assignedBS: 0,
                    assignedDD: 0,
                    equipmentNeed: 'Bộ kim lấy máu, Ống nghiệm, Khay lấy mẫu'
                },
                {
                    floor: 'Tầng 6',
                    locationName: 'Phòng Khám Mắt',
                    specialty: 'Khám Mắt & Đo thị lực',
                    needBS: 1,
                    needDD: 0,
                    pakdBS: 1,
                    pakdDD: 0,
                    assignedBS: 0,
                    assignedDD: 0,
                    equipmentNeed: 'Bảng đo thị lực, Đèn soi đáy mắt'
                },
                {
                    floor: 'Tầng 6',
                    locationName: 'Phòng Tai Mũi Họng',
                    specialty: 'Khám Tai Mũi Họng',
                    needBS: 1,
                    needDD: 0,
                    pakdBS: 1,
                    pakdDD: 0,
                    assignedBS: 0,
                    assignedDD: 0,
                    equipmentNeed: 'Máy nội soi Tai Mũi Họng'
                },
                {
                    floor: 'Tầng 8',
                    locationName: 'Phòng Siêu âm 01 & 02',
                    specialty: 'Siêu âm ổ bụng & Tuyến giáp',
                    needBS: Math.max(1, Math.ceil(p / 70)),
                    needDD: 0,
                    pakdBS: Math.max(1, Math.ceil(p / 70)),
                    pakdDD: 0,
                    assignedBS: 0,
                    assignedDD: 0,
                    equipmentNeed: 'Máy siêu âm 4D (2 hệ thống)'
                },
                {
                    floor: 'Tầng 8',
                    locationName: 'Phòng Điện tim',
                    specialty: 'Điện tâm đồ (ECG)',
                    needBS: 0,
                    needDD: 1,
                    pakdBS: 0,
                    pakdDD: 1,
                    assignedBS: 0,
                    assignedDD: 0,
                    equipmentNeed: 'Máy điện tim 12 chuyển đạo'
                }
            ];
        },

        getNhanSuMasterData: function() {
            const data = localStorage.getItem(STORAGE_KEYS.REPORT_NHAN_SU);
            if (data) {
                try {
                    const parsed = JSON.parse(data);
                    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
                } catch(e) {}
            }
            return DEFAULT_NHAN_SU_REPORTS;
        }
    };

    window.formatExamDateRange = function(item) {
        return MWKDataStore.formatExamDateRange(item);
    };
    window.MWKDataStore = MWKDataStore;
    window.SCHEDULE_STATUS_CONFIG = SCHEDULE_STATUS_CONFIG;
    window.normalizeScheduleStatusKey = normalizeScheduleStatusKey;
    window.renderScheduleStatus = renderScheduleStatus;
    window.getScheduleStatusInfo = MWKDataStore.getScheduleStatusInfo;
    window.canEditSchedule = MWKDataStore.canEditSchedule.bind(MWKDataStore);
    window.canDeleteSchedule = MWKDataStore.canDeleteSchedule.bind(MWKDataStore);
    window.canSendSchedule = MWKDataStore.canSendSchedule.bind(MWKDataStore);
    window.canViewSchedule = MWKDataStore.canViewSchedule.bind(MWKDataStore);
    window.isScheduleLocked = MWKDataStore.isScheduleLocked.bind(MWKDataStore);
    window.getSchedules = MWKDataStore.getSchedules.bind(MWKDataStore);
    window.getSchedulesByUnit = MWKDataStore.getSchedulesByUnit.bind(MWKDataStore);
    window.getUnitScheduleSummary = MWKDataStore.getUnitScheduleSummary.bind(MWKDataStore);
    window.addSchedule = MWKDataStore.addSchedule.bind(MWKDataStore);
    window.updateSchedule = MWKDataStore.updateSchedule.bind(MWKDataStore);
    window.deleteSchedule = MWKDataStore.deleteSchedule.bind(MWKDataStore);
    window.getSchedule = MWKDataStore.getSchedule.bind(MWKDataStore);
})(window);
