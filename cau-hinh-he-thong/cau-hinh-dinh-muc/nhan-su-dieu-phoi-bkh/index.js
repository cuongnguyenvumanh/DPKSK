/**
 * SUB-TAB 5 (NHÂN SỰ ĐIỀU PHỐI BKH) MATRIX ENGINE
 * Features: 2 Inner Sub-Tabs (BS Chuyên khoa & DD/KTV), View Mode vs Inline Edit Mode, Dynamic Row Add/Delete, STT Auto-Resequencing on Save, Toast & DataStore Integration.
 */
let currentInnerBkhTab = 'doctor'; // 'doctor' | 'nurse'
let isBkhEditMode = false;
let workingBkhData = null;
let bkhDeleteTargetId = null;

function switchInnerBkhTab(tabType) {
    currentInnerBkhTab = tabType;

    const btnDoc = document.getElementById('bkh-inner-tab-doctor');
    const btnNur = document.getElementById('bkh-inner-tab-nurse');

    if (btnDoc && btnNur) {
        if (tabType === 'doctor') {
            btnDoc.className = 'px-4 py-1.5 rounded-[6px] text-xs font-bold transition-all cursor-pointer bg-[#0F6CBD] text-white shadow-xs';
            btnNur.className = 'px-4 py-1.5 rounded-[6px] text-xs font-semibold transition-all cursor-pointer bg-[#E5E7EB] hover:bg-[#D1D5DB] text-[#374151]';
        } else {
            btnDoc.className = 'px-4 py-1.5 rounded-[6px] text-xs font-semibold transition-all cursor-pointer bg-[#E5E7EB] hover:bg-[#D1D5DB] text-[#374151]';
            btnNur.className = 'px-4 py-1.5 rounded-[6px] text-xs font-bold transition-all cursor-pointer bg-[#0F6CBD] text-white shadow-xs';
        }
    }

    renderBkhView(document.getElementById('tab-content-container'));
}

function toggleBkhEditMode(enableEdit) {
    isBkhEditMode = enableEdit;

    const btnUpdate = document.getElementById('btn-matrix-update');
    const editActions = document.getElementById('edit-mode-actions');
    const addRowContainer = document.getElementById('bkh-add-row-action-container');

    if (btnUpdate && editActions) {
        if (isBkhEditMode) {
            btnUpdate.classList.add('hidden');
            editActions.classList.remove('hidden');
            if (addRowContainer) addRowContainer.classList.remove('hidden');
        } else {
            btnUpdate.classList.remove('hidden');
            editActions.classList.add('hidden');
            if (addRowContainer) addRowContainer.classList.add('hidden');
        }
    }

    if (enableEdit) {
        workingBkhData = JSON.parse(JSON.stringify(MWKDataStore.getBkhMatrixData()));
        // Freeze STT display numbers for existing rows when entering Edit Mode
        if (workingBkhData.doctorSpecialties) {
            workingBkhData.doctorSpecialties.forEach((item, idx) => item.editSttDisplay = idx + 1);
        }
        if (workingBkhData.nurseTechnicians) {
            workingBkhData.nurseTechnicians.forEach((item, idx) => item.editSttDisplay = idx + 1);
        }
    } else {
        workingBkhData = null;
    }

    renderBkhView(document.getElementById('tab-content-container'));
}

function renderBkhView(container, customSearchVal = '') {
    if (!container) return;

    if (!container.querySelector('#bkh-matrix-body-container')) {
        container.innerHTML = `
            <div class="flex-1 flex flex-col min-h-0 overflow-hidden relative bg-[#F5F7FA]">
                <div class="bg-white border-b border-[#D9DEE7] px-4 py-2 flex items-center justify-between flex-shrink-0">
                    <div class="flex items-center gap-2">
                        <button type="button" id="bkh-inner-tab-doctor" onclick="switchInnerBkhTab('doctor')" class="${currentInnerBkhTab === 'doctor' ? 'px-4 py-1.5 rounded-[6px] text-xs font-bold transition-all cursor-pointer bg-[#0F6CBD] text-white shadow-xs' : 'px-4 py-1.5 rounded-[6px] text-xs font-semibold transition-all cursor-pointer bg-[#E5E7EB] hover:bg-[#D1D5DB] text-[#374151]'}">
                            <i class="fa-solid fa-user-doctor mr-1.5"></i>
                            <span>BS Chuyên khoa</span>
                        </button>
                        <button type="button" id="bkh-inner-tab-nurse" onclick="switchInnerBkhTab('nurse')" class="${currentInnerBkhTab === 'nurse' ? 'px-4 py-1.5 rounded-[6px] text-xs font-bold transition-all cursor-pointer bg-[#0F6CBD] text-white shadow-xs' : 'px-4 py-1.5 rounded-[6px] text-xs font-semibold transition-all cursor-pointer bg-[#E5E7EB] hover:bg-[#D1D5DB] text-[#374151]'}">
                            <i class="fa-solid fa-user-nurse mr-1.5"></i>
                            <span>Điều dưỡng / KTV</span>
                        </button>
                    </div>

                    <div id="bkh-add-row-action-container" class="${isBkhEditMode ? '' : 'hidden'}">
                        <button type="button" onclick="addNewBkhRow()" class="px-3.5 h-[32px] bg-[#0F6CBD] hover:bg-[#1E7FE5] text-white rounded-[6px] text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer">
                            <i class="fa-solid fa-plus text-[10px]"></i>
                            <span>Thêm dòng</span>
                        </button>
                    </div>
                </div>

                <div class="border border-t-0 border-[#D9DEE7] bg-white shadow-none rounded-none flex-1 flex flex-col min-h-0 relative">
                    <div class="overflow-auto max-h-full custom-scrollbar flex-1">
                        <table class="w-full text-left text-xs border-collapse select-none bkh-matrix-table font-sans">
                            <thead class="uppercase font-semibold text-[11px]">
                                <tr id="bkh-matrix-header-row"></tr>
                            </thead>
                            <tbody id="bkh-matrix-body-container" class="divide-y divide-[#E5E7EB] text-[#1F2937]"></tbody>
                        </table>
                    </div>

                    <!-- MODAL XÓA DÒNG -->
                    <div id="delete-confirm-modal-bkh" class="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 hidden flex items-center justify-center p-4">
                        <div class="bg-white rounded-lg shadow-2xl max-w-sm w-full space-y-4 border border-[#D9DEE7] text-center overflow-hidden">
                            <div class="bg-[#2F3E4E] text-white py-3.5 px-4 font-bold text-sm flex items-center justify-between">
                                <span>Xác nhận xóa</span>
                                <i class="fa-solid fa-triangle-exclamation text-amber-400"></i>
                            </div>
                            <div class="px-6 py-2">
                                <p id="bkh-delete-modal-msg" class="text-xs text-[#1F2937]">Bạn có chắc chắn muốn xóa dòng này khỏi hệ thống không?</p>
                            </div>
                            <div class="flex items-center justify-center gap-3 pb-5 px-6">
                                <button type="button" onclick="hideBkhModal('delete-confirm-modal-bkh')" class="px-4 h-[36px] bg-[#E5E7EB] hover:bg-[#D1D5DB] text-[#374151] rounded-[6px] text-xs font-semibold transition-colors cursor-pointer">Hủy</button>
                                <button type="button" onclick="confirmDeleteBkhRow()" class="px-4 h-[36px] bg-rose-600 hover:bg-rose-700 text-white rounded-[6px] text-xs font-bold shadow-xs transition-colors cursor-pointer">Xác nhận xóa</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    const data = isBkhEditMode ? workingBkhData : MWKDataStore.getBkhMatrixData();
    const dataList = (currentInnerBkhTab === 'doctor') ? (data.doctorSpecialties || []) : (data.nurseTechnicians || []);

    const headerRow = document.getElementById('bkh-matrix-header-row');
    const tbody = document.getElementById('bkh-matrix-body-container');
    if (!headerRow || !tbody) return;

    // 1. DYNAMIC HEADER COLUMNS
    const isDoc = (currentInnerBkhTab === 'doctor');
    const col2Title = isDoc ? 'BS CHUYÊN KHOA' : 'DD/KTV CÁC CK/VỊ TRÍ';
    const col2Class = isDoc ? 'bkh-sticky-corner-2-doc' : 'bkh-sticky-corner-2-nur';

    let headerHtml = `
        <th class="bkh-sticky-corner-1 p-2.5 text-center">STT</th>
        <th class="${col2Class} p-2.5">${col2Title}</th>
        <th class="bkh-sticky-header p-2.5">SỐ LƯỢNG TỐI ĐA ĐÁP ỨNG ĐƯỢC/NGÀY</th>
        <th class="bkh-sticky-header p-2.5">GHI CHÚ</th>
        ${isBkhEditMode ? `<th class="bkh-sticky-header p-2.5 text-center w-16">THAO TÁC</th>` : ''}
    `;
    headerRow.innerHTML = headerHtml;

    // 2. DYNAMIC BODY ROWS
    if (dataList.length === 0) {
        tbody.innerHTML = `<tr><td colspan="${isBkhEditMode ? 5 : 4}" class="p-6 text-center text-slate-400 italic">Chưa có dữ liệu nào. Click [Cập nhật] -> [Thêm dòng] để bổ sung.</td></tr>`;
        return;
    }

    const col2BodyClass = isDoc ? 'bkh-sticky-col-2-doc' : 'bkh-sticky-col-2-nur';

    tbody.innerHTML = dataList.map((item, idx) => {
        const displayStt = isBkhEditMode ? (item.editSttDisplay !== undefined ? item.editSttDisplay : '') : (idx + 1);

        return `
            <tr class="hover:bg-[#F7F9FC] transition-colors">
                <td class="bkh-sticky-col-1 p-2.5 text-center font-bold text-slate-700 text-xs border border-[#D9DEE7] bg-[#F8FAFC]">
                    ${displayStt}
                </td>
                <td class="${col2BodyClass} p-2 font-bold text-xs text-[#1F2937] border border-[#D9DEE7] bg-[#F8FAFC]">
                    ${isBkhEditMode ? `
                        <input type="text" data-bkhfield="name" data-bkhid="${item.id}" value="${item.name}" placeholder="Nhập tên vị trí/chuyên khoa..." class="w-full text-xs font-bold border border-[#D1D5DB] bg-white rounded-[6px] h-[32px] px-2 focus:outline-none focus:border-[#0F6CBD]">
                    ` : `<span>${item.name}</span>`}
                </td>
                <td class="p-2 border border-[#E5E7EB] bg-white font-bold text-[#1F2937] text-xs">
                    ${isBkhEditMode ? `
                        <input type="text" data-bkhfield="maxCapacity" data-bkhid="${item.id}" value="${item.maxCapacity}" placeholder="Nhập số lượng tối đa..." class="w-full text-xs font-bold border border-[#D1D5DB] bg-white rounded-[6px] h-[32px] px-2 focus:outline-none focus:border-[#0F6CBD]">
                    ` : `<span>${item.maxCapacity || '-'}</span>`}
                </td>
                <td class="p-2 border border-[#E5E7EB] bg-white font-medium text-slate-700 text-xs">
                    ${isBkhEditMode ? `
                        <input type="text" data-bkhfield="note" data-bkhid="${item.id}" value="${item.note}" placeholder="Nhập ghi chú..." class="w-full text-xs font-medium border border-[#D1D5DB] bg-white rounded-[6px] h-[32px] px-2 focus:outline-none focus:border-[#0F6CBD]">
                    ` : `<span>${item.note || '-'}</span>`}
                </td>
                ${isBkhEditMode ? `
                    <td class="p-2 text-center border border-[#E5E7EB] bg-white">
                        <button type="button" onclick="promptDeleteBkhRow('${item.id}')" title="Xóa dòng này" class="text-rose-500 hover:text-rose-700 font-bold p-1 cursor-pointer">
                            <i class="fa-solid fa-trash-can text-xs"></i>
                        </button>
                    </td>
                ` : ''}
            </tr>
        `;
    }).join('');
}

// MODAL CONTROLS
function showBkhModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('hidden');
}

function hideBkhModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('hidden');
}

// DYNAMIC ACTIONS (EDIT MODE)

function addNewBkhRow() {
    if (!workingBkhData) return;

    const listKey = (currentInnerBkhTab === 'doctor') ? 'doctorSpecialties' : 'nurseTechnicians';
    const newId = `bkh_${Date.now()}`;

    workingBkhData[listKey].push({
        id: newId,
        name: '',
        maxCapacity: '',
        note: '',
        editSttDisplay: '',
        isNewUnsaved: true
    });

    renderBkhView(document.getElementById('tab-content-container'));
}

function promptDeleteBkhRow(id) {
    bkhDeleteTargetId = id;
    showBkhModal('delete-confirm-modal-bkh');
}

function confirmDeleteBkhRow() {
    if (!bkhDeleteTargetId || !workingBkhData) return;

    const listKey = (currentInnerBkhTab === 'doctor') ? 'doctorSpecialties' : 'nurseTechnicians';
    workingBkhData[listKey] = workingBkhData[listKey].filter(item => item.id !== bkhDeleteTargetId);

    bkhDeleteTargetId = null;
    hideBkhModal('delete-confirm-modal-bkh');
    renderBkhView(document.getElementById('tab-content-container'));
}

function saveBkhChanges() {
    if (!workingBkhData) return;

    // Read current form inputs from DOM before saving
    const tbody = document.getElementById('bkh-matrix-body-container');
    if (tbody) {
        const inputs = tbody.querySelectorAll('input[data-bkhfield]');
        const listKey = (currentInnerBkhTab === 'doctor') ? 'doctorSpecialties' : 'nurseTechnicians';
        const list = workingBkhData[listKey];

        inputs.forEach(input => {
            const field = input.getAttribute('data-bkhfield');
            const id = input.getAttribute('data-bkhid');
            const item = list.find(i => i.id === id);
            if (item && field) {
                item[field] = input.value.trim();
            }
        });
    }

    // Clean up temporary edit attributes
    if (workingBkhData.doctorSpecialties) {
        workingBkhData.doctorSpecialties.forEach(item => {
            delete item.editSttDisplay;
            delete item.isNewUnsaved;
        });
    }
    if (workingBkhData.nurseTechnicians) {
        workingBkhData.nurseTechnicians.forEach(item => {
            delete item.editSttDisplay;
            delete item.isNewUnsaved;
        });
    }

    MWKDataStore.saveBkhMatrixData(workingBkhData);

    isBkhEditMode = false;
    toggleBkhEditMode(false);

    if (window.showToast) {
        window.showToast('Cập nhật dữ liệu thành công.', 'success');
    }
}
