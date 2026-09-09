/**
 * VERIFICATION SCRIPT FOR LOCATION CONTEXT UI HIERARCHY
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

console.log('--- STARTING VERIFICATION FOR LOCATION CONTEXT UI HIERARCHY ---');

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

// 1. Get Deployments
const deployments = window.MWKDataStore.getDeployments();
assert(Array.isArray(deployments) && deployments.length > 0, 'MWKDataStore.getDeployments() returns Location Contexts array');

// 2. Verify Multi-schedule Location Context
const multiScheduleLoc = deployments.find(d => d.schedules.length >= 2);
assert(multiScheduleLoc !== undefined, 'Found Location Context containing multiple child unit schedules');

if (multiScheduleLoc) {
    assert(multiScheduleLoc.ngayThucHien !== undefined, `Location Context date present: ${multiScheduleLoc.ngayThucHien}`);
    assert(multiScheduleLoc.coSoKham !== undefined, `Location Context facility present: ${multiScheduleLoc.coSoKham}`);
    assert(multiScheduleLoc.viTriKham !== undefined, `Location Context floor/room present: ${multiScheduleLoc.viTriKham}`);
    assert(multiScheduleLoc.schedules.length >= 2, `Location Context contains ${multiScheduleLoc.schedules.length} child unit schedules`);
}

// 3. Verify Different Location Context Separation
const uniqueLocKeys = new Set(deployments.map(d => d.groupKey));
assert(uniqueLocKeys.size === deployments.length, 'Each Location Context is uniquely identified by Date + Facility + Floor/Shift');

// 4. Verify Diagram Generation for Location Context
deployments.forEach(dep => {
    assert(Array.isArray(dep.diagram) && dep.diagram.length > 0, `Clinical Diagram generated for Location Context ${dep.deploymentId} (${dep.viTriKham}) combining ${dep.schedules.length} schedules`);
});

// 5. Verify No Mock Data
const rawDataStore = require('fs').readFileSync(path.join(__dirname, '../js/data-store.js'), 'utf8');
assert(!rawDataStore.includes('mockDeployments'), 'Zero mockDeployments array in data-store.js');

console.log(`\n========================================`);
console.log(`SUMMARY: ${passed}/${total} LOCATION CONTEXT TESTS PASSED CLEANLY.`);
console.log(`========================================`);
