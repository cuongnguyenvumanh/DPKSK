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

            const tenDonViElem = document.getElementById('tenDonVi');
            if (tenDonViElem && !tenDonViElem.value) {
                tenDonViElem.value = customerName;
            }

            const guestCountElem = document.getElementById('guestCount');
            if (guestCountElem && !guestCountElem.value) {
                guestCountElem.value = estimatedCount;
            }
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
            this.categories = existingData.danhMucThucHien || [
                { stt: 1, name: 'Khám Nội tổng quát', quantity: 180, note: 'Khám lâm sàng sinh hiệu' },
                { stt: 2, name: 'Lấy máu xét nghiệm', quantity: 180, note: 'Nhịn ăn sáng' },
                { stt: 3, name: 'Siêu âm ổ bụng tổng quát', quantity: 180, note: 'Nhịn ăn sáng' }
            ];

            this.staff = existingData.duKienNhanLuc || [
                { stt: 1, role: 'Bác sĩ khám chính', count: 2, shift: 'Cả ngày', note: 'Khoa Nội' },
                { stt: 2, role: 'Điều dưỡng lấy mẫu', count: 3, shift: 'Sáng', note: 'Kíp xét nghiệm' },
                { stt: 3, role: 'KTV Siêu âm', count: 2, shift: 'Cả ngày', note: 'Phòng CĐHA' }
            ];

            this.equipment = existingData.duKienTrangThietBi || [
                { stt: 1, name: 'Máy siêu âm màu 4D', quantity: 2, note: 'Kiểm tra trước ca' },
                { stt: 2, name: 'Bộ dụng cụ lấy mẫu xét nghiệm', quantity: 180, note: 'Vật tư đóng gói sẵn' }
            ];

            this.locations = existingData.diaDiemToChuc || [
                { stt: 1, tenDiem: existingData.facility || 'Địa điểm chính', diaChi: 'Số 10 Phạm Văn Bạch, Cầu Giấy, Hà Nội', gioCoMat: '07:00', gioKetThuc: '17:00', ghiChu: 'Trụ sở công ty' }
            ];

            // Fill form fields
            if (window.SubScheduleHelper) {
                window.SubScheduleHelper.populateFormFromSubSchedule(existingData);
            }

            // Initialize WorkTypeTagInput component
            if (window.WorkTypeTagInput) {
                const initialWorkTypes = (existingData && Array.isArray(existingData.loaiHinhCongViec) && existingData.loaiHinhCongViec.length > 0)
                    ? existingData.loaiHinhCongViec
                    : (this.typeCode === 'LICH_PHUONG' ? ['Khám sức khỏe phường', 'Lấy mẫu xét nghiệm'] : ['Khám sức khỏe', 'Lấy mẫu xét nghiệm']);
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
                        <button type="button" onclick="SubScheduleController.deleteCategoryRow(${index})" class="text-[#D32F2F] hover:text-[#9A0007] p-1">
                            <i class="fa-solid fa-trash-can text-xs"></i>
                        </button>
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
                        <button type="button" onclick="SubScheduleController.deleteStaffRow(${index})" class="text-[#D32F2F] hover:text-[#9A0007] p-1">
                            <i class="fa-solid fa-trash-can text-xs"></i>
                        </button>
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
                        <button type="button" onclick="SubScheduleController.deleteEquipmentRow(${index})" class="text-[#D32F2F] hover:text-[#9A0007] p-1">
                            <i class="fa-solid fa-trash-can text-xs"></i>
                        </button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        },

        addEquipmentRow: function() {
            this.equipment.push({ stt: this.equipment.length + 1, name: 'Bộ dụng cụ chuyên khoa bổ sung', quantity: 1, note: '' });
            this.renderEquipmentTable();
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
                        <button type="button" onclick="SubScheduleController.deleteLocationRow(${index})" class="text-[#D32F2F] hover:text-[#9A0007] p-1">
                            <i class="fa-solid fa-trash-can text-xs"></i>
                        </button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        },

        addLocationRow: function() {
            this.locations.push({ stt: this.locations.length + 1, tenDiem: 'Điểm khám phụ / Đợt 2', diaChi: '', gioCoMat: '07:30', gioKetThuc: '17:00', ghiChu: '' });
            this.renderLocationTable();
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
