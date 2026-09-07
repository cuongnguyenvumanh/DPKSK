/**
 * MWK - SUB-SCHEDULE FORM HELPER
 * Shared utilities for managing Sub-Schedule Create, Edit, and Detail rendering.
 */

(function(window) {
    const SubScheduleHelper = {

        // Validate required business fields before saving a sub-schedule
        validateSubScheduleForm: function() {
            let isValid = true;

            // 1. Ngày điền lịch *
            const ngayDienLich = document.getElementById('ngayDienLich');
            if (ngayDienLich && !ngayDienLich.value) {
                this.showFieldError('ngayDienLich', 'Vui lòng chọn ngày điền lịch.');
                isValid = false;
            } else {
                this.hideFieldError('ngayDienLich');
            }

            // 2. Phòng Kinh doanh *
            const phongKinhDoanh = document.getElementById('phongKinhDoanh');
            if (phongKinhDoanh && !phongKinhDoanh.value) {
                this.showFieldError('phongKinhDoanh', 'Vui lòng chọn Phòng Kinh doanh.');
                isValid = false;
            } else {
                this.hideFieldError('phongKinhDoanh');
            }

            // 3. Cán bộ kinh doanh phụ trách *
            const cbkd = document.getElementById('canBoKinhDoanhPhuTrach');
            if (cbkd && !cbkd.value) {
                this.showFieldError('canBoKinhDoanhPhuTrach', 'Vui lòng chọn CBKD phụ trách.');
                isValid = false;
            } else {
                this.hideFieldError('canBoKinhDoanhPhuTrach');
            }

            // 4. Tình trạng hợp đồng / PAKD *
            const pakd = document.getElementById('tinhTrangHopDongPAKD');
            if (pakd && !pakd.value) {
                this.showFieldError('tinhTrangHopDongPAKD', 'Vui lòng chọn tình trạng hợp đồng/PAKD.');
                isValid = false;
            } else {
                this.hideFieldError('tinhTrangHopDongPAKD');
            }

            // 5. Ngày triển khai / Ngày khám *
            const examDate = document.getElementById('examDate');
            if (examDate && !examDate.value) {
                this.showFieldError('examDate', 'Vui lòng chọn ngày triển khai khám.');
                isValid = false;
            } else {
                this.hideFieldError('examDate');
            }

            // 6. Ca làm việc *
            const sangChecked = document.getElementById('check-shift-sang')?.checked;
            const chieuChecked = document.getElementById('check-shift-chieu')?.checked;
            if (!sangChecked && !chieuChecked) {
                this.showFieldError('shift', 'Vui lòng chọn ít nhất 1 ca làm việc.');
                isValid = false;
            } else {
                this.hideFieldError('shift');
            }

            // 7. Tên đơn vị KSK *
            const tenDonVi = document.getElementById('tenDonVi');
            if (tenDonVi && !tenDonVi.value.trim()) {
                this.showFieldError('tenDonVi', 'Vui lòng nhập tên đơn vị KSK.');
                isValid = false;
            } else {
                this.hideFieldError('tenDonVi');
            }

            // 8. Loại hình công việc * (ARRAY check via WorkTypeTagInput)
            const workTypeTags = window.WorkTypeTagInput ? window.WorkTypeTagInput.getTags() : [];
            if (workTypeTags.length === 0) {
                this.showFieldError('workType', 'Vui lòng chọn hoặc nhập ít nhất 1 loại hình công việc.');
                isValid = false;
            } else {
                this.hideFieldError('workType');
            }

            // 9. Số lượng khách dự kiến *
            const guestCount = document.getElementById('guestCount');
            const totalVal = guestCount ? parseInt(guestCount.value) || 0 : 0;
            if (totalVal <= 0) {
                this.showFieldError('guestCount', 'Số lượng khách phải lớn hơn 0.');
                isValid = false;
            } else {
                this.hideFieldError('guestCount');
            }

            // 10. Validation Nam + Nữ = Tổng số (Nếu có nhập)
            const countNam = document.getElementById('soLuongNam') ? parseInt(document.getElementById('soLuongNam').value) || 0 : 0;
            const countNu = document.getElementById('soLuongNu') ? parseInt(document.getElementById('soLuongNu').value) || 0 : 0;
            if (countNam > 0 || countNu > 0) {
                if (countNam + countNu !== totalVal) {
                    this.showFieldError('soLuongGender', `Tổng Nam (${countNam}) + Nữ (${countNu}) = ${countNam + countNu} không khớp với Tổng số (${totalVal}).`);
                    isValid = false;
                } else {
                    this.hideFieldError('soLuongGender');
                }
            } else {
                this.hideFieldError('soLuongGender');
            }

            if (!isValid && window.showToast) {
                window.showToast('Vui lòng kiểm tra và điền đầy đủ các trường bắt buộc (*)', 'error');
            }

            return isValid;
        },

        showFieldError: function(fieldId, msg) {
            const errElem = document.getElementById(`err-${fieldId}`);
            if (errElem) {
                errElem.innerText = msg;
                errElem.classList.remove('hidden');
            }
        },

        hideFieldError: function(fieldId) {
            const errElem = document.getElementById(`err-${fieldId}`);
            if (errElem) {
                errElem.classList.add('hidden');
            }
        },

        // Collect all input values from the form into a clean sub-schedule object
        collectSubScheduleFormData: function(scheduleType = 'NGOAI_VIEN', existingId = null) {
            const today = new Date().toISOString().split('T')[0];
            const cfg = window.ScheduleFormConfig ? window.ScheduleFormConfig.CONFIG[scheduleType] : {};

            const guestCount = parseInt(document.getElementById('guestCount')?.value) || 0;
            const countNam = parseInt(document.getElementById('soLuongNam')?.value) || 0;
            const countNu = parseInt(document.getElementById('soLuongNu')?.value) || 0;

            const examDate = document.getElementById('examDate')?.value || '';
            const tenDonVi = document.getElementById('tenDonVi')?.value.trim() || '';
            const facility = document.getElementById('facility')?.value.trim() || '';

            // Collect Work Types as ARRAY of strings
            const loaiHinhCongViec = window.WorkTypeTagInput ? window.WorkTypeTagInput.getTags() : [];

            // Collect Consulting Form
            const hinhThucTuVan = document.querySelector('input[name="hinhThucTuVan"]:checked')?.value || 'TRUC_TIEP';

            // Collect Locations
            const diaDiemToChuc = this.collectLocationRows(facility);

            // Collect Dynamic Tables
            const danhMucThucHien = this.collectCategoryRows();
            const duKienNhanLuc = this.collectStaffRows();
            const duKienTrangThietBi = this.collectEquipmentRows();

            // Vehicle Proposal
            const coXe = document.getElementById('toggle-co-xe')?.checked || false;
            const deXuatXe = {
                coXe: coXe,
                loaiXe: document.getElementById('xe-loai-xe')?.value || '',
                soLuongXe: parseInt(document.getElementById('xe-so-luong')?.value) || 0,
                diemDon: document.getElementById('xe-diem-don')?.value.trim() || '',
                diemDua: document.getElementById('xe-diem-dua')?.value.trim() || '',
                gioXuatPhat: document.getElementById('xe-gio-xuat-phat')?.value || '',
                gioCoMat: document.getElementById('xe-gio-co-mat')?.value || '',
                gioKetThuc: document.getElementById('xe-gio-ket-thuc')?.value || '',
                ghiChu: document.getElementById('xe-ghi-chu')?.value.trim() || ''
            };

            return {
                id: existingId || ('SCH_' + Date.now()),
                scheduleId: existingId || ('SCH_' + Date.now()),
                scheduleType: scheduleType,
                loaiLich: cfg.typeLabel || 'Lịch khám',

                // Section 1
                ngayDienLich: document.getElementById('ngayDienLich')?.value || '',
                phongKinhDoanh: document.getElementById('phongKinhDoanh')?.value || '',
                canBoKinhDoanhPhuTrach: document.getElementById('canBoKinhDoanhPhuTrach')?.value || '',
                tinhTrangHopDongPAKD: document.getElementById('tinhTrangHopDongPAKD')?.value || '',

                // Section 2
                examDate: examDate,
                ngayKham: examDate,
                ngayTrienKhai: examDate,
                caSang: document.getElementById('check-shift-sang')?.checked || false,
                caChieu: document.getElementById('check-shift-chieu')?.checked || false,
                gioSang: {
                    batDau: document.getElementById('time-sang-start')?.value || '',
                    ketThuc: document.getElementById('time-sang-end')?.value || ''
                },
                gioChieu: {
                    batDau: document.getElementById('time-chieu-start')?.value || '',
                    ketThuc: document.getElementById('time-chieu-end')?.value || ''
                },
                gioXeXuatPhat: document.getElementById('gioXeXuatPhat')?.value || '',
                gioCoMat: document.getElementById('gioCoMat')?.value || '',
                ghiChuThoiGian: document.getElementById('ghiChuThoiGian')?.value.trim() || '',

                // Section 3
                workTypes: loaiHinhCongViec,
                loaiHinhCongViec: loaiHinhCongViec,
                hinhThucTuVan: hinhThucTuVan,

                // Section 4
                tenDonVi: tenDonVi,
                tinhThanh: document.getElementById('province')?.value || '',
                facility: facility,
                diaDiemKham: facility,
                diaDiemToChuc: diaDiemToChuc,

                // Section 5
                soLuongDuKien: {
                    tong: guestCount,
                    nam: countNam,
                    nu: countNu
                },
                guestCount: guestCount,
                soLuongKhach: guestCount,

                // Section 6, 7, 8
                danhMucThucHien: danhMucThucHien,
                duKienNhanLuc: duKienNhanLuc,
                duKienTrangThietBi: duKienTrangThietBi,

                // Section 9
                deXuatXe: deXuatXe,

                // Section 10
                gioChuyenMau: document.getElementById('gioChuyenMau')?.value || '',
                duTruBanhSua: parseInt(document.getElementById('duTruBanhSua')?.value) || 0,
                luuY: document.getElementById('notes')?.value.trim() || '',
                notes: document.getElementById('notes')?.value.trim() || '',

                // Section 11
                truyenThong: document.getElementById('truyenThong')?.checked || false,

                // Meta
                updatedAt: new Date().toISOString()
            };
        },

        collectLocationRows: function(defaultFacility) {
            const rows = [];
            const trs = document.querySelectorAll('#table-locations-body tr');
            if (trs && trs.length > 0) {
                trs.forEach((tr, index) => {
                    const ten = tr.querySelector('.input-loc-ten')?.value.trim() || defaultFacility;
                    const diaChi = tr.querySelector('.input-loc-diachi')?.value.trim() || '';
                    const gioCoMat = tr.querySelector('.input-loc-giocomat')?.value || '';
                    const gioKetThuc = tr.querySelector('.input-loc-gioketthuc')?.value || '';
                    const ghiChu = tr.querySelector('.input-loc-ghichu')?.value.trim() || '';
                    if (ten) {
                        rows.push({ stt: index + 1, tenDiem: ten, diaChi, gioCoMat, gioKetThuc, ghiChu });
                    }
                });
            }
            return rows;
        },

        collectCategoryRows: function() {
            const rows = [];
            const trs = document.querySelectorAll('#table-category-body tr');
            trs.forEach((tr, index) => {
                const nameSelect = tr.querySelector('.cat-select-name');
                const nameInput = tr.querySelector('.cat-input-name');
                const qtyInput = tr.querySelector('.cat-input-qty');
                const noteInput = tr.querySelector('.cat-input-note');

                const name = nameSelect ? nameSelect.value : (nameInput ? nameInput.value.trim() : '');
                const qty = qtyInput ? parseInt(qtyInput.value) || 0 : 0;
                const note = noteInput ? noteInput.value.trim() : '';

                if (name) {
                    rows.push({ stt: index + 1, name: name, quantity: qty, note: note });
                }
            });
            return rows;
        },

        collectStaffRows: function() {
            const rows = [];
            const trs = document.querySelectorAll('#table-staff-body tr');
            trs.forEach((tr, index) => {
                const roleSelect = tr.querySelector('.staff-select-role');
                const countInput = tr.querySelector('.staff-input-count');
                const shiftSelect = tr.querySelector('.staff-select-shift');
                const noteInput = tr.querySelector('.staff-input-note');

                const role = roleSelect ? roleSelect.value : '';
                const count = countInput ? parseInt(countInput.value) || 0 : 0;
                const shift = shiftSelect ? shiftSelect.value : 'Cả ngày';
                const note = noteInput ? noteInput.value.trim() : '';

                if (role && count > 0) {
                    rows.push({ stt: index + 1, role: role, count: count, shift: shift, note: note });
                }
            });
            return rows;
        },

        collectEquipmentRows: function() {
            const rows = [];
            const trs = document.querySelectorAll('#table-equipment-body tr');
            trs.forEach((tr, index) => {
                const nameInput = tr.querySelector('.equip-input-name');
                const qtyInput = tr.querySelector('.equip-input-qty');
                const noteInput = tr.querySelector('.equip-input-note');

                const name = nameInput ? nameInput.value.trim() : '';
                const qty = qtyInput ? parseInt(qtyInput.value) || 0 : 0;
                const note = noteInput ? noteInput.value.trim() : '';

                if (name && qty > 0) {
                    rows.push({ stt: index + 1, name: name, quantity: qty, note: note });
                }
            });
            return rows;
        },

        // Populate fields from a sub-schedule data object into the form (for Edit / Load)
        populateFormFromSubSchedule: function(data) {
            if (!data) return;

            // Section 1
            if (data.ngayDienLich && document.getElementById('ngayDienLich')) document.getElementById('ngayDienLich').value = data.ngayDienLich;
            if (data.phongKinhDoanh && document.getElementById('phongKinhDoanh')) document.getElementById('phongKinhDoanh').value = data.phongKinhDoanh;
            if (data.canBoKinhDoanhPhuTrach && document.getElementById('canBoKinhDoanhPhuTrach')) document.getElementById('canBoKinhDoanhPhuTrach').value = data.canBoKinhDoanhPhuTrach;
            if (data.tinhTrangHopDongPAKD && document.getElementById('tinhTrangHopDongPAKD')) document.getElementById('tinhTrangHopDongPAKD').value = data.tinhTrangHopDongPAKD;

            // Section 2
            if ((data.examDate || data.ngayKham) && document.getElementById('examDate')) document.getElementById('examDate').value = data.examDate || data.ngayKham;
            if (document.getElementById('check-shift-sang')) document.getElementById('check-shift-sang').checked = !!data.caSang;
            if (document.getElementById('check-shift-chieu')) document.getElementById('check-shift-chieu').checked = !!data.caChieu;
            if (data.gioSang && data.gioSang.batDau && document.getElementById('time-sang-start')) document.getElementById('time-sang-start').value = data.gioSang.batDau;
            if (data.gioSang && data.gioSang.ketThuc && document.getElementById('time-sang-end')) document.getElementById('time-sang-end').value = data.gioSang.ketThuc;
            if (data.gioChieu && data.gioChieu.batDau && document.getElementById('time-chieu-start')) document.getElementById('time-chieu-start').value = data.gioChieu.batDau;
            if (data.gioChieu && data.gioChieu.ketThuc && document.getElementById('time-chieu-end')) document.getElementById('time-chieu-end').value = data.gioChieu.ketThuc;

            if (data.gioXeXuatPhat && document.getElementById('gioXeXuatPhat')) document.getElementById('gioXeXuatPhat').value = data.gioXeXuatPhat;
            if (data.gioCoMat && document.getElementById('gioCoMat')) document.getElementById('gioCoMat').value = data.gioCoMat;
            if (data.ghiChuThoiGian && document.getElementById('ghiChuThoiGian')) document.getElementById('ghiChuThoiGian').value = data.ghiChuThoiGian;

            // Section 3
            if (data.loaiHinhCongViec && window.WorkTypeTagInput) {
                window.WorkTypeTagInput.setTags(data.loaiHinhCongViec, data.scheduleType);
            }
            if (data.hinhThucTuVan) {
                const radio = document.querySelector(`input[name="hinhThucTuVan"][value="${data.hinhThucTuVan}"]`);
                if (radio) radio.checked = true;
            }

            // Section 4
            if (data.tenDonVi && document.getElementById('tenDonVi')) document.getElementById('tenDonVi').value = data.tenDonVi;
            if (data.tinhThanh && document.getElementById('province')) document.getElementById('province').value = data.tinhThanh;
            if ((data.facility || data.diaDiemKham) && document.getElementById('facility')) document.getElementById('facility').value = data.facility || data.diaDiemKham;

            // Section 5
            const totalQty = (data.soLuongDuKien && data.soLuongDuKien.tong) || data.guestCount || data.soLuongKhach || 180;
            if (document.getElementById('guestCount')) document.getElementById('guestCount').value = totalQty;
            if (data.soLuongDuKien && document.getElementById('soLuongNam')) document.getElementById('soLuongNam').value = data.soLuongDuKien.nam || 0;
            if (data.soLuongDuKien && document.getElementById('soLuongNu')) document.getElementById('soLuongNu').value = data.soLuongDuKien.nu || 0;

            // Section 6, 7, 8, 9, 10, 11
            if (data.gioChuyenMau && document.getElementById('gioChuyenMau')) document.getElementById('gioChuyenMau').value = data.gioChuyenMau;
            if (data.duTruBanhSua !== undefined && document.getElementById('duTruBanhSua')) document.getElementById('duTruBanhSua').value = data.duTruBanhSua;
            if ((data.luuY || data.notes) && document.getElementById('notes')) document.getElementById('notes').value = data.luuY || data.notes;
            if (document.getElementById('truyenThong')) document.getElementById('truyenThong').checked = !!data.truyenThong;

            // Vehicle Proposal
            if (data.deXuatXe) {
                const toggleXe = document.getElementById('toggle-co-xe');
                if (toggleXe) {
                    toggleXe.checked = !!data.deXuatXe.coXe;
                    toggleXe.dispatchEvent(new Event('change'));
                }
                if (data.deXuatXe.loaiXe && document.getElementById('xe-loai-xe')) document.getElementById('xe-loai-xe').value = data.deXuatXe.loaiXe;
                if (data.deXuatXe.soLuongXe && document.getElementById('xe-so-luong')) document.getElementById('xe-so-luong').value = data.deXuatXe.soLuongXe;
                if (data.deXuatXe.diemDon && document.getElementById('xe-diem-don')) document.getElementById('xe-diem-don').value = data.deXuatXe.diemDon;
                if (data.deXuatXe.diemDua && document.getElementById('xe-diem-dua')) document.getElementById('xe-diem-dua').value = data.deXuatXe.diemDua;
                if (data.deXuatXe.gioXuatPhat && document.getElementById('xe-gio-xuat-phat')) document.getElementById('xe-gio-xuat-phat').value = data.deXuatXe.gioXuatPhat;
                if (data.deXuatXe.gioCoMat && document.getElementById('xe-gio-co-mat')) document.getElementById('xe-gio-co-mat').value = data.deXuatXe.gioCoMat;
                if (data.deXuatXe.gioKetThuc && document.getElementById('xe-gio-ket-thuc')) document.getElementById('xe-gio-ket-thuc').value = data.deXuatXe.gioKetThuc;
                if (data.deXuatXe.ghiChu && document.getElementById('xe-ghi-chu')) document.getElementById('xe-ghi-chu').value = data.deXuatXe.ghiChu;
            }
        }
    };

    window.SubScheduleHelper = SubScheduleHelper;
})(window);
