/**
 * MWK - CHỈNH SỬA LỊCH PHƯỜNG | LICH-PHUONG MODULE EDIT JS LOGIC
 */

let isFormDirty = false;
let categoryRows = [];
let staffRows = [];
let currentSubId = null;

document.addEventListener('DOMContentLoaded', function () {
    initEditModule();
});

function initEditModule() {
    const params = new URLSearchParams(window.location.search);
    currentSubId = params.get('subId') || params.get('id');

    loadHeaderDataFromDraft();
    loadSubScheduleData();
    renderCategoryTable();
    renderStaffTable();
    updateRealtimeSummary();
    customizeBreadcrumb();
}

function customizeBreadcrumb() {
    const breadcrumbContainer = document.getElementById('breadcrumb-container');
    if (!breadcrumbContainer) return;

    const params = new URLSearchParams(window.location.search);
    const editId = params.get('editId');
    const parentUrl = editId ? `../edit/edit.html?id=${editId}&step=2` : '../create/create.html?step=2';

    breadcrumbContainer.innerHTML = `
        <a href="../../bao-cao-thong-ke/bao-cao-doan-kham/bao-cao-doan-kham.html" class="hover:text-[#27496D] flex items-center gap-1.5 text-[#6B7280]">
            <i class="fa-solid fa-house text-[#9CA3AF] text-xs"></i> <span>Trang chủ</span>
        </a>
        <i class="fa-solid fa-chevron-right text-[9px] text-[#9CA3AF]"></i>
        <a href="javascript:void(0)" onclick="window.location.href='${parentUrl}'" class="hover:text-[#27496D] text-[#6B7280] font-medium transition-colors">
            Chỉnh sửa lịch khám đơn vị
        </a>
        <i class="fa-solid fa-chevron-right text-[9px] text-[#9CA3AF]"></i>
        <span class="font-semibold text-[#1F2937]">Chỉnh sửa lịch phường</span>
    `;
}

function loadHeaderDataFromDraft() {
    const params = new URLSearchParams(window.location.search);
    const editId = params.get('editId');
    const draftKey = editId ? `mwk_edit_schedule_draft_${editId}` : 'mwk_create_schedule_draft';

    let draft = {};
    const draftJson = sessionStorage.getItem(draftKey);
    if (draftJson) {
        try { draft = JSON.parse(draftJson); } catch (e) {}
    }

    const customerName = draft.customerName || draft.contactPerson || 'UBND Phường Cống Vị';
    const customerCode = draft.customerCode || 'KAD019962025';
    const estimatedCount = draft.estimatedCount || '120';

    const customerElem = document.getElementById('header-display-customer');
    const codeElem = document.getElementById('header-display-code');
    const guestsElem = document.getElementById('header-display-guests');

    if (customerElem) customerElem.innerText = customerName;
    if (codeElem) codeElem.innerText = customerCode;
    if (guestsElem) guestsElem.innerText = estimatedCount;
}

function loadSubScheduleData() {
    const params = new URLSearchParams(window.location.search);
    const editId = params.get('editId');
    const draftKey = editId ? `mwk_edit_schedule_draft_${editId}` : 'mwk_create_schedule_draft';

    let draft = {};
    const draftJson = sessionStorage.getItem(draftKey);
    if (draftJson) {
        try { draft = JSON.parse(draftJson); } catch (e) {}
    }

    const list = draft.step2Data && draft.step2Data.lichPhuong ? draft.step2Data.lichPhuong : [];
    const item = list.find(s => String(s.id) === String(currentSubId)) || list[0];

    if (item) {
        const examDateElem = document.getElementById('examDate');
        if (examDateElem && item.ngayKham) examDateElem.value = item.ngayKham;

        const checkSang = document.getElementById('check-shift-sang');
        const checkChieu = document.getElementById('check-shift-chieu');
        if (checkSang) checkSang.checked = !!item.caSang;
        if (checkChieu) checkChieu.checked = !!item.caChieu;

        const guestInput = document.getElementById('guestCount');
        if (guestInput) guestInput.value = item.soLuongKhach || item.guests || 120;

        const facInput = document.getElementById('facility');
        if (facInput && item.diaDiemKham) facInput.value = item.diaDiemKham;

        if (item.danhMucKham && item.danhMucKham.length > 0) {
            categoryRows = item.danhMucKham;
        }
        if (item.nhanSu && item.nhanSu.length > 0) {
            staffRows = item.nhanSu;
        }
    }
}

function markFormDirty() {
    isFormDirty = true;
}

function toggleShiftInput(shiftType) {
    markFormDirty();
    updateRealtimeSummary();
}

function renderCategoryTable() {
    if (categoryRows.length === 0) {
        categoryRows = [
            { name: 'Khám Nội tổng quát tại phường', guests: 120, sang: true, chieu: true },
            { name: 'Lấy máu xét nghiệm cộng đồng', guests: 120, sang: true, chieu: false }
        ];
    }

    const tbody = document.getElementById('category-table-body');
    if (!tbody) return;

    let html = '';
    categoryRows.forEach((row, idx) => {
        html += `
            <tr class="hover:bg-[#F8FAFC]">
                <td class="py-2 px-3 text-center font-bold text-[#6B7280]">${idx + 1}</td>
                <td class="py-2 px-3">
                    <input type="text" value="${row.name}" oninput="updateCategoryRow(${idx}, 'name', this.value)" class="sys-input text-xs h-8 font-medium">
                </td>
                <td class="py-2 px-3 text-right">
                    <input type="number" min="0" value="${row.guests}" oninput="updateCategoryRow(${idx}, 'guests', this.value)" class="sys-input text-xs h-8 text-right font-bold text-[#7E22CE] w-24">
                </td>
                <td class="py-2 px-3 text-center">
                    <input type="checkbox" ${row.sang ? 'checked' : ''} onchange="updateCategoryRow(${idx}, 'sang', this.checked)" class="w-4 h-4 text-[#7E22CE] rounded-[2px]">
                </td>
                <td class="py-2 px-3 text-center">
                    <input type="checkbox" ${row.chieu ? 'checked' : ''} onchange="updateCategoryRow(${idx}, 'chieu', this.checked)" class="w-4 h-4 text-[#7E22CE] rounded-[2px]">
                </td>
                <td class="py-2 px-3 text-center">
                    <button type="button" onclick="deleteCategoryRow(${idx})" class="w-6 h-6 rounded-[2px] text-[#D32F2F] hover:bg-[#FEE2E2] flex items-center justify-center">
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
    if (field === 'guests') categoryRows[index][field] = parseInt(value) || 0;
    else categoryRows[index][field] = value;
    updateCategoryTotals();
    updateRealtimeSummary();
}

function addCategoryRow() {
    markFormDirty();
    categoryRows.push({ name: 'Danh mục Lịch phường mới', guests: 120, sang: true, chieu: true });
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
        staffRows = [
            { title: 'Bác sĩ Phụ trách Lịch phường', count: 3, sang: true, chieu: true },
            { title: 'Điều dưỡng Trạm y tế', count: 4, sang: true, chieu: false }
        ];
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
                    <input type="number" min="1" value="${row.count}" oninput="updateStaffRow(${idx}, 'count', this.value)" class="sys-input text-xs h-8 text-right font-bold text-[#7E22CE] w-20">
                </td>
                <td class="py-2 px-3 text-center">
                    <input type="checkbox" ${row.sang ? 'checked' : ''} onchange="updateStaffRow(${idx}, 'sang', this.checked)" class="w-4 h-4 text-[#7E22CE] rounded-[2px]">
                </td>
                <td class="py-2 px-3 text-center">
                    <input type="checkbox" ${row.chieu ? 'checked' : ''} onchange="updateStaffRow(${idx}, 'chieu', this.checked)" class="w-4 h-4 text-[#7E22CE] rounded-[2px]">
                </td>
                <td class="py-2 px-3 text-center">
                    <button type="button" onclick="deleteStaffRow(${idx})" class="w-6 h-6 rounded-[2px] text-[#D32F2F] hover:bg-[#FEE2E2] flex items-center justify-center">
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
    if (field === 'count') staffRows[index][field] = parseInt(value) || 0;
    else staffRows[index][field] = value;
    updateStaffTotals();
    updateRealtimeSummary();
}

function addStaffRow() {
    markFormDirty();
    staffRows.push({ title: 'Nhân sự hỗ trợ mới', count: 2, sang: true, chieu: true });
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
        if (parts.length === 3) formattedDate = `${parts[2]}/${parts[1]}/${parts[0]}`;
    }

    const guestCount = document.getElementById('guestCount')?.value || '0';
    const barDate = document.getElementById('bar-summary-date');
    const barGuests = document.getElementById('bar-summary-guests');

    if (barDate) barDate.innerText = formattedDate;
    if (barGuests) barGuests.innerText = guestCount;
}

function handleSaveEdit() {
    const params = new URLSearchParams(window.location.search);
    const editId = params.get('editId');
    const targetUrl = editId ? `../edit/edit.html?id=${editId}&step=2` : '../create/create.html?step=2';

    if (window.showToast) {
        window.showToast('Đã cập nhật lịch khám phường!', 'success');
    }

    setTimeout(() => {
        window.location.href = targetUrl;
    }, 400);
}

function handleExitEdit() {
    const params = new URLSearchParams(window.location.search);
    const editId = params.get('editId');
    const targetUrl = editId ? `../edit/edit.html?id=${editId}&step=2` : '../create/create.html?step=2';
    window.location.href = targetUrl;
}
