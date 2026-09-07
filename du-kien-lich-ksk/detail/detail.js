/**
 * READ-ONLY DETAIL CONTROLLER FOR PLANNED SCHEDULE (DỰ KIẾN LỊCH KSK)
 */

document.addEventListener('DOMContentLoaded', function () {
    initPlannedDetailModule();
});

let currentId = null;
let currentItem = null;

function initPlannedDetailModule() {
    const urlParams = new URLSearchParams(window.location.search);
    const idParam = urlParams.get('id');

    if (!idParam) {
        alert('Không tìm thấy thông tin Lịch dự kiến KSK!');
        window.location.href = '../calendar.html';
        return;
    }

    currentId = parseInt(idParam) || idParam;

    if (window.MWKDataStore && typeof window.MWKDataStore.getPlannedScheduleById === 'function') {
        currentItem = window.MWKDataStore.getPlannedScheduleById(currentId);
    }

    if (!currentItem) {
        alert('Bản ghi Lịch dự kiến KSK không tồn tại hoặc đã bị xóa!');
        window.location.href = '../calendar.html';
        return;
    }

    renderPlannedDetailView();
}

function renderPlannedDetailView() {
    const unitName = currentItem.tenDonVi || currentItem.customerName || 'Tên đơn vị';
    const code = currentItem.customerCode || currentItem.code || `DK-2026-${currentItem.id}`;

    document.getElementById('detail-unit-name').innerText = unitName;
    document.getElementById('detail-team-name').innerText = unitName;
    document.getElementById('detail-code-badge').innerText = code;
    document.getElementById('detail-customer-code').innerText = code;

    const statusBadge = document.getElementById('detail-status-badge');
    if (statusBadge) {
        statusBadge.innerText = currentItem.trangThai || 'Dự kiến';
    }

    document.getElementById('detail-contact-person').innerText = currentItem.contactPerson || '-';
    document.getElementById('detail-contact-phone').innerText = currentItem.contactPhone || 'Chưa cập nhật';
    document.getElementById('detail-cb-phu-trach').innerText = currentItem.cbPhuTrach || 'Nguyễn Văn An';

    // Format Date
    let dateStr = currentItem.ngayKham || '-';
    if (dateStr.includes('-')) {
        const parts = dateStr.split('-');
        if (parts.length === 3) {
            dateStr = `${parts[2]}/${parts[1]}/${parts[0]}`;
        }
    }
    document.getElementById('detail-exam-date').innerText = dateStr;

    // Shift
    let shiftText = 'Sáng';
    if (currentItem.ca === 'Chieu') shiftText = 'Chiều';
    else if (currentItem.ca === 'CaNgay') shiftText = 'Cả ngày';
    document.getElementById('detail-shift').innerText = shiftText;

    // Time range
    const timeRange = `${currentItem.gioBatDau || '07:30'} - ${currentItem.gioKetThuc || '11:00'}`;
    document.getElementById('detail-time-range').innerText = timeRange;

    // Type Badge
    const typeBadge = document.getElementById('detail-type-badge');
    if (typeBadge && window.CalendarHelper) {
        const style = window.CalendarHelper.getScheduleTypeStyle(currentItem.loaiLich);
        typeBadge.innerText = style.label;
        typeBadge.className = `inline-block px-2.5 py-0.5 rounded-[4px] text-xs font-bold ${style.badgeClass}`;
    } else if (typeBadge) {
        typeBadge.innerText = currentItem.loaiLich || 'Lịch tại viện';
    }

    document.getElementById('detail-facility').innerText = currentItem.coSo || 'MEDLATEC Ba Đình';
    document.getElementById('detail-guest-count').innerText = `${currentItem.soLuongKhach || 0} KH`;
    document.getElementById('detail-staff-count').innerText = `${currentItem.tongNhanSu || 0} nhân sự`;
    document.getElementById('detail-exam-location').innerText = currentItem.diaDiemKham || 'Tại cơ sở MEDLATEC';

    document.getElementById('detail-general-note').innerText = currentItem.generalNote || 'Không có ghi chú thêm.';
    document.getElementById('detail-request-note').innerText = currentItem.requestNote || 'Không có yêu cầu riêng.';
}

function handleConvertToOfficial() {
    if (confirm('Bạn có chắc chắn muốn chuyển Lịch dự kiến này thành Lịch khám đơn vị chính thức?')) {
        if (window.showToast) {
            window.showToast('Đã khởi tạo Lịch khám đơn vị từ dữ liệu dự kiến!', 'success');
        } else {
            alert('Đã khởi tạo Lịch khám đơn vị từ dữ liệu dự kiến!');
        }
        setTimeout(() => {
            window.location.href = '../../tao-lich-ksk/index.html';
        }, 500);
    }
}
