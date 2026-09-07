/**
 * MWK - ĐIỀU PHỐI KSK | MAIN JAVASCRIPT, COMPONENT LOADER, TOAST & VALIDATION
 */

document.addEventListener('DOMContentLoaded', async function () {
    // Determine relative path base depending on current page depth
    const pageDepth = document.body.getAttribute('data-depth') || 'root'; 
    let basePath = './';
    if (pageDepth === 'single') {
        basePath = '../';
    } else if (pageDepth === 'sub') {
        basePath = '../../';
    } else if (pageDepth === 'nested') {
        basePath = '../../../';
    } else if (pageDepth === 'deep') {
        basePath = '../../../../';
    }

    // Function to load external HTML component into target selector
    async function loadComponent(selector, componentPath) {
        const target = document.querySelector(selector);
        if (!target) return;
        try {
            const response = await fetch(basePath + componentPath);
            if (response.ok) {
                target.innerHTML = await response.text();
            } else {
                console.warn(`Lỗi nạp component: ${componentPath} (Status ${response.status})`);
            }
        } catch (err) {
            console.error(`Không thể nạp component ${componentPath}:`, err);
        }
    }

    // Load Sidebar & Header asynchronously
    await loadComponent('#sidebar-container', 'components/sidebar.html');
    await loadComponent('#header-container', 'components/header.html');
    await loadComponent('#search-container', 'components/search.html');
    await loadComponent('#filter-container', 'components/filter.html');
    if (!document.body.hasAttribute('data-custom-pagination')) {
        await loadComponent('#pagination-container', 'components/pagination.html');
    }

    // Fix link URLs in Sidebar based on basePath
    const logoLink = document.getElementById('sidebar-logo-link');
    const navTaoLichKsk = document.getElementById('nav-tao-lich-ksk');
    const navTongHopLichKsk = document.getElementById('nav-tong-hop-lich-ksk');
    const navBangTongHopLichKham = document.getElementById('nav-bang-tong-hop-lich-kham');
    const navCbDuyetLichKsk = document.getElementById('nav-cb-duyet-lich-ksk');
    const navDuKienLichKsk = document.getElementById('nav-du-kien-lich-ksk');
    const navReportDoanKham = document.getElementById('nav-report-doan-kham');
    const navReportNhanSu = document.getElementById('nav-report-nhan-su');
    const navDanhMucKham = document.getElementById('nav-danh-muc-kham');
    const navDinhMucNhanSu = document.getElementById('nav-dinh-muc-nhan-su');
    const navCoSoKham = document.getElementById('nav-co-so-kham');
    const navCauHinhPhuCap = document.getElementById('nav-cau-hinh-phu-cap');
    const breadcrumbHome = document.getElementById('breadcrumb-home-link');

    if (logoLink) logoLink.href = basePath + 'bao-cao-thong-ke/bao-cao-doan-kham/bao-cao-doan-kham.html';
    if (navTaoLichKsk) navTaoLichKsk.href = basePath + 'tao-lich-ksk/index.html';
    if (navTongHopLichKsk) navTongHopLichKsk.href = basePath + 'tong-hop-lich-ksk/tong-hop.html';
    if (navBangTongHopLichKham) navBangTongHopLichKham.href = basePath + 'modules/bang-tong-hop-lich-kham/bang-tong-hop.html';
    if (navCbDuyetLichKsk) navCbDuyetLichKsk.href = basePath + 'modules/cb-duyet-lich-ksk/cb-duyet.html';
    if (navDuKienLichKsk) navDuKienLichKsk.href = basePath + 'tao-lich-ksk/index.html?tab=du_kien';
    if (navReportDoanKham) navReportDoanKham.href = basePath + 'bao-cao-thong-ke/bao-cao-doan-kham/bao-cao-doan-kham.html';
    if (navReportDoanKham) navReportDoanKham.href = basePath + 'bao-cao-thong-ke/bao-cao-doan-kham/bao-cao-doan-kham.html';
    if (navReportNhanSu) navReportNhanSu.href = basePath + 'bao-cao-thong-ke/bao-cao-nhan-su/bao-cao-nhan-su.html';
    if (navDanhMucKham) navDanhMucKham.href = basePath + 'cau-hinh-he-thong/danh-muc-kham/danh-muc-kham.html';
    if (navDinhMucNhanSu) navDinhMucNhanSu.href = basePath + 'cau-hinh-he-thong/cau-hinh-dinh-muc/index.html';

    if (navCoSoKham) navCoSoKham.href = basePath + 'cau-hinh-he-thong/co-so-kham/co-so-kham.html';
    if (navCauHinhPhuCap) navCauHinhPhuCap.href = basePath + 'cau-hinh-he-thong/cau-hinh-phu-cap/cau-hinh-phu-cap.html';
    if (breadcrumbHome) breadcrumbHome.href = basePath + 'bao-cao-thong-ke/bao-cao-doan-kham/bao-cao-doan-kham.html';

    // Highlight Active Sidebar Item based on data-active-nav attribute on <body>
    const activeNav = document.body.getAttribute('data-active-nav');
    if (activeNav) {
        const activeLink = document.getElementById(activeNav);
        if (activeLink) {
            activeLink.className = 'nav-item relative flex items-center gap-2.5 px-4 h-10 rounded-[8px] bg-[#E8F1FB] text-[#27496D] font-semibold text-xs transition-colors';
            const icon = activeLink.querySelector('i');
            if (icon) {
                icon.classList.remove('text-slate-400', 'text-[#6B7280]');
                icon.classList.add('text-[#27496D]');
            }
            activeLink.insertAdjacentHTML('afterbegin', '<span class="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-[#27496D] rounded-r-sm"></span>');

            const parentSubmenu = activeLink.closest('.submenu');
            if (parentSubmenu && parentSubmenu.classList.contains('hidden')) {
                parentSubmenu.classList.remove('hidden');
            }
        }
    }

    // Set Breadcrumb text based on data-breadcrumb attribute
    const breadcrumbCurrent = document.getElementById('breadcrumb-current');
    const breadcrumbTitle = document.body.getAttribute('data-breadcrumb');
    if (breadcrumbCurrent && breadcrumbTitle) {
        breadcrumbCurrent.innerText = breadcrumbTitle;
    }

    // Bind Sidebar Expand/Collapse Toggle Button
    const sidebar = document.getElementById('sidebar');
    const sidebarToggleBtn = document.getElementById('sidebar-toggle-btn');
    if (sidebarToggleBtn && sidebar) {
        sidebarToggleBtn.addEventListener('click', function () {
            if (sidebar.classList.contains('sidebar-expanded')) {
                sidebar.classList.remove('sidebar-expanded');
                sidebar.classList.add('sidebar-collapsed');
                localStorage.setItem('mwk_sidebar_state', 'collapsed');
            } else {
                sidebar.classList.remove('sidebar-collapsed');
                sidebar.classList.add('sidebar-expanded');
                localStorage.setItem('mwk_sidebar_state', 'expanded');
            }
        });

        // Restore saved sidebar state
        const savedState = localStorage.getItem('mwk_sidebar_state');
        if (savedState === 'collapsed') {
            sidebar.classList.remove('sidebar-expanded');
            sidebar.classList.add('sidebar-collapsed');
        }
    }

    // Bind Submenu Accordion Toggle for BÁO CÁO THỐNG KÊ
    const reportStatToggle = document.getElementById('report-stat-toggle');
    const reportStatSubmenu = document.getElementById('report-stat-submenu');
    const reportStatArrow = document.getElementById('report-stat-arrow');

    if (reportStatToggle && reportStatSubmenu && reportStatArrow) {
        reportStatToggle.addEventListener('click', function () {
            if (sidebar && sidebar.classList.contains('sidebar-collapsed')) {
                sidebar.classList.remove('sidebar-collapsed');
                sidebar.classList.add('sidebar-expanded');
                localStorage.setItem('mwk_sidebar_state', 'expanded');
            }

            if (reportStatSubmenu.classList.contains('hidden')) {
                reportStatSubmenu.classList.remove('hidden');
                reportStatArrow.classList.remove('-rotate-90');
            } else {
                reportStatSubmenu.classList.add('hidden');
                reportStatArrow.classList.add('-rotate-90');
            }
        });
    }

    // Bind Submenu Accordion Toggle for CẤU HÌNH HỆ THỐNG
    const systemConfigToggle = document.getElementById('system-config-toggle');
    const systemConfigSubmenu = document.getElementById('system-config-submenu');
    const systemConfigArrow = document.getElementById('system-config-arrow');

    if (systemConfigToggle && systemConfigSubmenu && systemConfigArrow) {
        systemConfigToggle.addEventListener('click', function () {
            if (sidebar && sidebar.classList.contains('sidebar-collapsed')) {
                sidebar.classList.remove('sidebar-collapsed');
                sidebar.classList.add('sidebar-expanded');
                localStorage.setItem('mwk_sidebar_state', 'expanded');
            }

            if (systemConfigSubmenu.classList.contains('hidden')) {
                systemConfigSubmenu.classList.remove('hidden');
                systemConfigArrow.classList.remove('-rotate-90');
            } else {
                systemConfigSubmenu.classList.add('hidden');
                systemConfigArrow.classList.add('-rotate-90');
            }
        });
    }

    // Bind Submenu Accordion Toggle for QUẢN LÝ LỊCH KSK
    const kskManageToggle = document.getElementById('ksk-manage-toggle');
    const kskManageSubmenu = document.getElementById('ksk-manage-submenu');
    const kskManageArrow = document.getElementById('ksk-manage-arrow');

    if (kskManageToggle && kskManageSubmenu && kskManageArrow) {
        kskManageToggle.addEventListener('click', function () {
            if (sidebar && sidebar.classList.contains('sidebar-collapsed')) {
                sidebar.classList.remove('sidebar-collapsed');
                sidebar.classList.add('sidebar-expanded');
                localStorage.setItem('mwk_sidebar_state', 'expanded');
            }

            if (kskManageSubmenu.classList.contains('hidden')) {
                kskManageSubmenu.classList.remove('hidden');
                kskManageArrow.classList.remove('-rotate-90');
            } else {
                kskManageSubmenu.classList.add('hidden');
                kskManageArrow.classList.add('-rotate-90');
            }
        });
    }
});

/**
 * ============================================================================
 * UNIFIED UX/UI TOAST NOTIFICATIONS SYSTEM
 * ============================================================================
 */
window.showToast = function(message, type = 'success') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'fixed top-5 right-5 z-[9999] flex flex-col gap-2.5 pointer-events-none';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl border text-xs font-semibold transform transition-all duration-300 translate-x-10 opacity-0 ${
        type === 'success' 
            ? 'bg-slate-900 text-white border-emerald-500/50' 
            : 'bg-slate-900 text-white border-red-500/50'
    }`;

    const iconHtml = type === 'success' 
        ? `<div class="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs flex-shrink-0"><i class="fa-solid fa-circle-check"></i></div>`
        : `<div class="w-6 h-6 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center text-xs flex-shrink-0"><i class="fa-solid fa-circle-exclamation"></i></div>`;

    toast.innerHTML = `
        ${iconHtml}
        <span class="flex-1 leading-snug">${message}</span>
        <button type="button" class="text-slate-400 hover:text-white ml-2 cursor-pointer text-sm" onclick="this.parentElement.remove()"><i class="fa-solid fa-xmark"></i></button>
    `;

    container.appendChild(toast);

    requestAnimationFrame(() => {
        toast.classList.remove('translate-x-10', 'opacity-0');
        toast.classList.add('translate-x-0', 'opacity-100');
    });

    setTimeout(() => {
        toast.classList.remove('translate-x-0', 'opacity-100');
        toast.classList.add('translate-x-10', 'opacity-0');
        setTimeout(() => toast.remove(), 300);
    }, 3500);
};

/**
 * ============================================================================
 * UNIFIED FORM FIELD VALIDATION SYSTEM
 * ============================================================================
 */
window.MWKValidation = {
    // Show Error Under Specific Field
    showFieldError: function(elem, message) {
        if (!elem) return;

        // Clear existing error first
        this.clearFieldError(elem);

        // Highlight border
        elem.classList.add('border-red-500', 'bg-red-50/20', 'focus:border-red-500');

        // Create error message paragraph right below elem
        const errP = document.createElement('p');
        errP.className = 'field-error-msg text-[11px] text-red-500 mt-1 font-medium flex items-center gap-1.5';
        errP.innerHTML = `<i class="fa-solid fa-circle-exclamation text-[10px]"></i> ${message}`;

        if (elem.parentElement) {
            elem.parentElement.appendChild(errP);
        }

        // Attach listener to clear error immediately when user interacts
        const clearHandler = () => {
            this.clearFieldError(elem);
            elem.removeEventListener('input', clearHandler);
            elem.removeEventListener('change', clearHandler);
        };
        elem.addEventListener('input', clearHandler);
        elem.addEventListener('change', clearHandler);
    },

    // Clear Error Under Specific Field
    clearFieldError: function(elem) {
        if (!elem) return;
        elem.classList.remove('border-red-500', 'bg-red-50/20', 'focus:border-red-500');

        if (elem.parentElement) {
            const oldMsg = elem.parentElement.querySelector('.field-error-msg');
            if (oldMsg) oldMsg.remove();
        }
    },

    // Clear All Errors In A Form
    clearFormErrors: function(formElem) {
        if (!formElem) return;
        formElem.querySelectorAll('.field-error-msg').forEach(msg => msg.remove());
        formElem.querySelectorAll('.border-red-500').forEach(elem => {
            elem.classList.remove('border-red-500', 'bg-red-50/20', 'focus:border-red-500');
        });
    },

    // Validate Standard Required Field
    validateRequired: function(elem, customMsg = 'Trường dữ liệu không được để trống.') {
        if (!elem) return true;
        const val = elem.value ? elem.value.trim() : '';
        if (!val) {
            this.showFieldError(elem, customMsg);
            return false;
        }
        this.clearFieldError(elem);
        return true;
    },

    // Validate Select Dropdown
    validateSelect: function(elem, customMsg = 'Vui lòng chọn dữ liệu.') {
        if (!elem) return true;
        const val = elem.value;
        if (!val || val === '') {
            this.showFieldError(elem, customMsg);
            return false;
        }
        this.clearFieldError(elem);
        return true;
    },

    // Validate Positive Number
    validatePositiveNumber: function(elem) {
        if (!elem) return true;
        const rawVal = elem.value ? elem.value.trim() : '';
        if (!rawVal) {
            this.showFieldError(elem, 'Trường dữ liệu không được để trống.');
            return false;
        }

        const num = Number(rawVal);
        if (isNaN(num)) {
            this.showFieldError(elem, 'Vui lòng nhập số hợp lệ.');
            return false;
        }

        if (num <= 0) {
            this.showFieldError(elem, 'Giá trị phải lớn hơn 0.');
            return false;
        }

        this.clearFieldError(elem);
        return true;
    },

    // Validate Checkbox Group
    validateCheckboxGroup: function(containerElem, checkboxesName, customMsg = 'Vui lòng chọn ít nhất một giá trị.') {
        if (!containerElem) return true;
        const checked = containerElem.querySelectorAll(`input[name="${checkboxesName}"]:checked`);
        const oldMsg = containerElem.parentElement ? containerElem.parentElement.querySelector('.field-error-msg') : null;
        if (oldMsg) oldMsg.remove();

        if (checked.length === 0) {
            containerElem.classList.add('border-red-500', 'bg-red-50/20');
            const errP = document.createElement('p');
            errP.className = 'field-error-msg text-[11px] text-red-500 mt-1 font-medium flex items-center gap-1.5';
            errP.innerHTML = `<i class="fa-solid fa-circle-exclamation text-[10px]"></i> ${customMsg}`;
            if (containerElem.parentElement) containerElem.parentElement.appendChild(errP);

            const clearCB = () => {
                containerElem.classList.remove('border-red-500', 'bg-red-50/20');
                const msg = containerElem.parentElement ? containerElem.parentElement.querySelector('.field-error-msg') : null;
                if (msg) msg.remove();
                containerElem.removeEventListener('change', clearCB);
            };
            containerElem.addEventListener('change', clearCB);
            return false;
        }

        containerElem.classList.remove('border-red-500', 'bg-red-50/20');
        return true;
    }
};
