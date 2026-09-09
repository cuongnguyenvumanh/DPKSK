/**
 * MODULE: DANH SÁCH CẦN THIẾT LẬP CBTK & SƠ ĐỒ
 * Tiếp nhận lịch đã duyệt từ "CB Duyệt lịch KSK", gán CBTK, lập sơ đồ đối với Tại viện / Tại phường, 
 * và chuyển điều phối đối với Ngoại viện hoặc khi thiếu nhân sự.
 */
document.addEventListener('DOMContentLoaded', function () {
    let currentDeployments = [];
    let nhanSuMasterList = [];
    let activeTabType = ''; // '' = Tất cả, 'Tại viện', 'Tại phường', 'Ngoại viện'

    function initData() {
        if (!window.MWKDataStore) {
            console.error('MWKDataStore không tồn tại!');
            return;
        }
        nhanSuMasterList = MWKDataStore.getNhanSuMasterData();
        populateCbtkDropdowns();
        bindTabListeners();
        loadAndRenderDeployments();
    }

    function populateCbtkDropdowns() {
        const select = document.getElementById('cbtk-select-person');
        if (!select) return;
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

    function bindTabListeners() {
        document.querySelectorAll('.tab-type-btn').forEach(btn => {
            btn.addEventListener('click', function () {
                document.querySelectorAll('.tab-type-btn').forEach(b => {
                    b.classList.remove('active-tab', 'border-b-2', 'border-[#27496D]', 'text-[#27496D]', 'bg-white', 'font-bold');
                    b.classList.add('text-slate-600', 'font-medium');
                });

                this.classList.add('active-tab', 'border-b-2', 'border-[#27496D]', 'text-[#27496D]', 'bg-white', 'font-bold');
                this.classList.remove('text-slate-600', 'font-medium');

                activeTabType = this.getAttribute('data-type') || '';
                
                // Sync select dropdown if present
                const filterLoaiLich = document.getElementById('filter-loai-lich');
                if (filterLoaiLich) filterLoaiLich.value = activeTabType;

                renderLocationGroups();
            });
        });
    }

    function loadAndRenderDeployments() {
        currentDeployments = MWKDataStore.getDeployments();
        updateMetrics(currentDeployments);
        updateTabCounts(currentDeployments);
        renderLocationGroups();
    }

    function updateTabCounts(dataList) {
        let countAll = dataList.length;
        let countTaiVien = 0;
        let countTaiPhuong = 0;
        let countNgoaiVien = 0;

        dataList.forEach(item => {
            if (item.loaiHinh === 'Tại viện') countTaiVien++;
            else if (item.loaiHinh === 'Tại phường') countTaiPhuong++;
            else if (item.loaiHinh === 'Ngoại viện') countNgoaiVien++;
        });

        const cAll = document.getElementById('count-tab-all');
        const cTV = document.getElementById('count-tab-tai-vien');
        const cTP = document.getElementById('count-tab-tai-phuong');
        const cNV = document.getElementById('count-tab-ngoai-vien');

        if (cAll) cAll.innerText = countAll;
        if (cTV) cTV.innerText = countTaiVien;
        if (cTP) cTP.innerText = countTaiPhuong;
        if (cNV) cNV.innerText = countNgoaiVien;
    }

    function updateMetrics(dataList) {
        const total = dataList.length;
        let noCbtk = 0;
        let noDiagram = 0;
        let completed = 0;

        dataList.forEach(item => {
            const status = item.thietLapStatus || 'CHUA_GAN_CBTK';
            if (status === 'CHUA_GAN_CBTK') noCbtk++;
            else if (status === 'DA_GAN_CBTK' || status === 'THIEU_NHAN_SU') noDiagram++;
            else if (status === 'HOAN_THANH_DIEU_PHOI') completed++;
        });

        const totalEl = document.getElementById('sum-total-approved');
        const noCbtkEl = document.getElementById('sum-no-cbtk');
        const noDiagramEl = document.getElementById('sum-no-diagram');
        const completedEl = document.getElementById('sum-completed');

        if (totalEl) totalEl.innerText = total;
        if (noCbtkEl) noCbtkEl.innerText = noCbtk;
        if (noDiagramEl) noDiagramEl.innerText = noDiagram;
        if (completedEl) completedEl.innerText = completed;
    }

    function getFilteredDeployments() {
        const dateFrom = document.getElementById('filter-date-from')?.value;
        const dateTo = document.getElementById('filter-date-to')?.value;
        const loaiLichSelect = document.getElementById('filter-loai-lich')?.value;
        const trangThai = document.getElementById('filter-trang-thai')?.value;
        const keyword = document.getElementById('filter-keyword')?.value.trim().toLowerCase();

        const targetType = activeTabType || loaiLichSelect || '';

        return currentDeployments.filter(item => {
            const itemDate = item.ngayThucHien || '';
            if (dateFrom && itemDate < dateFrom) return false;
            if (dateTo && itemDate > dateTo) return false;

            if (targetType && item.loaiHinh !== targetType) return false;

            const itemStatus = item.thietLapStatus || 'CHUA_GAN_CBTK';
            if (trangThai && itemStatus !== trangThai) return false;

            if (keyword) {
                const matchId = (item.deploymentId || '').toLowerCase().includes(keyword);
                const matchFac = (item.coSoKham || '').toLowerCase().includes(keyword);
                const matchLoc = (item.viTriKham || '').toLowerCase().includes(keyword);
                const matchSchs = item.schedules.some(s => 
                    (s.unitName || s.customerName || '').toLowerCase().includes(keyword) || 
                    (s.scheduleId || '').toLowerCase().includes(keyword)
                );
                if (!matchId && !matchFac && !matchLoc && !matchSchs) return false;
            }

            return true;
        });
    }

    function renderLocationGroups() {
        const container = document.getElementById('location-groups-container');
        if (!container) return;

        const filtered = getFilteredDeployments();
        container.innerHTML = '';

        if (filtered.length === 0) {
            container.innerHTML = `
                <div class="bg-white rounded-[4px] border border-[#D9DEE5] p-12 text-center text-slate-400 shadow-2xs">
                    <i class="fa-solid fa-inbox text-4xl mb-3 block text-slate-300"></i>
                    <p class="font-medium text-slate-600">Không tìm thấy Vị trí triển khai KSK nào thỏa mãn điều kiện lọc.</p>
                    <p class="text-xs text-slate-400 mt-1">Thử thay đổi bộ lọc ngày, loại lịch hoặc từ khóa tìm kiếm.</p>
                </div>
            `;
            return;
        }

        // Group Location Context items by Facility (coSoKham)
        const facilityMap = {};
        filtered.forEach(item => {
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
            facObj.contexts.forEach((item, index) => {
                const thietLapStatus = item.thietLapStatus || 'CHUA_GAN_CBTK';
                const cbtk = item.cbtk || {};
                const isNgoaiVien = item.loaiHinh === 'Ngoại viện';

                // Status Badges (6 specific business statuses)
                let statusBadgeHtml = '';
                if (thietLapStatus === 'HOAN_THANH_DIEU_PHOI') {
                    statusBadgeHtml = `<span class="badge-emerald px-2.5 py-1 rounded text-[11px] font-semibold inline-flex items-center gap-1"><i class="fa-solid fa-circle-check"></i> Hoàn thành điều phối</span>`;
                } else if (thietLapStatus === 'CHO_DIEU_PHOI') {
                    statusBadgeHtml = `<span class="px-2.5 py-1 rounded text-[11px] font-semibold bg-purple-100 text-purple-800 border border-purple-300 inline-flex items-center gap-1"><i class="fa-solid fa-clock"></i> Chờ điều phối</span>`;
                } else if (thietLapStatus === 'THIEU_NHAN_SU') {
                    statusBadgeHtml = `<span class="px-2.5 py-1 rounded text-[11px] font-semibold bg-red-100 text-red-800 border border-red-300 inline-flex items-center gap-1"><i class="fa-solid fa-triangle-exclamation"></i> Thiếu nhân sự</span>`;
                } else if (thietLapStatus === 'DA_GAN_CBTK') {
                    statusBadgeHtml = `<span class="badge-amber px-2.5 py-1 rounded text-[11px] font-semibold inline-flex items-center gap-1"><i class="fa-solid fa-user-check"></i> Đã gán CBTK</span>`;
                } else {
                    statusBadgeHtml = `<span class="badge-red px-2.5 py-1 rounded text-[11px] font-semibold inline-flex items-center gap-1"><i class="fa-solid fa-user-xmark"></i> Chưa gán CBTK</span>`;
                }

                let loaiLichBadge = `<span class="px-2 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-200">Tại viện</span>`;
                if (item.loaiHinh === 'Ngoại viện') {
                    loaiLichBadge = `<span class="px-2 py-0.5 rounded text-[10px] font-medium bg-purple-50 text-purple-700 border border-purple-200">Ngoại viện</span>`;
                } else if (item.loaiHinh === 'Tại phường') {
                    loaiLichBadge = `<span class="px-2 py-0.5 rounded text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200">Tại phường</span>`;
                }

                // Action Buttons per schedule type
                let actionButtonsHtml = `
                    <button type="button" class="btn-assign-cbtk sys-control-h36 text-xs px-3 bg-[#27496D] text-white rounded hover:bg-[#1F3D5A] font-medium flex items-center gap-1.5 shadow-2xs" data-id="${item.deploymentId}">
                        <i class="fa-solid fa-user-gear text-xs"></i>
                        <span>Gán CBTK</span>
                    </button>
                `;

                if (isNgoaiVien) {
                    actionButtonsHtml += `
                        <button type="button" class="btn-transfer-coordination sys-control-h36 text-xs px-3 bg-purple-700 text-white rounded hover:bg-purple-800 font-medium flex items-center gap-1.5 shadow-2xs" data-id="${item.deploymentId}">
                            <i class="fa-solid fa-arrow-right-to-bracket text-xs"></i>
                            <span>Điều phối nhân sự</span>
                        </button>
                    `;
                } else {
                    actionButtonsHtml += `
                        <button type="button" class="btn-assign-diagram sys-control-h36 text-xs px-3 bg-amber-600 text-white rounded hover:bg-amber-700 font-medium flex items-center gap-1.5 shadow-2xs" data-id="${item.deploymentId}">
                            <i class="fa-solid fa-sitemap text-xs"></i>
                            <span>Thiết lập Sơ đồ</span>
                        </button>
                    `;

                    if (thietLapStatus === 'THIEU_NHAN_SU') {
                        actionButtonsHtml += `
                            <button type="button" class="btn-transfer-coordination sys-control-h36 text-xs px-3 bg-red-600 text-white rounded hover:bg-red-700 font-medium flex items-center gap-1.5 shadow-2xs" data-id="${item.deploymentId}">
                                <i class="fa-solid fa-share-from-square text-xs"></i>
                                <span>Chuyển Điều phối</span>
                            </button>
                        `;
                    }
                }

                actionButtonsHtml += `
                    <button type="button" class="btn-view-detail sys-control-h36 text-xs px-2.5 bg-slate-100 text-slate-700 border border-slate-300 rounded hover:bg-slate-200 font-medium flex items-center gap-1" data-id="${item.deploymentId}" title="Xem chi tiết Vị trí">
                        <i class="fa-solid fa-eye"></i>
                    </button>
                `;

                // Render LEVEL 3: Child Unit Schedules Table
                let childRowsHtml = (item.schedules || []).map((sch, idx) => {
                    const unitName = sch.unitName || sch.customerName || 'Đơn vị KSK';
                    const paxCount = sch.quantity || sch.soLuongKhach || sch.soLuong || 0;
                    const personInCharge = sch.salesStaff || sch.personInCharge || sch.canBoPhuTrach || 'Kinh doanh';

                    return `
                        <tr class="hover:bg-slate-50 text-xs">
                            <td class="p-2 border border-slate-200 text-center font-medium text-slate-500">${idx + 1}</td>
                            <td class="p-2 border border-slate-200 font-bold text-[#27496D]">${sch.scheduleId || sch.id}</td>
                            <td class="p-2 border border-slate-200 font-semibold text-slate-800">${unitName}</td>
                            <td class="p-2 border border-slate-200 text-center">
                                <span class="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200">${sch.loaiHinh || item.loaiHinh || 'Tại viện'}</span>
                            </td>
                            <td class="p-2 border border-slate-200 text-center font-bold text-slate-800">${paxCount} pax</td>
                            <td class="p-2 border border-slate-200 text-slate-600">${personInCharge}</td>
                        </tr>
                    `;
                }).join('');

                const cbtkBannerHtml = cbtk.cbtkName ? `
                    <div class="px-4 py-2 bg-blue-50/60 border-t border-b border-slate-200 text-xs flex flex-wrap items-center justify-between gap-2 text-slate-700">
                        <div class="flex items-center gap-2">
                            <i class="fa-solid fa-user-tie text-[#27496D] text-sm"></i>
                            <span>CBTK / Trưởng đoàn: <strong class="text-[#27496D]">${cbtk.cbtkName}</strong> ${cbtk.cbtkPhone ? `<span class="text-slate-500">(${cbtk.cbtkPhone})</span>` : ''} ${cbtk.cbtkTitle ? `<span class="text-slate-500">- ${cbtk.cbtkTitle}</span>` : ''}</span>
                        </div>
                        <div class="text-[11px] text-slate-500">Phân công ngày: <strong>${cbtk.cbtkAssignDate || item.ngayThucHien}</strong></div>
                    </div>
                ` : `
                    <div class="px-4 py-2 bg-red-50/50 border-t border-b border-slate-200 text-xs flex items-center justify-between text-red-700">
                        <div class="flex items-center gap-2">
                            <i class="fa-solid fa-user-xmark text-red-500 text-sm"></i>
                            <span>Chưa gán Cán bộ triển khai (CBTK / Trưởng đoàn) cho Vị trí này</span>
                        </div>
                        <span class="text-[11px] text-red-500 font-medium">Cần phân công ngay</span>
                    </div>
                `;

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
                                    ${loaiLichBadge}
                                    ${statusBadgeHtml}
                                </div>
                                <div class="text-xs text-slate-500 flex flex-wrap items-center gap-3">
                                    <span>Mã Vị trí: <strong class="text-slate-800">${item.deploymentId}</strong></span>
                                </div>
                            </div>
                            
                            <div class="flex items-center gap-2 flex-shrink-0">
                                ${actionButtonsHtml}
                            </div>
                        </div>

                        <!-- CBTK Summary Banner -->
                        ${cbtkBannerHtml}

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
                    </div>
                `;
            });

            contextsContainerHtml += `</div>`;
            facCard.innerHTML = facHeaderHtml + contextsContainerHtml;
            container.appendChild(facCard);
        });

        bindTableActionButtons();
    }

    function bindTableActionButtons() {
        document.querySelectorAll('.btn-assign-cbtk').forEach(btn => {
            btn.addEventListener('click', function () {
                openCbtkModal(this.getAttribute('data-id'));
            });
        });

        document.querySelectorAll('.btn-assign-diagram').forEach(btn => {
            btn.addEventListener('click', function () {
                openDiagramModal(this.getAttribute('data-id'));
            });
        });

        document.querySelectorAll('.btn-transfer-coordination').forEach(btn => {
            btn.addEventListener('click', function () {
                const depId = this.getAttribute('data-id');
                MWKDataStore.transferDeploymentToCoordination(depId);
                if (window.showToast) window.showToast('Đã chuyển Vị trí sang module "Điều phối lịch KSK" thành công!');
                loadAndRenderDeployments();
                // Navigate to dieu-phoi module if needed
                setTimeout(() => {
                    window.location.href = `../dieu-phoi/index.html?depId=${depId}`;
                }, 600);
            });
        });

        document.querySelectorAll('.btn-view-detail').forEach(btn => {
            btn.addEventListener('click', function () {
                openDetailModal(this.getAttribute('data-id'));
            });
        });
    }

    // CBTK Drawer Modal Handlers
    const cbtkModal = document.getElementById('cbtk-modal');
    const cbtkSelectPerson = document.getElementById('cbtk-select-person');

    function openCbtkModal(depId) {
        const item = currentDeployments.find(d => d.deploymentId === depId);
        if (!item) return;

        const unitNamesStr = item.schedules.map(s => s.unitName || s.customerName).join(', ');

        document.getElementById('cbtk-target-schedule-id').value = item.deploymentId;
        
        const infoUnitEl = document.getElementById('cbtk-info-unit');
        const infoCodeEl = document.getElementById('cbtk-info-code');
        const infoDateEl = document.getElementById('cbtk-info-date');
        const infoTimeEl = document.getElementById('cbtk-info-time');
        const infoLocEl = document.getElementById('cbtk-info-location');

        if (infoUnitEl) infoUnitEl.innerText = unitNamesStr;
        if (infoCodeEl) infoCodeEl.innerText = item.deploymentId;
        if (infoDateEl) infoDateEl.innerText = item.ngayThucHien;
        if (infoTimeEl) infoTimeEl.innerText = item.buoi;
        if (infoLocEl) infoLocEl.innerText = `${item.coSoKham} - ${item.viTriKham}`;

        const cbtk = item.cbtk || {};
        cbtkSelectPerson.value = cbtk.cbtkName || cbtk.cbtkId || '';
        document.getElementById('cbtk-input-phone').value = cbtk.cbtkPhone || '';
        document.getElementById('cbtk-input-title').value = cbtk.cbtkTitle || '';
        document.getElementById('cbtk-input-date').value = cbtk.cbtkAssignDate || item.ngayThucHien;
        document.getElementById('cbtk-input-note').value = cbtk.cbtkNote || '';

        checkCbtkConflict();
        cbtkModal.classList.remove('hidden');
    }

    function closeCbtkModal() {
        cbtkModal.classList.add('hidden');
    }

    if (cbtkSelectPerson) {
        cbtkSelectPerson.addEventListener('change', function () {
            const selectedOpt = this.options[this.selectedIndex];
            if (selectedOpt && selectedOpt.value) {
                document.getElementById('cbtk-input-phone').value = selectedOpt.getAttribute('data-phone') || '';
                document.getElementById('cbtk-input-title').value = selectedOpt.getAttribute('data-title') || '';
            }
            checkCbtkConflict();
        });
    }

    function checkCbtkConflict() {
        const depId = document.getElementById('cbtk-target-schedule-id').value;
        const personId = cbtkSelectPerson.value;
        const item = currentDeployments.find(d => d.deploymentId === depId);
        const conflictAlert = document.getElementById('cbtk-conflict-alert');

        if (!personId || !item || !conflictAlert) {
            if (conflictAlert) conflictAlert.classList.add('hidden');
            return;
        }

        const conflictResult = MWKDataStore.checkPersonnelScheduleConflict({
            personId: personId,
            scheduleId: depId,
            examDate: item.ngayThucHien,
            startTime: '07:30',
            endTime: '17:00'
        });

        if (conflictResult.hasConflict) {
            const firstConflict = conflictResult.conflicts[0];
            const descEl = document.getElementById('cbtk-conflict-desc');
            if (descEl) {
                descEl.innerHTML = `
                    ⚠ <strong>${firstConflict.role}</strong> đã được phân công tại đợt <strong>${firstConflict.unitName}</strong> (${firstConflict.scheduleId}) ngày <strong>${firstConflict.date}</strong> từ ${firstConflict.startTime} đến ${firstConflict.endTime} tại ${firstConflict.location}.
                `;
            }
            conflictAlert.classList.remove('hidden');
        } else {
            conflictAlert.classList.add('hidden');
        }
    }

    document.getElementById('btn-close-cbtk-modal')?.addEventListener('click', closeCbtkModal);
    document.getElementById('btn-cancel-cbtk')?.addEventListener('click', closeCbtkModal);

    document.getElementById('btn-save-cbtk')?.addEventListener('click', function () {
        const depId = document.getElementById('cbtk-target-schedule-id').value;
        const personId = cbtkSelectPerson.value;
        const selectedOpt = cbtkSelectPerson.options[cbtkSelectPerson.selectedIndex];

        if (!personId) {
            if (window.showToast) window.showToast('Vui lòng chọn Cán bộ triển khai!', 'error');
            return;
        }

        const cbtkData = {
            cbtkId: personId,
            cbtkName: selectedOpt ? selectedOpt.getAttribute('data-name') : personId,
            cbtkPhone: document.getElementById('cbtk-input-phone').value.trim(),
            cbtkTitle: document.getElementById('cbtk-input-title').value.trim(),
            cbtkAssignDate: document.getElementById('cbtk-input-date').value,
            cbtkNote: document.getElementById('cbtk-input-note').value.trim()
        };

        const success = MWKDataStore.saveDeploymentCbtk(depId, cbtkData);
        if (success) {
            if (window.showToast) window.showToast('Đã lưu Cán bộ triển khai thành công!');
            closeCbtkModal();
            loadAndRenderDeployments();
        } else {
            if (window.showToast) window.showToast('Không thể lưu CBTK!', 'error');
        }
    });

    // Diagram Drawer Modal Handlers
    const diagramModal = document.getElementById('diagram-modal');

    function openDiagramModal(depId) {
        const item = currentDeployments.find(d => d.deploymentId === depId);
        if (!item) return;

        const unitNamesStr = item.schedules.map(s => s.unitName || s.customerName).join(', ');

        document.getElementById('diagram-target-schedule-id').value = item.deploymentId;
        
        const infoUnitEl = document.getElementById('diagram-info-unit');
        const infoTypeEl = document.getElementById('diagram-info-type');
        const infoCodeEl = document.getElementById('diagram-info-code');
        const infoDateEl = document.getElementById('diagram-info-date');

        if (infoUnitEl) infoUnitEl.innerText = unitNamesStr;
        if (infoTypeEl) infoTypeEl.innerText = item.loaiHinh || 'Tại viện';
        if (infoCodeEl) infoCodeEl.innerText = item.deploymentId;
        if (infoDateEl) infoDateEl.innerText = `${item.ngayThucHien} (${item.coSoKham} - ${item.viTriKham})`;

        const notAppBanner = document.getElementById('diagram-not-applicable');
        const formContainer = document.getElementById('diagram-form-container');

        if (item.loaiHinh === 'Ngoại viện') {
            if (notAppBanner) notAppBanner.classList.remove('hidden');
            if (formContainer) formContainer.classList.add('hidden');
        } else {
            if (notAppBanner) notAppBanner.classList.add('hidden');
            if (formContainer) formContainer.classList.remove('hidden');

            renderDiagramHierarchyTable(item);
        }

        diagramModal.classList.remove('hidden');
    }

    function renderDiagramHierarchyTable(depItem) {
        const diagramList = depItem.diagram || [];
        const formContainer = document.getElementById('diagram-form-container');
        if (!formContainer) return;

        let rowsHtml = '';
        diagramList.forEach((row, idx) => {
            rowsHtml += `
                <tr class="hover:bg-slate-50">
                    <td class="p-2.5 border border-slate-200 font-medium text-slate-700">${row.floor} - ${row.locationName}</td>
                    <td class="p-2.5 border border-slate-200 font-semibold text-[#27496D]">${row.specialty}</td>
                    <td class="p-2.5 border border-slate-200 text-center font-bold text-slate-800">${row.needBS} BS / ${row.needDD} ĐD</td>
                    <td class="p-2.5 border border-slate-200 text-center">
                        <input type="number" min="0" class="input-diag-bs sys-input text-xs w-14 text-center font-bold" data-idx="${idx}" value="${row.pakdBS}"> BS
                        <input type="number" min="0" class="input-diag-dd sys-input text-xs w-14 text-center font-bold ml-1" data-idx="${idx}" value="${row.pakdDD}"> ĐD
                    </td>
                    <td class="p-2.5 border border-slate-200 text-slate-600 font-medium text-[11px]">${row.equipmentNeed || '---'}</td>
                </tr>
            `;
        });

        const unitNamesStr = depItem.schedules.map(s => s.unitName || s.customerName).join(', ');

        formContainer.innerHTML = `
            <div class="space-y-3 text-xs">
                <div class="p-3 bg-amber-50/70 border border-amber-200 rounded text-amber-900 space-y-1">
                    <div class="font-bold flex items-center gap-1.5 text-amber-900">
                        <i class="fa-solid fa-sitemap text-amber-600"></i>
                        <span>Sơ đồ khám & Trang thiết bị tổng hợp tại Vị trí</span>
                    </div>
                    <p>Tổng hợp từ danh mục khám của <strong>${depItem.schedules.length} lịch thành phần</strong> (Đơn vị: ${unitNamesStr}) - Tổng lượt khách: <strong>${depItem.totalPax} người</strong>.</p>
                </div>
                <table class="w-full text-left border-collapse border border-slate-200 text-xs">
                    <thead>
                        <tr class="bg-slate-100 text-slate-700 font-semibold uppercase text-[10px]">
                            <th class="p-2.5 border border-slate-200">Phòng / Vị trí</th>
                            <th class="p-2.5 border border-slate-200">Chuyên khoa</th>
                            <th class="p-2.5 border border-slate-200 w-28 text-center">Nhu cầu (Tính toán)</th>
                            <th class="p-2.5 border border-slate-200 w-36 text-center">Định mức PAKD</th>
                            <th class="p-2.5 border border-slate-200">Trang thiết bị cần</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-200 bg-white">
                        ${rowsHtml}
                    </tbody>
                </table>
            </div>
        `;
    }

    function closeDiagramModal() {
        diagramModal.classList.add('hidden');
    }

    document.getElementById('btn-close-diagram-modal')?.addEventListener('click', closeDiagramModal);
    document.getElementById('btn-cancel-diagram')?.addEventListener('click', closeDiagramModal);

    document.getElementById('btn-save-diagram')?.addEventListener('click', function () {
        const depIdInput = document.getElementById('diagram-target-schedule-id');
        const depId = depIdInput ? depIdInput.value : '';
        if (!depId) {
            closeDiagramModal();
            return;
        }
        const item = currentDeployments.find(d => d.deploymentId === depId);
        if (!item) {
            closeDiagramModal();
            return;
        }

        if (item.loaiHinh === 'Ngoại viện') {
            closeDiagramModal();
            return;
        }

        const diagramList = [...(item.diagram || [])];
        document.querySelectorAll('.input-diag-bs').forEach(inp => {
            const idx = parseInt(inp.getAttribute('data-idx'), 10);
            if (diagramList[idx]) diagramList[idx].pakdBS = parseInt(inp.value, 10) || 0;
        });
        document.querySelectorAll('.input-diag-dd').forEach(inp => {
            const idx = parseInt(inp.getAttribute('data-idx'), 10);
            if (diagramList[idx]) diagramList[idx].pakdDD = parseInt(inp.value, 10) || 0;
        });

        const success = MWKDataStore.saveDeploymentDiagram(depId, diagramList);
        if (success) {
            if (window.showToast) window.showToast('Đã lưu Sơ đồ khám & Định mức PAKD cho Vị trí triển khai thành công!');
            closeDiagramModal();
            loadAndRenderDeployments();
        } else {
            if (window.showToast) window.showToast('Không thể lưu sơ đồ!', 'error');
        }
    });

    // Detail Modal Handler
    const detailModal = document.getElementById('detail-modal');
    function openDetailModal(depId) {
        const item = currentDeployments.find(d => d.deploymentId === depId);
        if (!item) return;

        const cbtk = item.cbtk || {};

        let schedulesHtml = item.schedules.map((s, i) => `
            <div class="p-3 bg-white border border-slate-200 rounded text-xs space-y-1.5">
                <div class="flex justify-between font-bold text-slate-800">
                    <span>${i + 1}. ${s.unitName || s.customerName} (${s.scheduleId})</span>
                    <span class="text-[#27496D]">${s.quantity || s.soLuongKhach || 0} khách</span>
                </div>
                <div class="text-slate-600">Loại lịch: <strong>${s.loaiHinh || 'Tại viện'}</strong> | Ca: <strong>${s.session || 'Sáng'}</strong> | Phụ trách: <strong>${s.personInCharge || s.canBoPhuTrach || '---'}</strong></div>
                <div class="text-slate-500 italic">Danh mục khám: ${(s.categories || []).join(', ')}</div>
            </div>
        `).join('');

        const detailBody = document.getElementById('detail-modal-body');
        if (detailBody) {
            detailBody.innerHTML = `
                <div class="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded border border-slate-200 text-xs">
                    <div><span class="text-slate-500">Mã Vị trí/Đoàn:</span> <strong class="text-[#27496D]">${item.deploymentId}</strong></div>
                    <div><span class="text-slate-500">Loại hình:</span> <span class="font-semibold text-slate-800">${item.loaiHinh}</span></div>
                    <div><span class="text-slate-500">Ngày thực hiện:</span> <span class="font-bold text-slate-800">${item.ngayThucHien}</span></div>
                    <div><span class="text-slate-500">Tổng số khách:</span> <strong class="text-slate-900">${item.totalPax} khách</strong></div>
                    <div class="col-span-2"><span class="text-slate-500">Cơ sở & Vị trí:</span> <span class="font-bold text-slate-800">${item.coSoKham} - ${item.viTriKham} (${item.buoi})</span></div>
                </div>

                <div class="space-y-2">
                    <h4 class="font-bold text-slate-800 border-b pb-1 text-xs uppercase flex items-center justify-between">
                        <span>CÁC LỊCH THÀNH PHẦN THUỘC VỊ TRÍ</span>
                        <span class="text-[#27496D] font-bold">${item.schedules.length} lịch</span>
                    </h4>
                    <div class="space-y-2 max-h-56 overflow-y-auto custom-scrollbar">
                        ${schedulesHtml}
                    </div>
                </div>

                <div class="space-y-2">
                    <h4 class="font-bold text-slate-800 border-b pb-1 text-xs uppercase">CÁN BỘ TRIỂN KHAI (CBTK / TRƯỞNG ĐOÀN)</h4>
                    ${cbtk.cbtkName ? `
                        <div class="text-xs space-y-1 bg-slate-50 p-3 rounded border border-slate-200">
                            <div><strong>Họ tên:</strong> <span class="text-[#27496D] font-bold">${cbtk.cbtkName}</span></div>
                            <div><strong>Chức danh / Vị trí:</strong> ${cbtk.cbtkTitle || '---'}</div>
                            <div><strong>Số điện thoại:</strong> ${cbtk.cbtkPhone || '---'}</div>
                            <div><strong>Ngày gán:</strong> ${cbtk.cbtkAssignDate || item.ngayThucHien}</div>
                            ${cbtk.cbtkNote ? `<div><strong>Ghi chú:</strong> ${cbtk.cbtkNote}</div>` : ''}
                        </div>
                    ` : `<p class="text-red-500 italic text-xs">Chưa gán CBTK cho Vị trí này</p>`}
                </div>
            `;
        }

        detailModal.classList.remove('hidden');
    }

    document.getElementById('btn-close-detail-modal')?.addEventListener('click', () => detailModal.classList.add('hidden'));
    document.getElementById('btn-dismiss-detail')?.addEventListener('click', () => detailModal.classList.add('hidden'));

    // Excel Export Feature
    document.getElementById('btn-export-excel')?.addEventListener('click', function () {
        const filtered = getFilteredDeployments();
        if (filtered.length === 0) {
            if (window.showToast) window.showToast('Không có dữ liệu để xuất Excel!', 'error');
            return;
        }

        let csvContent = 'data:text/csv;charset=utf-8,\uFEFF';
        csvContent += 'STT,Mã Vị Trí,Ngày Thực Hiện,Cơ Sở Khám,Vị Trí Triển Khai,Buổi / Ca,Mã Lịch Con,Tên Đơn Vị KSK,Số Khách,Danh Mục Khám,CBTK Trưởng Đoàn,Trạng Thái Thiết Lập\n';

        let stt = 1;
        filtered.forEach((item) => {
            const cbtkName = (item.cbtk && item.cbtk.cbtkName) ? `"${item.cbtk.cbtkName}"` : 'Chưa gán';
            const statusStr = item.thietLapStatus;

            item.schedules.forEach((s) => {
                const row = [
                    stt++,
                    `"${item.deploymentId}"`,
                    `"${item.ngayThucHien}"`,
                    `"${item.coSoKham}"`,
                    `"${item.viTriKham}"`,
                    `"${item.buoi}"`,
                    `"${s.scheduleId || s.id}"`,
                    `"${s.unitName || s.customerName}"`,
                    s.quantity || s.soLuongKhach || 0,
                    `"${(s.categories || []).join('; ')}"`,
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
        link.setAttribute('download', `danh-sach-vi-tri-trien-khai-ksk-${today}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        if (window.showToast) window.showToast('Đã xuất file Excel Vị trí triển khai thành công!');
    });

    // Filter Listeners
    ['filter-date-from', 'filter-date-to', 'filter-loai-lich', 'filter-trang-thai'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('change', renderLocationGroups);
    });
    document.getElementById('filter-keyword')?.addEventListener('input', renderLocationGroups);
    document.getElementById('btn-refresh-data')?.addEventListener('click', loadAndRenderDeployments);

    initData();
});
