/**
 * MWK - SUB-SCHEDULE DETAIL HELPER
 * Renders full detail read-only view for a Sub-Schedule object reading directly from data-store.js
 */

(function(window) {
    const SubScheduleDetailHelper = {
        renderDetailView: function(containerId, data) {
            const container = document.getElementById(containerId);
            if (!container || !data) return;

            const formatMoney = (val) => val ? val.toLocaleString('vi-VN') : '0';

            // Work Types Read-Only Tags HTML (Renders all tags in workTypes / loaiHinhCongViec array)
            let workTypesHtml = window.WorkTypeTagInput 
                ? window.WorkTypeTagInput.renderReadOnlyTagsHtml(data, data.scheduleType || 'NGOAI_VIEN')
                : `<span class="px-2.5 py-1 rounded-[4px] bg-[#E8F1FB] text-[#27496D] font-semibold text-xs border border-[#B3CDE6]">Khám sức khỏe</span>`;

            // Categories Table HTML
            let categoriesRowsHtml = '';
            if (Array.isArray(data.danhMucThucHien) && data.danhMucThucHien.length > 0) {
                categoriesRowsHtml = data.danhMucThucHien.map((cat, idx) => `
                    <tr>
                        <td class="py-2.5 px-3 text-center font-bold text-[#6B7280]">${idx + 1}</td>
                        <td class="py-2.5 px-3 font-medium text-[#1F2937]">${cat.name || '---'}</td>
                        <td class="py-2.5 px-3 text-center font-bold text-[#27496D]">${cat.quantity || 0}</td>
                        <td class="py-2.5 px-3 text-[#6B7280]">${cat.note || '---'}</td>
                    </tr>
                `).join('');
            } else {
                categoriesRowsHtml = `<tr><td colspan="4" class="py-3 px-3 text-center text-[#9CA3AF]">Chưa có danh mục thực hiện.</td></tr>`;
            }

            // Staff Table HTML
            let staffRowsHtml = '';
            if (Array.isArray(data.duKienNhanLuc) && data.duKienNhanLuc.length > 0) {
                staffRowsHtml = data.duKienNhanLuc.map((stf, idx) => `
                    <tr>
                        <td class="py-2.5 px-3 text-center font-bold text-[#6B7280]">${idx + 1}</td>
                        <td class="py-2.5 px-3 font-medium text-[#1F2937]">${stf.role || '---'}</td>
                        <td class="py-2.5 px-3 text-center font-bold text-[#27496D]">${stf.count || 1}</td>
                        <td class="py-2.5 px-3 text-center font-medium text-[#4B5563]">${stf.shift || 'Cả ngày'}</td>
                        <td class="py-2.5 px-3 text-[#6B7280]">${stf.note || '---'}</td>
                    </tr>
                `).join('');
            } else {
                staffRowsHtml = `<tr><td colspan="5" class="py-3 px-3 text-center text-[#9CA3AF]">Chưa có dự kiến nhân lực.</td></tr>`;
            }

            // Equipment Table HTML
            let equipRowsHtml = '';
            if (Array.isArray(data.duKienTrangThietBi) && data.duKienTrangThietBi.length > 0) {
                equipRowsHtml = data.duKienTrangThietBi.map((eq, idx) => `
                    <tr>
                        <td class="py-2.5 px-3 text-center font-bold text-[#6B7280]">${idx + 1}</td>
                        <td class="py-2.5 px-3 font-medium text-[#1F2937]">${eq.name || '---'}</td>
                        <td class="py-2.5 px-3 text-center font-bold text-[#27496D]">${eq.quantity || 1}</td>
                        <td class="py-2.5 px-3 text-[#6B7280]">${eq.note || '---'}</td>
                    </tr>
                `).join('');
            } else {
                equipRowsHtml = `<tr><td colspan="4" class="py-3 px-3 text-center text-[#9CA3AF]">Chưa có thông tin máy móc thiết bị.</td></tr>`;
            }

            // Locations Table HTML
            let locationRowsHtml = '';
            if (Array.isArray(data.diaDiemToChuc) && data.diaDiemToChuc.length > 0) {
                locationRowsHtml = data.diaDiemToChuc.map((loc, idx) => `
                    <tr>
                        <td class="py-2.5 px-3 text-center font-bold text-[#6B7280]">${idx + 1}</td>
                        <td class="py-2.5 px-3 font-bold text-[#1F2937]">${loc.tenDiem || '---'}</td>
                        <td class="py-2.5 px-3 text-[#4B5563]">${loc.diaChi || '---'}</td>
                        <td class="py-2.5 px-3 text-center font-bold text-[#27496D]">${loc.gioCoMat || '07:00'} - ${loc.gioKetThuc || '17:00'}</td>
                        <td class="py-2.5 px-3 text-[#6B7280]">${loc.ghiChu || '---'}</td>
                    </tr>
                `).join('');
            } else {
                locationRowsHtml = `<tr><td colspan="5" class="py-3 px-3 text-center text-[#9CA3AF]">Địa điểm chính: ${data.facility || data.diaDiemKham || '---'}</td></tr>`;
            }

            // Vehicle Proposal Card HTML
            let xeHtml = '';
            if (data.deXuatXe && data.deXuatXe.coXe) {
                xeHtml = `
                    <div class="bg-[#FFF9F0] border border-[#FFE4C4] rounded-[4px] p-3.5 space-y-2 text-xs">
                        <div class="font-bold text-[#ED6C02] flex items-center gap-1.5">
                            <i class="fa-solid fa-bus"></i> Có đề xuất phương tiện xe vận chuyển
                        </div>
                        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-[#4B5563]">
                            <div><strong>Loại xe:</strong> ${data.deXuatXe.loaiXe || 'Xe 16 chỗ'} (${data.deXuatXe.soLuongXe || 1} xe)</div>
                            <div><strong>Điểm đón:</strong> ${data.deXuatXe.diemDon || '---'}</div>
                            <div><strong>Điểm đưa:</strong> ${data.deXuatXe.diemDua || '---'}</div>
                            <div><strong>Giờ xuất phát:</strong> ${data.deXuatXe.gioXuatPhat || '06:30'}</div>
                        </div>
                    </div>
                `;
            } else {
                xeHtml = `<div class="text-xs text-[#6B7280] italic">Không có đề xuất phương tiện xe.</div>`;
            }

            container.innerHTML = `
                <div class="space-y-4">
                    <!-- SECTION 1: THÔNG TIN LỊCH & KINH DOANH -->
                    <div class="bg-white border border-[#D9DEE5] rounded-[4px] p-4 space-y-3">
                        <div class="flex items-center gap-2 border-b border-[#E6EAF0] pb-2 font-bold text-xs text-[#1F2937] uppercase">
                            <i class="fa-solid fa-file-invoice text-[#27496D]"></i> 1. Thông tin lịch & Kinh doanh
                        </div>
                        <div class="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                            <div><span class="text-[#6B7280]">Ngày điền lịch:</span> <strong class="text-[#1F2937] block font-bold">${data.ngayDienLich || '---'}</strong></div>
                            <div><span class="text-[#6B7280]">Phòng Kinh doanh:</span> <strong class="text-[#1F2937] block font-bold">${data.phongKinhDoanh || 'TTKD Hà Nội'}</strong></div>
                            <div><span class="text-[#6B7280]">CBKD phụ trách:</span> <strong class="text-[#27496D] block font-bold">${data.canBoKinhDoanhPhuTrach || '---'}</strong></div>
                            <div><span class="text-[#6B7280]">Tình trạng hợp đồng / PAKD:</span> <strong class="text-[#27496D] block font-bold">${data.tinhTrangHopDongPAKD || 'Đã ký hợp đồng + PAKD đã duyệt'}</strong></div>
                            <div><span class="text-[#6B7280]">Duyệt của BGĐ:</span> <span class="badge-success font-semibold px-2 py-0.5 text-[11px]">${data.duyetBGD || 'Đã duyệt'}</span></div>
                            <div><span class="text-[#6B7280]">Sử dụng hình ảnh truyền thông:</span> <strong class="text-[#1F2937] block">${data.truyenThong ? 'Có' : 'Không'}</strong></div>
                        </div>
                    </div>

                    <!-- SECTION 2: THỜI GIAN TRIỂN KHAI & ĐƠN VỊ -->
                    <div class="bg-white border border-[#D9DEE5] rounded-[4px] p-4 space-y-3">
                        <div class="flex items-center gap-2 border-b border-[#E6EAF0] pb-2 font-bold text-xs text-[#1F2937] uppercase">
                            <i class="fa-regular fa-clock text-[#27496D]"></i> 2. Thời gian triển khai & Đơn vị KSK
                        </div>
                        <div class="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                            <div><span class="text-[#6B7280]">Tên đơn vị KSK:</span> <strong class="text-[#1F2937] block font-bold uppercase">${data.tenDonVi || '---'}</strong></div>
                            <div><span class="text-[#6B7280]">Ngày triển khai:</span> <strong class="text-[#1F2937] block font-bold">${data.examDate || data.ngayKham || '---'}</strong></div>
                            <div><span class="text-[#6B7280]">Khung giờ:</span> <strong class="text-[#27496D] block font-bold">${data.caSang ? 'Sáng (07:30 - 11:00)' : ''} ${data.caChieu ? 'Chiều (13:30 - 17:30)' : ''}</strong></div>
                            <div><span class="text-[#6B7280]">Tổng SL dự kiến:</span> <strong class="text-[#ED6C02] text-sm block font-bold">${(data.soLuongDuKien && data.soLuongDuKien.tong) || data.guestCount || data.soLuongKhach || 0} khách (${(data.soLuongDuKien && data.soLuongDuKien.nam) || 0} Nam / ${(data.soLuongDuKien && data.soLuongDuKien.nu) || 0} Nữ)</strong></div>
                            <div><span class="text-[#6B7280]">Giờ chuyển mẫu về:</span> <strong class="text-[#1F2937] block font-bold">${data.gioChuyenMau || '14:30'}</strong></div>
                            <div><span class="text-[#6B7280]">Dự trù bánh sữa:</span> <strong class="text-[#27496D] block font-bold">${data.duTruBanhSua || 0} suất</strong></div>
                        </div>
                        <div class="pt-2 border-t border-[#E6EAF0]">
                            <span class="text-[#6B7280] block mb-1">Loại hình công việc triển khai:</span>
                            <div class="flex items-center gap-1.5 flex-wrap">${workTypesHtml}</div>
                        </div>
                    </div>

                    <!-- SECTION 3: ĐỊA ĐIỂM TỔ CHỨC KSK -->
                    <div class="bg-white border border-[#D9DEE5] rounded-[4px] p-4 space-y-3">
                        <div class="flex items-center gap-2 border-b border-[#E6EAF0] pb-2 font-bold text-xs text-[#1F2937] uppercase">
                            <i class="fa-solid fa-location-dot text-[#27496D]"></i> 3. Địa điểm & Điểm tổ chức KSK
                        </div>
                        <div class="border border-[#D9DEE5] rounded-[4px] overflow-x-auto">
                            <table class="table-his text-xs">
                                <thead>
                                    <tr>
                                        <th class="py-2 px-3 text-center w-12">STT</th>
                                        <th class="py-2 px-3">Tên điểm / Cơ sở</th>
                                        <th class="py-2 px-3">Địa chỉ cụ thể</th>
                                        <th class="py-2 px-3 text-center w-36">Thời gian đón tiếp</th>
                                        <th class="py-2 px-3">Ghi chú</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-[#E6EAF0]">${locationRowsHtml}</tbody>
                            </table>
                        </div>
                    </div>

                    <!-- SECTION 4: DANH MỤC THỰC HIỆN -->
                    <div class="bg-white border border-[#D9DEE5] rounded-[4px] p-4 space-y-3">
                        <div class="flex items-center gap-2 border-b border-[#E6EAF0] pb-2 font-bold text-xs text-[#1F2937] uppercase">
                            <i class="fa-solid fa-list-check text-[#27496D]"></i> 4. Danh mục thực hiện (${data.danhMucThucHien ? data.danhMucThucHien.length : 0})
                        </div>
                        <div class="border border-[#D9DEE5] rounded-[4px] overflow-x-auto">
                            <table class="table-his text-xs">
                                <thead>
                                    <tr>
                                        <th class="py-2 px-3 text-center w-12">STT</th>
                                        <th class="py-2 px-3">Danh mục / dịch vụ</th>
                                        <th class="py-2 px-3 text-center w-24">SL dự kiến</th>
                                        <th class="py-2 px-3">Ghi chú</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-[#E6EAF0]">${categoriesRowsHtml}</tbody>
                            </table>
                        </div>
                    </div>

                    <!-- SECTION 5: DỰ KIẾN NHÂN LỰC & THIẾT BỊ -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div class="bg-white border border-[#D9DEE5] rounded-[4px] p-4 space-y-3">
                            <div class="flex items-center gap-2 border-b border-[#E6EAF0] pb-2 font-bold text-xs text-[#1F2937] uppercase">
                                <i class="fa-solid fa-user-doctor text-[#27496D]"></i> 5. Dự kiến nhân lực
                            </div>
                            <div class="border border-[#D9DEE5] rounded-[4px] overflow-x-auto">
                                <table class="table-his text-xs">
                                    <thead>
                                        <tr>
                                            <th class="py-2 px-2 text-center w-10">STT</th>
                                            <th class="py-2 px-2">Vị trí / Chức danh</th>
                                            <th class="py-2 px-2 text-center w-16">SL</th>
                                            <th class="py-2 px-2 text-center w-20">Ca</th>
                                            <th class="py-2 px-2">Ghi chú</th>
                                        </tr>
                                    </thead>
                                    <tbody class="divide-y divide-[#E6EAF0]">${staffRowsHtml}</tbody>
                                </table>
                            </div>
                        </div>

                        <div class="bg-white border border-[#D9DEE5] rounded-[4px] p-4 space-y-3">
                            <div class="flex items-center gap-2 border-b border-[#E6EAF0] pb-2 font-bold text-xs text-[#1F2937] uppercase">
                                <i class="fa-solid fa-sliders text-[#27496D]"></i> 6. Trang thiết bị & Máy móc
                            </div>
                            <div class="border border-[#D9DEE5] rounded-[4px] overflow-x-auto">
                                <table class="table-his text-xs">
                                    <thead>
                                        <tr>
                                            <th class="py-2 px-2 text-center w-10">STT</th>
                                            <th class="py-2 px-2">Thiết bị / Máy móc</th>
                                            <th class="py-2 px-2 text-center w-16">SL</th>
                                            <th class="py-2 px-2">Ghi chú</th>
                                        </tr>
                                    </thead>
                                    <tbody class="divide-y divide-[#E6EAF0]">${equipRowsHtml}</tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    <!-- SECTION 6: ĐỀ XUẤT XE & LƯU Ý -->
                    <div class="bg-white border border-[#D9DEE5] rounded-[4px] p-4 space-y-3">
                        <div class="flex items-center gap-2 border-b border-[#E6EAF0] pb-2 font-bold text-xs text-[#1F2937] uppercase">
                            <i class="fa-solid fa-bus text-[#27496D]"></i> 7. Đề xuất xe & Lưu ý triển khai
                        </div>
                        ${xeHtml}
                        <div class="pt-2 border-t border-[#E6EAF0]">
                            <span class="text-[#6B7280] text-xs font-semibold block mb-1">Lưu ý & Hướng dẫn triển khai:</span>
                            <div class="p-3 bg-[#F8FAFC] border border-[#D9DEE5] rounded-[4px] text-xs text-[#1F2937] leading-relaxed">
                                ${data.luuY || data.notes || 'Không có lưu ý thêm.'}
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }
    };

    window.SubScheduleDetailHelper = SubScheduleDetailHelper;
})(window);
