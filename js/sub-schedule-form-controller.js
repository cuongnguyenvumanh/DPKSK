/**
 * MWK - SUB-SCHEDULE FORM CONTROLLER
 * Dynamic Controller for Lịch tại viện, Lịch ngoại viện, and Lịch phường (Create & Edit & Detail).
 */

(function(window) {
    const SubScheduleController = {
        typeCode: 'NGOAI_VIEN',
        mode: 'create', // 'create' | 'edit'
        editId: null,
        subIndex: null,

        categories: [],
        staff: [],
        equipment: [],
        locations: [],

        init: function(typeCode = 'NGOAI_VIEN', mode = 'create') {
            this.typeCode = typeCode;
            this.mode = mode;

            const params = new URLSearchParams(window.location.search);
            this.editId = params.get('editId') || params.get('id');
            this.subId = params.get('subId');
            this.subIndex = params.get('subIndex');
            this.currentSubId = null;

            this.initHeaderInfo();
            this.setupInitialData();
            this.renderAllTables();
            this.setupEvents();
            this.updateSummaryBar();
        },

        initHeaderInfo: function() {
            const params = new URLSearchParams(window.location.search);
            const customerName = params.get('customerName') || 'CÔNG TY CP TẬP ĐOÀN FPT';
            const customerCode = params.get('customerCode') || 'KAD019962025';
            const estimatedCount = params.get('estimatedCount') || '180';

            const nameElem = document.getElementById('header-display-customer');
            const codeElem = document.getElementById('header-display-code');
            const guestsElem = document.getElementById('header-display-guests');

            if (nameElem) nameElem.innerText = customerName;
            if (codeElem) codeElem.innerText = customerCode;
            if (guestsElem) guestsElem.innerText = estimatedCount;
        },

        setupInitialData: function() {
            const params = new URLSearchParams(window.location.search);
            const subId = params.get('subId');
            const subIndex = params.get('subIndex');

            let existingData = null;

            // 1. Determine key in sessionStorage
            const storageKey = this.editId ? `mwk_edit_schedule_draft_${this.editId}` : 'mwk_create_schedule_draft';
            const draftJson = sessionStorage.getItem(storageKey) || sessionStorage.getItem('mwk_create_schedule_draft');

            if (draftJson) {
                try {
                    const draft = JSON.parse(draftJson);
                    const typeKey = this.getTypeKey();
                    if (draft.step2Data && draft.step2Data[typeKey] && Array.isArray(draft.step2Data[typeKey])) {
                        const list = draft.step2Data[typeKey];
                        if (subId) {
                            existingData = list.find(s => String(s.id) === String(subId) || String(s.scheduleId) === String(subId));
                            if (existingData && (subIndex === null || subIndex === undefined)) {
                                this.subIndex = list.findIndex(s => String(s.id) === String(subId) || String(s.scheduleId) === String(subId));
                            }
                        }
                        if (!existingData && subIndex !== null && subIndex !== undefined && list[subIndex]) {
                            existingData = list[subIndex];
                        }
                        if (!existingData && this.mode === 'edit' && list.length > 0) {
                            existingData = list[list.length - 1];
                        }
                    }
                } catch (e) {
                    console.error('Lỗi khi đọc dữ liệu lịch con từ draft:', e);
                }
            }

            // 2. Fallback to MWKDataStore if editId is present
            if (!existingData && this.editId && window.MWKDataStore) {
                const master = window.MWKDataStore.getKskScheduleById ? window.MWKDataStore.getKskScheduleById(this.editId) : null;
                if (master && master.step2Data && master.step2Data[this.getTypeKey()]) {
                    const list = master.step2Data[this.getTypeKey()];
                    if (subId) {
                        existingData = list.find(s => String(s.id) === String(subId) || String(s.scheduleId) === String(subId));
                    }
                    if (!existingData && subIndex !== null && subIndex !== undefined && list[subIndex]) {
                        existingData = list[subIndex];
                    }
                    if (!existingData && list.length > 0) {
                        existingData = list[0];
                    }
                }
            }

            if (existingData) {
                this.currentSubId = existingData.id || existingData.scheduleId;
            } else {
                existingData = window.ScheduleFormConfig ? window.ScheduleFormConfig.createEmptySubScheduleObject(this.typeCode) : {};
            }

            if (!existingData.trangThai) {
                existingData.trangThai = 'TAO_MOI';
            }
            existingData.unitId = params.get('customerCode') || params.get('unitId') || this.editId || 'KAD019962025';

            // Set categories, staff, equipment, locations arrays
            this.categories = existingData.danhMucThucHien || [];
            this.staff = existingData.duKienNhanLuc || [];
            this.equipment = existingData.duKienTrangThietBi || [];
            this.locations = existingData.diaDiemToChuc || [];

            // Fill form fields
            if (window.SubScheduleHelper) {
                window.SubScheduleHelper.populateFormFromSubSchedule(existingData);
            }

            // Initialize WorkTypeTagInput component
            if (window.WorkTypeTagInput) {
                const initialWorkTypes = (existingData && Array.isArray(existingData.loaiHinhCongViec))
                    ? existingData.loaiHinhCongViec
                    : [];
                window.WorkTypeTagInput.init(initialWorkTypes, this.typeCode);
            }
        },

        getTypeKey: function() {
            if (this.typeCode === 'TAI_VIEN') return 'taiVien';
            if (this.typeCode === 'LICH_PHUONG') return 'lichPhuong';
            return 'ngoaiVien';
        },

        renderAllTables: function() {
            this.renderCategoryTable();
            this.renderStaffTable();
            this.renderEquipmentTable();
            this.renderLocationTable();
        },

        // Confirmation Modal Helper
        showConfirmModal: function(message, onConfirm) {
            let modal = document.getElementById('sub-schedule-confirm-modal');
            if (!modal) {
                modal = document.createElement('div');
                modal.id = 'sub-schedule-confirm-modal';
                modal.className = 'fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 hidden';
                modal.innerHTML = `
                    <div class="bg-white rounded-[8px] shadow-2xl border border-[#D9DEE5] max-w-sm w-full p-5 space-y-4 animate-in fade-in zoom-in-95 duration-150">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 rounded-full bg-[#FEE2E2] text-[#D32F2F] flex items-center justify-center text-base shrink-0 font-bold">
                                <i class="fa-solid fa-triangle-exclamation"></i>
                            </div>
                            <div>
                                <h3 class="text-sm font-bold text-[#1F2937]">Xác nhận xóa dữ liệu</h3>
                                <p id="sub-schedule-confirm-msg" class="text-xs text-[#6B7280] mt-0.5 leading-relaxed">Bạn có chắc chắn muốn xóa dữ liệu này không?</p>
                            </div>
                        </div>
                        <div class="flex items-center justify-end gap-2 pt-2 border-t border-[#E6EAF0]">
                            <button type="button" id="sub-schedule-confirm-cancel" class="px-3.5 py-1.5 rounded-[4px] border border-[#D9DEE5] bg-white text-[#4B5563] hover:bg-[#F4F5F7] text-xs font-semibold">Hủy</button>
                            <button type="button" id="sub-schedule-confirm-ok" class="px-3.5 py-1.5 rounded-[4px] bg-[#D32F2F] hover:bg-[#9A0007] text-white text-xs font-semibold border-none shadow-xs">Xóa</button>
                        </div>
                    </div>
                `;
                document.body.appendChild(modal);
            }

            const msgElem = document.getElementById('sub-schedule-confirm-msg');
            const cancelBtn = document.getElementById('sub-schedule-confirm-cancel');
            const okBtn = document.getElementById('sub-schedule-confirm-ok');

            if (msgElem) msgElem.innerText = message || 'Bạn có chắc chắn muốn xóa dữ liệu này không?';

            const closeModal = () => modal.classList.add('hidden');
            cancelBtn.onclick = closeModal;
            okBtn.onclick = () => {
                closeModal();
                if (typeof onConfirm === 'function') onConfirm();
            };

            modal.classList.remove('hidden');
        },

        // 1. Category Table
        renderCategoryTable: function() {
            const tbody = document.getElementById('table-category-body');
            if (!tbody) return;

            tbody.innerHTML = '';
            this.categories.forEach((item, index) => {
                const tr = document.createElement('tr');
                tr.className = 'hover:bg-[#F8FAFC]';
                tr.innerHTML = `
                    <td class="py-2 px-3 text-center font-bold text-[#6B7280]">${index + 1}</td>
                    <td class="py-2 px-3">
                        <input type="text" value="${item.name || ''}" class="cat-input-name sys-input text-xs h-8 font-medium" placeholder="Nhập tên danh mục...">
                    </td>
                    <td class="py-2 px-3">
                        <input type="number" min="0" value="${item.quantity || 0}" class="cat-input-qty sys-input text-xs h-8 text-center font-bold text-[#27496D]" oninput="SubScheduleController.updateSummaryBar()">
                    </td>
                    <td class="py-2 px-3">
                        <input type="text" value="${item.note || ''}" class="cat-input-note sys-input text-xs h-8" placeholder="Ghi chú...">
                    </td>
                    <td class="py-2 px-3 text-center">
                        <div class="flex items-center justify-center gap-1.5">
                            <button type="button" onclick="SubScheduleController.editCategoryRow(${index})" class="w-7 h-7 rounded-[4px] bg-[#E8F1FB] text-[#27496D] hover:bg-[#D4E4F7] flex items-center justify-center transition-colors" title="Chỉnh sửa">
                                <i class="fa-solid fa-pen-to-square text-xs"></i>
                            </button>
                            <button type="button" onclick="SubScheduleController.confirmDeleteCategoryRow(${index})" class="w-7 h-7 rounded-[4px] bg-[#FEE2E2] text-[#D32F2F] hover:bg-[#FCA5A5] flex items-center justify-center transition-colors" title="Xóa">
                                <i class="fa-solid fa-trash-can text-xs"></i>
                            </button>
                        </div>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        },

        addCategoryRow: function() {
            const guestCount = parseInt(document.getElementById('guestCount')?.value) || 180;
            this.categories.push({ stt: this.categories.length + 1, name: 'Khám chuyên khoa mới', quantity: guestCount, note: '' });
            this.renderCategoryTable();
            this.updateSummaryBar();
        },

        editCategoryRow: function(index) {
            const trs = document.querySelectorAll('#table-category-body tr');
            if (trs && trs[index]) {
                const input = trs[index].querySelector('input, select');
                if (input) {
                    input.focus();
                    trs[index].classList.add('bg-[#FEF9C3]', 'transition-colors');
                    setTimeout(() => trs[index].classList.remove('bg-[#FEF9C3]'), 1200);
                }
            }
        },

        confirmDeleteCategoryRow: function(index) {
            this.showConfirmModal('Bạn có chắc chắn muốn xóa danh mục thực hiện này không?', () => this.deleteCategoryRow(index));
        },

        deleteCategoryRow: function(index) {
            this.categories.splice(index, 1);
            this.renderCategoryTable();
            this.updateSummaryBar();
        },

        // 2. Staff Table
        renderStaffTable: function() {
            const tbody = document.getElementById('table-staff-body');
            if (!tbody) return;

            tbody.innerHTML = '';
            this.staff.forEach((item, index) => {
                const tr = document.createElement('tr');
                tr.className = 'hover:bg-[#F8FAFC]';
                tr.innerHTML = `
                    <td class="py-2 px-3 text-center font-bold text-[#6B7280]">${index + 1}</td>
                    <td class="py-2 px-3">
                        <select class="staff-select-role sys-select text-xs h-8 font-medium">
                            <option value="Bác sĩ khám chính" ${item.role === 'Bác sĩ khám chính' ? 'selected' : ''}>Bác sĩ khám chính</option>
                            <option value="Điều dưỡng lấy mẫu" ${item.role === 'Điều dưỡng lấy mẫu' ? 'selected' : ''}>Điều dưỡng lấy mẫu</option>
                            <option value="KTV Siêu âm" ${item.role === 'KTV Siêu âm' ? 'selected' : ''}>KTV Siêu âm</option>
                            <option value="KTV X-quang" ${item.role === 'KTV X-quang' ? 'selected' : ''}>KTV X-quang</option>
                            <option value="Cán bộ Tiếp đón & Hướng dẫn" ${item.role === 'Cán bộ Tiếp đón & Hướng dẫn' ? 'selected' : ''}>Cán bộ Tiếp đón & Hướng dẫn</option>
                            <option value="Hộ lý / Hỗ trợ ca" ${item.role === 'Hộ lý / Hỗ trợ ca' ? 'selected' : ''}>Hộ lý / Hỗ trợ ca</option>
                        </select>
                    </td>
                    <td class="py-2 px-3">
                        <input type="number" min="1" value="${item.count || 1}" class="staff-input-count sys-input text-xs h-8 text-center font-bold text-[#27496D]" oninput="SubScheduleController.updateSummaryBar()">
                    </td>
                    <td class="py-2 px-3">
                        <select class="staff-select-shift sys-select text-xs h-8">
                            <option value="Cả ngày" ${item.shift === 'Cả ngày' ? 'selected' : ''}>Cả ngày</option>
                            <option value="Sáng" ${item.shift === 'Sáng' ? 'selected' : ''}>Ca Sáng</option>
                            <option value="Chiều" ${item.shift === 'Chiều' ? 'selected' : ''}>Ca Chiều</option>
                        </select>
                    </td>
                    <td class="py-2 px-3">
                        <input type="text" value="${item.note || ''}" class="staff-input-note sys-input text-xs h-8" placeholder="Ghi chú...">
                    </td>
                    <td class="py-2 px-3 text-center">
                        <div class="flex items-center justify-center gap-1.5">
                            <button type="button" onclick="SubScheduleController.editStaffRow(${index})" class="w-7 h-7 rounded-[4px] bg-[#E8F1FB] text-[#27496D] hover:bg-[#D4E4F7] flex items-center justify-center transition-colors" title="Chỉnh sửa">
                                <i class="fa-solid fa-pen-to-square text-xs"></i>
                            </button>
                            <button type="button" onclick="SubScheduleController.confirmDeleteStaffRow(${index})" class="w-7 h-7 rounded-[4px] bg-[#FEE2E2] text-[#D32F2F] hover:bg-[#FCA5A5] flex items-center justify-center transition-colors" title="Xóa">
                                <i class="fa-solid fa-trash-can text-xs"></i>
                            </button>
                        </div>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        },

        addStaffRow: function() {
            this.staff.push({ stt: this.staff.length + 1, role: 'Cán bộ Tiếp đón & Hướng dẫn', count: 2, shift: 'Cả ngày', note: '' });
            this.renderStaffTable();
            this.updateSummaryBar();
        },

        editStaffRow: function(index) {
            const trs = document.querySelectorAll('#table-staff-body tr');
            if (trs && trs[index]) {
                const select = trs[index].querySelector('select, input');
                if (select) {
                    select.focus();
                    trs[index].classList.add('bg-[#FEF9C3]', 'transition-colors');
                    setTimeout(() => trs[index].classList.remove('bg-[#FEF9C3]'), 1200);
                }
            }
        },

        confirmDeleteStaffRow: function(index) {
            this.showConfirmModal('Bạn có chắc chắn muốn xóa vị trí nhân lực này không?', () => this.deleteStaffRow(index));
        },

        deleteStaffRow: function(index) {
            this.staff.splice(index, 1);
            this.renderStaffTable();
            this.updateSummaryBar();
        },

        // 3. Equipment Table
        renderEquipmentTable: function() {
            const tbody = document.getElementById('table-equipment-body');
            if (!tbody) return;

            tbody.innerHTML = '';
            this.equipment.forEach((item, index) => {
                const tr = document.createElement('tr');
                tr.className = 'hover:bg-[#F8FAFC]';
                tr.innerHTML = `
                    <td class="py-2 px-3 text-center font-bold text-[#6B7280]">${index + 1}</td>
                    <td class="py-2 px-3">
                        <input type="text" value="${item.name || ''}" class="equip-input-name sys-input text-xs h-8 font-medium" placeholder="Tên máy móc/thiết bị...">
                    </td>
                    <td class="py-2 px-3">
                        <input type="number" min="1" value="${item.quantity || 1}" class="equip-input-qty sys-input text-xs h-8 text-center font-bold text-[#27496D]">
                    </td>
                    <td class="py-2 px-3">
                        <input type="text" value="${item.note || ''}" class="equip-input-note sys-input text-xs h-8" placeholder="Tình trạng / Ghi chú...">
                    </td>
                    <td class="py-2 px-3 text-center">
                        <div class="flex items-center justify-center gap-1.5">
                            <button type="button" onclick="SubScheduleController.editEquipmentRow(${index})" class="w-7 h-7 rounded-[4px] bg-[#E8F1FB] text-[#27496D] hover:bg-[#D4E4F7] flex items-center justify-center transition-colors" title="Chỉnh sửa">
                                <i class="fa-solid fa-pen-to-square text-xs"></i>
                            </button>
                            <button type="button" onclick="SubScheduleController.confirmDeleteEquipmentRow(${index})" class="w-7 h-7 rounded-[4px] bg-[#FEE2E2] text-[#D32F2F] hover:bg-[#FCA5A5] flex items-center justify-center transition-colors" title="Xóa">
                                <i class="fa-solid fa-trash-can text-xs"></i>
                            </button>
                        </div>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        },

        addEquipmentRow: function() {
            this.equipment.push({ stt: this.equipment.length + 1, name: 'Bộ dụng cụ chuyên khoa bổ sung', quantity: 1, note: '' });
            this.renderEquipmentTable();
        },

        editEquipmentRow: function(index) {
            const trs = document.querySelectorAll('#table-equipment-body tr');
            if (trs && trs[index]) {
                const input = trs[index].querySelector('input, select');
                if (input) {
                    input.focus();
                    trs[index].classList.add('bg-[#FEF9C3]', 'transition-colors');
                    setTimeout(() => trs[index].classList.remove('bg-[#FEF9C3]'), 1200);
                }
            }
        },

        confirmDeleteEquipmentRow: function(index) {
            this.showConfirmModal('Bạn có chắc chắn muốn xóa thiết bị/máy móc này không?', () => this.deleteEquipmentRow(index));
        },

        deleteEquipmentRow: function(index) {
            this.equipment.splice(index, 1);
            this.renderEquipmentTable();
        },

        // 4. Locations Table
        renderLocationTable: function() {
            const tbody = document.getElementById('table-locations-body');
            if (!tbody) return;

            tbody.innerHTML = '';
            this.locations.forEach((item, index) => {
                const tr = document.createElement('tr');
                tr.className = 'hover:bg-[#F8FAFC]';
                tr.innerHTML = `
                    <td class="py-2 px-3 text-center font-bold text-[#6B7280]">${index + 1}</td>
                    <td class="py-2 px-3">
                        <input type="text" value="${item.tenDiem || ''}" class="input-loc-ten sys-input text-xs h-8 font-medium" placeholder="Tên điểm tổ chức...">
                    </td>
                    <td class="py-2 px-3">
                        <input type="text" value="${item.diaChi || ''}" class="input-loc-diachi sys-input text-xs h-8" placeholder="Địa chỉ cụ thể...">
                    </td>
                    <td class="py-2 px-3">
                        <input type="time" value="${item.gioCoMat || '07:00'}" class="input-loc-giocomat sys-input text-xs h-8 text-center">
                    </td>
                    <td class="py-2 px-3">
                        <input type="time" value="${item.gioKetThuc || '17:00'}" class="input-loc-gioketthuc sys-input text-xs h-8 text-center">
                    </td>
                    <td class="py-2 px-3 text-center">
                        <div class="flex items-center justify-center gap-1.5">
                            <button type="button" onclick="SubScheduleController.editLocationRow(${index})" class="w-7 h-7 rounded-[4px] bg-[#E8F1FB] text-[#27496D] hover:bg-[#D4E4F7] flex items-center justify-center transition-colors" title="Chỉnh sửa">
                                <i class="fa-solid fa-pen-to-square text-xs"></i>
                            </button>
                            <button type="button" onclick="SubScheduleController.confirmDeleteLocationRow(${index})" class="w-7 h-7 rounded-[4px] bg-[#FEE2E2] text-[#D32F2F] hover:bg-[#FCA5A5] flex items-center justify-center transition-colors" title="Xóa">
                                <i class="fa-solid fa-trash-can text-xs"></i>
                            </button>
                        </div>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        },

        addLocationRow: function() {
            this.locations.push({ stt: this.locations.length + 1, tenDiem: 'Điểm khám phụ / Đợt 2', diaChi: '', gioCoMat: '07:30', gioKetThuc: '17:00', ghiChu: '' });
            this.renderLocationTable();
        },

        editLocationRow: function(index) {
            const trs = document.querySelectorAll('#table-locations-body tr');
            if (trs && trs[index]) {
                const input = trs[index].querySelector('input, select');
                if (input) {
                    input.focus();
                    trs[index].classList.add('bg-[#FEF9C3]', 'transition-colors');
                    setTimeout(() => trs[index].classList.remove('bg-[#FEF9C3]'), 1200);
                }
            }
        },

        confirmDeleteLocationRow: function(index) {
            this.showConfirmModal('Bạn có chắc chắn muốn xóa điểm tổ chức này không?', () => this.deleteLocationRow(index));
        },

        deleteLocationRow: function(index) {
            this.locations.splice(index, 1);
            this.renderLocationTable();
        },

        setupEvents: function() {
            const guestCount = document.getElementById('guestCount');
            if (guestCount) {
                guestCount.addEventListener('input', () => this.updateSummaryBar());
            }
            const examDate = document.getElementById('examDate');
            if (examDate) {
                examDate.addEventListener('change', () => this.updateSummaryBar());
            }
        },

        updateSummaryBar: function() {
            const guestCount = document.getElementById('guestCount')?.value || '180';
            const examDateVal = document.getElementById('examDate')?.value || '';
            let formattedDate = '---';
            if (examDateVal) {
                const parts = examDateVal.split('-');
                if (parts.length === 3) formattedDate = `${parts[2]}/${parts[1]}/${parts[0]}`;
            }

            const catTrs = document.querySelectorAll('#table-category-body tr');
            const staffTrs = document.querySelectorAll('#table-staff-body tr');

            let totalStaffCount = 0;
            staffTrs.forEach(tr => {
                const input = tr.querySelector('.staff-input-count');
                if (input) totalStaffCount += (parseInt(input.value) || 0);
            });

            const barDate = document.getElementById('bar-summary-date');
            const barGuests = document.getElementById('bar-summary-guests');
            const barCategories = document.getElementById('bar-summary-categories');
            const barStaff = document.getElementById('bar-summary-staff');

            if (barDate) barDate.innerText = formattedDate;
            if (barGuests) barGuests.innerText = guestCount;
            if (barCategories) barCategories.innerText = catTrs.length;
            if (barStaff) barStaff.innerText = totalStaffCount || 18;
        },

        saveAndExit: function() {
            if (!window.SubScheduleHelper.validateSubScheduleForm()) return;

            const targetSubId = this.currentSubId || this.subId || null;
            const subScheduleObj = window.SubScheduleHelper.collectSubScheduleFormData(this.typeCode, targetSubId);

            const params = new URLSearchParams(window.location.search);
            subScheduleObj.unitId = params.get('customerCode') || params.get('unitId') || this.editId || 'KAD019962025';
            subScheduleObj.scheduleType = this.typeCode;

            const storageKey = this.editId ? `mwk_edit_schedule_draft_${this.editId}` : 'mwk_create_schedule_draft';

            let draft = {};
            const draftJson = sessionStorage.getItem(storageKey);
            if (draftJson) {
                try { draft = JSON.parse(draftJson); } catch (e) {}
            }

            if (!draft.step2Data) {
                draft.step2Data = { ngoaiVien: [], taiVien: [], lichPhuong: [] };
            }

            const typeKey = this.getTypeKey();
            if (!draft.step2Data[typeKey]) draft.step2Data[typeKey] = [];

            let existingIndex = -1;
            if (subScheduleObj.id) {
                existingIndex = draft.step2Data[typeKey].findIndex(item => String(item.id) === String(subScheduleObj.id) || String(item.scheduleId) === String(subScheduleObj.id));
            }
            if (existingIndex === -1 && this.subIndex !== null && this.subIndex !== undefined && draft.step2Data[typeKey][this.subIndex]) {
                existingIndex = parseInt(this.subIndex);
            }

            if (existingIndex !== -1) {
                const existingItem = draft.step2Data[typeKey][existingIndex];
                subScheduleObj.trangThai = existingItem.trangThai || subScheduleObj.trangThai || 'TAO_MOI';
                if (existingItem.lyDoTra) subScheduleObj.lyDoTra = existingItem.lyDoTra;
                draft.step2Data[typeKey][existingIndex] = subScheduleObj;
            } else {
                subScheduleObj.trangThai = subScheduleObj.trangThai || 'TAO_MOI';
                draft.step2Data[typeKey].push(subScheduleObj);
            }

            draft.currentStep = 2;
            sessionStorage.setItem(storageKey, JSON.stringify(draft));

            if (window.MWKDataStore && window.MWKDataStore.syncDraftToDataStore) {
                window.MWKDataStore.syncDraftToDataStore(storageKey);
            }

            console.log("=== AFTER CREATE SCHEDULE ===");
            console.log("[CREATE SUCCESS]", subScheduleObj);
            console.log("schedule.unitId:", subScheduleObj.unitId);
            if (window.MWKDataStore) {
                console.log("[ALL SCHEDULES]", window.MWKDataStore.getKskSchedules());
                console.log("[UNIT SCHEDULES]", window.MWKDataStore.getSchedulesByUnit(subScheduleObj.unitId));
            }

            if (window.showToast) {
                window.showToast(`Đã lưu thành công ${this.getLabel()}!`, 'success');
            }

            const targetUrl = this.editId ? `../edit/edit.html?id=${this.editId}&step=2` : '../create/create.html?step=2';
            setTimeout(() => {
                window.location.href = targetUrl;
            }, 300);
        },

        getLabel: function() {
            if (this.typeCode === 'TAI_VIEN') return 'Lịch tại viện';
            if (this.typeCode === 'LICH_PHUONG') return 'Lịch phường';
            return 'Lịch ngoại viện';
        }
    };

    window.SubScheduleController = SubScheduleController;
})(window);
