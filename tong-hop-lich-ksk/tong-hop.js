/**
 * MWK - TỔNG HỢP LỊCH KSK | MAIN CONTAINER CONTROLLER
 */
(function(window) {
    let currentTab = 'receive'; // 'receive' | 'weekly'

    document.addEventListener('DOMContentLoaded', function() {
        bindTabSwitching();
        switchTab('receive');
    });

    function bindTabSwitching() {
        const btnReceive = document.getElementById('tab-btn-receive');
        const btnWeekly = document.getElementById('tab-btn-weekly');

        if (btnReceive) {
            btnReceive.addEventListener('click', function() {
                switchTab('receive');
            });
        }

        if (btnWeekly) {
            btnWeekly.addEventListener('click', function() {
                switchTab('weekly');
            });
        }
    }

    function switchTab(tabName) {
        currentTab = tabName;

        const btnReceive = document.getElementById('tab-btn-receive');
        const btnWeekly = document.getElementById('tab-btn-weekly');
        const viewReceive = document.getElementById('tab-content-receive');
        const viewWeekly = document.getElementById('tab-content-weekly');

        if (tabName === 'receive') {
            if (btnReceive) btnReceive.className = 'tab-btn active h-full border-b-2 border-[#27496D] text-[#27496D] font-bold text-xs flex items-center gap-2 cursor-pointer';
            if (btnWeekly) btnWeekly.className = 'tab-btn h-full border-b-2 border-transparent text-[#6B7280] hover:text-[#1F2937] font-semibold text-xs flex items-center gap-2 cursor-pointer';

            if (viewReceive) viewReceive.classList.remove('hidden');
            if (viewWeekly) viewWeekly.classList.add('hidden');

            if (window.MWKReceive && window.MWKReceive.init) {
                window.MWKReceive.init();
            } else {
                loadTabContentFallback(tabName);
            }
        } else {
            if (btnReceive) btnReceive.className = 'tab-btn h-full border-b-2 border-transparent text-[#6B7280] hover:text-[#1F2937] font-semibold text-xs flex items-center gap-2 cursor-pointer';
            if (btnWeekly) btnWeekly.className = 'tab-btn active h-full border-b-2 border-[#27496D] text-[#27496D] font-bold text-xs flex items-center gap-2 cursor-pointer';

            if (viewReceive) viewReceive.classList.add('hidden');
            if (viewWeekly) viewWeekly.classList.remove('hidden');

            if (window.MWKWeekly && window.MWKWeekly.init) {
                window.MWKWeekly.init();
            } else {
                loadTabContentFallback(tabName);
            }
        }
    }

    async function loadTabContentFallback(tabName) {
        const container = document.getElementById('tab-content-container');
        if (!container) return;

        const componentPath = tabName === 'receive' ? 'receive/receive-list.html' : 'weekly/weekly-summary.html';

        try {
            const response = await fetch(componentPath);
            if (response.ok) {
                container.innerHTML = await response.text();
                if (tabName === 'receive') {
                    if (window.MWKReceive && window.MWKReceive.init) window.MWKReceive.init();
                } else {
                    if (window.MWKWeekly && window.MWKWeekly.init) window.MWKWeekly.init();
                }
            }
        } catch (err) {
            console.warn(`Fallback fetch cho ${componentPath} không khả thi:`, err);
        }
    }

    window.MWKTongHop = {
        switchTab: switchTab
    };
})(window);
