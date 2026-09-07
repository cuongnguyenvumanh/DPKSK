/**
 * SUB-TAB 2 (ĐỊNH MỨC KHÁM NGOẠI VIỆN) MATRIX ENGINE
 * Features: View Mode vs Inline Edit Mode, Dynamic Area Addition/Deletion, Dynamic Sub-column Addition/Deletion inside Areas,
 * Dynamic Row Addition/Deletion/Reordering, Frozen STT in Edit Mode & Auto-Resequencing on Save, Business Notes, Toast & DataStore Integration.
 */
let isNgoaiVienEditMode = false;
let workingNgoaiVienData = null;
let nvDeleteTarget = null; // { type: 'row'|'area'|'subCol', areaId?: string, subColId?: string, rowId?: string, name?: string }
let activeTargetAreaId = null;

function toggleNgoaiVienEditMode(enableEdit) {
    isNgoaiVienEditMode = enableEdit;

    const btnUpdate = document.getElementById('btn-matrix-update');
    const editActions = document.getElementById('edit-mode-actions');
    const actionBarContainer = document.getElementById('nv-action-bar-container');

    if (btnUpdate && editActions) {
        if (isNgoaiVienEditMode) {
            btnUpdate.classList.add('hidden');
            editActions.classList.remove('hidden');
            if (actionBarContainer) actionBarContainer.classList.remove('hidden');
        } else {
            btnUpdate.classList.remove('hidden');
            editActions.classList.add('hidden');
            if (actionBarContainer) actionBarContainer.classList.add('hidden');
        }
    }

    if (enableEdit) {
        workingNgoaiVienData = JSON.parse(JSON.stringify(MWKDataStore.getNgoaiVienMatrixData()));
        // Freeze STT display numbers for existing rows when entering Edit Mode
        if (workingNgoaiVienData && workingNgoaiVienData.items) {
            workingNgoaiVienData.items.forEach((item, idx) => item.editSttDisplay = idx + 1);
        }
    } else {
        workingNgoaiVienData = null;
    }

    renderNgoaiVienView(document.getElementById('tab-content-container'));
}

function renderNgoaiVienView(container, customSearchVal = '') {
    if (!container) return;

    if (!container.querySelector('#nv-matrix-body-container')) {
        container.innerHTML = `
            <div class="flex-1 flex flex-col min-h-0 overflow-hidden relative bg-[#F5F7FA]">
                <div id="nv-action-bar-container" class="${isNgoaiVienEditMode ? '' : 'hidden'} bg-white border-b border-[#D9DEE7] px-4 py-2 flex items-center justify-end flex-shrink-0">
                    <div id="nv-edit-actions-toolbar" class="flex items-center gap-2">
                        <button type="button" onclick="showAddAreaModal()" class="px-3.5 h-[32px] bg-[#0F6CBD] hover:bg-[#1E7FE5] text-white rounded-[6px] text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer">
                            <i class="fa-solid fa-plus text-[10px]"></i>
                            <span>Thêm vị trí</span>
                        </button>
                        <button type="button" onclick="addNewNgoaiVienRow()" class="px-3.5 h-[32px] bg-slate-700 hover:bg-slate-800 text-white rounded-[6px] text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer">
                            <i class="fa-solid fa-plus text-[10px]"></i>
                            <span>Thêm dòng</span>
                        </button>
                    </div>
                </div>

                <div class="border border-t-0 border-[#D9DEE7] bg-white shadow-none rounded-none flex-1 flex flex-col min-h-0 relative">
                    <div class="overflow-auto max-h-full custom-scrollbar flex-1">
                        <table class="w-full text-left text-xs border-collapse select-none nv-matrix-table font-sans">
                            <thead class="uppercase font-semibold text-[11px]">
                                <tr id="nv-matrix-header-tier1"></tr>
                                <tr id="nv-matrix-header-tier2"></tr>
                            </thead>
                            <tbody id="nv-matrix-body-container" class="divide-y divide-[#E5E7EB] text-[#1F2937]"></tbody>
                        </table>
                    </div>

                    <div class="border-t border-[#D9DEE7] bg-[#F8FAFC] p-3.5 flex-shrink-0">
                        <div class="flex items-center gap-2 mb-1.5 text-xs font-bold text-[#1E293B]">
                            <i class="fa-solid fa-note-sticky text-[#0F6CBD]"></i>
                            <span>GHI CHÚ NGHIỆP VỤ LƯU ĐỘNG</span>
                        </div>
                        <div id="nv-business-notes-content"></div>
                    </div>

                    <!-- MODAL 1: THÊM VỊ TRÍ MỚI (DROPDOWN TỪ DATA-STORE) -->
                    <div id="add-area-modal-ngoaivien" class="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 hidden flex items-center justify-center p-4">
                        <div class="bg-white rounded-lg shadow-2xl max-w-sm w-full space-y-4 border border-[#D9DEE7] overflow-hidden">
                            <div class="bg-[#2F3E4E] text-white py-3.5 px-4 font-bold text-sm flex items-center justify-between">
                                <span>Thêm vị trí mới</span>
                                <button type="button" onclick="hideNvModal('add-area-modal-ngoaivien')" class="text-slate-300 hover:text-white"><i class="fa-solid fa-xmark text-xs"></i></button>
                            </div>
                            <div class="px-5 py-2 space-y-3">
                                <div>
                                    <label class="block text-xs font-semibold text-slate-700 mb-1.5">Chọn vị trí / cơ sở khám <span class="text-rose-500">*</span></label>
                                    <select id="nv-new-area-select" class="w-full text-xs h-[36px] px-3 border border-[#D1D5DB] rounded-[6px] focus:outline-none focus:border-[#0F6CBD] font-semibold text-[#1F2937] bg-white cursor-pointer"></select>
                                </div>
                            </div>
                            <div class="flex items-center justify-end gap-2.5 pb-4 px-5">
                                <button type="button" onclick="hideNvModal('add-area-modal-ngoaivien')" class="px-4 h-[36px] bg-[#E5E7EB] hover:bg-[#D1D5DB] text-[#374151] rounded-[6px] text-xs font-semibold transition-colors cursor-pointer">Hủy</button>
                                <button type="button" id="btn-confirm-add-area" onclick="confirmAddArea()" class="px-4 h-[36px] bg-[#0F6CBD] hover:bg-[#1E7FE5] text-white rounded-[6px] text-xs font-semibold shadow-xs transition-colors cursor-pointer">Xác nhận thêm</button>
                            </div>
                        </div>
                    </div>

                    <!-- MODAL 2: THÊM CỘT CHỈ TIÊU CON MỚI TRONG VỊ TRÍ -->
                    <div id="add-subcol-modal-ngoaivien" class="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 hidden flex items-center justify-center p-4">
                        <div class="bg-white rounded-lg shadow-2xl max-w-sm w-full space-y-4 border border-[#D9DEE7] overflow-hidden">
                            <div class="bg-[#2F3E4E] text-white py-3.5 px-4 font-bold text-sm flex items-center justify-between">
                                <span>Thêm chỉ tiêu con trong vị trí</span>
                                <button type="button" onclick="hideNvModal('add-subcol-modal-ngoaivien')" class="text-slate-300 hover:text-white"><i class="fa-solid fa-xmark text-xs"></i></button>
                            </div>
                            <div class="px-5 py-2 space-y-3">
                                <div>
                                    <label class="block text-xs font-semibold text-slate-700 mb-1">Tên chỉ tiêu con mới <span class="text-rose-500">*</span></label>
                                    <input type="text" id="nv-new-subcol-name" placeholder="Ví dụ: Công suất tối đa, Ghi chú riêng..." class="w-full text-xs h-[36px] px-3 border border-[#D1D5DB] rounded-[6px] focus:outline-none focus:border-[#0F6CBD] font-medium text-[#1F2937]">
                                </div>
                            </div>
                            <div class="flex items-center justify-end gap-2.5 pb-4 px-5">
                                <button type="button" onclick="hideNvModal('add-subcol-modal-ngoaivien')" class="px-4 h-[36px] bg-[#E5E7EB] hover:bg-[#D1D5DB] text-[#374151] rounded-[6px] text-xs font-semibold transition-colors cursor-pointer">Hủy</button>
                                <button type="button" onclick="confirmAddSubColumn()" class="px-4 h-[36px] bg-[#0F6CBD] hover:bg-[#1E7FE5] text-white rounded-[6px] text-xs font-semibold shadow-xs transition-colors cursor-pointer">Xác nhận thêm</button>
                            </div>
                        </div>
                    </div>

                    <!-- MODAL 3: XÁC NHẬN XÓA -->
                    <div id="delete-confirm-modal-nv" class="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 hidden flex items-center justify-center p-4">
                        <div class="bg-white rounded-lg shadow-2xl max-w-sm w-full space-y-4 border border-[#D9DEE7] text-center overflow-hidden">
                            <div class="bg-[#2F3E4E] text-white py-3.5 px-4 font-bold text-sm flex items-center justify-between">
                                <span>Xác nhận xóa</span>
                                <i class="fa-solid fa-triangle-exclamation text-amber-400"></i>
                            </div>
                            <div class="px-6 py-2">
                                <p id="nv-delete-modal-msg" class="text-xs text-[#1F2937]">Bạn có chắc chắn muốn xóa vị trí này khỏi hệ thống không?</p>
                            </div>
                            <div class="flex items-center justify-center gap-3 pb-5 px-6">
                                <button type="button" onclick="hideNvModal('delete-confirm-modal-nv')" class="px-4 h-[36px] bg-[#E5E7EB] hover:bg-[#D1D5DB] text-[#374151] rounded-[6px] text-xs font-semibold transition-colors cursor-pointer">Hủy</button>
                                <button type="button" onclick="confirmDeleteNgoaiVienTarget()" class="px-4 h-[36px] bg-rose-600 hover:bg-rose-700 text-white rounded-[6px] text-xs font-bold shadow-xs transition-colors cursor-pointer">Xác nhận xóa</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    const data = isNgoaiVienEditMode ? workingNgoaiVienData : MWKDataStore.getNgoaiVienMatrixData();
    const headerTier1 = document.getElementById('nv-matrix-header-tier1');
    const headerTier2 = document.getElementById('nv-matrix-header-tier2');
    const tbody = document.getElementById('nv-matrix-body-container');
    const notesContent = document.getElementById('nv-business-notes-content');
    if (!headerTier1 || !headerTier2 || !tbody) return;

    const areas = data.areas || [];
    const items = data.items || [];

    // 1. TIER 1 HEADER
    let h1Html = `
        <th rowspan="2" class="nv-sticky-corner-1-t1 p-2.5 text-center">STT</th>
        <th rowspan="2" class="nv-sticky-corner-2-t1 p-2.5">TÊN CHỈ TIÊU</th>
    `;
    areas.forEach(area => {
        const subCols = area.subColumns || [];
        const addSubColBtn = isNgoaiVienEditMode ? `
            <button type="button" onclick="showAddSubColumnModal('${area.id}')" title="Thêm chỉ tiêu con (+)" class="px-1 py-0.5 bg-[#0F6CBD] hover:bg-[#1E7FE5] text-white rounded text-[9px] font-bold ml-1 cursor-pointer">
                <i class="fa-solid fa-plus"></i>
            </button>
        ` : '';
        const deleteAreaBtn = (isNgoaiVienEditMode && areas.length > 1) ? `
            <button type="button" onclick="promptDeleteArea('${area.id}', '${area.name}')" title="Xóa vị trí này (-)" class="text-rose-300 hover:text-white ml-1 cursor-pointer">
                <i class="fa-solid fa-minus text-[10px]"></i>
            </button>
        ` : '';

        h1Html += `
            <th colspan="${Math.max(1, subCols.length)}" class="nv-sticky-header-t1 p-2 text-center border-b border-[#1E293B]">
                <div class="flex items-center justify-center gap-1">
                    <span>${area.name}</span>
                    ${addSubColBtn}
                    ${deleteAreaBtn}
                </div>
            </th>
        `;
    });
    h1Html += `
        <th rowspan="2" class="nv-sticky-header-t1 p-2 text-center min-w-[220px]">GHI CHÚ</th>
        ${isNgoaiVienEditMode ? `<th rowspan="2" class="nv-sticky-header-t1 p-2 text-center min-w-[100px]">THAO TÁC</th>` : ''}
    `;
    headerTier1.innerHTML = h1Html;

    // 2. TIER 2 HEADER
    let h2Html = '';
    areas.forEach(area => {
        const subCols = area.subColumns || [];
        if (subCols.length === 0) {
            h2Html += `<th class="nv-sticky-header-t2 p-2 text-center text-[10px] min-w-[150px]">(Trống)</th>`;
        } else {
            subCols.forEach(subCol => {
                const deleteSubColBtn = (isNgoaiVienEditMode && subCols.length > 1) ? `
                    <button type="button" onclick="promptDeleteSubColumn('${area.id}', '${subCol.id}', '${subCol.name}')" title="Xóa chỉ tiêu con này (-)" class="text-rose-300 hover:text-white ml-1 cursor-pointer">
                        <i class="fa-solid fa-minus text-[9px]"></i>
                    </button>
                ` : '';

                h2Html += `
                    <th class="nv-sticky-header-t2 p-2 text-center text-[10px] min-w-[140px]">
                        <div class="flex items-center justify-center gap-1">
                            <span>${subCol.name}</span>
                            ${deleteSubColBtn}
                        </div>
                    </th>
                `;
            });
        }
    });
    headerTier2.innerHTML = h2Html;

    // 3. BODY ROWS
    if (items.length === 0) {
        let totalCols = 2;
        areas.forEach(a => totalCols += Math.max(1, (a.subColumns || []).length));
        totalCols += 1 + (isNgoaiVienEditMode ? 1 : 0);
        tbody.innerHTML = `<tr><td colspan="${totalCols}" class="p-6 text-center text-slate-400 italic">Chưa có dữ liệu. Click [Cập nhật] -> [Thêm dòng] để bổ sung.</td></tr>`;
    } else {
        tbody.innerHTML = items.map((item, idx) => {
            const displayStt = isNgoaiVienEditMode ? (item.editSttDisplay !== undefined ? item.editSttDisplay : '') : (idx + 1);
            const vals = item.values || {};

            let rowCells = `
                <td class="nv-sticky-col-1 p-2.5 text-center font-bold text-slate-700 text-xs border border-[#D9DEE7] bg-[#F8FAFC]">
                    ${displayStt}
                </td>
                <td class="nv-sticky-col-2 p-2 font-bold text-xs text-[#1F2937] border border-[#D9DEE7] bg-[#F8FAFC]">
                    ${isNgoaiVienEditMode ? `
                        <input type="text" data-nvtype="targetName" data-nvid="${item.id}" value="${item.targetName}" placeholder="Nhập tên chỉ tiêu..." class="w-full text-xs font-bold border border-[#D1D5DB] bg-white rounded-[6px] h-[32px] px-2 focus:outline-none focus:border-[#0F6CBD]">
                    ` : `<span>${item.targetName}</span>`}
                </td>
            `;

            areas.forEach(area => {
                const subCols = area.subColumns || [];
                if (subCols.length === 0) {
                    rowCells += `<td class="p-2 border border-[#E5E7EB] bg-white text-center text-slate-300">-</td>`;
                } else {
                    subCols.forEach(subCol => {
                        const key = `${area.id}_${subCol.id}`;
                        const val = vals[key] !== undefined ? vals[key] : '';

                        if (isNgoaiVienEditMode) {
                            rowCells += `
                                <td class="p-1 border border-[#E5E7EB] bg-white text-center">
                                    <input type="text" data-nvtype="value" data-nvid="${item.id}" data-nvkey="${key}" value="${val}" placeholder="" class="w-full text-center text-xs font-bold border border-[#D1D5DB] bg-white rounded-[6px] h-[32px] px-1 focus:outline-none focus:border-[#0F6CBD]">
                                </td>
                            `;
                        } else {
                            rowCells += `
                                <td class="p-2 border border-[#E5E7EB] bg-white text-center font-bold text-[#1F2937] text-xs">
                                    ${val !== '' ? val : '-'}
                                </td>
                            `;
                        }
                    });
                }
            });

            // Note Column
            if (isNgoaiVienEditMode) {
                rowCells += `
                    <td class="p-1 border border-[#E5E7EB] bg-white min-w-[220px]">
                        <input type="text" data-nvtype="note" data-nvid="${item.id}" value="${item.note || ''}" placeholder="Ghi chú..." class="w-full text-xs font-medium border border-[#D1D5DB] bg-white rounded-[6px] h-[32px] px-2 focus:outline-none focus:border-[#0F6CBD]">
                    </td>
                `;
            } else {
                rowCells += `
                    <td class="p-2 border border-[#E5E7EB] bg-white text-left font-medium text-slate-700 text-xs min-w-[220px]">
                        ${item.note || '-'}
                    </td>
                `;
            }

            // Actions Column in Edit Mode
            if (isNgoaiVienEditMode) {
                const isFirst = idx === 0;
                const isLast = idx === items.length - 1;

                rowCells += `
                    <td class="p-1 border border-[#E5E7EB] bg-white text-center min-w-[100px]">
                        <div class="flex items-center justify-center gap-1">
                            <button type="button" onclick="moveNgoaiVienRowUp('${item.id}')" ${isFirst ? 'disabled class="text-slate-300 p-1 cursor-not-allowed"' : 'class="text-[#0F6CBD] hover:text-[#1E7FE5] p-1 cursor-pointer"'} title="Di chuyển lên"><i class="fa-solid fa-arrow-up text-xs"></i></button>
                            <button type="button" onclick="moveNgoaiVienRowDown('${item.id}')" ${isLast ? 'disabled class="text-slate-300 p-1 cursor-not-allowed"' : 'class="text-[#0F6CBD] hover:text-[#1E7FE5] p-1 cursor-pointer"'} title="Di chuyển xuống"><i class="fa-solid fa-arrow-down text-xs"></i></button>
                            <button type="button" onclick="promptDeleteNgoaiVienRow('${item.id}')" class="text-rose-500 hover:text-rose-700 p-1 cursor-pointer" title="Xóa dòng"><i class="fa-solid fa-trash-can text-xs"></i></button>
                        </div>
                    </td>
                `;
            }

            return `<tr class="hover:bg-[#F7F9FC] transition-colors">${rowCells}</tr>`;
        }).join('');
    }

    // 4. BUSINESS NOTES AT BOTTOM
    if (notesContent) {
        if (isNgoaiVienEditMode) {
            notesContent.innerHTML = `
                <textarea id="nv-business-notes-textarea" rows="3" class="w-full text-xs border border-[#D1D5DB] rounded-[6px] p-2 focus:outline-none focus:border-[#0F6CBD] font-medium leading-relaxed text-[#1E293B] bg-white resize-y" placeholder="Nhập ghi chú nghiệp vụ...">${data.businessNotes || ''}</textarea>
            `;
        } else {
            notesContent.innerHTML = `
                <div class="text-xs text-[#334155] whitespace-pre-line font-medium leading-relaxed">${data.businessNotes || '-'}</div>
            `;
        }
    }
}

// MODAL CONTROLS
function showNvModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('hidden');
}

function hideNvModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('hidden');
}

// DYNAMIC AREA ACTIONS (+ / -)

function showAddAreaModal() {
    if (!workingNgoaiVienData) return;

    // 1. Get master facilities from DataStore + common system locations
    const masterFacilities = MWKDataStore.getFacilities().map(f => f.name);
    const defaultRegions = ['Khu vực Hà Nội', 'Hà Nội', 'Tây Hồ', 'Ba Đình', 'Thanh Xuân', 'Cầu Giấy', 'Vĩnh Phúc', 'Thanh Hóa', 'Cần Thơ', 'HCM', 'Nghệ An', 'Quảng Bình', 'Bắc Ninh', 'Cà Mau', 'Đà Nẵng', 'Bình Dương', 'Đồng Nai', 'Hải Phòng', 'Quảng Ninh'];
    const allLocations = Array.from(new Set([...masterFacilities, ...defaultRegions]));

    // 2. Filter out locations that already exist in current table
    const existingNames = (workingNgoaiVienData.areas || []).map(a => a.name.toLowerCase().trim());
    const available = allLocations.filter(locName => !existingNames.includes(locName.toLowerCase().trim()));

    const select = document.getElementById('nv-new-area-select');
    const confirmBtn = document.getElementById('btn-confirm-add-area');

    if (select) {
        if (available.length > 0) {
            select.innerHTML = available.map(locName => `<option value="${locName}">${locName}</option>`).join('');
            select.disabled = false;
            if (confirmBtn) confirmBtn.disabled = false;
        } else {
            select.innerHTML = `<option value="" disabled selected>Tất cả vị trí trong hệ thống đã được thêm</option>`;
            select.disabled = true;
            if (confirmBtn) confirmBtn.disabled = true;
        }
    }

    showNvModal('add-area-modal-ngoaivien');
}

function confirmAddArea() {
    if (!workingNgoaiVienData) return;

    const select = document.getElementById('nv-new-area-select');
    if (!select || !select.value) {
        alert('Vui lòng chọn vị trí!');
        return;
    }

    const selectedName = select.value.trim();
    const exists = workingNgoaiVienData.areas.some(a => a.name.toLowerCase().trim() === selectedName.toLowerCase());
    if (exists) {
        alert('Vị trí này đã tồn tại trên bảng!');
        return;
    }

    const newAreaId = `area_${Date.now()}`;
    workingNgoaiVienData.areas.push({
        id: newAreaId,
        name: selectedName,
        subColumns: [
            { id: 'so_doan_ngay', name: 'Số đoàn/ngày có thể triển khai' },
            { id: 'so_kh_buoi', name: 'Số lượng KH/buổi tương ứng' }
        ]
    });

    hideNvModal('add-area-modal-ngoaivien');
    renderNgoaiVienView(document.getElementById('tab-content-container'));
}

function promptDeleteArea(areaId, areaName) {
    nvDeleteTarget = { type: 'area', areaId: areaId, name: areaName };
    const msg = document.getElementById('nv-delete-modal-msg');
    if (msg) msg.textContent = `Bạn có chắc chắn muốn xóa vị trí này?`;
    showNvModal('delete-confirm-modal-nv');
}

// DYNAMIC SUB-COLUMN ACTIONS (+ / -)

function showAddSubColumnModal(areaId) {
    activeTargetAreaId = areaId;
    const input = document.getElementById('nv-new-subcol-name');
    if (input) input.value = '';
    showNvModal('add-subcol-modal-ngoaivien');
}

function confirmAddSubColumn() {
    if (!workingNgoaiVienData || !activeTargetAreaId) return;

    const input = document.getElementById('nv-new-subcol-name');
    if (!input || !input.value.trim()) {
        alert('Vui lòng nhập tên chỉ tiêu con mới!');
        return;
    }

    const name = input.value.trim();
    const area = workingNgoaiVienData.areas.find(a => a.id === activeTargetAreaId);
    if (!area) return;

    const exists = area.subColumns.some(sc => sc.name.toLowerCase() === name.toLowerCase());
    if (exists) {
        alert('Tên chỉ tiêu con đã tồn tại trong khu vực này!');
        return;
    }

    const newSubColId = `sc_${Date.now()}`;
    area.subColumns.push({ id: newSubColId, name: name });

    activeTargetAreaId = null;
    hideNvModal('add-subcol-modal-ngoaivien');
    renderNgoaiVienView(document.getElementById('tab-content-container'));
}

function promptDeleteSubColumn(areaId, subColId, subColName) {
    nvDeleteTarget = { type: 'subCol', areaId: areaId, subColId: subColId, name: subColName };
    const msg = document.getElementById('nv-delete-modal-msg');
    if (msg) msg.textContent = `Bạn có chắc chắn muốn xóa cột chỉ tiêu "${subColName}" khỏi khu vực này không?`;
    showNvModal('delete-confirm-modal-nv');
}

// DYNAMIC ROW ACTIONS (EDIT MODE)

function addNewNgoaiVienRow() {
    if (!workingNgoaiVienData) return;

    const newId = `nv_${Date.now()}`;
    workingNgoaiVienData.items.push({
        id: newId,
        targetName: '',
        values: {},
        note: '',
        editSttDisplay: '',
        isNewUnsaved: true
    });

    renderNgoaiVienView(document.getElementById('tab-content-container'));
}

function moveNgoaiVienRowUp(id) {
    if (!workingNgoaiVienData) return;
    const items = workingNgoaiVienData.items;
    const idx = items.findIndex(i => i.id === id);
    if (idx > 0) {
        const temp = items[idx];
        items[idx] = items[idx - 1];
        items[idx - 1] = temp;
        renderNgoaiVienView(document.getElementById('tab-content-container'));
    }
}

function moveNgoaiVienRowDown(id) {
    if (!workingNgoaiVienData) return;
    const items = workingNgoaiVienData.items;
    const idx = items.findIndex(i => i.id === id);
    if (idx !== -1 && idx < items.length - 1) {
        const temp = items[idx];
        items[idx] = items[idx + 1];
        items[idx + 1] = temp;
        renderNgoaiVienView(document.getElementById('tab-content-container'));
    }
}

function promptDeleteNgoaiVienRow(id) {
    nvDeleteTarget = { type: 'row', rowId: id };
    const msg = document.getElementById('nv-delete-modal-msg');
    if (msg) msg.textContent = `Bạn có chắc chắn muốn xóa dòng chỉ tiêu này khỏi hệ thống không?`;
    showNvModal('delete-confirm-modal-nv');
}

function confirmDeleteNgoaiVienTarget() {
    if (!nvDeleteTarget || !workingNgoaiVienData) return;

    if (nvDeleteTarget.type === 'row') {
        workingNgoaiVienData.items = workingNgoaiVienData.items.filter(i => i.id !== nvDeleteTarget.rowId);
    } else if (nvDeleteTarget.type === 'area') {
        workingNgoaiVienData.areas = workingNgoaiVienData.areas.filter(a => a.id !== nvDeleteTarget.areaId);
    } else if (nvDeleteTarget.type === 'subCol') {
        const area = workingNgoaiVienData.areas.find(a => a.id === nvDeleteTarget.areaId);
        if (area) {
            area.subColumns = area.subColumns.filter(sc => sc.id !== nvDeleteTarget.subColId);
        }
    }

    nvDeleteTarget = null;
    hideNvModal('delete-confirm-modal-nv');
    renderNgoaiVienView(document.getElementById('tab-content-container'));
}

function saveNgoaiVienChanges() {
    if (!workingNgoaiVienData) return;

    // Sync input values from DOM before saving
    const tbody = document.getElementById('nv-matrix-body-container');
    if (tbody) {
        // Read target names
        const targetInputs = tbody.querySelectorAll('input[data-nvtype="targetName"]');
        targetInputs.forEach(input => {
            const id = input.getAttribute('data-nvid');
            const item = workingNgoaiVienData.items.find(i => i.id === id);
            if (item) item.targetName = input.value.trim();
        });

        // Read notes
        const noteInputs = tbody.querySelectorAll('input[data-nvtype="note"]');
        noteInputs.forEach(input => {
            const id = input.getAttribute('data-nvid');
            const item = workingNgoaiVienData.items.find(i => i.id === id);
            if (item) item.note = input.value.trim();
        });

        // Read grid cell values
        const valInputs = tbody.querySelectorAll('input[data-nvtype="value"]');
        valInputs.forEach(input => {
            const id = input.getAttribute('data-nvid');
            const key = input.getAttribute('data-nvkey');
            const val = input.value.trim();

            const item = workingNgoaiVienData.items.find(i => i.id === id);
            if (item) {
                if (!item.values) item.values = {};
                item.values[key] = val;
            }
        });
    }

    // Sync business notes at bottom
    const notesTextarea = document.getElementById('nv-business-notes-textarea');
    if (notesTextarea) {
        workingNgoaiVienData.businessNotes = notesTextarea.value.trim();
    }

    // Clean up temporary edit attributes
    if (workingNgoaiVienData.items) {
        workingNgoaiVienData.items.forEach(item => {
            delete item.editSttDisplay;
            delete item.isNewUnsaved;
        });
    }

    MWKDataStore.saveNgoaiVienMatrixData(workingNgoaiVienData);

    isNgoaiVienEditMode = false;
    toggleNgoaiVienEditMode(false);

    if (window.showToast) {
        window.showToast('Cập nhật định mức khám ngoại viện thành công.', 'success');
    }
}
