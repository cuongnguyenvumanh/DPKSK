/**
 * MODULE: THIẾT LẬP CBTK (DEPLOYMENT LAYER REAL DATA)
 */
document.addEventListener('DOMContentLoaded', function () {
    let deployments = [];
    let nhanSuMasterList = [];

    function init() {
        if (!window.MWKDataStore) return;
        nhanSuMasterList = MWKDataStore.getNhanSuMasterData();
        deployments = MWKDataStore.getDeployments();
        populateCbtkSelect();
        populateDeploymentSelect();
    }

    function populateCbtkSelect() {
        const select = document.getElementById('page-cbtk-select');
        select.innerHTML = '<option value="">-- Chọn cán bộ từ dữ liệu thực tế --</option>';

        nhanSuMasterList.forEach(st => {
            const opt = document.createElement('option');
            opt.value = st.name;
            opt.setAttribute('data-name', st.name);
            opt.setAttribute('data-phone', st.phone || '0912345678');
            opt.setAttribute('data-title', `${st.staffType} - ${st.position}`);
            opt.text = `${st.name} (${st.staffType} - ${st.position})`;
            select.appendChild(opt);
        });
    }

    function populateDeploymentSelect() {
        const select = document.getElementById('select-schedule-page');
        select.innerHTML = '';

        if (deployments.length === 0) {
            select.innerHTML = '<option value="">-- Không có Đoàn triển khai đã duyệt --</option>';
            return;
        }

        deployments.forEach(item => {
            const opt = document.createElement('option');
            opt.value = item.deploymentId;
            const unitNames = item.schedules.map(s => s.unitName).join(', ');
            opt.text = `${item.deploymentId} - ${unitNames} (${item.ngayThucHien})`;
            select.appendChild(opt);
        });

        const urlParams = new URLSearchParams(window.location.search);
        const paramId = urlParams.get('deploymentId') || urlParams.get('scheduleId');
        if (paramId && deployments.some(d => d.deploymentId === paramId)) {
            select.value = paramId;
        }

        loadSelectedDeployment();
    }

    function loadSelectedDeployment() {
        const depId = document.getElementById('select-schedule-page').value;
        const item = deployments.find(d => d.deploymentId === depId);

        if (!item) return;

        document.getElementById('lbl-schedule-id').innerText = item.deploymentId;
        document.getElementById('lbl-unit-name').innerText = item.schedules.map(s => s.unitName).join('; ');
        document.getElementById('lbl-loai-lich').innerText = item.loaiHinh;
        document.getElementById('lbl-exam-date').innerText = item.ngayThucHien;
        document.getElementById('lbl-session').innerText = item.buoi;
        document.getElementById('lbl-location').innerText = `${item.coSoKham} - ${item.viTriKham}`;
        document.getElementById('lbl-quantity').innerText = `${item.totalPax} khách (${item.schedules.length} lịch thành phần)`;

        const cbtk = item.cbtk || {};
        const cbtkSelect = document.getElementById('page-cbtk-select');
        cbtkSelect.value = cbtk.cbtkName || cbtk.cbtkId || '';
        document.getElementById('page-cbtk-phone').value = cbtk.cbtkPhone || '';
        document.getElementById('page-cbtk-title').value = cbtk.cbtkTitle || '';
        document.getElementById('page-cbtk-date').value = cbtk.cbtkAssignDate || item.ngayThucHien;
        document.getElementById('page-cbtk-note').value = cbtk.cbtkNote || '';

        checkConflict();
    }

    document.getElementById('select-schedule-page').addEventListener('change', loadSelectedDeployment);

    document.getElementById('page-cbtk-select').addEventListener('change', function () {
        const opt = this.options[this.selectedIndex];
        if (opt && opt.value) {
            document.getElementById('page-cbtk-phone').value = opt.getAttribute('data-phone') || '';
            document.getElementById('page-cbtk-title').value = opt.getAttribute('data-title') || '';
        }
        checkConflict();
    });

    function checkConflict() {
        const depId = document.getElementById('select-schedule-page').value;
        const personId = document.getElementById('page-cbtk-select').value;
        const item = deployments.find(d => d.deploymentId === depId);
        const alertBox = document.getElementById('page-cbtk-conflict-alert');

        if (!personId || !item) {
            alertBox.classList.add('hidden');
            return;
        }

        const res = MWKDataStore.checkPersonnelScheduleConflict({
            personId: personId,
            scheduleId: depId,
            examDate: item.ngayThucHien,
            startTime: '07:30',
            endTime: '17:00'
        });

        if (res.hasConflict) {
            const first = res.conflicts[0];
            document.getElementById('page-cbtk-conflict-desc').innerHTML = `
                ⚠ <strong>${first.role}</strong> đã được phân công tại đợt <strong>${first.unitName}</strong> (${first.scheduleId}) ngày <strong>${first.date}</strong> từ ${first.startTime} đến ${first.endTime} tại ${first.location}.
            `;
            alertBox.classList.remove('hidden');
        } else {
            alertBox.classList.add('hidden');
        }
    }

    document.getElementById('form-cbtk-page').addEventListener('submit', function (e) {
        e.preventDefault();
        const depId = document.getElementById('select-schedule-page').value;
        const cbtkSelect = document.getElementById('page-cbtk-select');
        const personId = cbtkSelect.value;
        const opt = cbtkSelect.options[cbtkSelect.selectedIndex];

        if (!personId) {
            if (window.showToast) window.showToast('Vui lòng chọn CBTK!', 'error');
            return;
        }

        const cbtkData = {
            cbtkId: personId,
            cbtkName: opt ? opt.getAttribute('data-name') : personId,
            cbtkPhone: document.getElementById('page-cbtk-phone').value.trim(),
            cbtkTitle: document.getElementById('page-cbtk-title').value.trim(),
            cbtkAssignDate: document.getElementById('page-cbtk-date').value,
            cbtkNote: document.getElementById('page-cbtk-note').value.trim()
        };

        const success = MWKDataStore.saveDeploymentCbtk(depId, cbtkData);
        if (success) {
            if (window.showToast) window.showToast('Đã lưu phân công CBTK cho Đoàn triển khai thành công!');
            setTimeout(() => {
                window.location.href = '../danh-sach-can-thiet-lap/index.html';
            }, 600);
        } else {
            if (window.showToast) window.showToast('Không thể lưu CBTK!', 'error');
        }
    });

    init();
});
