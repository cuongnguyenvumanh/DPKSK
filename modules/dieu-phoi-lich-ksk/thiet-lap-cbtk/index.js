/**
 * MODULE: THIẾT LẬP CBTK (INDIVIDUAL SCHEDULE LAYER REAL DATA)
 */
document.addEventListener('DOMContentLoaded', function () {
    let approvedSchedules = [];
    let nhanSuMasterList = [];

    function init() {
        if (!window.MWKDataStore) return;
        nhanSuMasterList = MWKDataStore.getNhanSuMasterData();
        approvedSchedules = MWKDataStore.getApprovedKskSchedules();
        populateCbtkSelect();
        populateScheduleSelect();
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

    function populateScheduleSelect() {
        const select = document.getElementById('select-schedule-page');
        select.innerHTML = '';

        if (approvedSchedules.length === 0) {
            select.innerHTML = '<option value="">-- Không có Lịch KSK đã duyệt --</option>';
            return;
        }

        approvedSchedules.forEach(item => {
            const opt = document.createElement('option');
            const schId = item.scheduleId || item.id;
            opt.value = schId;
            const unitName = item.unitName || item.customerName || 'Đơn vị KSK';
            const dateStr = item.examDate || item.tuNgay || '';
            opt.text = `${schId} - ${unitName} (${dateStr})`;
            select.appendChild(opt);
        });

        const urlParams = new URLSearchParams(window.location.search);
        const paramId = urlParams.get('scheduleId') || urlParams.get('deploymentId');
        if (paramId && approvedSchedules.some(s => String(s.scheduleId) === String(paramId) || String(s.id) === String(paramId))) {
            select.value = paramId;
        }

        loadSelectedSchedule();
    }

    function loadSelectedSchedule() {
        const scheduleId = document.getElementById('select-schedule-page').value;
        const item = approvedSchedules.find(s => String(s.scheduleId) === String(scheduleId) || String(s.id) === String(scheduleId));

        if (!item) return;

        const schId = item.scheduleId || item.id;
        document.getElementById('lbl-schedule-id').innerText = schId;
        document.getElementById('lbl-unit-name').innerText = item.unitName || item.customerName || '---';
        document.getElementById('lbl-loai-lich').innerText = item.loaiHinh || item.loaiLich || '---';
        document.getElementById('lbl-exam-date').innerText = item.examDate || item.tuNgay || '---';
        document.getElementById('lbl-session').innerText = item.session || '---';
        document.getElementById('lbl-location').innerText = `${item.facility || 'Ba Đình'} - ${item.diaDiemKham || item.examLocation || ''}`;
        document.getElementById('lbl-quantity').innerText = `${item.quantity || item.soLuongKhach || item.soLuong || 0} khách`;

        const cbtk = item.cbtk || (item.coordination ? item.coordination.cbtk : {}) || {};
        const cbtkSelect = document.getElementById('page-cbtk-select');
        cbtkSelect.value = cbtk.cbtkName || cbtk.cbtkId || '';
        document.getElementById('page-cbtk-phone').value = cbtk.cbtkPhone || '';
        document.getElementById('page-cbtk-title').value = cbtk.cbtkTitle || '';
        document.getElementById('page-cbtk-date').value = cbtk.cbtkAssignDate || item.examDate || item.tuNgay || '';
        document.getElementById('page-cbtk-note').value = cbtk.cbtkNote || '';

        checkConflict();
    }

    document.getElementById('select-schedule-page').addEventListener('change', loadSelectedSchedule);

    document.getElementById('page-cbtk-select').addEventListener('change', function () {
        const opt = this.options[this.selectedIndex];
        if (opt && opt.value) {
            document.getElementById('page-cbtk-phone').value = opt.getAttribute('data-phone') || '';
            document.getElementById('page-cbtk-title').value = opt.getAttribute('data-title') || '';
        }
        checkConflict();
    });

    function checkConflict() {
        const scheduleId = document.getElementById('select-schedule-page').value;
        const personId = document.getElementById('page-cbtk-select').value;
        const item = approvedSchedules.find(s => String(s.scheduleId) === String(scheduleId) || String(s.id) === String(scheduleId));
        const alertBox = document.getElementById('page-cbtk-conflict-alert');

        if (!personId || !item) {
            alertBox.classList.add('hidden');
            return;
        }

        const res = MWKDataStore.checkPersonnelScheduleConflict({
            personId: personId,
            scheduleId: scheduleId,
            examDate: item.examDate || item.tuNgay,
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
        const scheduleId = document.getElementById('select-schedule-page').value;
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

        const success = MWKDataStore.saveScheduleCbtk(scheduleId, cbtkData);
        if (success) {
            if (window.showToast) window.showToast('Đã lưu phân công CBTK cho lịch KSK thành công!');
            setTimeout(() => {
                window.location.href = '../danh-sach-can-thiet-lap/index.html';
            }, 600);
        } else {
            if (window.showToast) window.showToast('Không thể lưu CBTK!', 'error');
        }
    });

    init();
});
