/**
 * COMPREHENSIVE 8-TEST VERIFICATION SCRIPT FOR DIEU PHOI LICH KSK MODULE
 */
const path = require('path');

const storageMap = {};
global.localStorage = {
    getItem: (k) => storageMap[k] || null,
    setItem: (k, v) => { storageMap[k] = String(v); },
    removeItem: (k) => { delete storageMap[k]; },
    clear: () => { Object.keys(storageMap).forEach(k => delete storageMap[k]); }
};
global.window = global;
global.window.dispatchEvent = function() {};

require(path.join(__dirname, '../js/data-store.js'));

console.log('=== STARTING DIEU PHOI MODULE 8-TEST SUITE ===');

let passed = 0;
let total = 0;

function assert(cond, msg) {
    total++;
    if (cond) {
        console.log(`[PASS] Test ${total}: ${msg}`);
        passed++;
    } else {
        console.error(`[FAIL] Test ${total}: ${msg}`);
        process.exitCode = 1;
    }
}

// Helper to refresh deployments array from DataStore
function getFilteredDieuPhoiList() {
    const raw = window.MWKDataStore.getDeployments();
    return raw.filter(d => {
        const hasCbtk = d.cbtk && (d.cbtk.cbtkId || d.cbtk.cbtkName);
        if (d.loaiHinh === 'Ngoại viện') {
            return hasCbtk;
        } else {
            return d.isTransferred || d.thietLapStatus === 'THIEU_NHAN_SU' || d.thietLapStatus === 'CHO_DIEU_PHOI' || (d.coordinationStaff && d.coordinationStaff.length > 0);
        }
    });
}

// ----------------------------------------------------
// TEST 5 & 6: NGOẠI VIỆN CBTK FILTERING IN ĐIỀU PHỐI
// ----------------------------------------------------
console.log('\n--- TEST 5 & 6: Ngoại viện CBTK Filter ---');
const rawAll = window.MWKDataStore.getDeployments();
const nvItem = rawAll[0];

// Clear CBTK for testing
window.MWKDataStore.saveDeploymentMeta(nvItem.deploymentId, { loaiHinh: 'Ngoại viện', cbtk: {} });
let listUnassigned = getFilteredDieuPhoiList();
assert(!listUnassigned.some(d => d.deploymentId === nvItem.deploymentId), 'TEST 5: Ngoại viện CHƯA gán CBTK -> KHÔNG xuất hiện trong Điều phối');

// Assign CBTK
window.MWKDataStore.saveDeploymentMeta(nvItem.deploymentId, { loaiHinh: 'Ngoại viện', cbtk: { cbtkId: 'BS. Đỗ Mỹ Hạnh', cbtkName: 'BS. Đỗ Mỹ Hạnh' } });
let listAssigned = getFilteredDieuPhoiList();
assert(listAssigned.some(d => d.deploymentId === nvItem.deploymentId), 'TEST 6: Ngoại viện ĐÃ gán CBTK -> PHẢI xuất hiện trong Điều phối');

// ----------------------------------------------------
// TEST 1: NGOẠI VIỆN FULL WORKFLOW (Sơ đồ -> Gán nhân sự -> Đủ -> Hoàn thành)
// ----------------------------------------------------
console.log('\n--- TEST 1: Ngoại viện Full Workflow ---');
// 1. Setup Diagram for Ngoại viện
const nvDiagram = [
    { locationName: 'Khu 1', specialty: 'Khám Nội tổng quát', needBS: 1, needDD: 1, equipmentNeed: 'Ống nghe' }
];
window.MWKDataStore.saveDeploymentDiagram(nvItem.deploymentId, nvDiagram);
const depNvWithDiagram = window.MWKDataStore.getDeployment(nvItem.deploymentId);
assert(depNvWithDiagram.diagram.length === 1, 'Ngoại viện Clinical Diagram established inside Điều phối');

// 2. Assign Personnel to Ngoại viện
const nvStaff = [
    { staffId: 'BS. Nguyễn Văn An', name: 'BS. Nguyễn Văn An', staffType: 'CBNV', position: 'Bác sĩ', specialty: 'Khám Nội tổng quát' },
    { staffId: 'ĐD. Trần Thị Bích', name: 'ĐD. Trần Thị Bích', staffType: 'CBNV', position: 'Điều dưỡng', specialty: 'Khám Nội tổng quát' }
];
window.MWKDataStore.assignDeploymentStaff(nvItem.deploymentId, nvStaff);
const depNvDone = window.MWKDataStore.getDeployment(nvItem.deploymentId);
assert(depNvDone.dieuPhoiStatus === 'HOAN_THANH', 'Ngoại viện status transitions to HOAN_THANH when all needed staff assigned');

// ----------------------------------------------------
// TEST 4: TẠI VIỆN ĐỦ NHÂN SỰ -> KHÔNG XUẤT HIỆN TRONG ĐIỀU PHỐI (Khi chưa transfer)
// ----------------------------------------------------
console.log('\n--- TEST 4: Tại viện Đủ nhân sự Filter ---');
const tvItem = rawAll[1] || rawAll[0];
window.MWKDataStore.saveDeploymentMeta(tvItem.deploymentId, { loaiHinh: 'Tại viện' });
window.MWKDataStore.saveDeploymentCbtk(tvItem.deploymentId, { cbtkId: 'BS. Nguyễn Văn An', cbtkName: 'BS. Nguyễn Văn An' });

// Set small diagram: 1 BS, 1 DD
const tvDiagram = [
    { floor: 'Tầng 6', locationName: 'Khám Nội', specialty: 'Khám Nội tổng quát', needBS: 1, needDD: 1 }
];
const fullStaffList = [
    { staffId: 'BS. Nguyễn Văn An', name: 'BS. Nguyễn Văn An', staffType: 'CBNV', position: 'Bác sĩ', specialty: 'Khám Nội tổng quát' },
    { staffId: 'ĐD. Trần Thị Bích', name: 'ĐD. Trần Thị Bích', staffType: 'CBNV', position: 'Điều dưỡng', specialty: 'Khám Nội tổng quát' }
];

window.MWKDataStore.saveDeploymentMeta(tvItem.deploymentId, { isTransferred: false, diagram: tvDiagram, coordinationStaff: fullStaffList });
const depTvFull = window.MWKDataStore.getDeployment(tvItem.deploymentId);
assert(depTvFull.thietLapStatus === 'HOAN_THANH_DIEU_PHOI', 'Tại viện status evaluated as HOAN_THANH_DIEU_PHOI');

// ----------------------------------------------------
// TEST 2: TẠI VIỆN THIẾU NHÂN SỰ -> CHUYỂN ĐIỀU PHỐI -> HIỂN THỊ ĐÚNG SỐ THIẾU -> GÁN ĐỦ -> HOÀN THÀNH
// ----------------------------------------------------
console.log('\n--- TEST 2: Tại viện Thiếu nhân sự Workflow ---');
// Clear staff to make it deficient
window.MWKDataStore.saveDeploymentMeta(tvItem.deploymentId, { isTransferred: false, diagram: tvDiagram, coordinationStaff: [] });
const depMissing = window.MWKDataStore.getDeployment(tvItem.deploymentId);
assert(depMissing.thietLapStatus === 'THIEU_NHAN_SU', 'Status set to THIEU_NHAN_SU when assigned < needed');

window.MWKDataStore.transferDeploymentToCoordination(tvItem.deploymentId);
const listTransferred = getFilteredDieuPhoiList();
assert(listTransferred.some(d => d.deploymentId === tvItem.deploymentId), 'Tại viện THIẾU nhân sự -> PHẢI xuất hiện trong Điều phối sau khi Chuyển điều phối');

// Gán bổ sung nhân sự
window.MWKDataStore.assignDeploymentStaff(tvItem.deploymentId, fullStaffList);
const reloadedTv = window.MWKDataStore.getDeployment(tvItem.deploymentId);
assert(reloadedTv.dieuPhoiStatus === 'HOAN_THANH', 'Cập nhật trạng thái điều phối thành HOAN_THANH sau khi gán đủ nhân sự bổ sung');

// ----------------------------------------------------
// TEST 3: TẠI PHƯỜNG WORKFLOW
// ----------------------------------------------------
console.log('\n--- TEST 3: Tại phường Workflow ---');
const tpItem = rawAll[2] || rawAll[0];
window.MWKDataStore.saveDeploymentMeta(tpItem.deploymentId, { loaiHinh: 'Tại phường' });
window.MWKDataStore.saveDeploymentCbtk(tpItem.deploymentId, { cbtkId: 'BS. Lê Hoàng Cường', cbtkName: 'BS. Lê Hoàng Cường' });
window.MWKDataStore.transferDeploymentToCoordination(tpItem.deploymentId);
const listTpTransferred = getFilteredDieuPhoiList();
assert(listTpTransferred.some(d => d.deploymentId === tpItem.deploymentId), 'Tại phường THIẾU nhân sự -> PHẢI xuất hiện trong Điều phối');

// ----------------------------------------------------
// TEST 7: CONFLICT CHECK
// ----------------------------------------------------
console.log('\n--- TEST 7: Conflict Check ---');
const conflictRes = window.MWKDataStore.checkPersonnelScheduleConflict({
    personId: 'BS. Nguyễn Văn An',
    scheduleId: 'DP999',
    examDate: tvItem.ngayThucHien,
    startTime: '07:30',
    endTime: '11:30'
});
assert(conflictRes.hasConflict === true, 'Phát hiện cảnh báo trùng lịch nhân sự khi bị phân công giao thoa khung giờ');

// ----------------------------------------------------
// TEST 8: PERSISTENCE & ORIGINAL SCHEDULE STATUS INTEGRITY
// ----------------------------------------------------
console.log('\n--- TEST 8: Persistence & Original Status Integrity ---');
const finalAllApproved = window.MWKDataStore.getApprovedKskSchedules();
assert(finalAllApproved.every(s => s.status === 'DA_DUYET' || s.status === 'DA_DUYET_TONG_HOP'), 'Trạng thái lịch KSK gốc bảo toàn 100% DA_DUYET');

console.log(`\n========================================`);
console.log(`SUMMARY: ${passed}/${total} DIEU PHOI SUITE TESTS PASSED CLEANLY.`);
console.log(`========================================`);
