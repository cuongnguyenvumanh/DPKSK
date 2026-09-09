/**
 * MODULE: ĐIỀU PHỐI LỊCH KSK
 * Phục vụ 2 nguồn đầu vào:
 * 1. NGOẠI VIỆN: Điều phối toàn bộ (Cần gán CBTK -> Thiết lập sơ đồ khám -> Gán CBNV/CTV)
 * 2. TẠI VIỆN / TẠI PHƯỜNG: Bổ sung nhân sự phần còn thiếu (Nhận yêu cầu điều phối bổ sung)
 */
document.addEventListener('DOMContentLoaded', function () {
    let deployments = [];
    let nhanSuMasterList = [];
    let currentMainTab = 'LICH_TUAN'; // 'LICH_TUAN' | 'LICH_PHAT_SINH'
    let currentSubTab = 'ALL'; // 'ALL' | 'CHUA_DIEU_PHOI' | 'DANG_DIEU_PHOI' | 'HOAN_THANH'
    let activeAssignedStaffList = [];

    function init() {
        if (!window.MWKDataStore) return;
        nhanSuMasterList = MWKDataStore.getNhanSuMasterData();
        populateStaffSelect();
        bindTabControls();
        loadAndRenderData();
        checkUrlParamDepId();
    }

    function populateStaffSelect() {
        const select = document.getElementById('staff-select-person');
        if (!select) return;
        select.innerHTML = '<option value="">-- Chọn nhân sự từ hệ thống --</option>';

        nhanSuMasterList.forEach(st => {
            const opt = document.createElement('option');
            opt.value = st.name;
            opt.setAttribute('data-type', st.isCBNV ? 'CBNV' : 'CTV');
            opt.setAttribute('data-pos', st.staffType);
            opt.setAttribute('data-spec', st.specialty || st.position);
            opt.text = `${st.name} (${st.staffType} - ${st.specialty || st.position}) [${st.isCBNV ? 'CBNV' : 'CTV'}]`;
            select.appendChild(opt);
        });
    }

    function checkUrlParamDepId() {
        const urlParams = new URLSearchParams(window.location.search);
        const depId = urlParams.get('depId');
        if (depId) {
            setTimeout(() => {
                const target = deployments.find(d => d.deploymentId === depId);
                if (target) {
                    openAssignStaffModal(target.deploymentId);
                }
            }, 300);
        }
    }

    function loadAndRenderData() {
        const rawDeployments = MWKDataStore.getDeployments();

        // Filter deployments that belong in "Điều phối lịch KSK":
        // 1. NGOẠI VIỆN (sau khi đã gán CBTK)
        // 2. TẠI VIỆN / TẠI PHƯỜNG (khi được chuyển điều phối / thiếu nhân sự / đã gán nhân sự điều phối)
        deployments = rawDeployments.filter(d => {
            const hasCbtk = d.cbtk && (d.cbtk.cbtkId || d.cbtk.cbtkName);
            if (d.loaiHinh === 'Ngoại viện') {
                return hasCbtk;
            } else {
                return d.isTransferred || d.thietLapStatus === 'THIEU_NHAN_SU' || d.thietLapStatus === 'CHO_DIEU_PHOI' || (d.coordinationStaff && d.coordinationStaff.length > 0);
            }
        });

        updateTabBadges();
        renderDeploymentsList();
    }

    function bindTabControls() {
        const btnTuan = document.getElementById('tab-btn-tuan');
        const btnPhatSinh = document.getElementById('tab-btn-phat-sinh');

        btnTuan?.addEventListener('click', function () {
            currentMainTab = 'LICH_TUAN';
            btnTuan.className = 'tab-btn-active px-6 py-3 text-xs font-semibold flex items-center gap-2 border-r border-[#D9DEE5] focus:outline-none';
            if (btnPhatSinh) btnPhatSinh.className = 'px-6 py-3 text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-2 focus:outline-none';
            renderDeploymentsList();
        });

        btnPhatSinh?.addEventListener('click', function () {
            currentMainTab = 'LICH_PHAT_SINH';
            btnPhatSinh.className = 'tab-btn-active px-6 py-3 text-xs font-semibold flex items-center gap-2 border-r border-[#D9DEE5] focus:outline-none';
            if (btnTuan) btnTuan.className = 'px-6 py-3 text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-2 border-r border-[#D9DEE5] focus:outline-none';
            renderDeploymentsList();
        });

        const subtabs = [
            { id: 'subtab-all', val: 'ALL' },
            { id: 'subtab-chua-dieu-phoi', val: 'CHUA_DIEU_PHOI' },
            { id: 'subtab-dang-dieu-phoi', val: 'DANG_DIEU_PHOI' },
            { id: 'subtab-hoan-thanh', val: 'HOAN_THANH' }
        ];

        subtabs.forEach(st => {
            const btn = document.getElementById(st.id);
            if (btn) {
                btn.addEventListener('click', function () {
                    currentSubTab = st.val;
                    subtabs.forEach(item => {
                        const b = document.getElementById(item.id);
                        if (b) {
                            if (item.val === currentSubTab) {
                                b.className = 'subtab-btn-active px-3 py-1.5 rounded text-xs font-medium border border-slate-300';
                            } else {
                                b.className = 'px-3 py-1.5 rounded text-xs font-medium bg-white text-slate-700 border border-slate-300 hover:bg-slate-100';
                            }
                        }
                    });
                    renderDeploymentsList();
                });
            }
        });

        document.getElementById('search-dieu-phoi')?.addEventListener('input', renderDeploymentsList);
        document.getElementById('btn-refresh-dieu-phoi')?.addEventListener('click', loadAndRenderData);
    }

    function updateTabBadges() {
        let tuanCount = 0;
        let phatSinhCount = 0;

        deployments.forEach(item => {
            if (item.scheduleType === 'LICH_PHAT_SINH') phatSinhCount++;
            else tuanCount++;
        });

        const bTuan = document.getElementById('badge-count-tuan');
        const bPhatSinh = document.getElementById('badge-count-phat-sinh');

        if (bTuan) bTuan.innerText = tuanCount;
        if (bPhatSinh) bPhatSinh.innerText = phatSinhCount;
    }

    function getFilteredDeployments() {
        const keyword = document.getElementById('search-dieu-phoi')?.value.trim().toLowerCase();

        return deployments.filter(item => {
            if (currentMainTab === 'LICH_PHAT_SINH' && item.scheduleType !== 'LICH_PHAT_SINH') return false;
            if (currentMainTab === 'LICH_TUAN' && item.scheduleType === 'LICH_PHAT_SINH') return false;

            const status = item.dieuPhoiStatus || 'CHUA_DIEU_PHOI';
            if (currentSubTab !== 'ALL' && status !== currentSubTab) {
                return false;
            }

            if (keyword) {
                const matchId = (item.deploymentId || '').toLowerCase().includes(keyword);
                const matchFac = (item.coSoKham || '').toLowerCase().includes(keyword);
                const matchLoc = (item.viTriKham || '').toLowerCase().includes(keyword);
                const matchDate = (item.ngayThucHien || '').toLowerCase().includes(keyword);
                const matchSchs = item.schedules.some(s => (s.unitName || s.customerName || '').toLowerCase().includes(keyword) || (s.scheduleId || '').toLowerCase().includes(keyword));
                if (!matchId && !matchFac && !matchLoc && !matchDate && !matchSchs) return false;
            }

            return true;
        });
    }

    function renderDeploymentsList() {
        const container = document.getElementById('dieu-phoi-list-container');
        if (!container) return;

        const list = getFilteredDeployments();

        let cntAll = 0, cntChua = 0, cntDang = 0, cntHoanThanh = 0;
        deployments.forEach(item => {
            if ((currentMainTab === 'LICH_PHAT_SINH' && item.scheduleType === 'LICH_PHAT_SINH') || (currentMainTab === 'LICH_TUAN' && item.scheduleType !== 'LICH_PHAT_SINH')) {
                cntAll++;
                const status = item.dieuPhoiStatus || 'CHUA_DIEU_PHOI';
                if (status === 'CHUA_DIEU_PHOI') cntChua++;
                else if (status === 'DANG_DIEU_PHOI') cntDang++;
                else if (status === 'HOAN_THANH') cntHoanThanh++;
            }
        });

        const subAll = document.getElementById('cnt-sub-all');
        const subChua = document.getElementById('cnt-sub-chua');
        const subDang = document.getElementById('cnt-sub-dang');
        const subHT = document.getElementById('cnt-sub-hoan-thanh');

        if (subAll) subAll.innerText = cntAll;
        if (subChua) subChua.innerText = cntChua;
        if (subDang) subDang.innerText = cntDang;
        if (subHT) subHT.innerText = cntHoanThanh;

        container.innerHTML = '';

        if (list.length === 0) {
            container.innerHTML = `
                <div class="p-12 text-center text-slate-400 bg-white rounded border border-[#D9DEE5]">
                    <i class="fa-solid fa-folder-open text-4xl mb-3 block text-slate-300"></i>
                    <p class="font-medium text-slate-600">Không có Vị trí triển khai KSK nào thỏa mãn điều kiện lọc.</p>
                </div>
            `;
            return;
        }

        // Group Location Context items by Facility (coSoKham)
        const facilityMap = {};
        list.forEach(item => {
            const facName = item.coSoKham || 'Cơ sở khám MEDLATEC';
            if (!facilityMap[facName]) {
                facilityMap[facName] = {
                    facilityName: facName,
                    contexts: [],
                    totalSchedules: 0,
                    totalPax: 0
                };
            }
            facilityMap[facName].contexts.push(item);
            facilityMap[facName].totalSchedules += (item.schedules || []).length;
            facilityMap[facName].totalPax += (item.totalPax || 0);
        });

        // Render LEVEL 1: Facility Group Block
        Object.values(facilityMap).forEach(facObj => {
            const facCard = document.createElement('div');
            facCard.className = 'facility-group-card bg-white rounded border border-[#D9DEE5] shadow-xs overflow-hidden mb-5 space-y-0';

            // Facility Header Bar
            const facHeaderHtml = `
                <div class="bg-[#1E3A8A] text-white p-3.5 flex flex-wrap items-center justify-between gap-3">
                    <div class="flex items-center gap-2">
                        <i class="fa-solid fa-hospital text-amber-400 text-base"></i>
                        <h2 class="text-sm font-bold tracking-wide uppercase">📍 ${facObj.facilityName}</h2>
                    </div>
                    <div class="flex items-center gap-3 text-xs">
                        <span class="bg-blue-900/60 text-blue-100 px-2.5 py-1 rounded border border-blue-700/50">
                            <i class="fa-solid fa-layer-group text-blue-300"></i> ${facObj.contexts.length} vị trí triển khai
                        </span>
                        <span class="bg-blue-900/60 text-blue-100 px-2.5 py-1 rounded border border-blue-700/50">
                            <i class="fa-solid fa-building-user text-blue-300"></i> ${facObj.totalSchedules} lịch đơn vị
                        </span>
                        <span class="bg-blue-900/60 text-amber-300 px-2.5 py-1 rounded border border-blue-700/50 font-bold">
                            <i class="fa-solid fa-users text-amber-300"></i> ${facObj.totalPax} pax
                        </span>
                    </div>
                </div>
            `;

            let contextsContainerHtml = `<div class="p-4 space-y-4 bg-slate-50/40 divide-y divide-slate-200">`;

            // Render LEVEL 2: Location Context Cards
            facObj.contexts.forEach(item => {
                const cbtk = item.cbtk || {};
                const diagram = item.diagram || [];
                const staffList = item.coordinationStaff || [];
                const status = item.dieuPhoiStatus || 'CHUA_DIEU_PHOI';
                const isNgoaiVien = item.loaiHinh === 'Ngoại viện';

                let sourceBadgeHtml = '';
                if (isNgoaiVien) {
                    sourceBadgeHtml = `<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200"><i class="fa-solid fa-truck-medical"></i> Ngoại viện</span>`;
                } else {
                    sourceBadgeHtml = `<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200"><i class="fa-solid fa-user-plus"></i> Bổ sung nhân sự (${item.loaiHinh})</span>`;
                }

                let statusBadge = `<span class="badge-red px-2 py-0.5 rounded text-[11px] font-semibold"><i class="fa-solid fa-clock"></i> Chưa điều phối</span>`;
                if (status === 'DANG_DIEU_PHOI') {
                    statusBadge = `<span class="badge-amber px-2 py-0.5 rounded text-[11px] font-semibold"><i class="fa-solid fa-user-clock"></i> Đang điều phối</span>`;
                } else if (status === 'HOAN_THANH') {
                    statusBadge = `<span class="badge-emerald px-2 py-0.5 rounded text-[11px] font-semibold"><i class="fa-solid fa-circle-check"></i> Hoàn thành</span>`;
                }

                // Calculate Need vs Assigned vs Missing
                let totalNeed = 0;
                diagram.forEach(d => {
                    totalNeed += (d.needBS || 0) + (d.needDD || 0);
                });
                if (totalNeed === 0 && !isNgoaiVien) totalNeed = Math.ceil(item.totalPax / 30);

                const assignedTotal = staffList.length;
                const missingTotal = Math.max(0, totalNeed - assignedTotal);

                // Missing Breakdown Pills for Tại viện / Tại phường requests
                let missingBreakdownHtml = '';
                if (!isNgoaiVien && diagram.length > 0) {
                    const missingItems = [];
                    diagram.forEach(d => {
                        const assignedBSInSpec = staffList.filter(s => (s.specialty || '').toLowerCase().includes(d.specialty.toLowerCase()) && (s.position || '').toLowerCase().includes('bác sĩ')).length;
                        const assignedDDInSpec = staffList.filter(s => (s.specialty || '').toLowerCase().includes(d.specialty.toLowerCase()) && !(s.position || '').toLowerCase().includes('bác sĩ')).length;

                        if (d.needBS > assignedBSInSpec) {
                            missingItems.push(`<span class="px-2 py-0.5 rounded bg-red-50 text-red-700 border border-red-200 text-[10px] font-semibold">${d.specialty}: Thiếu ${d.needBS - assignedBSInSpec} Bác sĩ</span>`);
                        }
                        if (d.needDD > assignedDDInSpec) {
                            missingItems.push(`<span class="px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-semibold">${d.specialty}: Thiếu ${d.needDD - assignedDDInSpec} Điều dưỡng</span>`);
                        }
                    });
                    if (missingItems.length > 0) {
                        missingBreakdownHtml = `<div class="flex flex-wrap gap-1.5 pt-1">${missingItems.join('')}</div>`;
                    }
                }

                // Render LEVEL 3: Child Unit Schedules Table
                let childRowsHtml = '';
                (item.schedules || []).forEach((sch, idx) => {
                    childRowsHtml += `
                        <tr class="hover:bg-slate-50 text-xs">
                            <td class="p-2 border border-slate-200 text-center font-medium text-slate-500">${idx + 1}</td>
                            <td class="p-2 border border-slate-200 font-bold text-[#27496D]">${sch.scheduleId}</td>
                            <td class="p-2 border border-slate-200 font-semibold text-slate-800">${sch.unitName || sch.customerName}</td>
                            <td class="p-2 border border-slate-200 text-center">
                                <span class="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200">${sch.loaiHinh || item.loaiHinh || 'Tại viện'}</span>
                            </td>
                            <td class="p-2 border border-slate-200 text-center font-bold text-slate-800">${sch.quantity || sch.soLuongKhach || 0} pax</td>
                            <td class="p-2 border border-slate-200 text-slate-600">${sch.salesStaff || sch.nguoiPhuTrach || 'Kinh doanh'}</td>
                        </tr>
                    `;
                });

                const assignedStaffNamesHtml = staffList.map(st => `<span class="px-1.5 py-0.5 bg-emerald-50 text-emerald-800 rounded border border-emerald-200 text-[10px] font-medium mr-1 inline-block"><i class="fa-solid fa-user-check"></i> ${st.name} (${st.position})</span>`).join('');

                contextsContainerHtml += `
                    <div class="location-context-card bg-white rounded border border-slate-200 p-4 space-y-3 shadow-2xs pt-4 first:pt-0">
                        <!-- Location Context Header -->
                        <div class="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-200 pb-3 gap-2">
                            <div class="space-y-1">
                                <div class="flex flex-wrap items-center gap-2">
                                    <span class="font-bold text-sm text-[#27496D] flex items-center gap-1.5">
                                        <i class="fa-solid fa-location-dot text-red-500"></i>
                                        📌 ${item.viTriKham || 'Vị trí triển khai'}
                                    </span>
                                    <span class="text-xs bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded border border-slate-200 font-medium">
                                        <i class="fa-solid fa-clock text-slate-500"></i> ${item.buoi || 'Sáng (07:30 - 11:30)'}
                                    </span>
                                    <span class="text-xs font-semibold text-slate-700">
                                        <i class="fa-solid fa-calendar-day text-slate-400"></i> ${item.ngayThucHien}
                                    </span>
                                    ${sourceBadgeHtml}
                                    ${statusBadge}
                                </div>
                                <div class="text-xs text-slate-500 flex flex-wrap items-center gap-3">
                                    <span>Mã Vị trí: <strong class="text-slate-800">${item.deploymentId}</strong></span>
                                    <span>CBTK / Trưởng đoàn: <strong class="text-[#27496D]">${cbtk.cbtkName || cbtk.name || '-- Chưa gán --'}</strong></span>
                                </div>
                            </div>
                            
                            <div class="flex items-center gap-2 flex-shrink-0">
                                ${isNgoaiVien ? `
                                    <button type="button" class="btn-nv-diagram btn-secondary sys-control-h36 text-xs px-3 bg-purple-50 text-purple-800 border-purple-300 hover:bg-purple-100 flex items-center gap-1.5" data-id="${item.deploymentId}">
                                        <i class="fa-solid fa-sitemap text-purple-600"></i> Thiết lập Sơ đồ
                                    </button>
                                ` : ''}
                                <button type="button" class="btn-assign-staff btn-primary sys-control-h36 text-xs px-3 bg-[#27496D] text-white hover:bg-[#1E3A8A] flex items-center gap-1.5" data-id="${item.deploymentId}">
                                    <i class="fa-solid fa-user-gear"></i> ${isNgoaiVien ? 'Điều phối nhân sự' : 'Gán bổ sung nhân sự'}
                                </button>
                            </div>
                        </div>

                        <!-- LEVEL 3: Child Unit Schedules Table -->
                        <div class="space-y-1.5">
                            <div class="flex items-center justify-between text-xs">
                                <span class="font-bold text-slate-700 flex items-center gap-1.5">
                                    <i class="fa-solid fa-list-check text-blue-600"></i>
                                    Danh sách Lịch Đơn vị Thành phần (${(item.schedules || []).length} đơn vị | ${item.totalPax} khách)
                                </span>
                            </div>
                            <table class="w-full text-left border-collapse border border-slate-200 text-xs">
                                <thead>
                                    <tr class="bg-slate-100 text-slate-700 font-semibold uppercase text-[10px]">
                                        <th class="p-2 border border-slate-200 w-10 text-center">STT</th>
                                        <th class="p-2 border border-slate-200 w-24">Mã lịch</th>
                                        <th class="p-2 border border-slate-200">Tên Đơn vị KSK (Khách hàng)</th>
                                        <th class="p-2 border border-slate-200 w-24 text-center">Loại lịch</th>
                                        <th class="p-2 border border-slate-200 w-24 text-center">SL Khách</th>
                                        <th class="p-2 border border-slate-200">CB phụ trách</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-slate-200 bg-white">
                                    ${childRowsHtml}
                                </tbody>
                            </table>
                        </div>

                        <!-- LEVEL 4: Staffing Quota & Missing Breakdown -->
                        <div class="bg-slate-50 border border-slate-200 p-3 rounded space-y-2 text-xs">
                            <div class="flex flex-wrap items-center justify-between gap-2">
                                <div class="font-semibold text-slate-700 flex items-center gap-1.5">
                                    <i class="fa-solid fa-users-gear text-slate-500"></i>
                                    Nhu cầu Nhân sự Vị trí: 
                                    <span class="font-bold text-slate-900">${assignedTotal} / ${totalNeed} người</span>
                                    ${missingTotal > 0 ? `<span class="text-red-600 font-bold">(Còn thiếu ${missingTotal} người)</span>` : `<span class="text-emerald-600 font-bold">(Đã đủ nhân sự)</span>`}
                                </div>
                                ${missingBreakdownHtml}
                            </div>
                            ${assignedStaffNamesHtml ? `
                                <div class="text-[11px] text-slate-600 border-t border-slate-200 pt-1.5 mt-1">
                                    <span class="font-semibold text-slate-700">Nhân sự đã phân công:</span> ${assignedStaffNamesHtml}
                                </div>
                            ` : ''}
                        </div>
                    </div>
                `;
            });

            contextsContainerHtml += `</div>`;
            facCard.innerHTML = facHeaderHtml + contextsContainerHtml;
            container.appendChild(facCard);
        });

        // Event Listener Bindings
        document.querySelectorAll('.btn-nv-diagram').forEach(btn => {
            btn.addEventListener('click', function () {
                openNgoaiVienDiagramModal(this.getAttribute('data-id'));
            });
        });

        document.querySelectorAll('.btn-assign-staff').forEach(btn => {
            btn.addEventListener('click', function () {
                openAssignStaffModal(this.getAttribute('data-id'));
            });
        });
    }

    // NGOẠI VIỆN Clinical Diagram Drawer Modal Handlers
    const nvDiagramModal = document.getElementById('ngoai-vien-diagram-modal');

    function openNgoaiVienDiagramModal(depId) {
        const item = deployments.find(d => d.deploymentId === depId);
        if (!item || !nvDiagramModal) return;

        document.getElementById('nv-diagram-target-dep-id').value = item.deploymentId;
        document.getElementById('nv-diagram-info-unit').innerText = item.schedules.map(s => s.unitName || s.customerName).join(', ');
        document.getElementById('nv-diagram-info-code').innerText = item.deploymentId;
        document.getElementById('nv-diagram-info-date').innerText = item.ngayThucHien;
        document.getElementById('nv-diagram-info-location').innerText = `${item.coSoKham} - ${item.viTriKham}`;

        const tbody = document.getElementById('nv-diagram-tbody');
        let diagramList = Array.isArray(item.diagram) && item.diagram.length > 0 ? [...item.diagram] : generateDefaultNgoaiVienDiagram(item.totalPax);

        let rowsHtml = '';
        diagramList.forEach((row, idx) => {
            rowsHtml += `
                <tr class="hover:bg-slate-50">
                    <td class="p-2 border font-medium text-slate-700">${row.locationName || row.floor}</td>
                    <td class="p-2 border font-semibold text-[#27496D]">${row.specialty}</td>
                    <td class="p-2 border text-center">
                        <input type="number" min="0" class="input-nv-bs sys-input text-xs w-12 text-center font-bold" data-idx="${idx}" value="${row.needBS}"> BS
                        <input type="number" min="0" class="input-nv-dd sys-input text-xs w-12 text-center font-bold ml-1" data-idx="${idx}" value="${row.needDD}"> ĐD
                    </td>
                    <td class="p-2 border text-slate-600 text-[11px]">${row.equipmentNeed || '---'}</td>
                </tr>
            `;
        });

        tbody.innerHTML = rowsHtml;
        nvDiagramModal.classList.remove('hidden');
    }

    function generateDefaultNgoaiVienDiagram(totalPax) {
        const p = totalPax || 100;
        return [
            { locationName: 'Khu khám 1', specialty: 'Khám Nội tổng quát', needBS: Math.max(1, Math.ceil(p / 80)), needDD: 1, equipmentNeed: 'Ống nghe, Huyết áp kế' },
            { locationName: 'Khu khám 2', specialty: 'Khám Mắt', needBS: 1, needDD: 1, equipmentNeed: 'Bảng thị lực, Đèn soi' },
            { locationName: 'Khu khám 3', specialty: 'Tai Mũi Họng', needBS: 1, needDD: 1, equipmentNeed: 'Bộ dụng cụ TMH' },
            { locationName: 'Khu Lấy mẫu', specialty: 'Lấy máu xét nghiệm', needBS: 0, needDD: Math.max(1, Math.ceil(p / 60)), equipmentNeed: 'Kim lấy máu, Ống nghiệm' }
        ];
    }

    function closeNgoaiVienDiagramModal() {
        if (nvDiagramModal) nvDiagramModal.classList.add('hidden');
    }

    document.getElementById('btn-close-nv-diagram-modal')?.addEventListener('click', closeNgoaiVienDiagramModal);
    document.getElementById('btn-cancel-nv-diagram')?.addEventListener('click', closeNgoaiVienDiagramModal);

    document.getElementById('btn-save-nv-diagram')?.addEventListener('click', function () {
        const depId = document.getElementById('nv-diagram-target-dep-id').value;
        const item = deployments.find(d => d.deploymentId === depId);
        if (!item) return;

        let diagramList = Array.isArray(item.diagram) && item.diagram.length > 0 ? [...item.diagram] : generateDefaultNgoaiVienDiagram(item.totalPax);
        
        document.querySelectorAll('.input-nv-bs').forEach(inp => {
            const idx = parseInt(inp.getAttribute('data-idx'), 10);
            if (diagramList[idx]) diagramList[idx].needBS = parseInt(inp.value, 10) || 0;
        });
        document.querySelectorAll('.input-nv-dd').forEach(inp => {
            const idx = parseInt(inp.getAttribute('data-idx'), 10);
            if (diagramList[idx]) diagramList[idx].needDD = parseInt(inp.value, 10) || 0;
        });

        const success = MWKDataStore.saveDeploymentDiagram(depId, diagramList);
        if (success) {
            if (window.showToast) window.showToast('Đã lưu Sơ đồ khám Ngoại viện thành công!');
            closeNgoaiVienDiagramModal();
            loadAndRenderData();
        }
    });

    // Day Detail & Staff Assignment Drawer Modal
    const assignModal = document.getElementById('assign-staff-modal');
    const staffSelectPerson = document.getElementById('staff-select-person');

    function openAssignStaffModal(depId) {
        const item = deployments.find(d => d.deploymentId === depId);
        if (!item || !assignModal) return;

        document.getElementById('assign-target-schedule-id').value = item.deploymentId;
        document.getElementById('assign-info-unit').innerText = `${item.deploymentId} (${item.schedules.map(s => s.unitName || s.customerName).join(', ')})`;
        document.getElementById('assign-info-code').innerText = `${item.totalPax} khách`;
        document.getElementById('assign-info-date').innerText = item.ngayThucHien;
        document.getElementById('assign-info-time').innerText = item.buoi;
        document.getElementById('assign-info-location').innerText = `${item.coSoKham} - ${item.viTriKham}`;

        const cbtk = item.cbtk || {};
        document.getElementById('assign-info-cbtk').innerText = cbtk.cbtkName || 'Chưa phân công';

        activeAssignedStaffList = Array.isArray(item.coordinationStaff) ? [...item.coordinationStaff] : [];

        renderQuotaSummary(item);
        renderAssignedStaffTable();

        document.getElementById('staff-conflict-alert')?.classList.add('hidden');
        assignModal.classList.remove('hidden');
    }

    function closeAssignStaffModal() {
        if (assignModal) assignModal.classList.add('hidden');
    }

    function renderQuotaSummary(item) {
        const diagram = item.diagram || [];
        const summaryBox = document.getElementById('assign-quota-summary');
        if (!summaryBox) return;

        summaryBox.innerHTML = '';

        if (diagram.length === 0) {
            summaryBox.innerHTML = `<div class="col-span-full p-2 bg-slate-50 text-slate-500 italic text-center">Chưa có sơ đồ định mức chuyên khoa. Vui lòng gán nhân sự trực tiếp.</div>`;
            return;
        }

        diagram.forEach(d => {
            const countBS = activeAssignedStaffList.filter(st => (st.specialty || '').toLowerCase().includes(d.specialty.toLowerCase()) && (st.position || '').toLowerCase().includes('bác sĩ')).length;
            const countDD = activeAssignedStaffList.filter(st => (st.specialty || '').toLowerCase().includes(d.specialty.toLowerCase()) && !(st.position || '').toLowerCase().includes('bác sĩ')).length;

            const div = document.createElement('div');
            div.className = 'p-2 rounded border border-slate-200 bg-slate-50 flex flex-col items-center text-center';
            div.innerHTML = `
                <span class="text-[10px] text-slate-500 font-medium truncate w-full" title="${d.specialty}">${d.specialty}</span>
                <span class="font-bold text-xs text-[#27496D]">Cần: ${d.needBS} BS / ${d.needDD} ĐD</span>
                <span class="text-[10px] ${countBS >= d.needBS && countDD >= d.needDD ? 'text-emerald-700 font-bold' : 'text-red-600'}">Đã gán: ${countBS} BS / ${countDD} ĐD</span>
            `;
            summaryBox.appendChild(div);
        });
    }

    function renderAssignedStaffTable() {
        const tbody = document.getElementById('tbody-assigned-staff');
        if (!tbody) return;

        tbody.innerHTML = '';

        const badge = document.getElementById('cnt-assigned-staff-badge');
        if (badge) badge.innerText = `${activeAssignedStaffList.length} nhân sự`;

        if (activeAssignedStaffList.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="p-4 text-center text-slate-400 italic">Chưa có nhân sự nào được gán cho đợt này.</td>
                </tr>
            `;
            return;
        }

        activeAssignedStaffList.forEach((st, idx) => {
            const tr = document.createElement('tr');
            const typeBadge = st.staffType === 'CTV' ? `<span class="px-1.5 py-0.5 rounded text-[10px] bg-purple-100 text-purple-800 border border-purple-200">CTV</span>` : `<span class="px-1.5 py-0.5 rounded text-[10px] bg-blue-100 text-blue-800 border border-blue-200">CBNV</span>`;

            tr.innerHTML = `
                <td class="p-2 text-center font-medium text-slate-500">${idx + 1}</td>
                <td class="p-2 font-bold text-slate-800">${st.name}</td>
                <td class="p-2 text-center">${typeBadge}</td>
                <td class="p-2 font-medium text-slate-700">${st.position} (${st.specialty || ''})</td>
                <td class="p-2 text-slate-500">${st.note || '---'}</td>
                <td class="p-2 text-center">
                    <button type="button" class="btn-remove-staff text-red-600 hover:text-red-800 text-xs" data-idx="${idx}"><i class="fa-solid fa-trash"></i></button>
                </td>
            `;
            tbody.appendChild(tr);
        });

        document.querySelectorAll('.btn-remove-staff').forEach(btn => {
            btn.addEventListener('click', function () {
                const idx = parseInt(this.getAttribute('data-idx'), 10);
                activeAssignedStaffList.splice(idx, 1);
                renderAssignedStaffTable();

                const depId = document.getElementById('assign-target-schedule-id').value;
                const item = deployments.find(d => d.deploymentId === depId);
                if (item) renderQuotaSummary(item);
            });
        });
    }

    if (staffSelectPerson) {
        staffSelectPerson.addEventListener('change', function () {
            const opt = this.options[this.selectedIndex];
            if (opt && opt.value) {
                const staffType = opt.getAttribute('data-type');
                const pos = opt.getAttribute('data-pos');
                const spec = opt.getAttribute('data-spec');
                if (staffType) document.getElementById('staff-input-type').value = staffType;
                if (pos) {
                    const posSelect = document.getElementById('staff-input-pos');
                    for (let i = 0; i < posSelect.options.length; i++) {
                        if (posSelect.options[i].value.includes(pos) || pos.includes(posSelect.options[i].value)) {
                            posSelect.selectedIndex = i;
                            break;
                        }
                    }
                }
            }
            checkStaffConflict();
        });
    }

    function checkStaffConflict() {
        const depId = document.getElementById('assign-target-schedule-id').value;
        const personName = staffSelectPerson.value;
        const item = deployments.find(d => d.deploymentId === depId);
        const alertBox = document.getElementById('staff-conflict-alert');

        if (!personName || !item || !alertBox) {
            if (alertBox) alertBox.classList.add('hidden');
            return;
        }

        const res = MWKDataStore.checkPersonnelScheduleConflict({
            personId: personName,
            scheduleId: depId,
            examDate: item.ngayThucHien,
            startTime: '07:30',
            endTime: '17:00'
        });

        if (res.hasConflict) {
            const first = res.conflicts[0];
            const descEl = document.getElementById('staff-conflict-desc');
            if (descEl) {
                descEl.innerHTML = `
                    ⚠ <strong>${personName}</strong> (${first.role}) đã có phân công tại đoàn <strong>${first.unitName}</strong> (${first.scheduleId}) ngày <strong>${first.date}</strong> từ ${first.startTime} đến ${first.endTime} tại ${first.location}.
                `;
            }
            alertBox.classList.remove('hidden');
        } else {
            alertBox.classList.add('hidden');
        }
    }

    document.getElementById('form-add-staff')?.addEventListener('submit', function (e) {
        e.preventDefault();
        const personName = staffSelectPerson.value;
        if (!personName) {
            if (window.showToast) window.showToast('Vui lòng chọn nhân sự!', 'error');
            return;
        }

        const selectedOpt = staffSelectPerson.options[staffSelectPerson.selectedIndex];
        const staffType = document.getElementById('staff-input-type').value;
        const position = document.getElementById('staff-input-pos').value;
        const specialty = selectedOpt ? selectedOpt.getAttribute('data-spec') : position;
        const note = document.getElementById('staff-input-note').value.trim();

        activeAssignedStaffList.push({
            staffId: personName,
            name: personName,
            staffType: staffType,
            position: position,
            specialty: specialty,
            note: note
        });

        renderAssignedStaffTable();

        const depId = document.getElementById('assign-target-schedule-id').value;
        const item = deployments.find(d => d.deploymentId === depId);
        if (item) renderQuotaSummary(item);

        staffSelectPerson.value = '';
        document.getElementById('staff-input-note').value = '';
        document.getElementById('staff-conflict-alert')?.classList.add('hidden');

        if (window.showToast) window.showToast(`Đã thêm ${personName} vào danh sách phân công!`);
    });

    document.getElementById('btn-close-assign-modal')?.addEventListener('click', closeAssignStaffModal);
    document.getElementById('btn-close-assign-drawer')?.addEventListener('click', closeAssignStaffModal);

    document.getElementById('btn-save-coordination-staff')?.addEventListener('click', function () {
        const depId = document.getElementById('assign-target-schedule-id').value;
        const success = MWKDataStore.assignDeploymentStaff(depId, activeAssignedStaffList);

        if (success) {
            if (window.showToast) window.showToast('Đã lưu thông tin điều phối thành công!');
            closeAssignStaffModal();
            loadAndRenderData();
        } else {
            if (window.showToast) window.showToast('Không thể lưu thông tin điều phối!', 'error');
        }
    });

    // Excel Export Feature for Coordination Page (Flattened Hierarchy Export)
    document.getElementById('btn-export-dieu-phoi')?.addEventListener('click', function () {
        const filtered = getFilteredDeployments();
        if (filtered.length === 0) {
            if (window.showToast) window.showToast('Không có dữ liệu điều phối để xuất Excel!', 'error');
            return;
        }

        let csvContent = 'data:text/csv;charset=utf-8,\uFEFF';
        csvContent += 'Cơ Sở / Địa Điểm,Ngày Khám,Vị Trí Triển Khai,Buổi / Giờ,Mã Lịch Thành Phần,Tên Đơn Vị KSK (Khách Hàng),Loại Lịch,Số Lượng Khách,CBTK / Trưởng Đoàn,Trạng Thái Điều Phối\n';

        filtered.forEach(item => {
            const facName = item.coSoKham || 'MEDLATEC Ba Đình';
            const locName = item.viTriKham || 'Tầng 6';
            const dateStr = item.ngayThucHien || '';
            const shiftStr = item.buoi || '';
            const cbtkName = (item.cbtk && (item.cbtk.cbtkName || item.cbtk.name)) ? `"${item.cbtk.cbtkName || item.cbtk.name}"` : 'Chưa gán';
            const statusStr = item.dieuPhoiStatus === 'HOAN_THANH' ? 'Hoàn thành' : (item.dieuPhoiStatus === 'DANG_DIEU_PHOI' ? 'Đang điều phối' : 'Chưa điều phối');

            (item.schedules || []).forEach(sch => {
                const row = [
                    `"${facName}"`,
                    `"${dateStr}"`,
                    `"${locName}"`,
                    `"${shiftStr}"`,
                    `"${sch.scheduleId || ''}"`,
                    `"${sch.unitName || sch.customerName || ''}"`,
                    `"${sch.loaiHinh || item.loaiHinh || 'Tại viện'}"`,
                    sch.quantity || sch.soLuongKhach || 0,
                    cbtkName,
                    `"${statusStr}"`
                ];
                csvContent += row.join(',') + '\n';
            });
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        const today = new Date().toISOString().split('T')[0];
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `dieu-phoi-lich-ksk-${today}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        if (window.showToast) window.showToast('Đã xuất file Excel điều phối thành công!');
    });

    init();
});
