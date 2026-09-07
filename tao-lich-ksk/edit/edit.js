/**
 * MWK - CHỈNH SỬA LỊCH KSK | EDIT MODULE LOGIC
 * Re-uses 100% UI layout and business logic matching Create Module.
 */

let currentId = null;
let currentItem = null;

let step2Data = {
    ngoaiVien: [],
    taiVien: [],
    lichPhuong: []
};

let currentActiveAddType = 'Ngoại viện';
let currentDinhMucModalTab = 'Ngoại viện';

function initEditModule() {
    const urlParams = new URLSearchParams(window.location.search);
    const idParam = urlParams.get('id');

    if (!idParam) {
        if (window.showToast) window.showToast('Không tìm thấy ID lịch KSK cần chỉnh sửa.', 'error');
        else alert('Không tìm thấy ID lịch KSK cần chỉnh sửa.');
        window.location.href = '../index.html';
        return;
    }

    currentId = parseInt(idParam) || idParam;
    currentItem = MWKDataStore.getKskScheduleById(currentId);

    if (!currentItem) {
        if (window.showToast) window.showToast('Bản ghi lịch KSK không tồn tại hoặc đã bị xóa.', 'error');
        else alert('Bản ghi lịch KSK không tồn tại.');
        window.location.href = '../index.html';
        return;
    }

    if (MWKDataStore.canEditSchedule && !MWKDataStore.canEditSchedule(currentItem)) {
        if (window.showToast) window.showToast('Lịch đã được gửi đi / đã khóa, không thể chỉnh sửa.', 'error');
        else alert('Lịch đã được gửi đi / đã khóa, không thể chỉnh sửa.');
        window.location.href = '../index.html';
        return;
    }

    // Display Schedule Code Badge
    const codeBadge = document.getElementById('schedule-code-badge');
    if (codeBadge) {
        codeBadge.innerText = currentItem.code || currentItem.maDoiTuong || `LK-2026-${currentId}`;
    }

    bindStep1Events();
    loadDraftStateFromSession();
    handleStep2ToggleChange();
    populateStep2CustomerCard();
    updateStep2UI();
}

function handleSuDungPAKDToggle(isPakd) {
    const pakdStatusElem = document.getElementById('pakdStatus');
    const customerCodeElem = document.getElementById('customerCode');
    const btnFetch = document.getElementById('btn-fetch-pakd');

    if (pakdStatusElem) pakdStatusElem.value = isPakd ? 'Có PAKD' : 'Không có PAKD';

    if (!isPakd) {
        if (customerCodeElem) {
            customerCodeElem.value = '';
            customerCodeElem.disabled = true;
            customerCodeElem.classList.add('bg-gray-100', 'cursor-not-allowed');
        }
        if (btnFetch) {
            btnFetch.disabled = true;
            btnFetch.classList.add('opacity-50', 'pointer-events-none');
        }
    } else {
        if (customerCodeElem) {
            customerCodeElem.disabled = false;
            customerCodeElem.classList.remove('bg-gray-100', 'cursor-not-allowed');
        }
        if (btnFetch) {
            btnFetch.disabled = false;
            btnFetch.classList.remove('opacity-50', 'pointer-events-none');
        }
    }

    saveCurrentEditDraftToSession();
    populateStep2CustomerCard();
}

function loadDraftStateFromSession() {
    const urlParams = new URLSearchParams(window.location.search);
    const isStep2 = urlParams.get('step') === '2';
    const draftKey = `mwk_edit_schedule_draft_${currentId}`;
    const draftJson = sessionStorage.getItem(draftKey);

    let draft = null;
    if (draftJson) {
        try { draft = JSON.parse(draftJson); } catch (e) {}
    }

    const masterStep2Data = currentItem.step2Data;

    const draftHasCards = draft && draft.step2Data &&
        ((draft.step2Data.ngoaiVien && draft.step2Data.ngoaiVien.length > 0) ||
         (draft.step2Data.taiVien && draft.step2Data.taiVien.length > 0) ||
         (draft.step2Data.lichPhuong && draft.step2Data.lichPhuong.length > 0));

    const masterHasCards = masterStep2Data &&
        ((masterStep2Data.ngoaiVien && masterStep2Data.ngoaiVien.length > 0) ||
         (masterStep2Data.taiVien && masterStep2Data.taiVien.length > 0) ||
         (masterStep2Data.lichPhuong && masterStep2Data.lichPhuong.length > 0));

    if (draftHasCards) {
        step2Data = JSON.parse(JSON.stringify(draft.step2Data));
    } else if (masterHasCards) {
        step2Data = JSON.parse(JSON.stringify(masterStep2Data));
    } else {
        step2Data = { ngoaiVien: [], taiVien: [], lichPhuong: [] };
        const loaiStr = currentItem.loaiLich || '';
        if (loaiStr.includes('Tại viện') || loaiStr.includes('Lịch tại viện')) {
            step2Data.taiVien.push({
                id: `TV-EDIT-${currentId}`,
                maLich: `${currentItem.code || currentItem.maDoiTuong || '230725 - TV - S,C'}`,
                ngayKham: currentItem.examDate || new Date().toISOString().split('T')[0],
                ngayKhamFormatted: '23/07/2025',
                caSang: true,
                caChieu: true,
                gioSang: { batDau: '07:30', ketThuc: '11:00' },
                gioChieu: { batDau: '13:30', ketThuc: '17:30' },
                diaDiemKham: currentItem.facility || 'Med Ba Đình',
                soLuongKhach: currentItem.estimatedCount || currentItem.soLuong || 250,
                tongNhanSu: currentItem.tongNhanSu || 26,
                trangThai: 'DA_TAO'
            });
        }
    }

    if (!step2Data.ngoaiVien) step2Data.ngoaiVien = [];
    if (!step2Data.taiVien) step2Data.taiVien = [];
    if (!step2Data.lichPhuong) step2Data.lichPhuong = [];

    // Populate Step 1 Fields
    const customerCode = (draft && draft.customerCode) || currentItem.customerCode || currentItem.code || currentItem.maDoiTuong || '';
    const cbkd = (draft && draft.cbkd) || currentItem.cbkd || currentItem.personInCharge || '';
    const maNhanVien = (draft && draft.maNhanVien) || currentItem.maNhanVien || 'NV0042';
    const customerName = (draft && draft.customerName) || currentItem.customerName || currentItem.teamName || '';
    const customerType = (draft && draft.customerType) || currentItem.customerType || 'Doanh nghiệp';
    const address = (draft && draft.address) || currentItem.address || currentItem.examLocation || '';
    const estimatedCount = (draft && draft.estimatedCount) || currentItem.estimatedCount || currentItem.soLuong || '';
    const examDate = (draft && draft.examDate) || currentItem.examDate || '';
    const contactPerson = (draft && draft.contactPerson) || currentItem.contactPerson || '';
    const contractNote = (draft && draft.contractNote) || currentItem.contractNote || currentItem.generalNote || '';
    const pakdStatus = (draft && draft.pakdStatus) || currentItem.pakdStatus || currentItem.phuongAnKinhDoanh || 'Không có PAKD';

    if (document.getElementById('customerCode')) document.getElementById('customerCode').value = customerCode;
    if (document.getElementById('cbkd')) document.getElementById('cbkd').value = cbkd;
    if (document.getElementById('maNhanVien')) document.getElementById('maNhanVien').value = maNhanVien;
    if (document.getElementById('customerName')) document.getElementById('customerName').value = customerName;
    if (document.getElementById('customerType')) document.getElementById('customerType').value = customerType;
    if (document.getElementById('address')) document.getElementById('address').value = address;
    if (document.getElementById('estimatedCount')) document.getElementById('estimatedCount').value = estimatedCount;
    if (document.getElementById('examDate')) document.getElementById('examDate').value = examDate;
    if (document.getElementById('contactPerson')) document.getElementById('contactPerson').value = contactPerson;
    if (document.getElementById('contractNote')) document.getElementById('contractNote').value = contractNote;
    if (document.getElementById('pakdStatus')) document.getElementById('pakdStatus').value = pakdStatus;

    const suDungCb = document.getElementById('suDungPAKD');
    if (suDungCb) {
        const isPakd = (draft && draft.suDungPAKD !== undefined) ? draft.suDungPAKD : (currentItem.suDungPAKD !== undefined ? currentItem.suDungPAKD : (pakdStatus === 'Có PAKD'));
        suDungCb.checked = isPakd;
        handleSuDungPAKDToggle(isPakd);
    }

    const toggleNgoaiVien = document.getElementById('toggle-ngoai-vien');
    const toggleTaiVien = document.getElementById('toggle-tai-vien');
    const toggleLichPhuong = document.getElementById('toggle-lich-phuong');

    const cbNgoaiVien = document.getElementById('check-box-ngoai-vien');
    const cbTaiVien = document.getElementById('check-box-tai-vien');
    const cbLichPhuong = document.getElementById('check-box-lich-phuong');

    const hasTaiVien = step2Data.taiVien.length > 0;
    const hasNgoaiVien = step2Data.ngoaiVien.length > 0;
    const hasLichPhuong = step2Data.lichPhuong.length > 0;

    if (toggleNgoaiVien) toggleNgoaiVien.checked = hasNgoaiVien;
    if (toggleTaiVien) toggleTaiVien.checked = hasTaiVien;
    if (toggleLichPhuong) toggleLichPhuong.checked = hasLichPhuong;

    if (cbNgoaiVien) cbNgoaiVien.checked = hasNgoaiVien;
    if (cbTaiVien) cbTaiVien.checked = hasTaiVien;
    if (cbLichPhuong) cbLichPhuong.checked = hasLichPhuong;

    saveCurrentEditDraftToSession();

    if (isStep2) {
        switchToStep(2);
    } else {
        switchToStep(1);
    }
}

function saveCurrentEditDraftToSession() {
    if (!currentId) return;
    const suDungCb = document.getElementById('suDungPAKD');
    const isPakdChecked = suDungCb ? suDungCb.checked : (document.getElementById('pakdStatus')?.value === 'Có PAKD');
    const draft = {
        customerCode: document.getElementById('customerCode')?.value.trim() || '',
        cbkd: document.getElementById('cbkd')?.value.trim() || '',
        maNhanVien: document.getElementById('maNhanVien')?.value.trim() || '',
        customerName: document.getElementById('customerName')?.value.trim() || '',
        customerType: document.getElementById('customerType')?.value || 'Doanh nghiệp',
        address: document.getElementById('address')?.value.trim() || '',
        estimatedCount: document.getElementById('estimatedCount')?.value.trim() || '',
        examDate: document.getElementById('examDate')?.value || '',
        contactPerson: document.getElementById('contactPerson')?.value.trim() || '',
        contractNote: document.getElementById('contractNote')?.value.trim() || '',
        suDungPAKD: isPakdChecked,
        pakdStatus: isPakdChecked ? 'Có PAKD' : 'Không có PAKD',
        currentStep: 2,
        step2Data: step2Data
    };
    sessionStorage.setItem(`mwk_edit_schedule_draft_${currentId}`, JSON.stringify(draft));
}

function handleFetchPakd() {
    const codeElem = document.getElementById('customerCode');
    let code = codeElem ? codeElem.value.trim() : '';
    if (!code) {
        code = 'KAD019962025';
        if (codeElem) codeElem.value = code;
    }

    const mockPakd = {
        cbkd: 'Nguyễn Văn An',
        maNhanVien: 'NV0042',
        customerName: 'Công ty CP Tập đoàn FPT',
        address: 'Số 10 Phạm Văn Bạch, Dịch Vọng Hậu, Cầu Giấy, Hà Nội',
        estimatedCount: 250,
        examDate: new Date().toISOString().split('T')[0],
        contactPerson: 'Nguyễn Vũ Mạnh Cường',
        contractNote: 'Hợp đồng KSK định kỳ HĐ-2026-089. Bố trí luồng ưu tiên tầng 2.',
        pakdStatus: 'Có PAKD'
    };

    if (document.getElementById('cbkd')) document.getElementById('cbkd').value = mockPakd.cbkd;
    if (document.getElementById('maNhanVien')) document.getElementById('maNhanVien').value = mockPakd.maNhanVien;
    if (document.getElementById('customerName')) document.getElementById('customerName').value = mockPakd.customerName;
    if (document.getElementById('address')) document.getElementById('address').value = mockPakd.address;
    if (document.getElementById('estimatedCount')) document.getElementById('estimatedCount').value = mockPakd.estimatedCount;
    if (document.getElementById('examDate')) document.getElementById('examDate').value = mockPakd.examDate;
    if (document.getElementById('contactPerson')) document.getElementById('contactPerson').value = mockPakd.contactPerson;
    if (document.getElementById('contractNote')) document.getElementById('contractNote').value = mockPakd.contractNote;
    if (document.getElementById('pakdStatus')) document.getElementById('pakdStatus').value = mockPakd.pakdStatus;

    saveCurrentEditDraftToSession();
    populateStep2CustomerCard();

    if (window.showToast) {
        window.showToast(`Đã tự động tải thành công thông tin PAKD cho mã đối tượng ${code}!`, 'success');
    }
}

function bindStep1Events() {
    const inputIds = ['customerCode', 'cbkd', 'maNhanVien', 'customerName', 'address', 'estimatedCount', 'examDate', 'contactPerson', 'contractNote', 'pakdStatus'];
    inputIds.forEach(id => {
        const elem = document.getElementById(id);
        if (elem) {
            elem.addEventListener('input', function() {
                saveCurrentEditDraftToSession();
                populateStep2CustomerCard();
            });
            elem.addEventListener('change', function() {
                saveCurrentEditDraftToSession();
                populateStep2CustomerCard();
            });
        }
    });

    const btnSaveDraft = document.getElementById('btn-step1-save-draft');
    if (btnSaveDraft) {
        btnSaveDraft.addEventListener('click', function() {
            saveDraftStep1();
        });
    }

    const btnNext = document.getElementById('btn-step1-next');
    if (btnNext) {
        btnNext.addEventListener('click', function() {
            if (validateStep1()) {
                saveCurrentEditDraftToSession();
                populateStep2CustomerCard();
                switchToStep(2);
            }
        });
    }
}

function validateStep1() {
    let isValid = true;
    const cbkdElem = document.getElementById('cbkd');
    const maNhanVienElem = document.getElementById('maNhanVien');
    const customerNameElem = document.getElementById('customerName');
    const addressElem = document.getElementById('address');
    const estimatedCountElem = document.getElementById('estimatedCount');
    const examDateElem = document.getElementById('examDate');

    if (cbkdElem) isValid = MWKValidation.validateRequired(cbkdElem, 'Vui lòng nhập tên CBKD.') && isValid;
    if (maNhanVienElem) isValid = MWKValidation.validateRequired(maNhanVienElem, 'Vui lòng nhập mã nhân viên.') && isValid;
    if (customerNameElem) isValid = MWKValidation.validateRequired(customerNameElem, 'Vui lòng nhập tên đơn vị KSK.') && isValid;
    if (addressElem) isValid = MWKValidation.validateRequired(addressElem, 'Vui lòng nhập địa chỉ.') && isValid;
    if (estimatedCountElem) isValid = MWKValidation.validateRequired(estimatedCountElem, 'Vui lòng nhập số lượng khách.') && isValid;
    if (examDateElem) isValid = MWKValidation.validateRequired(examDateElem, 'Vui lòng chọn thời gian khám.') && isValid;

    if (!isValid && window.showToast) {
        window.showToast('Vui lòng điền đầy đủ các trường dữ liệu bắt buộc (*)', 'error');
    }
    return isValid;
}

function populateStep2CustomerCard() {
    const customerNameElem = document.getElementById('customerName');
    const contactPersonElem = document.getElementById('contactPerson');
    const pakdStatusElem = document.getElementById('pakdStatus');

    let customerName = customerNameElem ? customerNameElem.value.trim() : '';
    let contactPerson = contactPersonElem ? contactPersonElem.value.trim() : '';
    let pakdValue = pakdStatusElem ? pakdStatusElem.value : 'Không có PAKD';

    const displayName = customerName || contactPerson || 'Công ty CP Tập đoàn FPT';

    const nameElem = document.getElementById('step2-display-customer-name');
    const badgeElem = document.getElementById('step2-display-pakd-badge');

    if (nameElem) {
        nameElem.innerHTML = `
            ${displayName}
            <i class="fa-solid fa-circle-info text-[#9CA3AF] text-xs hover:text-[#27496D] cursor-pointer" title="Thông tin hợp đồng & Phương án kinh doanh"></i>
        `;
    }

    if (badgeElem) {
        if (pakdValue === 'Có PAKD') {
            badgeElem.className = 'badge-success';
            badgeElem.innerHTML = `<i class="fa-solid fa-circle-check text-[10px]"></i> Có PAKD`;
        } else {
            badgeElem.className = 'badge-warning';
            badgeElem.innerHTML = `<i class="fa-solid fa-circle-info text-[10px]"></i> Không có PAKD`;
        }
    }

    calculateAndDisplayTotalGuests();
}

function calculateAndDisplayTotalGuests() {
    const guestNgoaiVien = step2Data.ngoaiVien.reduce((sum, i) => sum + (i.soLuongKhach || i.guests || 0), 0);
    const guestTaiVien = step2Data.taiVien.reduce((sum, i) => sum + (i.soLuongKhach || i.guests || 0), 0);
    const guestLichPhuong = step2Data.lichPhuong.reduce((sum, i) => sum + (i.soLuongKhach || i.guests || 0), 0);

    const calculatedTotal = guestNgoaiVien + guestTaiVien + guestLichPhuong;

    const initialEstimatedInput = document.getElementById('estimatedCount');
    const initialValue = initialEstimatedInput && initialEstimatedInput.value ? parseInt(initialEstimatedInput.value) : 0;

    const countElem = document.getElementById('step2-display-guest-count');
    if (countElem) {
        countElem.innerText = calculatedTotal > 0 ? calculatedTotal : initialValue;
    }
}

function switchToStep(step) {
    const step1Panel = document.getElementById('step-1-panel');
    const step2Panel = document.getElementById('step-2-panel');
    const stickyBar = document.getElementById('sticky-bottom-action-bar');

    const step1Badge = document.getElementById('step1-badge');
    const step1Title = document.getElementById('step1-title');
    const step2Badge = document.getElementById('step2-badge');
    const step2Title = document.getElementById('step2-title');

    if (step === 1) {
        if (step1Panel) step1Panel.classList.remove('hidden');
        if (step2Panel) step2Panel.classList.add('hidden');
        if (stickyBar) {
            stickyBar.classList.add('hidden');
            stickyBar.classList.remove('flex');
        }

        if (step1Badge) {
            step1Badge.className = 'w-8 h-8 rounded-full bg-[#27496D] text-white font-bold flex items-center justify-center text-xs transition-all';
        }
        if (step1Title) step1Title.className = 'text-[11px] font-bold text-[#27496D] uppercase tracking-wider';

        if (step2Badge) {
            step2Badge.className = 'w-8 h-8 rounded-full bg-[#CBD5E1] text-[#4B5563] font-bold flex items-center justify-center text-xs transition-all';
        }
        if (step2Title) step2Title.className = 'text-[11px] font-bold text-[#9CA3AF] uppercase tracking-wider';

    } else {
        if (step1Panel) step1Panel.classList.add('hidden');
        if (step2Panel) step2Panel.classList.remove('hidden');
        if (stickyBar) {
            stickyBar.classList.remove('hidden');
            stickyBar.classList.add('flex');
        }

        if (step1Badge) {
            step1Badge.className = 'w-8 h-8 rounded-full bg-[#E8F1FB] text-[#27496D] font-bold flex items-center justify-center text-xs transition-all';
        }
        if (step1Title) step1Title.className = 'text-[11px] font-bold text-[#27496D] uppercase tracking-wider';

        if (step2Badge) {
            step2Badge.className = 'w-8 h-8 rounded-full bg-[#27496D] text-white font-bold flex items-center justify-center text-xs transition-all';
        }
        if (step2Title) step2Title.className = 'text-[11px] font-bold text-[#27496D] uppercase tracking-wider';
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function handleStep2ToggleChange() {
    const toggleNgoaiVien = document.getElementById('toggle-ngoai-vien');
    const toggleTaiVien = document.getElementById('toggle-tai-vien');
    const toggleLichPhuong = document.getElementById('toggle-lich-phuong');

    const ngoaiVienOn = toggleNgoaiVien ? toggleNgoaiVien.checked : true;
    const taiVienOn = toggleTaiVien ? toggleTaiVien.checked : true;
    const lichPhuongOn = toggleLichPhuong ? toggleLichPhuong.checked : true;

    const boxNgoaiVien = document.getElementById('box-ngoai-vien');
    const boxTaiVien = document.getElementById('box-tai-vien');
    const boxLichPhuong = document.getElementById('box-lich-phuong');

    if (boxNgoaiVien) boxNgoaiVien.classList.toggle('hidden', !ngoaiVienOn);
    if (boxTaiVien) boxTaiVien.classList.toggle('hidden', !taiVienOn);
    if (boxLichPhuong) boxLichPhuong.classList.toggle('hidden', !lichPhuongOn);

    updateStep2UI();
}

function updateStep2UI() {
    const countNgoaiVien = step2Data.ngoaiVien.length;
    const guestNgoaiVien = step2Data.ngoaiVien.reduce((sum, i) => sum + (i.soLuongKhach || i.guests || 0), 0);
    const staffNgoaiVien = step2Data.ngoaiVien.reduce((sum, i) => sum + (i.tongNhanSu || i.staff || 0), 0);

    const countTaiVien = step2Data.taiVien.length;
    const guestTaiVien = step2Data.taiVien.reduce((sum, i) => sum + (i.soLuongKhach || i.guests || 0), 0);
    const staffTaiVien = step2Data.taiVien.reduce((sum, i) => sum + (i.tongNhanSu || i.staff || 0), 0);

    const countLichPhuong = step2Data.lichPhuong.length;
    const guestLichPhuong = step2Data.lichPhuong.reduce((sum, i) => sum + (i.soLuongKhach || i.guests || 0), 0);
    const staffLichPhuong = step2Data.lichPhuong.reduce((sum, i) => sum + (i.tongNhanSu || i.staff || 0), 0);

    const countNgoaiVienElem = document.getElementById('count-ngoai-vien');
    const guestNgoaiVienElem = document.getElementById('guest-ngoai-vien');
    const staffNgoaiVienElem = document.getElementById('staff-ngoai-vien');

    const countTaiVienElem = document.getElementById('count-tai-vien');
    const guestTaiVienElem = document.getElementById('guest-tai-vien');
    const staffTaiVienElem = document.getElementById('staff-tai-vien');

    const countLichPhuongElem = document.getElementById('count-lich-phuong');
    const guestLichPhuongElem = document.getElementById('guest-lich-phuong');
    const staffLichPhuongElem = document.getElementById('staff-lich-phuong');

    if (countNgoaiVienElem) countNgoaiVienElem.innerText = countNgoaiVien;
    if (guestNgoaiVienElem) guestNgoaiVienElem.innerText = guestNgoaiVien;
    if (staffNgoaiVienElem) staffNgoaiVienElem.innerText = staffNgoaiVien;

    if (countTaiVienElem) countTaiVienElem.innerText = countTaiVien;
    if (guestTaiVienElem) guestTaiVienElem.innerText = guestTaiVien;
    if (staffTaiVienElem) staffTaiVienElem.innerText = staffTaiVien;

    if (countLichPhuongElem) countLichPhuongElem.innerText = countLichPhuong;
    if (guestLichPhuongElem) guestLichPhuongElem.innerText = guestLichPhuong;
    if (staffLichPhuongElem) staffLichPhuongElem.innerText = staffLichPhuong;

    if (countTaiVien > 0) {
        const cbTaiVien = document.getElementById('check-box-tai-vien');
        if (cbTaiVien) cbTaiVien.checked = true;
    }

    renderTaiVienScheduleCards();
    renderNgoaiVienScheduleCards();
    renderLichPhuongScheduleCards();
    updateSummaryStats();
    calculateAndDisplayTotalGuests();
}

function renderNgoaiVienScheduleCards() {
    const container = document.getElementById('container-card-list-ngoai-vien');
    if (!container) return;

    const list = (step2Data && step2Data.ngoaiVien) ? step2Data.ngoaiVien : [];
    if (list.length === 0) {
        container.innerHTML = '';
        return;
    }

    let html = '';
    list.forEach((item) => {
        const guests = item.soLuongKhach || item.guests || 0;
        const staff = item.tongNhanSu || item.staff || 0;
        const facility = item.diaDiemKham || item.facility || 'Ngoại viện';

        let dateFormatted = item.ngayKhamFormatted;
        if (!dateFormatted && item.ngayKham) {
            const p = item.ngayKham.split('-');
            if (p.length === 3) dateFormatted = `${p[2]}/${p[1]}/${p[0]}`;
        }
        if (!dateFormatted) dateFormatted = '23/07/2025';

        let maLich = item.maLich;
        if (!maLich) {
            let shiftCode = 'S';
            if (item.caSang && item.caChieu) shiftCode = 'S,C';
            else if (item.caChieu) shiftCode = 'C';
            const cleanDate = dateFormatted.replace(/\//g, '');
            const codeDate = cleanDate.slice(0, 4) + cleanDate.slice(-2);
            maLich = `${codeDate} - NV - ${shiftCode}`;
        }

        let timeText = '07:30 - 11:00';
        if (item.caSang && item.caChieu) {
            const sangStr = item.gioSang ? `${item.gioSang.batDau} - ${item.gioSang.ketThuc}` : '07:30 - 11:00';
            const chieuStr = item.gioChieu ? `${item.gioChieu.batDau} - ${item.gioChieu.ketThuc}` : '13:30 - 17:30';
            timeText = `<span>${sangStr}</span><span class="ml-4">${chieuStr}</span>`;
        } else if (item.caSang || item.gioSang) {
            const sangStr = item.gioSang ? `${item.gioSang.batDau} - ${item.gioSang.ketThuc}` : '07:30 - 11:00';
            timeText = `<span>${sangStr}</span>`;
        } else if (item.caChieu || item.gioChieu) {
            const chieuStr = item.gioChieu ? `${item.gioChieu.batDau} - ${item.gioChieu.ketThuc}` : '13:30 - 17:30';
            timeText = `<span>${chieuStr}</span>`;
        }

        html += `
            <div class="bg-white border border-[#D9DEE5] rounded-[4px] p-4 space-y-2.5 shadow-2xs text-xs">
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2">
                        <input type="checkbox" checked class="w-4 h-4 text-[#ED6C02] rounded-[2px] border-[#D9DEE5]">
                        <strong class="font-bold text-[#1F2937] text-xs font-mono">${maLich}</strong>
                        ${renderScheduleStatus(item)}
                    </div>
                    <div class="flex items-center gap-1">
                        <a href="../ngoai-vien/edit.html?editId=${currentId}&subId=${item.id}" class="w-6 h-6 rounded-[2px] text-[#27496D] hover:bg-[#E8F1FB] flex items-center justify-center" title="Chỉnh sửa">
                            <i class="fa-solid fa-pen-to-square text-xs"></i>
                        </a>
                        <a href="../ngoai-vien/detail.html?editId=${currentId}&subId=${item.id}" class="w-6 h-6 rounded-[2px] text-[#6B7280] hover:bg-[#F4F5F7] flex items-center justify-center" title="Xem chi tiết">
                            <i class="fa-solid fa-eye text-xs"></i>
                        </a>
                        <button type="button" onclick="deleteSubSchedule('ngoaiVien', '${item.id}')" class="w-6 h-6 rounded-[2px] text-[#D32F2F] hover:bg-[#FEE2E2] flex items-center justify-center" title="Xóa">
                            <i class="fa-solid fa-trash-can text-xs"></i>
                        </button>
                    </div>
                </div>

                <div class="flex items-center gap-2 text-[#4B5563] flex-wrap font-medium">
                    <div class="flex items-center gap-1">
                        <i class="fa-regular fa-calendar text-[#ED6C02] text-xs"></i>
                        <span class="text-[#1F2937] font-semibold">${dateFormatted}</span>
                    </div>
                    <div class="flex items-center gap-1.5 ml-2">
                        <i class="fa-regular fa-clock text-[#ED6C02] text-xs"></i>
                        <span class="text-[#ED6C02] font-bold inline-flex items-center">${timeText}</span>
                    </div>
                </div>

                <div class="flex items-center gap-1.5 text-[#374151] font-medium">
                    <i class="fa-solid fa-location-dot text-[#ED6C02] text-xs"></i>
                    <span>${facility}</span>
                </div>

                <div class="flex items-center gap-4 text-xs font-medium pt-2 border-t border-[#F0F3F7]">
                    <div>Khách <strong class="text-[#1F2937] font-bold ml-1">${guests}</strong></div>
                    <div>Nhân sự <strong class="text-[#ED6C02] font-bold ml-1">${staff}</strong></div>
                </div>
            </div>
        `;
    });
    container.innerHTML = html;
}

function renderLichPhuongScheduleCards() {
    const container = document.getElementById('container-card-list-lich-phuong');
    if (!container) return;

    const list = (step2Data && step2Data.lichPhuong) ? step2Data.lichPhuong : [];
    if (list.length === 0) {
        container.innerHTML = '';
        return;
    }

    let html = '';
    list.forEach((item) => {
        const guests = item.soLuongKhach || item.guests || 0;
        const staff = item.tongNhanSu || item.staff || 0;
        const facility = item.diaDiemKham || item.facility || 'Trạm Y tế Phường';

        let dateFormatted = item.ngayKhamFormatted;
        if (!dateFormatted && item.ngayKham) {
            const p = item.ngayKham.split('-');
            if (p.length === 3) dateFormatted = `${p[2]}/${p[1]}/${p[0]}`;
        }
        if (!dateFormatted) dateFormatted = '23/07/2025';

        let maLich = item.maLich;
        if (!maLich) {
            let shiftCode = 'S';
            if (item.caSang && item.caChieu) shiftCode = 'S,C';
            else if (item.caChieu) shiftCode = 'C';
            const cleanDate = dateFormatted.replace(/\//g, '');
            const codeDate = cleanDate.slice(0, 4) + cleanDate.slice(-2);
            maLich = `${codeDate} - LP - ${shiftCode}`;
        }

        let timeText = '07:30 - 11:00';
        if (item.caSang && item.caChieu) {
            const sangStr = item.gioSang ? `${item.gioSang.batDau} - ${item.gioSang.ketThuc}` : '07:30 - 11:00';
            const chieuStr = item.gioChieu ? `${item.gioChieu.batDau} - ${item.gioChieu.ketThuc}` : '13:30 - 17:30';
            timeText = `<span>${sangStr}</span><span class="ml-4">${chieuStr}</span>`;
        } else if (item.caSang || item.gioSang) {
            const sangStr = item.gioSang ? `${item.gioSang.batDau} - ${item.gioSang.ketThuc}` : '07:30 - 11:00';
            timeText = `<span>${sangStr}</span>`;
        } else if (item.caChieu || item.gioChieu) {
            const chieuStr = item.gioChieu ? `${item.gioChieu.batDau} - ${item.gioChieu.ketThuc}` : '13:30 - 17:30';
            timeText = `<span>${chieuStr}</span>`;
        }

        html += `
            <div class="bg-white border border-[#D9DEE5] rounded-[4px] p-4 space-y-2.5 shadow-2xs text-xs">
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2">
                        <input type="checkbox" checked class="w-4 h-4 text-[#7E22CE] rounded-[2px] border-[#D9DEE5]">
                        <strong class="font-bold text-[#1F2937] text-xs font-mono">${maLich}</strong>
                        ${renderScheduleStatus(item)}
                    </div>
                    <div class="flex items-center gap-1">
                        <a href="../lich-phuong/edit.html?editId=${currentId}&subId=${item.id}" class="w-6 h-6 rounded-[2px] text-[#27496D] hover:bg-[#E8F1FB] flex items-center justify-center" title="Chỉnh sửa">
                            <i class="fa-solid fa-pen-to-square text-xs"></i>
                        </a>
                        <a href="../lich-phuong/detail.html?editId=${currentId}&subId=${item.id}" class="w-6 h-6 rounded-[2px] text-[#6B7280] hover:bg-[#F4F5F7] flex items-center justify-center" title="Xem chi tiết">
                            <i class="fa-solid fa-eye text-xs"></i>
                        </a>
                        <button type="button" onclick="deleteSubSchedule('lichPhuong', '${item.id}')" class="w-6 h-6 rounded-[2px] text-[#D32F2F] hover:bg-[#FEE2E2] flex items-center justify-center" title="Xóa">
                            <i class="fa-solid fa-trash-can text-xs"></i>
                        </button>
                    </div>
                </div>

                <div class="flex items-center gap-2 text-[#4B5563] flex-wrap font-medium">
                    <div class="flex items-center gap-1">
                        <i class="fa-regular fa-calendar text-[#7E22CE] text-xs"></i>
                        <span class="text-[#1F2937] font-semibold">${dateFormatted}</span>
                    </div>
                    <div class="flex items-center gap-1.5 ml-2">
                        <i class="fa-regular fa-clock text-[#7E22CE] text-xs"></i>
                        <span class="text-[#7E22CE] font-bold inline-flex items-center">${timeText}</span>
                    </div>
                </div>

                <div class="flex items-center gap-1.5 text-[#374151] font-medium">
                    <i class="fa-solid fa-location-dot text-[#7E22CE] text-xs"></i>
                    <span>${facility}</span>
                </div>

                <div class="flex items-center gap-4 text-xs font-medium pt-2 border-t border-[#F0F3F7]">
                    <div>Khách <strong class="text-[#1F2937] font-bold ml-1">${guests}</strong></div>
                    <div>Nhân sự <strong class="text-[#7E22CE] font-bold ml-1">${staff}</strong></div>
                </div>
            </div>
        `;
    });
    container.innerHTML = html;
}

function renderTaiVienScheduleCards() {
    const container = document.getElementById('container-card-list-tai-vien');
    if (!container) return;

    const list = (step2Data && step2Data.taiVien) ? step2Data.taiVien : [];
    if (list.length === 0) {
        container.innerHTML = '';
        return;
    }

    let html = '';
    list.forEach((item) => {
        const guests = item.soLuongKhach || item.guests || 0;
        const staff = item.tongNhanSu || item.staff || 0;
        const facility = item.diaDiemKham || item.facility || 'Med Ba Đình';

        let dateFormatted = item.ngayKhamFormatted;
        if (!dateFormatted && item.ngayKham) {
            const p = item.ngayKham.split('-');
            if (p.length === 3) dateFormatted = `${p[2]}/${p[1]}/${p[0]}`;
        }
        if (!dateFormatted) dateFormatted = '23/07/2025';

        let maLich = item.maLich;
        if (!maLich) {
            let shiftCode = 'S';
            if (item.caSang && item.caChieu) shiftCode = 'S,C';
            else if (item.caChieu) shiftCode = 'C';
            const cleanDate = dateFormatted.replace(/\//g, '');
            const codeDate = cleanDate.slice(0, 4) + cleanDate.slice(-2);
            maLich = `${codeDate} - TV - ${shiftCode}`;
        }

        let timeText = '07:30 - 11:00';
        if (item.caSang && item.caChieu) {
            const sangStr = item.gioSang ? `${item.gioSang.batDau} - ${item.gioSang.ketThuc}` : '07:30 - 11:00';
            const chieuStr = item.gioChieu ? `${item.gioChieu.batDau} - ${item.gioChieu.ketThuc}` : '13:30 - 17:30';
            timeText = `<span>${sangStr}</span><span class="ml-4">${chieuStr}</span>`;
        } else if (item.caSang || item.gioSang) {
            const sangStr = item.gioSang ? `${item.gioSang.batDau} - ${item.gioSang.ketThuc}` : '07:30 - 11:00';
            timeText = `<span>${sangStr}</span>`;
        } else if (item.caChieu || item.gioChieu) {
            const chieuStr = item.gioChieu ? `${item.gioChieu.batDau} - ${item.gioChieu.ketThuc}` : '13:30 - 17:30';
            timeText = `<span>${chieuStr}</span>`;
        }

        html += `
            <div class="bg-white border border-[#D9DEE5] rounded-[4px] p-4 space-y-2.5 shadow-2xs text-xs">
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2">
                        <input type="checkbox" checked class="w-4 h-4 text-[#27496D] rounded-[2px] border-[#D9DEE5]">
                        <strong class="font-bold text-[#1F2937] text-xs font-mono">${maLich}</strong>
                        ${renderScheduleStatus(item)}
                    </div>
                    <div class="flex items-center gap-1">
                        <a href="../tai-vien/edit.html?editId=${currentId}&subId=${item.id}" class="w-6 h-6 rounded-[2px] text-[#27496D] hover:bg-[#E8F1FB] flex items-center justify-center" title="Chỉnh sửa">
                            <i class="fa-solid fa-pen-to-square text-xs"></i>
                        </a>
                        <a href="../tai-vien/detail.html?editId=${currentId}&subId=${item.id}" class="w-6 h-6 rounded-[2px] text-[#6B7280] hover:bg-[#F4F5F7] flex items-center justify-center" title="Xem chi tiết">
                            <i class="fa-solid fa-eye text-xs"></i>
                        </a>
                        <button type="button" onclick="deleteSubSchedule('taiVien', '${item.id}')" class="w-6 h-6 rounded-[2px] text-[#D32F2F] hover:bg-[#FEE2E2] flex items-center justify-center" title="Xóa">
                            <i class="fa-solid fa-trash-can text-xs"></i>
                        </button>
                    </div>
                </div>

                <div class="flex items-center gap-2 text-[#4B5563] flex-wrap font-medium">
                    <div class="flex items-center gap-1">
                        <i class="fa-regular fa-calendar text-[#27496D] text-xs"></i>
                        <span class="text-[#1F2937] font-semibold">${dateFormatted}</span>
                    </div>
                    <div class="flex items-center gap-1.5 ml-2">
                        <i class="fa-regular fa-clock text-[#27496D] text-xs"></i>
                        <span class="text-[#27496D] font-bold inline-flex items-center">${timeText}</span>
                    </div>
                </div>

                <div class="flex items-center gap-1.5 text-[#374151] font-medium">
                    <i class="fa-solid fa-location-dot text-[#27496D] text-xs"></i>
                    <span>${facility}</span>
                </div>

                <div class="flex items-center gap-4 text-xs font-medium pt-2 border-t border-[#F0F3F7]">
                    <div>Khách <strong class="text-[#1F2937] font-bold ml-1">${guests}</strong></div>
                    <div>Nhân sự <strong class="text-[#27496D] font-bold ml-1">${staff}</strong></div>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

function deleteSubSchedule(type, subId) {
    if (!step2Data || !step2Data[type]) return;
    if (confirm('Bạn có chắc chắn muốn xóa lịch này không?')) {
        step2Data[type] = step2Data[type].filter(s => String(s.id) !== String(subId));
        updateStep2UI();
        if (window.showToast) window.showToast('Đã xóa lịch!', 'success');
    }
}

function renderTaiVienScheduleCards() {
    const container = document.getElementById('container-card-list-tai-vien');
    if (!container) return;

    const list = (step2Data && step2Data.taiVien) ? step2Data.taiVien : [];
    if (list.length === 0) {
        container.innerHTML = '';
        return;
    }

    let html = '';
    list.forEach((item, idx) => {
        const guests = item.soLuongKhach || item.guests || 0;
        const staff = item.tongNhanSu || item.staff || 0;
        const facility = item.diaDiemKham || item.facility || 'Med Ba Đình';

        let dateFormatted = item.ngayKhamFormatted;
        if (!dateFormatted && item.ngayKham) {
            const p = item.ngayKham.split('-');
            if (p.length === 3) dateFormatted = `${p[2]}/${p[1]}/${p[0]}`;
        }
        if (!dateFormatted) dateFormatted = '23/07/2025';

        let maLich = item.maLich;
        if (!maLich) {
            let shiftCode = 'S';
            if (item.caSang && item.caChieu) shiftCode = 'S,C';
            else if (item.caChieu) shiftCode = 'C';
            const cleanDate = dateFormatted.replace(/\//g, '');
            const codeDate = cleanDate.slice(0, 4) + cleanDate.slice(-2);
            maLich = `${codeDate} - TV - ${shiftCode}`;
        }

        let timeText = '';
        if (item.caSang && item.caChieu) {
            const sangStr = item.gioSang ? `${item.gioSang.batDau} - ${item.gioSang.ketThuc}` : '07:30 - 11:00';
            const chieuStr = item.gioChieu ? `${item.gioChieu.batDau} - ${item.gioChieu.ketThuc}` : '13:30 - 17:30';
            timeText = `<span>${sangStr}</span><span class="ml-4">${chieuStr}</span>`;
        } else if (item.caSang || item.gioSang) {
            const sangStr = item.gioSang ? `${item.gioSang.batDau} - ${item.gioSang.ketThuc}` : '07:30 - 11:00';
            timeText = `<span>${sangStr}</span>`;
        } else if (item.caChieu || item.gioChieu) {
            const chieuStr = item.gioChieu ? `${item.gioChieu.batDau} - ${item.gioChieu.ketThuc}` : '13:30 - 17:30';
            timeText = `<span>${chieuStr}</span>`;
        } else {
            timeText = '<span>07:30 - 11:00</span>';
        }

        html += `
            <div class="bg-white border border-[#D9DEE5] rounded-[4px] p-4 space-y-2.5 shadow-2xs text-xs">
                <!-- Dòng 1: Checkbox + Mã lịch + Badge Tạo mới + Icon 3 chấm -->
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2">
                        <input type="checkbox" checked class="w-4 h-4 text-[#27496D] rounded-[2px] border-[#D9DEE5]">
                        <strong class="font-bold text-[#1F2937] text-xs font-mono">${maLich}</strong>
                    </div>
                    <div class="flex items-center gap-1.5">
                        <span class="badge-success text-[10px] px-2 py-0.5"><i class="fa-solid fa-circle-check text-[9px]"></i> Tạo mới</span>
                        <button type="button" class="w-6 h-6 rounded-[2px] text-[#6B7280] hover:bg-[#F4F5F7] flex items-center justify-center" title="Thao tác khác">
                            <i class="fa-solid fa-ellipsis-vertical text-xs"></i>
                        </button>
                    </div>
                </div>

                <!-- Dòng 2: Icon lịch + Ngày khám + Icon đồng hồ + Khung giờ -->
                <div class="flex items-center gap-2 text-[#4B5563] flex-wrap font-medium">
                    <div class="flex items-center gap-1">
                        <i class="fa-regular fa-calendar text-[#27496D] text-xs"></i>
                        <span class="text-[#1F2937] font-semibold">${dateFormatted}</span>
                    </div>
                    <div class="flex items-center gap-1.5 ml-2">
                        <i class="fa-regular fa-clock text-[#27496D] text-xs"></i>
                        <span class="text-[#27496D] font-bold inline-flex items-center">${timeText}</span>
                    </div>
                </div>

                <!-- Dòng 3: Icon địa điểm + Tên cơ sở -->
                <div class="flex items-center gap-1.5 text-[#374151] font-medium">
                    <i class="fa-solid fa-location-dot text-[#27496D] text-xs"></i>
                    <span>${facility}</span>
                </div>

                <!-- Dòng 4: Khách + Nhân sự -->
                <div class="flex items-center gap-4 text-xs font-medium pt-2 border-t border-[#F0F3F7]">
                    <div>Khách <strong class="text-[#1F2937] font-bold ml-1">${guests}</strong></div>
                    <div>Nhân sự <strong class="text-[#27496D] font-bold ml-1">${staff}</strong></div>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

function updateSummaryStats() {
    const sumNgoaiVien = document.getElementById('summary-ngoai-vien');
    const sumTaiVien = document.getElementById('summary-tai-vien');
    const sumLichPhuong = document.getElementById('summary-lich-phuong');

    const countNgoaiVien = step2Data.ngoaiVien.length;
    const countTaiVien = step2Data.taiVien.length;
    const countLichPhuong = step2Data.lichPhuong.length;

    const cbNgoaiVien = document.getElementById('check-box-ngoai-vien');
    const cbTaiVien = document.getElementById('check-box-tai-vien');
    const cbLichPhuong = document.getElementById('check-box-lich-phuong');

    const isNgoaiVienChecked = cbNgoaiVien ? cbNgoaiVien.checked : false;
    const isTaiVienChecked = cbTaiVien ? cbTaiVien.checked : false;
    const isLichPhuongChecked = cbLichPhuong ? cbLichPhuong.checked : false;

    if (sumNgoaiVien) sumNgoaiVien.innerText = isNgoaiVienChecked ? countNgoaiVien : 0;
    if (sumTaiVien) sumTaiVien.innerText = isTaiVienChecked ? countTaiVien : 0;
    if (sumLichPhuong) sumLichPhuong.innerText = isLichPhuongChecked ? countLichPhuong : 0;

    let guestSum = 0;
    let staffSum = 0;

    if (isNgoaiVienChecked) {
        guestSum += step2Data.ngoaiVien.reduce((s, i) => s + (i.soLuongKhach || i.guests || 0), 0);
        staffSum += step2Data.ngoaiVien.reduce((s, i) => s + (i.tongNhanSu || i.staff || 0), 0);
    }
    if (isTaiVienChecked) {
        guestSum += step2Data.taiVien.reduce((s, i) => s + (i.soLuongKhach || i.guests || 0), 0);
        staffSum += step2Data.taiVien.reduce((s, i) => s + (i.tongNhanSu || i.staff || 0), 0);
    }
    if (isLichPhuongChecked) {
        guestSum += step2Data.lichPhuong.reduce((s, i) => s + (i.soLuongKhach || i.guests || 0), 0);
        staffSum += step2Data.lichPhuong.reduce((s, i) => s + (i.tongNhanSu || i.staff || 0), 0);
    }

    const sumGuestsElem = document.getElementById('summary-total-guests');
    const sumStaffElem = document.getElementById('summary-total-staff');

    if (sumGuestsElem) sumGuestsElem.innerText = guestSum;
    if (sumStaffElem) sumStaffElem.innerText = staffSum;
}

function handleAddSchedule(type) {
    saveCurrentEditDraftToSession();

    const contactPersonElem = document.getElementById('contactPerson');
    const customerNameElem = document.getElementById('customerName');
    const customerCodeElem = document.getElementById('customerCode');
    const estimatedCountElem = document.getElementById('estimatedCount');
    const pakdStatusElem = document.getElementById('pakdStatus');

    let contactPerson = contactPersonElem ? contactPersonElem.value.trim() : '';
    let customerName = customerNameElem ? customerNameElem.value.trim() : '';
    let customerCode = customerCodeElem ? customerCodeElem.value.trim() : '';
    let estimatedCount = estimatedCountElem ? estimatedCountElem.value.trim() : '';
    let pakdStatus = pakdStatusElem ? pakdStatusElem.value : '';

    const draftKey = `mwk_edit_schedule_draft_${currentId}`;
    const draftJson = sessionStorage.getItem(draftKey);
    if (draftJson) {
        try {
            const draft = JSON.parse(draftJson);
            if (!customerName) customerName = draft.customerName;
            if (!contactPerson) contactPerson = draft.contactPerson;
            if (!customerCode) customerCode = draft.customerCode;
            if (!estimatedCount) estimatedCount = draft.estimatedCount;
            if (!pakdStatus) pakdStatus = draft.pakdStatus;
        } catch(e) {}
    }

    const params = new URLSearchParams({
        editId: currentId,
        customerName: customerName || contactPerson || 'Công ty cổ phần ABC',
        contactPerson: contactPerson || customerName || 'Nguyễn Văn An',
        customerCode: customerCode || 'KAD019962025',
        estimatedCount: estimatedCount || '250',
        pakdStatus: pakdStatus || 'Không có PAKD'
    });

    if (type === 'Ngoại viện') {
        window.location.href = '../ngoai-vien/create.html?' + params.toString();
        return;
    } else if (type === 'Tại viện') {
        window.location.href = '../tai-vien/create.html?' + params.toString();
        return;
    } else if (type === 'Lịch phường') {
        window.location.href = '../lich-phuong/create.html?' + params.toString();
        return;
    }
}

function closeAddScheduleModal() {
    const modal = document.getElementById('modal-add-schedule-placeholder');
    if (modal) modal.classList.add('hidden');
}

function confirmMockAddSchedule() {
    const nameElem = document.getElementById('modal-input-name');
    const guestsElem = document.getElementById('modal-input-guests');
    const staffElem = document.getElementById('modal-input-staff');

    const name = nameElem ? (nameElem.value.trim() || 'Lịch khám đợt 1') : 'Lịch khám đợt 1';
    const guests = guestsElem ? (parseInt(guestsElem.value) || 0) : 0;
    const staff = staffElem ? (parseInt(staffElem.value) || 0) : 0;

    const newItem = { name, guests, staff, createdAt: new Date().toISOString() };

    if (currentActiveAddType === 'Ngoại viện') {
        step2Data.ngoaiVien.push(newItem);
        const cb = document.getElementById('check-box-ngoai-vien');
        if (cb) cb.checked = true;
    } else if (currentActiveAddType === 'Tại viện') {
        step2Data.taiVien.push(newItem);
        const cb = document.getElementById('check-box-tai-vien');
        if (cb) cb.checked = true;
    } else if (currentActiveAddType === 'Lịch phường') {
        step2Data.lichPhuong.push(newItem);
        const cb = document.getElementById('check-box-lich-phuong');
        if (cb) cb.checked = true;
    }

    closeAddScheduleModal();
    updateStep2UI();

    if (window.showToast) {
        window.showToast(`Đã thêm thành công 1 ${currentActiveAddType.toLowerCase()} thử nghiệm!`, 'success');
    }
}

function handleSelectAllStep2(checkboxElem) {
    const isChecked = checkboxElem.checked;
    const cbNgoaiVien = document.getElementById('check-box-ngoai-vien');
    const cbTaiVien = document.getElementById('check-box-tai-vien');
    const cbLichPhuong = document.getElementById('check-box-lich-phuong');

    if (cbNgoaiVien) cbNgoaiVien.checked = isChecked;
    if (cbTaiVien) cbTaiVien.checked = isChecked;
    if (cbLichPhuong) cbLichPhuong.checked = isChecked;

    updateSummaryStats();
}

function computeMasterUnitRecord(statusStr, trangThaiStr, daGuiBool) {
    const contactPersonElem = document.getElementById('contactPerson');
    const customerNameElem = document.getElementById('customerName');
    const pakdStatusElem = document.getElementById('pakdStatus');
    const customerCodeElem = document.getElementById('customerCode');
    const estimatedCountElem = document.getElementById('estimatedCount');

    const contactPerson = contactPersonElem ? contactPersonElem.value.trim() : '';
    const customerName = customerNameElem ? customerNameElem.value.trim() : '';
    const pakdValue = pakdStatusElem ? pakdStatusElem.value : 'Không có PAKD';
    const customerCode = customerCodeElem ? customerCodeElem.value.trim() : '';
    const initialEstimatedCount = estimatedCountElem ? (parseInt(estimatedCountElem.value) || 0) : 0;

    const unitName = customerName || contactPerson || 'Đơn vị mới';

    const ngoaiVienList = step2Data.ngoaiVien || [];
    const taiVienList = step2Data.taiVien || [];
    const lichPhuongList = step2Data.lichPhuong || [];

    const countNgoaiVien = ngoaiVienList.length;
    const countTaiVien = taiVienList.length;
    const countLichPhuong = lichPhuongList.length;

    const totalSubSchedules = countNgoaiVien + countTaiVien + countLichPhuong;

    let breakdownParts = [];
    if (countNgoaiVien > 0) breakdownParts.push(`${countNgoaiVien} Ngoại viện`);
    if (countTaiVien > 0) breakdownParts.push(`${countTaiVien} Tại viện`);
    if (countLichPhuong > 0) breakdownParts.push(`${countLichPhuong} Lịch phường`);

    let tongSoLichText = '';
    if (totalSubSchedules > 0) {
        tongSoLichText = `${totalSubSchedules} (${breakdownParts.join('; ')})`;
    } else {
        tongSoLichText = '0 lịch';
    }

    let loaiLichTypes = [];
    if (countNgoaiVien > 0) loaiLichTypes.push('Lịch ngoại viện');
    if (countTaiVien > 0) loaiLichTypes.push('Lịch tại viện');
    if (countLichPhuong > 0) loaiLichTypes.push('Lịch phường');

    if (loaiLichTypes.length === 0) loaiLichTypes.push('Lịch tại viện');

    const guestNgoaiVien = ngoaiVienList.reduce((sum, i) => sum + (i.soLuongKhach || i.guests || 0), 0);
    const guestTaiVien = taiVienList.reduce((sum, i) => sum + (i.soLuongKhach || i.guests || 0), 0);
    const guestLichPhuong = lichPhuongList.reduce((sum, i) => sum + (i.soLuongKhach || i.guests || 0), 0);

    const staffNgoaiVien = ngoaiVienList.reduce((sum, i) => sum + (i.tongNhanSu || i.staff || 0), 0);
    const staffTaiVien = taiVienList.reduce((sum, i) => sum + (i.tongNhanSu || i.staff || 0), 0);
    const staffLichPhuong = lichPhuongList.reduce((sum, i) => sum + (i.tongNhanSu || i.staff || 0), 0);

    const totalGuests = (guestNgoaiVien + guestTaiVien + guestLichPhuong) || initialEstimatedCount || 0;
    const totalStaff = staffNgoaiVien + staffTaiVien + staffLichPhuong;

    let primaryFacility = 'Medlatec Ba Đình';
    if (taiVienList.length > 0 && taiVienList[0].diaDiemKham) {
        primaryFacility = taiVienList[0].diaDiemKham;
    }

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')} - ${String(now.getDate()).padStart(2,'0')}/${String(now.getMonth()+1).padStart(2,'0')}/${now.getFullYear()}`;

    const existingHistory = currentItem && currentItem.history ? [...currentItem.history] : [];
    existingHistory.unshift({
        actor: 'Nguyễn Văn An (Cán bộ lập lịch)',
        timestamp: timeStr,
        action: 'Cập nhật thông tin lịch KSK',
        details: 'Cập nhật thông tin chi tiết đợt khám và danh sách các lịch KSK.'
    });

    return {
        ...currentItem,
        teamName: unitName,
        customerName: unitName,
        contactPerson: contactPerson || unitName,
        customerCode: customerCode,
        tenDonVi: unitName,
        maDoiTuong: customerCode,
        scheduleForm: 'Lịch tuần',
        loaiLich: loaiLichTypes.join(', '),
        loaiLichTypes: loaiLichTypes,
        tongSoLich: tongSoLichText,
        tongSoLichCount: totalSubSchedules,
        estimatedCount: totalGuests,
        soLuong: totalGuests,
        tongNhanSu: totalStaff,
        facility: primaryFacility,
        personInCharge: 'Nguyễn Văn An',
        status: statusStr,
        trangThai: trangThaiStr,
        daGuiTongHop: daGuiBool,
        suDungPAKD: document.getElementById('suDungPAKD')?.checked ?? (pakdValue === 'Có PAKD'),
        pakdStatus: pakdValue,
        phuongAnKinhDoanh: pakdValue,
        step2Data: JSON.parse(JSON.stringify(step2Data)),
        history: existingHistory,
        updatedAt: new Date().toISOString()
    };
}

function handleSubmitTongHopStep2() {
    const updatedItem = computeMasterUnitRecord('Chờ tổng hợp', 'CHO_TONG_HOP', true);
    updatedItem.ngayGuiTongHop = new Date().toISOString();

    MWKDataStore.updateKskSchedule(currentId, updatedItem);
    sessionStorage.removeItem(`mwk_edit_schedule_draft_${currentId}`);

    if (window.showToast) {
        window.showToast(`Đã cập nhật và gửi tổng hợp lịch khám KSK thành công!`, 'success');
    }

    setTimeout(() => {
        window.location.href = '../index.html';
    }, 600);
}

function saveDraftStep2() {
    const draftItem = computeMasterUnitRecord('Nháp', 'NHAP', false);

    MWKDataStore.updateKskSchedule(currentId, draftItem);
    sessionStorage.removeItem(`mwk_edit_schedule_draft_${currentId}`);

    if (window.showToast) {
        window.showToast('Đã lưu nháp thông tin cập nhật lịch KSK thành công!', 'success');
    }

    setTimeout(() => {
        window.location.href = '../index.html';
    }, 500);
}

function saveDraftStep1() {
    if (!validateStep1()) return;
    saveDraftStep2();
}

function handleXemDinhMuc(tabName) {
    currentDinhMucModalTab = tabName;
    openDinhMucModal(tabName);
}

function openDinhMucModal(tabName) {
    const modal = document.getElementById('modal-dinh-muc');
    if (modal) modal.classList.remove('hidden');
}

function closeDinhMucModal() {
    const modal = document.getElementById('modal-dinh-muc');
    if (modal) modal.classList.add('hidden');
}

function openHistoryDrawer() {
    const drawer = document.getElementById('history-drawer');
    const backdrop = document.getElementById('history-drawer-backdrop');
    const container = document.getElementById('history-timeline-container');
    const codeElem = document.getElementById('drawer-schedule-code');

    if (codeElem) codeElem.innerText = currentItem ? (currentItem.code || `LK-2026-${currentItem.id}`) : '';
    if (container) container.innerHTML = '';

    const historyList = MWKDataStore.getKskScheduleHistory(currentId);
    const countElem = document.getElementById('history-item-count');
    if (countElem) countElem.innerText = `Tổng số ${historyList.length} lượt tác động / cập nhật`;

    if (historyList.length === 0) {
        container.innerHTML = `
            <div class="text-center py-10 text-[#9CA3AF]">
                <i class="fa-solid fa-clock-rotate-left text-3xl mb-2 text-[#CBD5E1]"></i>
                <p class="text-xs">Chưa có lịch sử thay đổi nào được ghi nhận</p>
            </div>
        `;
    } else {
        historyList.forEach((h, index) => {
            const isFirst = index === 0;
            let displayTime = h.timestamp || '';
            
            let changesHtml = '';
            if (Array.isArray(h.changes) && h.changes.length > 0) {
                changesHtml = `
                    <div class="mt-2 pt-2 border-t border-[#F0F3F7] space-y-1 text-[11px]">
                        ${h.changes.map(c => `
                            <div class="flex items-center gap-1.5 text-[#4B5563]">
                                <span class="font-semibold text-[#1F2937]">${c.field}:</span>
                                <span class="line-through text-[#9CA3AF]">${c.oldVal}</span>
                                <i class="fa-solid fa-arrow-right text-[9px] text-[#27496D]"></i>
                                <span class="font-bold text-[#27496D]">${c.newVal}</span>
                            </div>
                        `).join('')}
                    </div>
                `;
            }

            const itemHtml = `
                <div class="relative pl-6 pb-4 border-l-2 ${isFirst ? 'border-[#27496D]' : 'border-[#D9DEE5]'} last:border-l-0 last:pb-0">
                    <div class="absolute -left-[9px] top-0 w-4 h-4 rounded-full ${isFirst ? 'bg-[#27496D] ring-4 ring-[#E8F1FB]' : 'bg-[#9CA3AF]'} flex items-center justify-center text-white text-[8px]">
                        <i class="fa-solid ${isFirst ? 'fa-check' : 'fa-circle'}"></i>
                    </div>
                    <div class="bg-white p-3.5 rounded-[4px] border border-[#D9DEE5] space-y-1.5 shadow-2xs">
                        <div class="flex items-center justify-between text-xs">
                            <span class="font-bold text-[#1F2937]">${h.action || 'Tác động hệ thống'}</span>
                            <span class="text-[11px] text-[#6B7280] font-mono">${displayTime}</span>
                        </div>
                        <p class="text-xs text-[#374151] font-medium">${h.details || 'Thay đổi thông tin lịch KSK'}</p>
                        ${changesHtml}
                        <div class="text-[11px] text-[#6B7280] pt-1.5 flex items-center gap-1">
                            <i class="fa-solid fa-user-gear text-[10px] text-[#27496D]"></i>
                            <span>Thực hiện bởi: <strong class="text-[#1F2937] font-semibold">${h.actor || h.user || 'Nguyễn Văn An (Cán bộ lập lịch)'}</strong></span>
                        </div>
                    </div>
                </div>
            `;
            container.innerHTML += itemHtml;
        });
    }

    if (backdrop) {
        backdrop.classList.remove('pointer-events-none', 'opacity-0');
        backdrop.classList.add('opacity-100');
    }
    if (drawer) {
        drawer.classList.remove('translate-x-full');
    }
}

function closeHistoryDrawer() {
    const drawer = document.getElementById('history-drawer');
    const backdrop = document.getElementById('history-drawer-backdrop');

    if (backdrop) {
        backdrop.classList.remove('opacity-100');
        backdrop.classList.add('opacity-0', 'pointer-events-none');
    }
    if (drawer) {
        drawer.classList.add('translate-x-full');
    }
}
