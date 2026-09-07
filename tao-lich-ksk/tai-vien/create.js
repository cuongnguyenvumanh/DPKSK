/**
 * MWK - THÊM LỊCH TẠI VIỆN | TAI-VIEN MODULE JS LOGIC
 */

let isFormDirty = false;

let categoryRows = [];
let staffRows = [];

function getMasterCategoriesFromStore() {
    if (window.MWKDataStore && typeof MWKDataStore.getActiveCategories === 'function') {
        const storeCategories = MWKDataStore.getActiveCategories();
        if (storeCategories && storeCategories.length > 0) {
            return storeCategories.map(c => c.name);
        }
    }
    return [
        'Siêu âm ổ bụng tổng quát',
        'Khám Nội tổng quát',
        'Điện tâm đồ (ECG 12 chuyển đạo)',
        'Lấy máu xét nghiệm',
        'Khám Mắt & Đo thị lực',
        'Khám Tai Mũi Họng',
        'Khám Răng Hàm Mặt',
        'Khám Sản phụ khoa',
        'Đo Mật độ xương (DEXA 2 vị trí)',
        'Siêu âm Tuyến giáp & Vú',
        'Đo Chức năng hô hấp (Khí phế cầu)',
        'Xét nghiệm Tầm soát Ung thư (Marker ung thư)'
    ];
}

document.addEventListener('DOMContentLoaded', function () {
    initHeaderDataFromUrl();
    initFacilitySelectOptions();
    setDefaultExamDate();
    renderCategoryTable();
    renderStaffTable();
    updateRealtimeSummary();
    setupScrollSpy();
    setupFormDirtyTracker();
    initBreadcrumbWithRetry();
});

function markFormDirty() {
    isFormDirty = true;
}

function setupFormDirtyTracker() {
    const fields = ['examDate', 'province', 'facility', 'guestCount', 'notes', 'time-sang-start', 'time-sang-end', 'time-chieu-start', 'time-chieu-end'];
    fields.forEach(id => {
        const elem = document.getElementById(id);
        if (elem) {
            elem.addEventListener('input', markFormDirty);
            elem.addEventListener('change', markFormDirty);
        }
    });

    const checkboxes = ['check-shift-sang', 'check-shift-chieu'];
    checkboxes.forEach(id => {
        const elem = document.getElementById(id);
        if (elem) {
            elem.addEventListener('change', markFormDirty);
        }
    });
}

function customizeBreadcrumbForTaiVien() {
    const breadcrumbContainer = document.getElementById('breadcrumb-container');
    if (!breadcrumbContainer) return;

    const params = new URLSearchParams(window.location.search);
    const editId = params.get('editId');
    const parentUrl = editId ? `../edit/edit.html?id=${editId}&step=2` : '../create/create.html?step=2';
    const parentTitle = editId ? 'Chỉnh sửa lịch khám đơn vị' : 'Tạo mới lịch khám đơn vị';

    breadcrumbContainer.innerHTML = `
        <a href="../../bao-cao-thong-ke/bao-cao-doan-kham/bao-cao-doan-kham.html" id="breadcrumb-home-link" onclick="return handleHomeBreadcrumbClick(event)" class="hover:text-[#27496D] flex items-center gap-1.5 text-[#6B7280]">
            <i class="fa-solid fa-house text-[#9CA3AF] text-xs"></i> <span>Trang chủ</span>
        </a>
        <i class="fa-solid fa-chevron-right text-[9px] text-[#9CA3AF]"></i>
        <a href="javascript:void(0)" onclick="handleBreadcrumbClick('${parentUrl}')" class="hover:text-[#27496D] text-[#6B7280] font-medium transition-colors">
            ${parentTitle}
        </a>
        <i class="fa-solid fa-chevron-right text-[9px] text-[#9CA3AF]"></i>
        <span id="breadcrumb-current" class="font-semibold text-[#1F2937]">Thêm lịch tại viện</span>
    `;
}

function initBreadcrumbWithRetry() {
    let attempts = 0;
    const interval = setInterval(() => {
        attempts++;
        const container = document.getElementById('breadcrumb-container');
        if (container) {
            customizeBreadcrumbForTaiVien();
            clearInterval(interval);
        }
        if (attempts > 30) clearInterval(interval);
    }, 100);
}

function handleBreadcrumbClick(targetUrl) {
    if (isFormDirty) {
        if (confirm('Bạn có sự thay đổi chưa lưu tại màn Thêm lịch tại viện. Bạn có chắc chắn muốn quay lại màn Tạo mới lịch khám đơn vị không?')) {
            isFormDirty = false;
            window.location.href = targetUrl;
        }
    } else {
        window.location.href = targetUrl;
    }
}

function handleHomeBreadcrumbClick(event) {
    if (isFormDirty) {
        if (!confirm('Bạn có sự thay đổi chưa lưu tại màn Thêm lịch tại viện. Bạn có chắc chắn muốn rời khỏi trang không?')) {
            if (event) event.preventDefault();
            return false;
        }
    }
    isFormDirty = false;
    return true;
}

function initHeaderDataFromUrl() {
    const params = new URLSearchParams(window.location.search);
    let customerName = params.get('customerName') || params.get('contactPerson');
    let customerCode = params.get('customerCode');
    let estimatedCount = params.get('estimatedCount');

    const draftJson = sessionStorage.getItem('mwk_create_schedule_draft');
    if (draftJson) {
        try {
            const draft = JSON.parse(draftJson);
            if (!customerName || customerName === 'Công ty cổ phần ABC') {
                customerName = draft.customerName || draft.contactPerson || customerName;
            }
            if (!customerCode || customerCode === 'KAD019962025') {
                customerCode = draft.customerCode || customerCode;
            }
            if (!estimatedCount || estimatedCount === '250') {
                estimatedCount = draft.estimatedCount || estimatedCount;
            }
        } catch (e) {}
    }

    if (!customerName) customerName = 'Công ty cổ phần ABC';
    if (!customerCode) customerCode = 'KAD019962025';
    if (!estimatedCount) estimatedCount = '250';

    const customerElem = document.getElementById('header-display-customer');
    const codeElem = document.getElementById('header-display-code');
    const guestsElem = document.getElementById('header-display-guests');
    const guestInputElem = document.getElementById('guestCount');

    if (customerElem) customerElem.innerText = customerName;
    if (codeElem) codeElem.innerText = customerCode;
    if (guestsElem) guestsElem.innerText = estimatedCount;
    if (guestInputElem && estimatedCount) guestInputElem.value = estimatedCount;
}

function initFacilitySelectOptions() {
    const facilitySelect = document.getElementById('facility');
    if (!facilitySelect) return;

    let facilities = [];
    if (window.MWKDataStore && typeof MWKDataStore.getActiveFacilities === 'function') {
        facilities = MWKDataStore.getActiveFacilities();
    }

    if (!facilities || facilities.length === 0) {
        facilities = [
            { name: 'Medlatec Ba Đình - 42 Nghĩa Dũng, Ba Đình, Hà Nội' },
            { name: 'Medlatec Cầu Giấy - 99 Trích Sài, Tây Hồ, Hà Nội' },
            { name: 'Medlatec Tây Hồ - 2 Ỷ La, Dương Nội, Hà Đông, Hà Nội' },
            { name: 'Medlatec Thanh Xuân - 28 Phùng Hưng, Hà Đông, Hà Nội' },
            { name: 'Medlatec Vĩnh Phúc - 119 Nguyễn Tất Thành, Vĩnh Yên' }
        ];
    }

    facilitySelect.innerHTML = facilities.map((f, idx) => `
        <option value="${f.name}" ${idx === 0 ? 'selected' : ''}>${f.name}</option>
    `).join('');
}

function setDefaultExamDate() {
    const dateInput = document.getElementById('examDate');
    if (dateInput && !dateInput.value) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const yyyy = tomorrow.getFullYear();
        const mm = String(tomorrow.getMonth() + 1).padStart(2, '0');
        const dd = String(tomorrow.getDate()).padStart(2, '0');
        dateInput.value = `${yyyy}-${mm}-${dd}`;
    }
}

function toggleSectionCollapse(contentId, btn) {
    const content = document.getElementById(contentId);
    if (!content) return;

    const isHidden = content.classList.contains('hidden');
    if (isHidden) {
        content.classList.remove('hidden');
        if (btn) btn.innerHTML = `<span>Thu gọn</span><i class="fa-solid fa-chevron-up text-xs ml-1"></i>`;
    } else {
        content.classList.add('hidden');
        if (btn) btn.innerHTML = `<span>Mở rộng</span><i class="fa-solid fa-chevron-down text-xs ml-1"></i>`;
    }
}

function toggleWorkTypePill(btn) {
    if (!btn) return;
    markFormDirty();
    const isActive = btn.classList.toggle('active');
    const labelText = btn.innerText.replace(/[\n\r]/g, '').trim();
    if (isActive) {
        btn.innerHTML = `<i class="fa-solid fa-check text-[10px] mr-1 text-white"></i>${labelText}`;
    } else {
        btn.innerHTML = `<i class="fa-solid fa-plus text-[10px] mr-1 text-[#6B7280]"></i>${labelText}`;
    }
}

function showAddCustomWorkTypeInput() {
    const btn = document.getElementById('btn-show-add-work-type');
    const box = document.getElementById('inline-add-work-type-box');
    const input = document.getElementById('input-custom-work-type');

    if (btn) btn.classList.add('hidden');
    if (box) {
        box.classList.remove('hidden');
        box.classList.add('flex');
    }
    if (input) {
        input.value = '';
        input.focus();
    }
}

function cancelAddCustomWorkType() {
    const btn = document.getElementById('btn-show-add-work-type');
    const box = document.getElementById('inline-add-work-type-box');

    if (box) {
        box.classList.add('hidden');
        box.classList.remove('flex');
    }
    if (btn) btn.classList.remove('hidden');
}

function confirmAddCustomWorkType() {
    const input = document.getElementById('input-custom-work-type');
    if (!input) return;

    const val = input.value.trim();
    if (!val) {
        if (window.showToast) window.showToast('Vui lòng nhập tên loại hình công việc!', 'warning');
        return;
    }

    markFormDirty();
    const wrapper = document.getElementById('custom-work-type-wrapper');
    const container = document.getElementById('work-type-pills');

    const newBtn = document.createElement('button');
    newBtn.type = 'button';
    newBtn.className = 'pill-btn active';
    newBtn.onclick = function() { toggleWorkTypePill(this); };
    newBtn.innerHTML = `<i class="fa-solid fa-check text-[10px] mr-1 text-white"></i>${val}`;

    if (container && wrapper) {
        container.insertBefore(newBtn, wrapper);
    }

    cancelAddCustomWorkType();
    if (window.showToast) {
        window.showToast(`Đã thêm loại hình công việc: "${val}"`, 'success');
    }
}

function toggleShiftInput(shiftType) {
    markFormDirty();
    const checkSang = document.getElementById('check-shift-sang');
    const checkChieu = document.getElementById('check-shift-chieu');
    const timeSangStart = document.getElementById('time-sang-start');
    const timeSangEnd = document.getElementById('time-sang-end');
    const timeChieuStart = document.getElementById('time-chieu-start');
    const timeChieuEnd = document.getElementById('time-chieu-end');

    if (shiftType === 'sang' && timeSangStart && timeSangEnd && checkSang) {
        timeSangStart.disabled = !checkSang.checked;
        timeSangEnd.disabled = !checkSang.checked;
    } else if (shiftType === 'chieu' && timeChieuStart && timeChieuEnd && checkChieu) {
        timeChieuStart.disabled = !checkChieu.checked;
        timeChieuEnd.disabled = !checkChieu.checked;
    }

    validateField('shift');
    updateRealtimeSummary();
}

function renderCategoryTable() {
    const tbody = document.getElementById('category-table-body');
    const totalElem = document.getElementById('total-category-guests');
    if (!tbody) return;

    let availableCategories = getMasterCategoriesFromStore();

    let html = '';
    let totalGuests = 0;

    categoryRows.forEach((row, idx) => {
        totalGuests += parseInt(row.guests || 0);

        let optionsHtml = availableCategories.map(cat => `
            <option value="${cat}" ${cat === row.name ? 'selected' : ''}>${cat}</option>
        `).join('');

        html += `
            <tr class="hover:bg-[#F7F9FC] transition-colors">
                <td class="py-2.5 px-3 text-center font-bold text-[#6B7280]">${idx + 1}</td>
                <td class="py-2.5 px-3">
                    <select onchange="updateCategoryName(${idx}, this.value)" class="sys-select text-xs h-8 font-medium text-[#1F2937]">
                        ${optionsHtml}
                    </select>
                </td>
                <td class="py-2.5 px-3 text-right">
                    <input type="number" min="1" value="${row.guests}" oninput="updateCategoryGuest(${idx}, this.value)" class="sys-input text-xs h-8 text-right font-bold text-[#27496D]">
                </td>
                <td class="py-2.5 px-3 text-center">
                    <input type="checkbox" ${row.sang ? 'checked' : ''} onchange="updateCategoryShift(${idx}, 'sang', this.checked)" class="w-4 h-4 text-[#27496D] rounded-[2px] border-[#D9DEE5]">
                </td>
                <td class="py-2.5 px-3 text-center">
                    <input type="checkbox" ${row.chieu ? 'checked' : ''} onchange="updateCategoryShift(${idx}, 'chieu', this.checked)" class="w-4 h-4 text-[#27496D] rounded-[2px] border-[#D9DEE5]">
                </td>
                <td class="py-2.5 px-3 text-center">
                    <button type="button" onclick="removeCategoryRow(${idx})" class="w-7 h-7 rounded-[4px] text-[#D32F2F] hover:bg-[#FEE2E2] flex items-center justify-center transition-colors mx-auto" title="Xóa danh mục">
                        <i class="fa-solid fa-trash-can text-xs"></i>
                    </button>
                </td>
            </tr>
        `;
    });

    if (categoryRows.length === 0) {
        html = `<tr><td colspan="6" class="py-4 text-center text-[#9CA3AF]">Chưa có danh mục khám nào. Nhấn "Thêm danh mục khám" để bổ sung.</td></tr>`;
    }

    tbody.innerHTML = html;
    if (totalElem) totalElem.innerText = totalGuests;
    updateRealtimeSummary();
}

function addCategoryRow() {
    markFormDirty();
    const masterCats = getMasterCategoriesFromStore();
    const firstCat = masterCats.length > 0 ? masterCats[0] : 'Khám Nội tổng quát';
    categoryRows.push({
        name: firstCat,
        guests: parseInt(document.getElementById('guestCount')?.value) || 250,
        sang: true,
        chieu: true
    });
    renderCategoryTable();
}

function removeCategoryRow(index) {
    markFormDirty();
    categoryRows.splice(index, 1);
    renderCategoryTable();
}

function updateCategoryName(index, val) {
    markFormDirty();
    if (categoryRows[index]) categoryRows[index].name = val;
    updateRealtimeSummary();
}

function updateCategoryGuest(index, val) {
    markFormDirty();
    const parsed = parseInt(val) || 0;
    if (categoryRows[index]) categoryRows[index].guests = parsed;
    
    let total = categoryRows.reduce((sum, r) => sum + (parseInt(r.guests) || 0), 0);
    const totalElem = document.getElementById('total-category-guests');
    if (totalElem) totalElem.innerText = total;
    updateRealtimeSummary();
}

function updateCategoryShift(index, shift, isChecked) {
    markFormDirty();
    if (categoryRows[index]) categoryRows[index][shift] = isChecked;
}

function renderStaffTable() {
    const tbody = document.getElementById('staff-table-body');
    const totalElem = document.getElementById('total-staff-count');
    if (!tbody) return;

    let availablePositions = [
        'Bác sĩ khám Nội',
        'Bác sĩ Siêu âm',
        'Bác sĩ Mắt / Tai Mũi Họng',
        'Điều dưỡng lấy máu & tiếp nhận',
        'Kỹ thuật viên X-Quang',
        'Kỹ thuật viên Điện tim',
        'Cán bộ Điều phối KSK',
        'Dược sĩ / Trả kết quả'
    ];

    let html = '';
    let totalStaff = 0;

    staffRows.forEach((row, idx) => {
        totalStaff += parseInt(row.count || 0);

        let optionsHtml = availablePositions.map(pos => `
            <option value="${pos}" ${pos === row.position ? 'selected' : ''}>${pos}</option>
        `).join('');

        html += `
            <tr class="hover:bg-[#F7F9FC] transition-colors">
                <td class="py-2.5 px-3 text-center font-bold text-[#6B7280]">${idx + 1}</td>
                <td class="py-2.5 px-3">
                    <select onchange="updateStaffPosition(${idx}, this.value)" class="sys-select text-xs h-8">
                        ${optionsHtml}
                    </select>
                </td>
                <td class="py-2.5 px-3 text-right">
                    <input type="number" min="1" value="${row.count}" oninput="updateStaffCount(${idx}, this.value)" class="sys-input text-xs h-8 text-right font-medium">
                </td>
                <td class="py-2.5 px-3 text-center">
                    <input type="checkbox" ${row.sang ? 'checked' : ''} onchange="updateStaffShift(${idx}, 'sang', this.checked)" class="w-4 h-4 text-[#27496D] rounded-[2px] border-[#D9DEE5]">
                </td>
                <td class="py-2.5 px-3 text-center">
                    <input type="checkbox" ${row.chieu ? 'checked' : ''} onchange="updateStaffShift(${idx}, 'chieu', this.checked)" class="w-4 h-4 text-[#27496D] rounded-[2px] border-[#D9DEE5]">
                </td>
                <td class="py-2.5 px-3 text-center">
                    <button type="button" onclick="removeStaffRow(${idx})" class="w-7 h-7 rounded-[4px] text-[#D32F2F] hover:bg-[#FEE2E2] flex items-center justify-center transition-colors mx-auto" title="Xóa nhân sự">
                        <i class="fa-solid fa-trash-can text-xs"></i>
                    </button>
                </td>
            </tr>
        `;
    });

    if (staffRows.length === 0) {
        html = `<tr><td colspan="6" class="py-4 text-center text-[#9CA3AF]">Chưa có dự kiến nhân sự nào. Nhấn "Thêm nhân sự" để bổ sung.</td></tr>`;
    }

    tbody.innerHTML = html;
    if (totalElem) totalElem.innerText = totalStaff;
    updateRealtimeSummary();
}

function addStaffRow() {
    markFormDirty();
    staffRows.push({
        position: 'Cán bộ Điều phối KSK',
        count: 1,
        sang: true,
        chieu: true
    });
    renderStaffTable();
}

function removeStaffRow(index) {
    markFormDirty();
    staffRows.splice(index, 1);
    renderStaffTable();
}

function updateStaffPosition(index, val) {
    markFormDirty();
    if (staffRows[index]) staffRows[index].position = val;
}

function updateStaffCount(index, val) {
    markFormDirty();
    const parsed = parseInt(val) || 0;
    if (staffRows[index]) staffRows[index].count = parsed;

    let total = staffRows.reduce((sum, r) => sum + (parseInt(r.count) || 0), 0);
    const totalElem = document.getElementById('total-staff-count');
    if (totalElem) totalElem.innerText = total;
    updateRealtimeSummary();
}

function updateStaffShift(index, shift, isChecked) {
    markFormDirty();
    if (staffRows[index]) staffRows[index][shift] = isChecked;
}

function updateRealtimeSummary() {
    const examDateInput = document.getElementById('examDate');
    const guestInput = document.getElementById('guestCount');
    const checkSang = document.getElementById('check-shift-sang');
    const checkChieu = document.getElementById('check-shift-chieu');

    const timeSangStart = document.getElementById('time-sang-start')?.value || '07:30';
    const timeSangEnd = document.getElementById('time-sang-end')?.value || '11:00';
    const timeChieuStart = document.getElementById('time-chieu-start')?.value || '13:30';
    const timeChieuEnd = document.getElementById('time-chieu-end')?.value || '17:30';

    const barDate = document.getElementById('bar-summary-date');
    const barTime = document.getElementById('bar-summary-time');
    const barGuests = document.getElementById('bar-summary-guests');
    const barCategories = document.getElementById('bar-summary-categories');
    const barStaff = document.getElementById('bar-summary-staff');

    if (barDate) {
        if (examDateInput && examDateInput.value) {
            const parts = examDateInput.value.split('-');
            barDate.innerText = `${parts[2]}/${parts[1]}/${parts[0]}`;
        } else {
            barDate.innerText = 'Chưa chọn';
        }
    }

    if (barTime) {
        let shifts = [];
        if (checkSang && checkSang.checked) shifts.push(`Sáng (${timeSangStart} - ${timeSangEnd})`);
        if (checkChieu && checkChieu.checked) shifts.push(`Chiều (${timeChieuStart} - ${timeChieuEnd})`);

        barTime.innerText = shifts.length > 0 ? shifts.join(', ') : 'Chưa chọn ca';
    }

    const guestsVal = guestInput ? (parseInt(guestInput.value) || 0) : 0;
    if (barGuests) barGuests.innerText = guestsVal;

    if (barCategories) barCategories.innerText = categoryRows.length;

    const totalStaff = staffRows.reduce((sum, r) => sum + (parseInt(r.count) || 0), 0);
    if (barStaff) barStaff.innerText = totalStaff;
}

function scrollToSection(sectionId, event) {
    if (event) event.preventDefault();
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        
        const navItems = document.querySelectorAll('.anchor-nav-item');
        navItems.forEach(item => {
            const href = item.getAttribute('href')?.replace('#', '');
            if (href === sectionId) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }
}

function setupScrollSpy() {
    const navItems = document.querySelectorAll('.anchor-nav-item');
    const sections = [
        { id: 'section-thong-tin-lich', elem: document.getElementById('section-thong-tin-lich') },
        { id: 'section-danh-muc-kham', elem: document.getElementById('section-danh-muc-kham') },
        { id: 'section-du-kien-nhan-su', elem: document.getElementById('section-du-kien-nhan-su') }
    ];

    const scrollContainer = document.querySelector('.overflow-y-auto');
    if (!scrollContainer) return;

    function updateActiveAnchor() {
        const containerRect = scrollContainer.getBoundingClientRect();
        const isBottom = scrollContainer.scrollTop + scrollContainer.clientHeight >= scrollContainer.scrollHeight - 80;

        let activeId = '';

        if (isBottom) {
            activeId = 'section-du-kien-nhan-su';
        } else {
            sections.forEach(sec => {
                if (!sec.elem) return;
                const rect = sec.elem.getBoundingClientRect();
                const relativeTop = rect.top - containerRect.top;
                if (relativeTop <= 160) {
                    activeId = sec.id;
                }
            });
        }

        if (!activeId && sections[0].elem) activeId = sections[0].id;

        navItems.forEach(item => {
            const href = item.getAttribute('href')?.replace('#', '');
            if (href === activeId) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }

    scrollContainer.addEventListener('scroll', updateActiveAnchor);
    setTimeout(updateActiveAnchor, 200);
}

function validateField(fieldName) {
    let isValid = true;

    if (fieldName === 'examDate') {
        const input = document.getElementById('examDate');
        const err = document.getElementById('err-examDate');
        if (!input || !input.value) {
            if (input) input.classList.add('border-[#D32F2F]');
            if (err) err.classList.remove('hidden');
            isValid = false;
        } else {
            if (input) input.classList.remove('border-[#D32F2F]');
            if (err) err.classList.add('hidden');
        }
    }

    if (fieldName === 'shift') {
        const checkSang = document.getElementById('check-shift-sang');
        const checkChieu = document.getElementById('check-shift-chieu');
        const err = document.getElementById('err-shift');
        if ((!checkSang || !checkSang.checked) && (!checkChieu || !checkChieu.checked)) {
            if (err) err.classList.remove('hidden');
            isValid = false;
        } else {
            if (err) err.classList.add('hidden');
        }
    }

    if (fieldName === 'province') {
        const input = document.getElementById('province');
        const err = document.getElementById('err-province');
        if (!input || !input.value) {
            if (input) input.classList.add('border-[#D32F2F]');
            if (err) err.classList.remove('hidden');
            isValid = false;
        } else {
            if (input) input.classList.remove('border-[#D32F2F]');
            if (err) err.classList.add('hidden');
        }
    }

    if (fieldName === 'facility') {
        const input = document.getElementById('facility');
        const err = document.getElementById('err-facility');
        if (!input || !input.value) {
            if (input) input.classList.add('border-[#D32F2F]');
            if (err) err.classList.remove('hidden');
            isValid = false;
        } else {
            if (input) input.classList.remove('border-[#D32F2F]');
            if (err) err.classList.add('hidden');
        }
    }

    if (fieldName === 'guestCount') {
        const input = document.getElementById('guestCount');
        const err = document.getElementById('err-guestCount');
        if (!input || !input.value || parseInt(input.value) <= 0) {
            if (input) input.classList.add('border-[#D32F2F]');
            if (err) err.classList.remove('hidden');
            isValid = false;
        } else {
            if (input) input.classList.remove('border-[#D32F2F]');
            if (err) err.classList.add('hidden');
        }
    }

    return isValid;
}

function validateForm() {
    let isValid = true;
    isValid = validateField('examDate') && isValid;
    isValid = validateField('shift') && isValid;
    isValid = validateField('province') && isValid;
    isValid = validateField('facility') && isValid;
    isValid = validateField('guestCount') && isValid;

    if (!isValid && window.showToast) {
        window.showToast('Vui lòng hoàn thiện tất cả các trường dữ liệu bắt buộc!', 'error');
    }
    return isValid;
}

function handleSaveAndExit() {
    if (!validateForm()) return;

    saveScheduleToDataStore();
    isFormDirty = false;

    if (window.showToast) {
        window.showToast('Đã lưu thành công lịch khám tại viện!', 'success');
    }

    const params = new URLSearchParams(window.location.search);
    const editId = params.get('editId');
    const targetUrl = editId ? `../edit/edit.html?id=${editId}&step=2` : '../create/create.html?step=2';

    setTimeout(() => {
        window.location.href = targetUrl;
    }, 400);
}

function handleSaveAndContinue() {
    if (!validateForm()) return;

    const params = new URLSearchParams(window.location.search);
    const editId = params.get('editId');
    const storageKey = editId ? `mwk_edit_schedule_draft_${editId}` : 'mwk_create_schedule_draft';

    let draft = {};
    const draftJson = sessionStorage.getItem(storageKey);
    if (draftJson) {
        try { draft = JSON.parse(draftJson); } catch (e) {}
    }

    if (!draft.step2Data) {
        draft.step2Data = { ngoaiVien: [], taiVien: [], lichPhuong: [] };
    }

    const examDateVal = document.getElementById('examDate')?.value || new Date().toISOString().split('T')[0];
    const facility = document.getElementById('facility')?.value || 'Medlatec Ba Đình';
    const guestCount = parseInt(document.getElementById('guestCount')?.value) || 250;
    const totalStaff = staffRows.reduce((sum, r) => sum + (parseInt(r.count) || 0), 0);

    const checkSang = document.getElementById('check-shift-sang')?.checked || false;
    const checkChieu = document.getElementById('check-shift-chieu')?.checked || false;

    const timeSangStart = document.getElementById('time-sang-start')?.value || '07:30';
    const timeSangEnd = document.getElementById('time-sang-end')?.value || '11:00';
    const timeChieuStart = document.getElementById('time-chieu-start')?.value || '13:30';
    const timeChieuEnd = document.getElementById('time-chieu-end')?.value || '17:30';

    let dateParts = examDateVal.split('-');
    let dateCode = '230725';
    let formattedDate = '23/07/2025';
    if (dateParts.length === 3) {
        const yy = dateParts[0].slice(-2);
        const mm = dateParts[1];
        const dd = dateParts[2];
        dateCode = `${dd}${mm}${yy}`;
        formattedDate = `${dd}/${mm}/${dateParts[0]}`;
    }

    let shiftCode = 'S';
    if (checkSang && checkChieu) shiftCode = 'S,C';
    else if (checkChieu) shiftCode = 'C';

    const maLich = `${dateCode} - TV - ${shiftCode}`;

    let facilityShort = facility;
    if (facility.includes('-')) {
        facilityShort = facility.split('-')[0].trim();
    }
    if (facilityShort.startsWith('Medlatec')) {
        facilityShort = facilityShort.replace('Medlatec', 'Med');
    }

    if (!draft.step2Data.taiVien) draft.step2Data.taiVien = [];
    const itemIndex = draft.step2Data.taiVien.length + 1;
    const newTaiVienItem = {
        id: `TV-${dateCode}-00${itemIndex}`,
        maLich: maLich,
        loaiLich: 'TAI_VIEN',
        ngayKham: examDateVal,
        ngayKhamFormatted: formattedDate,
        caSang: checkSang,
        caChieu: checkChieu,
        gioSang: checkSang ? { batDau: timeSangStart, ketThuc: timeSangEnd } : null,
        gioChieu: checkChieu ? { batDau: timeChieuStart, ketThuc: timeChieuEnd } : null,
        diaDiemKham: facilityShort,
        soLuongKhach: guestCount,
        tongNhanSu: totalStaff,
        danhMucKham: categoryRows,
        nhanSu: staffRows,
        trangThai: 'TAO_MOI',
        createdAt: new Date().toISOString()
    };

    draft.step2Data.taiVien.push(newTaiVienItem);
    draft.currentStep = 2;

    sessionStorage.setItem(storageKey, JSON.stringify(draft));
    isFormDirty = false;

    if (window.showToast) {
        window.showToast('Đã lưu lịch khám tại viện!', 'success');
    }

    const targetUrl = editId ? `../edit/edit.html?id=${editId}&step=2` : '../create/create.html?step=2';
    setTimeout(() => {
        window.location.href = targetUrl;
    }, 400);
}

function handleExitTaiVien() {
    const params = new URLSearchParams(window.location.search);
    const editId = params.get('editId');
    const targetUrl = editId ? `../edit/edit.html?id=${editId}&step=2` : '../create/create.html?step=2';
    handleBreadcrumbClick(targetUrl);
}

function saveScheduleToDataStore() {
    const params = new URLSearchParams(window.location.search);
    const editId = params.get('editId');
    const storageKey = editId ? `mwk_edit_schedule_draft_${editId}` : 'mwk_create_schedule_draft';

    let draft = {};
    const draftJson = sessionStorage.getItem(storageKey);
    if (draftJson) {
        try { draft = JSON.parse(draftJson); } catch (e) {}
    }

    if (!draft.step2Data) {
        draft.step2Data = { ngoaiVien: [], taiVien: [], lichPhuong: [] };
    }
    if (!draft.step2Data.taiVien) draft.step2Data.taiVien = [];

    const examDateVal = document.getElementById('examDate')?.value || new Date().toISOString().split('T')[0];
    const facility = document.getElementById('facility')?.value || 'Medlatec Ba Đình';
    const guestCount = parseInt(document.getElementById('guestCount')?.value) || 250;
    const totalStaff = staffRows.reduce((sum, r) => sum + (parseInt(r.count) || 0), 0);

    const checkSang = document.getElementById('check-shift-sang')?.checked || false;
    const checkChieu = document.getElementById('check-shift-chieu')?.checked || false;

    const timeSangStart = document.getElementById('time-sang-start')?.value || '07:30';
    const timeSangEnd = document.getElementById('time-sang-end')?.value || '11:00';
    const timeChieuStart = document.getElementById('time-chieu-start')?.value || '13:30';
    const timeChieuEnd = document.getElementById('time-chieu-end')?.value || '17:30';

    let dateParts = examDateVal.split('-');
    let dateCode = '230725';
    let formattedDate = '23/07/2025';
    if (dateParts.length === 3) {
        const yy = dateParts[0].slice(-2);
        const mm = dateParts[1];
        const dd = dateParts[2];
        dateCode = `${dd}${mm}${yy}`;
        formattedDate = `${dd}/${mm}/${dateParts[0]}`;
    }

    let shiftCode = 'S';
    if (checkSang && checkChieu) shiftCode = 'S,C';
    else if (checkChieu) shiftCode = 'C';

    const maLich = `${dateCode} - TV - ${shiftCode}`;
    const itemIndex = draft.step2Data.taiVien.length + 1;

    let facilityShort = facility;
    if (facility.includes('-')) {
        facilityShort = facility.split('-')[0].trim();
    }
    if (facilityShort.startsWith('Medlatec')) {
        facilityShort = facilityShort.replace('Medlatec', 'Med');
    }

    const newItem = {
        id: `TV-${dateCode}-00${itemIndex}`,
        maLich: maLich,
        loaiLich: 'TAI_VIEN',
        ngayKham: examDateVal,
        ngayKhamFormatted: formattedDate,
        caSang: checkSang,
        caChieu: checkChieu,
        gioSang: checkSang ? { batDau: timeSangStart, ketThuc: timeSangEnd } : null,
        gioChieu: checkChieu ? { batDau: timeChieuStart, ketThuc: timeChieuEnd } : null,
        diaDiemKham: facilityShort,
        soLuongKhach: guestCount,
        tongNhanSu: totalStaff,
        danhMucKham: categoryRows,
        nhanSu: staffRows,
        trangThai: 'TAO_MOI',
        createdAt: new Date().toISOString()
    };

    draft.step2Data.taiVien.push(newItem);
    sessionStorage.setItem(storageKey, JSON.stringify(draft));
}

function openDinhMucModalTV() {
    const modal = document.getElementById('modal-view-dinh-muc-tv');
    if (modal) modal.classList.remove('hidden');
}

function closeDinhMucModalTV() {
    const modal = document.getElementById('modal-view-dinh-muc-tv');
    if (modal) modal.classList.add('hidden');
}
