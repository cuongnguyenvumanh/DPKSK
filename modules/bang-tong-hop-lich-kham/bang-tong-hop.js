/**
 * BẢNG TỔNG HỢP LỊCH KHÁM - ENTERPRISE HIS DASHBOARD MODULE
 * High-performance UI rendering with dedicated mock data layer (09/2026).
 */

(function () {
    // Current Active Month/Year State (Default to September 2026)
    let currentYear = 2026;
    let currentMonth = 8; // 0-indexed: 8 = September

    // Filters State
    let activeFilters = {
        month: '2026-09',
        typeKey: '',
        facility: '',
        search: ''
    };

    // System Today Date
    const todayDate = new Date();

    // ==========================================================================
    // 2. MOCK DATA LAYER (25–35 REALISTIC SCHEDULES FOR 09/2026)
    // ==========================================================================
    const mockSchedules = [
        // --- Day 1 (2026-09-01): 1 schedule (TAI_VIEN) ---
        {
            scheduleId: "SCH-260901",
            unitId: "U-001",
            unitName: "Công ty TNHH ABC",
            scheduleType: "TAI_VIEN",
            examDate: "2026-09-01",
            quantity: 85,
            facility: "Cơ sở Mỹ Đình",
            location: "Bệnh viện Đa khoa MEDLATEC Mỹ Đình",
            startTime: "07:30",
            endTime: "11:30",
            personInCharge: "Nguyễn Văn An",
            status: "DA_DUYET"
        },

        // --- Day 2 (2026-09-02): 2 schedules (NGOAI_VIEN & LICH_PHUONG) ---
        {
            scheduleId: "SCH-260902-1",
            unitId: "U-002",
            unitName: "Công ty Tập đoàn XYZ",
            scheduleType: "NGOAI_VIEN",
            examDate: "2026-09-02",
            quantity: 120,
            facility: "Cơ sở Cầu Giấy",
            location: "Tòa nhà Keangnam, Cầu Giấy, Hà Nội",
            startTime: "07:00",
            endTime: "12:00",
            personInCharge: "Trần Văn Bình",
            status: "DA_DUYET"
        },
        {
            scheduleId: "SCH-260902-2",
            unitId: "U-003",
            unitName: "UBND Phường Mỹ Đình 1",
            scheduleType: "LICH_PHUONG",
            examDate: "2026-09-02",
            quantity: 90,
            facility: "Cơ sở Mỹ Đình",
            location: "Trạm Y tế Phường Mỹ Đình 1",
            startTime: "08:00",
            endTime: "11:30",
            personInCharge: "Lê Hoàng Nam",
            status: "CHO_DUYET"
        },

        // --- Day 3 (2026-09-03): 2 schedules (TAI_VIEN & NGOAI_VIEN) ---
        {
            scheduleId: "SCH-260903-1",
            unitId: "U-004",
            unitName: "Ngân hàng Vietcombank",
            scheduleType: "TAI_VIEN",
            examDate: "2026-09-03",
            quantity: 140,
            facility: "Cơ sở Cầu Giấy",
            location: "Phòng khám Đa khoa MEDLATEC Cầu Giấy",
            startTime: "07:30",
            endTime: "11:30",
            personInCharge: "Nguyễn Văn An",
            status: "DA_DUYET"
        },
        {
            scheduleId: "SCH-260903-2",
            unitId: "U-005",
            unitName: "Công ty Dược phẩm Vimed",
            scheduleType: "NGOAI_VIEN",
            examDate: "2026-09-03",
            quantity: 110,
            facility: "Cơ sở Mỹ Đình",
            location: "Nhà máy Dược phẩm Vimed, Mỹ Đình",
            startTime: "08:00",
            endTime: "12:00",
            personInCharge: "Phạm Minh Tuấn",
            status: "DANG_THUC_HIEN"
        },

        // --- Day 4 (2026-09-04): 1 schedule (LICH_PHUONG) ---
        {
            scheduleId: "SCH-260904",
            unitId: "U-006",
            unitName: "UBND Phường Dịch Vọng",
            scheduleType: "LICH_PHUONG",
            examDate: "2026-09-04",
            quantity: 180,
            facility: "Cơ sở Cầu Giấy",
            location: "Nhà văn hóa Phường Dịch Vọng",
            startTime: "07:00",
            endTime: "11:30",
            personInCharge: "Lê Văn Cường",
            status: "CHO_DUYET"
        },

        // --- Day 5 (2026-09-05): 2 schedules (TAI_VIEN & NGOAI_VIEN) ---
        {
            scheduleId: "SCH-260905-1",
            unitId: "U-007",
            unitName: "Trường THPT Chuyên KHTN",
            scheduleType: "TAI_VIEN",
            examDate: "2026-09-05",
            quantity: 160,
            facility: "Cơ sở Thanh Xuân",
            location: "MEDLATEC Thanh Xuân",
            startTime: "07:30",
            endTime: "11:30",
            personInCharge: "Đỗ Hải Đăng",
            status: "HOAN_THANH"
        },
        {
            scheduleId: "SCH-260905-2",
            unitId: "U-008",
            unitName: "Công ty Công nghệ CMC",
            scheduleType: "NGOAI_VIEN",
            examDate: "2026-09-05",
            quantity: 95,
            facility: "Cơ sở Mỹ Đình",
            location: "Tòa nhà CMC Tower, Duy Tân",
            startTime: "08:00",
            endTime: "12:00",
            personInCharge: "Nguyễn Văn An",
            status: "DA_DUYET"
        },

        // --- Day 7 (2026-09-07): 2 schedules (TAI_VIEN & LICH_PHUONG) ---
        {
            scheduleId: "SCH-260907-1",
            unitId: "U-009",
            unitName: "Tổng Công ty Sông Đà",
            scheduleType: "TAI_VIEN",
            examDate: "2026-09-07",
            quantity: 130,
            facility: "Cơ sở Hà Đông",
            location: "MEDLATEC Hà Đông",
            startTime: "07:30",
            endTime: "11:30",
            personInCharge: "Trần Văn Bình",
            status: "DA_DUYET"
        },
        {
            scheduleId: "SCH-260907-2",
            unitId: "U-010",
            unitName: "UBND Phường Mộ Lao",
            scheduleType: "LICH_PHUONG",
            examDate: "2026-09-07",
            quantity: 80,
            facility: "Cơ sở Hà Đông",
            location: "Trạm Y tế Phường Mộ Lao",
            startTime: "08:00",
            endTime: "11:30",
            personInCharge: "Lê Hoàng Nam",
            status: "CHO_DUYET"
        },

        // --- Day 8 (2026-09-08): 1 schedule (NGOAI_VIEN) ---
        {
            scheduleId: "SCH-260908",
            unitId: "U-011",
            unitName: "Công ty Samsung R&D",
            scheduleType: "NGOAI_VIEN",
            examDate: "2026-09-08",
            quantity: 210,
            facility: "Cơ sở Mỹ Đình",
            location: "Tòa nhà Samsung R&D, Mỹ Đình 2",
            startTime: "07:00",
            endTime: "12:00",
            personInCharge: "Phạm Minh Tuấn",
            status: "DANG_THUC_HIEN"
        },

        // --- Day 9 (2026-09-09): 4 schedules (ALL 3 TYPES: 2 TAI_VIEN, 1 NGOAI_VIEN, 1 LICH_PHUONG) ---
        {
            scheduleId: "SCH-260909-1",
            unitId: "U-012",
            unitName: "Công ty CP phần mềm MISA",
            scheduleType: "TAI_VIEN",
            examDate: "2026-09-09",
            quantity: 120,
            facility: "Cơ sở Cầu Giấy",
            location: "MEDLATEC Cầu Giấy",
            startTime: "07:30",
            endTime: "11:30",
            personInCharge: "Nguyễn Văn An",
            status: "DA_DUYET"
        },
        {
            scheduleId: "SCH-260909-2",
            unitId: "U-013",
            unitName: "Công ty CP Chứng khoán SSI",
            scheduleType: "TAI_VIEN",
            examDate: "2026-09-09",
            quantity: 80,
            facility: "Cơ sở Mỹ Đình",
            location: "MEDLATEC Mỹ Đình",
            startTime: "08:00",
            endTime: "11:30",
            personInCharge: "Trần Văn Bình",
            status: "DA_DUYET"
        },
        {
            scheduleId: "SCH-260909-3",
            unitId: "U-014",
            unitName: "Tập đoàn Than Khoáng sản TKV",
            scheduleType: "NGOAI_VIEN",
            examDate: "2026-09-09",
            quantity: 150,
            facility: "Cơ sở Thanh Xuân",
            location: "Tòa nhà TKV, Lê Văn Lương",
            startTime: "07:00",
            endTime: "12:00",
            personInCharge: "Đỗ Hải Đăng",
            status: "DA_DUYET"
        },
        {
            scheduleId: "SCH-260909-4",
            unitId: "U-015",
            unitName: "UBND Phường Nhân Chính",
            scheduleType: "LICH_PHUONG",
            examDate: "2026-09-09",
            quantity: 100,
            facility: "Cơ sở Thanh Xuân",
            location: "Trạm Y tế Phường Nhân Chính",
            startTime: "08:00",
            endTime: "11:30",
            personInCharge: "Lê Văn Cường",
            status: "CHO_DUYET"
        },

        // --- Day 10 (2026-09-10): 2 schedules (NGOAI_VIEN & LICH_PHUONG) ---
        {
            scheduleId: "SCH-260910-1",
            unitId: "U-016",
            unitName: "Ngân hàng BIDV Hà Nội",
            scheduleType: "NGOAI_VIEN",
            examDate: "2026-09-10",
            quantity: 175,
            facility: "Cơ sở Mỹ Đình",
            location: "Hội trường BIDV Tower, Nam Từ Liêm",
            startTime: "07:30",
            endTime: "12:00",
            personInCharge: "Phạm Minh Tuấn",
            status: "DA_DUYET"
        },
        {
            scheduleId: "SCH-260910-2",
            unitId: "U-017",
            unitName: "UBND Phường Cầu Diễn",
            scheduleType: "LICH_PHUONG",
            examDate: "2026-09-10",
            quantity: 90,
            facility: "Cơ sở Mỹ Đình",
            location: "Trạm Y tế Phường Cầu Diễn",
            startTime: "08:00",
            endTime: "11:30",
            personInCharge: "Lê Hoàng Nam",
            status: "DA_DUYET"
        },

        // --- Day 11 (2026-09-11): 2 schedules (TAI_VIEN & NGOAI_VIEN) ---
        {
            scheduleId: "SCH-260911-1",
            unitId: "U-018",
            unitName: "Công ty Honda Việt Nam",
            scheduleType: "TAI_VIEN",
            examDate: "2026-09-11",
            quantity: 110,
            facility: "Cơ sở Mỹ Đình",
            location: "MEDLATEC Mỹ Đình",
            startTime: "07:30",
            endTime: "11:30",
            personInCharge: "Nguyễn Văn An",
            status: "HOAN_THANH"
        },
        {
            scheduleId: "SCH-260911-2",
            unitId: "U-019",
            unitName: "Công ty Canon Việt Nam",
            scheduleType: "NGOAI_VIEN",
            examDate: "2026-09-11",
            quantity: 160,
            facility: "Cơ sở Mỹ Đình",
            location: "KCN Bắc Thăng Long",
            startTime: "07:00",
            endTime: "12:00",
            personInCharge: "Trần Văn Bình",
            status: "HOAN_THANH"
        },

        // --- Day 12 (2026-09-12): 1 schedule (TAI_VIEN) ---
        {
            scheduleId: "SCH-260912",
            unitId: "U-020",
            unitName: "Bệnh viện Đa khoa Hồng Ngọc",
            scheduleType: "TAI_VIEN",
            examDate: "2026-09-12",
            quantity: 75,
            facility: "Cơ sở Cầu Giấy",
            location: "MEDLATEC Cầu Giấy",
            startTime: "08:00",
            endTime: "11:30",
            personInCharge: "Đỗ Hải Đăng",
            status: "DA_DUYET"
        },

        // --- Day 14 (2026-09-14): 2 schedules (NGOAI_VIEN & TAI_VIEN) ---
        {
            scheduleId: "SCH-260914-1",
            unitId: "U-021",
            unitName: "Công ty Viễn thông VNPT",
            scheduleType: "NGOAI_VIEN",
            examDate: "2026-09-14",
            quantity: 190,
            facility: "Cơ sở Thanh Xuân",
            location: "Tòa nhà VNPT Tower, Nguyễn Trãi",
            startTime: "07:00",
            endTime: "12:00",
            personInCharge: "Phạm Minh Tuấn",
            status: "DA_DUYET"
        },
        {
            scheduleId: "SCH-260914-2",
            unitId: "U-022",
            unitName: "Trường Đại học Quốc Gia",
            scheduleType: "TAI_VIEN",
            examDate: "2026-09-14",
            quantity: 105,
            facility: "Cơ sở Cầu Giấy",
            location: "MEDLATEC Cầu Giấy",
            startTime: "07:30",
            endTime: "11:30",
            personInCharge: "Nguyễn Văn An",
            status: "DA_DUYET"
        },

        // --- Day 15 (2026-09-15): 1 schedule (TAI_VIEN) ---
        {
            scheduleId: "SCH-260915",
            unitId: "U-023",
            unitName: "Tập đoàn VinGroup",
            scheduleType: "TAI_VIEN",
            examDate: "2026-09-15",
            quantity: 150,
            facility: "Cơ sở Mỹ Đình",
            location: "MEDLATEC Mỹ Đình",
            startTime: "07:30",
            endTime: "11:30",
            personInCharge: "Trần Văn Bình",
            status: "DA_DUYET"
        },

        // --- Day 16 (2026-09-16): 5 schedules (ALL 3 TYPES: 2 TAI_VIEN, 2 NGOAI_VIEN, 1 LICH_PHUONG -> Total 450) ---
        {
            scheduleId: "SCH-260916-1",
            unitId: "U-024",
            unitName: "Công ty ABC",
            scheduleType: "TAI_VIEN",
            examDate: "2026-09-16",
            quantity: 80,
            facility: "Cơ sở Mỹ Đình",
            location: "MEDLATEC Mỹ Đình",
            startTime: "07:30",
            endTime: "11:30",
            personInCharge: "Nguyễn Văn An",
            status: "DA_DUYET"
        },
        {
            scheduleId: "SCH-260916-2",
            unitId: "U-025",
            unitName: "Công ty XYZ",
            scheduleType: "TAI_VIEN",
            examDate: "2026-09-16",
            quantity: 60,
            facility: "Cơ sở Mỹ Đình",
            location: "MEDLATEC Mỹ Đình",
            startTime: "08:00",
            endTime: "11:30",
            personInCharge: "Nguyễn Văn An",
            status: "DA_DUYET"
        },
        {
            scheduleId: "SCH-260916-3",
            unitId: "U-026",
            unitName: "Công ty DEF",
            scheduleType: "NGOAI_VIEN",
            examDate: "2026-09-16",
            quantity: 120,
            facility: "Cơ sở Cầu Giấy",
            location: "Tòa nhà DEF, Cầu Giấy",
            startTime: "07:00",
            endTime: "12:00",
            personInCharge: "Trần Văn Bình",
            status: "DANG_THUC_HIEN"
        },
        {
            scheduleId: "SCH-260916-4",
            unitId: "U-027",
            unitName: "Công ty GHI",
            scheduleType: "NGOAI_VIEN",
            examDate: "2026-09-16",
            quantity: 90,
            facility: "Cơ sở Thanh Xuân",
            location: "Tòa nhà GHI, Thanh Xuân",
            startTime: "07:30",
            endTime: "11:30",
            personInCharge: "Phạm Minh Tuấn",
            status: "DANG_THUC_HIEN"
        },
        {
            scheduleId: "SCH-260916-5",
            unitId: "U-028",
            unitName: "Phường Dịch Vọng",
            scheduleType: "LICH_PHUONG",
            examDate: "2026-09-16",
            quantity: 100,
            facility: "Cơ sở Cầu Giấy",
            location: "Trạm Y tế Phường Dịch Vọng",
            startTime: "08:00",
            endTime: "11:30",
            personInCharge: "Lê Văn Cường",
            status: "CHO_DUYET"
        },

        // --- Day 17 (2026-09-17): 2 schedules (NGOAI_VIEN & LICH_PHUONG) ---
        {
            scheduleId: "SCH-260917-1",
            unitId: "U-029",
            unitName: "Công ty May 10",
            scheduleType: "NGOAI_VIEN",
            examDate: "2026-09-17",
            quantity: 135,
            facility: "Cơ sở Hà Đông",
            location: "Nhà máy May 10, Hà Đông",
            startTime: "07:30",
            endTime: "11:30",
            personInCharge: "Đỗ Hải Đăng",
            status: "DA_DUYET"
        },
        {
            scheduleId: "SCH-260917-2",
            unitId: "U-030",
            unitName: "UBND Phường Văn Quán",
            scheduleType: "LICH_PHUONG",
            examDate: "2026-09-17",
            quantity: 75,
            facility: "Cơ sở Hà Đông",
            location: "Trạm Y tế Phường Văn Quán",
            startTime: "08:00",
            endTime: "11:30",
            personInCharge: "Lê Hoàng Nam",
            status: "CHO_DUYET"
        },

        // --- Day 18 (2026-09-18): 2 schedules (TAI_VIEN & NGOAI_VIEN) ---
        {
            scheduleId: "SCH-260918-1",
            unitId: "U-031",
            unitName: "Công ty CP Bánh kẹo Tràng An",
            scheduleType: "TAI_VIEN",
            examDate: "2026-09-18",
            quantity: 90,
            facility: "Cơ sở Cầu Giấy",
            location: "MEDLATEC Cầu Giấy",
            startTime: "07:30",
            endTime: "11:30",
            personInCharge: "Nguyễn Văn An",
            status: "DA_DUYET"
        },
        {
            scheduleId: "SCH-260918-2",
            unitId: "U-032",
            unitName: "Công ty Điện lực Hà Nội",
            scheduleType: "NGOAI_VIEN",
            examDate: "2026-09-18",
            quantity: 165,
            facility: "Cơ sở Mỹ Đình",
            location: "Hội trường EVN Hà Nội",
            startTime: "07:00",
            endTime: "12:00",
            personInCharge: "Trần Văn Bình",
            status: "DA_DUYET"
        },

        // --- Day 19 (2026-09-19): 1 schedule (TAI_VIEN) ---
        {
            scheduleId: "SCH-260919",
            unitId: "U-033",
            unitName: "Trường Đại học Bách Khoa",
            scheduleType: "TAI_VIEN",
            examDate: "2026-09-19",
            quantity: 110,
            facility: "Cơ sở Thanh Xuân",
            location: "MEDLATEC Thanh Xuân",
            startTime: "08:00",
            endTime: "11:30",
            personInCharge: "Phạm Minh Tuấn",
            status: "DA_DUYET"
        },

        // --- Day 21 (2026-09-21): 2 schedules (NGOAI_VIEN & LICH_PHUONG) ---
        {
            scheduleId: "SCH-260921-1",
            unitId: "U-034",
            unitName: "Tập đoàn Hòa Phát",
            scheduleType: "NGOAI_VIEN",
            examDate: "2026-09-21",
            quantity: 220,
            facility: "Cơ sở Mỹ Đình",
            location: "Tòa nhà Hòa Phát, Mỹ Đình",
            startTime: "07:00",
            endTime: "12:00",
            personInCharge: "Nguyễn Văn An",
            status: "DA_DUYET"
        },
        {
            scheduleId: "SCH-260921-2",
            unitId: "U-035",
            unitName: "UBND Phường Trung Hòa",
            scheduleType: "LICH_PHUONG",
            examDate: "2026-09-21",
            quantity: 85,
            facility: "Cơ sở Cầu Giấy",
            location: "Trạm Y tế Phường Trung Hòa",
            startTime: "08:00",
            endTime: "11:30",
            personInCharge: "Lê Văn Cường",
            status: "CHO_DUYET"
        },

        // --- Day 22 (2026-09-22): 1 schedule (TAI_VIEN) ---
        {
            scheduleId: "SCH-260922",
            unitId: "U-036",
            unitName: "Công ty Phần mềm FPT Software",
            scheduleType: "TAI_VIEN",
            examDate: "2026-09-22",
            quantity: 130,
            facility: "Cơ sở Cầu Giấy",
            location: "MEDLATEC Cầu Giấy",
            startTime: "07:30",
            endTime: "11:30",
            personInCharge: "Trần Văn Bình",
            status: "DA_DUYET"
        },

        // --- Day 23 (2026-09-23): 2 schedules (NGOAI_VIEN & TAI_VIEN) ---
        {
            scheduleId: "SCH-260923-1",
            unitId: "U-037",
            unitName: "Ngân hàng Techcombank",
            scheduleType: "NGOAI_VIEN",
            examDate: "2026-09-23",
            quantity: 145,
            facility: "Cơ sở Mỹ Đình",
            location: "Tòa nhà Techcombank, Cầu Giấy",
            startTime: "07:30",
            endTime: "11:30",
            personInCharge: "Phạm Minh Tuấn",
            status: "DA_DUYET"
        },
        {
            scheduleId: "SCH-260923-2",
            unitId: "U-038",
            unitName: "Công ty Nhựa Tiền Phong",
            scheduleType: "TAI_VIEN",
            examDate: "2026-09-23",
            quantity: 85,
            facility: "Cơ sở Thanh Xuân",
            location: "MEDLATEC Thanh Xuân",
            startTime: "08:00",
            endTime: "11:30",
            personInCharge: "Đỗ Hải Đăng",
            status: "DA_DUYET"
        },

        // --- Day 24 (2026-09-24): 4 schedules (ALL 3 TYPES: 1 TAI_VIEN, 2 NGOAI_VIEN, 1 LICH_PHUONG) ---
        {
            scheduleId: "SCH-260924-1",
            unitId: "U-039",
            unitName: "Trường Đại học Thăng Long",
            scheduleType: "TAI_VIEN",
            examDate: "2026-09-24",
            quantity: 100,
            facility: "Cơ sở Thanh Xuân",
            location: "MEDLATEC Thanh Xuân",
            startTime: "07:30",
            endTime: "11:30",
            personInCharge: "Nguyễn Văn An",
            status: "DA_DUYET"
        },
        {
            scheduleId: "SCH-260924-2",
            unitId: "U-040",
            unitName: "Công ty Xây dựng Coteccons",
            scheduleType: "NGOAI_VIEN",
            examDate: "2026-09-24",
            quantity: 130,
            facility: "Cơ sở Hà Đông",
            location: "Công trường Coteccons, Hà Đông",
            startTime: "07:00",
            endTime: "12:00",
            personInCharge: "Trần Văn Bình",
            status: "DA_DUYET"
        },
        {
            scheduleId: "SCH-260924-3",
            unitId: "U-041",
            unitName: "Công ty Thiết bị Y tế Nhật Bản",
            scheduleType: "NGOAI_VIEN",
            examDate: "2026-09-24",
            quantity: 70,
            facility: "Cơ sở Mỹ Đình",
            location: "Tòa nhà Keangnam",
            startTime: "08:00",
            endTime: "11:30",
            personInCharge: "Phạm Minh Tuấn",
            status: "CHO_DUYET"
        },
        {
            scheduleId: "SCH-260924-4",
            unitId: "U-042",
            unitName: "UBND Phường Hà Cầu",
            scheduleType: "LICH_PHUONG",
            examDate: "2026-09-24",
            quantity: 90,
            facility: "Cơ sở Hà Đông",
            location: "Trạm Y tế Phường Hà Cầu",
            startTime: "08:00",
            endTime: "11:30",
            personInCharge: "Lê Hoàng Nam",
            status: "CHO_DUYET"
        },

        // --- Day 25 (2026-09-25): 2 schedules (TAI_VIEN & NGOAI_VIEN) ---
        {
            scheduleId: "SCH-260925-1",
            unitId: "U-043",
            unitName: "Công ty Thuốc lá Thăng Long",
            scheduleType: "TAI_VIEN",
            examDate: "2026-09-25",
            quantity: 115,
            facility: "Cơ sở Thanh Xuân",
            location: "MEDLATEC Thanh Xuân",
            startTime: "07:30",
            endTime: "11:30",
            personInCharge: "Đỗ Hải Đăng",
            status: "DA_DUYET"
        },
        {
            scheduleId: "SCH-260925-2",
            unitId: "U-044",
            unitName: "Tập đoàn Geleximco",
            scheduleType: "NGOAI_VIEN",
            examDate: "2026-09-25",
            quantity: 150,
            facility: "Cơ sở Mỹ Đình",
            location: "Tòa nhà Geleximco, Hoàng Cầu",
            startTime: "07:00",
            endTime: "12:00",
            personInCharge: "Nguyễn Văn An",
            status: "DA_DUYET"
        },

        // --- Day 26 (2026-09-26): 1 schedule (TAI_VIEN) ---
        {
            scheduleId: "SCH-260926",
            unitId: "U-045",
            unitName: "Ngân hàng Agribank Chi nhánh Tây Hà Nội",
            scheduleType: "TAI_VIEN",
            examDate: "2026-09-26",
            quantity: 95,
            facility: "Cơ sở Mỹ Đình",
            location: "MEDLATEC Mỹ Đình",
            startTime: "08:00",
            endTime: "11:30",
            personInCharge: "Trần Văn Bình",
            status: "DA_DUYET"
        },

        // --- Day 28 (2026-09-28): 2 schedules (NGOAI_VIEN & LICH_PHUONG) ---
        {
            scheduleId: "SCH-260928-1",
            unitId: "U-046",
            unitName: "Công ty Sơn Hà Group",
            scheduleType: "NGOAI_VIEN",
            examDate: "2026-09-28",
            quantity: 140,
            facility: "Cơ sở Hà Đông",
            location: "Tòa nhà Sơn Hà, Hà Đông",
            startTime: "07:30",
            endTime: "11:30",
            personInCharge: "Phạm Minh Tuấn",
            status: "DA_DUYET"
        },
        {
            scheduleId: "SCH-260928-2",
            unitId: "U-047",
            unitName: "UBND Phường La Khê",
            scheduleType: "LICH_PHUONG",
            examDate: "2026-09-28",
            quantity: 95,
            facility: "Cơ sở Hà Đông",
            location: "Trạm Y tế Phường La Khê",
            startTime: "08:00",
            endTime: "11:30",
            personInCharge: "Lê Hoàng Nam",
            status: "CHO_DUYET"
        },

        // --- Day 29 (2026-09-29): 1 schedule (TAI_VIEN) ---
        {
            scheduleId: "SCH-260929",
            unitId: "U-048",
            unitName: "Công ty CP Giày Thụy Khuê",
            scheduleType: "TAI_VIEN",
            examDate: "2026-09-29",
            quantity: 105,
            facility: "Cơ sở Cầu Giấy",
            location: "MEDLATEC Cầu Giấy",
            startTime: "07:30",
            endTime: "11:30",
            personInCharge: "Nguyễn Văn An",
            status: "DA_DUYET"
        }
    ];

    // ==========================================================================
    // 25. DATA ACCESS LAYER (getSchedules)
    // ==========================================================================
    /**
     * Data abstraction function. Currently returns mockSchedules.
     * Can easily be replaced by API / DataStore call without changing UI code.
     */
    function getSchedules() {
        return mockSchedules;
    }

    // ==========================================================================
    // LIFECYCLE & DOM INIT
    // ==========================================================================
    document.addEventListener('DOMContentLoaded', function () {
        initControls();
        renderDashboard();
    });

    function initControls() {
        // Dropdown & Search Event Listeners
        const monthSelect = document.getElementById('filter-month');
        if (monthSelect) {
            monthSelect.value = '2026-09';
        }
    }

    // ==========================================================================
    // 24. DECOMPOSED FUNCTIONS
    // ==========================================================================

    /**
     * Filter Schedules according to activeFilters
     */
    function filterSchedules(allSchedules) {
        const [targetYear, targetMonth] = activeFilters.month.split('-').map(Number);

        return allSchedules.filter(item => {
            if (!item.examDate) return false;

            const itemDate = new Date(item.examDate);
            if (isNaN(itemDate.getTime())) return false;

            // Month & Year Filter
            if (itemDate.getFullYear() !== targetYear || (itemDate.getMonth() + 1) !== targetMonth) {
                return false;
            }

            // Schedule Type Filter
            if (activeFilters.typeKey && item.scheduleType !== activeFilters.typeKey) {
                return false;
            }

            // Facility Filter
            if (activeFilters.facility) {
                const facStr = (item.facility || '').toLowerCase();
                const targetFac = activeFilters.facility.toLowerCase();
                if (!facStr.includes(targetFac)) return false;
            }

            // Search Keyword Filter
            if (activeFilters.search) {
                const unitStr = (item.unitName || '').toLowerCase();
                const codeStr = (item.scheduleId || '').toLowerCase();
                const picStr = (item.personInCharge || '').toLowerCase();
                if (!unitStr.includes(activeFilters.search) && 
                    !codeStr.includes(activeFilters.search) && 
                    !picStr.includes(activeFilters.search)) {
                    return false;
                }
            }

            return true;
        });
    }

    /**
     * Calculate Summary Numbers from filtered schedules
     */
    function calculateMonthlySummary(schedules) {
        const totalSchedules = schedules.length;
        const totalPatients = schedules.reduce((sum, item) => sum + (parseInt(item.quantity) || 0), 0);

        const taiVienPatients = schedules
            .filter(item => item.scheduleType === 'TAI_VIEN')
            .reduce((sum, item) => sum + (parseInt(item.quantity) || 0), 0);

        const ngoaiVienPatients = schedules
            .filter(item => item.scheduleType === 'NGOAI_VIEN')
            .reduce((sum, item) => sum + (parseInt(item.quantity) || 0), 0);

        const phuongPatients = schedules
            .filter(item => item.scheduleType === 'LICH_PHUONG')
            .reduce((sum, item) => sum + (parseInt(item.quantity) || 0), 0);

        return {
            totalSchedules,
            totalPatients,
            taiVienPatients,
            ngoaiVienPatients,
            phuongPatients
        };
    }

    /**
     * Render Summary Cards
     */
    function renderSummary(summaryData) {
        const elemTotalSchedules = document.getElementById('summary-total-schedules');
        const elemTotalPatients = document.getElementById('summary-total-patients');
        const elemTaiVien = document.getElementById('summary-tai-vien-patients');
        const elemNgoaiVien = document.getElementById('summary-ngoai-vien-patients');
        const elemPhuong = document.getElementById('summary-phuong-patients');

        if (elemTotalSchedules) elemTotalSchedules.innerText = summaryData.totalSchedules;
        if (elemTotalPatients) elemTotalPatients.innerText = summaryData.totalPatients.toLocaleString('vi-VN');
        if (elemTaiVien) elemTaiVien.innerText = summaryData.taiVienPatients.toLocaleString('vi-VN');
        if (elemNgoaiVien) elemNgoaiVien.innerText = summaryData.ngoaiVienPatients.toLocaleString('vi-VN');
        if (elemPhuong) elemPhuong.innerText = summaryData.phuongPatients.toLocaleString('vi-VN');
    }

    /**
     * Render Calendar Grid & Cells
     */
    function renderCalendar(schedules) {
        const container = document.getElementById('calendar-days-container');
        const emptyStateMsg = document.getElementById('empty-state-message');
        if (!container) return;

        container.innerHTML = '';

        const [year, monthNum] = activeFilters.month.split('-').map(Number);
        const month = monthNum - 1; // 0-indexed

        // First day of current month
        const firstDayOfMonth = new Date(year, month, 1);
        let dayOfWeek = firstDayOfMonth.getDay(); // 0 is Sunday, 1 is Monday...
        // Convert to Monday start: Monday=0, Tuesday=1 ... Sunday=6
        let firstDayIndex = (dayOfWeek + 6) % 7;

        // Total days in current month
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        // Total days in previous month
        const prevMonthDays = new Date(year, month, 0).getDate();

        // Group filtered schedules by Date (YYYY-MM-DD)
        const scheduleMapByDate = {};
        schedules.forEach(item => {
            if (!scheduleMapByDate[item.examDate]) {
                scheduleMapByDate[item.examDate] = [];
            }
            scheduleMapByDate[item.examDate].push(item);
        });

        const todayStr = `${todayDate.getFullYear()}-${String(todayDate.getMonth() + 1).padStart(2, '0')}-${String(todayDate.getDate()).padStart(2, '0')}`;

        // 19. Empty State Check
        if (schedules.length === 0 && emptyStateMsg) {
            emptyStateMsg.classList.remove('hidden');
        } else if (emptyStateMsg) {
            emptyStateMsg.classList.add('hidden');
        }

        // 1. Render Previous Month Padding Days
        for (let i = firstDayIndex - 1; i >= 0; i--) {
            const dayNum = prevMonthDays - i;
            const cellElem = renderCalendarDay(dayNum, '', [], false, true);
            container.appendChild(cellElem);
        }

        // 2. Render Current Month Days
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const daySchedules = scheduleMapByDate[dateStr] || [];
            const isToday = dateStr === todayStr;

            const cellElem = renderCalendarDay(day, dateStr, daySchedules, isToday, false);
            container.appendChild(cellElem);
        }

        // 3. Render Next Month Padding Days to complete 35 or 42 grid cells
        const totalRendered = firstDayIndex + daysInMonth;
        const nextMonthPadding = (totalRendered <= 35) ? (35 - totalRendered) : (42 - totalRendered);

        for (let i = 1; i <= nextMonthPadding; i++) {
            const cellElem = renderCalendarDay(i, '', [], false, true);
            container.appendChild(cellElem);
        }
    }

    /**
     * Render Individual Calendar Day Cell
     */
    function renderCalendarDay(dayNum, dateStr, daySchedules, isToday, isOtherMonth) {
        const cell = document.createElement('div');
        
        if (isOtherMonth) {
            cell.className = 'calendar-day-cell other-month p-2 flex flex-col justify-between select-none';
            cell.innerHTML = `
                <div class="text-right">
                    <span class="text-xs font-semibold text-[#9CA3AF]">${dayNum}</span>
                </div>
            `;
            return cell;
        }

        cell.className = `calendar-day-cell p-2 flex flex-col justify-between cursor-pointer select-none relative ${isToday ? 'today-cell' : ''}`;

        // Calculate Day Metrics
        const totalGuests = daySchedules.reduce((sum, item) => sum + item.quantity, 0);
        const taiVienGuests = daySchedules.filter(i => i.scheduleType === 'TAI_VIEN').reduce((sum, i) => sum + i.quantity, 0);
        const ngoaiVienGuests = daySchedules.filter(i => i.scheduleType === 'NGOAI_VIEN').reduce((sum, i) => sum + i.quantity, 0);
        const phuongGuests = daySchedules.filter(i => i.scheduleType === 'LICH_PHUONG').reduce((sum, i) => sum + i.quantity, 0);

        let cellBodyContent = '';

        if (daySchedules.length > 0) {
            // Breakdown Metrics HTML
            let breakdownHtml = '';
            if (taiVienGuests > 0) {
                breakdownHtml += `<div class="text-[10px] text-[#27496D] font-medium flex items-center justify-between"><span class="flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full badge-dot-tai-vien inline-block shrink-0"></span>Tại viện</span><strong>${taiVienGuests}</strong></div>`;
            }
            if (ngoaiVienGuests > 0) {
                breakdownHtml += `<div class="text-[10px] text-[#D97706] font-medium flex items-center justify-between"><span class="flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full badge-dot-ngoai-vien inline-block shrink-0"></span>Ngoại viện</span><strong>${ngoaiVienGuests}</strong></div>`;
            }
            if (phuongGuests > 0) {
                breakdownHtml += `<div class="text-[10px] text-[#7E22CE] font-medium flex items-center justify-between"><span class="flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full badge-dot-phuong inline-block shrink-0"></span>Tại phường</span><strong>${phuongGuests}</strong></div>`;
            }

            // Render first 2-3 unit names
            const displayUnits = daySchedules.slice(0, 3);
            const hiddenCount = daySchedules.length - displayUnits.length;

            let unitsHtml = '';
            displayUnits.forEach(sch => {
                unitsHtml += renderScheduleEvent(sch);
            });

            if (hiddenCount > 0) {
                unitsHtml += `
                    <div class="text-[10px] text-[#27496D] font-bold mt-0.5 hover:underline">+ ${hiddenCount} lịch khác</div>
                `;
            }

            cellBodyContent = `
                <div class="space-y-1.5">
                    <div class="bg-[#F1F5F9] px-1.5 py-0.5 rounded-[3px] flex items-center justify-between">
                        <span class="text-[10px] font-bold text-[#27496D]">Tổng ${totalGuests.toLocaleString('vi-VN')} người</span>
                    </div>

                    <div class="space-y-0.5">
                        ${breakdownHtml}
                    </div>

                    <div class="pt-1 border-t border-[#F0F3F7] space-y-0.5 day-unit-list max-h-16 overflow-y-auto">
                        ${unitsHtml}
                    </div>
                </div>
            `;
        }

        cell.innerHTML = `
            <div class="flex items-center justify-between border-b border-[#F0F3F7] pb-1 mb-1">
                ${isToday ? '<span class="px-1.5 py-0.2 rounded-full bg-[#27496D] text-white text-[9px] font-bold uppercase tracking-wider">HÔM NAY</span>' : '<span></span>'}
                <span class="text-xs font-extrabold ${isToday ? 'text-[#27496D]' : 'text-[#1F2937]'}">${dayNum}</span>
            </div>
            <div class="flex-1">
                ${cellBodyContent}
            </div>
        `;

        // Click event on day cell -> Open Day Drawer
        cell.addEventListener('click', function (e) {
            const eventItem = e.target.closest('.event-item');
            if (eventItem) {
                e.stopPropagation();
                const schId = eventItem.getAttribute('data-schedule-id');
                const targetSch = daySchedules.find(s => String(s.scheduleId) === String(schId));
                if (targetSch) {
                    openScheduleDetail(targetSch);
                }
                return;
            }

            openDayDrawer(dateStr, daySchedules);
        });

        return cell;
    }

    /**
     * Render Schedule Event Pill
     */
    function renderScheduleEvent(sch) {
        let dotClass = 'badge-dot-tai-vien';
        if (sch.scheduleType === 'NGOAI_VIEN') dotClass = 'badge-dot-ngoai-vien';
        else if (sch.scheduleType === 'LICH_PHUONG') dotClass = 'badge-dot-phuong';

        return `
            <div class="event-item flex items-center justify-between text-[11px] text-[#1F2937] hover:text-[#27496D] font-semibold truncate cursor-pointer py-0.5 hover:bg-[#F3F6FA] px-1 rounded-[2px]" data-schedule-id="${sch.scheduleId}">
                <span class="truncate flex items-center gap-1">
                    <span class="w-1.5 h-1.5 rounded-full ${dotClass} inline-block shrink-0"></span>
                    <span class="truncate">${escapeHtml(sch.unitName)}</span>
                </span>
                <span class="text-[10px] text-[#6B7280] font-normal ml-1 shrink-0">${sch.quantity}</span>
            </div>
        `;
    }

    /**
     * Render Main Dashboard Controller
     */
    function renderDashboard() {
        // Update Month Header Label
        const [year, monthNum] = activeFilters.month.split('-').map(Number);
        currentYear = year;
        currentMonth = monthNum - 1;

        const monthYearLabel = document.getElementById('month-year-label');
        if (monthYearLabel) {
            monthYearLabel.innerText = `THÁNG ${monthNum} / ${year}`;
        }

        const allSchedules = getSchedules();
        const filtered = filterSchedules(allSchedules);
        const summaryData = calculateMonthlySummary(filtered);

        renderSummary(summaryData);
        renderCalendar(filtered);
    }

    // ==========================================================================
    // 12. DAY DETAIL DRAWER (#day-detail-drawer)
    // ==========================================================================
    function openDayDrawer(dateStr, daySchedules) {
        const drawer = document.getElementById('day-detail-drawer');
        const backdrop = document.getElementById('day-detail-drawer-backdrop');
        const titleElem = document.getElementById('drawer-day-title');
        const subtitleElem = document.getElementById('drawer-day-subtitle');
        const contentElem = document.getElementById('drawer-day-content');

        if (!drawer || !contentElem) return;

        if (!dateStr) {
            const [y, m] = activeFilters.month.split('-');
            dateStr = `${y}-${m}-01`;
        }

        // Format Date (DD/MM/YYYY)
        const dateParts = dateStr.split('-');
        const dateDisplay = `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`;
        
        if (titleElem) titleElem.innerText = `LỊCH KHÁM NGÀY ${dateDisplay}`;

        const totalGuests = daySchedules.reduce((sum, item) => sum + item.quantity, 0);
        if (subtitleElem) subtitleElem.innerText = `Tổng: ${totalGuests.toLocaleString('vi-VN')} người • ${daySchedules.length} lịch`;

        renderDayDetail(contentElem, daySchedules);

        if (backdrop) {
            backdrop.classList.remove('opacity-0', 'pointer-events-none');
            backdrop.classList.add('opacity-100');
        }
        drawer.classList.remove('translate-x-full');
    }

    function renderDayDetail(containerElem, daySchedules) {
        if (daySchedules.length === 0) {
            containerElem.innerHTML = `
                <div class="text-center py-12 text-[#9CA3AF] space-y-2">
                    <i class="fa-solid fa-calendar-xmark text-4xl"></i>
                    <p class="text-xs font-medium">Không có lịch khám sức khỏe trong ngày này.</p>
                </div>
            `;
            return;
        }

        // Group by 3 Types
        const taiVienList = daySchedules.filter(i => i.scheduleType === 'TAI_VIEN');
        const ngoaiVienList = daySchedules.filter(i => i.scheduleType === 'NGOAI_VIEN');
        const phuongList = daySchedules.filter(i => i.scheduleType === 'LICH_PHUONG');

        let html = '';

        // Section 1: TẠI VIỆN
        if (taiVienList.length > 0) {
            const tvCount = taiVienList.reduce((s, i) => s + i.quantity, 0);
            html += `
                <div class="bg-white rounded-[4px] border border-[#D9DEE5] overflow-hidden space-y-2 shadow-2xs">
                    <div class="bg-[#E8F1FB] px-3.5 py-2 border-b border-[#B4CBE5] flex items-center justify-between text-[#27496D]">
                        <span class="font-bold uppercase text-xs flex items-center gap-1.5">
                            <span class="w-2.5 h-2.5 rounded-full bg-[#27496D]"></span> TẠI VIỆN
                        </span>
                        <span class="font-extrabold text-xs">${tvCount.toLocaleString('vi-VN')} người (${taiVienList.length} lịch)</span>
                    </div>
                    <div class="p-3 space-y-2">
                        ${renderDrawerGroupItems(taiVienList)}
                    </div>
                </div>
            `;
        }

        // Section 2: NGOẠI VIỆN
        if (ngoaiVienList.length > 0) {
            const nvCount = ngoaiVienList.reduce((s, i) => s + i.quantity, 0);
            html += `
                <div class="bg-white rounded-[4px] border border-[#D9DEE5] overflow-hidden space-y-2 shadow-2xs">
                    <div class="bg-[#FFF3E0] px-3.5 py-2 border-b border-[#FFE0B2] flex items-center justify-between text-[#E65100]">
                        <span class="font-bold uppercase text-xs flex items-center gap-1.5">
                            <span class="w-2.5 h-2.5 rounded-full bg-[#ED6C02]"></span> NGOẠI VIỆN
                        </span>
                        <span class="font-extrabold text-xs">${nvCount.toLocaleString('vi-VN')} người (${ngoaiVienList.length} lịch)</span>
                    </div>
                    <div class="p-3 space-y-2">
                        ${renderDrawerGroupItems(ngoaiVienList)}
                    </div>
                </div>
            `;
        }

        // Section 3: TẠI PHƯỜNG
        if (phuongList.length > 0) {
            const tpCount = phuongList.reduce((s, i) => s + i.quantity, 0);
            html += `
                <div class="bg-white rounded-[4px] border border-[#D9DEE5] overflow-hidden space-y-2 shadow-2xs">
                    <div class="bg-[#F3E8FF] px-3.5 py-2 border-b border-[#E9D5FF] flex items-center justify-between text-[#6B21A8]">
                        <span class="font-bold uppercase text-xs flex items-center gap-1.5">
                            <span class="w-2.5 h-2.5 rounded-full bg-[#7E22CE]"></span> TẠI PHƯỜNG
                        </span>
                        <span class="font-extrabold text-xs">${tpCount.toLocaleString('vi-VN')} người (${phuongList.length} lịch)</span>
                    </div>
                    <div class="p-3 space-y-2">
                        ${renderDrawerGroupItems(phuongList)}
                    </div>
                </div>
            `;
        }

        containerElem.innerHTML = html;

        // Bind clicks on schedule items in drawer
        const drawerItems = containerElem.querySelectorAll('.drawer-schedule-item');
        drawerItems.forEach(elem => {
            elem.addEventListener('click', function () {
                const schId = this.getAttribute('data-id');
                const schObj = daySchedules.find(s => String(s.scheduleId) === String(schId));
                if (schObj) {
                    openScheduleDetail(schObj);
                }
            });
        });
    }

    function renderDrawerGroupItems(items) {
        return items.map(sch => `
            <div class="drawer-schedule-item p-2.5 bg-[#F8FAFC] border border-[#D9DEE5] hover:border-[#27496D] rounded-[4px] transition-all cursor-pointer space-y-1" data-id="${sch.scheduleId}">
                <div class="flex items-center justify-between">
                    <span class="font-bold text-[#1F2937] text-xs hover:text-[#27496D]">${escapeHtml(sch.unitName)}</span>
                    <span class="font-bold text-[#15803D] text-xs">${sch.quantity.toLocaleString('vi-VN')} người</span>
                </div>
                <div class="flex items-center justify-between text-[11px] text-[#6B7280]">
                    <span><i class="fa-solid fa-clock text-[10px] mr-1 text-[#27496D]"></i>${sch.startTime} – ${sch.endTime}</span>
                    <span><i class="fa-solid fa-hospital text-[10px] mr-1 text-[#27496D]"></i>${escapeHtml(sch.facility)}</span>
                </div>
                <div class="flex items-center justify-between text-[10px] text-[#9CA3AF] pt-1 border-t border-[#E2E8F0]">
                    <span>Mã: <strong class="font-mono text-[#4B5563]">${escapeHtml(sch.scheduleId)}</strong></span>
                    <span>CB: <strong class="text-[#4B5563]">${escapeHtml(sch.personInCharge)}</strong></span>
                </div>
            </div>
        `).join('');
    }

    function closeDayDrawer() {
        const drawer = document.getElementById('day-detail-drawer');
        const backdrop = document.getElementById('day-detail-drawer-backdrop');

        if (backdrop) {
            backdrop.classList.remove('opacity-100');
            backdrop.classList.add('opacity-0', 'pointer-events-none');
        }
        if (drawer) {
            drawer.classList.add('translate-x-full');
        }
    }

    // ==========================================================================
    // 13. SCHEDULE DETAIL MODAL (#modal-schedule-detail)
    // ==========================================================================
    function openScheduleDetail(sch) {
        const modal = document.getElementById('modal-schedule-detail');
        if (!modal || !sch) return;

        renderScheduleDetail(sch);

        modal.classList.remove('hidden');
        modal.classList.add('flex');
    }

    function renderScheduleDetail(sch) {
        const badgeElem = document.getElementById('modal-type-badge');
        const unitNameElem = document.getElementById('modal-unit-name');
        const codeElem = document.getElementById('modal-schedule-code');

        const detailCodeElem = document.getElementById('modal-detail-code');
        const detailUnitElem = document.getElementById('modal-detail-unit');
        const detailTypeElem = document.getElementById('modal-detail-type');

        const examDateElem = document.getElementById('modal-exam-date');
        const examTimeElem = document.getElementById('modal-exam-time');
        const guestCountElem = document.getElementById('modal-guest-count');
        const facilityElem = document.getElementById('modal-facility-name');
        const locationElem = document.getElementById('modal-exam-location');
        const picElem = document.getElementById('modal-person-in-charge');
        const statusElem = document.getElementById('modal-status-badge');

        if (unitNameElem) unitNameElem.innerText = sch.unitName || 'Đơn vị KSK';
        if (codeElem) codeElem.innerText = `Mã lịch: ${sch.scheduleId || '--'}`;

        if (detailCodeElem) detailCodeElem.innerText = sch.scheduleId || '--';
        if (detailUnitElem) detailUnitElem.innerText = sch.unitName || '--';

        // Format Date (DD/MM/YYYY)
        if (examDateElem) {
            const dParts = (sch.examDate || '').split('-');
            examDateElem.innerText = dParts.length === 3 ? `${dParts[2]}/${dParts[1]}/${dParts[0]}` : sch.examDate;
        }

        if (examTimeElem) examTimeElem.innerText = `${sch.startTime || '07:30'} – ${sch.endTime || '11:30'}`;
        if (guestCountElem) guestCountElem.innerText = `${(sch.quantity || 0).toLocaleString('vi-VN')} người`;
        if (facilityElem) facilityElem.innerText = sch.facility || '--';
        if (locationElem) locationElem.innerText = sch.location || '--';
        if (picElem) picElem.innerText = sch.personInCharge || '--';

        // Type Badge Style & Label
        let typeLabelText = 'Tại viện';
        if (sch.scheduleType === 'NGOAI_VIEN') {
            typeLabelText = 'Ngoại viện';
        } else if (sch.scheduleType === 'LICH_PHUONG') {
            typeLabelText = 'Tại phường';
        }
        if (detailTypeElem) detailTypeElem.innerText = typeLabelText;

        if (badgeElem) {
            let badgeClass = 'type-tag-tai-vien';
            if (sch.scheduleType === 'NGOAI_VIEN') badgeClass = 'type-tag-ngoai-vien';
            else if (sch.scheduleType === 'LICH_PHUONG') badgeClass = 'type-tag-phuong';

            badgeElem.className = `px-2 py-0.5 rounded-[3px] text-[10px] font-bold ${badgeClass}`;
            badgeElem.innerText = typeLabelText;
        }

        // Status Badge Style
        if (statusElem) {
            const st = sch.status || 'CHO_DUYET';
            let stText = 'Chờ duyệt';
            let stClass = 'status-badge-cho-duyet';

            if (st === 'DA_DUYET') {
                stText = 'Đã duyệt';
                stClass = 'status-badge-da-duyet';
            } else if (st === 'DANG_THUC_HIEN') {
                stText = 'Đang thực hiện';
                stClass = 'status-badge-dang-thuc-hien';
            } else if (st === 'HOAN_THANH') {
                stText = 'Hoàn thành';
                stClass = 'status-badge-hoan-thanh';
            }

            statusElem.className = `font-bold text-xs px-2.5 py-0.5 rounded-[3px] ${stClass}`;
            statusElem.innerText = stText;
        }
    }

    function closeScheduleDetail() {
        const modal = document.getElementById('modal-schedule-detail');
        if (modal) {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        }
    }

    // ==========================================================================
    // NAVIGATION & FILTER ACTIONS
    // ==========================================================================
    function goToPreviousMonth() {
        const [y, m] = activeFilters.month.split('-').map(Number);
        const prevD = new Date(y, m - 2, 1);
        const prevMonthStr = `${prevD.getFullYear()}-${String(prevD.getMonth() + 1).padStart(2, '0')}`;
        
        activeFilters.month = prevMonthStr;
        
        const monthSelect = document.getElementById('filter-month');
        if (monthSelect) monthSelect.value = prevMonthStr;

        renderDashboard();
    }

    function goToNextMonth() {
        const [y, m] = activeFilters.month.split('-').map(Number);
        const nextD = new Date(y, m, 1);
        const nextMonthStr = `${nextD.getFullYear()}-${String(nextD.getMonth() + 1).padStart(2, '0')}`;
        
        activeFilters.month = nextMonthStr;

        const monthSelect = document.getElementById('filter-month');
        if (monthSelect) monthSelect.value = nextMonthStr;

        renderDashboard();
    }

    function goToToday() {
        const todayStr = `${todayDate.getFullYear()}-${String(todayDate.getMonth() + 1).padStart(2, '0')}`;
        activeFilters.month = todayStr;

        const monthSelect = document.getElementById('filter-month');
        if (monthSelect) monthSelect.value = todayStr;

        renderDashboard();
    }

    function goToCurrentMonthView() {
        activeFilters.month = '2026-09';
        const monthSelect = document.getElementById('filter-month');
        if (monthSelect) monthSelect.value = '2026-09';
        renderDashboard();
    }

    function resetFilters() {
        activeFilters = {
            month: '2026-09',
            typeKey: '',
            facility: '',
            search: ''
        };

        const monthSelect = document.getElementById('filter-month');
        const typeSelect = document.getElementById('filter-type');
        const facilitySelect = document.getElementById('filter-facility');
        const searchInput = document.getElementById('filter-search');

        if (monthSelect) monthSelect.value = '2026-09';
        if (typeSelect) typeSelect.value = '';
        if (facilitySelect) facilitySelect.value = '';
        if (searchInput) searchInput.value = '';

        renderDashboard();
    }

    // Filter Change Event Handlers
    function onFilterMonthChange(val) {
        activeFilters.month = val || '2026-09';
        renderDashboard();
    }

    function onFilterTypeChange(val) {
        activeFilters.typeKey = val || '';
        renderDashboard();
    }

    function onFilterFacilityChange(val) {
        activeFilters.facility = val || '';
        renderDashboard();
    }

    function onFilterSearchInput(val) {
        activeFilters.search = (val || '').trim().toLowerCase();
        renderDashboard();
    }

    function escapeHtml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    // ==========================================================================
    // EXPOSE TO WINDOW FOR HTML EVENT BINDINGS
    // ==========================================================================
    window.goToPreviousMonth = goToPreviousMonth;
    window.goToNextMonth = goToNextMonth;
    window.goToToday = goToToday;
    window.goToCurrentMonthView = goToCurrentMonthView;
    window.resetFilters = resetFilters;
    window.onFilterMonthChange = onFilterMonthChange;
    window.onFilterTypeChange = onFilterTypeChange;
    window.onFilterFacilityChange = onFilterFacilityChange;
    window.onFilterSearchInput = onFilterSearchInput;
    window.openDayDrawer = openDayDrawer;
    window.closeDayDrawer = closeDayDrawer;
    window.openScheduleDetail = openScheduleDetail;
    window.closeScheduleDetail = closeScheduleDetail;
})();
