/**
 * MODULE CẤU HÌNH ĐỊNH MỨC - MASTER TAB CONTROLLER
 */
let currentActiveTab = 'tai-vien';

const TAB_CONFIGS = {
    'tai-vien': {
        searchPlaceholder: 'Tìm kiếm cơ sở khám, chỉ tiêu...',
        filterHtml: `
            <select id="filter-region" onchange="handleFilterChange()" class="px-3.5 py-2 border border-slate-200 rounded-lg text-xs text-slate-700 font-medium focus:outline-none focus:border-sky-500 bg-white cursor-pointer">
                <option value="">Tất cả Miền ▼</option>
                <option value="Bắc">Miền Bắc</option>
                <option value="Trung">Miền Trung</option>
                <option value="Nam">Miền Nam</option>
            </select>
            <button type="button" onclick="resetFilters()" class="px-3.5 py-2 border border-slate-200 hover:bg-slate-100 text-slate-600 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer">
                <i class="fa-solid fa-rotate-left text-xs"></i>
                <span>Đặt lại</span>
            </button>
        `
    },
    'ngoai-vien': {
        searchPlaceholder: 'Tìm kiếm quy mô đoàn, vị trí...',
        filterHtml: `
            <select id="filter-scale" onchange="handleFilterChange()" class="px-3.5 py-2 border border-slate-200 rounded-lg text-xs text-slate-700 font-medium focus:outline-none focus:border-sky-500 bg-white cursor-pointer">
                <option value="">Tất cả Quy mô đoàn ▼</option>
                <option value="Đoàn nhỏ">Đoàn nhỏ (&lt; 100 khách)</option>
                <option value="Đoàn vừa">Đoàn vừa (100 - 300 khách)</option>
                <option value="Đoàn lớn">Đoàn lớn (300 - 800 khách)</option>
            </select>
        `
    },
    'chuyen-khoa': {
        searchPlaceholder: 'Tìm kiếm chuyên khoa...',
        filterHtml: `
            <select id="filter-form" onchange="handleFilterChange()" class="px-3.5 py-2 border border-slate-200 rounded-lg text-xs text-slate-700 font-medium focus:outline-none focus:border-sky-500 bg-white cursor-pointer">
                <option value="">Tất cả Hình thức ▼</option>
                <option value="Tại viện">Tại viện</option>
                <option value="Ngoại viện">Ngoại viện</option>
            </select>
        `
    },
    'kiem-nhiem': {
        searchPlaceholder: 'Tìm kiếm vị trí kiêm nhiệm...',
        filterHtml: `
            <select id="filter-shift" onchange="handleFilterChange()" class="px-3.5 py-2 border border-slate-200 rounded-lg text-xs text-slate-700 font-medium focus:outline-none focus:border-sky-500 bg-white cursor-pointer">
                <option value="">Tất cả Số ca/tuần ▼</option>
                <option value="4">4 ca/tuần</option>
                <option value="5">5 ca/tuần</option>
                <option value="6">6 ca/tuần</option>
            </select>
        `
    },
    'dieu-phoi-bkh': {
        searchPlaceholder: 'Tìm kiếm loại đoàn, thời gian...',
        filterHtml: `
            <select id="filter-level" onchange="handleFilterChange()" class="px-3.5 py-2 border border-slate-200 rounded-lg text-xs text-slate-700 font-medium focus:outline-none focus:border-sky-500 bg-white cursor-pointer">
                <option value="">Tất cả Phân loại đoàn ▼</option>
                <option value="Đoàn loại A">Đoàn loại A (VIP / &gt; 1000 khách)</option>
                <option value="Đoàn loại B">Đoàn loại B (200 - 1000 khách)</option>
            </select>
        `
    }
};

document.addEventListener('DOMContentLoaded', function() {
    switchTab('tai-vien');
});

function switchTab(tabId) {
    if (typeof isEditMode !== 'undefined') isEditMode = false;
    if (typeof isKiemNhiemEditMode !== 'undefined') isKiemNhiemEditMode = false;
    if (typeof isBkhEditMode !== 'undefined') isBkhEditMode = false;
    if (typeof isChuyenKhoaEditMode !== 'undefined') isChuyenKhoaEditMode = false;
    if (typeof isNgoaiVienEditMode !== 'undefined') isNgoaiVienEditMode = false;

    const btnUpdate = document.getElementById('btn-matrix-update');
    const editActions = document.getElementById('edit-mode-actions');
    if (btnUpdate && editActions) {
        btnUpdate.classList.remove('hidden');
        editActions.classList.add('hidden');
    }

    currentActiveTab = tabId;

    // Toggle Active Tab Button Class
    const tabs = ['tai-vien', 'ngoai-vien', 'chuyen-khoa', 'kiem-nhiem', 'dieu-phoi-bkh'];
    tabs.forEach(id => {
        const btn = document.getElementById(`tab-btn-${id}`);
        if (btn) {
            if (id === tabId) {
                btn.className = 'tab-btn py-2.5 px-3.5 border-b-2 border-[#0F6CBD] text-[#0F6CBD] text-xs font-bold transition-all flex items-center gap-2 cursor-pointer flex-shrink-0';
            } else {
                btn.className = 'tab-btn py-2.5 px-3.5 border-b-2 border-transparent text-slate-600 hover:text-slate-900 text-xs font-medium transition-all flex items-center gap-2 cursor-pointer flex-shrink-0';
            }
        }
    });

    // Update Search Placeholder & Filters
    const conf = TAB_CONFIGS[tabId] || TAB_CONFIGS['tai-vien'];
    const searchInput = document.getElementById('global-search-input');
    if (searchInput) {
        searchInput.value = '';
        searchInput.placeholder = conf.searchPlaceholder;
    }

    const filterContainer = document.getElementById('filter-controls-container');
    if (filterContainer) {
        filterContainer.innerHTML = conf.filterHtml;
    }

    // Load Sub-Tab View Content
    loadSubTabContent(tabId);
}

function loadSubTabContent(tabId) {
    const container = document.getElementById('tab-content-container');
    if (!container) return;

    if (tabId === 'tai-vien') {
        renderTaiVienMatrixView(container);
    } else {
        renderGenericQuotaTabView(container, tabId);
    }
}

function handleMasterEditToggle(enable) {
    if (currentActiveTab === 'tai-vien') {
        if (typeof toggleMatrixEditMode === 'function') {
            toggleMatrixEditMode(enable);
        }
    } else if (currentActiveTab === 'ngoai-vien') {
        if (typeof toggleNgoaiVienEditMode === 'function') {
            toggleNgoaiVienEditMode(enable);
        }
    } else if (currentActiveTab === 'chuyen-khoa') {
        if (typeof toggleChuyenKhoaEditMode === 'function') {
            toggleChuyenKhoaEditMode(enable);
        }
    } else if (currentActiveTab === 'kiem-nhiem') {
        if (typeof toggleKiemNhiemEditMode === 'function') {
            toggleKiemNhiemEditMode(enable);
        }
    } else if (currentActiveTab === 'dieu-phoi-bkh') {
        if (typeof toggleBkhEditMode === 'function') {
            toggleBkhEditMode(enable);
        }
    }
}

function handleMasterSave() {
    if (currentActiveTab === 'tai-vien') {
        if (typeof saveMatrixEditChanges === 'function') {
            saveMatrixEditChanges();
        }
    } else if (currentActiveTab === 'ngoai-vien') {
        if (typeof saveNgoaiVienChanges === 'function') {
            saveNgoaiVienChanges();
        }
    } else if (currentActiveTab === 'chuyen-khoa') {
        if (typeof saveChuyenKhoaChanges === 'function') {
            saveChuyenKhoaChanges();
        }
    } else if (currentActiveTab === 'kiem-nhiem') {
        if (typeof saveKiemNhiemChanges === 'function') {
            saveKiemNhiemChanges();
        }
    } else if (currentActiveTab === 'dieu-phoi-bkh') {
        if (typeof saveBkhChanges === 'function') {
            saveBkhChanges();
        }
    }
}

function handleSearchChange() {
    const searchInput = document.getElementById('global-search-input');
    const searchVal = searchInput ? searchInput.value : '';
    const container = document.getElementById('tab-content-container');
    if (currentActiveTab === 'tai-vien') {
        renderTaiVienMatrixView(container, searchVal);
    } else {
        renderGenericQuotaTabView(container, currentActiveTab, searchVal);
    }
}

function handleFilterChange() {
    handleSearchChange();
}

function resetFilters() {
    const searchInput = document.getElementById('global-search-input');
    if (searchInput) searchInput.value = '';
    const regionSelect = document.getElementById('filter-region');
    if (regionSelect) regionSelect.value = '';
    handleSearchChange();
}

function renderGenericQuotaTabView(container, tabId, searchVal = '') {
    if (!container) return;
    if (tabId === 'ngoai-vien') {
        renderNgoaiVienView(container, searchVal);
    } else if (tabId === 'chuyen-khoa') {
        renderChuyenKhoaView(container, searchVal);
    } else if (tabId === 'kiem-nhiem') {
        renderKiemNhiemView(container, searchVal);
    } else if (tabId === 'dieu-phoi-bkh') {
        renderBkhView(container, searchVal);
    }
}

function updateGenericQuotaCell(tabKey, itemId, field, newValue) {
    MWKDataStore.updateQuotaByTabCell(tabKey, itemId, field, newValue);
    if (window.showToast) {
        window.showToast('Đã lưu hiệu chỉnh định mức!', 'success');
    }
}
