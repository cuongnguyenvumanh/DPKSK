/**
 * FULLY FUNCTIONAL ENTERPRISE DARK SLATE MATRIX RENDERER & ACTIONS ENGINE FOR TAB 1
 * Background: #F5F7FA | Header: #2F3E4E | Table Header: #32475B | Primary: #0F6CBD | Border: #D9DEE7
 */
const FACILITY_THEMES = {
    amber: { topHeader: 'bg-[#32475B] text-white font-semibold', subHeader: 'bg-[#2B3C4E] text-slate-100', cellBg: 'bg-white' },
    rose: { topHeader: 'bg-[#32475B] text-white font-semibold', subHeader: 'bg-[#2B3C4E] text-slate-100', cellBg: 'bg-white' },
    sky: { topHeader: 'bg-[#32475B] text-white font-semibold', subHeader: 'bg-[#2B3C4E] text-slate-100', cellBg: 'bg-white' },
    yellow: { topHeader: 'bg-[#32475B] text-white font-semibold', subHeader: 'bg-[#2B3C4E] text-slate-100', cellBg: 'bg-white' },
    purple: { topHeader: 'bg-[#32475B] text-white font-semibold', subHeader: 'bg-[#2B3C4E] text-slate-100', cellBg: 'bg-white' },
    orange: { topHeader: 'bg-[#32475B] text-white font-semibold', subHeader: 'bg-[#2B3C4E] text-slate-100', cellBg: 'bg-white' },
    emerald: { topHeader: 'bg-[#32475B] text-white font-semibold', subHeader: 'bg-[#2B3C4E] text-slate-100', cellBg: 'bg-white' },
    stone: { topHeader: 'bg-[#32475B] text-white font-semibold', subHeader: 'bg-[#2B3C4E] text-slate-100', cellBg: 'bg-white' },
    teal: { topHeader: 'bg-[#32475B] text-white font-semibold', subHeader: 'bg-[#2B3C4E] text-slate-100', cellBg: 'bg-white' },
    warm: { topHeader: 'bg-[#32475B] text-white font-semibold', subHeader: 'bg-[#2B3C4E] text-slate-100', cellBg: 'bg-white' }
};

let isEditMode = false;
let workingFacilities = [];
let workingRows = [];
let rowToDeleteId = null;

function recalculateRowSequenceNumbers() {
    let mainGroupIndex = 0;
    const childCounters = {};

    workingRows.forEach(r => {
        if (r.isNewUnsaved) {
            r.stt = '[ ]';
            return;
        }

        if (!r.parentGroupId) {
            mainGroupIndex++;
            if (r.id === 'notes') r.stt = String(mainGroupIndex);
            else if (!r.stt || !r.stt.includes(',')) r.stt = String(mainGroupIndex);
            childCounters[r.id] = 0;
        } else {
            const parentRow = workingRows.find(p => p.id === r.parentGroupId);
            const parentStt = parentRow ? parentRow.stt : '1';
            childCounters[r.parentGroupId] = (childCounters[r.parentGroupId] || 0) + 1;
            r.stt = `${parentStt},${childCounters[r.parentGroupId]}`;
        }
    });
}

function toggleMatrixEditMode(enableEdit) {
    isEditMode = enableEdit;

    const btnUpdate = document.getElementById('btn-matrix-update');
    const editActions = document.getElementById('edit-mode-actions');
    if (btnUpdate && editActions) {
        if (isEditMode) {
            btnUpdate.classList.add('hidden');
            editActions.classList.remove('hidden');
        } else {
            btnUpdate.classList.remove('hidden');
            editActions.classList.add('hidden');
        }
    }

    if (enableEdit) {
        const data = MWKDataStore.getPivotedMatrixData();
        workingFacilities = [...data.facilities];
        workingRows = [...data.rows];
        recalculateRowSequenceNumbers();
    }

    renderTaiVienMatrixView(document.getElementById('tab-content-container'));
}

function renderTaiVienMatrixView(container, customSearchVal = '') {
    if (!container) return;

    if (!container.querySelector('#matrix-body-container')) {
        container.innerHTML = `
            <div class="flex-1 flex flex-col min-h-0 overflow-hidden relative bg-[#F5F7FA]">
                <div class="border border-[#D9DEE7] bg-white shadow-none rounded-none flex-1 flex flex-col min-h-0 relative">
                    <div class="overflow-auto max-h-full custom-scrollbar flex-1">
                        <table class="w-full text-left text-xs border-collapse select-none matrix-table font-sans">
                            <thead class="uppercase font-semibold text-[11px]">
                                <tr id="matrix-header-tier-1"></tr>
                                <tr id="matrix-header-tier-2"></tr>
                            </thead>
                            <tbody id="matrix-body-container" class="divide-y divide-[#E5E7EB] text-[#1F2937]"></tbody>
                        </table>
                    </div>

                    <div id="facility-picker-popover" class="hidden absolute top-12 right-6 bg-white border border-[#D9DEE7] rounded-lg shadow-xl z-50 w-64 p-3 space-y-3">
                        <div class="flex items-center justify-between border-b border-[#E5E7EB] pb-2">
                            <span class="text-xs font-bold text-[#1F2937]">Thêm cơ sở khám mới</span>
                            <button type="button" onclick="hideFacilityPickerPopover()" class="text-slate-400 hover:text-slate-600">
                                <i class="fa-solid fa-xmark text-xs"></i>
                            </button>
                        </div>
                        <select id="popover-facility-select" class="w-full text-xs h-[36px] px-3 border border-[#D1D5DB] rounded-[6px] bg-white focus:outline-none focus:border-[#0F6CBD] font-medium text-[#1F2937]"></select>
                        <button type="button" onclick="confirmAddFacilityColumn()" class="w-full h-[36px] bg-[#0F6CBD] hover:bg-[#1E7FE5] text-white font-semibold text-xs rounded-[6px] shadow-xs transition-colors">
                            Thêm cột cơ sở
                        </button>
                    </div>

                    <div id="delete-row-confirm-modal" class="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 hidden flex items-center justify-center p-4">
                        <div class="bg-white rounded-lg shadow-2xl max-w-sm w-full space-y-4 border border-[#D9DEE7] text-center overflow-hidden">
                            <div class="bg-[#2F3E4E] text-white py-3.5 px-4 font-bold text-sm flex items-center justify-between">
                                <span>Xác nhận xóa dòng dữ liệu</span>
                                <i class="fa-solid fa-triangle-exclamation text-amber-400"></i>
                            </div>
                            <div class="px-6 py-2">
                                <p class="text-xs text-[#1F2937]">Bạn có chắc chắn muốn xóa dòng dữ liệu này khỏi hệ thống không?</p>
                            </div>
                            <div class="flex items-center justify-center gap-3 pb-5 px-6">
                                <button type="button" onclick="hideDeleteRowModal()" class="px-4 h-[36px] bg-[#E5E7EB] hover:bg-[#D1D5DB] text-[#374151] rounded-[6px] text-xs font-semibold transition-colors cursor-pointer">Hủy</button>
                                <button type="button" onclick="confirmDeleteMatrixRow()" class="px-4 h-[36px] bg-rose-600 hover:bg-rose-700 text-white rounded-[6px] text-xs font-bold shadow-xs transition-colors cursor-pointer">Xác nhận xóa</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    const regionVal = document.getElementById('filter-region') ? document.getElementById('filter-region').value : '';
    const searchVal = customSearchVal || (document.getElementById('global-search-input') ? document.getElementById('global-search-input').value.trim() : '');

    const data = MWKDataStore.getPivotedMatrixData(regionVal, searchVal);
    if (!isEditMode) {
        workingFacilities = [...data.facilities];
        workingRows = [...data.rows];
    }
    recalculateRowSequenceNumbers();

    const row1 = document.getElementById('matrix-header-tier-1');
    const row2 = document.getElementById('matrix-header-tier-2');
    const tbody = document.getElementById('matrix-body-container');
    if (!row1 || !row2 || !tbody) return;

    // 1. HEADERS RENDERER (DARK SLATE #32475B & #2B3C4E)
    let r1Html = `
        <th rowspan="2" class="sticky-corner-header w-[48px] min-w-[48px] max-w-[48px] text-center p-2.5 font-semibold box-border align-middle">STT</th>
        <th rowspan="2" class="sticky-corner-header sticky-corner-content min-w-[340px] p-2.5 font-semibold text-center">NỘI DUNG</th>
    `;
    let r2Html = '';

    workingFacilities.forEach(fac => {
        const theme = FACILITY_THEMES[fac.theme] || FACILITY_THEMES.amber;
        const facMode = fac.mode || 'FULL_DAY';
        const deleteFacBtn = isEditMode ? `<button type="button" onclick="deleteFacilityColumn('${fac.name}')" title="Xóa cột cơ sở" class="text-rose-400 hover:text-rose-200 ml-1.5 cursor-pointer"><i class="fa-solid fa-trash-can text-xs"></i></button>` : '';

        const canExpandShift = isEditMode && facMode !== 'MORNING_AFTERNOON';
        const expandShiftBtn = canExpandShift ? `
            <button type="button" onclick="upgradeFacilityShiftMode('${fac.name}')" title="Bổ sung ca (Sáng / Chiều)" class="px-1.5 py-0.5 bg-[#0F6CBD] hover:bg-[#1E7FE5] text-white rounded-[4px] text-[10px] font-bold ml-1 transition-colors cursor-pointer">
                <i class="fa-solid fa-plus"></i>
            </button>
        ` : '';

        if (facMode === 'MORNING_AFTERNOON') {
            r1Html += `<th colspan="2" class="sticky-header-fac text-center p-2 text-xs uppercase">${fac.name} ${expandShiftBtn} ${deleteFacBtn}</th>`;
            r2Html += `
                <th class="sticky-header-shift text-center p-1.5 min-w-[55px] text-[11px]">Sáng</th>
                <th class="sticky-header-shift text-center p-1.5 min-w-[55px] text-[11px]">Chiều</th>
            `;
        } else if (facMode === 'MORNING_ONLY') {
            r1Html += `<th colspan="1" class="sticky-header-fac text-center p-2 text-xs uppercase min-w-[90px]">${fac.name} ${expandShiftBtn} ${deleteFacBtn}</th>`;
            r2Html += `<th class="sticky-header-shift text-center p-1.5 min-w-[90px] text-[11px]">Sáng</th>`;
        } else {
            r1Html += `<th rowspan="2" class="sticky-header-fac text-center p-2 text-xs uppercase min-w-[90px]">${fac.name} ${expandShiftBtn} ${deleteFacBtn}</th>`;
        }
    });

    if (isEditMode) {
        r1Html += `
            <th rowspan="2" class="sticky-header-fac text-center p-2 min-w-[60px]">
                <button type="button" onclick="showFacilityPickerPopover()" title="Thêm cột cơ sở khám mới" class="w-7 h-7 rounded-[6px] bg-[#0F6CBD] hover:bg-[#1E7FE5] text-white font-bold inline-flex items-center justify-center shadow-xs cursor-pointer">
                    <i class="fa-solid fa-plus text-xs"></i>
                </button>
            </th>
        `;
    }

    row1.innerHTML = r1Html;
    row2.innerHTML = r2Html;

    // 2. IN-PLACE BODY ROWS RENDERER
    let bodyHtml = '';
    const masterCategories = MWKDataStore.getCategories ? MWKDataStore.getCategories() : [];

    workingRows.forEach(r => {
        let leftHeaderBg = 'matrix-default-header';
        let rowBgClass = '';

        const isInfoSectionRow = (r.id === 'notes' || r.type === 'person' || r.type === 'notes' || r.type === 'multiline' || ['3', '4', '5', '6', '7', '8'].includes(r.id) || (r.parentGroupId && ['notes', '3', '4', '5', '6', '7', '8'].includes(r.parentGroupId)));

        if (r.id === '2' || r.isGroupHeader) {
            leftHeaderBg = 'matrix-group-header';
            rowBgClass = 'bg-[#E2E8F0]';
        } else if (r.id.startsWith('2.')) {
            leftHeaderBg = 'matrix-specialty-header';
        } else if (r.id === 'notes' || (r.parentGroupId && r.parentGroupId === 'notes')) {
            leftHeaderBg = 'matrix-notes-header';
        } else if (['3', '4', '5', '6', '7', '8'].includes(r.id) || isInfoSectionRow) {
            leftHeaderBg = 'matrix-info-header';
        }

        const showDeleteBtn = isEditMode && (r.parentGroupId || ['3', '4', '5', '6', '7', '8'].includes(r.id) || isInfoSectionRow) && !['1', '1.1', '1.2', '2'].includes(r.id);
        const actionBtns = isEditMode ? `
            <div class="flex items-center gap-1">
                ${r.parentGroupId ? `
                    <button type="button" onclick="moveMatrixRowUp('${r.id}')" title="Di chuyển lên" class="text-slate-500 hover:text-[#0F6CBD] px-1 cursor-pointer"><i class="fa-solid fa-arrow-up text-[10px]"></i></button>
                    <button type="button" onclick="moveMatrixRowDown('${r.id}')" title="Di chuyển xuống" class="text-slate-500 hover:text-[#0F6CBD] px-1 cursor-pointer"><i class="fa-solid fa-arrow-down text-[10px]"></i></button>
                ` : ''}
                ${showDeleteBtn ? `
                    <button type="button" onclick="promptDeleteMatrixRow('${r.id}')" title="Xóa dòng này (-)" class="text-rose-600 hover:text-rose-800 px-1 cursor-pointer font-bold flex items-center gap-0.5">
                        <i class="fa-solid fa-minus text-xs"></i>
                    </button>
                ` : ''}
            </div>
        ` : '';

        bodyHtml += `
            <tr class="hover:bg-[#F7F9FC] transition-colors ${rowBgClass}">
                <td class="sticky-col-stt ${leftHeaderBg} font-bold text-xs">
                    <div class="sticky-col-stt-inner">
                        ${r.stt}
                    </div>
                </td>
                <td class="sticky-col-content ${leftHeaderBg} font-bold min-w-[340px] p-2 text-left text-xs whitespace-pre-line leading-snug">
                    <div class="flex items-center justify-between gap-2">
                        ${isEditMode && r.parentGroupId === '2' ? `
                            <select onchange="updateRowName('${r.id}', this.value)" class="w-full text-xs font-bold border border-[#D1D5DB] bg-white rounded-[6px] h-[32px] px-2 focus:outline-none focus:border-[#0F6CBD]">
                                ${masterCategories.map(c => `<option value="${c.name}" ${c.name === r.name ? 'selected' : ''}>${c.name}</option>`).join('')}
                            </select>
                        ` : isEditMode && (r.parentGroupId || isInfoSectionRow) ? `
                            <input type="text" value="${r.name}" onchange="updateRowName('${r.id}', this.value)" class="w-full text-xs font-bold border border-[#D1D5DB] bg-white rounded-[6px] h-[32px] px-2 focus:outline-none focus:border-[#0F6CBD]">
                        ` : `
                            <span class="flex-1">${r.name}</span>
                        `}
                        ${isEditMode ? `
                            <button type="button" onclick="addGroupChildRow('${r.id}')" title="Thêm dòng dưới nhóm này (+)" class="px-2 py-1 bg-[#0F6CBD] hover:bg-[#1E7FE5] text-white rounded-[6px] text-[11px] font-semibold flex items-center gap-1 shadow-xs cursor-pointer transition-colors">
                                <i class="fa-solid fa-plus text-[10px]"></i>
                                <span>Thêm</span>
                            </button>
                        ` : ''}
                        ${actionBtns}
                    </div>
                </td>
        `;

        workingFacilities.forEach(fac => {
            const facValObj = r.facValues ? (r.facValues[fac.name] || { Full: '', Sang: '', Chieu: '' }) : { Full: '', Sang: '', Chieu: '' };
            const facMode = fac.mode || 'FULL_DAY';
            const isGroup1Row = (r.id === '1' || r.parentGroupId === '1' || r.id.startsWith('1.'));

            if (isGroup1Row) {
                // GROUP 1 (Items 1, 1.1, 1.2): ALWAYS 01 SINGLE CELL PER FACILITY (NUMERIC / RANGE INPUT, NO SÁNG/CHIỀU SPLIT)
                const valFull = facValObj.Full || facValObj.Sang || '';
                const colspanAttr = facMode === 'MORNING_AFTERNOON' ? 'colspan="2"' : '';

                if (isEditMode) {
                    bodyHtml += `
                        <td ${colspanAttr} class="border border-[#E5E7EB] p-1 text-center bg-white">
                            <input type="text" data-rowid="${r.id}" data-fac="${fac.name}" data-shift="Full" value="${valFull}" placeholder="0" class="w-full text-center py-1 px-1 font-bold text-[#1F2937] text-xs border border-[#D1D5DB] bg-white rounded-[6px] h-[32px] focus:outline-none focus:border-[#0F6CBD]">
                        </td>
                    `;
                } else {
                    bodyHtml += `
                        <td ${colspanAttr} class="border border-[#E5E7EB] p-2 text-center bg-white font-bold text-[#1F2937] text-xs">
                            ${valFull || '-'}
                        </td>
                    `;
                }
            } else if (r.isGroupHeader && !isInfoSectionRow) {
                if (facMode === 'MORNING_AFTERNOON') {
                    bodyHtml += `
                        <td class="border border-[#E5E7EB] p-1.5 text-center font-bold bg-[#2B3C4E] text-white text-[11px]">Sáng</td>
                        <td class="border border-[#E5E7EB] p-1.5 text-center font-bold bg-[#2B3C4E] text-white text-[11px]">Chiều</td>
                    `;
                } else if (facMode === 'MORNING_ONLY') {
                    bodyHtml += `<td class="border border-[#E5E7EB] p-1.5 text-center font-bold bg-[#2B3C4E] text-white text-[11px]">Sáng</td>`;
                } else {
                    bodyHtml += `<td class="border border-[#E5E7EB] p-1.5 text-center bg-[#2B3C4E]"></td>`;
                }
            } else if (!isInfoSectionRow && !r.isGroupHeader) {
                if (facMode === 'MORNING_AFTERNOON') {
                    if (isEditMode) {
                        bodyHtml += `
                            <td class="border border-[#E5E7EB] p-1 text-center bg-white">
                                <input type="number" min="0" data-rowid="${r.id}" data-fac="${fac.name}" data-shift="Sang" value="${facValObj.Sang || ''}" class="w-full text-center py-1 px-0.5 font-bold text-[#1F2937] text-xs border border-[#D1D5DB] bg-white rounded-[6px] h-[32px] focus:outline-none focus:border-[#0F6CBD]">
                            </td>
                            <td class="border border-[#E5E7EB] p-1 text-center bg-white">
                                <input type="number" min="0" data-rowid="${r.id}" data-fac="${fac.name}" data-shift="Chieu" value="${facValObj.Chieu || ''}" class="w-full text-center py-1 px-0.5 font-bold text-[#1F2937] text-xs border border-[#D1D5DB] bg-white rounded-[6px] h-[32px] focus:outline-none focus:border-[#0F6CBD]">
                            </td>
                        `;
                    } else {
                        bodyHtml += `
                            <td class="border border-[#E5E7EB] p-2 text-center bg-white font-bold text-[#1F2937] text-xs">${facValObj.Sang || '0'}</td>
                            <td class="border border-[#E5E7EB] p-2 text-center bg-white font-bold text-[#1F2937] text-xs">${facValObj.Chieu || '0'}</td>
                        `;
                    }
                } else if (facMode === 'MORNING_ONLY') {
                    if (isEditMode) {
                        bodyHtml += `
                            <td class="border border-[#E5E7EB] p-1 text-center bg-white">
                                <input type="number" min="0" data-rowid="${r.id}" data-fac="${fac.name}" data-shift="Sang" value="${facValObj.Sang || ''}" class="w-full text-center py-1 px-0.5 font-bold text-[#1F2937] text-xs border border-[#D1D5DB] bg-white rounded-[6px] h-[32px] focus:outline-none focus:border-[#0F6CBD]">
                            </td>
                        `;
                    } else {
                        bodyHtml += `<td class="border border-[#E5E7EB] p-2 text-center bg-white font-bold text-[#1F2937] text-xs">${facValObj.Sang || '0'}</td>`;
                    }
                } else {
                    const valFull = facValObj.Full || facValObj.Sang || '';
                    if (isEditMode) {
                        bodyHtml += `
                            <td class="border border-[#E5E7EB] p-1 text-center bg-white">
                                <input type="number" min="0" data-rowid="${r.id}" data-fac="${fac.name}" data-shift="Full" value="${valFull}" class="w-full text-center py-1 px-0.5 font-bold text-[#1F2937] text-xs border border-[#D1D5DB] bg-white rounded-[6px] h-[32px] focus:outline-none focus:border-[#0F6CBD]">
                            </td>
                        `;
                    } else {
                        bodyHtml += `<td class="border border-[#E5E7EB] p-2 text-center bg-white font-bold text-[#1F2937] text-xs">${valFull || '0'}</td>`;
                    }
                }
            } else {
                const valFull = facValObj.Full || facValObj.Sang || '';
                const shiftKey = facMode === 'MORNING_ONLY' ? 'Sang' : 'Full';
                const colspanAttr = facMode === 'MORNING_AFTERNOON' ? 'colspan="2"' : '';

                if (isEditMode) {
                    bodyHtml += `
                        <td ${colspanAttr} class="border border-[#E5E7EB] p-1.5 text-center bg-white">
                            <textarea data-rowid="${r.id}" data-fac="${fac.name}" data-shift="${shiftKey}" rows="2" placeholder="Nhập thông tin..." class="w-full text-xs font-medium text-[#1F2937] border border-[#D1D5DB] bg-white rounded-[6px] p-2 focus:outline-none focus:border-[#0F6CBD] resize-y">${valFull}</textarea>
                        </td>
                    `;
                } else {
                    if (r.id === 'notes' || (r.parentGroupId && r.parentGroupId === 'notes')) {
                        let tagItems = [];
                        if (valFull.includes(',')) tagItems = valFull.split(',').map(s => s.trim()).filter(Boolean);
                        else if (valFull.includes('\n')) tagItems = valFull.split('\n').map(s => s.trim().replace(/^[-•]\s*/, '')).filter(Boolean);
                        else if (valFull) tagItems = [valFull];

                        if (tagItems.length > 0) {
                            const tagsHtml = tagItems.map(t => `<div class="px-2 py-0.5 rounded-[4px] bg-rose-50 text-rose-700 text-[11px] font-bold border border-rose-200 mb-0.5 inline-block">${t}</div>`).join(' ');
                            bodyHtml += `
                                <td ${colspanAttr} class="border border-[#E5E7EB] p-2 text-center bg-white">
                                    <div class="flex flex-col gap-1 items-center justify-center">${tagsHtml}</div>
                                </td>
                            `;
                        } else {
                            bodyHtml += `<td ${colspanAttr} class="border border-[#E5E7EB] p-2 text-center bg-white text-slate-400 text-xs">-</td>`;
                        }
                    } else {
                        bodyHtml += `
                            <td ${colspanAttr} class="border border-[#E5E7EB] p-2 text-center bg-white font-semibold text-[#1F2937] text-[11px] whitespace-pre-line leading-snug">
                                ${valFull || '-'}
                            </td>
                        `;
                    }
                }
            }
        });

        if (isEditMode) {
            bodyHtml += `<td class="border border-[#E5E7EB] p-2 text-center bg-slate-50"></td>`;
        }

        bodyHtml += `</tr>`;
    });

    tbody.innerHTML = bodyHtml;
}

function upgradeFacilityShiftMode(facName) {
    const fac = workingFacilities.find(f => f.name === facName);
    if (!fac) return;

    if (!fac.mode || fac.mode === 'FULL_DAY') {
        fac.mode = 'MORNING_ONLY';
    } else if (fac.mode === 'MORNING_ONLY') {
        fac.mode = 'MORNING_AFTERNOON';
    }

    renderTaiVienMatrixView(document.getElementById('tab-content-container'));
}

function addGroupChildRow(groupId) {
    const newId = `custom_${Date.now()}`;
    
    let rowType = 'person';
    let isShifted = false;
    let defaultName = 'Dòng thông tin mới';

    if (groupId === '2') {
        rowType = 'number';
        isShifted = true;
        const masterCategories = MWKDataStore.getCategories ? MWKDataStore.getCategories() : [];
        defaultName = masterCategories.length > 0 ? masterCategories[0].name : 'Khám chuyên khoa mới';
    } else if (groupId === 'notes') {
        rowType = 'multiline';
        defaultName = 'Nội dung thiếu / Yêu cầu mới';
    }

    const newRow = {
        id: newId,
        parentGroupId: groupId,
        stt: '[ ]',
        name: defaultName,
        type: rowType,
        isGroupHeader: false,
        isShifted: isShifted,
        isNewUnsaved: true,
        facValues: {}
    };

    let insertIdx = -1;
    for (let i = workingRows.length - 1; i >= 0; i--) {
        if (workingRows[i].id === groupId || workingRows[i].parentGroupId === groupId) {
            insertIdx = i + 1;
            break;
        }
    }

    if (insertIdx !== -1) {
        workingRows.splice(insertIdx, 0, newRow);
    } else {
        workingRows.push(newRow);
    }

    recalculateRowSequenceNumbers();
    renderTaiVienMatrixView(document.getElementById('tab-content-container'));
}

function updateRowName(rowId, newName) {
    const row = workingRows.find(r => r.id === rowId);
    if (row) {
        row.name = newName;
    }
}

function moveMatrixRowUp(rowId) {
    const idx = workingRows.findIndex(r => r.id === rowId);
    if (idx <= 0) return;
    const targetRow = workingRows[idx];
    const prevRow = workingRows[idx - 1];

    if (prevRow && prevRow.parentGroupId === targetRow.parentGroupId) {
        workingRows[idx] = prevRow;
        workingRows[idx - 1] = targetRow;
        recalculateRowSequenceNumbers();
        renderTaiVienMatrixView(document.getElementById('tab-content-container'));
    }
}

function moveMatrixRowDown(rowId) {
    const idx = workingRows.findIndex(r => r.id === rowId);
    if (idx === -1 || idx >= workingRows.length - 1) return;
    const targetRow = workingRows[idx];
    const nextRow = workingRows[idx + 1];

    if (nextRow && nextRow.parentGroupId === targetRow.parentGroupId) {
        workingRows[idx] = nextRow;
        workingRows[idx + 1] = targetRow;
        recalculateRowSequenceNumbers();
        renderTaiVienMatrixView(document.getElementById('tab-content-container'));
    }
}

function promptDeleteMatrixRow(rowId) {
    rowToDeleteId = rowId;
    const modal = document.getElementById('delete-row-confirm-modal');
    if (modal) modal.classList.remove('hidden');
}

function hideDeleteRowModal() {
    rowToDeleteId = null;
    const modal = document.getElementById('delete-row-confirm-modal');
    if (modal) modal.classList.add('hidden');
}

function confirmDeleteMatrixRow() {
    if (!rowToDeleteId) return;
    workingRows = workingRows.filter(r => r.id !== rowToDeleteId);
    rowToDeleteId = null;
    hideDeleteRowModal();
    recalculateRowSequenceNumbers();
    renderTaiVienMatrixView(document.getElementById('tab-content-container'));
}

function deleteFacilityColumn(facName) {
    workingFacilities = workingFacilities.filter(f => f.name !== facName);
    renderTaiVienMatrixView(document.getElementById('tab-content-container'));
}

function showFacilityPickerPopover() {
    const popover = document.getElementById('facility-picker-popover');
    const select = document.getElementById('popover-facility-select');
    if (!popover || !select) return;

    const allFacilities = MWKDataStore.getFacilities ? MWKDataStore.getFacilities() : [];
    const addedNames = workingFacilities.map(f => f.name);
    const unadded = allFacilities.filter(f => !addedNames.includes(f.name));

    if (unadded.length === 0) {
        select.innerHTML = `<option value="">Đã thêm tất cả cơ sở khám</option>`;
    } else {
        select.innerHTML = unadded.map(f => `<option value="${f.name}">${f.name} - ${f.addr || ''}</option>`).join('');
    }

    popover.classList.remove('hidden');
}

function hideFacilityPickerPopover() {
    const popover = document.getElementById('facility-picker-popover');
    if (popover) popover.classList.add('hidden');
}

function confirmAddFacilityColumn() {
    const select = document.getElementById('popover-facility-select');
    if (!select || !select.value) return;

    const facName = select.value;
    const newFac = {
        code: facName.slice(0, 3).toUpperCase(),
        name: facName,
        region: 'Bắc',
        theme: 'amber',
        mode: 'FULL_DAY'
    };

    workingFacilities.push(newFac);
    hideFacilityPickerPopover();
    renderTaiVienMatrixView(document.getElementById('tab-content-container'));
}

function saveMatrixEditChanges() {
    const tbody = document.getElementById('matrix-body-container');
    if (!tbody) return;

    const inputs = tbody.querySelectorAll('input, select, textarea');
    const entries = [];

    inputs.forEach(input => {
        const itemId = input.getAttribute('data-rowid');
        const fac = input.getAttribute('data-fac');
        const shift = input.getAttribute('data-shift');
        const val = input.value.trim();

        if (itemId && fac && shift) {
            entries.push({ itemId, facility: fac, shift, value: val });
        }
    });

    workingRows.forEach(r => {
        delete r.isNewUnsaved;
    });

    recalculateRowSequenceNumbers();

    MWKDataStore.saveNormalizedMatrixEntries(entries);
    if (MWKDataStore.saveMatrixFacilities) {
        MWKDataStore.saveMatrixFacilities(workingFacilities);
    }
    if (MWKDataStore.saveMatrixRowDefinitions) {
        MWKDataStore.saveMatrixRowDefinitions(workingRows);
    }

    isEditMode = false;
    toggleMatrixEditMode(false);

    if (window.showToast) {
        window.showToast('Cập nhật dữ liệu thành công.', 'success');
    }
}
