/**
 * MWK - TỔNG HỢP LỊCH KSK | WEEKLY SUMMARY LOGIC (TỔNG HỢP LỊCH TUẦN)
 */
(function(window) {
    let selectedApprovedIds = new Set();

    function initWeeklyModule() {
        populateYearDropdown();
        populateWeekDropdown();
        populateFacilityDropdown();
        bindEvents();
        renderApprovedSchedulesTable();
        renderWeeklySummary();
    }

    function populateYearDropdown() {
        const select = document.getElementById('weekly-filter-year');
        if (!select) return;
        const currentYear = new Date().getFullYear();
        select.innerHTML = '';
        for (let y = currentYear + 1; y >= currentYear - 1; y--) {
            const opt = document.createElement('option');
            opt.value = y;
            opt.textContent = y;
            if (y === currentYear) opt.selected = true;
            select.appendChild(opt);
        }
    }

    function populateWeekDropdown() {
        const select = document.getElementById('weekly-filter-week');
        if (!select) return;

        const currentYear = parseInt(document.getElementById('weekly-filter-year')?.value || new Date().getFullYear());
        const currentWeekInfo = MWKWeekHelper.getWeekNumber(new Date());

        select.innerHTML = '<option value="">-- Tất cả các tuần --</option>';

        for (let w = 1; w <= 52; w++) {
            const dateRange = MWKWeekHelper.getWeekDatesRange(w, currentYear);
            const opt = document.createElement('option');
            opt.value = w;
            opt.textContent = `Tuần ${w} (${dateRange})`;
            if (w === currentWeekInfo.week && currentYear === currentWeekInfo.year) {
                opt.selected = true;
            }
            select.appendChild(opt);
        }
    }

    function populateFacilityDropdown() {
        const select = document.getElementById('weekly-filter-facility');
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
        const btnFilter = document.getElementById('btn-weekly-filter');
        const btnReset = document.getElementById('btn-weekly-reset');
        const selectYear = document.getElementById('weekly-filter-year');
        const selectWeek = document.getElementById('weekly-filter-week');
        const selectFacility = document.getElementById('weekly-filter-facility');

        if (btnFilter) btnFilter.addEventListener('click', renderWeeklySummary);
        if (btnReset) btnReset.addEventListener('click', resetWeeklyFilters);
        if (selectYear) {
            selectYear.addEventListener('change', function() {
                populateWeekDropdown();
                renderWeeklySummary();
            });
        }
        if (selectWeek) selectWeek.addEventListener('change', renderWeeklySummary);
        if (selectFacility) selectFacility.addEventListener('change', renderWeeklySummary);

        window.addEventListener('mwk_ksk_schedules_changed', function() {
            renderApprovedSchedulesTable();
            renderWeeklySummary();
        });
        window.addEventListener('mwk_weekly_schedules_changed', function() {
            renderWeeklySummary();
        });
    }

    function resetWeeklyFilters() {
        populateYearDropdown();
        populateWeekDropdown();
        const selectFacility = document.getElementById('weekly-filter-facility');
        if (selectFacility) selectFacility.value = '';
        renderWeeklySummary();
    }

    // --- KHU VỰC A: DANH SÁCH LỊCH ĐÃ DUYỆT (CHỜ GOM LỊCH TUẦN) ---
    function getApprovedSchedulesOnly() {
        const allSchedules = MWKDataStore.getKskSchedules();
        return allSchedules.filter(item => {
            const isApproved = item.status === 'Đã duyệt' || item.trangThai === 'DA_DUYET_TONG_HOP';
            const notYetGrouped = item.status !== 'Đã gom lịch tuần' && item.trangThai !== 'DA_GOM_LICH_TUAN';
            return isApproved && notYetGrouped;
        });
    }

    function renderApprovedSchedulesTable() {
        const tbody = document.getElementById('approved-schedules-tbody');
        if (!tbody) return;

        const items = getApprovedSchedulesOnly();
        const countBadge = document.getElementById('approved-selected-count');
        if (countBadge) countBadge.innerText = `${selectedApprovedIds.size} / ${items.length}`;

        tbody.innerHTML = '';

        if (items.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="12" class="p-6 text-center text-[#9CA3AF] italic text-xs">
                        Không có lịch đã duyệt nào chờ tổng hợp thành lịch tuần
                    </td>
                </tr>
            `;
            return;
        }

        let html = '';
        items.forEach((item, index) => {
            const stt = index + 1;
            const isChecked = selectedApprovedIds.has(item.id);
            const codeStr = item.code || item.maLich || `LK-2026-${item.id}`;
            const nameStr = item.customerName || item.teamName || '-';

            const { week, year } = MWKWeekHelper.getWeekNumber(item.examDate);
            const dateRange = MWKWeekHelper.getWeekDatesRange(week, year);

            let formattedDate = item.examDate || '-';
            if (formattedDate.includes('-')) {
                const parts = formattedDate.split('-');
                if (parts.length === 3) formattedDate = `${parts[2]}/${parts[1]}/${parts[0]}`;
            }

            const nguonLich = item.scheduleForm || item.nguonLich || 'Lịch tuần';
            const isLichTuan = nguonLich === 'Lịch tuần';

            html += `
                <tr class="hover:bg-[#F9FAFB] transition-colors">
                    <td class="p-2.5 text-center">
                        <input type="checkbox" value="${item.id}" ${isChecked ? 'checked' : ''} onchange="MWKWeekly.toggleApprovedRowSelect(${item.id}, this)" class="w-4 h-4 text-[#27496D] rounded-[2px] border-[#D9DEE5] cursor-pointer">
                    </td>
                    <td class="p-2.5 text-center font-medium text-[#6B7280]">${stt}</td>
                    <td class="p-2.5 font-mono font-bold text-[#27496D]">${codeStr}</td>
                    <td class="p-2.5 font-bold text-[#1F2937]">${nameStr}</td>
                    <td class="p-2.5 font-semibold text-[#1F2937]">${formattedDate}</td>
                    <td class="p-2.5">
                        <span class="px-2 py-0.5 bg-[#E8F1FB] text-[#27496D] rounded-[4px] font-bold text-[11px] border border-[#B3CDE6]">
                            Tuần ${week} (${dateRange})
                        </span>
                    </td>
                    <td class="p-2.5 font-medium text-[#374151]">${item.session || 'Sáng'}</td>
                    <td class="p-2.5 text-right font-bold text-[#2E7D32]">${item.estimatedCount || item.soLuong || 0}</td>
                    <td class="p-2.5">
                        <span class="px-2 py-0.5 rounded-[4px] font-bold text-[11px] border ${isLichTuan ? 'bg-[#E6F4EA] text-[#2E7D32] border-[#A5D6A7]' : 'bg-[#FFF3E0] text-[#ED6C02] border-[#FFCC80]'}">
                            ${nguonLich}
                        </span>
                    </td>
                    <td class="p-2.5 font-medium text-[#1F2937]">${item.facility || 'Medlatec Ba Đình'}</td>
                    <td class="p-2.5 text-center">
                        ${renderScheduleStatus(item)}
                    </td>
                    <td class="p-2.5 text-center">
                        <div class="flex items-center justify-center gap-1.5">
                            <a href="receive/receive-detail.html?id=${item.id}" class="w-7 h-7 rounded-[4px] border border-[#D9DEE5] bg-white text-[#27496D] hover:bg-[#E8F1FB] flex items-center justify-center transition-colors" title="Xem chi tiết">
                                <i class="fa-regular fa-eye text-xs"></i>
                            </a>
                            <a href="receive/receive-edit.html?id=${item.id}" class="w-7 h-7 rounded-[4px] border border-[#D9DEE5] bg-white text-[#ED6C02] hover:bg-[#FFF3E0] flex items-center justify-center transition-colors" title="Hiệu chỉnh">
                                <i class="fa-regular fa-pen-to-square text-xs"></i>
                            </a>
                        </div>
                    </td>
                </tr>
            `;
        });

        tbody.innerHTML = html;
    }

    function toggleSelectAllApproved(masterCheckbox) {
        const isChecked = masterCheckbox.checked;
        const items = getApprovedSchedulesOnly();
        selectedApprovedIds.clear();
        if (isChecked) {
            items.forEach(i => selectedApprovedIds.add(i.id));
        }
        renderApprovedSchedulesTable();
    }

    function toggleApprovedRowSelect(id, checkbox) {
        if (checkbox.checked) {
            selectedApprovedIds.add(id);
        } else {
            selectedApprovedIds.delete(id);
        }
        const countBadge = document.getElementById('approved-selected-count');
        const items = getApprovedSchedulesOnly();
        if (countBadge) countBadge.innerText = `${selectedApprovedIds.size} / ${items.length}`;
    }

    // --- LOGIC GOM LỊCH TUẦN VÀ RÀNG BUỘC KHÔNG GOM KHÁC TUẦN (SECTION XIII & XIV) ---
    function groupSelectedSchedules() {
        if (selectedApprovedIds.size === 0) {
            if (window.showToast) {
                window.showToast('Vui lòng chọn ít nhất một lịch đã duyệt để gom thành Lịch tuần!', 'error');
            } else {
                alert('Vui lòng chọn ít nhất một lịch đã duyệt để gom thành Lịch tuần!');
            }
            return;
        }

        const allSchedules = MWKDataStore.getKskSchedules();
        const selectedItems = allSchedules.filter(i => selectedApprovedIds.has(i.id));

        // 1. Check week compatibility
        const weeks = new Set();
        selectedItems.forEach(item => {
            const { week, year } = MWKWeekHelper.getWeekNumber(item.examDate);
            weeks.add(`${year}-W${week}`);
        });

        if (weeks.size > 1) {
            // RUBBER-BAND VALIDATION ALERT FOR CROSS-WEEK SELECTION
            const warnMsg = 'Các lịch được chọn đang thuộc nhiều tuần khác nhau: Vui lòng chỉ chọn các lịch thuộc cùng một tuần để tổng hợp!';
            if (window.showToast) {
                window.showToast(warnMsg, 'error');
            }
            alert(warnMsg);
            return;
        }

        // All selected schedules belong to the exact same week
        const firstItem = selectedItems[0];
        const { week: weekNum, year: yearNum } = MWKWeekHelper.getWeekNumber(firstItem.examDate);
        const dateRangeStr = MWKWeekHelper.getWeekDatesRange(weekNum, yearNum);
        const dateParts = dateRangeStr.split(' - ');
        const facilityName = firstItem.facility || 'Medlatec Ba Đình';

        const splitData = MWKWeekHelper.splitWeeklyAndIncident(selectedItems);

        const totalUnits = new Set(selectedItems.map(i => i.customerName || i.teamName)).size;
        const totalGuests = selectedItems.reduce((sum, i) => sum + (parseInt(i.estimatedCount || i.soLuong) || 0), 0);
        const totalStaff = selectedItems.reduce((sum, i) => sum + (parseInt(i.tongNhanSu) || 4), 0);

        const weekId = `WEEK-${yearNum}-${weekNum}-${facilityName.replace(/\s+/g, '_')}`;

        const newWeeklyGroup = {
            weekId: weekId,
            tuan: weekNum,
            nam: yearNum,
            tuNgay: dateParts[0] || '',
            denNgay: dateParts[1] || '',
            coSo: facilityName,
            lichTuan: splitData.lichTuan,
            lichPhatSinh: splitData.lichPhatSinh,
            tongSoDonVi: totalUnits,
            tongSoLich: selectedItems.length,
            tongSoKhach: totalGuests,
            tongSoNhanSu: totalStaff,
            trangThai: 'CHO_DUYET',
            status: 'Chờ duyệt',
            createdAt: new Date().toISOString(),
            nguoiTao: 'Trần Thị Mai (Cán bộ Tổng hợp)'
        };

        // 2. Add weekly schedule group to data store
        MWKDataStore.addWeeklySchedule(newWeeklyGroup);

        // 3. Update source items in data store to DA_GOM_LICH_TUAN
        selectedItems.forEach(item => {
            MWKDataStore.updateKskSchedule(item.id, {
                status: 'Đã gom lịch tuần',
                trangThai: 'DA_GOM_LICH_TUAN',
                weekId: weekId
            }, 'Trần Thị Mai (Cán bộ Tổng hợp)');
        });

        // 4. Clear selection and toast success
        selectedApprovedIds.clear();
        const masterCb = document.getElementById('approved-select-all');
        if (masterCb) masterCb.checked = false;

        if (window.showToast) {
            window.showToast(`Đã tổng hợp thành công ${selectedItems.length} lịch khám vào Lịch tuần ${weekNum} (${facilityName})!`, 'success');
        }

        renderApprovedSchedulesTable();
        renderWeeklySummary();
    }

    // --- KHU VỰC B: DANH SÁCH LỊCH TUẦN ĐÃ TỔNG HỢP (WEEKLY CARDS LIST) ---
    function renderWeeklySummary() {
        const container = document.getElementById('weekly-summary-container');
        if (!container) return;

        const selectedYear = parseInt(document.getElementById('weekly-filter-year')?.value || new Date().getFullYear());
        const selectedWeekVal = document.getElementById('weekly-filter-week')?.value;
        const selectedWeek = selectedWeekVal ? parseInt(selectedWeekVal) : null;
        const selectedFacility = document.getElementById('weekly-filter-facility')?.value || '';

        const weeklyGroups = MWKDataStore.getWeeklySchedules();

        const filteredGroups = weeklyGroups.filter(g => {
            const matchYear = g.nam === selectedYear;
            const matchWeek = selectedWeek === null || g.tuan === selectedWeek;
            const matchFacility = !selectedFacility || g.coSo === selectedFacility;
            return matchYear && matchWeek && matchFacility;
        });

        container.innerHTML = '';

        if (filteredGroups.length === 0) {
            container.innerHTML = `
                <div class="bg-white p-10 rounded-[4px] border border-[#D9DEE5] text-center text-[#9CA3AF]">
                    <i class="fa-solid fa-calendar-week text-4xl mb-2 text-[#CBD5E1]"></i>
                    <p class="font-bold text-sm text-[#374151]">Chưa có đợt Lịch tuần nào được tạo</p>
                    <p class="text-xs text-[#9CA3AF] mt-1">Chọn các bản ghi tại bảng "Danh sách Lịch đã duyệt" ở trên và nhấn "Tổng hợp lịch tuần" để khởi tạo</p>
                </div>
            `;
            return;
        }

        filteredGroups.forEach(group => {
            const weekId = group.weekId || `WEEK-${group.nam}-${group.tuan}`;
            const dateRange = (group.tuNgay && group.denNgay) ? `${group.tuNgay} - ${group.denNgay}` : MWKWeekHelper.getWeekDatesRange(group.tuan, group.nam);

            const isSubmitted = group.trangThai === 'CHO_DUYET' || group.trangThai === 'DA_DUYET';

            const card = document.createElement('div');
            card.className = 'weekly-card bg-white rounded-[4px] border border-[#D9DEE5] overflow-hidden space-y-0';

            const headerHtml = `
                <div class="weekly-section-header p-4 border-b border-[#D9DEE5] bg-[#F4F5F7] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div class="space-y-1">
                        <div class="flex items-center gap-3">
                            <span class="px-2.5 py-0.5 bg-[#27496D] text-white rounded-[4px] font-bold text-xs">Tuần ${group.tuan} (${group.nam})</span>
                            <h2 class="text-base font-bold text-[#1F2937] flex items-center gap-2">
                                <i class="fa-solid fa-hospital text-[#27496D] text-sm"></i>
                                <span>${group.coSo || 'Medlatec Ba Đình'}</span>
                            </h2>
                            ${isSubmitted 
                                ? `<span class="badge-warning"><i class="fa-solid fa-clock-rotate-left text-[10px]"></i> Đã gửi CB Duyệt</span>`
                                : `<span class="badge-success"><i class="fa-solid fa-check text-[10px]"></i> Đã tổng hợp</span>`
                            }
                        </div>
                        <p class="text-xs text-[#6B7280] font-medium">
                            Khoảng thời gian: <strong class="text-[#1F2937]">${dateRange}</strong> | Quy mô: <strong class="text-[#27496D]">${group.tongSoDonVi || 0} đơn vị</strong> - <strong class="text-[#2E7D32]">${group.tongSoKhach || 0} khách</strong> - <strong class="text-[#ED6C02]">${group.tongSoNhanSu || 0} nhân sự</strong>
                        </p>
                    </div>

                    <div class="flex items-center gap-2 self-end md:self-auto">
                        <a href="weekly/weekly-detail.html?weekId=${weekId}&week=${group.tuan}&year=${group.nam}&facility=${encodeURIComponent(group.coSo || '')}" class="btn-secondary text-xs">
                            <i class="fa-solid fa-eye text-[#27496D] text-xs"></i> Xem chi tiết Lịch tuần
                        </a>
                        <button type="button" onclick="MWKWeekly.submitWeeklyForApproval('${weekId}')" class="btn-primary text-xs flex items-center gap-1.5" ${isSubmitted ? '' : ''}>
                            <i class="fa-solid fa-paper-plane text-xs"></i> Gửi CB Duyệt
                        </button>
                    </div>
                </div>
            `;

            // Render 2 INDEPENDENT SECTIONS: LỊCH TUẦN & LỊCH PHÁT SINH
            const bodyHtml = `
                <div class="p-4 grid grid-cols-1 lg:grid-cols-2 gap-4 bg-white">
                    <!-- KHU VỰC 1: LỊCH TUẦN -->
                    <div class="bg-white rounded-[4px] border border-[#D9DEE5] p-3.5 space-y-3">
                        <div class="flex items-center justify-between border-b border-[#E6EAF0] pb-2">
                            <div class="flex items-center gap-2">
                                <span class="w-6 h-6 rounded-[4px] bg-[#E8F1FB] text-[#27496D] flex items-center justify-center text-xs font-bold border border-[#B3CDE6]">
                                    <i class="fa-regular fa-calendar-check text-xs"></i>
                                </span>
                                <h3 class="text-xs font-bold uppercase tracking-wide text-[#27496D]">LỊCH TUẦN</h3>
                            </div>
                            <span class="badge-success">${(group.lichTuan || []).length} đoàn</span>
                        </div>

                        ${renderScheduleSubList(group.lichTuan, 'Lịch tuần')}
                    </div>

                    <!-- KHU VỰC 2: LỊCH PHÁT SINH -->
                    <div class="bg-white rounded-[4px] border border-[#D9DEE5] p-3.5 space-y-3">
                        <div class="flex items-center justify-between border-b border-[#E6EAF0] pb-2">
                            <div class="flex items-center gap-2">
                                <span class="w-6 h-6 rounded-[4px] bg-[#FFF3E0] text-[#ED6C02] flex items-center justify-center text-xs font-bold border border-[#FFCC80]">
                                    <i class="fa-solid fa-bolt text-xs"></i>
                                </span>
                                <h3 class="text-xs font-bold uppercase tracking-wide text-[#ED6C02]">LỊCH PHÁT SINH</h3>
                            </div>
                            <span class="badge-warning">${(group.lichPhatSinh || []).length} đoàn</span>
                        </div>

                        ${renderScheduleSubList(group.lichPhatSinh, 'Lịch phát sinh')}
                    </div>
                </div>
            `;

            card.innerHTML = headerHtml + bodyHtml;
            container.appendChild(card);
        });
    }

    function renderScheduleSubList(items, typeName) {
        if (!items || items.length === 0) {
            return `
                <div class="py-4 text-center text-[#9CA3AF] italic text-xs bg-[#F4F5F7] rounded-[4px] border border-dashed border-[#D9DEE5]">
                    Không có bản ghi ${typeName} nào trong đợt này
                </div>
            `;
        }

        let html = '<div class="space-y-2 text-xs">';
        items.forEach(item => {
            let formattedDate = item.examDate || '-';
            if (formattedDate.includes('-')) {
                const parts = formattedDate.split('-');
                if (parts.length === 3) formattedDate = `${parts[2]}/${parts[1]}/${parts[0]}`;
            }

            const codeStr = item.code || item.maLich || `LK-2026-${item.id}`;

            html += `
                <div class="p-2.5 bg-[#F4F5F7] hover:bg-[#F7F9FC] rounded-[4px] border border-[#D9DEE5] transition-colors flex items-center justify-between gap-3">
                    <div class="space-y-1 flex-1 min-w-0">
                        <div class="flex items-center gap-2">
                            <span class="font-bold text-[#27496D] text-xs">${formattedDate}</span>
                            <span class="px-1.5 py-0.5 bg-white text-[#374151] border border-[#D9DEE5] rounded-[2px] text-[10px] font-semibold">${item.session || 'Sáng'}</span>
                            <strong class="text-[#1F2937] truncate block text-xs font-semibold">${item.teamName || item.customerName}</strong>
                        </div>
                        <div class="text-[11px] text-[#6B7280] flex items-center gap-3">
                            <span>Mã: <strong class="text-[#1F2937]">${codeStr}</strong></span>
                            <span>SL: <strong class="text-[#2E7D32]">${item.estimatedCount || item.soLuong || 0} khách</strong></span>
                            <span>CB: <strong class="text-[#1F2937]">${item.personInCharge || 'Nguyễn Văn An'}</strong></span>
                        </div>
                    </div>
                    <div class="flex items-center gap-1.5 flex-shrink-0">
                        <a href="receive/receive-detail.html?id=${item.id}" class="w-6 h-6 rounded-[4px] border border-[#D9DEE5] bg-white text-[#27496D] hover:bg-[#E8F1FB] flex items-center justify-center transition-colors" title="Xem chi tiết">
                            <i class="fa-regular fa-eye text-xs"></i>
                        </a>
                    </div>
                </div>
            `;
        });
        html += '</div>';
        return html;
    }

    function submitWeeklyForApproval(weekId) {
        const groups = MWKDataStore.getWeeklySchedules();
        const targetGroup = groups.find(g => g.weekId === weekId);

        MWKDataStore.updateWeeklySchedule(weekId, {
            trangThai: 'CHO_DUYET',
            status: 'Chờ duyệt',
            ngayGuiDuyet: new Date().toISOString(),
            nguoiGuiDuyet: 'Trần Thị Mai (Cán bộ Tổng hợp)'
        });

        if (targetGroup) {
            MWKDataStore.sendToApproval(targetGroup, 'Trần Thị Mai (Cán bộ Tổng hợp)');
        }

        if (window.showToast) {
            window.showToast(`Đã gửi Lịch tuần ${weekId} sang CB Duyệt thành công!`, 'success');
        }

        renderWeeklySummary();
    }

    function submitAllWeeklySchedules() {
        const groups = MWKDataStore.getWeeklySchedules();
        if (groups.length === 0) {
            if (window.showToast) window.showToast('Không có lịch tuần nào để gửi duyệt!', 'error');
            return;
        }

        groups.forEach(g => {
            MWKDataStore.updateWeeklySchedule(g.weekId, {
                trangThai: 'CHO_DUYET',
                status: 'Chờ duyệt',
                ngayGuiDuyet: new Date().toISOString(),
                nguoiGuiDuyet: 'Trần Thị Mai (Cán bộ Tổng hợp)'
            });
            MWKDataStore.sendToApproval(g, 'Trần Thị Mai (Cán bộ Tổng hợp)');
        });

        if (window.showToast) {
            window.showToast(`Đã gửi toàn bộ ${groups.length} đợt Lịch tuần lên Cán bộ duyệt thành công!`, 'success');
        }

        renderWeeklySummary();
    }

    window.MWKWeekly = {
        init: initWeeklyModule,
        renderApprovedSchedulesTable: renderApprovedSchedulesTable,
        toggleSelectAllApproved: toggleSelectAllApproved,
        toggleApprovedRowSelect: toggleApprovedRowSelect,
        groupSelectedSchedules: groupSelectedSchedules,
        renderWeeklySummary: renderWeeklySummary,
        submitWeeklyForApproval: submitWeeklyForApproval,
        submitAllWeeklySchedules: submitAllWeeklySchedules
    };
})(window);

