/**
 * MWK - CHI TIẾT LỊCH TẠI VIỆN | TAI-VIEN MODULE DETAIL JS LOGIC
 */

document.addEventListener('DOMContentLoaded', function () {
    initDetailModule();
});

function initDetailModule() {
    const params = new URLSearchParams(window.location.search);
    const subId = params.get('subId') || params.get('id');
    const editId = params.get('editId');

    const backBtn = document.getElementById('btn-back-to-parent');
    if (backBtn) {
        backBtn.href = editId ? `../edit/edit.html?id=${editId}&step=2` : '../create/create.html?step=2';
    }

    const draftKey = editId ? `mwk_edit_schedule_draft_${editId}` : 'mwk_create_schedule_draft';
    let draft = {};
    const draftJson = sessionStorage.getItem(draftKey);
    if (draftJson) {
        try { draft = JSON.parse(draftJson); } catch (e) {}
    }

    const list = draft.step2Data && draft.step2Data.taiVien ? draft.step2Data.taiVien : [];
    const item = list.find(s => String(s.id) === String(subId)) || list[0];

    if (item) {
        const titleElem = document.getElementById('detail-title-ma-lich');
        if (titleElem) titleElem.innerText = item.maLich || '260813 - TV - S';

        const ngayKhamElem = document.getElementById('detail-ngay-kham');
        if (ngayKhamElem) ngayKhamElem.innerText = item.ngayKhamFormatted || item.ngayKham || '13/08/2026';

        const khungGioElem = document.getElementById('detail-khung-gio');
        if (khungGioElem) {
            let timeStr = '07:30 - 11:00';
            if (item.gioSang && item.gioChieu) {
                timeStr = `${item.gioSang.batDau} - ${item.gioSang.ketThuc}, ${item.gioChieu.batDau} - ${item.gioChieu.ketThuc}`;
            } else if (item.gioSang) {
                timeStr = `${item.gioSang.batDau} - ${item.gioSang.ketThuc}`;
            } else if (item.gioChieu) {
                timeStr = `${item.gioChieu.batDau} - ${item.gioChieu.ketThuc}`;
            }
            khungGioElem.innerText = timeStr;
        }

        const diaDiemElem = document.getElementById('detail-dia-diem');
        if (diaDiemElem) diaDiemElem.innerText = item.diaDiemKham || 'MEDLATEC Ba Đình';

        const soKhachElem = document.getElementById('detail-so-khach');
        if (soKhachElem) soKhachElem.innerText = `${item.soLuongKhach || item.guests || 250} KH`;

        // Render Danh mục khám Table
        const tableDM = document.getElementById('detail-table-danh-muc');
        if (tableDM) {
            const categories = item.danhMucKham || [
                { name: 'Siêu âm ổ bụng tổng quát', guests: 250 },
                { name: 'Khám Nội tổng quát', guests: 250 }
            ];
            let html = '';
            categories.forEach((cat, idx) => {
                html += `
                    <tr>
                        <td class="py-2 px-3 text-center font-bold text-[#6B7280]">${idx + 1}</td>
                        <td class="py-2 px-3 font-semibold text-[#1F2937]">${cat.name}</td>
                        <td class="py-2 px-3 text-right font-bold text-[#27496D]">${cat.guests || 250}</td>
                    </tr>
                `;
            });
            tableDM.innerHTML = html;
        }

        // Render Dự kiến nhân sự Table
        const tableNS = document.getElementById('detail-table-nhan-su');
        if (tableNS) {
            const staff = item.nhanSu || [
                { title: 'Bác sĩ Khám Nội', count: 4 },
                { title: 'Điều dưỡng Lấy máu', count: 4 }
            ];
            let html = '';
            staff.forEach((st, idx) => {
                html += `
                    <tr>
                        <td class="py-2 px-3 text-center font-bold text-[#6B7280]">${idx + 1}</td>
                        <td class="py-2 px-3 font-semibold text-[#1F2937]">${st.title}</td>
                        <td class="py-2 px-3 text-right font-bold text-[#27496D]">${st.count || 2}</td>
                    </tr>
                `;
            });
            tableNS.innerHTML = html;
        }
    }
}
