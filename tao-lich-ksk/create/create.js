/**
 * MWK - TẠO MỚI LỊCH KSK | CREATE MODULE LOGIC
 */
let step2Data = {
    ngoaiVien: [],
    taiVien: [],
    lichPhuong: []
};

let currentActiveAddType = 'Ngoại viện';
let currentDinhMucModalTab = 'Ngoại viện';

function initCreateModule() {
    bindStep1Events();
    handleStep2ToggleChange();
    loadExistingScheduleFromUrl();
    loadDraftStateFromSession();
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

    saveCurrentDraftToSession();
    populateStep2CustomerCard();
}

function loadDraftStateFromSession() {
    const urlParams = new URLSearchParams(window.location.search);
    const isStep2 = urlParams.get('step') === '2';
    const draftJson = sessionStorage.getItem('mwk_create_schedule_draft');
    
    if (isStep2 && draftJson) {
        try {
            const draft = JSON.parse(draftJson);
            if (draft.customerCode && document.getElementById('customerCode')) document.getElementById('customerCode').value = draft.customerCode;
            if (draft.cbkd && document.getElementById('cbkd')) document.getElementById('cbkd').value = draft.cbkd;
            if (draft.maNhanVien && document.getElementById('maNhanVien')) document.getElementById('maNhanVien').value = draft.maNhanVien;
            if (draft.customerName && document.getElementById('customerName')) document.getElementById('customerName').value = draft.customerName;
            if (draft.customerType && document.getElementById('customerType')) document.getElementById('customerType').value = draft.customerType;
            if (draft.address && document.getElementById('address')) document.getElementById('address').value = draft.address;
            if (draft.estimatedCount && document.getElementById('estimatedCount')) document.getElementById('estimatedCount').value = draft.estimatedCount;
            if (draft.examDate && document.getElementById('examDate')) document.getElementById('examDate').value = draft.examDate;
            if (draft.contactPerson && document.getElementById('contactPerson')) document.getElementById('contactPerson').value = draft.contactPerson;
            if (draft.contractNote && document.getElementById('contractNote')) document.getElementById('contractNote').value = draft.contractNote;
            if (draft.pakdStatus && document.getElementById('pakdStatus')) document.getElementById('pakdStatus').value = draft.pakdStatus;

            const suDungCb = document.getElementById('suDungPAKD');
            if (suDungCb) {
                const isPakd = draft.suDungPAKD !== undefined ? draft.suDungPAKD : (draft.pakdStatus === 'Có PAKD');
                suDungCb.checked = isPakd;
                handleSuDungPAKDToggle(isPakd);
            }

            if (draft.step2Data) {
                step2Data = draft.step2Data;
                
                const cbNgoaiVien = document.getElementById('check-box-ngoai-vien');
                const cbTaiVien = document.getElementById('check-box-tai-vien');
                const cbLichPhuong = document.getElementById('check-box-lich-phuong');
                
                if (cbNgoaiVien && step2Data.ngoaiVien && step2Data.ngoaiVien.length > 0) cbNgoaiVien.checked = true;
                if (cbTaiVien && step2Data.taiVien && step2Data.taiVien.length > 0) cbTaiVien.checked = true;
                if (cbLichPhuong && step2Data.lichPhuong && step2Data.lichPhuong.length > 0) cbLichPhuong.checked = true;
            }

            switchToStep(2);
        } catch (e) {
            console.error('Lỗi khôi phục draft state:', e);
            switchToStep(1);
        }
    } else {
        sessionStorage.removeItem('mwk_create_schedule_draft');
        step2Data = { ngoaiVien: [], taiVien: [], lichPhuong: [] };
        switchToStep(1);
    }
}

function saveCurrentDraftToSession() {
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
    sessionStorage.setItem('mwk_create_schedule_draft', JSON.stringify(draft));
}

function loadExistingScheduleFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    const itemId = urlParams.get('id');
    if (!itemId) return;

    const schedules = MWKDataStore.getKskSchedules();
    const item = schedules.find(s => s.id == itemId || s.code == itemId || s.maLich == itemId);
    if (!item) return;

    if (item.customerCode && document.getElementById('customerCode')) document.getElementById('customerCode').value = item.customerCode;
    if (item.cbkd && document.getElementById('cbkd')) document.getElementById('cbkd').value = item.cbkd;
    if (item.maNhanVien && document.getElementById('maNhanVien')) document.getElementById('maNhanVien').value = item.maNhanVien;
    if ((item.customerName || item.teamName) && document.getElementById('customerName')) document.getElementById('customerName').value = item.customerName || item.teamName;
    if (item.customerType && document.getElementById('customerType')) document.getElementById('customerType').value = item.customerType;
    if ((item.address || item.examLocation) && document.getElementById('address')) document.getElementById('address').value = item.address || item.examLocation;
    if ((item.estimatedCount || item.soLuong) && document.getElementById('estimatedCount')) document.getElementById('estimatedCount').value = item.estimatedCount || item.soLuong;
    if (item.examDate && document.getElementById('examDate')) document.getElementById('examDate').value = item.examDate;
    if (item.contactPerson && document.getElementById('contactPerson')) document.getElementById('contactPerson').value = item.contactPerson;
    if ((item.contractNote || item.generalNote) && document.getElementById('contractNote')) document.getElementById('contractNote').value = item.contractNote || item.generalNote;
    if ((item.pakdStatus || item.phuongAnKinhDoanh) && document.getElementById('pakdStatus')) document.getElementById('pakdStatus').value = item.pakdStatus || item.phuongAnKinhDoanh;

    const suDungCb = document.getElementById('suDungPAKD');
    if (suDungCb) {
        const isPakd = item.suDungPAKD !== undefined ? item.suDungPAKD : (item.pakdStatus === 'Có PAKD');
        suDungCb.checked = isPakd;
        handleSuDungPAKDToggle(isPakd);
    }
}

function handleFetchPakd() {
    const suDungCb = document.getElementById('suDungPAKD');
    if (suDungCb) suDungCb.checked = true;
    handleSuDungPAKDToggle(true);

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

    saveCurrentDraftToSession();
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
                saveCurrentDraftToSession();
                populateStep2CustomerCard();
            });
            elem.addEventListener('change', function() {
                saveCurrentDraftToSession();
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
                saveCurrentDraftToSession();
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
    const guestNgoaiVien = step2Data.ngoaiVien.reduce((sum, i) => sum + (i.guests || 0), 0);
    const guestTaiVien = step2Data.taiVien.reduce((sum, i) => sum + (i.guests || 0), 0);
    const guestLichPhuong = step2Data.lichPhuong.reduce((sum, i) => sum + (i.guests || 0), 0);

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

    if (step === 1) {
        if (step1Panel) step1Panel.classList.remove('hidden');
        if (step2Panel) step2Panel.classList.add('hidden');
        if (stickyBar) {
            stickyBar.classList.add('hidden');
            stickyBar.classList.remove('flex');
        }
    } else {
        if (step1Panel) step1Panel.classList.add('hidden');
        if (step2Panel) step2Panel.classList.remove('hidden');
        if (stickyBar) {
            stickyBar.classList.remove('hidden');
            stickyBar.classList.add('flex');
        }
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

    if (boxNgoaiVien) {
        if (ngoaiVienOn) boxNgoaiVien.classList.remove('hidden');
        else boxNgoaiVien.classList.add('hidden');
    }

    if (boxTaiVien) {
        if (taiVienOn) boxTaiVien.classList.remove('hidden');
        else boxTaiVien.classList.add('hidden');
    }

    if (boxLichPhuong) {
        if (lichPhuongOn) boxLichPhuong.classList.remove('hidden');
        else boxLichPhuong.classList.add('hidden');
    }

    updateStep2UI();
}

function updateStep2UI() {
    const countNgoaiVien = step2Data.ngoaiVien.length;
    const guestNgoaiVien = step2Data.ngoaiVien.reduce((sum, i) => sum + (i.guests || 0), 0);
    const staffNgoaiVien = step2Data.ngoaiVien.reduce((sum, i) => sum + (i.staff || 0), 0);

    const countTaiVien = step2Data.taiVien.length;
    const guestTaiVien = step2Data.taiVien.reduce((sum, i) => sum + (i.soLuongKhach || i.guests || 0), 0);
    const staffTaiVien = step2Data.taiVien.reduce((sum, i) => sum + (i.tongNhanSu || i.staff || 0), 0);

    const countLichPhuong = step2Data.lichPhuong.length;
    const guestLichPhuong = step2Data.lichPhuong.reduce((sum, i) => sum + (i.guests || 0), 0);
    const staffLichPhuong = step2Data.lichPhuong.reduce((sum, i) => sum + (i.staff || 0), 0);

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

    if (countNgoaiVien > 0) {
        const cbNgoaiVien = document.getElementById('check-box-ngoai-vien');
        if (cbNgoaiVien) cbNgoaiVien.checked = true;
    }
    if (countTaiVien > 0) {
        const cbTaiVien = document.getElementById('check-box-tai-vien');
        if (cbTaiVien) cbTaiVien.checked = true;
    }
    if (countLichPhuong > 0) {
        const cbLichPhuong = document.getElementById('check-box-lich-phuong');
        if (cbLichPhuong) cbLichPhuong.checked = true;
    }

    renderNgoaiVienScheduleCards();
    renderTaiVienScheduleCards();
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
    list.forEach((item, idx) => {
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
                        <a href="../ngoai-vien/edit.html?subId=${item.id}&subIndex=${idx}" class="w-6 h-6 rounded-[2px] text-[#27496D] hover:bg-[#E8F1FB] flex items-center justify-center" title="Chỉnh sửa">
                            <i class="fa-solid fa-pen-to-square text-xs"></i>
                        </a>
                        <a href="../ngoai-vien/detail.html?subId=${item.id}&subIndex=${idx}" class="w-6 h-6 rounded-[2px] text-[#6B7280] hover:bg-[#F4F5F7] flex items-center justify-center" title="Xem chi tiết">
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
                        <a href="../tai-vien/edit.html?subId=${item.id}&subIndex=${idx}" class="w-6 h-6 rounded-[2px] text-[#27496D] hover:bg-[#E8F1FB] flex items-center justify-center" title="Chỉnh sửa">
                            <i class="fa-solid fa-pen-to-square text-xs"></i>
                        </a>
                        <a href="../tai-vien/detail.html?subId=${item.id}&subIndex=${idx}" class="w-6 h-6 rounded-[2px] text-[#6B7280] hover:bg-[#F4F5F7] flex items-center justify-center" title="Xem chi tiết">
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

function renderLichPhuongScheduleCards() {
    const container = document.getElementById('container-card-list-lich-phuong');
    if (!container) return;

    const list = (step2Data && step2Data.lichPhuong) ? step2Data.lichPhuong : [];
    if (list.length === 0) {
        container.innerHTML = '';
        return;
    }

    let html = '';
    list.forEach((item, idx) => {
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
                        <a href="../lich-phuong/edit.html?subId=${item.id}&subIndex=${idx}" class="w-6 h-6 rounded-[2px] text-[#27496D] hover:bg-[#E8F1FB] flex items-center justify-center" title="Chỉnh sửa">
                            <i class="fa-solid fa-pen-to-square text-xs"></i>
                        </a>
                        <a href="../lich-phuong/detail.html?subId=${item.id}&subIndex=${idx}" class="w-6 h-6 rounded-[2px] text-[#6B7280] hover:bg-[#F4F5F7] flex items-center justify-center" title="Xem chi tiết">
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

function deleteSubSchedule(type, subId) {
    if (!step2Data || !step2Data[type]) return;
    if (confirm('Bạn có chắc chắn muốn xóa lịch này không?')) {
        step2Data[type] = step2Data[type].filter(s => String(s.id) !== String(subId) && String(s.scheduleId) !== String(subId));
        saveCurrentDraftToSession();
        updateStep2UI();
        if (window.showToast) window.showToast('Đã xóa lịch!', 'success');
    }
}

function updateSummaryStats() {
    const sumNgoaiVien = document.getElementById('summary-ngoai-vien');
    const sumTaiVien = document.getElementById('summary-tai-vien');
    const sumLichPhuong = document.getElementById('summary-lich-phuong');

    if (sumNgoaiVien) sumNgoaiVien.innerText = step2Data.ngoaiVien.length;
    if (sumTaiVien) sumTaiVien.innerText = step2Data.taiVien.length;
    if (sumLichPhuong) sumLichPhuong.innerText = step2Data.lichPhuong.length;
}

function handleXemDinhMuc(type) {
    currentDinhMucModalTab = type || 'Ngoại viện';
    const modal = document.getElementById('modal-view-dinh-muc');
    if (!modal) return;
    
    switchDinhMucModalTab(currentDinhMucModalTab);
    modal.classList.remove('hidden');
}

function closeDinhMucModal() {
    const modal = document.getElementById('modal-view-dinh-muc');
    if (modal) modal.classList.add('hidden');
}

function switchDinhMucModalTab(tabName) {
    currentDinhMucModalTab = tabName;
    
    const tabs = [
        { id: 'tab-btn-ngoai-vien', name: 'Ngoại viện' },
        { id: 'tab-btn-tai-vien', name: 'Tại viện' },
        { id: 'tab-btn-lich-phuong', name: 'Lịch phường' }
    ];

    tabs.forEach(t => {
        const btn = document.getElementById(t.id);
        if (!btn) return;
        if (t.name === tabName) {
            btn.className = 'h-full px-1 text-xs font-bold border-b-2 border-[#27496D] text-[#27496D] transition-colors flex items-center gap-1.5 cursor-pointer';
        } else {
            btn.className = 'h-full px-1 text-xs font-medium text-[#6B7280] hover:text-[#1F2937] border-b-2 border-transparent transition-colors flex items-center gap-1.5 cursor-pointer';
        }
    });

    renderDinhMucTabContent(tabName);
}

function renderDinhMucTabContent(tabName) {
    const container = document.getElementById('dinh-muc-modal-content');
    if (!container) return;

    if (tabName === 'Ngoại viện') {
        const ngoaiVienQuotas = MWKDataStore.getQuotaByTab('ngoai-vien');

        let html = `
            <div class="space-y-4">
                <div class="bg-[#F4F5F7] p-3.5 rounded-[4px] border border-[#D9DEE5] space-y-2.5">
                    <div class="flex items-center justify-between">
                        <h4 class="font-bold text-[#1F2937] text-xs uppercase flex items-center gap-1.5">
                            <i class="fa-solid fa-truck-medical text-[#27496D]"></i> Định mức bố trí nhân sự theo quy mô đoàn (Ngoại viện)
                        </h4>
                        <span class="text-[11px] text-[#6B7280]">Tỷ lệ tiêu chuẩn BS/ĐD/KTV</span>
                    </div>

                    <div class="overflow-x-auto rounded-[4px] border border-[#D9DEE5] bg-white">
                        <table class="table-his">
                            <thead>
                                <tr>
                                    <th class="p-2.5">Quy mô đoàn</th>
                                    <th class="p-2.5">Vị trí nhân sự</th>
                                    <th class="p-2.5 text-center">Tối thiểu</th>
                                    <th class="p-2.5 text-center">Tối đa</th>
                                    <th class="p-2.5">Tỷ lệ phục vụ</th>
                                    <th class="p-2.5">Ghi chú vận hành</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-[#E6EAF0]">
        `;

        if (ngoaiVienQuotas && ngoaiVienQuotas.length > 0) {
            ngoaiVienQuotas.forEach(item => {
                html += `
                    <tr class="hover:bg-[#F7F9FC] transition-colors">
                        <td class="p-2.5 font-bold text-[#1F2937]">${item.teamScale || 'Đoàn ngoại viện'}</td>
                        <td class="p-2.5 font-medium text-[#27496D]">${item.position || '-'}</td>
                        <td class="p-2.5 text-center font-bold text-[#1F2937]">${item.minStaff || 1}</td>
                        <td class="p-2.5 text-center font-bold text-[#1F2937]">${item.maxStaff || 2}</td>
                        <td class="p-2.5"><span class="badge-success">${item.doctorToPatientRatio || '-'}</span></td>
                        <td class="p-2.5 text-[#6B7280]">${item.note || ''}</td>
                    </tr>
                `;
            });
        } else {
            html += `<tr><td colspan="6" class="p-4 text-center text-[#9CA3AF]">Chưa có dữ liệu cấu hình định mức đoàn ngoại viện</td></tr>`;
        }

        html += `
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
        container.innerHTML = html;

    } else if (tabName === 'Tại viện') {
        const chuyenKhoaQuotas = MWKDataStore.getQuotaByTab('chuyen-khoa');

        let html = `
            <div class="space-y-4">
                <div class="bg-[#F4F5F7] p-3.5 rounded-[4px] border border-[#D9DEE5] space-y-2.5">
                    <div class="flex items-center justify-between">
                        <h4 class="font-bold text-[#1F2937] text-xs uppercase flex items-center gap-1.5">
                            <i class="fa-solid fa-hospital text-[#2E7D32]"></i> Công suất tiếp nhận tối đa tại các cơ sở bệnh viện / phòng khám
                        </h4>
                        <span class="text-[11px] text-[#6B7280]">Giới hạn nhận đoàn ghép</span>
                    </div>

                    <div class="overflow-x-auto rounded-[4px] border border-[#D9DEE5] bg-white">
                        <table class="table-his">
                            <thead>
                                <tr>
                                    <th class="p-2.5">Tiêu chí / Khoa phòng</th>
                                    <th class="p-2.5 text-center">Tây Hồ</th>
                                    <th class="p-2.5 text-center">Ba Đình</th>
                                    <th class="p-2.5 text-center">Cầu Giấy</th>
                                    <th class="p-2.5 text-center">Thanh Xuân</th>
                                    <th class="p-2.5 text-center">Vĩnh Phúc</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-[#E6EAF0]">
                                <tr>
                                    <td class="p-2.5 font-bold text-[#1F2937]">Công suất tổng (Full ca)</td>
                                    <td class="p-2.5 text-center font-bold text-[#27496D]">500 - 600</td>
                                    <td class="p-2.5 text-center font-bold text-[#27496D]">240</td>
                                    <td class="p-2.5 text-center font-bold text-[#27496D]">240</td>
                                    <td class="p-2.5 text-center font-bold text-[#27496D]">240</td>
                                    <td class="p-2.5 text-center font-bold text-[#27496D]">120</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
        container.innerHTML = html;

    } else if (tabName === 'Lịch phường') {
        const kiemNhiemQuotas = MWKDataStore.getQuotaByTab('kiem-nhiem');

        let html = `
            <div class="space-y-4">
                <div class="bg-[#F4F5F7] p-3.5 rounded-[4px] border border-[#D9DEE5] space-y-2.5">
                    <div class="flex items-center justify-between">
                        <h4 class="font-bold text-[#1F2937] text-xs uppercase flex items-center gap-1.5">
                            <i class="fa-solid fa-building-flag text-[#7E22CE]"></i> Định mức kiêm nhiệm & Cán bộ phụ trách Lịch phường
                        </h4>
                    </div>

                    <div class="overflow-x-auto rounded-[4px] border border-[#D9DEE5] bg-white">
                        <table class="table-his">
                            <thead>
                                <tr>
                                    <th class="p-2.5">Vị trí kiêm nhiệm</th>
                                    <th class="p-2.5">Vị trí chính</th>
                                    <th class="p-2.5 text-center">Số ca tối đa/tuần</th>
                                    <th class="p-2.5">Phụ cấp kiêm nhiệm</th>
                                    <th class="p-2.5">Ghi chú</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-[#E6EAF0]">
        `;

        if (kiemNhiemQuotas && kiemNhiemQuotas.length > 0) {
            kiemNhiemQuotas.forEach(k => {
                html += `
                    <tr class="hover:bg-[#F7F9FC] transition-colors">
                        <td class="p-2.5 font-bold text-[#7E22CE]">${k.dualPosition || '-'}</td>
                        <td class="p-2.5 text-[#1F2937] font-medium">${k.primaryPosition || '-'}</td>
                        <td class="p-2.5 text-center font-bold text-[#1F2937]">${k.maxShiftsPerWeek || '-'} ca</td>
                        <td class="p-2.5 font-semibold text-[#2E7D32]">${k.dualAllowance || '-'}</td>
                        <td class="p-2.5 text-[#6B7280]">${k.note || ''}</td>
                    </tr>
                `;
            });
        } else {
            html += `<tr><td colspan="5" class="p-4 text-center text-[#9CA3AF]">Chưa có dữ liệu kiêm nhiệm Lịch phường</td></tr>`;
        }

        html += `
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
        container.innerHTML = html;
    }
}

function handleAddSchedule(type) {
    saveCurrentDraftToSession();

    const contactPersonElem = document.getElementById('contactPerson');
    const customerNameElem = document.getElementById('customerName');
    const customerCodeElem = document.getElementById('customerCode');
    const estimatedCountElem = document.getElementById('estimatedCount');
    const pakdStatusElem = document.getElementById('pakdStatus');

    const contactPerson = contactPersonElem ? contactPersonElem.value.trim() : '';
    const customerName = customerNameElem ? customerNameElem.value.trim() : '';
    const customerCode = customerCodeElem ? customerCodeElem.value.trim() : '';
    const estimatedCount = estimatedCountElem ? estimatedCountElem.value.trim() : '';
    const pakdStatus = pakdStatusElem ? pakdStatusElem.value : '';

    const params = new URLSearchParams({
        customerName: customerName || contactPerson || 'Công ty CP Tập đoàn FPT',
        contactPerson: contactPerson || 'Nguyễn Vũ Mạnh Cường',
        customerCode: customerCode || 'KAD019962025',
        estimatedCount: estimatedCount || '180',
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

function handleDeleteCustomerCard() {
    if (confirm('Bạn có chắc chắn muốn xóa thông tin khách hàng này không?')) {
        if (document.getElementById('contactPerson')) document.getElementById('contactPerson').value = '';
        if (document.getElementById('customerName')) document.getElementById('customerName').value = '';
        if (document.getElementById('contactPhone')) document.getElementById('contactPhone').value = '';
        if (document.getElementById('contactEmail')) document.getElementById('contactEmail').value = '';
        if (document.getElementById('customerCode')) document.getElementById('customerCode').value = '';
        if (document.getElementById('estimatedCount')) document.getElementById('estimatedCount').value = '';
        step2Data = { ngoaiVien: [], taiVien: [], lichPhuong: [] };
        sessionStorage.removeItem('mwk_create_schedule_draft');
        populateStep2CustomerCard();
        switchToStep(1);
        if (window.showToast) {
            window.showToast('Đã xóa thông tin khách hàng và làm mới dữ liệu.', 'info');
        }
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

    if (window.showToast) {
        const statusStr = isChecked ? 'Đã chọn tất cả các loại lịch' : 'Đã bỏ chọn tất cả';
        window.showToast(statusStr, 'info');
    }
}

function computeMasterUnitRecord(statusStr, trangThaiStr, daGuiBool) {
    let customerCode = document.getElementById('customerCode')?.value.trim() || '';
    if (!customerCode) {
        customerCode = 'KAD' + String(Date.now()).slice(-6);
        const elem = document.getElementById('customerCode');
        if (elem) elem.value = customerCode;
    }
    const cbkd = document.getElementById('cbkd')?.value.trim() || '';
    const maNhanVien = document.getElementById('maNhanVien')?.value.trim() || '';
    const customerName = document.getElementById('customerName')?.value.trim() || '';
    const address = document.getElementById('address')?.value.trim() || '';
    const estimatedCountElem = document.getElementById('estimatedCount');
    const initialEstimatedCount = estimatedCountElem ? (parseInt(estimatedCountElem.value) || 0) : 0;
    const examDate = document.getElementById('examDate')?.value || new Date().toISOString().split('T')[0];
    const contactPerson = document.getElementById('contactPerson')?.value.trim() || '';
    const contractNote = document.getElementById('contractNote')?.value.trim() || '';
    const pakdStatusElem = document.getElementById('pakdStatus');
    const pakdValue = pakdStatusElem ? pakdStatusElem.value : 'Không có PAKD';

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

    let primaryFacility = address || 'Medlatec Ba Đình';
    if (taiVienList.length > 0 && taiVienList[0].diaDiemKham) {
        primaryFacility = taiVienList[0].diaDiemKham;
    }

    return {
        teamName: unitName,
        customerName: unitName,
        cbkd: cbkd || 'Nguyễn Văn An',
        maNhanVien: maNhanVien || 'NV0042',
        address: address,
        examLocation: address,
        contactPerson: contactPerson || unitName,
        contractNote: contractNote,
        generalNote: contractNote,
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
        personInCharge: cbkd || 'Nguyễn Văn An',
        status: statusStr,
        trangThai: trangThaiStr,
        daGuiTongHop: daGuiBool,
        suDungPAKD: document.getElementById('suDungPAKD')?.checked ?? (pakdValue === 'Có PAKD'),
        pakdStatus: pakdValue,
        phuongAnKinhDoanh: pakdValue,
        step2Data: JSON.parse(JSON.stringify(step2Data)),
        examDate: examDate,
        createdAt: new Date().toISOString()
    };
}

function saveCurrentUnitRecord(statusStr = 'Tạo mới', trangThaiStr = 'TAO_MOI', daGuiBool = false) {
    const urlParams = new URLSearchParams(window.location.search);
    const editId = urlParams.get('id') || urlParams.get('editId');

    const newItem = computeMasterUnitRecord(statusStr, trangThaiStr, daGuiBool);
    if (daGuiBool) {
        newItem.ngayGuiTongHop = new Date().toISOString();
    }
    
    const existingList = MWKDataStore.getKskSchedules();
    let existingItem = null;

    if (editId) {
        existingItem = existingList.find(s => String(s.id) === String(editId));
    } else if (newItem.customerCode) {
        const collision = existingList.find(s => s.customerCode === newItem.customerCode || s.maDoiTuong === newItem.customerCode);
        if (collision) {
            newItem.customerCode = 'KAD' + String(Date.now()).slice(-6);
            newItem.maDoiTuong = newItem.customerCode;
        }
    }

    let savedId;
    if (existingItem) {
        MWKDataStore.updateKskSchedule(existingItem.id, newItem);
        savedId = existingItem.id;
    } else {
        savedId = MWKDataStore.addKskSchedule(newItem);
    }

    console.log("=== AFTER CREATE SCHEDULE ===");
    console.log("[KSK CREATE] saved master:", newItem);
    console.log("[KSK STORE] all units:", MWKDataStore.getKskSchedules());

    return savedId;
}

function handleSubmitTongHopStep2() {
    saveCurrentUnitRecord('Chờ tổng hợp', 'CHO_TONG_HOP', true);
    sessionStorage.removeItem('mwk_create_schedule_draft');

    if (window.showToast) {
        window.showToast(`Đã gửi tổng hợp thành công các lịch khám KSK cho Cán bộ Tổng hợp!`, 'success');
    }

    setTimeout(() => {
        window.location.href = '../index.html';
    }, 600);
}

function saveDraftStep2() {
    saveCurrentUnitRecord('Nháp', 'NHAP', false);
    sessionStorage.removeItem('mwk_create_schedule_draft');

    if (window.showToast) {
        window.showToast('Đã lưu nháp thông tin lịch KSK thành công!', 'success');
    }

    setTimeout(() => {
        window.location.href = '../index.html';
    }, 500);
}

function saveDraftStep1() {
    if (!validateStep1()) return;

    saveCurrentUnitRecord('Nháp', 'NHAP', false);
    sessionStorage.removeItem('mwk_create_schedule_draft');

    if (window.showToast) {
        window.showToast('Đã lưu nháp thông tin lịch thành công!', 'success');
    }

    setTimeout(() => {
        window.location.href = '../index.html';
    }, 500);
}
