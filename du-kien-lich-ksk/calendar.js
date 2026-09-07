/**
 * PLANNING CALENDAR MODULE CONTROLLER (DỰ KIẾN LỊCH KSK)
 */

document.addEventListener('DOMContentLoaded', function () {
    initCalendarModule();
});

let currentView = 'week'; // 'week' | 'month'
let currentDate = new Date();
let rawSchedules = [];
let isRightPanelOpen = true;

const filters = {
    search: '',
    coSo: '',
    loaiLich: 'Lịch tại viện',
    cbPhuTrach: '',
    trangThai: ''
};

function initCalendarModule() {
    loadSchedulesData();
    bindCalendarEvents();
    renderCalendar();
}

function loadSchedulesData() {
    if (window.MWKDataStore && typeof window.MWKDataStore.getPlannedSchedules === 'function') {
        rawSchedules = window.MWKDataStore.getPlannedSchedules();
    } else {
        rawSchedules = [];
    }
}

function bindCalendarEvents() {
    // Today Button
    const btnToday = document.getElementById('btn-today');
    if (btnToday) {
        btnToday.addEventListener('click', function () {
            currentDate = new Date();
            renderCalendar();
        });
    }

    // Prev / Next Buttons
    const btnPrev = document.getElementById('btn-prev');
    const btnNext = document.getElementById('btn-next');

    if (btnPrev) {
        btnPrev.addEventListener('click', function () {
            if (currentView === 'week') {
                currentDate.setDate(currentDate.getDate() - 7);
            } else {
                currentDate.setMonth(currentDate.getMonth() - 1);
            }
            renderCalendar();
        });
    }

    if (btnNext) {
        btnNext.addEventListener('click', function () {
            if (currentView === 'week') {
                currentDate.setDate(currentDate.getDate() + 7);
            } else {
                currentDate.setMonth(currentDate.getMonth() + 1);
            }
            renderCalendar();
        });
    }

    // Segmented View Switchers
    const btnViewWeek = document.getElementById('btn-view-week');
    const btnViewMonth = document.getElementById('btn-view-month');

    if (btnViewWeek) {
        btnViewWeek.addEventListener('click', function () {
            if (currentView !== 'week') {
                currentView = 'week';
                btnViewWeek.classList.add('active');
                btnViewWeek.classList.remove('text-[#6B7280]');
                btnViewMonth.classList.remove('active');
                btnViewMonth.classList.add('text-[#6B7280]');

                document.getElementById('week-view-container').classList.remove('hidden');
                document.getElementById('month-view-container').classList.add('hidden');

                renderCalendar();
            }
        });
    }

    if (btnViewMonth) {
        btnViewMonth.addEventListener('click', function () {
            if (currentView !== 'month') {
                currentView = 'month';
                btnViewMonth.classList.add('active');
                btnViewMonth.classList.remove('text-[#6B7280]');
                btnViewWeek.classList.remove('active');
                btnViewWeek.classList.add('text-[#6B7280]');

                document.getElementById('month-view-container').classList.remove('hidden');
                document.getElementById('week-view-container').classList.add('hidden');

                renderCalendar();
            }
        });
    }

    // Search Input
    const inputSearch = document.getElementById('filter-search');
    if (inputSearch) {
        inputSearch.addEventListener('input', function (e) {
            filters.search = e.target.value.trim().toLowerCase();
            renderCalendar();
        });
    }

    // Quick Type Filter Pills
    const typePills = document.querySelectorAll('.filter-type-pill');
    typePills.forEach(pill => {
        pill.addEventListener('click', function () {
            typePills.forEach(p => {
                p.classList.remove('active', 'bg-[#27496D]', 'text-white', 'font-semibold');
                p.classList.add('font-medium', 'text-[#4B5563]');
            });

            this.classList.add('active', 'bg-[#27496D]', 'text-white', 'font-semibold');
            this.classList.remove('font-medium', 'text-[#4B5563]');

            filters.loaiLich = this.getAttribute('data-type') || '';
            renderCalendar();
        });
    });

    // Advanced Filter Popover Toggle
    const btnTogglePopover = document.getElementById('btn-toggle-filter-popover');
    const popoverPanel = document.getElementById('filter-popover-panel');

    if (btnTogglePopover && popoverPanel) {
        btnTogglePopover.addEventListener('click', function (e) {
            e.stopPropagation();
            popoverPanel.classList.toggle('hidden');
        });

        document.addEventListener('click', function (e) {
            if (!popoverPanel.contains(e.target) && !btnTogglePopover.contains(e.target)) {
                popoverPanel.classList.add('hidden');
            }
        });
    }

    // Advanced Selects (Cơ sở & CB Phụ trách)
    const selectCoSo = document.getElementById('filter-co-so');
    const selectCbPhuTrach = document.getElementById('filter-cb-phu-trach');

    if (selectCoSo) {
        selectCoSo.addEventListener('change', function (e) {
            filters.coSo = e.target.value;
            updateFilterPopoverBadge();
            renderCalendar();
        });
    }

    if (selectCbPhuTrach) {
        selectCbPhuTrach.addEventListener('change', function (e) {
            filters.cbPhuTrach = e.target.value;
            updateFilterPopoverBadge();
            renderCalendar();
        });
    }

    // Reset Filters Button
    const btnReset = document.getElementById('btn-reset-filters');
    if (btnReset) {
        btnReset.addEventListener('click', function () {
            filters.search = '';
            filters.coSo = '';
            filters.loaiLich = '';
            filters.cbPhuTrach = '';

            if (inputSearch) inputSearch.value = '';
            if (selectCoSo) selectCoSo.value = '';
            if (selectCbPhuTrach) selectCbPhuTrach.value = '';

            // Reset type pills
            typePills.forEach(p => {
                p.classList.remove('active', 'bg-[#27496D]', 'text-white', 'font-semibold');
                p.classList.add('font-medium', 'text-[#4B5563]');
                if ((p.getAttribute('data-type') || '') === '') {
                    p.classList.add('active', 'bg-[#27496D]', 'text-white', 'font-semibold');
                    p.classList.remove('font-medium', 'text-[#4B5563]');
                }
            });

            updateFilterPopoverBadge();
            renderCalendar();
        });
    }

    // Toggle Summary Panel
    const btnTogglePanel = document.getElementById('btn-toggle-summary-panel');
    const rightPanel = document.getElementById('right-summary-panel');

    if (btnTogglePanel && rightPanel) {
        btnTogglePanel.addEventListener('click', function () {
            isRightPanelOpen = !isRightPanelOpen;
            if (isRightPanelOpen) {
                rightPanel.classList.remove('hidden');
            } else {
                rightPanel.classList.add('hidden');
            }
        });
    }

    // Custom Event Listener for Storage Updates
    window.addEventListener('mwk_planned_schedules_changed', function () {
        loadSchedulesData();
        renderCalendar();
    });
}

function updateFilterPopoverBadge() {
    let count = 0;
    if (filters.coSo) count++;
    if (filters.cbPhuTrach) count++;

    const badge = document.getElementById('filter-popover-badge');
    if (badge) {
        if (count > 0) {
            badge.innerText = count;
            badge.classList.remove('hidden');
        } else {
            badge.classList.add('hidden');
        }
    }
}

function getFilteredSchedules() {
    return rawSchedules.filter(item => {
        if (filters.search) {
            const unitName = (item.tenDonVi || '').toLowerCase();
            const code = (item.customerCode || '').toLowerCase();
            if (!unitName.includes(filters.search) && !code.includes(filters.search)) {
                return false;
            }
        }
        if (filters.coSo && item.coSo !== filters.coSo) {
            return false;
        }
        if (filters.loaiLich && item.loaiLich !== filters.loaiLich) {
            return false;
        }
        if (filters.cbPhuTrach && item.cbPhuTrach !== filters.cbPhuTrach) {
            return false;
        }
        return true;
    });
}

function renderCalendar() {
    const activeList = getFilteredSchedules();

    if (currentView === 'week') {
        renderWeekView(activeList);
    } else {
        renderMonthView(activeList);
    }

    renderRightPanel(activeList);
    renderFooterBar(activeList);
}

// ==========================================
// 1. RENDER WEEK VIEW
// ==========================================
function renderWeekView(activeList) {
    const weekDays = CalendarHelper.getWeekDays(currentDate);
    const startWeekStr = CalendarHelper.formatShortDate(weekDays[0]);
    const endWeekStr = CalendarHelper.formatShortDate(weekDays[6]);
    const weekNum = CalendarHelper.getWeekNumber(currentDate);
    const year = weekDays[0].getFullYear();

    // Update Title Range
    const titleRange = document.getElementById('calendar-title-range');
    if (titleRange) {
        titleRange.innerText = `Tuần ${weekNum} (${startWeekStr} - ${endWeekStr}/${year})`;
    }

    // Update Footer Period
    const footerPeriod = document.getElementById('footer-period-label');
    if (footerPeriod) {
        footerPeriod.innerText = `Tuần ${weekNum} / ${year} (${startWeekStr} - ${endWeekStr}/${year})`;
    }

    // Update 7 Header Columns
    const todayISO = CalendarHelper.formatISODate(new Date());
    const headerElems = document.querySelectorAll('.day-col-header');

    headerElems.forEach((elem, index) => {
        if (index < weekDays.length) {
            const dayDate = weekDays[index];
            const isoStr = CalendarHelper.formatISODate(dayDate);
            const dayLabel = CalendarHelper.getDayOfWeekLabel(dayDate);
            const shortDate = CalendarHelper.formatShortDate(dayDate);
            const isToday = isoStr === todayISO;

            // Summary for this day
            const dayItems = activeList.filter(item => item.ngayKham === isoStr);
            const dayCount = dayItems.length;
            const dayGuests = dayItems.reduce((sum, i) => sum + (parseInt(i.soLuongKhach) || 0), 0);

            elem.innerHTML = `
                <div class="flex flex-col items-center py-1.5 space-y-0.5">
                    <span class="text-[11px] font-bold ${isToday ? 'text-[#27496D]' : 'text-[#6B7280]'} uppercase tracking-wider">${dayLabel}</span>
                    <span class="text-xs font-extrabold ${isToday ? 'px-2.5 py-0.5 rounded-[4px] bg-[#27496D] text-white shadow-2xs' : 'text-[#1F2937]'}">${shortDate}</span>
                    ${dayCount > 0 ? `<span class="text-[10px] font-bold text-[#27496D] bg-[#E8F1FB] px-1.5 py-0.2 rounded-[3px] border border-[#B3CDE6] mt-0.5">${dayCount} lịch • ${dayGuests} KH</span>` : '<span class="text-[10px] text-[#9CA3AF] mt-0.5">Chưa có lịch</span>'}
                </div>
            `;
            elem.classList.toggle('bg-[#F0F7FF]', isToday);
        }
    });

    // Build 3 Rows: Sáng, Chiều, Cả ngày
    const gridTbody = document.getElementById('week-grid-tbody');
    if (!gridTbody) return;

    const shifts = [
        { code: 'Sang', label: 'Sáng', subLabel: '07:30 - 11:30' },
        { code: 'Chieu', label: 'Chiều', subLabel: '13:30 - 17:30' },
        { code: 'CaNgay', label: 'Cả ngày', subLabel: '07:30 - 17:30' }
    ];

    let tbodyHtml = '';

    shifts.forEach(shift => {
        tbodyHtml += `<tr class="border-b border-[#D9DEE5]">`;
        
        // Sticky First Column (Shift Title)
        tbodyHtml += `
            <td class="p-2 text-center bg-[#F8FAFC] border-r border-[#D9DEE5] align-middle font-bold text-[#1F2937] select-none">
                <div class="text-xs font-bold text-[#27496D]">${shift.label}</div>
                <div class="text-[10px] text-[#6B7280] font-normal">${shift.subLabel}</div>
            </td>
        `;

        // 7 Day Cells
        weekDays.forEach(dayDate => {
            const isoStr = CalendarHelper.formatISODate(dayDate);
            const isToday = isoStr === todayISO;

            // Find matching schedules for this date & shift
            const cellSchedules = activeList.filter(item => {
                if (item.ngayKham !== isoStr) return false;
                if (shift.code === 'CaNgay') return item.ca === 'CaNgay';
                return item.ca === shift.code;
            });

            tbodyHtml += `
                <td class="p-2 border-r border-[#D9DEE5] align-top calendar-cell ${isToday ? 'calendar-cell-today' : ''}" 
                    data-date="${isoStr}" 
                    data-shift="${shift.code}">
                    <div class="space-y-2 min-h-[105px] flex flex-col justify-between">
            `;

            if (cellSchedules.length > 0) {
                tbodyHtml += `<div class="space-y-2">`;
                cellSchedules.forEach(item => {
                    tbodyHtml += renderEventCardHtml(item);
                });
                tbodyHtml += `</div>`;
            } else {
                tbodyHtml += `
                    <div onclick="handleCellDoubleClick('${isoStr}', '${shift.label}')" 
                         class="cell-add-placeholder h-24 flex flex-col items-center justify-center p-2 text-[#9CA3AF] cursor-pointer opacity-60 hover:opacity-100">
                        <i class="fa-solid fa-plus text-xs mb-1 text-[#27496D]"></i>
                        <span class="text-[10px] font-semibold text-[#6B7280]">Dự kiến lịch</span>
                    </div>
                `;
            }

            tbodyHtml += `
                    </div>
                </td>
            `;
        });

        tbodyHtml += `</tr>`;
    });

    gridTbody.innerHTML = tbodyHtml;
}

// ==========================================
// 2. RENDER MONTH VIEW
// ==========================================
function renderMonthView(activeList) {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth(); // 0-indexed
    const monthDays = CalendarHelper.getMonthDaysGrid(year, month);
    const todayISO = CalendarHelper.formatISODate(new Date());

    // Update Title Range
    const titleRange = document.getElementById('calendar-title-range');
    if (titleRange) {
        titleRange.innerText = `Tháng ${month + 1}/${year}`;
    }

    // Update Footer Period
    const footerPeriod = document.getElementById('footer-period-label');
    if (footerPeriod) {
        footerPeriod.innerText = `Tháng ${month + 1} / ${year}`;
    }

    const gridTbody = document.getElementById('month-grid-tbody');
    if (!gridTbody) return;

    let tbodyHtml = '';
    const totalDays = monthDays.length;
    const numRows = Math.ceil(totalDays / 7);

    for (let r = 0; r < numRows; r++) {
        tbodyHtml += `<tr class="border-b border-[#D9DEE5]">`;

        for (let c = 0; c < 7; c++) {
            const index = r * 7 + c;
            if (index < totalDays) {
                const dayDate = monthDays[index];
                const isoStr = CalendarHelper.formatISODate(dayDate);
                const isCurrentMonth = dayDate.getMonth() === month;
                const isToday = isoStr === todayISO;

                const daySchedules = activeList.filter(item => item.ngayKham === isoStr);
                const maxVisible = 3;
                const visibleSchedules = daySchedules.slice(0, maxVisible);
                const overflowCount = daySchedules.length - maxVisible;

                tbodyHtml += `
                    <td class="p-2 border-r border-[#D9DEE5] align-top month-day-cell ${!isCurrentMonth ? 'other-month' : ''} ${isToday ? 'calendar-cell-today' : ''}"
                        data-date="${isoStr}">
                        
                        <div class="flex items-center justify-between mb-1.5">
                            <span class="text-xs font-bold ${isToday ? 'px-2 py-0.5 rounded-[4px] bg-[#27496D] text-white shadow-2xs' : isCurrentMonth ? 'text-[#1F2937]' : 'text-[#9CA3AF]'}">
                                ${dayDate.getDate()}
                            </span>
                            ${daySchedules.length > 0 ? `<span class="text-[10px] font-bold text-[#27496D] bg-[#E8F1FB] px-1.5 py-0.2 rounded-[3px]">${daySchedules.length} lịch</span>` : ''}
                        </div>

                        <div class="space-y-1.5">
                `;

                visibleSchedules.forEach(item => {
                    tbodyHtml += renderMonthEventCardHtml(item);
                });

                if (overflowCount > 0) {
                    tbodyHtml += `
                        <button type="button" onclick="openDayDetailsModal('${isoStr}')" class="w-full text-center py-1 bg-[#F1F5F9] hover:bg-[#E2E8F0] rounded-[3px] text-[10px] font-bold text-[#27496D] transition-colors border border-[#CBD5E1]">
                            +${overflowCount} lịch khác...
                        </button>
                    `;
                }

                tbodyHtml += `
                        </div>
                    </td>
                `;
            }
        }

        tbodyHtml += `</tr>`;
    }

    gridTbody.innerHTML = tbodyHtml;
}

// ==========================================
// 3. EVENT CARD TEMPLATES
// ==========================================
function renderEventCardHtml(item) {
    const style = CalendarHelper.getScheduleTypeStyle(item.loaiLich);
    const guests = item.soLuongKhach || 0;
    const staff = item.tongNhanSu || 0;
    const timeStr = `${item.gioBatDau || '07:30'} - ${item.gioKetThuc || '11:00'}`;

    let cardClass = 'event-card-tai-vien';
    const typeStr = (item.loaiLich || '').toLowerCase();
    if (typeStr.includes('ngoại viện')) cardClass = 'event-card-ngoai-vien';
    else if (typeStr.includes('phường')) cardClass = 'event-card-lich-phuong';
    else if (typeStr.includes('phát sinh')) cardClass = 'event-card-phat-sinh';

    return `
        <div onclick="navigateToDetail(${item.id})" 
             class="event-card ${cardClass} p-2.5 space-y-1.5 cursor-pointer select-none">
            
            <!-- Line 1: Tên đơn vị & Badge loại lịch -->
            <div class="flex items-start justify-between gap-1.5">
                <span class="font-bold text-xs text-[#1F2937] leading-tight line-clamp-2" title="${item.tenDonVi}">${item.tenDonVi}</span>
                <span class="text-[9px] font-bold px-1.5 py-0.5 rounded-[3px] ${style.badgeClass} shrink-0 uppercase tracking-wider">${style.label}</span>
            </div>

            <!-- Line 2: Khung giờ & Cơ sở -->
            <div class="flex items-center justify-between text-[11px] text-[#4B5563] pt-0.5">
                <div class="flex items-center gap-1 font-semibold text-[#27496D]">
                    <i class="fa-regular fa-clock text-[10px]"></i>
                    <span>${timeStr}</span>
                </div>
                <div class="flex items-center gap-1 text-[#6B7280] font-medium truncate max-w-[100px]" title="${item.coSo}">
                    <i class="fa-solid fa-location-dot text-[9px] text-[#27496D]"></i>
                    <span class="truncate">${item.coSo}</span>
                </div>
            </div>

            <!-- Line 3: Quy mô & Cán bộ phụ trách -->
            <div class="flex items-center justify-between text-[11px] pt-1 border-t border-black/5">
                <div class="flex items-center gap-2">
                    <span class="font-bold text-[#15803D] flex items-center gap-1">
                        <i class="fa-solid fa-users text-[10px]"></i> ${guests} KH
                    </span>
                    <span class="text-[#6B7280] font-medium">| ${staff} NS</span>
                </div>
                <span class="text-[10px] font-semibold text-[#6B7280] truncate max-w-[85px]" title="CB: ${item.cbPhuTrach}">${item.cbPhuTrach}</span>
            </div>
        </div>
    `;
}

function renderMonthEventCardHtml(item) {
    const style = CalendarHelper.getScheduleTypeStyle(item.loaiLich);
    const guests = item.soLuongKhach || 0;

    let cardClass = 'event-card-tai-vien';
    const typeStr = (item.loaiLich || '').toLowerCase();
    if (typeStr.includes('ngoại viện')) cardClass = 'event-card-ngoai-vien';
    else if (typeStr.includes('phường')) cardClass = 'event-card-lich-phuong';
    else if (typeStr.includes('phát sinh')) cardClass = 'event-card-phat-sinh';

    return `
        <div onclick="navigateToDetail(${item.id})" 
             class="${cardClass} p-1.5 rounded-[3px] cursor-pointer space-y-0.5 text-[11px] truncate shadow-2xs hover:opacity-95">
            <div class="font-bold text-[#1F2937] truncate" title="${item.tenDonVi}">${item.tenDonVi}</div>
            <div class="flex items-center justify-between text-[10px] text-[#4B5563]">
                <span class="font-semibold text-[#27496D]">${item.gioBatDau || '07:30'}</span>
                <strong class="text-[#15803D]">${guests} KH</strong>
            </div>
        </div>
    `;
}

// ==========================================
// 4. RIGHT SUMMARY PANEL & FOOTER
// ==========================================
function renderRightPanel(activeList) {
    const rightPanel = document.getElementById('right-summary-panel');
    if (!rightPanel) return;

    const totalSchedules = activeList.length;
    const totalGuests = activeList.reduce((sum, i) => sum + (parseInt(i.soLuongKhach) || 0), 0);
    const totalStaff = activeList.reduce((sum, i) => sum + (parseInt(i.tongNhanSu) || 0), 0);

    const elemTotalSchedules = document.getElementById('panel-stat-total-schedules');
    const elemTotalGuests = document.getElementById('panel-stat-total-guests');
    const elemTotalStaff = document.getElementById('panel-stat-total-staff');

    if (elemTotalSchedules) elemTotalSchedules.innerText = totalSchedules;
    if (elemTotalGuests) elemTotalGuests.innerText = totalGuests.toLocaleString('vi-VN');
    if (elemTotalStaff) elemTotalStaff.innerText = totalStaff.toLocaleString('vi-VN');

    // Type Breakdown (Chỉ tập trung vào 3 loại hình dự kiến)
    const typeCounts = {
        'Lịch tại viện': { count: 0, guests: 0 },
        'Lịch ngoại viện': { count: 0, guests: 0 },
        'Lịch phường': { count: 0, guests: 0 }
    };

    activeList.forEach(item => {
        let type = item.loaiLich || 'Lịch tại viện';
        if (type.includes('tại viện')) type = 'Lịch tại viện';
        else if (type.includes('ngoại viện')) type = 'Lịch ngoại viện';
        else if (type.includes('phường')) type = 'Lịch phường';

        if (typeCounts[type]) {
            typeCounts[type].count += 1;
            typeCounts[type].guests += parseInt(item.soLuongKhach) || 0;
        }
    });

    const typeBreakdownElem = document.getElementById('panel-type-breakdown');
    if (typeBreakdownElem) {
        let html = '';
        Object.keys(typeCounts).forEach(typeKey => {
            const data = typeCounts[typeKey];
            const style = CalendarHelper.getScheduleTypeStyle(typeKey);
            const percent = totalSchedules > 0 ? Math.round((data.count / totalSchedules) * 100) : 0;

            html += `
                <div class="p-2 rounded-[4px] border ${style.bgClass} ${style.borderClass} space-y-1">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-2">
                            <span class="w-2.5 h-2.5 rounded-full ${style.dotClass}"></span>
                            <span class="font-bold text-[#1F2937] text-xs">${style.label}</span>
                        </div>
                        <span class="font-extrabold text-[#1F2937] text-xs">${data.count} lịch (${percent}%)</span>
                    </div>
                    <div class="flex items-center justify-between text-[10px] text-[#6B7280]">
                        <span>Quy mô: <strong class="text-[#15803D]">${data.guests.toLocaleString('vi-VN')} KH</strong></span>
                        <div class="w-24 bg-gray-200 rounded-full h-1.5 overflow-hidden">
                            <div class="${style.dotClass} h-1.5 rounded-full" style="width: ${percent}%"></div>
                        </div>
                    </div>
                </div>
            `;
        });
        typeBreakdownElem.innerHTML = html;
    }

    // Facility Breakdown
    const facilityCounts = {};
    activeList.forEach(item => {
        const fac = item.coSo || 'MEDLATEC Ba Đình';
        if (!facilityCounts[fac]) facilityCounts[fac] = 0;
        facilityCounts[fac] += 1;
    });

    const facilityBreakdownElem = document.getElementById('panel-facility-breakdown');
    if (facilityBreakdownElem) {
        let html = '';
        Object.keys(facilityCounts).forEach(fac => {
            const count = facilityCounts[fac];
            const percent = totalSchedules > 0 ? Math.round((count / totalSchedules) * 100) : 0;

            html += `
                <div class="p-2 bg-[#F8FAFC] border border-[#D9DEE5] rounded-[4px] space-y-1">
                    <div class="flex items-center justify-between">
                        <span class="font-semibold text-[#374151] truncate max-w-[170px]" title="${fac}">${fac}</span>
                        <span class="font-bold text-[#27496D] text-xs">${count} lịch</span>
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                        <div class="bg-[#27496D] h-1.5 rounded-full" style="width: ${percent}%"></div>
                    </div>
                </div>
            `;
        });
        if (Object.keys(facilityCounts).length === 0) {
            html = `<div class="text-center py-2 text-[#9CA3AF] italic">Chưa có dữ liệu lịch</div>`;
        }
        facilityBreakdownElem.innerHTML = html;
    }
}

function renderFooterBar(activeList) {
    const totalSchedules = activeList.length;
    const totalGuests = activeList.reduce((sum, i) => sum + (parseInt(i.soLuongKhach) || 0), 0);
    const totalStaff = activeList.reduce((sum, i) => sum + (parseInt(i.tongNhanSu) || 0), 0);

    const elemSchedules = document.getElementById('footer-count-schedules');
    const elemGuests = document.getElementById('footer-count-guests');
    const elemStaff = document.getElementById('footer-count-staff');

    if (elemSchedules) elemSchedules.innerText = totalSchedules;
    if (elemGuests) elemGuests.innerText = totalGuests.toLocaleString('vi-VN');
    if (elemStaff) elemStaff.innerText = totalStaff.toLocaleString('vi-VN');
}

// ==========================================
// 5. INTERACTION HANDLERS
// ==========================================
function navigateToDetail(id) {
    window.location.href = `detail/detail.html?id=${id}`;
}

function handleCellDoubleClick(dateStr, shiftLabel) {
    if (window.showToast) {
        window.showToast(`Tạo nhanh lịch dự kiến cho ngày ${dateStr} (${shiftLabel}) - Tính năng đang phát triển.`, 'info');
    } else {
        alert(`Tạo nhanh lịch dự kiến cho ngày ${dateStr} (${shiftLabel})`);
    }
}

function openDayDetailsModal(dateISO) {
    const activeList = getFilteredSchedules();
    const daySchedules = activeList.filter(item => item.ngayKham === dateISO);

    const modal = document.getElementById('modal-day-details');
    const titleElem = document.getElementById('modal-day-title');
    const contentElem = document.getElementById('modal-day-content');
    const countSummary = document.getElementById('modal-day-count-summary');

    if (titleElem) {
        const parts = dateISO.split('-');
        const dateFormatted = `${parts[2]}/${parts[1]}/${parts[0]}`;
        titleElem.innerText = `Danh sách lịch dự kiến - ${dateFormatted}`;
    }

    if (countSummary) {
        countSummary.innerText = `Tổng số ${daySchedules.length} đợt khám dự kiến`;
    }

    if (contentElem) {
        let html = '';
        daySchedules.forEach(item => {
            const style = CalendarHelper.getScheduleTypeStyle(item.loaiLich);
            html += `
                <div onclick="navigateToDetail(${item.id})" class="bg-[#FFFFFF] p-3 rounded-[4px] border border-[#D9DEE5] hover:border-[#27496D] cursor-pointer space-y-1.5 shadow-2xs">
                    <div class="flex items-center justify-between">
                        <strong class="text-xs font-bold text-[#1F2937]">${item.tenDonVi}</strong>
                        <span class="text-[10px] font-bold px-2 py-0.5 rounded-[3px] ${style.badgeClass}">${style.label}</span>
                    </div>
                    <div class="flex items-center gap-4 text-xs text-[#4B5563]">
                        <div>Giờ: <strong class="text-[#27496D]">${item.gioBatDau} - ${item.gioKetThuc}</strong></div>
                        <div>Khách: <strong class="text-[#1F2937]">${item.soLuongKhach} KH</strong></div>
                        <div>Cơ sở: <strong class="text-[#374151]">${item.coSo}</strong></div>
                    </div>
                </div>
            `;
        });
        contentElem.innerHTML = html;
    }

    if (modal) modal.classList.remove('hidden');
}

function closeDayDetailsModal() {
    const modal = document.getElementById('modal-day-details');
    if (modal) modal.classList.add('hidden');
}
