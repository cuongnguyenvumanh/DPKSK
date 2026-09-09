/**
 * VERIFICATION SCRIPT FOR DEPLOYMENT LAYER & REAL DATASTORE MAPPING
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

// Load DataStore
require(path.join(__dirname, '../js/data-store.js'));

console.log('--- STARTING VERIFICATION FOR DEPLOYMENT LAYER (REAL DATASTORE ONLY) ---');

let passedTests = 0;
let totalTests = 0;

function assert(condition, message) {
    totalTests++;
    if (condition) {
        console.log(`[PASS] Test ${totalTests}: ${message}`);
        passedTests++;
    } else {
        console.error(`[FAIL] Test ${totalTests}: ${message}`);
        process.exitCode = 1;
    }
}

// Test 1: Real Personnel List Retrieval
const staffMaster = window.MWKDataStore.getNhanSuMasterData();
assert(Array.isArray(staffMaster) && staffMaster.length > 0, 'MWKDataStore.getNhanSuMasterData() returns real personnel array');
assert(staffMaster.some(s => s.name === 'BS. Nguyễn Văn An'), 'Real doctor BS. Nguyễn Văn An present in staff master data');

// Test 2: Deployment Layer Grouping
const deployments = window.MWKDataStore.getDeployments();
assert(Array.isArray(deployments) && deployments.length > 0, 'MWKDataStore.getDeployments() returns grouped deployments array');
const vinfastDep = deployments.find(d => d.schedules.some(s => s.unitName.includes('VinFast')));
assert(vinfastDep !== undefined, 'Deployment found grouping VinFast approved schedules');
assert(vinfastDep.schedules.length >= 1, `Deployment ${vinfastDep.deploymentId} created for VinFast on ${vinfastDep.ngayThucHien}`);

// Test 3: Deployment CBTK Assignment & Persistence
const targetDepId = vinfastDep.deploymentId;
const sampleCbtk = {
    cbtkId: 'BS. Nguyễn Văn An',
    cbtkName: 'BS. Nguyễn Văn An',
    cbtkPhone: '0912345678',
    cbtkTitle: 'Bác sĩ CKII',
    cbtkAssignDate: '2026-09-08'
};

const cbtkRes = window.MWKDataStore.saveDeploymentCbtk(targetDepId, sampleCbtk);
assert(cbtkRes === true, `saveDeploymentCbtk successfully assigned CBTK to ${targetDepId}`);

const reloadedDep = window.MWKDataStore.getDeployment(targetDepId);
assert(reloadedDep.cbtk && reloadedDep.cbtk.cbtkName === 'BS. Nguyễn Văn An', 'Deployment CBTK persists correctly after reload');

// Test 4: Dynamic Clinical Diagram Generation from Real Categories & Pax
const diagram = reloadedDep.diagram;
assert(Array.isArray(diagram) && diagram.length > 0, 'Clinical Diagram generated automatically from combined schedule categories');
const internalMedRow = diagram.find(d => d.specialty.includes('Nội'));
assert(internalMedRow && internalMedRow.needBS >= 2, `Calculated Internal Medicine doctor need = ${internalMedRow ? internalMedRow.needBS : 0} for ${reloadedDep.totalPax} pax`);

// Test 5: Staff Assignment per Deployment & Persistence
const sampleStaffAssignments = [
    { staffId: 'BS. Nguyễn Văn An', name: 'BS. Nguyễn Văn An', staffType: 'CBNV', position: 'Bác sĩ', specialty: 'Khám Nội tổng quát' },
    { staffId: 'ĐD. Trần Thị Bích', name: 'ĐD. Trần Thị Bích', staffType: 'CBNV', position: 'Điều dưỡng', specialty: 'Lấy máu xét nghiệm' }
];

const assignStaffRes = window.MWKDataStore.assignDeploymentStaff(targetDepId, sampleStaffAssignments);
assert(assignStaffRes === true, `assignDeploymentStaff successfully assigned staff to ${targetDepId}`);

const reloadedDep2 = window.MWKDataStore.getDeployment(targetDepId);
assert(reloadedDep2.coordinationStaff.length === 2, 'Deployment staff assignments persist correctly');
assert(reloadedDep2.dieuPhoiStatus === 'HOAN_THANH', 'Deployment dieuPhoiStatus updated to HOAN_THANH');

// Test 6: Conflict Check Across Deployments
const conflictCheck = window.MWKDataStore.checkPersonnelScheduleConflict({
    personId: 'BS. Nguyễn Văn An',
    scheduleId: 'DP999',
    examDate: reloadedDep.ngayThucHien,
    startTime: '07:30',
    endTime: '11:30'
});
assert(conflictCheck.hasConflict === true, 'Conflict check correctly detects BS. Nguyễn Văn An assigned on same date/time window');

// Test 7: Verify Workflow Status Integrity
const approvedSchs = window.MWKDataStore.getApprovedKskSchedules();
assert(approvedSchs.every(s => s.status === 'DA_DUYET' || s.status === 'DA_DUYET_TONG_HOP'), 'Workflow statuses of underlying schedules remain DA_DUYET (UNCHANGED)');

console.log(`\n========================================`);
console.log(`SUMMARY: ${passedTests}/${totalTests} TESTS PASSED CLEANLY.`);
console.log(`========================================`);
