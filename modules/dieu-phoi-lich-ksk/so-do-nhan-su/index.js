/**
 * MODULE: XÂY DỰNG SƠ ĐỒ KHÁM & NHÂN SỰ (DEPLOYMENT LAYER REAL DATA)
 */
document.addEventListener('DOMContentLoaded', function () {
    let deployments = [];

    function init() {
        if (!window.MWKDataStore) return;
        deployments = MWKDataStore.getDeployments();
        populateSelect();
    }

    function populateSelect() {
        const select = document.getElementById('select-diagram-schedule');
        select.innerHTML = '';

        if (deployments.length === 0) {
            select.innerHTML = '<option value="">-- Không có Đoàn triển khai đã duyệt --</option>';
            return;
        }

        deployments.forEach(item => {
            const opt = document.createElement('option');
            opt.value = item.deploymentId;
            const unitNames = item.schedules.map(s => s.unitName).join(', ');
            opt.text = `${item.deploymentId} - ${unitNames} (${item.loaiHinh} - ${item.ngayThucHien})`;
            select.appendChild(opt);
        });

        const urlParams = new URLSearchParams(window.location.search);
        const paramId = urlParams.get('deploymentId') || urlParams.get('scheduleId');
        if (paramId && deployments.some(d => d.deploymentId === paramId)) {
            select.value = paramId;
        }

        renderDiagramForm();
    }

    function renderDiagramForm() {
        const depId = document.getElementById('select-diagram-schedule').value;
        const item = deployments.find(d => d.deploymentId === depId);

        if (!item) return;

        document.getElementById('badge-loai-lich').innerText = item.loaiHinh || 'Tại viện';
        document.getElementById('lbl-diagram-date').innerText = item.ngayThucHien;

        const notAppAlert = document.getElementById('alert-ngoai-vien');
        const tableArea = document.getElementById('diagram-table-area');

        if (item.loaiHinh === 'Ngoại viện') {
            notAppAlert.classList.remove('hidden');
            tableArea.classList.add('hidden');
            return;
        }

        notAppAlert.classList.add('hidden');
        tableArea.classList.remove('hidden');

        const tbody = document.getElementById('tbody-diagram');
        tbody.innerHTML = '';

        const diagramList = item.diagram || [];
        const staffList = item.coordinationStaff || [];

        diagramList.forEach((row, idx) => {
            // Calculate assigned staff count matching this specialty
            const assignedCountBS = staffList.filter(st => {
                const p = (st.position || '').toLowerCase();
                const spec = (st.specialty || '').toLowerCase();
                return (p.includes('bác sĩ') || p.includes('bs')) && (spec.includes(row.specialty.toLowerCase()) || row.specialty.toLowerCase().includes(spec));
            }).length;

            const assignedCountDD = staffList.filter(st => {
                const p = (st.position || '').toLowerCase();
                return (p.includes('điều dưỡng') || p.includes('đd') || p.includes('kỹ thuật') || p.includes('ktv')) && (p.includes(row.specialty.toLowerCase()) || row.specialty.toLowerCase().includes(p));
            }).length;

            const diffBS = assignedCountBS - row.pakdBS;
            const diffDD = assignedCountDD - row.pakdDD;

            let statusBadge = `<span class="badge-emerald px-2 py-0.5 rounded text-[11px] font-semibold">Đủ</span>`;
            if (diffBS < 0 || diffDD < 0) {
                statusBadge = `<span class="badge-red px-2 py-0.5 rounded text-[11px] font-semibold">Thiếu</span>`;
            } else if (diffBS > 0 || diffDD > 0) {
                statusBadge = `<span class="badge-blue px-2 py-0.5 rounded text-[11px] font-semibold">Vượt</span>`;
            }

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="p-3 border font-semibold text-slate-800">${row.floor} - ${row.locationName}</td>
                <td class="p-3 border font-semibold text-[#27496D]">${row.specialty}</td>
                <td class="p-3 border text-center font-bold text-slate-800">${row.needBS} BS / ${row.needDD} ĐD</td>
                <td class="p-2 border text-center">
                    <input type="number" min="0" data-idx="${idx}" class="input-pakd-bs sys-input text-xs w-14 text-center font-bold" value="${row.pakdBS}"> BS
                    <input type="number" min="0" data-idx="${idx}" class="input-pakd-dd sys-input text-xs w-14 text-center font-bold ml-1" value="${row.pakdDD}"> ĐD
                </td>
                <td class="p-3 border text-center font-bold text-slate-800">${assignedCountBS} BS / ${assignedCountDD} ĐD</td>
                <td class="p-3 border text-center font-bold">${diffBS >= 0 ? `+${diffBS}` : diffBS} BS / ${diffDD >= 0 ? `+${diffDD}` : diffDD} ĐD</td>
                <td class="p-3 border text-center">${statusBadge}</td>
                <td class="p-3 border text-slate-600 text-[11px] font-medium">${row.equipmentNeed || '---'}</td>
            `;
            tbody.appendChild(tr);
        });
    }

    document.getElementById('select-diagram-schedule').addEventListener('change', renderDiagramForm);

    document.getElementById('btn-save-diagram-page').addEventListener('click', function () {
        const depId = document.getElementById('select-diagram-schedule').value;
        const item = deployments.find(d => d.deploymentId === depId);

        if (item && item.loaiHinh === 'Ngoại viện') return;

        const diagramList = [...(item.diagram || [])];
        document.querySelectorAll('.input-pakd-bs').forEach(inp => {
            const idx = parseInt(inp.getAttribute('data-idx'), 10);
            if (diagramList[idx]) diagramList[idx].pakdBS = parseInt(inp.value, 10) || 0;
        });
        document.querySelectorAll('.input-pakd-dd').forEach(inp => {
            const idx = parseInt(inp.getAttribute('data-idx'), 10);
            if (diagramList[idx]) diagramList[idx].pakdDD = parseInt(inp.value, 10) || 0;
        });

        const success = MWKDataStore.saveDeploymentDiagram(depId, diagramList);
        if (success) {
            if (window.showToast) window.showToast('Đã lưu Sơ đồ khám cho Đoàn triển khai thành công!');
            setTimeout(() => {
                window.location.href = '../danh-sach-can-thiet-lap/index.html';
            }, 600);
        } else {
            if (window.showToast) window.showToast('Không thể lưu sơ đồ!', 'error');
        }
    });

    init();
});
