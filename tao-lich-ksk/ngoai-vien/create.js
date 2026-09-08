/**
 * MWK - THÊM LỊCH NGOẠI VIỆN | NGOAI-VIEN MODULE JS LOGIC
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
        'Khám Nội tổng quát ngoại viện',
        'Lấy máu xét nghiệm tại đơn vị',
        'Điện tâm đồ (ECG lưu động)',
        'Siêu âm tổng quát (Máy siêu âm màu xách tay)',
        'Chụp X-quang kỹ thuật số (Xe khám lưu động)',
        'Khám Tai Mũi Họng ngoại viện',
        'Khám Mắt & Đo thị lực',
        'Khám Răng Hàm Mặt',
        'Khám Sản phụ khoa ngoại viện',
        'Đo Chức năng hô hấp (Máy đo lưu động)',
        'Xét nghiệm Tầm soát Ung thư'
    ];
}

document.addEventListener('DOMContentLoaded', function () {
    initHeaderDataFromUrl();
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
    const fields = ['examDate', 'province', 'facility', 'guestCount', 'soLuongNam', 'soLuongNu', 'notes', 'time-sang-start', 'time-sang-end', 'time-chieu-start', 'time-chieu-end'];
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

function customizeBreadcrumbForNgoaiVien() {
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
        <span id="breadcrumb-current" class="font-semibold text-[#1F2937]">Thêm lịch ngoại viện</span>
    `;
}

function initBreadcrumbWithRetry() {
    let attempts = 0;
    const interval = setInterval(() => {
        attempts++;
        const container = document.getElementById('breadcrumb-container');
        if (container) {
            customizeBreadcrumbForNgoaiVien();
            clearInterval(interval);
        }
        if (attempts > 30) clearInterval(interval);
    }, 100);
}

function handleBreadcrumbClick(targetUrl) {
    if (isFormDirty) {
        if (confirm('Bạn có sự thay đổi chưa lưu tại màn Thêm lịch ngoại viện. Bạn có chắc chắn muốn quay lại không?')) {
            window.location.href = targetUrl;
        }
    } else {
        window.location.href = targetUrl;
    }
}

function handleHomeBreadcrumbClick(event) {
    if (isFormDirty) {
        if (!confirm('Bạn có sự thay đổi chưa lưu tại màn Thêm lịch ngoại viện. Bạn có chắc chắn muốn quay lại Trang chủ không?')) {
            event.preventDefault();
            return false;
        }
    }
    return true;
}

function initHeaderDataFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const customerName = params.get('customerName') || 'Công ty cổ phần ABC';
    const customerCode = params.get('customerCode') || 'KAD019962025';
    const estimatedCount = params.get('estimatedCount') || '180';

    const customerElem = document.getElementById('header-display-customer');
    const codeElem = document.getElementById('header-display-code');
    const guestsElem = document.getElementById('header-display-guests');

    if (customerElem) customerElem.innerText = customerName;
    if (codeElem) codeElem.innerText = customerCode;
    if (guestsElem) guestsElem.innerText = estimatedCount;

    const guestInput = document.getElementById('guestCount');
    if (guestInput && estimatedCount) {
        guestInput.value = estimatedCount;
    }
}

function setDefaultExamDate() {
    const examDateElem = document.getElementById('examDate');
    if (examDateElem && !examDateElem.value) {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        examDateElem.value = `${yyyy}-${mm}-${dd}`;
    }
}

function toggleShiftInput(shiftType) {
    markFormDirty();
    const isSang = document.getElementById('check-shift-sang')?.checked || false;
    const isChieu = document.getElementById('check-shift-chieu')?.checked || false;

    const sangStart = document.getElementById('time-sang-start');
    const sangEnd = document.getElementById('time-sang-end');
    const chieuStart = document.getElementById('time-chieu-start');
    const chieuEnd = document.getElementById('time-chieu-end');

    if (sangStart && sangEnd) {
        sangStart.disabled = !isSang;
        sangEnd.disabled = !isSang;
    }
    if (chieuStart && chieuEnd) {
        chieuStart.disabled = !isChieu;
        chieuEnd.disabled = !isChieu;
    }

    updateRealtimeSummary();
}

function toggleWorkTypePill(btnElem) {
    markFormDirty();
    const isSelected = btnElem.classList.contains('active');
    const icon = btnElem.querySelector('i');

    if (isSelected) {
        btnElem.classList.remove('active', 'border-[#ED6C02]', 'bg-[#FFF3E0]', 'text-[#ED6C02]', 'font-semibold');
        btnElem.classList.add('border-[#D9DEE5]', 'bg-white', 'text-[#4B5563]');
        if (icon) {
            icon.className = 'fa-solid fa-plus text-[10px] mr-1 text-[#6B7280]';
        }
    } else {
        btnElem.classList.add('active', 'border-[#ED6C02]', 'bg-[#FFF3E0]', 'text-[#ED6C02]', 'font-semibold');
        btnElem.classList.remove('border-[#D9DEE5]', 'bg-white', 'text-[#4B5563]');
        if (icon) {
            icon.className = 'fa-solid fa-check text-[10px] mr-1 text-[#ED6C02]';
        }
    }
}

function showAddCustomWorkTypeInput() {
    const wrapperBtn = document.getElementById('btn-show-add-work-type');
    const inlineBox = document.getElementById('inline-add-work-type-box');
    const inputElem = document.getElementById('input-custom-work-type');

    if (wrapperBtn) wrapperBtn.classList.add('hidden');
    if (inlineBox) inlineBox.classList.remove('hidden');
    if (inputElem) {
        inputElem.value = '';
        inputElem.focus();
    }
}

function confirmAddCustomWorkType() {
    const inputElem = document.getElementById('input-custom-work-type');
    const val = inputElem ? inputElem.value.trim() : '';

    if (!val) {
        cancelAddCustomWorkType();
        return;
    }

    const pillsContainer = document.getElementById('work-type-pills');
    const customWrapper = document.getElementById('custom-work-type-wrapper');

    if (pillsContainer && customWrapper) {
        const newBtn = document.createElement('button');
        newBtn.type = 'button';
        newBtn.onclick = function() { toggleWorkTypePill(this); };
        newBtn.className = 'pill-btn active border-[#ED6C02] bg-[#FFF3E0] text-[#ED6C02] font-semibold';
        newBtn.innerHTML = `<i class="fa-solid fa-check text-[10px] mr-1 text-[#ED6C02]"></i>${val}`;

        pillsContainer.insertBefore(newBtn, customWrapper);
        markFormDirty();
    }

    cancelAddCustomWorkType();
}

function cancelAddCustomWorkType() {
    const wrapperBtn = document.getElementById('btn-show-add-work-type');
    const inlineBox = document.getElementById('inline-add-work-type-box');

    if (inlineBox) inlineBox.classList.add('hidden');
    if (wrapperBtn) wrapperBtn.classList.remove('hidden');
}

function getInitialCategories() {
    const categories = getMasterCategoriesFromStore();
    return [
        { name: categories[0] || 'Khám Nội tổng quát ngoại viện', guests: 180, sang: true, chieu: true },
        { name: categories[1] || 'Lấy máu xét nghiệm tại đơn vị', guests: 180, sang: true, chieu: false },
        { name: categories[2] || 'Điện tâm đồ (ECG lưu động)', guests: 180, sang: true, chieu: true },
        { name: categories[3] || 'Siêu âm tổng quát (Máy siêu âm màu xách tay)', guests: 180, sang: true, chieu: true }
    ];
}

function getInitialStaff() {
    return [
        { title: 'Bác sĩ Khám Nội lưu động', count: 4, sang: true, chieu: true },
        { title: 'Điều dưỡng Lấy mẫu xét nghiệm', count: 6, sang: true, chieu: false },
        { title: 'Kỹ thuật viên Siêu âm & ECG', count: 4, sang: true, chieu: true },
        { title: 'Kỹ thuật viên Chụp X-quang xe lưu động', count: 2, sang: true, chieu: true },
        { title: 'Cán bộ Điều phối & Tiếp đón ngoại viện', count: 2, sang: true, chieu: true }
    ];
}

function renderCategoryTable() {
    if (categoryRows.length === 0) {
        categoryRows = getInitialCategories();
    }

    const tbody = document.getElementById('category-table-body');
    if (!tbody) return;

    let html = '';
    const masterCategories = getMasterCategoriesFromStore();

    categoryRows.forEach((row, idx) => {
        let optionsHtml = '';
        let matched = false;
        masterCategories.forEach(cat => {
            const isSelected = cat === row.name;
            if (isSelected) matched = true;
            optionsHtml += `<option value="${cat}" ${isSelected ? 'selected' : ''}>${cat}</option>`;
        });
        if (!matched && row.name) {
            optionsHtml += `<option value="${row.name}" selected>${row.name}</option>`;
        }

        html += `
            <tr class="hover:bg-[#F8FAFC]">
                <td class="py-2 px-3 text-center font-bold text-[#6B7280]">${idx + 1}</td>
                <td class="py-2 px-3">
                    <select onchange="updateCategoryRow(${idx}, 'name', this.value)" class="sys-select text-xs h-8">
                        ${optionsHtml}
                    </select>
                </td>
                <td class="py-2 px-3 text-right">
                    <input type="number" min="0" value="${row.guests}" oninput="updateCategoryRow(${idx}, 'guests', this.value)" class="sys-input text-xs h-8 text-right font-bold text-[#ED6C02] w-24">
                </td>
                <td class="py-2 px-3 text-center">
                    <input type="checkbox" ${row.sang ? 'checked' : ''} onchange="updateCategoryRow(${idx}, 'sang', this.checked)" class="w-4 h-4 text-[#ED6C02] rounded-[2px]">
                </td>
                <td class="py-2 px-3 text-center">
                    <input type="checkbox" ${row.chieu ? 'checked' : ''} onchange="updateCategoryRow(${idx}, 'chieu', this.checked)" class="w-4 h-4 text-[#ED6C02] rounded-[2px]">
                </td>
                <td class="py-2 px-3 text-center">
                    <button type="button" onclick="deleteCategoryRow(${idx})" class="w-6 h-6 rounded-[2px] text-[#D32F2F] hover:bg-[#FEE2E2] flex items-center justify-center transition-colors">
                        <i class="fa-solid fa-trash-can text-xs"></i>
                    </button>
                </td>
            </tr>
        `;
    });

    tbody.innerHTML = html;
    updateCategoryTotals();
}

function updateCategoryRow(index, field, value) {
    markFormDirty();
    if (field === 'guests') {
        categoryRows[index][field] = parseInt(value) || 0;
    } else {
        categoryRows[index][field] = value;
    }
    updateCategoryTotals();
    updateRealtimeSummary();
}

function addCategoryRow() {
    markFormDirty();
    const guestInput = document.getElementById('guestCount');
    const defaultGuests = guestInput ? parseInt(guestInput.value) || 180 : 180;
    const categories = getMasterCategoriesFromStore();

    categoryRows.push({
        name: categories[0] || 'Danh mục mới',
        guests: defaultGuests,
        sang: true,
        chieu: true
    });
    renderCategoryTable();
}

function deleteCategoryRow(index) {
    markFormDirty();
    categoryRows.splice(index, 1);
    renderCategoryTable();
}

function updateCategoryTotals() {
    const totalGuests = categoryRows.reduce((sum, r) => sum + (parseInt(r.guests) || 0), 0);
    const elem = document.getElementById('total-category-guests');
    if (elem) elem.innerText = totalGuests;
}

function renderStaffTable() {
    if (staffRows.length === 0) {
        staffRows = getInitialStaff();
    }

    const tbody = document.getElementById('staff-table-body');
    if (!tbody) return;

    let html = '';
    staffRows.forEach((row, idx) => {
        html += `
            <tr class="hover:bg-[#F8FAFC]">
                <td class="py-2 px-3 text-center font-bold text-[#6B7280]">${idx + 1}</td>
                <td class="py-2 px-3">
                    <input type="text" value="${row.title}" oninput="updateStaffRow(${idx}, 'title', this.value)" class="sys-input text-xs h-8 font-medium">
                </td>
                <td class="py-2 px-3 text-right">
                    <input type="number" min="1" value="${row.count}" oninput="updateStaffRow(${idx}, 'count', this.value)" class="sys-input text-xs h-8 text-right font-bold text-[#ED6C02] w-20">
                </td>
                <td class="py-2 px-3 text-center">
                    <input type="checkbox" ${row.sang ? 'checked' : ''} onchange="updateStaffRow(${idx}, 'sang', this.checked)" class="w-4 h-4 text-[#ED6C02] rounded-[2px]">
                </td>
                <td class="py-2 px-3 text-center">
                    <input type="checkbox" ${row.chieu ? 'checked' : ''} onchange="updateStaffRow(${idx}, 'chieu', this.checked)" class="w-4 h-4 text-[#ED6C02] rounded-[2px]">
                </td>
                <td class="py-2 px-3 text-center">
                    <button type="button" onclick="deleteStaffRow(${idx})" class="w-6 h-6 rounded-[2px] text-[#D32F2F] hover:bg-[#FEE2E2] flex items-center justify-center transition-colors">
                        <i class="fa-solid fa-trash-can text-xs"></i>
                    </button>
                </td>
            </tr>
        `;
    });

    tbody.innerHTML = html;
    updateStaffTotals();
}

function updateStaffRow(index, field, value) {
    markFormDirty();
    if (field === 'count') {
        staffRows[index][field] = parseInt(value) || 0;
    } else {
        staffRows[index][field] = value;
    }
    updateStaffTotals();
    updateRealtimeSummary();
}

function addStaffRow() {
    markFormDirty();
    staffRows.push({
        title: 'Nhân sự hỗ trợ lưu động mới',
        count: 2,
        sang: true,
        chieu: true
    });
    renderStaffTable();
}

function deleteStaffRow(index) {
    markFormDirty();
    staffRows.splice(index, 1);
    renderStaffTable();
}

function updateStaffTotals() {
    const totalStaff = staffRows.reduce((sum, r) => sum + (parseInt(r.count) || 0), 0);
    const elem = document.getElementById('total-staff-count');
    if (elem) elem.innerText = totalStaff;
}

function updateRealtimeSummary() {
    const examDateVal = document.getElementById('examDate')?.value || '';
    let formattedDate = '---';
    if (examDateVal) {
        const parts = examDateVal.split('-');
        if (parts.length === 3) {
            formattedDate = `${parts[2]}/${parts[1]}/${parts[0]}`;
        }
    }

    const isSang = document.getElementById('check-shift-sang')?.checked;
    const isChieu = document.getElementById('check-shift-chieu')?.checked;

    const sangStart = document.getElementById('time-sang-start')?.value || '07:30';
    const sangEnd = document.getElementById('time-sang-end')?.value || '11:00';
    const chieuStart = document.getElementById('time-chieu-start')?.value || '13:30';
    const chieuEnd = document.getElementById('time-chieu-end')?.value || '17:30';

    let timeText = 'Chưa chọn ca';
    if (isSang && isChieu) {
        timeText = `${sangStart} - ${sangEnd}, ${chieuStart} - ${chieuEnd}`;
    } else if (isSang) {
        timeText = `${sangStart} - ${sangEnd}`;
    } else if (isChieu) {
        timeText = `${chieuStart} - ${chieuEnd}`;
    }

    const guestCount = document.getElementById('guestCount')?.value || '0';
    const totalCategories = categoryRows.length;
    const totalStaff = staffRows.reduce((sum, r) => sum + (parseInt(r.count) || 0), 0);

    const barDate = document.getElementById('bar-summary-date');
    const barTime = document.getElementById('bar-summary-time');
    const barGuests = document.getElementById('bar-summary-guests');
    const barCategories = document.getElementById('bar-summary-categories');
    const barStaff = document.getElementById('bar-summary-staff');

    if (barDate) barDate.innerText = formattedDate;
    if (barTime) barTime.innerText = timeText;
    if (barGuests) barGuests.innerText = guestCount;
    if (barCategories) barCategories.innerText = totalCategories;
    if (barStaff) barStaff.innerText = totalStaff;
}

function scrollToSection(sectionId, event) {
    if (event) event.preventDefault();
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

function setupScrollSpy() {
    const sections = ['section-thong-tin-lich', 'section-danh-muc-kham', 'section-du-kien-nhan-su'];
    const navItems = {
        'section-thong-tin-lich': document.getElementById('nav-anchor-lich'),
        'section-danh-muc-kham': document.getElementById('nav-anchor-danh-muc'),
        'section-du-kien-nhan-su': document.getElementById('nav-anchor-nhan-su')
    };

    const mainScrollable = document.querySelector('.overflow-y-auto');
    if (!mainScrollable) return;

    mainScrollable.addEventListener('scroll', function () {
        let current = '';
        sections.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                const rect = el.getBoundingClientRect();
                if (rect.top <= 200) {
                    current = id;
                }
            }
        });

        Object.keys(navItems).forEach(id => {
            const item = navItems[id];
            if (item) {
                if (id === current) {
                    item.className = 'anchor-nav-item active';
                } else {
                    item.className = 'anchor-nav-item';
                }
            }
        });
    });
}

function toggleSectionCollapse(contentId, btnElem) {
    const content = document.getElementById(contentId);
    if (!content) return;
    const isHidden = content.classList.contains('hidden');
    const icon = btnElem.querySelector('i');
    const label = btnElem.querySelector('span');

    if (isHidden) {
        content.classList.remove('hidden');
        if (label) label.innerText = 'Thu gọn';
        if (icon) icon.className = 'fa-solid fa-chevron-up text-xs';
    } else {
        content.classList.add('hidden');
        if (label) label.innerText = 'Mở rộng';
        if (icon) icon.className = 'fa-solid fa-chevron-down text-xs';
    }
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
        const checkSang = document.getElementById('check-shift-sang')?.checked;
        const checkChieu = document.getElementById('check-shift-chieu')?.checked;
        const err = document.getElementById('err-shift');
        if (!checkSang && !checkChieu) {
            if (err) err.classList.remove('hidden');
            isValid = false;
        } else {
            if (err) err.classList.add('hidden');
        }
    }

    if (fieldName === 'province') {
        const select = document.getElementById('province');
        const err = document.getElementById('err-province');
        if (!select || !select.value) {
            if (select) select.classList.add('border-[#D32F2F]');
            if (err) err.classList.remove('hidden');
            isValid = false;
        } else {
            if (select) select.classList.remove('border-[#D32F2F]');
            if (err) err.classList.add('hidden');
        }
    }

    if (fieldName === 'facility') {
        const select = document.getElementById('facility');
        const err = document.getElementById('err-facility');
        if (!select || !select.value) {
            if (select) select.classList.add('border-[#D32F2F]');
            if (err) err.classList.remove('hidden');
            isValid = false;
        } else {
            if (select) select.classList.remove('border-[#D32F2F]');
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
    sessionStorage.removeItem('mwk_create_schedule_draft');

    if (window.showToast) {
        window.showToast('Đã lưu thành công lịch khám ngoại viện!', 'success');
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
    const facility = document.getElementById('facility')?.value || 'Ngoại viện';
    const guestCount = parseInt(document.getElementById('guestCount')?.value) || 180;
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

    const maLich = `${dateCode} - NV - ${shiftCode}`;

    if (!draft.step2Data.ngoaiVien) draft.step2Data.ngoaiVien = [];
    const itemIndex = draft.step2Data.ngoaiVien.length + 1;
    const newNgoaiVienItem = {
        id: `NV-${dateCode}-00${itemIndex}`,
        maLich: maLich,
        loaiLich: 'NGOAI_VIEN',
        ngayKham: examDateVal,
        ngayKhamFormatted: formattedDate,
        caSang: checkSang,
        caChieu: checkChieu,
        gioSang: checkSang ? { batDau: timeSangStart, ketThuc: timeSangEnd } : null,
        gioChieu: checkChieu ? { batDau: timeChieuStart, ketThuc: timeChieuEnd } : null,
        diaDiemKham: facility,
        soLuongKhach: guestCount,
        tongNhanSu: totalStaff,
        danhMucKham: categoryRows,
        nhanSu: staffRows,
        trangThai: 'TAO_MOI',
        createdAt: new Date().toISOString()
    };

    draft.step2Data.ngoaiVien.push(newNgoaiVienItem);
    draft.currentStep = 2;

    sessionStorage.setItem(storageKey, JSON.stringify(draft));
    isFormDirty = false;

    if (window.showToast) {
        window.showToast('Đã lưu lịch khám ngoại viện!', 'success');
    }

    const targetUrl = editId ? `../edit/edit.html?id=${editId}&step=2` : '../create/create.html?step=2';
    setTimeout(() => {
        window.location.href = targetUrl;
    }, 400);
}

function handleExitNgoaiVien() {
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
    if (!draft.step2Data.ngoaiVien) draft.step2Data.ngoaiVien = [];

    const examDateVal = document.getElementById('examDate')?.value || new Date().toISOString().split('T')[0];
    const facility = document.getElementById('facility')?.value || 'Ngoại viện';
    const guestCount = parseInt(document.getElementById('guestCount')?.value) || 180;
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

    const maLich = `${dateCode} - NV - ${shiftCode}`;
    const itemIndex = draft.step2Data.ngoaiVien.length + 1;

    const newItem = {
        id: `NV-${dateCode}-00${itemIndex}`,
        maLich: maLich,
        loaiLich: 'NGOAI_VIEN',
        ngayKham: examDateVal,
        ngayKhamFormatted: formattedDate,
        caSang: checkSang,
        caChieu: checkChieu,
        gioSang: checkSang ? { batDau: timeSangStart, ketThuc: timeSangEnd } : null,
        gioChieu: checkChieu ? { batDau: timeChieuStart, ketThuc: timeChieuEnd } : null,
        diaDiemKham: facility,
        soLuongKhach: guestCount,
        tongNhanSu: totalStaff,
        danhMucKham: categoryRows,
        nhanSu: staffRows,
        trangThai: 'TAO_MOI',
        createdAt: new Date().toISOString()
    };

    draft.step2Data.ngoaiVien.push(newItem);
    sessionStorage.setItem(storageKey, JSON.stringify(draft));
}

function openDinhMucModalNV() {
    const modal = document.getElementById('modal-view-dinh-muc-nv');
    if (modal) modal.classList.remove('hidden');
}

function closeDinhMucModalNV() {
    const modal = document.getElementById('modal-view-dinh-muc-nv');
    if (modal) modal.classList.add('hidden');
}
