/**
 * MWK - TỔNG HỢP LỊCH KSK | RECEIVE LIST LOGIC (TIẾP NHẬN LỊCH)
 */
(function(window) {
    let currentPage = 1;
    let pageSize = 10;
    let currentLoaiLichTab = 'Tất cả';
    let selectedReceiveScheduleIds = new Set();

    function initReceiveModule() {
        populateFacilityDropdown();
        bindEvents();
        renderReceiveList();
    }

    function switchLoaiLichTab(tabName) {
        currentLoaiLichTab = tabName;
        const tabs = document.querySelectorAll('.receive-loai-lich-tab');
        tabs.forEach(tab => {
            tab.className = 'receive-loai-lich-tab h-full border-b-2 border-transparent text-[#6B7280] hover:text-[#1F2937] px-1 transition-colors cursor-pointer';
        });

        let activeTabId = 'receive-tab-all';
        if (tabName === 'Lịch tại viện') activeTabId = 'receive-tab-tai-vien';
        else if (tabName === 'Lịch ngoại viện') activeTabId = 'receive-tab-ngoai-vien';
        else if (tabName === 'Lịch phường') activeTabId = 'receive-tab-phuong';

        const activeBtn = document.getElementById(activeTabId);
        if (activeBtn) {
            activeBtn.className = 'receive-loai-lich-tab h-full border-b-2 border-[#27496D] text-[#27496D] font-bold px-1 transition-colors cursor-pointer';
        }

        renderReceiveList();
    }

    function populateFacilityDropdown() {
        const select = document.getElementById('receive-filter-facility');
        if (!select) return;
        const facilities = MWKDataStore.getActiveFacilities();
        select.innerHTML = '<option value="">Tất cả cơ sở</option>';
        facilities.forEach(f => {
            const opt = document.createElement('option');
            opt.value = f.name;
            opt.textContent = f.name;
            select.appendChild(opt);
        });
    }

    function bindEvents() {
        const btnSearch = document.getElementById('btn-receive-search');
        const btnReset = document.getElementById('btn-receive-reset');
        const inputKeyword = document.getElementById('receive-search-keyword');
        const selectFacility = document.getElementById('receive-filter-facility');
        const inputDateFrom = document.getElementById('receive-filter-date-from');
        const inputDateTo = document.getElementById('receive-filter-date-to');
        const selectScheduleForm = document.getElementById('receive-filter-schedule-form');
        const selectStatus = document.getElementById('receive-filter-status');

        if (btnSearch) btnSearch.addEventListener('click', renderReceiveList);
        if (btnReset) btnReset.addEventListener('click', resetFilters);
        if (inputKeyword) inputKeyword.addEventListener('input', renderReceiveList);
        if (selectFacility) selectFacility.addEventListener('change', renderReceiveList);
        if (inputDateFrom) inputDateFrom.addEventListener('change', renderReceiveList);
        if (inputDateTo) inputDateTo.addEventListener('change', renderReceiveList);
        if (selectScheduleForm) selectScheduleForm.addEventListener('change', renderReceiveList);
        if (selectStatus) selectStatus.addEventListener('change', renderReceiveList);

        const btnConfirmReturn = document.getElementById('btn-confirm-return');
        if (btnConfirmReturn) {
            btnConfirmReturn.addEventListener('click', submitReturnSchedule);
        }

        window.addEventListener('mwk_ksk_schedules_changed', function() {
            renderReceiveList();
        });
    }

    function resetFilters() {
        currentLoaiLichTab = 'Tất cả';
        switchLoaiLichTab('Tất cả');

        const inputKeyword = document.getElementById('receive-search-keyword');
        const selectFacility = document.getElementById('receive-filter-facility');
        const inputDateFrom = document.getElementById('receive-filter-date-from');
        const inputDateTo = document.getElementById('receive-filter-date-to');
        const selectScheduleForm = document.getElementById('receive-filter-schedule-form');
        const selectStatus = document.getElementById('receive-filter-status');

        if (inputKeyword) inputKeyword.value = '';
        if (selectFacility) selectFacility.value = '';
        if (inputDateFrom) inputDateFrom.value = '';
        if (inputDateTo) inputDateTo.value = '';
        if (selectScheduleForm) selectScheduleForm.value = '';
        if (selectStatus) selectStatus.value = '';

        selectedReceiveScheduleIds.clear();
        renderReceiveList();
    }

    // ONLY FETCH SCHEDULES IN PENDING STATUS (CHO_TONG_HOP) FOR TAB 1
    function getPendingReceiveItems() {
        const allSchedules = MWKDataStore.getKskSchedules();
        
        return allSchedules.filter(item => {
            const isPendingStatus = item.status === 'Chờ tổng hợp' || item.status === 'CHO_TONG_HOP' || item.trangThai === 'CHO_TONG_HOP' || item.daGuiTongHop === true;
            const notCompletedOrApproved = item.status !== 'Đã duyệt' && item.trangThai !== 'DA_DUYET_TONG_HOP' && item.status !== 'Hoàn thành' && item.status !== 'Nháp' && item.status !== 'Trả lại' && item.trangThai !== 'TRA_CHINH_SUA' && item.trangThai !== 'DA_GOM_LICH_TUAN';
            return isPendingStatus && notCompletedOrApproved;
        });
    }

    function renderReceiveList() {
        const leftBody = document.getElementById('receive-grid-left-body');
        const centerBody = document.getElementById('receive-grid-center-body');
        const rightBody = document.getElementById('receive-grid-right-body');
        if (!leftBody || !centerBody || !rightBody) return;

        const keyword = (document.getElementById('receive-search-keyword')?.value || '').trim().toLowerCase();
        const facility = document.getElementById('receive-filter-facility')?.value || '';
        const dateFrom = document.getElementById('receive-filter-date-from')?.value || '';
        const dateTo = document.getElementById('receive-filter-date-to')?.value || '';
        const scheduleForm = document.getElementById('receive-filter-schedule-form')?.value || '';
        const status = document.getElementById('receive-filter-status')?.value || '';

        const pendingItems = getPendingReceiveItems();

        const filtered = pendingItems.filter(item => {
            const matchKeyword = !keyword || 
                (item.code && item.code.toLowerCase().includes(keyword)) ||
                (item.teamName && item.teamName.toLowerCase().includes(keyword)) ||
                (item.customerName && item.customerName.toLowerCase().includes(keyword)) ||
                (item.contactPerson && item.contactPerson.toLowerCase().includes(keyword));

            const matchTab = currentLoaiLichTab === 'Tất cả' || item.loaiLich === currentLoaiLichTab;
            const matchFacility = !facility || item.facility === facility;
            const matchDateFrom = !dateFrom || (item.examDate && item.examDate >= dateFrom);
            const matchDateTo = !dateTo || (item.examDate && item.examDate <= dateTo);
            const matchScheduleForm = !scheduleForm || item.scheduleForm === scheduleForm;
            const matchStatus = !status || (item.status === status || item.trangThai === status);

            return matchKeyword && matchTab && matchFacility && matchDateFrom && matchDateTo && matchScheduleForm && matchStatus;
        });

        const countNumElem = document.getElementById('receive-count-num');
        if (countNumElem) countNumElem.innerText = filtered.length;

        const receiveTabBadge = document.getElementById('receive-tab-badge');
        if (receiveTabBadge) receiveTabBadge.innerText = pendingItems.length;

        leftBody.innerHTML = '';
        centerBody.innerHTML = '';
        rightBody.innerHTML = '';

        const total = filtered.length;
        if (total === 0) {
            leftBody.innerHTML = '';
            rightBody.innerHTML = '';
            centerBody.innerHTML = `
                <div class="flex flex-col items-center justify-center py-12 text-[#9CA3AF] w-full">
                    <i class="fa-solid fa-inbox text-4xl mb-3 text-[#CBD5E1]"></i>
                    <p class="font-medium text-sm text-[#4B5563]">Không tìm thấy lịch khám chờ tiếp nhận</p>
                    <p class="text-xs text-[#9CA3AF] mt-1">Các lịch khám được gửi từ Lịch khám đơn vị sẽ hiển thị tại đây</p>
                </div>
            `;
            renderReceivePagination(0, 0, 0);
            updateReceiveActionBarState();
            return;
        }

        const totalPages = Math.ceil(total / pageSize);
        if (currentPage > totalPages) currentPage = totalPages;
        const startIdx = (currentPage - 1) * pageSize;
        const endIdx = Math.min(startIdx + pageSize, total);
        const pageItems = filtered.slice(startIdx, endIdx);

        let leftRowsHtml = '';
        let centerRowsHtml = '';
        let rightRowsHtml = '';

        pageItems.forEach((item, index) => {
            const rowIndex = index;
            const stt = startIdx + index + 1;
            const isChecked = selectedReceiveScheduleIds.has(item.id);

            const tenDonVi = item.tenDonVi || item.customerName || item.teamName || '-';
            const isPakd = item.pakd === true || item.isPakd === true || item.pakd === 'true';
            const maDoiTuong = item.code || item.maDoiTuong || item.maLich || '-';
            
            const loaiLichStr = item.loaiLich || item.scheduleForm || 'Lịch tại viện';
            const slKhach = item.soLuongKhach || item.estimatedCount || item.soLuong || 0;
            const tongNhanSu = item.tongNhanSu || item.staffCount || (item.categories ? item.categories.length * 2 : 4);
            const diaChi = item.examLocation || item.diaChi || item.facility || '-';
            const thoiGianKham = formatExamDateRange(item);
            const nguoiTao = item.personInCharge || item.cbPhuTrach || item.nguoiTao || 'Nguyễn Văn An';

            // 1. Grid Left Row (Checkbox bound to item.id)
            leftRowsHtml += `
                <div class="grid-row" data-row-index="${rowIndex}" onmouseenter="setRowHover(${rowIndex}, true)" onmouseleave="setRowHover(${rowIndex}, false)">
                    <div class="cell w-[48px] justify-center">
                        <input type="checkbox" value="${item.id}" ${isChecked ? 'checked' : ''} onchange="MWKReceive.toggleReceiveRowSelect(${item.id}, this)" class="receive-row-checkbox w-4 h-4 text-[#27496D] rounded-[2px] border-[#D9DEE5] cursor-pointer">
                    </div>
                    <div class="cell w-[60px] justify-center text-[#6B7280] font-medium">${stt}</div>
                    <div class="cell w-[280px] font-bold text-[#1F2937] truncate" title="${tenDonVi}">${tenDonVi}</div>
                </div>
            `;

            // 2. Grid Center Row
            centerRowsHtml += `
                <div class="grid-row" data-row-index="${rowIndex}" onmouseenter="setRowHover(${rowIndex}, true)" onmouseleave="setRowHover(${rowIndex}, false)">
                    <div class="cell w-[80px] justify-center">${isPakd ? '<i class="fa-solid fa-check text-[#6B7280] text-sm"></i>' : '-'}</div>
                    <div class="cell w-[140px] font-mono text-[#27496D] font-medium truncate" title="${maDoiTuong}">${maDoiTuong}</div>
                    <div class="cell w-[160px]">
                        <a href="receive/receive-detail.html?id=${item.id}" class="text-[#27496D] hover:underline font-semibold truncate" title="${loaiLichStr}">${loaiLichStr}</a>
                    </div>
                    <div class="cell w-[120px] justify-end font-bold text-[#1F2937]">${slKhach}</div>
                    <div class="cell w-[120px] justify-end font-medium text-[#374151]">${tongNhanSu}</div>
                    <div class="cell w-[360px] text-[#374151] truncate" title="${diaChi}">${diaChi}</div>
                    <div class="cell w-[220px] justify-center text-[#374151] font-medium">${thoiGianKham}</div>
                    <div class="cell w-[180px] text-[#374151] truncate" title="${nguoiTao}">${nguoiTao}</div>
                </div>
            `;

            // 3. Grid Right Row
            rightRowsHtml += `
                <div class="grid-row" data-row-index="${rowIndex}" onmouseenter="setRowHover(${rowIndex}, true)" onmouseleave="setRowHover(${rowIndex}, false)">
                    <div class="cell w-full justify-center px-1">
                        <div class="flex items-center justify-center gap-1.5">
                            <a href="receive/receive-detail.html?id=${item.id}" class="w-7 h-7 rounded-[4px] border border-[#D9DEE5] bg-white text-[#27496D] hover:bg-[#E8F1FB] flex items-center justify-center transition-colors shadow-2xs" title="Xem chi tiết thông tin lịch">
                                <i class="fa-regular fa-eye text-xs"></i>
                            </a>
                            <a href="receive/receive-edit.html?id=${item.id}" class="w-7 h-7 rounded-[4px] border border-[#D9DEE5] bg-white text-[#ED6C02] hover:bg-[#FFF3E0] flex items-center justify-center transition-colors shadow-2xs" title="Hiệu chỉnh thông tin chung">
                                <i class="fa-regular fa-pen-to-square text-xs"></i>
                            </a>
                            <button type="button" onclick="MWKReceive.openReturnModalForSingle(${item.id})" class="w-7 h-7 rounded-[4px] border border-[#D9DEE5] bg-white text-[#D32F2F] hover:bg-[#FDECEC] flex items-center justify-center transition-colors shadow-2xs cursor-pointer" title="Trả về Lịch khám đơn vị">
                                <i class="fa-solid fa-rotate-left text-xs"></i>
                            </button>
                            <button type="button" onclick="MWKReceive.approveSingleSchedule(${item.id})" class="w-7 h-7 rounded-[4px] border border-[#D9DEE5] bg-white text-[#2E7D32] hover:bg-[#E6F4EA] flex items-center justify-center transition-colors shadow-2xs cursor-pointer" title="Duyệt đưa vào Lịch tuần">
                                <i class="fa-solid fa-circle-check text-xs"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        });

        leftBody.innerHTML = leftRowsHtml;
        centerBody.innerHTML = centerRowsHtml;
        rightBody.innerHTML = rightRowsHtml;

        setupScrollSync();
        renderReceivePagination(total, startIdx + 1, endIdx);
        updateReceiveActionBarState();
    }

    function toggleReceiveRowSelect(id, checkbox) {
        if (checkbox.checked) {
            selectedReceiveScheduleIds.add(id);
        } else {
            selectedReceiveScheduleIds.delete(id);
        }
        updateReceiveActionBarState();
    }

    function toggleSelectAll(masterCheckbox) {
        const isChecked = masterCheckbox.checked;
        const pageCheckboxes = document.querySelectorAll('.receive-row-checkbox');
        pageCheckboxes.forEach(cb => {
            cb.checked = isChecked;
            const id = parseInt(cb.value);
            if (isChecked) {
                selectedReceiveScheduleIds.add(id);
            } else {
                selectedReceiveScheduleIds.delete(id);
            }
        });
        updateReceiveActionBarState();
    }

    function updateReceiveActionBarState() {
        const badge = document.getElementById('receive-selected-count-badge');
        const numElem = document.getElementById('receive-selected-count-num');
        const btnApprove = document.getElementById('btn-receive-approve-selected');
        const btnReturn = document.getElementById('btn-receive-return-selected');
        const masterCb = document.getElementById('receive-select-all-checkbox');

        const count = selectedReceiveScheduleIds.size;

        if (numElem) numElem.innerText = count;

        if (count > 0) {
            if (badge) badge.classList.remove('hidden');
            if (btnApprove) {
                btnApprove.disabled = false;
                btnApprove.className = 'btn-primary text-xs cursor-pointer bg-[#2E7D32] hover:bg-[#1B5E20] border-[#2E7D32] text-white';
            }
            if (btnReturn) {
                btnReturn.disabled = false;
                btnReturn.className = 'btn-danger text-xs cursor-pointer bg-[#D32F2F] hover:bg-[#C62828] text-white';
            }
        } else {
            if (badge) badge.classList.add('hidden');
            if (btnApprove) {
                btnApprove.disabled = true;
                btnApprove.className = 'btn-secondary text-xs opacity-50 cursor-not-allowed text-[#2E7D32] border-[#A5D6A7]';
            }
            if (btnReturn) {
                btnReturn.disabled = true;
                btnReturn.className = 'btn-secondary text-xs opacity-50 cursor-not-allowed text-[#D32F2F] border-[#F5B5B5]';
            }
        }

        if (masterCb) {
            const pageCheckboxes = document.querySelectorAll('.receive-row-checkbox');
            if (pageCheckboxes.length > 0) {
                const allChecked = Array.from(pageCheckboxes).every(cb => cb.checked);
                masterCb.checked = allChecked;
            } else {
                masterCb.checked = false;
            }
        }
    }

    function setupScrollSync() {
        const leftBody = document.getElementById('receive-grid-left-body');
        const centerBody = document.getElementById('receive-grid-center-body');
        const rightBody = document.getElementById('receive-grid-right-body');

        if (!leftBody || !centerBody || !rightBody) return;

        let isSyncing = false;

        const syncScroll = (source) => {
            if (isSyncing) return;
            isSyncing = true;
            const scrollTop = source.scrollTop;
            if (source !== leftBody) leftBody.scrollTop = scrollTop;
            if (source !== centerBody) centerBody.scrollTop = scrollTop;
            if (source !== rightBody) rightBody.scrollTop = scrollTop;
            requestAnimationFrame(() => { isSyncing = false; });
        };

        leftBody.onscroll = () => syncScroll(leftBody);
        centerBody.onscroll = () => syncScroll(centerBody);
        rightBody.onscroll = () => syncScroll(rightBody);
    }

    window.setRowHover = function(rowIndex, isHover) {
        const rows = document.querySelectorAll(`[data-row-index="${rowIndex}"]`);
        rows.forEach(r => {
            if (isHover) {
                r.classList.add('is-hovered');
            } else {
                r.classList.remove('is-hovered');
            }
        });
    };

    function renderReceivePagination(total, start, end) {
        const container = document.getElementById('receive-pagination-container');
        if (!container) return;

        if (total === 0) {
            container.innerHTML = '';
            return;
        }

        const totalPages = Math.ceil(total / pageSize);

        let html = `
            <div class="p-3 border-t border-[#D9DEE5] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs bg-white">
                <div class="flex items-center gap-2 text-[#4B5563]">
                    <span>Hiển thị</span>
                    <select onchange="MWKReceive.changePageSize(this.value)" class="h-8 px-2 bg-white border border-[#D9DEE5] rounded-[4px] text-xs text-[#1F2937] font-medium focus:outline-none focus:border-[#27496D] cursor-pointer">
                        <option value="10" ${pageSize === 10 ? 'selected' : ''}>10</option>
                        <option value="20" ${pageSize === 20 ? 'selected' : ''}>20</option>
                        <option value="50" ${pageSize === 50 ? 'selected' : ''}>50</option>
                        <option value="100" ${pageSize === 100 ? 'selected' : ''}>100</option>
                    </select>
                    <span>bản ghi.</span>
                    <span class="font-medium text-[#4B5563] ml-2">
                        ${start}-${end} trong tổng ${total}
                    </span>
                </div>
                <div class="flex items-center gap-1">
                    <button type="button" onclick="MWKReceive.goToPage(1)" ${currentPage === 1 ? 'disabled' : ''} class="h-8 w-8 flex items-center justify-center text-[#4B5563] hover:text-[#1F2937] hover:bg-[#F3F6FA] rounded-[4px] disabled:opacity-30 cursor-pointer transition-colors" title="Trang đầu">
                        <i class="fa-solid fa-angles-left text-[11px]"></i>
                    </button>
                    <button type="button" onclick="MWKReceive.goToPage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''} class="h-8 w-8 flex items-center justify-center text-[#4B5563] hover:text-[#1F2937] hover:bg-[#F3F6FA] rounded-[4px] disabled:opacity-30 cursor-pointer transition-colors" title="Trang trước">
                        <i class="fa-solid fa-chevron-left text-[11px]"></i>
                    </button>
        `;

        for (let i = 1; i <= totalPages; i++) {
            if (i === currentPage) {
                html += `<button type="button" class="h-8 min-w-[32px] px-2.5 bg-white border border-[#27496D] text-[#27496D] font-bold rounded-[4px] cursor-pointer flex items-center justify-center">${i}</button>`;
            } else if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
                html += `<button type="button" onclick="MWKReceive.goToPage(${i})" class="h-8 min-w-[32px] px-2.5 text-[#374151] hover:bg-[#F3F6FA] font-medium rounded-[4px] cursor-pointer flex items-center justify-center transition-colors">${i}</button>`;
            } else if (i === currentPage - 2 || i === currentPage + 2) {
                html += `<span class="px-1.5 text-[#9CA3AF]">...</span>`;
            }
        }

        html += `
                    <button type="button" onclick="MWKReceive.goToPage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''} class="h-8 w-8 flex items-center justify-center text-[#4B5563] hover:text-[#1F2937] hover:bg-[#F3F6FA] rounded-[4px] disabled:opacity-30 cursor-pointer transition-colors" title="Trang sau">
                        <i class="fa-solid fa-chevron-right text-[11px]"></i>
                    </button>
                    <button type="button" onclick="MWKReceive.goToPage(${totalPages})" ${currentPage === totalPages ? 'disabled' : ''} class="h-8 w-8 flex items-center justify-center text-[#4B5563] hover:text-[#1F2937] hover:bg-[#F3F6FA] rounded-[4px] disabled:opacity-30 cursor-pointer transition-colors" title="Trang cuối">
                        <i class="fa-solid fa-angles-right text-[11px]"></i>
                    </button>
                </div>
            </div>
        `;

        container.innerHTML = html;
    }

    // --- APPROVAL LOGIC (PER SELECTED SCHEDULE IDS) ---
    function approveSingleSchedule(id) {
        selectedReceiveScheduleIds.clear();
        selectedReceiveScheduleIds.add(id);
        approveSelectedSchedules();
    }

    function approveSelectedSchedules() {
        if (selectedReceiveScheduleIds.size === 0) {
            const warnMsg = 'Vui lòng chọn ít nhất một lịch để duyệt.';
            if (window.showToast) window.showToast(warnMsg, 'error');
            else alert(warnMsg);
            return;
        }

        const selectedItems = Array.from(selectedReceiveScheduleIds)
            .map(id => MWKDataStore.getKskScheduleById(id))
            .filter(Boolean);

        const countElem = document.getElementById('approve-confirm-count');
        const listElem = document.getElementById('approve-confirm-list');

        if (countElem) countElem.innerText = selectedItems.length;
        if (listElem) {
            listElem.innerHTML = selectedItems.map(item => `
                <div class="flex items-center justify-between py-1 border-b border-[#E6EAF0] last:border-0">
                    <span class="font-bold text-[#27496D]">${item.code || item.maLich || 'LK-CON'}</span>
                    <span class="text-[#1F2937] font-semibold">${item.customerName || item.teamName}</span>
                    <span class="text-[#2E7D32]">${item.estimatedCount || item.soLuong || 0} khách</span>
                </div>
            `).join('');
        }

        const modal = document.getElementById('modal-approve-confirm');
        if (modal) modal.classList.remove('hidden');
    }

    function closeApproveModal() {
        const modal = document.getElementById('modal-approve-confirm');
        if (modal) modal.classList.add('hidden');
    }

    function confirmApproveSelected() {
        if (selectedReceiveScheduleIds.size === 0) return;

        const count = selectedReceiveScheduleIds.size;
        selectedReceiveScheduleIds.forEach(id => {
            const item = MWKDataStore.getKskScheduleById(id);
            if (item && item.step2Data) {
                ['taiVien', 'ngoaiVien', 'lichPhuong'].forEach(key => {
                    if (Array.isArray(item.step2Data[key])) {
                        item.step2Data[key].forEach(child => {
                            child.trangThai = 'DA_TONG_HOP';
                            child.status = 'Đã tổng hợp';
                        });
                    }
                });
            }
            MWKDataStore.updateKskSchedule(id, {
                status: 'Đã tổng hợp',
                trangThai: 'DA_TONG_HOP',
                daGuiTongHop: true,
                ngayDuyetTongHop: new Date().toISOString(),
                nguoiTongHop: 'Trần Thị Mai (Cán bộ Tổng hợp)',
                step2Data: item ? item.step2Data : undefined
            }, 'Trần Thị Mai (Cán bộ Tổng hợp)');
        });

        closeApproveModal();
        selectedReceiveScheduleIds.clear();

        if (window.showToast) {
            window.showToast(`Đã duyệt thành công ${count} lịch khám! Các lịch đã chọn được đưa vào Tổng hợp lịch tuần.`, 'success');
        }

        renderReceiveList();
    }

    // --- RETURN LOGIC (PER SELECTED SCHEDULE IDS) ---
    function openReturnModalForSingle(id) {
        selectedReceiveScheduleIds.clear();
        selectedReceiveScheduleIds.add(id);
        returnSelectedSchedules();
    }

    function returnSelectedSchedules() {
        if (selectedReceiveScheduleIds.size === 0) {
            const warnMsg = 'Vui lòng chọn ít nhất một lịch để trả lại.';
            if (window.showToast) window.showToast(warnMsg, 'error');
            else alert(warnMsg);
            return;
        }

        const selectedItems = Array.from(selectedReceiveScheduleIds)
            .map(id => MWKDataStore.getKskScheduleById(id))
            .filter(Boolean);

        const countElem = document.getElementById('return-confirm-count');
        const listElem = document.getElementById('return-confirm-list');
        const reasonInput = document.getElementById('return-reason-input');

        if (countElem) countElem.innerText = selectedItems.length;
        if (reasonInput) reasonInput.value = '';

        if (listElem) {
            listElem.innerHTML = selectedItems.map(item => `
                <div class="flex items-center justify-between py-1 border-b border-[#E6EAF0] last:border-0">
                    <span class="font-bold text-[#D32F2F]">${item.code || item.maLich || 'LK-CON'}</span>
                    <span class="text-[#1F2937] font-semibold">${item.customerName || item.teamName}</span>
                </div>
            `).join('');
        }

        const modal = document.getElementById('modal-return-schedule');
        if (modal) modal.classList.remove('hidden');
    }

    function closeReturnModal() {
        const modal = document.getElementById('modal-return-schedule');
        if (modal) modal.classList.add('hidden');
    }

    function submitReturnSchedule() {
        if (selectedReceiveScheduleIds.size === 0) return;

        const reasonInput = document.getElementById('return-reason-input');
        const reason = reasonInput ? reasonInput.value.trim() : '';

        if (!reason) {
            if (window.showToast) window.showToast('Vui lòng nhập lý do trả lại lịch!', 'error');
            else alert('Vui lòng nhập lý do trả lại lịch!');
            return;
        }

        const count = selectedReceiveScheduleIds.size;
        selectedReceiveScheduleIds.forEach(id => {
            const item = MWKDataStore.getKskScheduleById(id);
            if (item) {
                if (item.step2Data) {
                    ['taiVien', 'ngoaiVien', 'lichPhuong'].forEach(typeKey => {
                        const list = item.step2Data[typeKey];
                        if (Array.isArray(list)) {
                            list.forEach(child => {
                                child.trangThai = 'TRA_LAI';
                                child.status = 'Trả lại';
                                child.lyDoTra = reason;
                                child.ngayTra = new Date().toISOString();
                                child.nguoiTra = 'Trần Thị Mai (Cán bộ Tổng hợp)';
                            });
                        }
                    });
                }
                if (Array.isArray(item.childSchedules)) {
                    item.childSchedules.forEach(child => {
                        child.trangThai = 'TRA_LAI';
                        child.status = 'Trả lại';
                        child.lyDoTra = reason;
                        child.ngayTra = new Date().toISOString();
                        child.nguoiTra = 'Trần Thị Mai (Cán bộ Tổng hợp)';
                    });
                }
                MWKDataStore.updateKskSchedule(id, {
                    step2Data: item.step2Data,
                    childSchedules: item.childSchedules,
                    status: 'Trả lại',
                    trangThai: 'TRA_LAI',
                    daGuiTongHop: false,
                    lyDoTra: reason,
                    ngayTra: new Date().toISOString(),
                    nguoiTra: 'Trần Thị Mai (Cán bộ Tổng hợp)'
                }, 'Trần Thị Mai (Cán bộ Tổng hợp)');
            }
        });

        closeReturnModal();
        selectedReceiveScheduleIds.clear();

        if (window.showToast) {
            window.showToast(`Đã trả lại ${count} lịch về cho Cán bộ tạo lịch thành công!`, 'success');
        }

        renderReceiveList();
    }

    function openQuickViewModal(id) {
        const item = MWKDataStore.getKskScheduleById(id);
        if (!item) return;

        const container = document.getElementById('quick-view-content');
        if (!container) return;

        let categoriesHtml = (item.categories || []).map(c => `<span class="px-2.5 py-1 bg-sky-50 text-sky-700 rounded-lg font-medium text-xs border border-sky-200">${c}</span>`).join('');

        container.innerHTML = `
            <div class="space-y-4">
                <div class="p-3 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-2 gap-3">
                    <div><span class="text-slate-400 font-medium">Mã lịch:</span> <strong class="text-sky-700">${item.code}</strong></div>
                    <div><span class="text-slate-400 font-medium">Tên đoàn:</span> <strong class="text-slate-800">${item.teamName}</strong></div>
                    <div><span class="text-slate-400 font-medium">Khách hàng:</span> <span class="text-slate-700 font-medium">${item.customerName || '-'}</span></div>
                    <div><span class="text-slate-400 font-medium">Người liên hệ:</span> <span class="text-slate-700 font-medium">${item.contactPerson || '-'} (${item.contactPhone || '-'})</span></div>
                </div>

                <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div><span class="block text-slate-400 font-medium">Ngày khám:</span> <strong>${item.examDate}</strong></div>
                    <div><span class="block text-slate-400 font-medium">Buổi & Khung giờ:</span> <strong>${item.session || 'Sáng'} (${item.startTime || '07:30'} - ${item.endTime || '11:30'})</strong></div>
                    <div><span class="block text-slate-400 font-medium">Số lượng dự kiến:</span> <strong class="text-emerald-700">${item.estimatedCount || 0} người</strong></div>
                    <div><span class="block text-slate-400 font-medium">Loại lịch:</span> <span class="font-semibold text-slate-700">${item.loaiLich || '-'}</span></div>
                    <div><span class="block text-slate-400 font-medium">Cơ sở thực hiện:</span> <span class="font-semibold text-slate-700">${item.facility || '-'}</span></div>
                    <div><span class="block text-slate-400 font-medium">CB phụ trách:</span> <span class="font-semibold text-slate-700">${item.personInCharge || '-'}</span></div>
                </div>

                <div>
                    <span class="block text-slate-400 font-medium mb-1">Địa điểm khám cụ thể:</span>
                    <p class="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-slate-800">${item.examLocation || 'Tại cơ sở'}</p>
                </div>

                <div>
                    <span class="block text-slate-400 font-medium mb-1.5">Danh mục khám:</span>
                    <div class="flex flex-wrap gap-2">${categoriesHtml || '<span class="text-slate-400 italic">Chưa chọn danh mục</span>'}</div>
                </div>

                <div>
                    <span class="block text-slate-400 font-medium mb-1">Ghi chú yêu cầu riêng:</span>
                    <p class="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-slate-700 italic">${item.requestNote || 'Không có ghi chú riêng.'}</p>
                </div>
            </div>
        `;

        const modal = document.getElementById('modal-quick-view');
        if (modal) modal.classList.remove('hidden');
    }

    function closeQuickViewModal() {
        const modal = document.getElementById('modal-quick-view');
        if (modal) modal.classList.add('hidden');
    }

    function formatExamDateRange(item) {
        if (!item || !item.examDate) return '-';
        let formattedDate = item.examDate;
        if (formattedDate.includes('-')) {
            const parts = formattedDate.split('-');
            if (parts.length === 3) formattedDate = `${parts[2]}/${parts[1]}/${parts[0]}`;
        }
        const session = item.session ? ` (${item.session})` : '';
        return `${formattedDate}${session}`;
    }

    window.MWKReceive = {
        init: initReceiveModule,
        switchLoaiLichTab: switchLoaiLichTab,
        renderReceiveList: renderReceiveList,
        changePageSize: function(val) {
            pageSize = parseInt(val) || 20;
            currentPage = 1;
            renderReceiveList();
        },
        goToPage: function(page) {
            currentPage = page;
            renderReceiveList();
        },
        toggleSelectAll: toggleSelectAll,
        toggleReceiveRowSelect: toggleReceiveRowSelect,
        approveSingleSchedule: approveSingleSchedule,
        approveSelectedSchedules: approveSelectedSchedules,
        closeApproveModal: closeApproveModal,
        confirmApproveSelected: confirmApproveSelected,
        openReturnModalForSingle: openReturnModalForSingle,
        returnSelectedSchedules: returnSelectedSchedules,
        closeReturnModal: closeReturnModal,
        submitReturnSchedule: submitReturnSchedule,
        openQuickViewModal: openQuickViewModal,
        closeQuickViewModal: closeQuickViewModal
    };

    window.closeReturnModal = closeReturnModal;
    window.closeQuickViewModal = closeQuickViewModal;
})(window);
