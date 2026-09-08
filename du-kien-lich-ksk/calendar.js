/**
 * PLANNING CALENDAR MODULE CONTROLLER (DỰ KIẾN LỊCH KSK)
 * Master-Child Architecture Alignment with Bảng Tổng Hợp Lịch
 * Master = Lịch khám đơn vị | Child = Lịch tại viện / Ngoại viện / Tại phường
 */

document.addEventListener('DOMContentLoaded', function () {
    initCalendarModule();
});

let currentView = 'month'; // Default 'month' view
let currentDate = new Date(2026, 8, 15); // Default to Sept 2026 for demo context
let rawSchedules = [];

const filters = {
    search: '',
    coSo: '',
    loaiLich: '', // Empty = Tất cả 3 loại
    cbPhuTrach: '',
    trangThai: ''
};

// ==========================================================================
// 1. MASTER UNITS & CHILD SCHEDULES DATA SEED (09/2026)
// ==========================================================================
const seedMasterUnits = [
    // MASTER 1: Công ty CP ABC (4 child schedules on SAME DATE 15/09/2026: 2 Tại viện, 1 Ngoại viện, 1 Tại phường)
    {
        unitId: "U-001",
        code: "LK-2026-001",
        customerName: "Công ty CP ABC",
        personInCharge: "Nguyễn Văn An",
        facility: "Cơ sở Mỹ Đình",
        childSchedules: [
            {
                scheduleId: "SCH-ABC-01",
                scheduleType: "TAI_VIEN",
                loaiLich: "Lịch tại viện",
                examDate: "2026-09-15",
                ca: "Sang",
                gioBatDau: "07:30",
                gioKetThuc: "11:30",
                soLuongKhach: 100,
                tongNhanSu: 12,
                coSo: "MEDLATEC Mỹ Đình",
                diaDiemKham: "Bệnh viện Đa khoa MEDLATEC Mỹ Đình",
                cbPhuTrach: "Nguyễn Văn An",
                trangThai: "Dự kiến"
            },
            {
                scheduleId: "SCH-ABC-02",
                scheduleType: "TAI_VIEN",
                loaiLich: "Lịch tại viện",
                examDate: "2026-09-15",
                ca: "Chieu",
                gioBatDau: "13:30",
                gioKetThuc: "17:00",
                soLuongKhach: 80,
                tongNhanSu: 10,
                coSo: "MEDLATEC Mỹ Đình",
                diaDiemKham: "Bệnh viện Đa khoa MEDLATEC Mỹ Đình",
                cbPhuTrach: "Nguyễn Văn An",
                trangThai: "Dự kiến"
            },
            {
                scheduleId: "SCH-ABC-03",
                scheduleType: "NGOAI_VIEN",
                loaiLich: "Lịch ngoại viện",
                examDate: "2026-09-15",
                ca: "Sang",
                gioBatDau: "07:00",
                gioKetThuc: "12:00",
                soLuongKhach: 100,
                tongNhanSu: 14,
                coSo: "Ngoại viện",
                diaDiemKham: "Tòa nhà ABC Tower, Cầu Giấy, Hà Nội",
                cbPhuTrach: "Trần Văn Bình",
                trangThai: "Dự kiến"
            },
            {
                scheduleId: "SCH-ABC-04",
                scheduleType: "LICH_PHUONG",
                loaiLich: "Lịch phường",
                examDate: "2026-09-15",
                ca: "Chieu",
                gioBatDau: "13:30",
                gioKetThuc: "17:00",
                soLuongKhach: 70,
                tongNhanSu: 8,
                coSo: "MEDLATEC Mỹ Đình",
                diaDiemKham: "Trạm Y tế Phường Mỹ Đình 1",
                cbPhuTrach: "Lê Hoàng Nam",
                trangThai: "Dự kiến"
            }
        ]
    },

    // MASTER 2: Công ty XYZ (3 child schedules of SINGLE TYPE "Lịch tại viện" on 15/09/2026)
    {
        unitId: "U-002",
        code: "LK-2026-002",
        customerName: "Công ty XYZ",
        personInCharge: "Nguyễn Văn An",
        facility: "Cơ sở Cầu Giấy",
        childSchedules: [
            {
                scheduleId: "SCH-XYZ-01",
                scheduleType: "TAI_VIEN",
                loaiLich: "Lịch tại viện",
                examDate: "2026-09-15",
                ca: "Sang",
                gioBatDau: "07:30",
                gioKetThuc: "11:30",
                soLuongKhach: 80,
                tongNhanSu: 10,
                coSo: "MEDLATEC Cầu Giấy",
                diaDiemKham: "Phòng khám Đa khoa MEDLATEC Cầu Giấy",
                cbPhuTrach: "Nguyễn Văn An",
                trangThai: "Dự kiến"
            },
            {
                scheduleId: "SCH-XYZ-02",
                scheduleType: "TAI_VIEN",
                loaiLich: "Lịch tại viện",
                examDate: "2026-09-15",
                ca: "Sang",
                gioBatDau: "08:00",
                gioKetThuc: "11:30",
                soLuongKhach: 80,
                tongNhanSu: 10,
                coSo: "MEDLATEC Cầu Giấy",
                diaDiemKham: "Phòng khám Đa khoa MEDLATEC Cầu Giấy",
                cbPhuTrach: "Nguyễn Văn An",
                trangThai: "Dự kiến"
            },
            {
                scheduleId: "SCH-XYZ-03",
                scheduleType: "TAI_VIEN",
                loaiLich: "Lịch tại viện",
                examDate: "2026-09-15",
                ca: "Chieu",
                gioBatDau: "13:30",
                gioKetThuc: "17:00",
                soLuongKhach: 80,
                tongNhanSu: 10,
                coSo: "MEDLATEC Cầu Giấy",
                diaDiemKham: "Phòng khám Đa khoa MEDLATEC Cầu Giấy",
                cbPhuTrach: "Nguyễn Văn An",
                trangThai: "Dự kiến"
            }
        ]
    },

    // MASTER 3: Công ty DEF (4 child schedules on 15/09/2026: 1 Tại viện, 2 Ngoại viện, 1 Phường)
    {
        unitId: "U-003",
        code: "LK-2026-003",
        customerName: "Công ty DEF",
        personInCharge: "Trần Văn Bình",
        facility: "Cơ sở Thanh Xuân",
        childSchedules: [
            {
                scheduleId: "SCH-DEF-01",
                scheduleType: "TAI_VIEN",
                loaiLich: "Lịch tại viện",
                examDate: "2026-09-15",
                ca: "Sang",
                gioBatDau: "07:30",
                gioKetThuc: "11:30",
                soLuongKhach: 90,
                tongNhanSu: 10,
                coSo: "MEDLATEC Thanh Xuân",
                diaDiemKham: "MEDLATEC Thanh Xuân",
                cbPhuTrach: "Trần Văn Bình",
                trangThai: "Dự kiến"
            },
            {
                scheduleId: "SCH-DEF-02",
                scheduleType: "NGOAI_VIEN",
                loaiLich: "Lịch ngoại viện",
                examDate: "2026-09-15",
                ca: "Sang",
                gioBatDau: "07:00",
                gioKetThuc: "12:00",
                soLuongKhach: 120,
                tongNhanSu: 14,
                coSo: "Ngoại viện",
                diaDiemKham: "Tòa nhà DEF, Thanh Xuân",
                cbPhuTrach: "Trần Văn Bình",
                trangThai: "Dự kiến"
            },
            {
                scheduleId: "SCH-DEF-03",
                scheduleType: "NGOAI_VIEN",
                loaiLich: "Lịch ngoại viện",
                examDate: "2026-09-15",
                ca: "Chieu",
                gioBatDau: "13:30",
                gioKetThuc: "17:00",
                soLuongKhach: 100,
                tongNhanSu: 12,
                coSo: "Ngoại viện",
                diaDiemKham: "Nhà máy DEF, Nam Từ Liêm",
                cbPhuTrach: "Phạm Minh Tuấn",
                trangThai: "Dự kiến"
            },
            {
                scheduleId: "SCH-DEF-04",
                scheduleType: "LICH_PHUONG",
                loaiLich: "Lịch phường",
                examDate: "2026-09-15",
                ca: "Chieu",
                gioBatDau: "13:30",
                gioKetThuc: "17:00",
                soLuongKhach: 80,
                tongNhanSu: 8,
                coSo: "MEDLATEC Thanh Xuân",
                diaDiemKham: "Trạm Y tế Phường Nhân Chính",
                cbPhuTrach: "Lê Hoàng Nam",
                trangThai: "Dự kiến"
            }
        ]
    },

    // MASTER 4: Tập đoàn Viettel (child schedules on DIFFERENT DATES 10/09, 15/09, 20/09)
    {
        unitId: "U-004",
        code: "LK-2026-004",
        customerName: "Tập đoàn Viettel",
        personInCharge: "Phạm Minh Tuấn",
        facility: "Cơ sở Thanh Xuân",
        childSchedules: [
            {
                scheduleId: "SCH-VTT-01",
                scheduleType: "TAI_VIEN",
                loaiLich: "Lịch tại viện",
                examDate: "2026-09-10",
                ca: "Sang",
                gioBatDau: "07:30",
                gioKetThuc: "11:30",
                soLuongKhach: 100,
                tongNhanSu: 12,
                coSo: "MEDLATEC Thanh Xuân",
                diaDiemKham: "MEDLATEC Thanh Xuân",
                cbPhuTrach: "Phạm Minh Tuấn",
                trangThai: "Dự kiến"
            },
            {
                scheduleId: "SCH-VTT-02",
                scheduleType: "NGOAI_VIEN",
                loaiLich: "Lịch ngoại viện",
                examDate: "2026-09-15",
                ca: "Sang",
                gioBatDau: "07:00",
                gioKetThuc: "12:00",
                soLuongKhach: 150,
                tongNhanSu: 16,
                coSo: "Ngoại viện",
                diaDiemKham: "Tòa nhà Viettel Tower",
                cbPhuTrach: "Phạm Minh Tuấn",
                trangThai: "Dự kiến"
            },
            {
                scheduleId: "SCH-VTT-03",
                scheduleType: "LICH_PHUONG",
                loaiLich: "Lịch phường",
                examDate: "2026-09-20",
                ca: "Sang",
                gioBatDau: "08:00",
                gioKetThuc: "11:30",
                soLuongKhach: 80,
                tongNhanSu: 10,
                coSo: "MEDLATEC Thanh Xuân",
                diaDiemKham: "Trạm Y tế Phường Nhân Chính",
                cbPhuTrach: "Lê Văn Cường",
                trangThai: "Dự kiến"
            }
        ]
    },

    // MASTER 5: Tập đoàn VinGroup
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
                loaiLich: "Lịch tại viện",
                examDate: "2026-09-05",
                ca: "Sang",
                gioBatDau: "07:30",
                gioKetThuc: "11:30",
                soLuongKhach: 160,
                tongNhanSu: 15,
                coSo: "MEDLATEC Mỹ Đình",
                diaDiemKham: "MEDLATEC Mỹ Đình",
                cbPhuTrach: "Trần Văn Bình",
                trangThai: "Dự kiến"
            },
            {
                scheduleId: "SCH-VIN-02",
                scheduleType: "NGOAI_VIEN",
                loaiLich: "Lịch ngoại viện",
                examDate: "2026-09-05",
                ca: "Sang",
                gioBatDau: "08:00",
                gioKetThuc: "12:00",
                soLuongKhach: 140,
                tongNhanSu: 14,
                coSo: "Ngoại viện",
                diaDiemKham: "Vinhomes Riverside",
                cbPhuTrach: "Trần Văn Bình",
                trangThai: "Dự kiến"
            }
        ]
    },
    {
        unitId: "U-007",
        code: "LK-2026-007",
        customerName: "Ngân hàng BIDV Hà Nội",
        personInCharge: "Đỗ Hải Đăng",
        facility: "Cơ sở Mỹ Đình",
        childSchedules: [
            {
                scheduleId: "SCH-BIDV-01",
                scheduleType: "TAI_VIEN",
                loaiLich: "Lịch tại viện",
                examDate: "2026-09-16",
                ca: "Sang",
                gioBatDau: "07:30",
                gioKetThuc: "11:30",
                soLuongKhach: 120,
                tongNhanSu: 12,
                coSo: "MEDLATEC Mỹ Đình",
                diaDiemKham: "MEDLATEC Mỹ Đình",
                cbPhuTrach: "Đỗ Hải Đăng",
                trangThai: "Dự kiến"
            },
            {
                scheduleId: "SCH-BIDV-02",
                scheduleType: "NGOAI_VIEN",
                loaiLich: "Lịch ngoại viện",
                examDate: "2026-09-16",
                ca: "Sang",
                gioBatDau: "07:00",
                gioKetThuc: "12:00",
                soLuongKhach: 150,
                tongNhanSu: 15,
                coSo: "Ngoại viện",
                diaDiemKham: "BIDV Tower",
                cbPhuTrach: "Trần Văn Bình",
                trangThai: "Dự kiến"
            },
            {
                scheduleId: "SCH-BIDV-03",
                scheduleType: "LICH_PHUONG",
                loaiLich: "Lịch phường",
                examDate: "2026-09-16",
                ca: "Chieu",
                gioBatDau: "13:30",
                gioKetThuc: "17:00",
                soLuongKhach: 90,
                tongNhanSu: 8,
                coSo: "MEDLATEC Mỹ Đình",
                diaDiemKham: "Trạm Y tế Phường Cầu Diễn",
                cbPhuTrach: "Lê Hoàng Nam",
                trangThai: "Dự kiến"
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
                loaiLich: "Lịch phường",
                examDate: "2026-09-02",
                ca: "Sang",
                gioBatDau: "08:00",
                gioKetThuc: "11:30",
                soLuongKhach: 90,
                tongNhanSu: 8,
                coSo: "MEDLATEC Mỹ Đình",
                diaDiemKham: "Trạm Y tế Phường Mỹ Đình 1",
                cbPhuTrach: "Lê Hoàng Nam",
                trangThai: "Dự kiến"
            }
        ]
    },
    {
        unitId: "U-009",
        code: "LK-2026-009",
        customerName: "Công ty Samsung R&D",
        personInCharge: "Phạm Minh Tuấn",
        facility: "Cơ sở Mỹ Đình",
        childSchedules: [
            {
                scheduleId: "SCH-260908",
                scheduleType: "NGOAI_VIEN",
                loaiLich: "Lịch ngoại viện",
                examDate: "2026-09-08",
                ca: "Sang",
                gioBatDau: "07:00",
                gioKetThuc: "12:00",
                soLuongKhach: 210,
                tongNhanSu: 18,
                coSo: "Ngoại viện",
                diaDiemKham: "Samsung R&D, Mỹ Đình 2",
                cbPhuTrach: "Phạm Minh Tuấn",
                trangThai: "Dự kiến"
            }
        ]
    },
    {
        unitId: "U-010",
        code: "LK-2026-010",
        customerName: "Công ty Honda Việt Nam",
        personInCharge: "Nguyễn Văn An",
        facility: "Cơ sở Mỹ Đình",
        childSchedules: [
            {
                scheduleId: "SCH-260911-1",
                scheduleType: "TAI_VIEN",
                loaiLich: "Lịch tại viện",
                examDate: "2026-09-11",
                ca: "Sang",
                gioBatDau: "07:30",
                gioKetThuc: "11:30",
                soLuongKhach: 110,
                tongNhanSu: 11,
                coSo: "MEDLATEC Mỹ Đình",
                diaDiemKham: "MEDLATEC Mỹ Đình",
                cbPhuTrach: "Nguyễn Văn An",
                trangThai: "Dự kiến"
            }
        ]
    },
    {
        unitId: "U-011",
        code: "LK-2026-011",
        customerName: "Công ty Viễn thông VNPT",
        personInCharge: "Phạm Minh Tuấn",
        facility: "Cơ sở Thanh Xuân",
        childSchedules: [
            {
                scheduleId: "SCH-260914-1",
                scheduleType: "NGOAI_VIEN",
                loaiLich: "Lịch ngoại viện",
                examDate: "2026-09-14",
                ca: "Sang",
                gioBatDau: "07:00",
                gioKetThuc: "12:00",
                soLuongKhach: 190,
                tongNhanSu: 16,
                coSo: "Ngoại viện",
                diaDiemKham: "VNPT Tower, Nguyễn Trãi",
                cbPhuTrach: "Phạm Minh Tuấn",
                trangThai: "Dự kiến"
            }
        ]
    },
    {
        unitId: "U-012",
        code: "LK-2026-012",
        customerName: "Tập đoàn Hòa Phát",
        personInCharge: "Nguyễn Văn An",
        facility: "Cơ sở Mỹ Đình",
        childSchedules: [
            {
                scheduleId: "SCH-260921-1",
                scheduleType: "NGOAI_VIEN",
                loaiLich: "Lịch ngoại viện",
                examDate: "2026-09-21",
                ca: "Sang",
                gioBatDau: "07:00",
                gioKetThuc: "12:00",
                soLuongKhach: 220,
                tongNhanSu: 18,
                coSo: "Ngoại viện",
                diaDiemKham: "Tòa nhà Hòa Phát, Mỹ Đình",
                cbPhuTrach: "Nguyễn Văn An",
                trangThai: "Dự kiến"
            }
        ]
    },
    {
        unitId: "U-013",
        code: "LK-2026-013",
        customerName: "Ngân hàng Techcombank",
        personInCharge: "Phạm Minh Tuấn",
        facility: "Cơ sở Mỹ Đình",
        childSchedules: [
            {
                scheduleId: "SCH-260923-1",
                scheduleType: "NGOAI_VIEN",
                loaiLich: "Lịch ngoại viện",
                examDate: "2026-09-23",
                ca: "Sang",
                gioBatDau: "07:30",
                gioKetThuc: "11:30",
                soLuongKhach: 145,
                tongNhanSu: 14,
                coSo: "Ngoại viện",
                diaDiemKham: "Techcombank Cầu Giấy",
                cbPhuTrach: "Phạm Minh Tuấn",
                trangThai: "Dự kiến"
            }
        ]
    },
    {
        unitId: "U-014",
        code: "LK-2026-014",
        customerName: "Công ty Sơn Hà Group",
        personInCharge: "Phạm Minh Tuấn",
        facility: "Cơ sở Hà Đông",
        childSchedules: [
            {
                scheduleId: "SCH-260928-1",
                scheduleType: "NGOAI_VIEN",
                loaiLich: "Lịch ngoại viện",
                examDate: "2026-09-28",
                ca: "Sang",
                gioBatDau: "07:30",
                gioKetThuc: "11:30",
                soLuongKhach: 140,
                tongNhanSu: 12,
                coSo: "Ngoại viện",
                diaDiemKham: "Sơn Hà Tower, Hà Đông",
                cbPhuTrach: "Phạm Minh Tuấn",
                trangThai: "Dự kiến"
            }
        ]
    }
];

function initCalendarModule() {
    loadSchedulesData();
    bindCalendarEvents();
    renderCalendar();
}

/**
 * Extract Child Schedules from MWKDataStore and seedMasterUnits
 */
function loadSchedulesData() {
    const childSchedules = [];

    // Fetch Master Records from MWKDataStore
    let dataStoreMasters = [];
    if (window.MWKDataStore && typeof window.MWKDataStore.getKskSchedules === 'function') {
        try {
            dataStoreMasters = window.MWKDataStore.getKskSchedules() || [];
        } catch (e) {
            console.error("Lỗi khi đọc dữ liệu từ MWKDataStore:", e);
        }
    }

    const processMasterRecord = (master) => {
        const unitId = String(master.id || master.unitId || master.code || master.maLich);
        const unitName = master.customerName || master.teamName || master.tenDonVi || "Đơn vị KSK";
        const masterCode = master.code || master.maLich || unitId;
        const defaultPic = master.personInCharge || master.cbPhuTrach || master.contactPerson || "Nguyễn Văn An";
        const defaultFacility = master.facility || master.coSo || "MEDLATEC Ba Đình";
        let addedCount = 0;

        // 1. From seed childSchedules array
        if (Array.isArray(master.childSchedules)) {
            master.childSchedules.forEach((sub, idx) => {
                let typeLabel = "Lịch tại viện";
                const st = (sub.scheduleType || "").toUpperCase();
                if (st === 'NGOAI_VIEN' || (sub.loaiLich || '').includes('ngoại viện')) typeLabel = "Lịch ngoại viện";
                else if (st === 'LICH_PHUONG' || (sub.loaiLich || '').includes('phường')) typeLabel = "Lịch phường";

                childSchedules.push({
                    id: sub.scheduleId || sub.id || `${unitId}-${idx}`,
                    scheduleId: sub.scheduleId || sub.maLich || sub.id || `${unitId}-${idx + 1}`,
                    unitId: unitId,
                    tenDonVi: unitName,
                    customerCode: masterCode,
                    loaiLich: sub.loaiLich || typeLabel,
                    scheduleType: st || "TAI_VIEN",
                    tuNgay: sub.tuNgay || master.tuNgay || sub.examDate || sub.ngayKham || master.examDate || "2026-09-15",
                    denNgay: sub.denNgay || master.denNgay || sub.tuNgay || master.tuNgay || sub.examDate || sub.ngayKham || master.examDate || "2026-09-15",
                    examDate: sub.examDate || sub.ngayKham || master.tuNgay || master.examDate || "2026-09-15",
                    ngayKham: sub.examDate || sub.ngayKham || master.tuNgay || master.examDate || "2026-09-15",
                    ca: sub.ca || (sub.session === 'Chiều' ? 'Chieu' : 'Sang'),
                    gioBatDau: sub.startTime || sub.gioBatDau || "07:30",
                    gioKetThuc: sub.endTime || sub.gioKetThuc || "11:30",
                    soLuongKhach: Number(sub.quantity || sub.soLuongKhach || sub.soLuong || 0),
                    tongNhanSu: Number(sub.tongNhanSu || 10),
                    coSo: sub.facility || sub.coSo || defaultFacility,
                    diaDiemKham: sub.location || sub.diaDiemKham || master.examLocation || "Địa điểm khám",
                    cbPhuTrach: sub.personInCharge || sub.cbPhuTrach || defaultPic,
                    trangThai: sub.status || sub.trangThai || "Dự kiến",
                    rawSubObject: sub,
                    rawMasterObject: master
                });
                addedCount++;
            });
        }

        // 2. From step2Data
        if (master.step2Data) {
            const types = [
                { key: 'taiVien', scheduleType: 'TAI_VIEN', label: 'Lịch tại viện' },
                { key: 'ngoaiVien', scheduleType: 'NGOAI_VIEN', label: 'Lịch ngoại viện' },
                { key: 'lichPhuong', scheduleType: 'LICH_PHUONG', label: 'Lịch phường' }
            ];

            types.forEach(({ key, scheduleType, label }) => {
                const subList = master.step2Data[key];
                if (Array.isArray(subList)) {
                    subList.forEach((sub, idx) => {
                        childSchedules.push({
                            id: sub.id || sub.scheduleId || `${unitId}-${scheduleType}-${idx}`,
                            scheduleId: sub.scheduleId || sub.maLich || sub.id || `${unitId}-${idx + 1}`,
                            unitId: unitId,
                            tenDonVi: unitName,
                            customerCode: masterCode,
                            loaiLich: label,
                            scheduleType: scheduleType,
                            tuNgay: sub.tuNgay || master.tuNgay || sub.ngayKham || sub.examDate || master.examDate || "2026-09-15",
                            denNgay: sub.denNgay || master.denNgay || sub.tuNgay || master.tuNgay || sub.ngayKham || sub.examDate || master.examDate || "2026-09-15",
                            examDate: sub.ngayKham || sub.examDate || master.tuNgay || master.examDate || "2026-09-15",
                            ngayKham: sub.ngayKham || sub.examDate || master.tuNgay || master.examDate || "2026-09-15",
                            ca: sub.ca || (sub.session === 'Chiều' ? 'Chieu' : 'Sang'),
                            gioBatDau: sub.startTime || sub.gioBatDau || "07:30",
                            gioKetThuc: sub.endTime || sub.gioKetThuc || "11:30",
                            soLuongKhach: Number(sub.soLuongKhach || sub.quantity || sub.soLuong || 0),
                            tongNhanSu: Number(sub.tongNhanSu || 10),
                            coSo: sub.facility || sub.coSo || defaultFacility,
                            diaDiemKham: sub.diaDiemKham || sub.location || master.examLocation || "Địa điểm khám",
                            cbPhuTrach: sub.personInCharge || sub.cbPhuTrach || defaultPic,
                            trangThai: sub.trangThai || sub.status || "Dự kiến",
                            rawSubObject: sub,
                            rawMasterObject: master
                        });
                        addedCount++;
                    });
                }
            });
        }

        // 3. Fallback for master unit without childSchedules or step2Data
        if (addedCount === 0) {
            let typeLabel = master.loaiLich || "Lịch tại viện";
            let schType = "TAI_VIEN";
            if (typeLabel.includes("ngoại viện")) schType = "NGOAI_VIEN";
            else if (typeLabel.includes("phường")) schType = "LICH_PHUONG";

            childSchedules.push({
                id: `${unitId}-main`,
                scheduleId: masterCode,
                unitId: unitId,
                tenDonVi: unitName,
                customerCode: masterCode,
                loaiLich: typeLabel,
                scheduleType: schType,
                tuNgay: master.tuNgay || master.examDate || "2026-09-15",
                denNgay: master.denNgay || master.tuNgay || master.examDate || "2026-09-15",
                examDate: master.tuNgay || master.examDate || "2026-09-15",
                ngayKham: master.tuNgay || master.examDate || "2026-09-15",
                ca: "Sang",
                gioBatDau: "07:30",
                gioKetThuc: "11:30",
                soLuongKhach: Number(master.estimatedCount || master.soLuong || 0),
                tongNhanSu: Number(master.tongNhanSu || 10),
                coSo: master.facility || defaultFacility,
                diaDiemKham: master.examLocation || master.address || "Địa điểm khám",
                cbPhuTrach: defaultPic,
                trangThai: master.status || "Dự kiến",
                rawMasterObject: master
            });
        }
    };

    seedMasterUnits.forEach(processMasterRecord);

    const processedUnitIds = new Set(seedMasterUnits.map(m => String(m.unitId || m.id || m.code)));
    dataStoreMasters.forEach(master => {
        const masterId = String(master.id || master.code || master.maLich);
        if (!processedUnitIds.has(masterId)) {
            processMasterRecord(master);
            processedUnitIds.add(masterId);
        }
    });

    rawSchedules = childSchedules;
    return childSchedules;
}

function bindCalendarEvents() {
    // Today Button
    const btnToday = document.getElementById('btn-today');
    if (btnToday) {
        btnToday.addEventListener('click', function () {
            currentDate = new Date(2026, 8, 15);
            renderCalendar();
        });
    }

    // Prev / Next Buttons
    const btnPrev = document.getElementById('btn-prev');
    const btnNext = document.getElementById('btn-next');

    if (btnPrev) {
        btnPrev.addEventListener('click', function () {
            if (currentView === 'week') {
                currentDate.setDate(currentDate.getDate() - 7);
            } else {
                currentDate.setMonth(currentDate.getMonth() - 1);
            }
            renderCalendar();
        });
    }

    if (btnNext) {
        btnNext.addEventListener('click', function () {
            if (currentView === 'week') {
                currentDate.setDate(currentDate.getDate() + 7);
            } else {
                currentDate.setMonth(currentDate.getMonth() + 1);
            }
            renderCalendar();
        });
    }

    // View Mode Switchers
    const btnViewWeek = document.getElementById('btn-view-week');
    const btnViewMonth = document.getElementById('btn-view-month');

    if (btnViewWeek) {
        btnViewWeek.addEventListener('click', function () {
            if (currentView !== 'week') {
                currentView = 'week';
                btnViewWeek.classList.add('active');
                btnViewWeek.classList.remove('text-[#6B7280]');
                btnViewMonth.classList.remove('active');
                btnViewMonth.classList.add('text-[#6B7280]');

                document.getElementById('week-view-container').classList.remove('hidden');
                document.getElementById('month-view-container').classList.add('hidden');

                renderCalendar();
            }
        });
    }

    if (btnViewMonth) {
        btnViewMonth.addEventListener('click', function () {
            if (currentView !== 'month') {
                currentView = 'month';
                btnViewMonth.classList.add('active');
                btnViewMonth.classList.remove('text-[#6B7280]');
                btnViewWeek.classList.remove('active');
                btnViewWeek.classList.add('text-[#6B7280]');

                document.getElementById('month-view-container').classList.remove('hidden');
                document.getElementById('week-view-container').classList.add('hidden');

                renderCalendar();
            }
        });
    }

    // Search Input
    const inputSearch = document.getElementById('filter-search');
    if (inputSearch) {
        inputSearch.addEventListener('input', function (e) {
            filters.search = e.target.value.trim().toLowerCase();
            renderCalendar();
        });
    }

    // Quick Type Filter Pills (Chỉ 3 loại: Lịch tại viện, Lịch ngoại viện, Lịch phường)
    const typePills = document.querySelectorAll('.filter-type-pill');
    typePills.forEach(pill => {
        pill.addEventListener('click', function () {
            typePills.forEach(p => {
                p.classList.remove('active', 'bg-[#27496D]', 'text-white', 'font-semibold');
                p.classList.add('font-medium', 'text-[#4B5563]');
            });

            this.classList.add('active', 'bg-[#27496D]', 'text-white', 'font-semibold');
            this.classList.remove('font-medium', 'text-[#4B5563]');

            filters.loaiLich = this.getAttribute('data-type') || '';
            renderCalendar();
        });
    });

    // Advanced Filter Popover Toggle
    const btnTogglePopover = document.getElementById('btn-toggle-filter-popover');
    const popoverPanel = document.getElementById('filter-popover-panel');

    if (btnTogglePopover && popoverPanel) {
        btnTogglePopover.addEventListener('click', function (e) {
            e.stopPropagation();
            popoverPanel.classList.toggle('hidden');
        });

        document.addEventListener('click', function (e) {
            if (!popoverPanel.contains(e.target) && !btnTogglePopover.contains(e.target)) {
                popoverPanel.classList.add('hidden');
            }
        });
    }

    // Advanced Selects (Cơ sở & CB Phụ trách)
    const selectCoSo = document.getElementById('filter-co-so');
    const selectCbPhuTrach = document.getElementById('filter-cb-phu-trach');

    if (selectCoSo) {
        selectCoSo.addEventListener('change', function (e) {
            filters.coSo = e.target.value;
            updateFilterPopoverBadge();
            renderCalendar();
        });
    }

    if (selectCbPhuTrach) {
        selectCbPhuTrach.addEventListener('change', function (e) {
            filters.cbPhuTrach = e.target.value;
            updateFilterPopoverBadge();
            renderCalendar();
        });
    }

    // Reset Filters Button
    const btnReset = document.getElementById('btn-reset-filters');
    if (btnReset) {
        btnReset.addEventListener('click', function () {
            filters.search = '';
            filters.coSo = '';
            filters.loaiLich = '';
            filters.cbPhuTrach = '';

            if (inputSearch) inputSearch.value = '';
            if (selectCoSo) selectCoSo.value = '';
            if (selectCbPhuTrach) selectCbPhuTrach.value = '';

            typePills.forEach(p => {
                p.classList.remove('active', 'bg-[#27496D]', 'text-white', 'font-semibold');
                p.classList.add('font-medium', 'text-[#4B5563]');
                if ((p.getAttribute('data-type') || '') === '') {
                    p.classList.add('active', 'bg-[#27496D]', 'text-white', 'font-semibold');
                    p.classList.remove('font-medium', 'text-[#4B5563]');
                }
            });

            updateFilterPopoverBadge();
            renderCalendar();
        });
    }

    // Storage update event listeners
    window.addEventListener('mwk_ksk_schedules_changed', function () {
        loadSchedulesData();
        renderCalendar();
    });
    window.addEventListener('mwk_planned_schedules_changed', function () {
        loadSchedulesData();
        renderCalendar();
    });
}

function updateFilterPopoverBadge() {
    let count = 0;
    if (filters.coSo) count++;
    if (filters.cbPhuTrach) count++;

    const badge = document.getElementById('filter-popover-badge');
    if (badge) {
        if (count > 0) {
            badge.innerText = count;
            badge.classList.remove('hidden');
        } else {
            badge.classList.add('hidden');
        }
    }
}

/**
 * Filter child schedules based on search and selected options
 */
function getFilteredSchedules() {
    return rawSchedules.filter(item => {
        if (filters.search) {
            const unitName = (item.tenDonVi || '').toLowerCase();
            const childCode = (item.scheduleId || item.id || '').toString().toLowerCase();
            const masterCode = (item.customerCode || '').toLowerCase();
            const pic = (item.cbPhuTrach || '').toLowerCase();
            if (!unitName.includes(filters.search) && 
                !childCode.includes(filters.search) && 
                !masterCode.includes(filters.search) && 
                !pic.includes(filters.search)) {
                return false;
            }
        }
        if (filters.coSo && item.coSo !== filters.coSo) {
            return false;
        }
        if (filters.loaiLich) {
            const pillType = (filters.loaiLich || '').toLowerCase();
            const itemType = (item.loaiLich || '').toLowerCase();
            if (!itemType.includes(pillType.replace('lịch ', ''))) {
                return false;
            }
        }
        if (filters.cbPhuTrach && item.cbPhuTrach !== filters.cbPhuTrach) {
            return false;
        }
        return true;
    });
}

function isScheduleOnDate(item, targetISO) {
    if (!item || !targetISO) return false;
    let startISO = item.tuNgay || item.examDate || item.ngayKham || '';
    let endISO = item.denNgay || item.tuNgay || item.examDate || item.ngayKham || '';

    if (!startISO) return false;
    if (startISO.includes('T')) startISO = startISO.split('T')[0];
    if (endISO.includes('T')) endISO = endISO.split('T')[0];

    if (startISO === targetISO || endISO === targetISO) return true;
    if (startISO <= targetISO && targetISO <= endISO) return true;
    return false;
}

function renderCalendar() {
    const activeList = getFilteredSchedules();

    const monthContainer = document.getElementById('month-view-container');
    const weekContainer = document.getElementById('week-view-container');
    const btnViewWeek = document.getElementById('btn-view-week');
    const btnViewMonth = document.getElementById('btn-view-month');

    if (currentView === 'week') {
        if (weekContainer) weekContainer.classList.remove('hidden');
        if (monthContainer) monthContainer.classList.add('hidden');
        if (btnViewWeek) {
            btnViewWeek.classList.add('active');
            btnViewWeek.classList.remove('text-[#6B7280]');
        }
        if (btnViewMonth) {
            btnViewMonth.classList.remove('active');
            btnViewMonth.classList.add('text-[#6B7280]');
        }
        renderWeekView(activeList);
    } else {
        if (monthContainer) monthContainer.classList.remove('hidden');
        if (weekContainer) weekContainer.classList.add('hidden');
        if (btnViewMonth) {
            btnViewMonth.classList.add('active');
            btnViewMonth.classList.remove('text-[#6B7280]');
        }
        if (btnViewWeek) {
            btnViewWeek.classList.remove('active');
            btnViewWeek.classList.add('text-[#6B7280]');
        }
        renderMonthView(activeList);
    }

    renderSummaryCards(activeList);
    renderFooterBar(activeList);
}

// ==========================================
// 2. TOP SUMMARY METRIC CARDS (5 CARDS)
// ==========================================
function renderSummaryCards(activeList) {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth(); // 0-indexed

    // Items for current displayed month
    const monthItems = activeList.filter(item => {
        if (!item.ngayKham) return false;
        const parts = item.ngayKham.split('-');
        if (parts.length < 2) return false;
        return parseInt(parts[0], 10) === year && (parseInt(parts[1], 10) - 1) === month;
    });

    const totalSchedules = monthItems.length;
    const totalPatients = monthItems.reduce((sum, i) => sum + (parseInt(i.soLuongKhach) || 0), 0);

    const taiVienPatients = monthItems
        .filter(i => (i.loaiLich || '').toLowerCase().includes('tại viện'))
        .reduce((sum, i) => sum + (parseInt(i.soLuongKhach) || 0), 0);

    const ngoaiVienPatients = monthItems
        .filter(i => (i.loaiLich || '').toLowerCase().includes('ngoại viện'))
        .reduce((sum, i) => sum + (parseInt(i.soLuongKhach) || 0), 0);

    const phuongPatients = monthItems
        .filter(i => (i.loaiLich || '').toLowerCase().includes('phường'))
        .reduce((sum, i) => sum + (parseInt(i.soLuongKhach) || 0), 0);

    const elTotalSchedules = document.getElementById('summary-total-schedules');
    const elTotalPatients = document.getElementById('summary-total-patients');
    const elTaiVienPatients = document.getElementById('summary-tai-vien-patients');
    const elNgoaiVienPatients = document.getElementById('summary-ngoai-vien-patients');
    const elPhuongPatients = document.getElementById('summary-phuong-patients');

    if (elTotalSchedules) elTotalSchedules.innerText = totalSchedules.toLocaleString('vi-VN');
    if (elTotalPatients) elTotalPatients.innerText = totalPatients.toLocaleString('vi-VN');
    if (elTaiVienPatients) elTaiVienPatients.innerText = taiVienPatients.toLocaleString('vi-VN');
    if (elNgoaiVienPatients) elNgoaiVienPatients.innerText = ngoaiVienPatients.toLocaleString('vi-VN');
    if (elPhuongPatients) elPhuongPatients.innerText = phuongPatients.toLocaleString('vi-VN');
}

// ==========================================
// 3. RENDER WEEK VIEW (MASTER GROUPED)
// ==========================================
function renderWeekView(activeList) {
    const weekDays = CalendarHelper.getWeekDays(currentDate);
    const startWeekStr = CalendarHelper.formatShortDate(weekDays[0]);
    const endWeekStr = CalendarHelper.formatShortDate(weekDays[6]);
    const weekNum = CalendarHelper.getWeekNumber(currentDate);
    const year = weekDays[0].getFullYear();

    const titleRange = document.getElementById('calendar-title-range');
    if (titleRange) {
        titleRange.innerText = `Tuần ${weekNum} (${startWeekStr} - ${endWeekStr}/${year})`;
    }

    const footerPeriod = document.getElementById('footer-period-label');
    if (footerPeriod) {
        footerPeriod.innerText = `Tuần ${weekNum} / ${year} (${startWeekStr} - ${endWeekStr}/${year})`;
    }

    const todayISO = CalendarHelper.formatISODate(new Date());
    const headerElems = document.querySelectorAll('.day-col-header');

    headerElems.forEach((elem, index) => {
        if (index < weekDays.length) {
            const dayDate = weekDays[index];
            const isoStr = CalendarHelper.formatISODate(dayDate);
            const dayLabel = CalendarHelper.getDayOfWeekLabel(dayDate);
            const shortDate = CalendarHelper.formatShortDate(dayDate);
            const isToday = isoStr === todayISO;

            const dayItems = activeList.filter(item => isScheduleOnDate(item, isoStr));
            const dayCount = dayItems.length;
            const dayGuests = dayItems.reduce((sum, i) => sum + (parseInt(i.soLuongKhach) || 0), 0);

            elem.innerHTML = `
                <div class="flex flex-col items-center py-1.5 space-y-0.5">
                    <span class="text-[11px] font-bold ${isToday ? 'text-[#27496D]' : 'text-[#6B7280]'} uppercase tracking-wider">${dayLabel}</span>
                    <span class="text-xs font-extrabold ${isToday ? 'px-2.5 py-0.5 rounded-[4px] bg-[#27496D] text-white shadow-2xs' : 'text-[#1F2937]'}">${shortDate}</span>
                    ${dayCount > 0 ? `<span class="text-[10px] font-bold text-[#27496D] bg-[#E8F1FB] px-1.5 py-0.2 rounded-[3px] border border-[#B3CDE6] mt-0.5">${dayCount} lịch • ${dayGuests} KH</span>` : '<span class="text-[10px] text-[#9CA3AF] mt-0.5">Chưa có lịch</span>'}
                </div>
            `;
            elem.classList.toggle('bg-[#F0F7FF]', isToday);
        }
    });

    const gridTbody = document.getElementById('week-grid-tbody');
    if (!gridTbody) return;

    const shifts = [
        { code: 'Sang', label: 'Sáng', subLabel: '07:30 - 11:30' },
        { code: 'Chieu', label: 'Chiều', subLabel: '13:30 - 17:30' },
        { code: 'CaNgay', label: 'Cả ngày', subLabel: '07:30 - 17:30' }
    ];

    let tbodyHtml = '';

    shifts.forEach(shift => {
        tbodyHtml += `<tr class="border-b border-[#D9DEE5]">`;
        tbodyHtml += `
            <td class="p-2 text-center bg-[#F8FAFC] border-r border-[#D9DEE5] align-middle font-bold text-[#1F2937] select-none">
                <div class="text-xs font-bold text-[#27496D]">${shift.label}</div>
                <div class="text-[10px] text-[#6B7280] font-normal">${shift.subLabel}</div>
            </td>
        `;

        weekDays.forEach(dayDate => {
            const isoStr = CalendarHelper.formatISODate(dayDate);
            const isToday = isoStr === todayISO;

            const cellChilds = activeList.filter(item => {
                if (!isScheduleOnDate(item, isoStr)) return false;
                if (shift.code === 'CaNgay') return item.ca === 'CaNgay';
                return item.ca === shift.code;
            });

            // Group by Master Unit
            const masterMap = {};
            cellChilds.forEach(child => {
                const uId = String(child.unitId || child.tenDonVi);
                if (!masterMap[uId]) {
                    masterMap[uId] = {
                        unitId: uId,
                        tenDonVi: child.tenDonVi,
                        dateISO: isoStr,
                        childSchedules: []
                    };
                }
                masterMap[uId].childSchedules.push(child);
            });

            const masterGroups = Object.values(masterMap);

            tbodyHtml += `
                <td class="p-1.5 border-r border-[#D9DEE5] align-top calendar-cell ${isToday ? 'calendar-cell-today' : ''}" 
                    data-date="${isoStr}" 
                    data-shift="${shift.code}">
                    <div class="flex flex-col justify-between h-full min-h-[110px] space-y-1">
            `;

            if (masterGroups.length > 0) {
                tbodyHtml += `<div class="space-y-1.5 flex-1">`;
                masterGroups.forEach(group => {
                    tbodyHtml += renderMasterGroupWeekCardHtml(group);
                });
                tbodyHtml += `</div>`;
            } else {
                tbodyHtml += `
                    <div onclick="openCreatePlannedModalForDate('${isoStr}', event)" 
                         class="cell-add-placeholder flex-1 flex flex-col items-center justify-center p-2 text-[#9CA3AF] cursor-pointer opacity-60 hover:opacity-100 min-h-[80px]">
                        <i class="fa-solid fa-plus text-xs mb-1 text-[#27496D]"></i>
                        <span class="text-[10px] font-semibold text-[#6B7280]">Dự kiến lịch</span>
                    </div>
                `;
            }

            // Cell action button
            if (masterGroups.length > 0) {
                tbodyHtml += `
                    <button type="button" onclick="openCreatePlannedModalForDate('${isoStr}', event)" 
                            class="w-full mt-auto py-1 px-1 bg-[#F8FAFC] hover:bg-[#27496D] text-[#27496D] hover:text-white rounded-[3px] text-[10px] font-bold transition-all flex items-center justify-center gap-1 border border-[#B3CDE6] hover:border-[#27496D] cursor-pointer shadow-2xs">
                        <i class="fa-solid fa-plus text-[9px]"></i>
                        <span>Dự kiến lịch</span>
                    </button>
                `;
            }

            tbodyHtml += `
                    </div>
                </td>
            `;
        });

        tbodyHtml += `</tr>`;
    });

    gridTbody.innerHTML = tbodyHtml;
}

function renderMasterGroupWeekCardHtml(group) {
    const { unitId, tenDonVi, childSchedules, dateISO } = group;
    const countOnCell = childSchedules.length;
    const totalGuests = childSchedules.reduce((sum, s) => sum + (parseInt(s.soLuongKhach) || 0), 0);

    const tvCount = childSchedules.filter(s => (s.loaiLich || '').includes('tại viện')).length;
    const nvCount = childSchedules.filter(s => (s.loaiLich || '').includes('ngoại viện')).length;
    const tpCount = childSchedules.filter(s => (s.loaiLich || '').includes('phường')).length;

    let breakdownBadges = [];
    if (tvCount > 0) breakdownBadges.push(`<span class="font-bold text-[#27496D]" title="${tvCount} Lịch tại viện">🏥 ${tvCount}</span>`);
    if (nvCount > 0) breakdownBadges.push(`<span class="font-bold text-[#ED6C02]" title="${nvCount} Lịch ngoại viện">🚐 ${nvCount}</span>`);
    if (tpCount > 0) breakdownBadges.push(`<span class="font-bold text-[#7E22CE]" title="${tpCount} Lịch phường">🏘 ${tpCount}</span>`);

    let breakdownHtml = '';
    if (countOnCell > 1) {
        breakdownHtml = breakdownBadges.join('<span class="text-[#CBD5E1] mx-0.5">•</span>');
    } else {
        const singleType = (childSchedules[0].loaiLich || '');
        if (singleType.includes('tại viện')) breakdownHtml = `<span class="font-bold text-[#27496D]">🏥 Tại viện 1</span>`;
        else if (singleType.includes('ngoại viện')) breakdownHtml = `<span class="font-bold text-[#ED6C02]">🚐 Ngoại viện 1</span>`;
        else if (singleType.includes('phường')) breakdownHtml = `<span class="font-bold text-[#7E22CE]">🏘 Tại phường 1</span>`;
    }

    return `
        <div onclick="openGroupDetailModal('${escapeHtml(unitId)}', '${escapeHtml(dateISO)}')" 
             class="event-card master-group-card bg-white hover:bg-[#F0F7FF] border border-[#CBD5E1] hover:border-[#27496D] p-1.5 rounded-[4px] shadow-2xs cursor-pointer transition-all space-y-1 text-xs select-none overflow-hidden">
            <div class="flex items-center justify-between font-bold text-xs text-[#1F2937] leading-tight gap-1">
                <span class="truncate text-[#27496D] font-extrabold flex items-center gap-1 min-w-0">
                    <i class="fa-solid fa-building text-[10px] text-[#27496D] shrink-0"></i>
                    <span class="truncate" title="${escapeHtml(tenDonVi)}">${escapeHtml(tenDonVi)}</span>
                </span>
                <span class="bg-[#E8F1FB] text-[#27496D] px-1.5 py-0.2 rounded-[3px] font-bold text-[10px] shrink-0">${countOnCell} lịch</span>
            </div>
            <div class="flex items-center justify-between text-[11px] text-[#4B5563] pt-0.5 border-t border-[#F0F3F7]">
                <span class="font-bold text-[#15803D] shrink-0">${totalGuests.toLocaleString('vi-VN')} KH</span>
                <div class="flex items-center gap-1 text-[10px] truncate">
                    ${breakdownHtml}
                </div>
            </div>
        </div>
    `;
}

// ==========================================
// 4. RENDER MONTH VIEW (EVERY DAY CELL HAS + Dự kiến lịch BUTTON)
// ==========================================
function renderMonthView(activeList) {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth(); // 0-indexed
    const monthDays = CalendarHelper.getMonthDaysGrid(year, month);
    const todayISO = CalendarHelper.formatISODate(new Date());

    const titleRange = document.getElementById('calendar-title-range');
    if (titleRange) {
        titleRange.innerText = `Tháng ${month + 1}/${year}`;
    }

    const footerPeriod = document.getElementById('footer-period-label');
    if (footerPeriod) {
        footerPeriod.innerText = `Tháng ${month + 1} / ${year}`;
    }

    const gridTbody = document.getElementById('month-grid-tbody');
    if (!gridTbody) return;

    let tbodyHtml = '';
    const totalDays = monthDays.length;
    const numRows = Math.ceil(totalDays / 7);

    for (let r = 0; r < numRows; r++) {
        tbodyHtml += `<tr class="border-b border-[#D9DEE5]">`;

        for (let c = 0; c < 7; c++) {
            const index = r * 7 + c;
            if (index < totalDays) {
                const dayDate = monthDays[index];
                const isoStr = CalendarHelper.formatISODate(dayDate);
                const isCurrentMonth = dayDate.getMonth() === month;
                const isToday = isoStr === todayISO;

            const dayChilds = activeList.filter(item => isScheduleOnDate(item, isoStr));
                
                // Group by Master Unit
                const masterMap = {};
                dayChilds.forEach(child => {
                    const uId = String(child.unitId || child.tenDonVi);
                    if (!masterMap[uId]) {
                        masterMap[uId] = {
                            unitId: uId,
                            tenDonVi: child.tenDonVi,
                            dateISO: isoStr,
                            childSchedules: []
                        };
                    }
                    masterMap[uId].childSchedules.push(child);
                });

                const masterGroups = Object.values(masterMap);
                const maxVisible = 2;
                const visibleGroups = masterGroups.slice(0, maxVisible);
                const overflowCount = masterGroups.length - maxVisible;

                tbodyHtml += `
                    <td class="p-1.5 border-r border-[#D9DEE5] align-top month-day-cell ${!isCurrentMonth ? 'other-month' : ''} ${isToday ? 'calendar-cell-today' : ''}"
                        data-date="${isoStr}">
                        
                        <div class="flex flex-col h-full justify-between space-y-1">
                            <div>
                                <div class="flex items-center justify-between mb-1">
                                    <span class="text-xs font-bold ${isToday ? 'px-2 py-0.5 rounded-[4px] bg-[#27496D] text-white shadow-2xs' : isCurrentMonth ? 'text-[#1F2937]' : 'text-[#9CA3AF]'}">
                                        ${dayDate.getDate()}
                                    </span>
                                    ${masterGroups.length > 0 ? `<span class="text-[10px] font-bold text-[#27496D] bg-[#E8F1FB] px-1.5 py-0.2 rounded-[3px] border border-[#B3CDE6]">${masterGroups.length} đơn vị</span>` : ''}
                                </div>

                                <div class="space-y-1">
                `;

                visibleGroups.forEach(group => {
                    tbodyHtml += renderMasterGroupMonthCardHtml(group);
                });

                if (overflowCount > 0) {
                    tbodyHtml += `
                        <button type="button" onclick="openDayDetailsModal('${isoStr}')" class="w-full text-center py-0.5 bg-[#F1F5F9] hover:bg-[#E2E8F0] rounded-[3px] text-[10px] font-bold text-[#27496D] transition-colors border border-[#CBD5E1]">
                            +${overflowCount} đơn vị khác...
                        </button>
                    `;
                }

                // EVERY CELL MANDATORY "+ Dự kiến lịch" ACTION BUTTON AT BOTTOM
                tbodyHtml += `
                                </div>
                            </div>

                            <button type="button" onclick="openCreatePlannedModalForDate('${isoStr}', event)" 
                                    class="w-full mt-auto py-1 px-1 bg-[#F8FAFC] hover:bg-[#27496D] text-[#27496D] hover:text-white rounded-[3px] text-[10px] font-bold transition-all flex items-center justify-center gap-1 border border-[#B3CDE6] hover:border-[#27496D] cursor-pointer shadow-2xs">
                                <i class="fa-solid fa-plus text-[9px]"></i>
                                <span>Dự kiến lịch</span>
                            </button>
                        </div>
                    </td>
                `;
            }
        }

        tbodyHtml += `</tr>`;
    }

    gridTbody.innerHTML = tbodyHtml;
}

function renderMasterGroupMonthCardHtml(group) {
    const { unitId, tenDonVi, childSchedules, dateISO } = group;
    const countOnDate = childSchedules.length;
    const totalGuests = childSchedules.reduce((sum, s) => sum + (parseInt(s.soLuongKhach) || 0), 0);

    const tvCount = childSchedules.filter(s => (s.loaiLich || '').includes('tại viện')).length;
    const nvCount = childSchedules.filter(s => (s.loaiLich || '').includes('ngoại viện')).length;
    const tpCount = childSchedules.filter(s => (s.loaiLich || '').includes('phường')).length;

    let breakdownBadges = [];
    if (tvCount > 0) breakdownBadges.push(`<span class="font-bold text-[#27496D]" title="${tvCount} Lịch tại viện">🏥 ${tvCount}</span>`);
    if (nvCount > 0) breakdownBadges.push(`<span class="font-bold text-[#ED6C02]" title="${nvCount} Lịch ngoại viện">🚐 ${nvCount}</span>`);
    if (tpCount > 0) breakdownBadges.push(`<span class="font-bold text-[#7E22CE]" title="${tpCount} Lịch phường">🏘 ${tpCount}</span>`);

    let breakdownHtml = '';
    if (countOnDate > 1) {
        breakdownHtml = breakdownBadges.join('<span class="text-[#CBD5E1] mx-0.5">•</span>');
    } else {
        const singleType = (childSchedules[0].loaiLich || '');
        if (singleType.includes('tại viện')) breakdownHtml = `<span class="font-bold text-[#27496D]">🏥 Tại viện 1</span>`;
        else if (singleType.includes('ngoại viện')) breakdownHtml = `<span class="font-bold text-[#ED6C02]">🚐 Ngoại viện 1</span>`;
        else if (singleType.includes('phường')) breakdownHtml = `<span class="font-bold text-[#7E22CE]">🏘 Tại phường 1</span>`;
    }

    return `
        <div onclick="openGroupDetailModal('${escapeHtml(unitId)}', '${escapeHtml(dateISO)}')" 
             class="event-card master-group-card bg-white hover:bg-[#F0F7FF] border border-[#CBD5E1] hover:border-[#27496D] p-1.5 rounded-[3px] cursor-pointer space-y-1 text-[11px] shadow-2xs transition-all select-none overflow-hidden">
            <div class="flex items-center justify-between font-bold text-[#1F2937] leading-tight gap-1">
                <span class="truncate text-[#27496D] font-bold text-xs min-w-0" title="${escapeHtml(tenDonVi)}">${escapeHtml(tenDonVi)}</span>
                <span class="bg-[#E8F1FB] text-[#27496D] px-1 py-0.2 rounded-[2px] font-bold text-[9px] shrink-0">${countOnDate} lịch</span>
            </div>
            <div class="flex items-center justify-between text-[10px] text-[#4B5563] pt-0.5 border-t border-[#F0F3F7]">
                <strong class="text-[#15803D] shrink-0">${totalGuests.toLocaleString('vi-VN')} KH</strong>
                <div class="flex items-center gap-0.5 truncate">
                    ${breakdownHtml}
                </div>
            </div>
        </div>
    `;
}

// ==========================================
// 5. FOOTER STATUS BAR
// ==========================================
function renderFooterBar(activeList) {
    const totalChildSchedules = activeList.length;
    const totalGuests = activeList.reduce((sum, i) => sum + (parseInt(i.soLuongKhach) || 0), 0);
    const totalStaff = activeList.reduce((sum, i) => sum + (parseInt(i.tongNhanSu) || 0), 0);

    const elemSchedules = document.getElementById('footer-count-schedules');
    const elemGuests = document.getElementById('footer-count-guests');
    const elemStaff = document.getElementById('footer-count-staff');

    if (elemSchedules) elemSchedules.innerText = totalChildSchedules;
    if (elemGuests) elemGuests.innerText = totalGuests.toLocaleString('vi-VN');
    if (elemStaff) elemStaff.innerText = totalStaff.toLocaleString('vi-VN');
}

// ==========================================
// 6. QUICK PLANNING DRAWER & SUB-SCHEDULES CONTROLLER
// ==========================================

let editingMasterId = null;
let currentDraftSubSchedules = [];
let editingSubId = null;
let currentMiniSubScheduleType = 'TAI_VIEN';
let workTypesList = ['Khám sức khỏe', 'Lấy mẫu'];

function bindWorkTypeTagEvents() {
    const input = document.getElementById('work-type-input');
    if (!input) return;
    input.onkeydown = function(e) {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            const val = input.value.trim();
            if (val && !workTypesList.includes(val)) {
                workTypesList.push(val);
                renderWorkTypes();
                input.value = '';
            }
        }
    };
}

function renderWorkTypes() {
    const container = document.getElementById('work-types-list');
    if (!container) return;
    container.innerHTML = workTypesList.map((tag, idx) => `
        <span class="inline-flex items-center gap-1 bg-[#E8F1FB] text-[#27496D] px-2 py-0.5 rounded-[3px] text-xs font-bold border border-[#B4CBE5]">
            ${escapeHtml(tag)}
            <button type="button" onclick="removeWorkTypeTag(${idx})" class="hover:text-red-600 font-bold ml-0.5">&times;</button>
        </span>
    `).join('');
}

function removeWorkTypeTag(index) {
    workTypesList.splice(index, 1);
    renderWorkTypes();
}

function openCreatePlannedModalForDate(dateStr, event) {
    if (event) {
        event.stopPropagation();
    }

    editingMasterId = null;
    editingSubId = null;
    currentDraftSubSchedules = [];
    workTypesList = ['Khám sức khỏe', 'Lấy mẫu'];

    const titleElem = document.getElementById('planned-drawer-title');
    if (titleElem) titleElem.innerText = 'Tạo dự kiến lịch KSK';

    const autoCode = 'KAD' + String(Date.now()).slice(-6);
    const codeBadge = document.getElementById('planned-master-code-badge');
    if (codeBadge) codeBadge.innerText = autoCode;
    const inputCode = document.getElementById('create-ma-doi-tuong');
    if (inputCode) inputCode.value = autoCode;

    const tenElem = document.getElementById('create-ten-don-vi');
    if (tenElem) tenElem.value = '';

    const tuElem = document.getElementById('create-tu-ngay');
    const denElem = document.getElementById('create-den-ngay');
    const targetDate = dateStr || new Date().toISOString().split('T')[0];
    if (tuElem) tuElem.value = targetDate;
    if (denElem) denElem.value = targetDate;

    const cbElem = document.getElementById('create-cb-phu-trach');
    if (cbElem) cbElem.value = 'Nguyễn Văn An';

    const noteElem = document.getElementById('create-ghi-chu');
    if (noteElem) noteElem.value = '';

    renderWorkTypes();
    bindWorkTypeTagEvents();
    closeMiniSubForm();
    renderPlannedSubSchedulesList();

    showDrawer();
}

function openEditPlannedScheduleModal(unitId) {
    closeDayDetailsModal();
    const schedules = (window.MWKDataStore && typeof MWKDataStore.getKskSchedules === 'function') ? MWKDataStore.getKskSchedules() : seedMasterUnits;
    const master = schedules.find(s => String(s.id || s.unitId || s.code) === String(unitId));
    if (!master) return;

    editingMasterId = master.id || master.unitId || master.code;
    editingSubId = null;

    const titleElem = document.getElementById('planned-drawer-title');
    if (titleElem) titleElem.innerText = 'Chỉnh sửa dự kiến lịch KSK';

    const code = master.customerCode || master.maDoiTuong || master.code || '';
    const codeBadge = document.getElementById('planned-master-code-badge');
    if (codeBadge) codeBadge.innerText = code;
    const inputCode = document.getElementById('create-ma-doi-tuong');
    if (inputCode) inputCode.value = code;

    const tenElem = document.getElementById('create-ten-don-vi');
    if (tenElem) tenElem.value = master.customerName || master.teamName || master.tenDonVi || '';

    const tuElem = document.getElementById('create-tu-ngay');
    const denElem = document.getElementById('create-den-ngay');
    if (tuElem) tuElem.value = master.tuNgay || master.examDate || new Date().toISOString().split('T')[0];
    if (denElem) denElem.value = master.denNgay || master.tuNgay || master.examDate || new Date().toISOString().split('T')[0];

    const cbElem = document.getElementById('create-cb-phu-trach');
    if (cbElem) cbElem.value = master.personInCharge || master.cbPhuTrach || 'Nguyễn Văn An';

    const noteElem = document.getElementById('create-ghi-chu');
    if (noteElem) noteElem.value = master.contractNote || master.generalNote || '';

    workTypesList = Array.isArray(master.workTypes) && master.workTypes.length > 0 ? [...master.workTypes] : (master.loaiLich ? master.loaiLich.split(',').map(s => s.trim()) : ['Khám sức khỏe']);
    renderWorkTypes();
    bindWorkTypeTagEvents();

    // Reconstruct currentDraftSubSchedules from master
    currentDraftSubSchedules = [];
    if (master.step2Data) {
        const parseSubGroup = (list, scheduleType, loaiLich) => {
            if (Array.isArray(list)) {
                list.forEach((sub, idx) => {
                    currentDraftSubSchedules.push({
                        id: sub.id || sub.scheduleId || `SUB-${Date.now()}-${idx}`,
                        scheduleType: scheduleType,
                        loaiLich: sub.loaiLich || loaiLich,
                        ngayKham: sub.ngayKham || sub.examDate || master.tuNgay || new Date().toISOString().split('T')[0],
                        ca: sub.ca || (sub.session === 'Chiều' ? 'Chieu' : 'Sang'),
                        soLuongNam: Number(sub.soLuongNam || sub.nam || 0),
                        soLuongNu: Number(sub.soLuongNu || sub.nu || 0),
                        soLuongKhach: Number(sub.soLuongKhach || sub.quantity || sub.soLuong || 0),
                        coSo: sub.coSo || sub.facility || sub.location || 'MEDLATEC Ba Đình',
                        diaDiemKham: sub.diaDiemKham || sub.location || 'Địa điểm khám',
                        ghiChu: sub.ghiChu || sub.note || ''
                    });
                });
            }
        };
        parseSubGroup(master.step2Data.taiVien, 'TAI_VIEN', 'Lịch tại viện');
        parseSubGroup(master.step2Data.ngoaiVien, 'NGOAI_VIEN', 'Lịch ngoại viện');
        parseSubGroup(master.step2Data.lichPhuong, 'LICH_PHUONG', 'Lịch phường');
    } else if (Array.isArray(master.childSchedules)) {
        master.childSchedules.forEach((sub, idx) => {
            let st = (sub.scheduleType || '').toUpperCase();
            if (!st) {
                if ((sub.loaiLich || '').includes('ngoại viện')) st = 'NGOAI_VIEN';
                else if ((sub.loaiLich || '').includes('phường')) st = 'LICH_PHUONG';
                else st = 'TAI_VIEN';
            }
            currentDraftSubSchedules.push({
                id: sub.id || sub.scheduleId || `SUB-${Date.now()}-${idx}`,
                scheduleType: st,
                loaiLich: sub.loaiLich || (st === 'NGOAI_VIEN' ? 'Lịch ngoại viện' : (st === 'LICH_PHUONG' ? 'Lịch phường' : 'Lịch tại viện')),
                ngayKham: sub.ngayKham || sub.examDate || master.tuNgay || new Date().toISOString().split('T')[0],
                ca: sub.ca || 'Sang',
                soLuongNam: Number(sub.soLuongNam || 0),
                soLuongNu: Number(sub.soLuongNu || 0),
                soLuongKhach: Number(sub.soLuongKhach || sub.quantity || sub.soLuong || 0),
                coSo: sub.coSo || sub.facility || 'MEDLATEC Ba Đình',
                diaDiemKham: sub.diaDiemKham || sub.location || 'Địa điểm khám',
                ghiChu: sub.ghiChu || ''
            });
        });
    }

    closeMiniSubForm();
    renderPlannedSubSchedulesList();

    showDrawer();
}

function showDrawer() {
    const backdrop = document.getElementById('drawer-create-planned-backdrop');
    const drawer = document.getElementById('drawer-create-planned');
    if (backdrop) {
        backdrop.classList.remove('pointer-events-none', 'opacity-0');
        backdrop.classList.add('opacity-100');
    }
    if (drawer) {
        drawer.classList.remove('translate-x-full');
    }
}

function closeCreatePlannedModal() {
    const backdrop = document.getElementById('drawer-create-planned-backdrop');
    const drawer = document.getElementById('drawer-create-planned');
    if (backdrop) {
        backdrop.classList.remove('opacity-100');
        backdrop.classList.add('opacity-0', 'pointer-events-none');
    }
    if (drawer) {
        drawer.classList.add('translate-x-full');
    }
    editingMasterId = null;
    editingSubId = null;
    currentDraftSubSchedules = [];
}

// Mini Sub Form Handlers
function openMiniSubForm(typeCode, subId = null) {
    currentMiniSubScheduleType = typeCode;
    editingSubId = subId;

    const panel = document.getElementById('mini-sub-form-panel');
    const titleElem = document.getElementById('mini-sub-form-title');
    const masterTuDate = document.getElementById('create-tu-ngay')?.value || new Date().toISOString().split('T')[0];

    let typeLabel = 'Lịch tại viện';
    if (typeCode === 'NGOAI_VIEN') typeLabel = 'Lịch ngoại viện';
    else if (typeCode === 'LICH_PHUONG') typeLabel = 'Lịch phường';

    if (titleElem) {
        titleElem.innerText = subId ? `Chỉnh sửa: ${typeLabel}` : `Thêm mới: ${typeLabel}`;
    }

    if (subId) {
        const sub = currentDraftSubSchedules.find(s => String(s.id) === String(subId));
        if (sub) {
            if (document.getElementById('mini-sub-ngay-kham')) document.getElementById('mini-sub-ngay-kham').value = sub.ngayKham || masterTuDate;
            if (document.getElementById('mini-sub-ca-kham')) document.getElementById('mini-sub-ca-kham').value = sub.ca || 'Sang';
            if (document.getElementById('mini-sub-nam')) document.getElementById('mini-sub-nam').value = sub.soLuongNam || 0;
            if (document.getElementById('mini-sub-nu')) document.getElementById('mini-sub-nu').value = sub.soLuongNu || 0;
            if (document.getElementById('mini-sub-co-so')) document.getElementById('mini-sub-co-so').value = sub.coSo || sub.diaDiemKham || '';
            if (document.getElementById('mini-sub-ghi-chu')) document.getElementById('mini-sub-ghi-chu').value = sub.ghiChu || '';
        }
    } else {
        if (document.getElementById('mini-sub-ngay-kham')) document.getElementById('mini-sub-ngay-kham').value = masterTuDate;
        if (document.getElementById('mini-sub-ca-kham')) document.getElementById('mini-sub-ca-kham').value = 'Sang';
        if (document.getElementById('mini-sub-nam')) document.getElementById('mini-sub-nam').value = 50;
        if (document.getElementById('mini-sub-nu')) document.getElementById('mini-sub-nu').value = 50;
        if (document.getElementById('mini-sub-co-so')) document.getElementById('mini-sub-co-so').value = typeCode === 'TAI_VIEN' ? 'MEDLATEC Ba Đình' : (typeCode === 'NGOAI_VIEN' ? 'Ngoại viện' : 'MEDLATEC Ba Đình');
        if (document.getElementById('mini-sub-ghi-chu')) document.getElementById('mini-sub-ghi-chu').value = '';
    }

    calculateMiniSubTotal();
    if (panel) panel.classList.remove('hidden');
}

function calculateMiniSubTotal() {
    const nam = parseInt(document.getElementById('mini-sub-nam')?.value, 10) || 0;
    const nu = parseInt(document.getElementById('mini-sub-nu')?.value, 10) || 0;
    const tongInput = document.getElementById('mini-sub-tong');
    if (tongInput) tongInput.value = nam + nu;
}

function closeMiniSubForm() {
    const panel = document.getElementById('mini-sub-form-panel');
    if (panel) panel.classList.add('hidden');
    editingSubId = null;
}

function saveMiniSubForm() {
    const ngayKham = document.getElementById('mini-sub-ngay-kham')?.value || '';
    const ca = document.getElementById('mini-sub-ca-kham')?.value || 'Sang';
    const nam = parseInt(document.getElementById('mini-sub-nam')?.value, 10) || 0;
    const nu = parseInt(document.getElementById('mini-sub-nu')?.value, 10) || 0;
    const tong = nam + nu;
    const coSo = document.getElementById('mini-sub-co-so')?.value.trim() || 'MEDLATEC';
    const ghiChu = document.getElementById('mini-sub-ghi-chu')?.value.trim() || '';

    if (!ngayKham) {
        if (window.showToast) window.showToast('Vui lòng chọn Ngày dự kiến cho lịch con!', 'error');
        else alert('Vui lòng chọn Ngày dự kiến cho lịch con!');
        return;
    }

    let typeLabel = 'Lịch tại viện';
    if (currentMiniSubScheduleType === 'NGOAI_VIEN') typeLabel = 'Lịch ngoại viện';
    else if (currentMiniSubScheduleType === 'LICH_PHUONG') typeLabel = 'Lịch phường';

    if (editingSubId) {
        const sub = currentDraftSubSchedules.find(s => String(s.id) === String(editingSubId));
        if (sub) {
            sub.ngayKham = ngayKham;
            sub.examDate = ngayKham;
            sub.ca = ca;
            sub.soLuongNam = nam;
            sub.soLuongNu = nu;
            sub.soLuongKhach = tong;
            sub.coSo = coSo;
            sub.diaDiemKham = coSo;
            sub.ghiChu = ghiChu;
        }
    } else {
        const newId = `SUB-${Date.now()}-${Math.floor(Math.random()*1000)}`;
        currentDraftSubSchedules.push({
            id: newId,
            scheduleId: newId,
            maLich: newId,
            scheduleType: currentMiniSubScheduleType,
            loaiLich: typeLabel,
            ngayKham: ngayKham,
            examDate: ngayKham,
            ca: ca,
            soLuongNam: nam,
            soLuongNu: nu,
            soLuongKhach: tong,
            coSo: coSo,
            diaDiemKham: coSo,
            ghiChu: ghiChu
        });
    }

    closeMiniSubForm();
    renderPlannedSubSchedulesList();

    if (window.showToast) window.showToast(`Đã lưu thông tin ${typeLabel}!`, 'success');
}

function deletePlannedSubSchedule(subId) {
    if (confirm('Bạn có chắc chắn muốn xóa lịch con này không?')) {
        currentDraftSubSchedules = currentDraftSubSchedules.filter(s => String(s.id) !== String(subId));
        renderPlannedSubSchedulesList();
        if (window.showToast) window.showToast('Đã xóa lịch con dự kiến', 'info');
    }
}

function renderPlannedSubSchedulesList() {
    const listElem = document.getElementById('planned-sub-schedules-list');
    const badgeElem = document.getElementById('planned-drawer-summary-badge');

    const totalGuests = currentDraftSubSchedules.reduce((sum, s) => sum + (parseInt(s.soLuongKhach) || 0), 0);
    if (badgeElem) {
        badgeElem.innerHTML = `Tổng số <strong>${currentDraftSubSchedules.length}</strong> lịch con dự kiến (<strong>${totalGuests.toLocaleString('vi-VN')}</strong> KH)`;
    }

    if (!listElem) return;

    if (currentDraftSubSchedules.length === 0) {
        listElem.innerHTML = `
            <div class="text-center py-6 text-[#9CA3AF] italic border border-dashed border-[#CBD5E1] rounded-[4px] bg-[#F8FAFC]">
                <i class="fa-solid fa-list-check text-2xl mb-1 text-[#CBD5E1]"></i>
                <p>Chưa có lịch con dự kiến nào. Nhấn một trong 3 nút trên để thêm lịch con.</p>
            </div>
        `;
        return;
    }

    listElem.innerHTML = currentDraftSubSchedules.map(item => {
        const style = CalendarHelper.getScheduleTypeStyle(item.loaiLich);
        const shiftLabel = item.ca === 'Chieu' ? 'Chiều (13:30 - 17:00)' : (item.ca === 'CaNgay' ? 'Cả ngày' : 'Sáng (07:30 - 11:30)');
        const dParts = (item.ngayKham || '').split('-');
        const dateFmt = dParts.length === 3 ? `${dParts[2]}/${dParts[1]}/${dParts[0]}` : item.ngayKham;

        return `
            <div class="bg-white p-3 rounded-[4px] border border-[#D9DEE5] hover:border-[#27496D] shadow-2xs space-y-2 transition-all">
                <div class="flex items-center justify-between">
                    <span class="font-bold text-xs flex items-center gap-1.5 ${style.badgeClass} px-2 py-0.5 rounded-[3px]">
                        ${style.label}
                    </span>
                    <div class="flex items-center gap-1">
                        <button type="button" onclick="openMiniSubForm('${item.scheduleType}', '${item.id}')" class="text-xs text-[#27496D] hover:underline font-bold px-2 py-0.5 rounded hover:bg-[#E8F1FB]">
                            <i class="fa-solid fa-pen text-[10px] mr-1"></i>Sửa
                        </button>
                        <button type="button" onclick="deletePlannedSubSchedule('${item.id}')" class="text-xs text-red-600 hover:underline font-bold px-2 py-0.5 rounded hover:bg-red-50">
                            <i class="fa-solid fa-trash text-[10px] mr-1"></i>Xóa
                        </button>
                    </div>
                </div>
                <div class="flex items-center justify-between text-xs text-[#4B5563]">
                    <div><i class="fa-solid fa-calendar-day text-[10px] mr-1 text-[#27496D]"></i><strong>${dateFmt}</strong> (${shiftLabel})</div>
                    <div><i class="fa-solid fa-users text-[10px] mr-1 text-[#15803D]"></i><strong class="text-[#15803D]">${item.soLuongKhach} KH</strong> (${item.soLuongNam || 0} Nam / ${item.soLuongNu || 0} Nữ)</div>
                </div>
                <div class="text-xs text-[#4B5563]">
                    <i class="fa-solid fa-location-dot text-[10px] mr-1 text-[#27496D]"></i>${escapeHtml(item.coSo)}
                </div>
            </div>
        `;
    }).join('');
}

function handleMasterDateChange() {
    const tuNgay = document.getElementById('create-tu-ngay')?.value;
    const denNgayElem = document.getElementById('create-den-ngay');
    if (tuNgay && denNgayElem && (!denNgayElem.value || denNgayElem.value < tuNgay)) {
        denNgayElem.value = tuNgay;
    }
}

// Master Save Function
function savePlannedSchedule() {
    const tenDonVi = (document.getElementById('create-ten-don-vi')?.value || '').trim();
    const maDoiTuong = (document.getElementById('create-ma-doi-tuong')?.value || '').trim() || ('KAD' + String(Date.now()).slice(-6));
    const tuNgay = document.getElementById('create-tu-ngay')?.value || new Date().toISOString().split('T')[0];
    const denNgay = document.getElementById('create-den-ngay')?.value || tuNgay;
    const cbPhuTrach = document.getElementById('create-cb-phu-trach')?.value || 'Nguyễn Văn An';
    const ghiChu = (document.getElementById('create-ghi-chu')?.value || '').trim();

    if (!tenDonVi) {
        if (window.showToast) window.showToast('Vui lòng nhập Tên đơn vị / Khách hàng!', 'error');
        else alert('Vui lòng nhập Tên đơn vị / Khách hàng!');
        return;
    }

    // Auto-create 1 fallback sub-schedule if list is empty
    if (currentDraftSubSchedules.length === 0) {
        const fallbackId = `SUB-${Date.now()}`;
        currentDraftSubSchedules.push({
            id: fallbackId,
            scheduleId: fallbackId,
            scheduleType: 'TAI_VIEN',
            loaiLich: 'Lịch tại viện',
            ngayKham: tuNgay,
            examDate: tuNgay,
            ca: 'Sang',
            soLuongNam: 50,
            soLuongNu: 50,
            soLuongKhach: 100,
            coSo: 'MEDLATEC Ba Đình',
            diaDiemKham: 'MEDLATEC Ba Đình',
            ghiChu: ghiChu
        });
    }

    const masterId = editingMasterId || `PLAN-${Date.now()}`;
    const masterCode = maDoiTuong.startsWith('LK-') ? maDoiTuong : `LK-2026-${Math.floor(100 + Math.random()*900)}`;

    const totalGuests = currentDraftSubSchedules.reduce((sum, s) => sum + (parseInt(s.soLuongKhach) || 0), 0);
    const loaiLichTypes = Array.from(new Set(currentDraftSubSchedules.map(s => s.loaiLich)));

    const masterObj = {
        id: masterId,
        unitId: masterId,
        code: masterCode,
        customerCode: maDoiTuong,
        maDoiTuong: maDoiTuong,
        customerName: tenDonVi,
        teamName: tenDonVi,
        tenDonVi: tenDonVi,
        personInCharge: cbPhuTrach,
        cbPhuTrach: cbPhuTrach,
        facility: currentDraftSubSchedules[0]?.coSo || 'MEDLATEC Ba Đình',
        tuNgay: tuNgay,
        denNgay: denNgay,
        examDate: tuNgay,
        workTypes: workTypesList,
        loaiLich: loaiLichTypes.join(', '),
        loaiLichTypes: loaiLichTypes,
        estimatedCount: totalGuests,
        soLuong: totalGuests,
        contractNote: ghiChu,
        generalNote: ghiChu,
        isDuKien: true,
        recordType: 'DU_KIEN',
        trangThai: 'DU_KIEN',
        status: 'Dự kiến',
        childSchedules: currentDraftSubSchedules,
        step2Data: {
            taiVien: currentDraftSubSchedules.filter(s => s.scheduleType === 'TAI_VIEN'),
            ngoaiVien: currentDraftSubSchedules.filter(s => s.scheduleType === 'NGOAI_VIEN'),
            lichPhuong: currentDraftSubSchedules.filter(s => s.scheduleType === 'LICH_PHUONG')
        }
    };

    if (window.MWKDataStore && typeof window.MWKDataStore.addKskSchedule === 'function') {
        const existingList = MWKDataStore.getKskSchedules();
        const existing = existingList.find(s => String(s.id) === String(masterId) || String(s.unitId) === String(masterId));
        if (existing) {
            MWKDataStore.updateKskSchedule(existing.id, masterRecordToStore(masterObj));
        } else {
            MWKDataStore.addKskSchedule(masterRecordToStore(masterObj));
        }
    } else {
        const existingIdx = seedMasterUnits.findIndex(s => String(s.unitId) === String(masterId));
        if (existingIdx >= 0) seedMasterUnits[existingIdx] = masterObj;
        else seedMasterUnits.unshift(masterObj);
    }

    closeCreatePlannedModal();
    loadSchedulesData();
    renderCalendar();

    if (window.showToast) {
        window.showToast(`Đã lưu dự kiến lịch KSK cho "${tenDonVi}" thành công!`, 'success');
    }
}

function masterRecordToStore(obj) {
    return {
        ...obj,
        trangThai: 'DU_KIEN',
        status: 'Dự kiến',
        isDuKien: true,
        recordType: 'DU_KIEN'
    };
}

function deletePlannedMasterSchedule(unitId) {
    if (confirm('Bạn có chắc chắn muốn xóa đợt khám dự kiến này không?')) {
        if (window.MWKDataStore && typeof MWKDataStore.deleteKskSchedule === 'function') {
            MWKDataStore.deleteKskSchedule(unitId);
        } else {
            const idx = seedMasterUnits.findIndex(s => String(s.unitId || s.id) === String(unitId));
            if (idx >= 0) seedMasterUnits.splice(idx, 1);
        }
        closeDayDetailsModal();
        loadSchedulesData();
        renderCalendar();
        if (window.showToast) window.showToast('Đã xóa dự kiến lịch thành công!', 'info');
    }
}

// ==========================================
// 7. DETAIL MODAL HANDLERS
// ==========================================

function handleCellDoubleClick(dateStr, shiftLabel) {
    openCreatePlannedModalForDate(dateStr);
}

function openGroupDetailModal(unitId, dateISO) {
    const schedules = (window.MWKDataStore && typeof MWKDataStore.getKskSchedules === 'function') ? MWKDataStore.getKskSchedules() : seedMasterUnits;
    const master = schedules.find(s => String(s.id || s.unitId || s.code) === String(unitId));
    
    const activeList = getFilteredSchedules();
    const unitChilds = activeList.filter(item => String(item.unitId) === String(unitId));

    if (!master && unitChilds.length === 0) {
        openDayDetailsModal(dateISO);
        return;
    }

    const modal = document.getElementById('modal-day-details');
    const titleElem = document.getElementById('modal-day-title');
    const contentElem = document.getElementById('modal-day-content');
    const countSummary = document.getElementById('modal-day-count-summary');

    const unitName = master ? (master.customerName || master.teamName || master.tenDonVi) : (unitChilds[0]?.tenDonVi || 'Đơn vị KSK');
    const totalGuests = unitChilds.reduce((sum, i) => sum + (parseInt(i.soLuongKhach) || 0), 0);

    if (titleElem) {
        titleElem.innerHTML = `<span class="font-bold text-[#27496D]">${escapeHtml(unitName)}</span> <span class="bg-[#E8F1FB] text-[#27496D] text-[10px] font-bold px-2 py-0.5 rounded-[3px] ml-2 border border-[#B4CBE5]">DỰ KIẾN</span>`;
    }

    if (countSummary) {
        countSummary.innerHTML = `
            <div class="flex items-center gap-2">
                <button type="button" onclick="openEditPlannedScheduleModal('${escapeHtml(unitId)}')" class="btn-primary text-xs px-3 py-1 font-bold cursor-pointer">
                    <i class="fa-solid fa-pen-to-square text-[10px] mr-1"></i>Sửa dự kiến
                </button>
                <button type="button" onclick="deletePlannedMasterSchedule('${escapeHtml(unitId)}')" class="btn-secondary text-xs px-3 py-1 text-red-600 border-red-300 hover:bg-red-50 font-bold cursor-pointer">
                    <i class="fa-solid fa-trash text-[10px] mr-1"></i>Xóa đợt khám
                </button>
            </div>
        `;
    }

    if (contentElem) {
        renderModalGroupedContent(contentElem, unitChilds.length > 0 ? unitChilds : (master ? master.childSchedules || [] : []));
    }

    if (modal) modal.classList.remove('hidden');
}

function openDayDetailsModal(dateISO) {
    const activeList = getFilteredSchedules();
    const dayChilds = activeList.filter(item => item.ngayKham === dateISO);

    const modal = document.getElementById('modal-day-details');
    const titleElem = document.getElementById('modal-day-title');
    const contentElem = document.getElementById('modal-day-content');
    const countSummary = document.getElementById('modal-day-count-summary');

    if (titleElem) {
        const parts = dateISO.split('-');
        const dateFormatted = `${parts[2]}/${parts[1]}/${parts[0]}`;
        titleElem.innerText = `Lịch khám dự kiến - Ngày ${dateFormatted}`;
    }

    const totalGuests = dayChilds.reduce((sum, i) => sum + (parseInt(i.soLuongKhach) || 0), 0);
    if (countSummary) {
        countSummary.innerText = `Tổng số ${dayChilds.length} lịch con dự kiến (${totalGuests.toLocaleString('vi-VN')} lượt khách)`;
    }

    if (contentElem) {
        renderModalGroupedContent(contentElem, dayChilds);
    }

    if (modal) modal.classList.remove('hidden');
}

function renderModalGroupedContent(containerElem, childList) {
    if (childList.length === 0) {
        containerElem.innerHTML = `
            <div class="text-center py-8 text-[#9CA3AF] italic">Không có lịch khám dự kiến trong đợt này.</div>
        `;
        return;
    }

    const taiVienList = childList.filter(i => (i.loaiLich || '').includes('tại viện'));
    const ngoaiVienList = childList.filter(i => (i.loaiLich || '').includes('ngoại viện'));
    const phuongList = childList.filter(i => (i.loaiLich || '').includes('phường'));

    let html = '';

    // Section 1: LỊCH TẠI VIỆN
    if (taiVienList.length > 0) {
        const tvCount = taiVienList.reduce((s, i) => s + (parseInt(i.soLuongKhach) || 0), 0);
        html += `
            <div class="bg-white rounded-[4px] border border-[#D9DEE5] overflow-hidden shadow-2xs space-y-2">
                <div class="bg-[#E8F1FB] px-3.5 py-2 border-b border-[#B4CBE5] flex items-center justify-between text-[#27496D]">
                    <span class="font-bold uppercase text-xs flex items-center gap-1.5">
                        <span class="w-2.5 h-2.5 rounded-full bg-[#27496D]"></span> LỊCH TẠI VIỆN
                    </span>
                    <span class="font-extrabold text-xs">${taiVienList.length} lịch (${tvCount.toLocaleString('vi-VN')} KH)</span>
                </div>
                <div class="p-3 space-y-2">
                    ${renderModalChildItems(taiVienList)}
                </div>
            </div>
        `;
    }

    // Section 2: LỊCH NGOẠI VIỆN
    if (ngoaiVienList.length > 0) {
        const nvCount = ngoaiVienList.reduce((s, i) => s + (parseInt(i.soLuongKhach) || 0), 0);
        html += `
            <div class="bg-white rounded-[4px] border border-[#D9DEE5] overflow-hidden shadow-2xs space-y-2">
                <div class="bg-[#FFF3E0] px-3.5 py-2 border-b border-[#FFE0B2] flex items-center justify-between text-[#E65100]">
                    <span class="font-bold uppercase text-xs flex items-center gap-1.5">
                        <span class="w-2.5 h-2.5 rounded-full bg-[#ED6C02]"></span> LỊCH NGOẠI VIỆN
                    </span>
                    <span class="font-extrabold text-xs">${ngoaiVienList.length} lịch (${nvCount.toLocaleString('vi-VN')} KH)</span>
                </div>
                <div class="p-3 space-y-2">
                    ${renderModalChildItems(ngoaiVienList)}
                </div>
            </div>
        `;
    }

    // Section 3: LỊCH TẠI PHƯỜNG
    if (phuongList.length > 0) {
        const tpCount = phuongList.reduce((s, i) => s + (parseInt(i.soLuongKhach) || 0), 0);
        html += `
            <div class="bg-white rounded-[4px] border border-[#D9DEE5] overflow-hidden shadow-2xs space-y-2">
                <div class="bg-[#F3E8FF] px-3.5 py-2 border-b border-[#E9D5FF] flex items-center justify-between text-[#6B21A8]">
                    <span class="font-bold uppercase text-xs flex items-center gap-1.5">
                        <span class="w-2.5 h-2.5 rounded-full bg-[#7E22CE]"></span> LỊCH TẠI PHƯỜNG
                    </span>
                    <span class="font-extrabold text-xs">${phuongList.length} lịch (${tpCount.toLocaleString('vi-VN')} KH)</span>
                </div>
                <div class="p-3 space-y-2">
                    ${renderModalChildItems(phuongList)}
                </div>
            </div>
        `;
    }

    containerElem.innerHTML = html;
}

function renderModalChildItems(items) {
    return items.map(item => {
        const dParts = (item.ngayKham || '').split('-');
        const dateFormatted = dParts.length === 3 ? `${dParts[2]}/${dParts[1]}/${dParts[0]}` : item.ngayKham;
        const style = CalendarHelper.getScheduleTypeStyle(item.loaiLich);

        return `
            <div class="bg-[#F8FAFC] p-3 rounded-[4px] border border-[#D9DEE5] hover:border-[#27496D] space-y-2 transition-all">
                <div class="flex items-center justify-between">
                    <span class="font-bold text-xs text-[#1F2937]">Mã lịch con: <strong class="font-mono text-[#27496D] font-extrabold">${escapeHtml(item.scheduleId || item.id)}</strong></span>
                    <span class="text-[10px] font-bold px-2 py-0.5 rounded-[3px] ${style.badgeClass}">${style.label}</span>
                </div>
                <div class="flex items-center justify-between text-xs text-[#4B5563]">
                    <div><i class="fa-solid fa-calendar-day text-[10px] mr-1 text-[#27496D]"></i>${dateFormatted} (${item.gioBatDau || '07:30'} - ${item.gioKetThuc || '11:30'})</div>
                    <div><i class="fa-solid fa-users text-[10px] mr-1 text-[#15803D]"></i><strong class="text-[#15803D]">${item.soLuongKhach} KH</strong></div>
                </div>
                <div class="text-xs text-[#4B5563]">
                    <i class="fa-solid fa-hospital text-[10px] mr-1 text-[#27496D]"></i>${escapeHtml(item.coSo)} • ${escapeHtml(item.diaDiemKham)}
                </div>
            </div>
        `;
    }).join('');
}

function closeDayDetailsModal() {
    const modal = document.getElementById('modal-day-details');
    if (modal) modal.classList.add('hidden');
}

function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

window.loadSchedulesData = loadSchedulesData;
window.getFilteredSchedules = getFilteredSchedules;
window.renderSummaryCards = renderSummaryCards;
window.openCreatePlannedModalForDate = openCreatePlannedModalForDate;
window.openEditPlannedScheduleModal = openEditPlannedScheduleModal;
window.closeCreatePlannedModal = closeCreatePlannedModal;
window.savePlannedSchedule = savePlannedSchedule;
window.openMiniSubForm = openMiniSubForm;
window.closeMiniSubForm = closeMiniSubForm;
window.saveMiniSubForm = saveMiniSubForm;
window.calculateMiniSubTotal = calculateMiniSubTotal;
window.deletePlannedSubSchedule = deletePlannedSubSchedule;
window.deletePlannedMasterSchedule = deletePlannedMasterSchedule;
window.removeWorkTypeTag = removeWorkTypeTag;
window.handleMasterDateChange = handleMasterDateChange;
window.openGroupDetailModal = openGroupDetailModal;
window.openDayDetailsModal = openDayDetailsModal;
window.closeDayDetailsModal = closeDayDetailsModal;
window.handleCellDoubleClick = handleCellDoubleClick;
