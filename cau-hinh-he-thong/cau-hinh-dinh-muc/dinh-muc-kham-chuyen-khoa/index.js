/**
 * SUB-TAB 3 (ĐỊNH MỨC KHÁM CÁC CHUYÊN KHOA) MATRIX ENGINE
 * Features: 2 Inner Sub-Tabs (Thường quy & CK Tiêu hóa), 2-Tier Sticky Headers, View Mode vs Inline Edit Mode,
 * Move Up / Move Down / Add / Delete Rows, Dynamic Column Group (+) & (-), Frozen STT in Edit Mode & Auto-Resequencing on Save, Toast & DataStore Integration.
 */
let currentInnerChuyenKhoaTab = 'thuongQuy'; // 'thuongQuy' | 'tieuHoa'
let isChuyenKhoaEditMode = false;
let workingCkData = null;
let ckDeleteTarget = null; // { type: 'row'|'group'|'facility', id: string }

function switchInnerChuyenKhoaTab(tabType) {
    currentInnerChuyenKhoaTab = tabType;

    const btnTQ = document.getElementById('ck-inner-tab-thuong-quy');
    const btnTH = document.getElementById('ck-inner-tab-tieu-hoa');

    if (btnTQ && btnTH) {
        if (tabType === 'thuongQuy') {
            btnTQ.className = 'px-4 py-1.5 rounded-[6px] text-xs font-bold transition-all cursor-pointer bg-[#0F6CBD] text-white shadow-xs';
            btnTH.className = 'px-4 py-1.5 rounded-[6px] text-xs font-semibold transition-all cursor-pointer bg-[#E5E7EB] hover:bg-[#D1D5DB] text-[#374151]';
        } else {
            btnTQ.className = 'px-4 py-1.5 rounded-[6px] text-xs font-semibold transition-all cursor-pointer bg-[#E5E7EB] hover:bg-[#D1D5DB] text-[#374151]';
            btnTH.className = 'px-4 py-1.5 rounded-[6px] text-xs font-bold transition-all cursor-pointer bg-[#0F6CBD] text-white shadow-xs';
        }
    }

    renderChuyenKhoaView(document.getElementById('tab-content-container'));
}

function toggleChuyenKhoaEditMode(enableEdit) {
    isChuyenKhoaEditMode = enableEdit;

    const btnUpdate = document.getElementById('btn-matrix-update');
    const editActions = document.getElementById('edit-mode-actions');
    const addRowContainer = document.getElementById('ck-add-row-action-container');

    if (btnUpdate && editActions) {
        if (isChuyenKhoaEditMode) {
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
        workingCkData = JSON.parse(JSON.stringify(MWKDataStore.getChuyenKhoaMatrixData()));
        // Freeze STT display numbers for existing rows when entering Edit Mode
        if (workingCkData.thuongQuy && workingCkData.thuongQuy.items) {
            workingCkData.thuongQuy.items.forEach((item, idx) => item.editSttDisplay = idx + 1);
        }
        if (workingCkData.tieuHoa && workingCkData.tieuHoa.items) {
            workingCkData.tieuHoa.items.forEach((item, idx) => item.editSttDisplay = idx + 1);
        }
    } else {
        workingCkData = null;
    }

    renderChuyenKhoaView(document.getElementById('tab-content-container'));
}

function renderChuyenKhoaView(container, customSearchVal = '') {
    if (!container) return;

    if (!container.querySelector('#ck-matrix-body-container')) {
        container.innerHTML = `
            <div class="flex-1 flex flex-col min-h-0 overflow-hidden relative bg-[#F5F7FA]">
                <div class="bg-white border-b border-[#D9DEE7] px-4 py-2 flex items-center justify-between flex-shrink-0">
                    <div class="flex items-center gap-2">
                        <button type="button" id="ck-inner-tab-thuong-quy" onclick="switchInnerChuyenKhoaTab('thuongQuy')" class="${currentInnerChuyenKhoaTab === 'thuongQuy' ? 'px-4 py-1.5 rounded-[6px] text-xs font-bold transition-all cursor-pointer bg-[#0F6CBD] text-white shadow-xs' : 'px-4 py-1.5 rounded-[6px] text-xs font-semibold transition-all cursor-pointer bg-[#E5E7EB] hover:bg-[#D1D5DB] text-[#374151]'}">
                            <i class="fa-solid fa-list-check mr-1.5"></i>
                            <span>Định mức khám các dịch vụ thường quy</span>
                        </button>
                        <button type="button" id="ck-inner-tab-tieu-hoa" onclick="switchInnerChuyenKhoaTab('tieuHoa')" class="${currentInnerChuyenKhoaTab === 'tieuHoa' ? 'px-4 py-1.5 rounded-[6px] text-xs font-bold transition-all cursor-pointer bg-[#0F6CBD] text-white shadow-xs' : 'px-4 py-1.5 rounded-[6px] text-xs font-semibold transition-all cursor-pointer bg-[#E5E7EB] hover:bg-[#D1D5DB] text-[#374151]'}">
                            <i class="fa-solid fa-stomach mr-1.5"></i>
                            <span>Định mức dịch vụ CK tiêu hóa</span>
                        </button>
                    </div>

                    <div id="ck-add-row-action-container" class="${isChuyenKhoaEditMode ? '' : 'hidden'}">
                        <button type="button" onclick="addNewChuyenKhoaRow()" class="px-3.5 h-[32px] bg-[#0F6CBD] hover:bg-[#1E7FE5] text-white rounded-[6px] text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer">
                            <i class="fa-solid fa-plus text-[10px]"></i>
                            <span>Thêm dòng</span>
                        </button>
                    </div>
                </div>

                <div class="border border-t-0 border-[#D9DEE7] bg-white shadow-none rounded-none flex-1 flex flex-col min-h-0 relative">
                    <div class="overflow-auto max-h-full custom-scrollbar flex-1">
                        <table class="w-full text-left text-xs border-collapse select-none ck-matrix-table font-sans">
                            <thead class="uppercase font-semibold text-[11px]">
                                <tr id="ck-matrix-header-tier1"></tr>
                                <tr id="ck-matrix-header-tier2"></tr>
                            </thead>
                            <tbody id="ck-matrix-body-container" class="divide-y divide-[#E5E7EB] text-[#1F2937]"></tbody>
                        </table>
                    </div>

                    <!-- MODAL 1: THÊM NHÓM ĐỐI TƯỢNG -->
                    <div id="add-group-modal-thuongquy" class="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 hidden flex items-center justify-center p-4">
                        <div class="bg-white rounded-lg shadow-2xl max-w-sm w-full space-y-4 border border-[#D9DEE7] overflow-hidden">
                            <div class="bg-[#2F3E4E] text-white py-3.5 px-4 font-bold text-sm flex items-center justify-between">
                                <span>Thêm nhóm đối tượng mới</span>
                                <button type="button" onclick="hideCkModal('add-group-modal-thuongquy')" class="text-slate-300 hover:text-white"><i class="fa-solid fa-xmark text-xs"></i></button>
                            </div>
                            <div class="px-5 py-2 space-y-3">
                                <div>
                                    <label class="block text-xs font-semibold text-slate-700 mb-1">Tên nhóm đối tượng mới <span class="text-rose-500">*</span></label>
                                    <input type="text" id="ck-new-group-name" placeholder="Ví dụ: Bệnh viện, Học viện..." class="w-full text-xs h-[36px] px-3 border border-[#D1D5DB] rounded-[6px] focus:outline-none focus:border-[#0F6CBD] font-medium text-[#1F2937]">
                                </div>
                            </div>
                            <div class="flex items-center justify-end gap-2.5 pb-4 px-5">
                                <button type="button" onclick="hideCkModal('add-group-modal-thuongquy')" class="px-4 h-[36px] bg-[#E5E7EB] hover:bg-[#D1D5DB] text-[#374151] rounded-[6px] text-xs font-semibold transition-colors cursor-pointer">Hủy</button>
                                <button type="button" onclick="confirmAddThuongQuyGroup()" class="px-4 h-[36px] bg-[#0F6CBD] hover:bg-[#1E7FE5] text-white rounded-[6px] text-xs font-semibold shadow-xs transition-colors cursor-pointer">Xác nhận thêm</button>
                            </div>
                        </div>
                    </div>

                    <!-- MODAL 2: THÊM CƠ SỞ KHÁM -->
                    <div id="add-facility-modal-tieuhoa" class="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 hidden flex items-center justify-center p-4">
                        <div class="bg-white rounded-lg shadow-2xl max-w-sm w-full space-y-4 border border-[#D9DEE7] overflow-hidden">
                            <div class="bg-[#2F3E4E] text-white py-3.5 px-4 font-bold text-sm flex items-center justify-between">
                                <span>Thêm cơ sở khám mới</span>
                                <button type="button" onclick="hideCkModal('add-facility-modal-tieuhoa')" class="text-slate-300 hover:text-white"><i class="fa-solid fa-xmark text-xs"></i></button>
                            </div>
                            <div class="px-5 py-2 space-y-3">
                                <div>
                                    <label class="block text-xs font-semibold text-slate-700 mb-1">Tên cơ sở khám mới <span class="text-rose-500">*</span></label>
                                    <input type="text" id="ck-new-facility-name" placeholder="Ví dụ: Vĩnh Phúc, Hải Phòng..." class="w-full text-xs h-[36px] px-3 border border-[#D1D5DB] rounded-[6px] focus:outline-none focus:border-[#0F6CBD] font-medium text-[#1F2937]">
                                </div>
                            </div>
                            <div class="flex items-center justify-end gap-2.5 pb-4 px-5">
                                <button type="button" onclick="hideCkModal('add-facility-modal-tieuhoa')" class="px-4 h-[36px] bg-[#E5E7EB] hover:bg-[#D1D5DB] text-[#374151] rounded-[6px] text-xs font-semibold transition-colors cursor-pointer">Hủy</button>
                                <button type="button" onclick="confirmAddTieuHoaFacility()" class="px-4 h-[36px] bg-[#0F6CBD] hover:bg-[#1E7FE5] text-white rounded-[6px] text-xs font-semibold shadow-xs transition-colors cursor-pointer">Xác nhận thêm</button>
                            </div>
                        </div>
                    </div>

                    <!-- MODAL XÓA DÒNG / CỘT -->
                    <div id="delete-confirm-modal-ck" class="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 hidden flex items-center justify-center p-4">
                        <div class="bg-white rounded-lg shadow-2xl max-w-sm w-full space-y-4 border border-[#D9DEE7] text-center overflow-hidden">
                            <div class="bg-[#2F3E4E] text-white py-3.5 px-4 font-bold text-sm flex items-center justify-between">
                                <span>Xác nhận xóa</span>
                                <i class="fa-solid fa-triangle-exclamation text-amber-400"></i>
                            </div>
                            <div class="px-6 py-2">
                                <p id="ck-delete-modal-msg" class="text-xs text-[#1F2937]">Bạn có chắc chắn muốn xóa mục này khỏi hệ thống không?</p>
                            </div>
                            <div class="flex items-center justify-center gap-3 pb-5 px-6">
                                <button type="button" onclick="hideCkModal('delete-confirm-modal-ck')" class="px-4 h-[36px] bg-[#E5E7EB] hover:bg-[#D1D5DB] text-[#374151] rounded-[6px] text-xs font-semibold transition-colors cursor-pointer">Hủy</button>
                                <button type="button" onclick="confirmDeleteChuyenKhoaTarget()" class="px-4 h-[36px] bg-rose-600 hover:bg-rose-700 text-white rounded-[6px] text-xs font-bold shadow-xs transition-colors cursor-pointer">Xác nhận xóa</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    const data = isChuyenKhoaEditMode ? workingCkData : MWKDataStore.getChuyenKhoaMatrixData();
    const headerTier1 = document.getElementById('ck-matrix-header-tier1');
    const headerTier2 = document.getElementById('ck-matrix-header-tier2');
    const tbody = document.getElementById('ck-matrix-body-container');
    if (!headerTier1 || !headerTier2 || !tbody) return;

    if (currentInnerChuyenKhoaTab === 'thuongQuy') {
        renderThuongQuyTable(data.thuongQuy || { customerGroups: [], items: [] }, headerTier1, headerTier2, tbody);
    } else {
        renderTieuHoaTable(data.tieuHoa || { facilities: [], items: [] }, headerTier1, headerTier2, tbody);
    }
}

// 1. RENDER TAB I: THƯỜNG QUY
function renderThuongQuyTable(thuongQuyData, headerTier1, headerTier2, tbody) {
    const groups = thuongQuyData.customerGroups || [];
    const items = thuongQuyData.items || [];

    let h1Html = `
        <th rowspan="2" class="ck-sticky-corner-1-t1 p-2.5 text-center">STT</th>
        <th rowspan="2" class="ck-sticky-corner-2-t1 p-2.5">DANH MỤC KHÁM</th>
    `;
    groups.forEach(g => {
        const addBtn = isChuyenKhoaEditMode ? `
            <button type="button" onclick="showAddThuongQuyGroupModal()" title="Thêm nhóm đối tượng mới (+)" class="px-1 py-0.5 bg-[#0F6CBD] hover:bg-[#1E7FE5] text-white rounded text-[9px] font-bold ml-1 cursor-pointer">
                <i class="fa-solid fa-plus"></i>
            </button>
        ` : '';
        const deleteBtn = (isChuyenKhoaEditMode && groups.length > 1) ? `
            <button type="button" onclick="promptDeleteThuongQuyGroup('${g.id}', '${g.name}')" title="Xóa nhóm đối tượng này (-)" class="text-rose-300 hover:text-white ml-1 cursor-pointer">
                <i class="fa-solid fa-minus text-[10px]"></i>
            </button>
        ` : '';

        h1Html += `
            <th colspan="3" class="ck-sticky-header-t1 p-2 text-center border-b border-[#1E293B]">
                <div class="flex items-center justify-center gap-1">
                    <span>${g.name}</span>
                    ${addBtn}
                    ${deleteBtn}
                </div>
            </th>
        `;
    });
    h1Html += `
        <th rowspan="2" class="ck-sticky-header-t1 p-2 text-center min-w-[240px]">
            <div>GHI CHÚ</div>
            <div class="text-[9px] font-normal normal-case text-slate-300">Vị trí nhân sự DD/KTV phụ</div>
        </th>
        ${isChuyenKhoaEditMode ? `<th rowspan="2" class="ck-sticky-header-t1 p-2 text-center min-w-[100px]">THAO TÁC</th>` : ''}
    `;
    headerTier1.innerHTML = h1Html;

    let h2Html = '';
    groups.forEach(g => {
        h2Html += `
            <th class="ck-sticky-header-t2 p-2 text-center text-[10px] min-w-[130px]">Số chỉ định buổi sáng</th>
            <th class="ck-sticky-header-t2 p-2 text-center text-[10px] min-w-[130px]">Số chỉ định buổi chiều</th>
            <th class="ck-sticky-header-t2 p-2 text-center text-[10px] min-w-[130px]">Số chỉ định cả ngày</th>
        `;
    });
    headerTier2.innerHTML = h2Html;

    if (items.length === 0) {
        tbody.innerHTML = `<tr><td colspan="${2 + (groups.length * 3) + 1 + (isChuyenKhoaEditMode ? 1 : 0)}" class="p-6 text-center text-slate-400 italic">Chưa có dữ liệu. Click [Cập nhật] -> [Thêm dòng] để bổ sung.</td></tr>`;
        return;
    }

    tbody.innerHTML = items.map((item, idx) => {
        const displayStt = isChuyenKhoaEditMode ? (item.editSttDisplay !== undefined ? item.editSttDisplay : '') : (idx + 1);
        const vals = item.values || {};

        let rowCells = `
            <td class="ck-sticky-col-1 p-2.5 text-center font-bold text-slate-700 text-xs border border-[#D9DEE7] bg-[#F8FAFC]">
                ${displayStt}
            </td>
            <td class="ck-sticky-col-2 p-2 font-bold text-xs text-[#1F2937] border border-[#D9DEE7] bg-[#F8FAFC]">
                ${isChuyenKhoaEditMode ? `
                    <input type="text" data-cktype="category" data-ckid="${item.id}" value="${item.category}" placeholder="Nhập danh mục..." class="w-full text-xs font-bold border border-[#D1D5DB] bg-white rounded-[6px] h-[32px] px-2 focus:outline-none focus:border-[#0F6CBD]">
                ` : `<span>${item.category}</span>`}
            </td>
        `;

        groups.forEach(g => {
            ['sang', 'chieu', 'ca_ngay'].forEach(shift => {
                const key = `${g.id}_${shift}`;
                const val = vals[key] !== undefined ? vals[key] : '';
                if (isChuyenKhoaEditMode) {
                    rowCells += `
                        <td class="p-1 border border-[#E5E7EB] bg-white text-center">
                            <input type="text" data-cktype="value" data-ckid="${item.id}" data-ckkey="${key}" value="${val}" placeholder="" class="w-full text-center text-xs font-bold border border-[#D1D5DB] bg-white rounded-[6px] h-[32px] px-1 focus:outline-none focus:border-[#0F6CBD]">
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
        });

        // Note Column
        if (isChuyenKhoaEditMode) {
            rowCells += `
                <td class="p-1.5 border border-[#E5E7EB] bg-white min-w-[240px]">
                    <textarea data-cktype="note" data-ckid="${item.id}" rows="2" placeholder="Nhập vị trí phụ..." class="w-full text-xs font-medium border border-[#D1D5DB] bg-white rounded-[6px] p-1.5 focus:outline-none focus:border-[#0F6CBD] resize-y">${item.note || ''}</textarea>
                </td>
            `;
        } else {
            rowCells += `
                <td class="p-2 border border-[#E5E7EB] bg-white font-medium text-slate-700 text-xs min-w-[240px] whitespace-pre-line">
                    ${item.note || '-'}
                </td>
            `;
        }

        // Actions Column in Edit Mode
        if (isChuyenKhoaEditMode) {
            const isFirst = idx === 0;
            const isLast = idx === items.length - 1;

            rowCells += `
                <td class="p-1 border border-[#E5E7EB] bg-white text-center min-w-[100px]">
                    <div class="flex items-center justify-center gap-1">
                        <button type="button" onclick="moveChuyenKhoaRowUp('${item.id}')" ${isFirst ? 'disabled class="text-slate-300 p-1 cursor-not-allowed"' : 'class="text-[#0F6CBD] hover:text-[#1E7FE5] p-1 cursor-pointer"'} title="Di chuyển lên"><i class="fa-solid fa-arrow-up text-xs"></i></button>
                        <button type="button" onclick="moveChuyenKhoaRowDown('${item.id}')" ${isLast ? 'disabled class="text-slate-300 p-1 cursor-not-allowed"' : 'class="text-[#0F6CBD] hover:text-[#1E7FE5] p-1 cursor-pointer"'} title="Di chuyển xuống"><i class="fa-solid fa-arrow-down text-xs"></i></button>
                        <button type="button" onclick="promptDeleteChuyenKhoaRow('${item.id}')" class="text-rose-500 hover:text-rose-700 p-1 cursor-pointer" title="Xóa dòng"><i class="fa-solid fa-trash-can text-xs"></i></button>
                    </div>
                </td>
            `;
        }

        return `<tr class="hover:bg-[#F7F9FC] transition-colors">${rowCells}</tr>`;
    }).join('');
}

// 2. RENDER TAB II: TIÊU HÓA
function renderTieuHoaTable(tieuHoaData, headerTier1, headerTier2, tbody) {
    const facilities = tieuHoaData.facilities || [];
    const items = tieuHoaData.items || [];

    let h1Html = `
        <th rowspan="2" class="ck-sticky-corner-1-t1 p-2.5 text-center">STT</th>
        <th rowspan="2" class="ck-sticky-corner-2-t1 p-2.5">DỊCH VỤ</th>
    `;
    facilities.forEach(f => {
        const addBtn = isChuyenKhoaEditMode ? `
            <button type="button" onclick="showAddTieuHoaFacilityModal()" title="Thêm cơ sở khám mới (+)" class="px-1 py-0.5 bg-[#0F6CBD] hover:bg-[#1E7FE5] text-white rounded text-[9px] font-bold ml-1 cursor-pointer">
                <i class="fa-solid fa-plus"></i>
            </button>
        ` : '';
        const deleteBtn = (isChuyenKhoaEditMode && facilities.length > 1) ? `
            <button type="button" onclick="promptDeleteTieuHoaFacility('${f.id}', '${f.name}')" title="Xóa cơ sở khám này (-)" class="text-rose-300 hover:text-white ml-1 cursor-pointer">
                <i class="fa-solid fa-minus text-[10px]"></i>
            </button>
        ` : '';

        h1Html += `
            <th colspan="4" class="ck-sticky-header-t1 p-2 text-center border-b border-[#1E293B]">
                <div class="flex items-center justify-center gap-1">
                    <span>${f.name}</span>
                    ${addBtn}
                    ${deleteBtn}
                </div>
            </th>
        `;
    });
    if (isChuyenKhoaEditMode) {
        h1Html += `<th rowspan="2" class="ck-sticky-header-t1 p-2 text-center min-w-[100px]">THAO TÁC</th>`;
    }
    headerTier1.innerHTML = h1Html;

    let h2Html = '';
    facilities.forEach(f => {
        h2Html += `
            <th class="ck-sticky-header-t2 p-2 text-center text-[10px] min-w-[110px]">Công suất/ngày</th>
            <th class="ck-sticky-header-t2 p-2 text-center text-[10px] min-w-[120px]">Thực hiện TB/ngày</th>
            <th class="ck-sticky-header-t2 p-2 text-center text-[10px] min-w-[100px]">Dự kiến dư</th>
            <th class="ck-sticky-header-t2 p-2 text-center text-[10px] min-w-[180px]">Ghi chú</th>
        `;
    });
    headerTier2.innerHTML = h2Html;

    if (items.length === 0) {
        tbody.innerHTML = `<tr><td colspan="${2 + (facilities.length * 4) + (isChuyenKhoaEditMode ? 1 : 0)}" class="p-6 text-center text-slate-400 italic">Chưa có dữ liệu. Click [Cập nhật] -> [Thêm dòng] để bổ sung.</td></tr>`;
        return;
    }

    tbody.innerHTML = items.map((item, idx) => {
        const displayStt = isChuyenKhoaEditMode ? (item.editSttDisplay !== undefined ? item.editSttDisplay : '') : (idx + 1);
        const vals = item.values || {};

        let rowCells = `
            <td class="ck-sticky-col-1 p-2.5 text-center font-bold text-slate-700 text-xs border border-[#D9DEE7] bg-[#F8FAFC]">
                ${displayStt}
            </td>
            <td class="ck-sticky-col-2 p-2 font-bold text-xs text-[#1F2937] border border-[#D9DEE7] bg-[#F8FAFC]">
                ${isChuyenKhoaEditMode ? `
                    <input type="text" data-cktype="service" data-ckid="${item.id}" value="${item.service}" placeholder="Nhập dịch vụ..." class="w-full text-xs font-bold border border-[#D1D5DB] bg-white rounded-[6px] h-[32px] px-2 focus:outline-none focus:border-[#0F6CBD]">
                ` : `<span>${item.service}</span>`}
            </td>
        `;

        facilities.forEach(f => {
            ['cong_suat', 'thuc_hien', 'du_kien_du', 'ghi_chu'].forEach(field => {
                const key = `${f.id}_${field}`;
                const val = vals[key] !== undefined ? vals[key] : '';

                if (isChuyenKhoaEditMode) {
                    if (field === 'ghi_chu') {
                        rowCells += `
                            <td class="p-1 border border-[#E5E7EB] bg-white min-w-[180px]">
                                <input type="text" data-cktype="value" data-ckid="${item.id}" data-ckkey="${key}" value="${val}" placeholder="Ghi chú..." class="w-full text-xs font-medium border border-[#D1D5DB] bg-white rounded-[6px] h-[32px] px-1.5 focus:outline-none focus:border-[#0F6CBD]">
                            </td>
                        `;
                    } else {
                        rowCells += `
                            <td class="p-1 border border-[#E5E7EB] bg-white text-center">
                                <input type="text" data-cktype="value" data-ckid="${item.id}" data-ckkey="${key}" value="${val}" placeholder="" class="w-full text-center text-xs font-bold border border-[#D1D5DB] bg-white rounded-[6px] h-[32px] px-1 focus:outline-none focus:border-[#0F6CBD]">
                            </td>
                        `;
                    }
                } else {
                    if (field === 'ghi_chu') {
                        rowCells += `
                            <td class="p-2 border border-[#E5E7EB] bg-white text-left font-medium text-slate-700 text-xs min-w-[180px]">
                                ${val || '-'}
                            </td>
                        `;
                    } else {
                        rowCells += `
                            <td class="p-2 border border-[#E5E7EB] bg-white text-center font-bold text-[#1F2937] text-xs">
                                ${val !== '' ? val : '-'}
                            </td>
                        `;
                    }
                }
            });
        });

        // Actions Column in Edit Mode
        if (isChuyenKhoaEditMode) {
            const isFirst = idx === 0;
            const isLast = idx === items.length - 1;

            rowCells += `
                <td class="p-1 border border-[#E5E7EB] bg-white text-center min-w-[100px]">
                    <div class="flex items-center justify-center gap-1">
                        <button type="button" onclick="moveChuyenKhoaRowUp('${item.id}')" ${isFirst ? 'disabled class="text-slate-300 p-1 cursor-not-allowed"' : 'class="text-[#0F6CBD] hover:text-[#1E7FE5] p-1 cursor-pointer"'} title="Di chuyển lên"><i class="fa-solid fa-arrow-up text-xs"></i></button>
                        <button type="button" onclick="moveChuyenKhoaRowDown('${item.id}')" ${isLast ? 'disabled class="text-slate-300 p-1 cursor-not-allowed"' : 'class="text-[#0F6CBD] hover:text-[#1E7FE5] p-1 cursor-pointer"'} title="Di chuyển xuống"><i class="fa-solid fa-arrow-down text-xs"></i></button>
                        <button type="button" onclick="promptDeleteChuyenKhoaRow('${item.id}')" class="text-rose-500 hover:text-rose-700 p-1 cursor-pointer" title="Xóa dòng"><i class="fa-solid fa-trash-can text-xs"></i></button>
                    </div>
                </td>
            `;
        }

        return `<tr class="hover:bg-[#F7F9FC] transition-colors">${rowCells}</tr>`;
    }).join('');
}

// MODAL CONTROLS
function showCkModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('hidden');
}

function hideCkModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('hidden');
}

// DYNAMIC COLUMN GROUP ACTIONS (+ / -)

function showAddThuongQuyGroupModal() {
    const input = document.getElementById('ck-new-group-name');
    if (input) input.value = '';
    showCkModal('add-group-modal-thuongquy');
}

function confirmAddThuongQuyGroup() {
    if (!workingCkData || !workingCkData.thuongQuy) return;

    const input = document.getElementById('ck-new-group-name');
    if (!input || !input.value.trim()) {
        alert('Vui lòng nhập tên nhóm đối tượng mới!');
        return;
    }

    const name = input.value.trim();
    const exists = workingCkData.thuongQuy.customerGroups.some(g => g.name.toLowerCase() === name.toLowerCase());
    if (exists) {
        alert('Tên nhóm đối tượng đã tồn tại. Vui lòng nhập tên khác!');
        return;
    }

    const newId = `g_${Date.now()}`;
    workingCkData.thuongQuy.customerGroups.push({ id: newId, name: name });

    hideCkModal('add-group-modal-thuongquy');
    renderChuyenKhoaView(document.getElementById('tab-content-container'));
}

function promptDeleteThuongQuyGroup(groupId, groupName) {
    ckDeleteTarget = { type: 'group', id: groupId, name: groupName };
    const msg = document.getElementById('ck-delete-modal-msg');
    if (msg) msg.textContent = `Bạn có chắc chắn muốn xóa nhóm đối tượng "${groupName}" và toàn bộ dữ liệu chỉ định của nhóm này không?`;
    showCkModal('delete-confirm-modal-ck');
}

function showAddTieuHoaFacilityModal() {
    const input = document.getElementById('ck-new-facility-name');
    if (input) input.value = '';
    showCkModal('add-facility-modal-tieuhoa');
}

function confirmAddTieuHoaFacility() {
    if (!workingCkData || !workingCkData.tieuHoa) return;

    const input = document.getElementById('ck-new-facility-name');
    if (!input || !input.value.trim()) {
        alert('Vui lòng nhập tên cơ sở khám mới!');
        return;
    }

    const name = input.value.trim();
    const exists = workingCkData.tieuHoa.facilities.some(f => f.name.toLowerCase() === name.toLowerCase());
    if (exists) {
        alert('Tên cơ sở khám đã tồn tại. Vui lòng nhập tên khác!');
        return;
    }

    const newId = `f_${Date.now()}`;
    workingCkData.tieuHoa.facilities.push({ id: newId, name: name });

    hideCkModal('add-facility-modal-tieuhoa');
    renderChuyenKhoaView(document.getElementById('tab-content-container'));
}

function promptDeleteTieuHoaFacility(facilityId, facilityName) {
    ckDeleteTarget = { type: 'facility', id: facilityId, name: facilityName };
    const msg = document.getElementById('ck-delete-modal-msg');
    if (msg) msg.textContent = `Bạn có chắc chắn muốn xóa nhóm cột cơ sở "${facilityName}" và toàn bộ dữ liệu của cơ sở này không?`;
    showCkModal('delete-confirm-modal-ck');
}

// DYNAMIC ROW ACTIONS (EDIT MODE)

function addNewChuyenKhoaRow() {
    if (!workingCkData) return;

    if (currentInnerChuyenKhoaTab === 'thuongQuy') {
        const newId = `tq_${Date.now()}`;
        workingCkData.thuongQuy.items.push({
            id: newId,
            category: '',
            values: {},
            note: '',
            editSttDisplay: '',
            isNewUnsaved: true
        });
    } else {
        const newId = `th_${Date.now()}`;
        workingCkData.tieuHoa.items.push({
            id: newId,
            service: '',
            values: {},
            editSttDisplay: '',
            isNewUnsaved: true
        });
    }

    renderChuyenKhoaView(document.getElementById('tab-content-container'));
}

function moveChuyenKhoaRowUp(id) {
    if (!workingCkData) return;
    const items = (currentInnerChuyenKhoaTab === 'thuongQuy') ? workingCkData.thuongQuy.items : workingCkData.tieuHoa.items;
    const idx = items.findIndex(i => i.id === id);
    if (idx > 0) {
        const temp = items[idx];
        items[idx] = items[idx - 1];
        items[idx - 1] = temp;
        renderChuyenKhoaView(document.getElementById('tab-content-container'));
    }
}

function moveChuyenKhoaRowDown(id) {
    if (!workingCkData) return;
    const items = (currentInnerChuyenKhoaTab === 'thuongQuy') ? workingCkData.thuongQuy.items : workingCkData.tieuHoa.items;
    const idx = items.findIndex(i => i.id === id);
    if (idx !== -1 && idx < items.length - 1) {
        const temp = items[idx];
        items[idx] = items[idx + 1];
        items[idx + 1] = temp;
        renderChuyenKhoaView(document.getElementById('tab-content-container'));
    }
}

function promptDeleteChuyenKhoaRow(id) {
    ckDeleteTarget = { type: 'row', id: id };
    const msg = document.getElementById('ck-delete-modal-msg');
    if (msg) msg.textContent = `Bạn có chắc chắn muốn xóa dòng này khỏi hệ thống không?`;
    showCkModal('delete-confirm-modal-ck');
}

function confirmDeleteChuyenKhoaTarget() {
    if (!ckDeleteTarget || !workingCkData) return;

    if (ckDeleteTarget.type === 'row') {
        if (currentInnerChuyenKhoaTab === 'thuongQuy') {
            workingCkData.thuongQuy.items = workingCkData.thuongQuy.items.filter(i => i.id !== ckDeleteTarget.id);
        } else {
            workingCkData.tieuHoa.items = workingCkData.tieuHoa.items.filter(i => i.id !== ckDeleteTarget.id);
        }
    } else if (ckDeleteTarget.type === 'group') {
        workingCkData.thuongQuy.customerGroups = workingCkData.thuongQuy.customerGroups.filter(g => g.id !== ckDeleteTarget.id);
    } else if (ckDeleteTarget.type === 'facility') {
        workingCkData.tieuHoa.facilities = workingCkData.tieuHoa.facilities.filter(f => f.id !== ckDeleteTarget.id);
    }

    ckDeleteTarget = null;
    hideCkModal('delete-confirm-modal-ck');
    renderChuyenKhoaView(document.getElementById('tab-content-container'));
}

function saveChuyenKhoaChanges() {
    if (!workingCkData) return;

    // Sync input values from DOM before saving
    const tbody = document.getElementById('ck-matrix-body-container');
    if (tbody) {
        // Read main categories/services
        const nameInputs = tbody.querySelectorAll('input[data-cktype="category"], input[data-cktype="service"]');
        nameInputs.forEach(input => {
            const id = input.getAttribute('data-ckid');
            const type = input.getAttribute('data-cktype');
            const itemTQ = workingCkData.thuongQuy.items.find(i => i.id === id);
            const itemTH = workingCkData.tieuHoa.items.find(i => i.id === id);

            if (type === 'category' && itemTQ) itemTQ.category = input.value.trim();
            if (type === 'service' && itemTH) itemTH.service = input.value.trim();
        });

        // Read notes for thuongQuy
        const noteInputs = tbody.querySelectorAll('textarea[data-cktype="note"]');
        noteInputs.forEach(input => {
            const id = input.getAttribute('data-ckid');
            const item = workingCkData.thuongQuy.items.find(i => i.id === id);
            if (item) item.note = input.value.trim();
        });

        // Read grid cell values
        const valInputs = tbody.querySelectorAll('input[data-cktype="value"]');
        valInputs.forEach(input => {
            const id = input.getAttribute('data-ckid');
            const key = input.getAttribute('data-ckkey');
            const val = input.value.trim();

            const itemTQ = workingCkData.thuongQuy.items.find(i => i.id === id);
            const itemTH = workingCkData.tieuHoa.items.find(i => i.id === id);

            if (itemTQ) {
                if (!itemTQ.values) itemTQ.values = {};
                itemTQ.values[key] = val;
            }
            if (itemTH) {
                if (!itemTH.values) itemTH.values = {};
                itemTH.values[key] = val;
            }
        });
    }

    // Clean up temporary edit attributes
    if (workingCkData.thuongQuy && workingCkData.thuongQuy.items) {
        workingCkData.thuongQuy.items.forEach(item => {
            delete item.editSttDisplay;
            delete item.isNewUnsaved;
        });
    }
    if (workingCkData.tieuHoa && workingCkData.tieuHoa.items) {
        workingCkData.tieuHoa.items.forEach(item => {
            delete item.editSttDisplay;
            delete item.isNewUnsaved;
        });
    }

    MWKDataStore.saveChuyenKhoaMatrixData(workingCkData);

    isChuyenKhoaEditMode = false;
    toggleChuyenKhoaEditMode(false);

    if (window.showToast) {
        window.showToast('Cập nhật dữ liệu thành công.', 'success');
    }
}
