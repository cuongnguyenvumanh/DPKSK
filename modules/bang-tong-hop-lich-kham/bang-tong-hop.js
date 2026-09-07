/**
 * BẢNG TỔNG HỢP LỊCH KHÁM - ENTERPRISE HIS DASHBOARD MODULE
 * Master-Child Architecture Refactoring (09/2026).
 * Master = Lịch khám đơn vị | Child = Lịch tại viện / Ngoại viện / Tại phường
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
    // 1. MASTER UNITS & CHILD SCHEDULES DATA SEED (09/2026)
    // ==========================================================================
    const seedMasterUnits = [
        // MASTER 1: FPT (CASE 2: 3 child schedules on SAME DATE 15/09/2026)
        {
            unitId: "U-001",
            code: "LK-2026-001",
            customerName: "Công ty CP Tập đoàn FPT",
            personInCharge: "Nguyễn Văn An",
            facility: "Cơ sở Mỹ Đình",
            childSchedules: [
                {
                    scheduleId: "SCH-FPT-01",
                    scheduleType: "TAI_VIEN",
                    examDate: "2026-09-15",
                    quantity: 100,
                    facility: "Cơ sở Mỹ Đình",
                    location: "Bệnh viện Đa khoa MEDLATEC Mỹ Đình",
                    startTime: "07:30",
                    endTime: "11:30",
                    personInCharge: "Nguyễn Văn An",
                    status: "DA_DUYET"
                },
                {
                    scheduleId: "SCH-FPT-02",
                    scheduleType: "NGOAI_VIEN",
                    examDate: "2026-09-15",
                    quantity: 150,
                    facility: "Cơ sở Cầu Giấy",
                    location: "Tòa nhà FPT Cầu Giấy, Duy Tân, Hà Nội",
                    startTime: "07:00",
                    endTime: "12:00",
                    personInCharge: "Trần Văn Bình",
                    status: "DA_DUYET"
                },
                {
                    scheduleId: "SCH-FPT-03",
                    scheduleType: "LICH_PHUONG",
                    examDate: "2026-09-15",
                    quantity: 80,
                    facility: "Cơ sở Mỹ Đình",
                    location: "Trạm Y tế Phường Mỹ Đình 1",
                    startTime: "08:00",
                    endTime: "11:30",
                    personInCharge: "Lê Hoàng Nam",
                    status: "CHO_DUYET"
                }
            ]
        },

        // MASTER 2: Viettel (CASE 3: 3 child schedules on DIFFERENT DATES: 10/09, 15/09, 20/09)
        {
            unitId: "U-002",
            code: "LK-2026-002",
            customerName: "Tập đoàn Viettel",
            personInCharge: "Phạm Minh Tuấn",
            facility: "Cơ sở Thanh Xuân",
            childSchedules: [
                {
                    scheduleId: "SCH-VTT-01",
                    scheduleType: "TAI_VIEN",
                    examDate: "2026-09-10",
                    quantity: 100,
                    facility: "Cơ sở Thanh Xuân",
                    location: "Phòng khám Đa khoa MEDLATEC Thanh Xuân",
                    startTime: "07:30",
                    endTime: "11:30",
                    personInCharge: "Phạm Minh Tuấn",
                    status: "DA_DUYET"
                },
                {
                    scheduleId: "SCH-VTT-02",
                    scheduleType: "NGOAI_VIEN",
                    examDate: "2026-09-15",
                    quantity: 150,
                    facility: "Cơ sở Thanh Xuân",
                    location: "Tòa nhà Viettel Tower, Trần Hữu Dực",
                    startTime: "07:00",
                    endTime: "12:00",
                    personInCharge: "Phạm Minh Tuấn",
                    status: "DA_DUYET"
                },
                {
                    scheduleId: "SCH-VTT-03",
                    scheduleType: "LICH_PHUONG",
                    examDate: "2026-09-20",
                    quantity: 80,
                    facility: "Cơ sở Thanh Xuân",
                    location: "Trạm Y tế Phường Nhân Chính",
                    startTime: "08:00",
                    endTime: "11:30",
                    personInCharge: "Lê Văn Cường",
                    status: "CHO_DUYET"
                }
            ]
        },

        // MASTER 3: BIDV (CASE 4: 5 child schedules on SAME DATE 16/09/2026)
        {
            unitId: "U-003",
            code: "LK-2026-003",
            customerName: "Ngân hàng BIDV Hà Nội",
            personInCharge: "Đỗ Hải Đăng",
            facility: "Cơ sở Mỹ Đình",
            childSchedules: [
                {
                    scheduleId: "SCH-BIDV-01",
                    scheduleType: "TAI_VIEN",
                    examDate: "2026-09-16",
                    quantity: 120,
                    facility: "Cơ sở Mỹ Đình",
                    location: "MEDLATEC Mỹ Đình",
                    startTime: "07:30",
                    endTime: "11:30",
                    personInCharge: "Đỗ Hải Đăng",
                    status: "DA_DUYET"
                },
                {
                    scheduleId: "SCH-BIDV-02",
                    scheduleType: "TAI_VIEN",
                    examDate: "2026-09-16",
                    quantity: 100,
                    facility: "Cơ sở Cầu Giấy",
                    location: "MEDLATEC Cầu Giấy",
                    startTime: "08:00",
                    endTime: "11:30",
                    personInCharge: "Nguyễn Văn An",
                    status: "DA_DUYET"
                },
                {
                    scheduleId: "SCH-BIDV-03",
                    scheduleType: "NGOAI_VIEN",
                    examDate: "2026-09-16",
                    quantity: 150,
                    facility: "Cơ sở Mỹ Đình",
                    location: "Hội trường BIDV Tower, Nam Từ Liêm",
                    startTime: "07:00",
                    endTime: "12:00",
                    personInCharge: "Trần Văn Bình",
                    status: "DANG_THUC_HIEN"
                },
                {
                    scheduleId: "SCH-BIDV-04",
                    scheduleType: "NGOAI_VIEN",
                    examDate: "2026-09-16",
                    quantity: 90,
                    facility: "Cơ sở Thanh Xuân",
                    location: "Chi nhánh BIDV Thanh Xuân",
                    startTime: "07:30",
                    endTime: "11:30",
                    personInCharge: "Phạm Minh Tuấn",
                    status: "DANG_THUC_HIEN"
                },
                {
                    scheduleId: "SCH-BIDV-05",
                    scheduleType: "LICH_PHUONG",
                    examDate: "2026-09-16",
                    quantity: 90,
                    facility: "Cơ sở Mỹ Đình",
                    location: "Trạm Y tế Phường Cầu Diễn",
                    startTime: "08:00",
                    endTime: "11:30",
                    personInCharge: "Lê Hoàng Nam",
                    status: "CHO_DUYET"
                }
            ]
        },

        // MASTER 4: Công ty TNHH ABC (CASE 1: Single child schedule)
        {
            unitId: "U-004",
            code: "LK-2026-004",
            customerName: "Công ty TNHH ABC",
            personInCharge: "Nguyễn Văn An",
            facility: "Cơ sở Mỹ Đình",
            childSchedules: [
                {
                    scheduleId: "SCH-260901",
                    scheduleType: "TAI_VIEN",
                    examDate: "2026-09-01",
                    quantity: 85,
                    facility: "Cơ sở Mỹ Đình",
                    location: "Bệnh viện Đa khoa MEDLATEC Mỹ Đình",
                    startTime: "07:30",
                    endTime: "11:30",
                    personInCharge: "Nguyễn Văn An",
                    status: "DA_DUYET"
                }
            ]
        },

        // MASTER 5: Tổng Công ty Sông Đà (CASE 5: Master has 0 child schedules -> NOT rendered on calendar)
        {
            unitId: "U-005",
            code: "LK-2026-005",
            customerName: "Tổng Công ty Sông Đà (Lịch mới khởi tạo)",
            personInCharge: "Trần Văn Bình",
            facility: "Cơ sở Hà Đông",
            childSchedules: [] // Empty child schedules
        },

        // MASTER 6: Tập đoàn Vingroup
        {
            unitId: "U-006",
            code: "LK-2026-006",
            customerName: "Tập đoàn VinGroup",
            personInCharge: "Trần Văn Bình",
            facility: "Cơ sở Mỹ Đình",
            childSchedules: [
                {
                    scheduleId: "SCH-VIN-01",
                    scheduleType: "TAI_VIEN",
                    examDate: "2026-09-05",
                    quantity: 160,
                    facility: "Cơ sở Mỹ Đình",
                    location: "MEDLATEC Mỹ Đình",
                    startTime: "07:30",
                    endTime: "11:30",
                    personInCharge: "Trần Văn Bình",
                    status: "HOAN_THANH"
                },
                {
                    scheduleId: "SCH-VIN-02",
                    scheduleType: "NGOAI_VIEN",
                    examDate: "2026-09-05",
                    quantity: 140,
                    facility: "Cơ sở Mỹ Đình",
                    location: "Tòa nhà Symphony, Vinhomes Riverside",
                    startTime: "08:00",
                    endTime: "12:00",
                    personInCharge: "Trần Văn Bình",
                    status: "DA_DUYET"
                }
            ]
        },

        // MASTER 7: UBND Phường Mỹ Đình 1 & Tập đoàn XYZ
        {
            unitId: "U-007",
            code: "LK-2026-007",
            customerName: "Công ty Tập đoàn XYZ",
            personInCharge: "Trần Văn Bình",
            facility: "Cơ sở Cầu Giấy",
            childSchedules: [
                {
                    scheduleId: "SCH-260902-1",
                    scheduleType: "NGOAI_VIEN",
                    examDate: "2026-09-02",
                    quantity: 120,
                    facility: "Cơ sở Cầu Giấy",
                    location: "Tòa nhà Keangnam, Cầu Giấy",
                    startTime: "07:00",
                    endTime: "12:00",
                    personInCharge: "Trần Văn Bình",
                    status: "DA_DUYET"
                }
            ]
        },
        {
            unitId: "U-008",
            code: "LK-2026-008",
            customerName: "UBND Phường Mỹ Đình 1",
            personInCharge: "Lê Hoàng Nam",
            facility: "Cơ sở Mỹ Đình",
            childSchedules: [
                {
                    scheduleId: "SCH-260902-2",
                    scheduleType: "LICH_PHUONG",
                    examDate: "2026-09-02",
                    quantity: 90,
                    facility: "Cơ sở Mỹ Đình",
                    location: "Trạm Y tế Phường Mỹ Đình 1",
                    startTime: "08:00",
                    endTime: "11:30",
                    personInCharge: "Lê Hoàng Nam",
                    status: "CHO_DUYET"
                }
            ]
        },

        // MASTER 9: Ngân hàng Vietcombank & Dược Vimed (03/09/2026)
        {
            unitId: "U-009",
            code: "LK-2026-009",
            customerName: "Ngân hàng Vietcombank",
            personInCharge: "Nguyễn Văn An",
            facility: "Cơ sở Cầu Giấy",
            childSchedules: [
                {
                    scheduleId: "SCH-260903-1",
                    scheduleType: "TAI_VIEN",
                    examDate: "2026-09-03",
                    quantity: 140,
                    facility: "Cơ sở Cầu Giấy",
                    location: "Phòng khám Đa khoa MEDLATEC Cầu Giấy",
                    startTime: "07:30",
                    endTime: "11:30",
                    personInCharge: "Nguyễn Văn An",
                    status: "DA_DUYET"
                }
            ]
        },
        {
            unitId: "U-010",
            code: "LK-2026-010",
            customerName: "Công ty Dược phẩm Vimed",
            personInCharge: "Phạm Minh Tuấn",
            facility: "Cơ sở Mỹ Đình",
            childSchedules: [
                {
                    scheduleId: "SCH-260903-2",
                    scheduleType: "NGOAI_VIEN",
                    examDate: "2026-09-03",
                    quantity: 110,
                    facility: "Cơ sở Mỹ Đình",
                    location: "Nhà máy Dược phẩm Vimed, Mỹ Đình",
                    startTime: "08:00",
                    endTime: "12:00",
                    personInCharge: "Phạm Minh Tuấn",
                    status: "DANG_THUC_HIEN"
                }
            ]
        },

        // MASTER 11: UBND Phường Dịch Vọng (04/09/2026)
        {
            unitId: "U-011",
            code: "LK-2026-011",
            customerName: "UBND Phường Dịch Vọng",
            personInCharge: "Lê Văn Cường",
            facility: "Cơ sở Cầu Giấy",
            childSchedules: [
                {
                    scheduleId: "SCH-260904",
                    scheduleType: "LICH_PHUONG",
                    examDate: "2026-09-04",
                    quantity: 180,
                    facility: "Cơ sở Cầu Giấy",
                    location: "Nhà văn hóa Phường Dịch Vọng",
                    startTime: "07:00",
                    endTime: "11:30",
                    personInCharge: "Lê Văn Cường",
                    status: "CHO_DUYET"
                }
            ]
        },

        // MASTER 12: UBND Phường Mộ Lao (07/09/2026)
        {
            unitId: "U-012",
            code: "LK-2026-012",
            customerName: "UBND Phường Mộ Lao",
            personInCharge: "Lê Hoàng Nam",
            facility: "Cơ sở Hà Đông",
            childSchedules: [
                {
                    scheduleId: "SCH-260907-2",
                    scheduleType: "LICH_PHUONG",
                    examDate: "2026-09-07",
                    quantity: 80,
                    facility: "Cơ sở Hà Đông",
                    location: "Trạm Y tế Phường Mộ Lao",
                    startTime: "08:00",
                    endTime: "11:30",
                    personInCharge: "Lê Hoàng Nam",
                    status: "CHO_DUYET"
                }
            ]
        },

        // MASTER 13: Samsung R&D (08/09/2026)
        {
            unitId: "U-013",
            code: "LK-2026-013",
            customerName: "Công ty Samsung R&D",
            personInCharge: "Phạm Minh Tuấn",
            facility: "Cơ sở Mỹ Đình",
            childSchedules: [
                {
                    scheduleId: "SCH-260908",
                    scheduleType: "NGOAI_VIEN",
                    examDate: "2026-09-08",
                    quantity: 210,
                    facility: "Cơ sở Mỹ Đình",
                    location: "Tòa nhà Samsung R&D, Mỹ Đình 2",
                    startTime: "07:00",
                    endTime: "12:00",
                    personInCharge: "Phạm Minh Tuấn",
                    status: "DANG_THUC_HIEN"
                }
            ]
        },

        // MASTER 14: Công ty MISA, SSI, TKV, Nhân Chính (09/09/2026)
        {
            unitId: "U-014",
            code: "LK-2026-014",
            customerName: "Công ty CP phần mềm MISA",
            personInCharge: "Nguyễn Văn An",
            facility: "Cơ sở Cầu Giấy",
            childSchedules: [
                {
                    scheduleId: "SCH-260909-1",
                    scheduleType: "TAI_VIEN",
                    examDate: "2026-09-09",
                    quantity: 120,
                    facility: "Cơ sở Cầu Giấy",
                    location: "MEDLATEC Cầu Giấy",
                    startTime: "07:30",
                    endTime: "11:30",
                    personInCharge: "Nguyễn Văn An",
                    status: "DA_DUYET"
                }
            ]
        },
        {
            unitId: "U-015",
            code: "LK-2026-015",
            customerName: "Tập đoàn Than Khoáng sản TKV",
            personInCharge: "Đỗ Hải Đăng",
            facility: "Cơ sở Thanh Xuân",
            childSchedules: [
                {
                    scheduleId: "SCH-260909-3",
                    scheduleType: "NGOAI_VIEN",
                    examDate: "2026-09-09",
                    quantity: 150,
                    facility: "Cơ sở Thanh Xuân",
                    location: "Tòa nhà TKV, Lê Văn Lương",
                    startTime: "07:00",
                    endTime: "12:00",
                    personInCharge: "Đỗ Hải Đăng",
                    status: "DA_DUYET"
                }
            ]
        },

        // MASTER 16: Honda & Canon (11/09/2026)
        {
            unitId: "U-016",
            code: "LK-2026-016",
            customerName: "Công ty Honda Việt Nam",
            personInCharge: "Nguyễn Văn An",
            facility: "Cơ sở Mỹ Đình",
            childSchedules: [
                {
                    scheduleId: "SCH-260911-1",
                    scheduleType: "TAI_VIEN",
                    examDate: "2026-09-11",
                    quantity: 110,
                    facility: "Cơ sở Mỹ Đình",
                    location: "MEDLATEC Mỹ Đình",
                    startTime: "07:30",
                    endTime: "11:30",
                    personInCharge: "Nguyễn Văn An",
                    status: "HOAN_THANH"
                }
            ]
        },
        {
            unitId: "U-017",
            code: "LK-2026-017",
            customerName: "Công ty Canon Việt Nam",
            personInCharge: "Trần Văn Bình",
            facility: "Cơ sở Mỹ Đình",
            childSchedules: [
                {
                    scheduleId: "SCH-260911-2",
                    scheduleType: "NGOAI_VIEN",
                    examDate: "2026-09-11",
                    quantity: 160,
                    facility: "Cơ sở Mỹ Đình",
                    location: "KCN Bắc Thăng Long",
                    startTime: "07:00",
                    endTime: "12:00",
                    personInCharge: "Trần Văn Bình",
                    status: "HOAN_THANH"
                }
            ]
        },

        // MASTER 18: VNPT & ĐH Quốc Gia (14/09/2026)
        {
            unitId: "U-018",
            code: "LK-2026-018",
            customerName: "Công ty Viễn thông VNPT",
            personInCharge: "Phạm Minh Tuấn",
            facility: "Cơ sở Thanh Xuân",
            childSchedules: [
                {
                    scheduleId: "SCH-260914-1",
                    scheduleType: "NGOAI_VIEN",
                    examDate: "2026-09-14",
                    quantity: 190,
                    facility: "Cơ sở Thanh Xuân",
                    location: "Tòa nhà VNPT Tower, Nguyễn Trãi",
                    startTime: "07:00",
                    endTime: "12:00",
                    personInCharge: "Phạm Minh Tuấn",
                    status: "DA_DUYET"
                }
            ]
        },

        // MASTER 19: Điện lực Hà Nội (18/09/2026)
        {
            unitId: "U-019",
            code: "LK-2026-019",
            customerName: "Công ty Điện lực Hà Nội",
            personInCharge: "Trần Văn Bình",
            facility: "Cơ sở Mỹ Đình",
            childSchedules: [
                {
                    scheduleId: "SCH-260918-2",
                    scheduleType: "NGOAI_VIEN",
                    examDate: "2026-09-18",
                    quantity: 165,
                    facility: "Cơ sở Mỹ Đình",
                    location: "Hội trường EVN Hà Nội",
                    startTime: "07:00",
                    endTime: "12:00",
                    personInCharge: "Trần Văn Bình",
                    status: "DA_DUYET"
                }
            ]
        },

        // MASTER 20: Tập đoàn Hòa Phát (21/09/2026)
        {
            unitId: "U-020",
            code: "LK-2026-020",
            customerName: "Tập đoàn Hòa Phát",
            personInCharge: "Nguyễn Văn An",
            facility: "Cơ sở Mỹ Đình",
            childSchedules: [
                {
                    scheduleId: "SCH-260921-1",
                    scheduleType: "NGOAI_VIEN",
                    examDate: "2026-09-21",
                    quantity: 220,
                    facility: "Cơ sở Mỹ Đình",
                    location: "Tòa nhà Hòa Phát, Mỹ Đình",
                    startTime: "07:00",
                    endTime: "12:00",
                    personInCharge: "Nguyễn Văn An",
                    status: "DA_DUYET"
                }
            ]
        },

        // MASTER 21: Techcombank (23/09/2026)
        {
            unitId: "U-021",
            code: "LK-2026-021",
            customerName: "Ngân hàng Techcombank",
            personInCharge: "Phạm Minh Tuấn",
            facility: "Cơ sở Mỹ Đình",
            childSchedules: [
                {
                    scheduleId: "SCH-260923-1",
                    scheduleType: "NGOAI_VIEN",
                    examDate: "2026-09-23",
                    quantity: 145,
                    facility: "Cơ sở Mỹ Đình",
                    location: "Tòa nhà Techcombank, Cầu Giấy",
                    startTime: "07:30",
                    endTime: "11:30",
                    personInCharge: "Phạm Minh Tuấn",
                    status: "DA_DUYET"
                }
            ]
        },

        // MASTER 22: Geleximco (25/09/2026)
        {
            unitId: "U-022",
            code: "LK-2026-022",
            customerName: "Tập đoàn Geleximco",
            personInCharge: "Nguyễn Văn An",
            facility: "Cơ sở Mỹ Đình",
            childSchedules: [
                {
                    scheduleId: "SCH-260925-2",
                    scheduleType: "NGOAI_VIEN",
                    examDate: "2026-09-25",
                    quantity: 150,
                    facility: "Cơ sở Mỹ Đình",
                    location: "Tòa nhà Geleximco, Hoàng Cầu",
                    startTime: "07:00",
                    endTime: "12:00",
                    personInCharge: "Nguyễn Văn An",
                    status: "DA_DUYET"
                }
            ]
        },

        // MASTER 23: Sơn Hà Group (28/09/2026)
        {
            unitId: "U-023",
            code: "LK-2026-023",
            customerName: "Công ty Sơn Hà Group",
            personInCharge: "Phạm Minh Tuấn",
            facility: "Cơ sở Hà Đông",
            childSchedules: [
                {
                    scheduleId: "SCH-260928-1",
                    scheduleType: "NGOAI_VIEN",
                    examDate: "2026-09-28",
                    quantity: 140,
                    facility: "Cơ sở Hà Đông",
                    location: "Tòa nhà Sơn Hà, Hà Đông",
                    startTime: "07:30",
                    endTime: "11:30",
                    personInCharge: "Phạm Minh Tuấn",
                    status: "DA_DUYET"
                }
            ]
        }
    ];

    // Cache of extracted child schedule items
    let allChildSchedulesCache = [];

    // ==========================================================================
    // 2. DATA EXTRACTION LAYER (MASTER -> CHILD EXTRACTION)
    // ==========================================================================
    
    /**
     * Extracts and combines child schedules from MWKDataStore and seedMasterUnits
     */
    function extractAllChildSchedules() {
        const childSchedules = [];

        // 1. Fetch Master Records from MWKDataStore
        let dataStoreMasters = [];
        if (window.MWKDataStore && typeof window.MWKDataStore.getKskSchedules === 'function') {
            try {
                dataStoreMasters = window.MWKDataStore.getKskSchedules() || [];
            } catch (e) {
                console.error("Lỗi khi đọc dữ liệu từ MWKDataStore:", e);
            }
        }

        // Helper to push extracted sub-schedules
        const processMasterRecord = (master) => {
            const unitId = String(master.id || master.unitId || master.code || master.maLich);
            const unitName = master.customerName || master.teamName || master.unitName || "Đơn vị KSK";
            const masterCode = master.code || master.maLich || unitId;
            const defaultPic = master.personInCharge || master.contactPerson || "Cán bộ phụ trách";
            const defaultFacility = master.facility || "Cơ sở MEDLATEC";

            // If master object has direct childSchedules array (from seed)
            if (Array.isArray(master.childSchedules)) {
                master.childSchedules.forEach((sub, idx) => {
                    childSchedules.push({
                        id: sub.scheduleId || sub.id || `${unitId}-${idx}`,
                        scheduleId: sub.scheduleId || sub.maLich || sub.id || `${unitId}-${idx + 1}`,
                        unitId: unitId,
                        unitName: unitName,
                        masterCode: masterCode,
                        scheduleType: sub.scheduleType || "TAI_VIEN",
                        examDate: sub.examDate || sub.ngayKham || "2026-09-15",
                        quantity: Number(sub.quantity || sub.soLuongKhach || sub.soLuong || 0),
                        facility: sub.facility || defaultFacility,
                        location: sub.location || sub.diaDiemKham || master.examLocation || "Địa điểm khám",
                        startTime: sub.startTime || "07:30",
                        endTime: sub.endTime || "11:30",
                        session: sub.session || "Sáng",
                        personInCharge: sub.personInCharge || defaultPic,
                        status: sub.status || sub.trangThai || "CHO_TONG_HOP",
                        rawSubObject: sub,
                        rawMasterObject: master
                    });
                });
            }

            // If master object has step2Data (from MWKDataStore CRUD)
            if (master.step2Data) {
                const types = [
                    { key: 'taiVien', scheduleType: 'TAI_VIEN' },
                    { key: 'ngoaiVien', scheduleType: 'NGOAI_VIEN' },
                    { key: 'lichPhuong', scheduleType: 'LICH_PHUONG' }
                ];

                types.forEach(({ key, scheduleType }) => {
                    const subList = master.step2Data[key];
                    if (Array.isArray(subList)) {
                        subList.forEach((sub, idx) => {
                            childSchedules.push({
                                id: sub.id || sub.scheduleId || `${unitId}-${scheduleType}-${idx}`,
                                scheduleId: sub.scheduleId || sub.maLich || sub.id || `${unitId}-${idx + 1}`,
                                unitId: unitId,
                                unitName: unitName,
                                masterCode: masterCode,
                                scheduleType: scheduleType,
                                examDate: sub.ngayKham || sub.examDate || master.examDate || "2026-09-15",
                                quantity: Number(sub.soLuongKhach || sub.quantity || sub.soLuong || 0),
                                facility: sub.facility || defaultFacility,
                                location: sub.diaDiemKham || sub.location || master.examLocation || "Địa điểm khám",
                                startTime: sub.startTime || "07:30",
                                endTime: sub.endTime || "11:30",
                                session: sub.session || "Sáng",
                                personInCharge: sub.personInCharge || defaultPic,
                                status: sub.trangThai || sub.status || "CHO_TONG_HOP",
                                rawSubObject: sub,
                                rawMasterObject: master
                            });
                        });
                    }
                });
            }
        };

        // Process seed master units first
        seedMasterUnits.forEach(processMasterRecord);

        // Process data store masters (ignoring duplicates if unitId exists)
        const processedUnitIds = new Set(seedMasterUnits.map(m => String(m.unitId || m.id || m.code)));
        dataStoreMasters.forEach(master => {
            const masterId = String(master.id || master.code || master.maLich);
            if (!processedUnitIds.has(masterId)) {
                processMasterRecord(master);
                processedUnitIds.add(masterId);
            }
        });

        allChildSchedulesCache = childSchedules;
        return childSchedules;
    }

    /**
     * Get summary metrics for a specific unit
     */
    function getUnitScheduleSummary(unitId) {
        const allChilds = allChildSchedulesCache.length > 0 ? allChildSchedulesCache : extractAllChildSchedules();
        const unitSchedules = allChilds.filter(s => String(s.unitId) === String(unitId));

        return {
            unitId: unitId,
            totalSchedules: unitSchedules.length,
            totalQuantity: unitSchedules.reduce((sum, s) => sum + s.quantity, 0),
            taiVienCount: unitSchedules.filter(s => s.scheduleType === 'TAI_VIEN').length,
            ngoaiVienCount: unitSchedules.filter(s => s.scheduleType === 'NGOAI_VIEN').length,
            phuongCount: unitSchedules.filter(s => s.scheduleType === 'LICH_PHUONG').length,
            childSchedules: unitSchedules
        };
    }

    // ==========================================================================
    // LIFECYCLE & DOM INIT
    // ==========================================================================
    document.addEventListener('DOMContentLoaded', function () {
        initControls();
        renderDashboard();
    });

    function initControls() {
        const monthSelect = document.getElementById('filter-month');
        if (monthSelect) {
            monthSelect.value = '2026-09';
        }
    }

    // ==========================================================================
    // 3. FILTERING & SUMMARY CALCULATIONS
    // ==========================================================================

    /**
     * Filters all extracted child schedules based on activeFilters
     */
    function filterChildSchedules(allSchedules) {
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

            // Search Keyword Filter (Searches Unit Name, Child Code, Master Code, Person In Charge)
            if (activeFilters.search) {
                const unitStr = (item.unitName || '').toLowerCase();
                const childCodeStr = (item.scheduleId || '').toLowerCase();
                const masterCodeStr = (item.masterCode || '').toLowerCase();
                const picStr = (item.personInCharge || '').toLowerCase();
                
                if (!unitStr.includes(activeFilters.search) && 
                    !childCodeStr.includes(activeFilters.search) && 
                    !masterCodeStr.includes(activeFilters.search) && 
                    !picStr.includes(activeFilters.search)) {
                    return false;
                }
            }

            return true;
        });
    }

    /**
     * Calculate Summary Cards Statistics from filtered CHILD SCHEDULES
     */
    function calculateMonthlySummary(filteredChilds) {
        const totalSchedules = filteredChilds.length;
        const totalPatients = filteredChilds.reduce((sum, item) => sum + (parseInt(item.quantity) || 0), 0);

        const taiVienChilds = filteredChilds.filter(item => item.scheduleType === 'TAI_VIEN');
        const ngoaiVienChilds = filteredChilds.filter(item => item.scheduleType === 'NGOAI_VIEN');
        const phuongChilds = filteredChilds.filter(item => item.scheduleType === 'LICH_PHUONG');

        return {
            totalSchedules,
            totalPatients,
            taiVienPatients: taiVienChilds.reduce((sum, item) => sum + (parseInt(item.quantity) || 0), 0),
            taiVienCount: taiVienChilds.length,
            ngoaiVienPatients: ngoaiVienChilds.reduce((sum, item) => sum + (parseInt(item.quantity) || 0), 0),
            ngoaiVienCount: ngoaiVienChilds.length,
            phuongPatients: phuongChilds.reduce((sum, item) => sum + (parseInt(item.quantity) || 0), 0),
            phuongCount: phuongChilds.length
        };
    }

    /**
     * Render Top 5 Summary Cards
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

    // ==========================================================================
    // 4. MONTH CALENDAR RENDERING (MASTER GROUP EVENT CARDS)
    // ==========================================================================

    /**
     * Render Monthly Calendar Grid
     */
    function renderCalendar(filteredChilds) {
        const container = document.getElementById('calendar-days-container');
        const emptyStateMsg = document.getElementById('empty-state-message');
        if (!container) return;

        container.innerHTML = '';

        const [year, monthNum] = activeFilters.month.split('-').map(Number);
        const month = monthNum - 1; // 0-indexed

        // First day of current month
        const firstDayOfMonth = new Date(year, month, 1);
        let dayOfWeek = firstDayOfMonth.getDay();
        let firstDayIndex = (dayOfWeek + 6) % 7; // Monday = 0 ... Sunday = 6

        // Total days in current month & previous month
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const prevMonthDays = new Date(year, month, 0).getDate();

        // Group filtered child schedules by Date (YYYY-MM-DD)
        const childsByDateMap = {};
        filteredChilds.forEach(item => {
            if (!childsByDateMap[item.examDate]) {
                childsByDateMap[item.examDate] = [];
            }
            childsByDateMap[item.examDate].push(item);
        });

        const todayStr = `${todayDate.getFullYear()}-${String(todayDate.getMonth() + 1).padStart(2, '0')}-${String(todayDate.getDate()).padStart(2, '0')}`;

        // Empty State Check
        if (filteredChilds.length === 0 && emptyStateMsg) {
            emptyStateMsg.classList.remove('hidden');
        } else if (emptyStateMsg) {
            emptyStateMsg.classList.add('hidden');
        }

        // 1. Render Previous Month Padding Days
        for (let i = firstDayIndex - 1; i >= 0; i--) {
            const dayNum = prevMonthDays - i;
            const cellElem = renderCalendarDayCell(dayNum, '', [], false, true);
            container.appendChild(cellElem);
        }

        // 2. Render Current Month Days
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayChilds = childsByDateMap[dateStr] || [];
            const isToday = dateStr === todayStr;

            const cellElem = renderCalendarDayCell(day, dateStr, dayChilds, isToday, false);
            container.appendChild(cellElem);
        }

        // 3. Render Next Month Padding Days to complete 35 or 42 grid cells
        const totalRendered = firstDayIndex + daysInMonth;
        const nextMonthPadding = (totalRendered <= 35) ? (35 - totalRendered) : (42 - totalRendered);

        for (let i = 1; i <= nextMonthPadding; i++) {
            const cellElem = renderCalendarDayCell(i, '', [], false, true);
            container.appendChild(cellElem);
        }
    }

    /**
     * Render Individual Calendar Day Cell containing Master Group Events
     */
    function renderCalendarDayCell(dayNum, dateStr, dayChilds, isToday, isOtherMonth) {
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

        cell.className = `calendar-day-cell p-1.5 flex flex-col justify-between cursor-pointer select-none relative ${isToday ? 'today-cell' : ''}`;

        let cellBodyContent = '';

        if (dayChilds.length > 0) {
            // Calculate Day Level Totals
            const totalGuestsOnDay = dayChilds.reduce((sum, item) => sum + item.quantity, 0);

            // Group Child Schedules by Master (unitId)
            const masterGroupsMap = {};
            dayChilds.forEach(child => {
                const uId = String(child.unitId || child.unitName);
                if (!masterGroupsMap[uId]) {
                    masterGroupsMap[uId] = {
                        unitId: uId,
                        unitName: child.unitName,
                        masterCode: child.masterCode,
                        date: dateStr,
                        childSchedules: []
                    };
                }
                masterGroupsMap[uId].childSchedules.push(child);
            });

            const masterGroupsList = Object.values(masterGroupsMap);
            
            // Render Master Group Cards (Max 2-3 visible, + hidden count)
            const displayGroups = masterGroupsList.slice(0, 2);
            const hiddenGroupsCount = masterGroupsList.length - displayGroups.length;

            let masterCardsHtml = '';
            displayGroups.forEach(group => {
                masterCardsHtml += renderMasterGroupEventCard(group);
            });

            if (hiddenGroupsCount > 0) {
                masterCardsHtml += `
                    <div class="text-[10px] text-[#27496D] font-bold mt-1 text-center bg-[#E8F1FB] py-1 rounded-[3px] hover:underline">
                        + ${hiddenGroupsCount} đơn vị khác
                    </div>
                `;
            }

            cellBodyContent = `
                <div class="space-y-1">
                    <div class="bg-[#F1F5F9] px-1.5 py-0.5 rounded-[3px] flex items-center justify-between border border-[#E2E8F0]">
                        <span class="text-[10px] font-bold text-[#27496D]">Tổng ${totalGuestsOnDay.toLocaleString('vi-VN')} người</span>
                        <span class="text-[9.5px] font-semibold text-[#6B7280]">${masterGroupsList.length} đơn vị</span>
                    </div>

                    <div class="pt-0.5 space-y-1 day-unit-list max-h-[110px] overflow-y-auto pr-0.5">
                        ${masterCardsHtml}
                    </div>
                </div>
            `;
        }

        cell.innerHTML = `
            <div class="flex items-center justify-between border-b border-[#F0F3F7] pb-1 mb-1">
                ${isToday ? '<span class="px-1.5 py-0.2 rounded-full bg-[#27496D] text-white text-[9px] font-bold uppercase tracking-wider">HÔM NAY</span>' : '<span></span>'}
                <span class="text-xs font-extrabold ${isToday ? 'text-[#27496D]' : 'text-[#1F2937]'}">${dayNum}</span>
            </div>
            <div class="flex-1 flex flex-col justify-start">
                ${cellBodyContent}
            </div>
        `;

        // Click Event Handler on Day Cell / Master Group Card
        cell.addEventListener('click', function (e) {
            const masterCardElem = e.target.closest('.master-group-card');
            if (masterCardElem) {
                e.stopPropagation();
                const unitId = masterCardElem.getAttribute('data-unit-id');
                const targetGroup = dayChilds.filter(s => String(s.unitId) === String(unitId));
                openDayDrawer(dateStr, targetGroup, unitId);
                return;
            }

            openDayDrawer(dateStr, dayChilds, null);
        });

        return cell;
    }

    /**
     * Render ONE Master Group Event Card for a cell
     */
    function renderMasterGroupEventCard(group) {
        const { unitId, unitName, childSchedules, date } = group;
        const countOnDate = childSchedules.length;
        const totalGuests = childSchedules.reduce((sum, s) => sum + s.quantity, 0);

        const tvCount = childSchedules.filter(s => s.scheduleType === 'TAI_VIEN').length;
        const nvCount = childSchedules.filter(s => s.scheduleType === 'NGOAI_VIEN').length;
        const tpCount = childSchedules.filter(s => s.scheduleType === 'LICH_PHUONG').length;

        let breakdownHtml = '';

        if (countOnDate > 1) {
            // Multi-child breakdown: 🏥 1 · 🚐 1 · 🏘 1
            const badges = [];
            if (tvCount > 0) badges.push(`<span class="inline-flex items-center gap-0.5 font-bold text-[#27496D]" title="${tvCount} Lịch tại viện"><span class="w-1.5 h-1.5 rounded-full badge-dot-tai-vien inline-block"></span>🏥 ${tvCount}</span>`);
            if (nvCount > 0) badges.push(`<span class="inline-flex items-center gap-0.5 font-bold text-[#D97706]" title="${nvCount} Lịch ngoại viện"><span class="w-1.5 h-1.5 rounded-full badge-dot-ngoai-vien inline-block"></span>🚐 ${nvCount}</span>`);
            if (tpCount > 0) badges.push(`<span class="inline-flex items-center gap-0.5 font-bold text-[#7E22CE]" title="${tpCount} Lịch tại phường"><span class="w-1.5 h-1.5 rounded-full badge-dot-phuong inline-block"></span>🏘 ${tpCount}</span>`);
            breakdownHtml = badges.join('<span class="text-[#CBD5E1] mx-0.5">•</span>');
        } else {
            // Single child on this date
            const sch = childSchedules[0];
            let label = '🏥 Tại viện 1';
            let colorClass = 'text-[#27496D]';
            let dotClass = 'badge-dot-tai-vien';

            if (sch.scheduleType === 'NGOAI_VIEN') {
                label = '🚐 Ngoại viện 1';
                colorClass = 'text-[#D97706]';
                dotClass = 'badge-dot-ngoai-vien';
            } else if (sch.scheduleType === 'LICH_PHUONG') {
                label = '🏘 Tại phường 1';
                colorClass = 'text-[#7E22CE]';
                dotClass = 'badge-dot-phuong';
            }

            breakdownHtml = `<span class="inline-flex items-center gap-1 font-bold ${colorClass}"><span class="w-1.5 h-1.5 rounded-full ${dotClass} inline-block"></span>${label}</span>`;
        }

        return `
            <div class="master-group-card bg-white hover:bg-[#F0F7FF] border border-[#CBD5E1] hover:border-[#27496D] p-1.5 rounded-[4px] shadow-2xs cursor-pointer transition-all space-y-1 text-xs select-none"
                 data-unit-id="${escapeHtml(unitId)}" 
                 data-date="${escapeHtml(date)}">
                <div class="flex items-center justify-between font-bold text-[11px] text-[#1F2937] leading-tight">
                    <span class="truncate text-[#27496D] flex items-center gap-1">
                        <i class="fa-solid fa-building text-[10px] text-[#27496D] shrink-0"></i>
                        <span class="truncate font-extrabold">${escapeHtml(unitName)}</span>
                    </span>
                </div>
                <div class="flex items-center justify-between text-[10px] text-[#4B5563] font-medium">
                    <span><strong class="text-[#15803D] font-bold">${totalGuests.toLocaleString('vi-VN')}</strong> khách</span>
                    <span class="bg-[#E8F1FB] text-[#27496D] px-1 py-0.2 rounded-[2px] font-bold text-[9.5px]">${countOnDate} lịch</span>
                </div>
                <div class="flex items-center gap-1 text-[10px] pt-1 border-t border-[#F0F3F7] truncate">
                    ${breakdownHtml}
                </div>
            </div>
        `;
    }

    /**
     * Main Dashboard Controller Renderer
     */
    function renderDashboard() {
        const [year, monthNum] = activeFilters.month.split('-').map(Number);
        currentYear = year;
        currentMonth = monthNum - 1;

        const monthYearLabel = document.getElementById('month-year-label');
        if (monthYearLabel) {
            monthYearLabel.innerText = `THÁNG ${monthNum} / ${year}`;
        }

        const allChilds = extractAllChildSchedules();
        const filteredChilds = filterChildSchedules(allChilds);
        const summaryData = calculateMonthlySummary(filteredChilds);

        renderSummary(summaryData);
        renderCalendar(filteredChilds);
    }

    // ==========================================================================
    // 5. DAY / GROUP DETAIL DRAWER (#day-detail-drawer)
    // ==========================================================================

    /**
     * Opens the slide-over drawer displaying grouped child schedules
     */
    function openDayDrawer(dateStr, dayChilds, targetUnitId) {
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

        const dateParts = dateStr.split('-');
        const dateDisplay = `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`;

        let displayChilds = dayChilds || [];
        if (targetUnitId) {
            displayChilds = dayChilds.filter(s => String(s.unitId) === String(targetUnitId));
        }

        // Determine Drawer Title
        if (targetUnitId && displayChilds.length > 0) {
            if (titleElem) titleElem.innerText = displayChilds[0].unitName;
        } else {
            if (titleElem) titleElem.innerText = `LỊCH KHÁM NGÀY ${dateDisplay}`;
        }

        const totalGuests = displayChilds.reduce((sum, item) => sum + item.quantity, 0);
        if (subtitleElem) subtitleElem.innerText = `Tổng: ${totalGuests.toLocaleString('vi-VN')} khách • ${displayChilds.length} lịch con`;

        renderDayDrawerContent(contentElem, displayChilds);

        if (backdrop) {
            backdrop.classList.remove('opacity-0', 'pointer-events-none');
            backdrop.classList.add('opacity-100');
        }
        drawer.classList.remove('translate-x-full');
    }

    /**
     * Renders grouped child schedule cards inside the Drawer
     */
    function renderDayDrawerContent(containerElem, childList) {
        if (childList.length === 0) {
            containerElem.innerHTML = `
                <div class="text-center py-12 text-[#9CA3AF] space-y-2">
                    <i class="fa-solid fa-calendar-xmark text-4xl"></i>
                    <p class="text-xs font-medium">Không có lịch khám sức khỏe nào trong ngày này.</p>
                </div>
            `;
            return;
        }

        // Group child schedules into 3 categories
        const taiVienList = childList.filter(i => i.scheduleType === 'TAI_VIEN');
        const ngoaiVienList = childList.filter(i => i.scheduleType === 'NGOAI_VIEN');
        const phuongList = childList.filter(i => i.scheduleType === 'LICH_PHUONG');

        let html = '';

        // Section 1: LỊCH TẠI VIỆN
        if (taiVienList.length > 0) {
            const tvCount = taiVienList.reduce((s, i) => s + i.quantity, 0);
            html += `
                <div class="bg-white rounded-[4px] border border-[#D9DEE5] overflow-hidden space-y-2 shadow-2xs">
                    <div class="bg-[#E8F1FB] px-3.5 py-2 border-b border-[#B4CBE5] flex items-center justify-between text-[#27496D]">
                        <span class="font-bold uppercase text-xs flex items-center gap-1.5">
                            <span class="w-2.5 h-2.5 rounded-full bg-[#27496D]"></span> LỊCH TẠI VIỆN
                        </span>
                        <span class="font-extrabold text-xs">${tvCount.toLocaleString('vi-VN')} người (${taiVienList.length} lịch)</span>
                    </div>
                    <div class="p-3 space-y-2.5">
                        ${renderDrawerChildItems(taiVienList)}
                    </div>
                </div>
            `;
        }

        // Section 2: LỊCH NGOẠI VIỆN
        if (ngoaiVienList.length > 0) {
            const nvCount = ngoaiVienList.reduce((s, i) => s + i.quantity, 0);
            html += `
                <div class="bg-white rounded-[4px] border border-[#D9DEE5] overflow-hidden space-y-2 shadow-2xs">
                    <div class="bg-[#FFF3E0] px-3.5 py-2 border-b border-[#FFE0B2] flex items-center justify-between text-[#E65100]">
                        <span class="font-bold uppercase text-xs flex items-center gap-1.5">
                            <span class="w-2.5 h-2.5 rounded-full bg-[#ED6C02]"></span> LỊCH NGOẠI VIỆN
                        </span>
                        <span class="font-extrabold text-xs">${nvCount.toLocaleString('vi-VN')} người (${ngoaiVienList.length} lịch)</span>
                    </div>
                    <div class="p-3 space-y-2.5">
                        ${renderDrawerChildItems(ngoaiVienList)}
                    </div>
                </div>
            `;
        }

        // Section 3: LỊCH TẠI PHƯỜNG
        if (phuongList.length > 0) {
            const tpCount = phuongList.reduce((s, i) => s + i.quantity, 0);
            html += `
                <div class="bg-white rounded-[4px] border border-[#D9DEE5] overflow-hidden space-y-2 shadow-2xs">
                    <div class="bg-[#F3E8FF] px-3.5 py-2 border-b border-[#E9D5FF] flex items-center justify-between text-[#6B21A8]">
                        <span class="font-bold uppercase text-xs flex items-center gap-1.5">
                            <span class="w-2.5 h-2.5 rounded-full bg-[#7E22CE]"></span> LỊCH TẠI PHƯỜNG
                        </span>
                        <span class="font-extrabold text-xs">${tpCount.toLocaleString('vi-VN')} người (${phuongList.length} lịch)</span>
                    </div>
                    <div class="p-3 space-y-2.5">
                        ${renderDrawerChildItems(phuongList)}
                    </div>
                </div>
            `;
        }

        containerElem.innerHTML = html;

        // Bind [ Xem chi tiết ] button clicks
        const detailButtons = containerElem.querySelectorAll('.btn-view-child-detail');
        detailButtons.forEach(btn => {
            btn.addEventListener('click', function (e) {
                e.stopPropagation();
                const schId = this.getAttribute('data-id');
                const schObj = childList.find(s => String(s.scheduleId) === String(schId) || String(s.id) === String(schId));
                if (schObj) {
                    openScheduleDetail(schObj);
                }
            });
        });
    }

    /**
     * Generates HTML for individual child schedule cards in the Drawer
     */
    function renderDrawerChildItems(items) {
        return items.map(sch => {
            const dParts = (sch.examDate || '').split('-');
            const dateStr = dParts.length === 3 ? `${dParts[2]}/${dParts[1]}/${dParts[0]}` : sch.examDate;

            return `
                <div class="drawer-schedule-item p-3 bg-[#F8FAFC] border border-[#D9DEE5] hover:border-[#27496D] rounded-[4px] transition-all space-y-2">
                    <div class="flex items-center justify-between">
                        <span class="font-bold text-[#1F2937] text-xs">Mã lịch con: <strong class="font-mono text-[#27496D] font-extrabold">${escapeHtml(sch.scheduleId)}</strong></span>
                        <span class="font-bold text-[#15803D] text-xs bg-[#E6F4EA] px-2 py-0.5 rounded-[3px]">${sch.quantity.toLocaleString('vi-VN')} khách</span>
                    </div>
                    <div class="text-[11px] font-semibold text-[#1F2937]">
                        <i class="fa-solid fa-building text-[10px] mr-1 text-[#27496D]"></i>Đơn vị: ${escapeHtml(sch.unitName)}
                    </div>
                    <div class="flex items-center justify-between text-[11px] text-[#6B7280]">
                        <span><i class="fa-solid fa-calendar-day text-[10px] mr-1 text-[#27496D]"></i>${dateStr} (${sch.startTime} – ${sch.endTime})</span>
                        <span><i class="fa-solid fa-hospital text-[10px] mr-1 text-[#27496D]"></i>${escapeHtml(sch.facility)}</span>
                    </div>
                    <div class="text-[11px] text-[#4B5563]">
                        <i class="fa-solid fa-location-dot text-[10px] mr-1 text-[#27496D]"></i>${escapeHtml(sch.location)}
                    </div>
                    <div class="flex items-center justify-between pt-2 border-t border-[#E2E8F0] text-[11px]">
                        <span class="text-[#6B7280]">CB: <strong class="text-[#1F2937]">${escapeHtml(sch.personInCharge)}</strong></span>
                        <button type="button" data-id="${escapeHtml(sch.scheduleId)}" class="btn-view-child-detail btn-primary text-xs px-3 h-[30px] flex-btn-center font-semibold cursor-pointer">
                            <i class="fa-solid fa-eye text-[11px]"></i>
                            <span>Xem chi tiết</span>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
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
    // 6. CHILD SCHEDULE DETAIL MODAL (#modal-schedule-detail)
    // ==========================================================================

    /**
     * Opens the Schedule Detail Modal with full metadata of the CHILD SCHEDULE
     */
    function openScheduleDetail(sch) {
        const modal = document.getElementById('modal-schedule-detail');
        if (!modal || !sch) return;

        renderScheduleDetailModal(sch);

        modal.classList.remove('hidden');
        modal.classList.add('flex');
    }

    function renderScheduleDetailModal(sch) {
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
        if (codeElem) codeElem.innerText = `Mã lịch con: ${sch.scheduleId || '--'}`;

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

        // Type Badge Label & Styles
        let typeLabelText = 'Tại viện';
        let badgeClass = 'type-tag-tai-vien';
        if (sch.scheduleType === 'NGOAI_VIEN') {
            typeLabelText = 'Ngoại viện';
            badgeClass = 'type-tag-ngoai-vien';
        } else if (sch.scheduleType === 'LICH_PHUONG') {
            typeLabelText = 'Tại phường';
            badgeClass = 'type-tag-phuong';
        }

        if (detailTypeElem) detailTypeElem.innerText = typeLabelText;

        if (badgeElem) {
            badgeElem.className = `px-2 py-0.5 rounded-[3px] text-[10px] font-bold ${badgeClass}`;
            badgeElem.innerText = typeLabelText;
        }

        // Status Badge Formatting
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
    // 7. NAVIGATION & FILTER ACTION HANDLERS
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
    window.getUnitScheduleSummary = getUnitScheduleSummary;
})();
