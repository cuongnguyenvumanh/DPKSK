/**
 * SUB-TAB 4 (ĐỊNH MỨC NHÂN SỰ KIÊM NHIỆM) FULL MATRIX ENGINE
 * Features: View Mode vs In-Place Edit Mode, Dynamic Columns, Dynamic Groups, Dynamic STT Rows, Validation & Toast
 */
let isKiemNhiemEditMode = false;
let workingKnData = null;
let knDeleteTarget = null;
let targetKnGroupId = null;

function toggleKiemNhiemEditMode(enableEdit) {
    isKiemNhiemEditMode = enableEdit;

    const btnUpdate = document.getElementById('btn-matrix-update');
    const editActions = document.getElementById('edit-mode-actions');
    if (btnUpdate && editActions) {
        if (isKiemNhiemEditMode) {
            btnUpdate.classList.add('hidden');
            editActions.classList.remove('hidden');
        } else {
            btnUpdate.classList.remove('hidden');
            editActions.classList.add('hidden');
        }
    }

    if (enableEdit) {
        workingKnData = JSON.parse(JSON.stringify(MWKDataStore.getKiemNhiemMatrixData()));
        // Freeze STT display numbers for existing rows when entering Edit Mode
        let initStt = 0;
        workingKnData.sttItems.forEach(item => {
            initStt++;
            item.editSttDisplay = initStt;
        });
    } else {
        workingKnData = null;
    }

    renderKiemNhiemView(document.getElementById('tab-content-container'));
}

function renderKiemNhiemView(container, customSearchVal = '') {
    if (!container) return;

    if (!container.querySelector('#kn-matrix-body-container')) {
        container.innerHTML = `
            <div class="flex-1 flex flex-col min-h-0 overflow-hidden relative bg-[#F5F7FA]">
                <div class="border border-[#D9DEE7] bg-white shadow-none rounded-none flex-1 flex flex-col min-h-0 relative">
                    <div class="overflow-auto max-h-full custom-scrollbar flex-1">
                        <table class="w-full text-left text-xs border-collapse select-none kiem-nhiem-matrix-table font-sans">
                            <thead class="uppercase font-semibold text-[11px]">
                                <tr id="kn-matrix-header-row"></tr>
                            </thead>
                            <tbody id="kn-matrix-body-container" class="divide-y divide-[#E5E7EB] text-[#1F2937]"></tbody>
                        </table>
                    </div>

                    <!-- MODAL THÊM CỘT -->
                    <div id="add-column-modal-kiem-nhiem" class="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 hidden flex items-center justify-center p-4">
                        <div class="bg-white rounded-lg shadow-2xl max-w-sm w-full space-y-4 border border-[#D9DEE7] overflow-hidden">
                            <div class="bg-[#2F3E4E] text-white py-3.5 px-4 font-bold text-sm flex items-center justify-between">
                                <span>Thêm cột nghiệp vụ mới</span>
                                <button type="button" onclick="hideKnModal('add-column-modal-kiem-nhiem')" class="text-slate-300 hover:text-white"><i class="fa-solid fa-xmark text-xs"></i></button>
                            </div>
                            <div class="px-5 py-2 space-y-3">
                                <div>
                                    <label class="block text-xs font-semibold text-slate-700 mb-1">Tên cột nghiệp vụ mới <span class="text-rose-500">*</span></label>
                                    <input type="text" id="kn-new-column-name" placeholder="Ví dụ: Hỗ trợ, Điều phối..." class="w-full text-xs h-[36px] px-3 border border-[#D1D5DB] rounded-[6px] focus:outline-none focus:border-[#0F6CBD] font-medium text-[#1F2937]">
                                </div>
                            </div>
                            <div class="flex items-center justify-end gap-2.5 pb-4 px-5">
                                <button type="button" onclick="hideKnModal('add-column-modal-kiem-nhiem')" class="px-4 h-[36px] bg-[#E5E7EB] hover:bg-[#D1D5DB] text-[#374151] rounded-[6px] text-xs font-semibold transition-colors cursor-pointer">Hủy</button>
                                <button type="button" onclick="confirmAddKnColumn()" class="px-4 h-[36px] bg-[#0F6CBD] hover:bg-[#1E7FE5] text-white rounded-[6px] text-xs font-semibold shadow-xs transition-colors cursor-pointer">Xác nhận thêm</button>
                            </div>
                        </div>
                    </div>

                    <!-- MODAL THÊM NHÓM -->
                    <div id="add-group-modal-kiem-nhiem" class="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 hidden flex items-center justify-center p-4">
                        <div class="bg-white rounded-lg shadow-2xl max-w-sm w-full space-y-4 border border-[#D9DEE7] overflow-hidden">
                            <div class="bg-[#2F3E4E] text-white py-3.5 px-4 font-bold text-sm flex items-center justify-between">
                                <span>Thêm nhóm Hình thức mới</span>
                                <button type="button" onclick="hideKnModal('add-group-modal-kiem-nhiem')" class="text-slate-300 hover:text-white"><i class="fa-solid fa-xmark text-xs"></i></button>
                            </div>
                            <div class="px-5 py-2 space-y-3">
                                <div>
                                    <label class="block text-xs font-semibold text-slate-700 mb-1">Tên hình thức mới <span class="text-rose-500">*</span></label>
                                    <input type="text" id="kn-new-group-name" placeholder="Ví dụ: Khám lưu động, Xét nghiệm..." class="w-full text-xs h-[36px] px-3 border border-[#D1D5DB] rounded-[6px] focus:outline-none focus:border-[#0F6CBD] font-medium text-[#1F2937]">
                                </div>
                            </div>
                            <div class="flex items-center justify-end gap-2.5 pb-4 px-5">
                                <button type="button" onclick="hideKnModal('add-group-modal-kiem-nhiem')" class="px-4 h-[36px] bg-[#E5E7EB] hover:bg-[#D1D5DB] text-[#374151] rounded-[6px] text-xs font-semibold transition-colors cursor-pointer">Hủy</button>
                                <button type="button" onclick="confirmAddKnGroup()" class="px-4 h-[36px] bg-[#0F6CBD] hover:bg-[#1E7FE5] text-white rounded-[6px] text-xs font-semibold shadow-xs transition-colors cursor-pointer">Xác nhận thêm</button>
                            </div>
                        </div>
                    </div>

                    <!-- MODAL THÊM DÒNG -->
                    <div id="add-stt-modal-kiem-nhiem" class="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 hidden flex items-center justify-center p-4">
                        <div class="bg-white rounded-lg shadow-2xl max-w-sm w-full space-y-4 border border-[#D9DEE7] overflow-hidden">
                            <div class="bg-[#2F3E4E] text-white py-3.5 px-4 font-bold text-sm flex items-center justify-between">
                                <span>Thêm khoảng Khách hàng mới</span>
                                <button type="button" onclick="hideKnModal('add-stt-modal-kiem-nhiem')" class="text-slate-300 hover:text-white"><i class="fa-solid fa-xmark text-xs"></i></button>
                            </div>
                            <div class="px-5 py-2 space-y-3">
                                <div>
                                    <label class="block text-xs font-semibold text-slate-700 mb-1">Số lượng khách hàng <span class="text-rose-500">*</span></label>
                                    <input type="text" id="kn-new-stt-range" placeholder="Ví dụ: Từ 120-150, Trên 150..." class="w-full text-xs h-[36px] px-3 border border-[#D1D5DB] rounded-[6px] focus:outline-none focus:border-[#0F6CBD] font-medium text-[#1F2937]">
                                </div>
                            </div>
                            <div class="flex items-center justify-end gap-2.5 pb-4 px-5">
                                <button type="button" onclick="hideKnModal('add-stt-modal-kiem-nhiem')" class="px-4 h-[36px] bg-[#E5E7EB] hover:bg-[#D1D5DB] text-[#374151] rounded-[6px] text-xs font-semibold transition-colors cursor-pointer">Hủy</button>
                                <button type="button" onclick="confirmAddKnSTTRow()" class="px-4 h-[36px] bg-[#0F6CBD] hover:bg-[#1E7FE5] text-white rounded-[6px] text-xs font-semibold shadow-xs transition-colors cursor-pointer">Xác nhận thêm</button>
                            </div>
                        </div>
                    </div>

                    <!-- MODAL XÓA -->
                    <div id="delete-confirm-modal-kiem-nhiem" class="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 hidden flex items-center justify-center p-4">
                        <div class="bg-white rounded-lg shadow-2xl max-w-sm w-full space-y-4 border border-[#D9DEE7] text-center overflow-hidden">
                            <div class="bg-[#2F3E4E] text-white py-3.5 px-4 font-bold text-sm flex items-center justify-between">
                                <span>Xác nhận xóa</span>
                                <i class="fa-solid fa-triangle-exclamation text-amber-400"></i>
                            </div>
                            <div class="px-6 py-2">
                                <p id="kn-delete-modal-msg" class="text-xs text-[#1F2937]">Bạn có chắc chắn muốn xóa mục này khỏi hệ thống không?</p>
                            </div>
                            <div class="flex items-center justify-center gap-3 pb-5 px-6">
                                <button type="button" onclick="hideKnModal('delete-confirm-modal-kiem-nhiem')" class="px-4 h-[36px] bg-[#E5E7EB] hover:bg-[#D1D5DB] text-[#374151] rounded-[6px] text-xs font-semibold transition-colors cursor-pointer">Hủy</button>
                                <button type="button" onclick="confirmDeleteKnItem()" class="px-4 h-[36px] bg-rose-600 hover:bg-rose-700 text-white rounded-[6px] text-xs font-bold shadow-xs transition-colors cursor-pointer">Xác nhận xóa</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    const data = isKiemNhiemEditMode ? workingKnData : MWKDataStore.getKiemNhiemMatrixData();
    const headerRow = document.getElementById('kn-matrix-header-row');
    const tbody = document.getElementById('kn-matrix-body-container');
    if (!headerRow || !tbody) return;

    // 1. DYNAMIC HEADER COLUMNS
    let headerHtml = `
        <th class="kn-sticky-corner-1 p-2.5 text-center">
            <div class="flex items-center justify-between gap-1">
                <span>HÌNH THỨC</span>
                ${isKiemNhiemEditMode ? `
                    <button type="button" onclick="showAddKnGroupModal()" title="Thêm nhóm Hình thức mới (+)" class="px-1.5 py-0.5 bg-[#0F6CBD] hover:bg-[#1E7FE5] text-white rounded-[4px] text-[10px] font-bold transition-colors cursor-pointer">
                        <i class="fa-solid fa-plus"></i>
                    </button>
                ` : ''}
            </div>
        </th>
        <th class="kn-sticky-corner-2 p-2.5 text-center">STT</th>
        <th class="kn-sticky-corner-3 p-2.5 text-center">SỐ LƯỢNG KHÁCH HÀNG</th>
        <th class="kn-sticky-corner-4 p-2.5 text-center">ĐÁNH GIÁ ĐƠN VỊ</th>
    `;

    data.columns.forEach((col, cIdx) => {
        const isLastCol = col.isLast || col.id === 'luu_y';
        const deleteColBtn = (isKiemNhiemEditMode && col.isCustom) ? `
            <button type="button" onclick="promptDeleteKnColumn('${col.id}', '${col.name}')" title="Xóa cột này" class="text-rose-400 hover:text-rose-200 ml-1 cursor-pointer"><i class="fa-solid fa-trash-can text-[10px]"></i></button>
        ` : '';

        if (isKiemNhiemEditMode && isLastCol) {
            // Render [+] button before "Lưu ý" column
            headerHtml += `
                <th class="kn-sticky-header-staff text-center p-2 min-w-[50px]">
                    <button type="button" onclick="showAddKnColumnModal()" title="Thêm cột nghiệp vụ mới (+)" class="w-6 h-6 rounded-[4px] bg-[#0F6CBD] hover:bg-[#1E7FE5] text-white font-bold inline-flex items-center justify-center shadow-xs cursor-pointer">
                        <i class="fa-solid fa-plus text-[10px]"></i>
                    </button>
                </th>
            `;
        }

        const minWClass = isLastCol ? 'min-w-[200px]' : 'min-w-[120px]';
        headerHtml += `<th class="kn-sticky-header-staff text-center p-2.5 ${minWClass}">${col.name} ${deleteColBtn}</th>`;
    });

    headerRow.innerHTML = headerHtml;

    // 2. DYNAMIC BODY ROWS WITH ROWSPANS
    let bodyHtml = '';
    let globalSttCounter = 0;

    data.groups.forEach(group => {
        const groupSttItems = data.sttItems.filter(s => s.groupId === group.id);
        const totalGroupRows = groupSttItems.length * 2;

        if (groupSttItems.length === 0) {
            // Empty group row
            bodyHtml += `
                <tr class="hover:bg-[#F7F9FC]">
                    <td class="kn-sticky-col-1 p-2 font-bold text-xs text-[#1E293B] border border-[#D9DEE7]">
                        <div class="flex items-center justify-between gap-1">
                            ${isKiemNhiemEditMode ? `
                                <input type="text" value="${group.name}" onchange="updateKnGroupName('${group.id}', this.value)" class="w-full text-xs font-bold border border-[#D1D5DB] bg-white rounded-[6px] h-[30px] px-2 focus:outline-none focus:border-[#0F6CBD]">
                            ` : `<span>${group.name}</span>`}
                            ${isKiemNhiemEditMode ? `
                                <button type="button" onclick="showAddKnSTTRowModal('${group.id}')" title="Thêm khoảng KH mới (+)" class="px-1.5 py-0.5 bg-[#0F6CBD] text-white rounded text-[10px]"><i class="fa-solid fa-plus"></i></button>
                            ` : ''}
                        </div>
                    </td>
                    <td colspan="${3 + data.columns.length}" class="p-3 text-center text-slate-400 italic">Chưa có khoảng khách hàng nào.</td>
                </tr>
            `;
            return;
        }

        groupSttItems.forEach((sttItem, sIdx) => {
            globalSttCounter++;
            const currentGlobalStt = globalSttCounter;

            // Each STT item has 2 evaluation rows: Tiềm năng & Không tiềm năng
            const evalRows = [
                { id: `${sttItem.id}_tn`, label: 'Tiềm năng', badgeClass: 'badge-tiem-nang' },
                { id: `${sttItem.id}_ktn`, label: 'Không tiềm năng', badgeClass: 'badge-khong-tiem-nang' }
            ];

            evalRows.forEach((eRow, rIdx) => {
                bodyHtml += `<tr class="hover:bg-[#F7F9FC] transition-colors">`;

                // Col 1: Hình thức (Rowspan across all rows of group)
                if (sIdx === 0 && rIdx === 0) {
                    const deleteGroupBtn = (isKiemNhiemEditMode && data.groups.length > 1) ? `
                        <button type="button" onclick="promptDeleteKnGroup('${group.id}', '${group.name}')" title="Xóa nhóm hình thức này" class="text-rose-500 hover:text-rose-700 ml-1 cursor-pointer"><i class="fa-solid fa-trash-can text-[10px]"></i></button>
                    ` : '';

                    bodyHtml += `
                        <td rowspan="${totalGroupRows}" class="kn-sticky-col-1 p-2 font-bold text-xs text-[#1E293B] border border-[#D9DEE7] bg-[#F8FAFC]">
                            <div class="flex flex-col gap-2 h-full justify-between py-1">
                                <div class="flex items-center justify-between gap-1">
                                    ${isKiemNhiemEditMode ? `
                                        <input type="text" value="${group.name}" onchange="updateKnGroupName('${group.id}', this.value)" class="w-full text-xs font-bold border border-[#D1D5DB] bg-white rounded-[6px] h-[30px] px-1.5 focus:outline-none focus:border-[#0F6CBD]">
                                    ` : `<span class="text-[#0F6CBD] font-bold text-xs uppercase tracking-wide">${group.name}</span>`}
                                    ${deleteGroupBtn}
                                </div>
                                ${isKiemNhiemEditMode ? `
                                    <button type="button" onclick="showAddKnSTTRowModal('${group.id}')" title="Thêm khoảng khách hàng mới (+)" class="w-full py-1 bg-[#0F6CBD] hover:bg-[#1E7FE5] text-white rounded-[6px] text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer">
                                        <i class="fa-solid fa-plus text-[10px]"></i>
                                        <span>Thêm dòng</span>
                                    </button>
                                ` : ''}
                            </div>
                        </td>
                    `;
                }

                // Col 2: STT & Col 3: Số lượng khách hàng (Rowspan 2 for 2 evaluation rows)
                if (rIdx === 0) {
                    const displayStt = isKiemNhiemEditMode ? (sttItem.editSttDisplay !== undefined ? sttItem.editSttDisplay : '') : currentGlobalStt;

                    const deleteSttBtn = isKiemNhiemEditMode ? `
                        <button type="button" onclick="promptDeleteKnSTT('${sttItem.id}', '${displayStt}')" title="Xóa dòng STT này" class="text-rose-500 hover:text-rose-700 ml-1 cursor-pointer"><i class="fa-solid fa-minus text-[10px]"></i></button>
                    ` : '';

                    bodyHtml += `
                        <td rowspan="2" class="kn-sticky-col-2 p-2 text-center font-bold text-slate-700 text-xs border border-[#D9DEE7] bg-[#F8FAFC]">
                            <div class="flex items-center justify-center gap-0.5">
                                <span>${displayStt}</span>
                                ${deleteSttBtn}
                            </div>
                        </td>
                        <td rowspan="2" class="kn-sticky-col-3 p-2 text-center font-bold text-xs text-[#1F2937] border border-[#D9DEE7] bg-[#F8FAFC]">
                            ${isKiemNhiemEditMode ? `
                                <input type="text" value="${sttItem.customerCount}" onchange="updateKnCustomerCount('${sttItem.id}', this.value)" class="w-full text-center text-xs font-bold border border-[#D1D5DB] bg-white rounded-[6px] h-[30px] px-1 focus:outline-none focus:border-[#0F6CBD]">
                            ` : `<span>${sttItem.customerCount}</span>`}
                        </td>
                    `;
                }

                // Col 4: Đánh giá đơn vị (Tiềm năng / Không tiềm năng)
                bodyHtml += `
                    <td class="kn-sticky-col-4 p-2 text-center border border-[#D9DEE7] bg-white">
                        <span class="${eRow.badgeClass}">${eRow.label}</span>
                    </td>
                `;

                // Col 5..N: Dynamic Staffing Columns + Lưu ý Column (Text inputs for all cells)
                data.columns.forEach(col => {
                    const entryKey = `${eRow.id}_${col.id}`;
                    const val = data.entries[entryKey] !== undefined ? data.entries[entryKey] : '';

                    if (col.id === 'luu_y' || col.type === 'textarea') {
                        if (isKiemNhiemEditMode) {
                            bodyHtml += `
                                <td class="border border-[#E5E7EB] p-1.5 text-center bg-white min-w-[200px]">
                                    <textarea data-knkey="${entryKey}" rows="2" placeholder="Nhập lưu ý..." class="w-full text-xs font-medium text-[#1F2937] border border-[#D1D5DB] bg-white rounded-[6px] p-2 focus:outline-none focus:border-[#0F6CBD] resize-y">${val}</textarea>
                                </td>
                            `;
                        } else {
                            bodyHtml += `
                                <td class="border border-[#E5E7EB] p-2 text-center bg-white font-medium text-slate-700 text-xs whitespace-pre-line min-w-[200px]">
                                    ${val || '-'}
                                </td>
                            `;
                        }
                    } else {
                        if (isKiemNhiemEditMode) {
                            bodyHtml += `
                                <td class="border border-[#E5E7EB] p-1 text-center bg-white min-w-[120px]">
                                    <input type="text" data-knkey="${entryKey}" value="${val}" placeholder="" class="w-full text-center py-1 px-1 font-bold text-[#1F2937] text-xs border border-[#D1D5DB] bg-white rounded-[6px] h-[32px] focus:outline-none focus:border-[#0F6CBD]">
                                </td>
                            `;
                        } else {
                            bodyHtml += `
                                <td class="border border-[#E5E7EB] p-2 text-center bg-white font-bold text-[#1F2937] text-xs min-w-[120px]">
                                    ${val !== '' ? val : '-'}
                                </td>
                            `;
                        }
                    }
                });

                bodyHtml += `</tr>`;
            });
        });
    });

    tbody.innerHTML = bodyHtml;
}

// MODAL CONTROLS
function showKnModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('hidden');
}

function hideKnModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('hidden');
}

// DYNAMIC ACTIONS (EDIT MODE)

function updateKnGroupName(groupId, newName) {
    if (!workingKnData) return;
    const group = workingKnData.groups.find(g => g.id === groupId);
    if (group && newName.trim()) {
        group.name = newName.trim();
    }
}

function updateKnCustomerCount(sttId, newRange) {
    if (!workingKnData) return;
    const item = workingKnData.sttItems.find(s => s.id === sttId);
    if (item && newRange.trim()) {
        item.customerCount = newRange.trim();
    }
}

function showAddKnGroupModal() {
    const input = document.getElementById('kn-new-group-name');
    if (input) input.value = '';
    showKnModal('add-group-modal-kiem-nhiem');
}

function confirmAddKnGroup() {
    const input = document.getElementById('kn-new-group-name');
    if (!input || !input.value.trim()) {
        alert('Vui lòng nhập tên hình thức mới!');
        return;
    }

    const name = input.value.trim();
    const newGroupId = `g_${Date.now()}`;
    const newSttId = `s_${Date.now()}`;

    workingKnData.groups.push({ id: newGroupId, name: name });
    workingKnData.sttItems.push({
        id: newSttId,
        groupId: newGroupId,
        editSttDisplay: '',
        customerCount: 'Từ 30-50',
        isNewUnsaved: true
    });

    hideKnModal('add-group-modal-kiem-nhiem');
    renderKiemNhiemView(document.getElementById('tab-content-container'));
}

function showAddKnSTTRowModal(groupId) {
    targetKnGroupId = groupId;
    const input = document.getElementById('kn-new-stt-range');
    if (input) input.value = '';
    showKnModal('add-stt-modal-kiem-nhiem');
}

function confirmAddKnSTTRow() {
    if (!targetKnGroupId || !workingKnData) return;

    const input = document.getElementById('kn-new-stt-range');
    if (!input || !input.value.trim()) {
        alert('Vui lòng nhập số lượng khách hàng!');
        return;
    }

    const rangeStr = input.value.trim();
    const newSttId = `s_${Date.now()}`;

    workingKnData.sttItems.push({
        id: newSttId,
        groupId: targetKnGroupId,
        editSttDisplay: '',
        customerCount: rangeStr,
        isNewUnsaved: true
    });

    targetKnGroupId = null;
    hideKnModal('add-stt-modal-kiem-nhiem');
    renderKiemNhiemView(document.getElementById('tab-content-container'));
}

function showAddKnColumnModal() {
    const input = document.getElementById('kn-new-column-name');
    if (input) input.value = '';
    showKnModal('add-column-modal-kiem-nhiem');
}

function confirmAddKnColumn() {
    const input = document.getElementById('kn-new-column-name');
    if (!input || !input.value.trim()) {
        alert('Vui lòng nhập tên cột nghiệp vụ mới!');
        return;
    }

    const colName = input.value.trim();
    const exists = workingKnData.columns.some(c => c.name.toLowerCase() === colName.toLowerCase());
    if (exists) {
        alert('Tên cột nghiệp vụ đã tồn tại. Vui lòng nhập tên khác!');
        return;
    }

    const newColId = `col_${Date.now()}`;
    const newCol = {
        id: newColId,
        name: colName,
        type: 'text',
        isCustom: true
    };

    // Insert right before "Lưu ý" column
    const luuYIdx = workingKnData.columns.findIndex(c => c.id === 'luu_y' || c.isLast);
    if (luuYIdx !== -1) {
        workingKnData.columns.splice(luuYIdx, 0, newCol);
    } else {
        workingKnData.columns.push(newCol);
    }

    hideKnModal('add-column-modal-kiem-nhiem');
    renderKiemNhiemView(document.getElementById('tab-content-container'));
}

function promptDeleteKnGroup(groupId, groupName) {
    knDeleteTarget = { type: 'group', id: groupId };
    const msg = document.getElementById('kn-delete-modal-msg');
    if (msg) msg.textContent = `Bạn có chắc chắn muốn xóa nhóm Hình thức "${groupName}" và toàn bộ dữ liệu của nhóm này không?`;
    showKnModal('delete-confirm-modal-kiem-nhiem');
}

function promptDeleteKnSTT(sttId, sttNum) {
    knDeleteTarget = { type: 'stt', id: sttId };
    const msg = document.getElementById('kn-delete-modal-msg');
    if (msg) msg.textContent = `Bạn có chắc chắn muốn xóa dòng khoảng khách hàng này không?`;
    showKnModal('delete-confirm-modal-kiem-nhiem');
}

function promptDeleteKnColumn(colId, colName) {
    knDeleteTarget = { type: 'column', id: colId };
    const msg = document.getElementById('kn-delete-modal-msg');
    if (msg) msg.textContent = `Bạn có chắc chắn muốn xóa cột nghiệp vụ "${colName}" không?`;
    showKnModal('delete-confirm-modal-kiem-nhiem');
}

function confirmDeleteKnItem() {
    if (!knDeleteTarget || !workingKnData) return;

    if (knDeleteTarget.type === 'group') {
        workingKnData.groups = workingKnData.groups.filter(g => g.id !== knDeleteTarget.id);
        workingKnData.sttItems = workingKnData.sttItems.filter(s => s.groupId !== knDeleteTarget.id);
    } else if (knDeleteTarget.type === 'stt') {
        workingKnData.sttItems = workingKnData.sttItems.filter(s => s.id !== knDeleteTarget.id);
    } else if (knDeleteTarget.type === 'column') {
        workingKnData.columns = workingKnData.columns.filter(c => c.id !== knDeleteTarget.id);
    }

    knDeleteTarget = null;
    hideKnModal('delete-confirm-modal-kiem-nhiem');
    renderKiemNhiemView(document.getElementById('tab-content-container'));
}

function saveKiemNhiemChanges() {
    if (!workingKnData) return;

    // Validate groups
    for (let g of workingKnData.groups) {
        if (!g.name || !g.name.trim()) {
            alert('Tên nhóm Hình thức không được để trống!');
            return;
        }
    }

    // Validate STT items
    for (let s of workingKnData.sttItems) {
        if (!s.customerCount || !s.customerCount.trim()) {
            alert('Số lượng khách hàng không được để trống!');
            return;
        }
    }

    // AUTO RE-SEQUENCE ALL STTS CONTINUOUSLY FROM 1 TO N
    let sttCounter = 0;
    workingKnData.sttItems.forEach(sttItem => {
        sttCounter++;
        sttItem.stt = sttCounter;
        delete sttItem.editSttDisplay;
        delete sttItem.isNewUnsaved;
    });

    // Read entries from text input and textarea elements
    const tbody = document.getElementById('kn-matrix-body-container');
    if (tbody) {
        const inputs = tbody.querySelectorAll('input[data-knkey], textarea[data-knkey]');
        inputs.forEach(input => {
            const key = input.getAttribute('data-knkey');
            const val = input.value.trim();
            workingKnData.entries[key] = val;
        });
    }

    MWKDataStore.saveKiemNhiemMatrixData(workingKnData);

    isKiemNhiemEditMode = false;
    toggleKiemNhiemEditMode(false);

    if (window.showToast) {
        window.showToast('Cập nhật dữ liệu thành công.', 'success');
    }
}
