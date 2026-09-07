/**
 * MWK - CB DUYỆT LỊCH KSK MODULE (ENTERPRISE HIS CONTROLLER)
 * Handles 2-Step Approval Workflow, Dynamic Filters, Grouping Table, Auto-detaching Return Logic.
 */
(function (window) {
    // Controller State
    let currentTab = 'ALL';
    let currentPage = 1;
    let pageSize = 10;
    let selectedScheduleIds = new Set();
    let expandedMasterIds = new Set();
    let targetMasterIdForReturn = null;

    document.addEventListener('DOMContentLoaded', function () {
        init();
    });

    function init() {
        bindEvents();
        // Expand all master rows by default for initial visibility
        const allMasters = MWKDataStore.getApprovalSchedules();
        allMasters.forEach(m => expandedMasterIds.add(m.tongLichId));

        renderDashboard();
    }

    function bindEvents() {
        // Tab Bar Buttons
        const tabBtns = document.querySelectorAll('.approval-tab-btn');
        tabBtns.forEach(btn => {
            btn.addEventListener('click', function () {
                tabBtns.forEach(b => {
                    b.classList.remove('border-[#27496D]', 'text-[#27496D]', 'font-bold');
                    b.classList.add('border-transparent', 'text-[#6B7280]', 'font-medium');
                });
                this.classList.remove('border-transparent', 'text-[#6B7280]', 'font-medium');
                this.classList.add('border-[#27496D]', 'text-[#27496D]', 'font-bold');

                currentTab = this.getAttribute('data-type') || 'ALL';
                currentPage = 1;
                renderDashboard();
            });
        });

        // Filter Actions
        const btnApplyFilter = document.getElementById('btn-apply-filter');
        const btnResetFilter = document.getElementById('btn-reset-filter');
        const btnRefreshData = document.getElementById('btn-refresh-data');

        if (btnApplyFilter) {
            btnApplyFilter.addEventListener('click', function () {
                currentPage = 1;
                renderDashboard();
            });
        }

        if (btnResetFilter) {
            btnResetFilter.addEventListener('click', function () {
                document.getElementById('filter-search').value = '';
                document.getElementById('filter-type').value = '';
                document.getElementById('filter-facility').value = '';
                document.getElementById('filter-status').value = '';
                document.getElementById('filter-from-date').value = '';
                currentPage = 1;
                renderDashboard();
            });
        }

        if (btnRefreshData) {
            btnRefreshData.addEventListener('click', function () {
                if (window.showToast) window.showToast('Đã làm mới dữ liệu CB Duyệt lịch KSK!', 'info');
                renderDashboard();
            });
        }

        // Live Search Input Debounce
        const filterSearch = document.getElementById('filter-search');
        if (filterSearch) {
            let debounceTimer;
            filterSearch.addEventListener('input', function () {
                clearTimeout(debounceTimer);
                debounceTimer = setTimeout(() => {
                    currentPage = 1;
                    renderDashboard();
                }, 300);
            });
        }

        // Page Size Selector
        const pageSizeSelect = document.getElementById('page-size-select');
        if (pageSizeSelect) {
            pageSizeSelect.addEventListener('change', function () {
                pageSize = parseInt(this.value) || 10;
                currentPage = 1;
                renderDashboard();
            });
        }

        // Master Header Select All Checkbox
        const selectAllMasterCb = document.getElementById('select-all-master-cb');
        if (selectAllMasterCb) {
            selectAllMasterCb.addEventListener('change', function () {
                const isChecked = this.checked;
                const filteredData = getFilteredApprovalData();
                filteredData.allChildSchedules.forEach(child => {
                    if (isChecked) {
                        selectedScheduleIds.add(child.scheduleId);
                    } else {
                        selectedScheduleIds.delete(child.scheduleId);
                    }
                });
                renderTable();
                updateActionBar();
            });
        }

        // Sticky Action Bar Buttons
        const btnApproveSelected = document.getElementById('btn-approve-selected');
        const btnReturnSelected = document.getElementById('btn-return-selected');
        const btnReturnMaster = document.getElementById('btn-return-master');

        if (btnApproveSelected) {
            btnApproveSelected.addEventListener('click', openApproveModal);
        }

        if (btnReturnSelected) {
            btnReturnSelected.addEventListener('click', openReturnSelectedModal);
        }

        if (btnReturnMaster) {
            btnReturnMaster.addEventListener('click', function () {
                const selectedChilds = getSelectedChildItems();
                if (selectedChilds.length === 0) {
                    if (window.showToast) window.showToast('Vui lòng tích chọn lịch lẻ thuộc Lịch tổng cần trả!', 'warning');
                    return;
                }
                const firstMasterId = selectedChilds[0].tongLichId;
                openReturnAllModal(firstMasterId);
            });
        }

        // Modal Confirmation Buttons
        const btnConfirmApprove = document.getElementById('btn-confirm-approve');
        if (btnConfirmApprove) {
            btnConfirmApprove.addEventListener('click', confirmApproveSchedules);
        }

        const btnConfirmReturnSelected = document.getElementById('btn-confirm-return-selected');
        if (btnConfirmReturnSelected) {
            btnConfirmReturnSelected.addEventListener('click', confirmReturnSelectedSchedules);
        }

        const btnConfirmReturnAll = document.getElementById('btn-confirm-return-all');
        if (btnConfirmReturnAll) {
            btnConfirmReturnAll.addEventListener('click', confirmReturnAllMasterSchedule);
        }

        // Listen for Data Store Custom Events
        window.addEventListener('mwk_approval_schedules_changed', function () {
            renderDashboard();
        });
    }

    // --- DATA FILTERING ENGINE ---
    function getFilteredApprovalData() {
        const masterList = MWKDataStore.getApprovalSchedules();

        const searchVal = (document.getElementById('filter-search')?.value || '').toLowerCase().trim();
        const typeVal = document.getElementById('filter-type')?.value || '';
        const facilityVal = document.getElementById('filter-facility')?.value || '';
        const statusVal = document.getElementById('filter-status')?.value || '';
        const fromDateVal = document.getElementById('filter-from-date')?.value || '';

        const filteredMasters = [];
        const allChildSchedules = [];

        masterList.forEach(master => {
            // Tab filter matching
            if (currentTab !== 'ALL' && master.tongLichType !== currentTab) {
                return;
            }

            // Type filter matching
            if (typeVal && master.tongLichType !== typeVal) {
                return;
            }

            // Child schedules filtering
            const matchedChilds = master.childSchedules.filter(child => {
                const matchSearch = !searchVal || 
                    (child.scheduleId || '').toLowerCase().includes(searchVal) ||
                    (child.tongLichId || '').toLowerCase().includes(searchVal) ||
                    (child.unitName || '').toLowerCase().includes(searchVal) ||
                    (child.personInCharge || '').toLowerCase().includes(searchVal);

                const matchFacility = !facilityVal || child.facility === facilityVal;

                let matchStatus = true;
                if (statusVal) {
                    if (statusVal === 'QUA_HAN') {
                        matchStatus = child.isOverdue === true || child.status === 'QUA_HAN';
                    } else {
                        matchStatus = child.status === statusVal;
                    }
                }

                const matchFromDate = !fromDateVal || (child.examDate >= fromDateVal);

                return matchSearch && matchFacility && matchStatus && matchFromDate;
            });

            if (matchedChilds.length > 0) {
                filteredMasters.push({
                    ...master,
                    childSchedules: matchedChilds
                });
                allChildSchedules.push(...matchedChilds);
            }
        });

        return {
            filteredMasters,
            allChildSchedules
        };
    }

    // --- RENDER MAIN DASHBOARD ---
    function renderDashboard() {
        const allMasterData = MWKDataStore.getApprovalSchedules();
        renderSummaryMetrics(allMasterData);

        renderTable();
        updateActionBar();
    }

    // --- 4 SUMMARY CARDS & TAB COUNTERS ---
    function renderSummaryMetrics(masterList) {
        let totalPending = 0;
        let weeklyCount = 0;
        let incidentCount = 0;
        let wardCount = 0;

        let tabAllCount = 0;
        let tabWeeklyCount = 0;
        let tabIncidentCount = 0;
        let tabWardCount = 0;

        masterList.forEach(m => {
            m.childSchedules.forEach(c => {
                tabAllCount++;
                if (c.scheduleType === 'LICH_TUAN') tabWeeklyCount++;
                if (c.scheduleType === 'LICH_PHAT_SINH') tabIncidentCount++;
                if (c.scheduleType === 'LICH_PHUONG') tabWardCount++;

                if (c.status === 'CHO_CB_DUYET' || c.status === 'DANG_DUYET_BUOC_1' || c.status === 'DANG_DUYET_BUOC_2' || c.status === 'QUA_HAN') {
                    totalPending++;
                }

                if (c.scheduleType === 'LICH_TUAN') weeklyCount++;
                if (c.scheduleType === 'LICH_PHAT_SINH') incidentCount++;
                if (c.scheduleType === 'LICH_PHUONG') wardCount++;
            });
        });

        const elPending = document.getElementById('sum-total-pending');
        const elWeekly = document.getElementById('sum-weekly');
        const elIncident = document.getElementById('sum-incident');
        const elWard = document.getElementById('sum-ward');

        if (elPending) elPending.innerText = totalPending;
        if (elWeekly) elWeekly.innerText = weeklyCount;
        if (elIncident) elIncident.innerText = incidentCount;
        if (elWard) elWard.innerText = wardCount;

        const elTabAll = document.getElementById('tab-count-all');
        const elTabWeekly = document.getElementById('tab-count-weekly');
        const elTabIncident = document.getElementById('tab-count-incident');
        const elTabWard = document.getElementById('tab-count-ward');

        if (elTabAll) elTabAll.innerText = tabAllCount;
        if (elTabWeekly) elTabWeekly.innerText = tabWeeklyCount;
        if (elTabIncident) elTabIncident.innerText = tabIncidentCount;
        if (elTabWard) elTabWard.innerText = tabWardCount;
    }

    // --- GROUPED TABLE RENDERER ---
    function renderTable() {
        const tbody = document.getElementById('approval-table-body');
        const emptyState = document.getElementById('table-empty-state');
        if (!tbody) return;

        const { filteredMasters, allChildSchedules } = getFilteredApprovalData();

        if (allChildSchedules.length === 0) {
            tbody.innerHTML = '';
            if (emptyState) emptyState.classList.remove('hidden');
            renderPagination(0);
            return;
        }

        if (emptyState) emptyState.classList.add('hidden');

        // Pagination calculation based on child schedules
        const totalRecords = allChildSchedules.length;
        const totalPages = Math.ceil(totalRecords / pageSize);

        if (currentPage > totalPages) currentPage = totalPages;
        if (currentPage < 1) currentPage = 1;

        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = Math.min(startIndex + pageSize, totalRecords);

        const paginatedChilds = allChildSchedules.slice(startIndex, endIndex);

        // Group paginated childs by their Master Schedule ID
        const paginatedMasterMap = new Map();
        paginatedChilds.forEach(child => {
            if (!paginatedMasterMap.has(child.tongLichId)) {
                const parentMaster = filteredMasters.find(m => m.tongLichId === child.tongLichId);
                paginatedMasterMap.set(child.tongLichId, {
                    master: parentMaster || { tongLichId: child.tongLichId, unitName: child.unitName },
                    childs: []
                });
            }
            paginatedMasterMap.get(child.tongLichId).childs.push(child);
        });

        let html = '';
        let globalIndex = startIndex + 1;

        paginatedMasterMap.forEach(({ master, childs }, masterId) => {
            const isExpanded = expandedMasterIds.has(masterId);
            const masterChildIds = childs.map(c => c.scheduleId);
            const isMasterAllSelected = masterChildIds.every(id => selectedScheduleIds.has(id));

            const totalGuestsMaster = childs.reduce((sum, c) => sum + (parseInt(c.quantity) || 0), 0);
            const masterStatusHtml = getMasterStatusBadge(master.status || 'CHO_CB_DUYET');

            // Render Master Row
            html += `
                <tr class="table-approval-master border-b border-[#D9DEE5]">
                    <td class="p-2.5 text-center">
                        <input type="checkbox" id="master-cb-${masterId}" data-master-id="${masterId}" class="master-row-cb w-4 h-4 rounded text-[#27496D] focus:ring-[#27496D] cursor-pointer" ${isMasterAllSelected ? 'checked' : ''}>
                    </td>
                    <td class="p-2.5 text-center font-bold text-[#27496D]" colspan="2">
                        <button type="button" onclick="MWKApprovalController.toggleExpandMaster('${masterId}')" class="flex items-center gap-2 hover:text-[#1F3D5A] focus:outline-none">
                            <i class="fa-solid ${isExpanded ? 'fa-chevron-down' : 'fa-chevron-right'} text-xs text-[#27496D]"></i>
                            <span>${masterId}</span>
                        </button>
                    </td>
                    <td class="p-2.5 font-bold text-[#1F2937]" colspan="3">
                        <span class="text-[#1F2937] font-bold">${master.unitName}</span>
                        <span class="text-[11px] text-[#6B7280] font-normal ml-2">(${childs.length} lịch lẻ · ${totalGuestsMaster} KH)</span>
                    </td>
                    <td class="p-2.5 text-[#6B7280] text-xs font-semibold">${master.examDate || '-'}</td>
                    <td class="p-2.5 text-[#6B7280]" colspan="3">Cán bộ gửi: ${master.submittedBy || 'Cán bộ Tổng hợp'}</td>
                    <td class="p-2.5 text-center">${masterStatusHtml}</td>
                    <td class="p-2.5 text-center text-[#6B7280] text-[11px]">${formatDateStr(master.submittedAt)}</td>
                    <td class="p-2.5 text-center">
                        <button type="button" onclick="MWKApprovalController.openReturnAllModal('${masterId}')" class="text-xs text-[#DC2626] hover:underline font-semibold flex items-center justify-center gap-1 mx-auto">
                            <i class="fa-solid fa-reply text-[10px]"></i> Trả lịch tổng
                        </button>
                    </td>
                </tr>
            `;

            // Render Child Rows if Expanded
            if (isExpanded) {
                childs.forEach(child => {
                    const isChecked = selectedScheduleIds.has(child.scheduleId);
                    const childStatusBadge = getChildStatusBadge(child);
                    const deadlineBadge = getDeadlineBadge(child);
                    const typeBadge = getTypeBadge(child.scheduleType || child.loaiHinh);

                    html += `
                        <tr class="table-approval-child border-b border-[#E6EAF0]">
                            <td class="p-2.5 text-center">
                                <input type="checkbox" id="child-cb-${child.scheduleId}" data-child-id="${child.scheduleId}" class="child-row-cb w-4 h-4 rounded text-[#27496D] focus:ring-[#27496D] cursor-pointer" ${isChecked ? 'checked' : ''}>
                            </td>
                            <td class="p-2.5 text-center text-[#6B7280]">${globalIndex++}</td>
                            <td class="p-2.5 text-[#6B7280] font-medium">${child.tongLichId}</td>
                            <td class="p-2.5 child-indent font-bold text-[#27496D]">${child.scheduleId}</td>
                            <td class="p-2.5">${typeBadge}</td>
                            <td class="p-2.5 font-semibold text-[#1F2937]">${child.unitName}</td>
                            <td class="p-2.5 text-[#374151] font-medium">${child.examDate || '-'}</td>
                            <td class="p-2.5 text-[#4B5563]">${child.session || 'Sáng'}</td>
                            <td class="p-2.5 text-right font-bold text-[#2E7D32]">${child.quantity || 0}</td>
                            <td class="p-2.5 text-[#374151]">${child.facility || 'Ba Đình'}</td>
                            <td class="p-2.5 text-[#4B5563]">${child.personInCharge || 'Nguyễn Văn An'}</td>
                            <td class="p-2.5 text-center">${childStatusBadge}</td>
                            <td class="p-2.5 text-center">${deadlineBadge}</td>
                            <td class="p-2.5 text-center">
                                <button type="button" onclick="MWKApprovalController.openScheduleDetail('${child.scheduleId}')" class="btn-secondary text-[11px] sys-control-h36 px-2.5 py-1 text-[#27496D] hover:bg-[#E8F1FB] inline-flex items-center gap-1">
                                    <i class="fa-regular fa-eye text-xs"></i> Xem
                                </button>
                            </td>
                        </tr>
                    `;
                });
            }
        });

        tbody.innerHTML = html;

        // Bind Checkbox Change Events
        const masterCbs = tbody.querySelectorAll('.master-row-cb');
        masterCbs.forEach(cb => {
            cb.addEventListener('change', function () {
                const masterId = this.getAttribute('data-master-id');
                const targetMaster = filteredMasters.find(m => m.tongLichId === masterId);
                if (targetMaster) {
                    targetMaster.childSchedules.forEach(c => {
                        if (this.checked) selectedScheduleIds.add(c.scheduleId);
                        else selectedScheduleIds.delete(c.scheduleId);
                    });
                }
                renderTable();
                updateActionBar();
            });
        });

        const childCbs = tbody.querySelectorAll('.child-row-cb');
        childCbs.forEach(cb => {
            cb.addEventListener('change', function () {
                const childId = this.getAttribute('data-child-id');
                if (this.checked) selectedScheduleIds.add(childId);
                else selectedScheduleIds.delete(childId);
                updateActionBar();
            });
        });

        renderPagination(totalRecords);
    }

    // --- BADGE RENDER HELPERS ---
    function getMasterStatusBadge(status) {
        if (status === 'DA_DUYET') {
            return `<span class="badge-status-da-duyet"><i class="fa-solid fa-check-double text-[10px]"></i> Đã duyệt hoàn tất</span>`;
        } else if (status === 'DANG_DUYET_BUOC_2') {
            return `<span class="badge-status-buoc2"><i class="fa-solid fa-user-check text-[10px]"></i> Đang duyệt B2 (KSK)</span>`;
        } else if (status === 'DANG_DUYET_BUOC_1') {
            return `<span class="badge-status-buoc1"><i class="fa-solid fa-user-gear text-[10px]"></i> Đang duyệt B1 (KHDN)</span>`;
        } else if (status === 'QUA_HAN') {
            return `<span class="badge-status-qua-han"><i class="fa-solid fa-triangle-exclamation text-[10px]"></i> Quá hạn tự động</span>`;
        } else if (status === 'TRA_LAI_TOAN_BO' || status === 'TRA_LAI') {
            return `<span class="badge-status-tra-lai"><i class="fa-solid fa-xmark text-[10px]"></i> Đã trả toàn bộ</span>`;
        } else if (status === 'TRA_LAI_LICH_LE') {
            return `<span class="badge-status-tra-lai"><i class="fa-solid fa-code-branch text-[10px]"></i> Bóc tách lịch lẻ</span>`;
        }
        return `<span class="badge-status-cho-duyet"><i class="fa-solid fa-clock text-[10px]"></i> Chờ CB Duyệt</span>`;
    }

    function getChildStatusBadge(child) {
        return renderScheduleStatus(child);
    }

    function getDeadlineBadge(child) {
        if (child.status === 'DA_DUYET') {
            return `<span class="text-[11px] text-[#16A34A] font-semibold"><i class="fa-solid fa-check text-[10px]"></i> Hoàn tất</span>`;
        }
        if (child.isOverdue || child.status === 'QUA_HAN') {
            return `<span class="text-[11px] text-[#DC2626] font-bold animate-pulse"><i class="fa-solid fa-clock text-[10px]"></i> Quá hạn</span>`;
        }
        return `<span class="text-[11px] text-[#2563EB] font-medium"><i class="fa-solid fa-hourglass-half text-[10px]"></i> Còn 01:25:30</span>`;
    }

    function getTypeBadge(typeStr) {
        if (typeStr === 'LICH_TUAN' || typeStr === 'Lịch tuần' || typeStr === 'Tại viện') {
            return `<span class="px-2 py-0.5 bg-[#E8F1FB] text-[#27496D] rounded text-[10px] font-bold">Lịch tuần</span>`;
        } else if (typeStr === 'LICH_PHAT_SINH' || typeStr === 'Lịch phát sinh' || typeStr === 'Ngoại viện') {
            return `<span class="px-2 py-0.5 bg-[#FFF3E0] text-[#ED6C02] rounded text-[10px] font-bold">Phát sinh</span>`;
        } else if (typeStr === 'LICH_PHUONG' || typeStr === 'Lịch phường' || typeStr === 'Phường') {
            return `<span class="px-2 py-0.5 bg-[#F3E8FF] text-[#7E22CE] rounded text-[10px] font-bold">Phường</span>`;
        }
        return `<span class="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-bold">${typeStr}</span>`;
    }

    function formatDateStr(isoStr) {
        if (!isoStr) return '-';
        try {
            const d = new Date(isoStr);
            if (isNaN(d.getTime())) return isoStr;
            return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')} ${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}`;
        } catch (e) {
            return isoStr;
        }
    }

    // --- STICKY ACTION BAR CONTROLLER ---
    function updateActionBar() {
        const actionBar = document.getElementById('approval-action-bar');
        const selectedChildCountEl = document.getElementById('selected-child-count');
        const selectedMasterCountEl = document.getElementById('selected-master-count');

        if (!actionBar) return;

        if (selectedScheduleIds.size > 0) {
            actionBar.classList.remove('hidden');

            const selectedChilds = getSelectedChildItems();
            const uniqueMasterIds = new Set(selectedChilds.map(c => c.tongLichId));

            if (selectedChildCountEl) selectedChildCountEl.innerText = selectedScheduleIds.size;
            if (selectedMasterCountEl) selectedMasterCountEl.innerText = uniqueMasterIds.size;
        } else {
            actionBar.classList.add('hidden');
        }
    }

    function getSelectedChildItems() {
        const masterList = MWKDataStore.getApprovalSchedules();
        const items = [];
        masterList.forEach(m => {
            m.childSchedules.forEach(c => {
                if (selectedScheduleIds.has(c.scheduleId)) {
                    items.push(c);
                }
            });
        });
        return items;
    }

    // --- ACTION MODAL HANDLERS ---
    function openApproveModal() {
        if (selectedScheduleIds.size === 0) {
            if (window.showToast) window.showToast('Vui lòng chọn ít nhất 1 lịch lẻ để phê duyệt!', 'warning');
            return;
        }

        const countEl = document.getElementById('approve-modal-count');
        const stepEl = document.getElementById('approve-modal-step');
        if (countEl) countEl.innerText = selectedScheduleIds.size;

        const selectedChilds = getSelectedChildItems();
        const hasStep1 = selectedChilds.some(c => c.approvalStep === 1 || c.status === 'CHO_CB_DUYET' || c.status === 'DANG_DUYET_BUOC_1');
        if (stepEl) {
            stepEl.innerText = hasStep1 ? 'Bước 1 (BGĐ Khối KHDN)' : 'Bước 2 (BGĐ Khối KSK)';
        }

        openModal('modal-approve');
    }

    function confirmApproveSchedules() {
        const idsArray = Array.from(selectedScheduleIds);
        const count = MWKDataStore.approveSchedules(idsArray, 'BGĐ Khối KHDN');

        closeModal('modal-approve');
        selectedScheduleIds.clear();

        if (window.showToast) {
            window.showToast(`Đã phê duyệt thành công ${count} lịch KSK!`, 'success');
        }

        renderDashboard();
    }

    function openReturnSelectedModal() {
        if (selectedScheduleIds.size === 0) {
            if (window.showToast) window.showToast('Vui lòng chọn các lịch lẻ cần trả!', 'warning');
            return;
        }

        const selectedChilds = getSelectedChildItems();
        const countEl = document.getElementById('return-selected-count');
        const listEl = document.getElementById('return-selected-list');
        const reasonInput = document.getElementById('return-selected-reason');

        if (countEl) countEl.innerText = selectedChilds.length;
        if (reasonInput) reasonInput.value = '';

        if (listEl) {
            listEl.innerHTML = selectedChilds.map(c => `
                <div class="p-1 bg-white rounded border border-[#E6EAF0] flex items-center justify-between">
                    <span><strong>${c.scheduleId}</strong> - ${c.unitName}</span>
                    <span class="text-[10px] text-[#ED6C02] font-bold">${c.loaiHinh || 'Lịch lẻ'}</span>
                </div>
            `).join('');
        }

        openModal('modal-return-selected');
    }

    function confirmReturnSelectedSchedules() {
        const reasonInput = document.getElementById('return-selected-reason');
        const reason = (reasonInput?.value || '').trim();

        if (!reason) {
            if (window.showToast) window.showToast('Vui lòng nhập lý do trả lại lịch lẻ!', 'error');
            return;
        }

        const idsArray = Array.from(selectedScheduleIds);
        const detachedCount = MWKDataStore.returnSelectedChildSchedules(idsArray, reason, 'BGĐ Khối KHDN');

        closeModal('modal-return-selected');
        selectedScheduleIds.clear();

        if (window.showToast) {
            window.showToast(`Đã tự động bóc tách thành công ${detachedCount} Lịch phát sinh mới và chuyển trả về bộ phận xử lý!`, 'success');
        }

        renderDashboard();
    }

    function openReturnAllModal(masterId) {
        targetMasterIdForReturn = masterId;
        const masterList = MWKDataStore.getApprovalSchedules();
        const targetMaster = masterList.find(m => m.tongLichId === masterId);

        const idEl = document.getElementById('return-all-master-id');
        const unitEl = document.getElementById('return-all-unit-name');
        const reasonInput = document.getElementById('return-all-reason');

        if (idEl) idEl.innerText = masterId;
        if (unitEl) unitEl.innerText = targetMaster ? targetMaster.unitName : '-';
        if (reasonInput) reasonInput.value = '';

        openModal('modal-return-all');
    }

    function confirmReturnAllMasterSchedule() {
        if (!targetMasterIdForReturn) return;

        const reasonInput = document.getElementById('return-all-reason');
        const reason = (reasonInput?.value || '').trim();

        if (!reason) {
            if (window.showToast) window.showToast('Vui lòng nhập lý do trả lại toàn bộ lịch tổng!', 'error');
            return;
        }

        const success = MWKDataStore.returnAllMasterSchedule(targetMasterIdForReturn, reason, 'BGĐ Khối KHDN');
        closeModal('modal-return-all');

        if (success) {
            if (window.showToast) window.showToast(`Đã trả lại thành công toàn bộ Lịch tổng ${targetMasterIdForReturn}!`, 'success');
        }

        selectedScheduleIds.clear();
        renderDashboard();
    }

    // --- FULL SCHEDULE DETAIL & TIMELINE CONTROLLER ---
    function openScheduleDetail(scheduleId) {
        const masterList = MWKDataStore.getApprovalSchedules();
        let foundChild = null;
        let foundMaster = null;

        masterList.forEach(m => {
            m.childSchedules.forEach(c => {
                if (c.scheduleId === scheduleId) {
                    foundChild = c;
                    foundMaster = m;
                }
            });
        });

        if (!foundChild) return;

        const badgeEl = document.getElementById('detail-modal-code-badge');
        if (badgeEl) badgeEl.innerText = foundChild.scheduleId;

        // Section 1: Schedule Info
        document.getElementById('detail-sch-id').innerText = foundChild.scheduleId;
        document.getElementById('detail-master-id').innerText = foundChild.tongLichId;
        document.getElementById('detail-sch-type').innerText = foundChild.scheduleType || foundChild.loaiHinh || 'Lịch tuần';
        document.getElementById('detail-exam-date').innerText = foundChild.examDate || '-';
        document.getElementById('detail-session').innerText = foundChild.session || 'Sáng (07:30 - 11:30)';
        document.getElementById('detail-quantity').innerText = `${foundChild.quantity || 0} khách`;
        document.getElementById('detail-facility').innerText = foundChild.facility || 'MEDLATEC Ba Đình';
        document.getElementById('detail-pic').innerText = foundChild.personInCharge || 'Nguyễn Văn An';
        document.getElementById('detail-location').innerText = foundChild.diaDiemKham || 'Chưa cập nhật địa điểm';

        // Section 2: Unit Info
        document.getElementById('detail-unit-name').innerText = foundChild.unitName || (foundMaster ? foundMaster.unitName : '-');
        document.getElementById('detail-contact-person').innerText = (foundMaster ? foundMaster.contactPerson : '') || 'Cán bộ kinh doanh';
        document.getElementById('detail-contact-phone').innerText = (foundMaster ? foundMaster.contactPhone : '') || '0900000000';
        document.getElementById('detail-submitted-by').innerText = foundChild.submittedBy || 'Trần Thị Mai (Cán bộ Tổng hợp)';

        // Section 3: Professional Categories & Staff
        const catEl = document.getElementById('detail-categories');
        if (catEl) catEl.innerText = Array.isArray(foundChild.categories) ? foundChild.categories.join(', ') : 'Khám Nội tổng quát, Siêu âm, Lấy mẫu';

        const locEl = document.getElementById('detail-locations');
        if (locEl) locEl.innerText = Array.isArray(foundChild.locations) ? foundChild.locations.join(', ') : 'Tầng 1 - Tiếp đón';

        document.getElementById('detail-staff-count').innerText = foundChild.staffCount || 10;

        // Stepper Visual Status Renderer
        renderDetailStepper(foundChild);

        // Render History Timeline Log
        renderDetailHistoryTimeline(foundChild.history || []);

        openModal('modal-schedule-detail');
    }

    function renderDetailStepper(child) {
        const step1 = document.getElementById('detail-step-1');
        const step2 = document.getElementById('detail-step-2');
        const line = document.getElementById('detail-stepper-line');

        if (!step1 || !step2) return;

        step1.className = 'timeline-step';
        step2.className = 'timeline-step';
        if (line) line.className = 'timeline-line';

        const status = child.status;

        if (status === 'DA_DUYET') {
            step1.classList.add('completed');
            step2.classList.add('completed');
            if (line) line.classList.add('active');
        } else if (status === 'DANG_DUYET_BUOC_2') {
            step1.classList.add('completed');
            step2.classList.add('active');
            if (line) line.classList.add('active');
        } else if (child.isOverdue || status === 'QUA_HAN') {
            step1.classList.add('overdue');
            step2.classList.add('active');
        } else {
            step1.classList.add('active');
        }
    }

    function renderDetailHistoryTimeline(historyList) {
        const container = document.getElementById('detail-history-timeline');
        if (!container) return;

        if (!historyList || historyList.length === 0) {
            container.innerHTML = `<p class="text-center italic text-[#9CA3AF]">Chưa có nhật ký xử lý nào.</p>`;
            return;
        }

        let html = '';
        historyList.forEach(item => {
            html += `
                <div class="p-2.5 bg-[#F8FAFC] rounded border border-[#E6EAF0] flex items-start justify-between gap-3">
                    <div class="space-y-0.5">
                        <div class="flex items-center gap-2">
                            <strong class="text-[#27496D] text-xs">${item.actor || 'Cán bộ'}</strong>
                            <span class="px-1.5 py-0.2 bg-white text-[#374151] border border-[#D9DEE5] rounded text-[10px] font-semibold">${item.action || 'Thao tác'}</span>
                        </div>
                        <p class="text-[#4B5563] text-xs">${item.details || ''}</p>
                    </div>
                    <span class="text-[11px] text-[#6B7280] font-medium flex-shrink-0">${item.timestamp || ''}</span>
                </div>
            `;
        });

        container.innerHTML = html;
    }

    // --- HIS PAGINATION CONTROLLER ---
    function renderPagination(totalRecords) {
        const countText = document.getElementById('pagination-count-text');
        const controls = document.getElementById('pagination-controls');

        if (totalRecords === 0) {
            if (countText) countText.innerText = '0 - 0 trong tổng 0 lịch lẻ';
            if (controls) controls.innerHTML = '';
            return;
        }

        const totalPages = Math.ceil(totalRecords / pageSize);
        const startIndex = (currentPage - 1) * pageSize + 1;
        const endIndex = Math.min(currentPage * pageSize, totalRecords);

        if (countText) countText.innerText = `${startIndex} - ${endIndex} trong tổng ${totalRecords} lịch lẻ`;

        if (!controls) return;
        controls.innerHTML = '';

        // Previous Page Button
        const prevBtn = document.createElement('button');
        prevBtn.type = 'button';
        prevBtn.className = `btn-secondary sys-control-h36 w-9 h-9 p-0 flex items-center justify-center rounded-[4px] ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#F3F6FA]'}`;
        prevBtn.innerHTML = '<i class="fa-solid fa-chevron-left text-xs"></i>';
        prevBtn.disabled = currentPage === 1;
        prevBtn.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                renderTable();
            }
        });
        controls.appendChild(prevBtn);

        // Page Number Buttons
        for (let p = 1; p <= totalPages; p++) {
            if (p === 1 || p === totalPages || (p >= currentPage - 1 && p <= currentPage + 1)) {
                const pageBtn = document.createElement('button');
                pageBtn.type = 'button';
                pageBtn.className = `sys-control-h36 w-9 h-9 text-xs font-semibold rounded-[4px] border flex items-center justify-center ${p === currentPage ? 'bg-[#27496D] text-white border-[#27496D]' : 'bg-white text-[#374151] border-[#D9DEE5] hover:bg-[#F3F6FA]'}`;
                pageBtn.innerText = p;
                pageBtn.addEventListener('click', () => {
                    currentPage = p;
                    renderTable();
                });
                controls.appendChild(pageBtn);
            } else if ((p === 2 && currentPage > 3) || (p === totalPages - 1 && currentPage < totalPages - 2)) {
                const ellipsis = document.createElement('span');
                ellipsis.className = 'px-1 text-[#9CA3AF] text-xs';
                ellipsis.innerText = '...';
                controls.appendChild(ellipsis);
            }
        }

        // Next Page Button
        const nextBtn = document.createElement('button');
        nextBtn.type = 'button';
        nextBtn.className = `btn-secondary sys-control-h36 w-9 h-9 p-0 flex items-center justify-center rounded-[4px] ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#F3F6FA]'}`;
        nextBtn.innerHTML = '<i class="fa-solid fa-chevron-right text-xs"></i>';
        nextBtn.disabled = currentPage === totalPages;
        nextBtn.addEventListener('click', () => {
            if (currentPage < totalPages) {
                currentPage++;
                renderTable();
            }
        });
        controls.appendChild(nextBtn);
    }

    // --- MODAL UTILS ---
    function openModal(id) {
        const el = document.getElementById(id);
        if (el) el.classList.remove('hidden');
    }

    function closeModal(id) {
        const el = document.getElementById(id);
        if (el) el.classList.add('hidden');
    }

    function toggleExpandMaster(masterId) {
        if (expandedMasterIds.has(masterId)) {
            expandedMasterIds.delete(masterId);
        } else {
            expandedMasterIds.add(masterId);
        }
        renderTable();
    }

    // Global Export for inline HTML event handlers
    window.MWKApprovalController = {
        renderDashboard: renderDashboard,
        toggleExpandMaster: toggleExpandMaster,
        openScheduleDetail: openScheduleDetail,
        openReturnAllModal: openReturnAllModal,
        openApproveModal: openApproveModal,
        openReturnSelectedModal: openReturnSelectedModal
    };

    window.closeModal = closeModal;
    window.openModal = openModal;

})(window);
