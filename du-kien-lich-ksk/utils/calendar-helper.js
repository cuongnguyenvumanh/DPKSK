/**
 * CALENDAR HELPER UTILITIES
 * Utility functions for date calculations, calendar grids, formatting & schedule styling
 */

window.CalendarHelper = {
    /**
     * Get start date (Monday) of the week for a given date
     */
    getStartOfWeek: function(date) {
        const d = new Date(date);
        const day = d.getDay();
        const diff = (day === 0 ? -6 : 1) - day;
        d.setDate(d.getDate() + diff);
        d.setHours(0, 0, 0, 0);
        return d;
    },

    /**
     * Get end date (Sunday) of the week for a given date
     */
    getEndOfWeek: function(date) {
        const start = this.getStartOfWeek(date);
        const end = new Date(start);
        end.setDate(start.getDate() + 6);
        end.setHours(23, 59, 59, 999);
        return end;
    },

    /**
     * Get array of 7 dates (Mon -> Sun) for the week
     */
    getWeekDays: function(date) {
        const start = this.getStartOfWeek(date);
        const days = [];
        for (let i = 0; i < 7; i++) {
            const d = new Date(start);
            d.setDate(start.getDate() + i);
            days.push(d);
        }
        return days;
    },

    /**
     * Format date object to YYYY-MM-DD
     */
    formatISODate: function(d) {
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    },

    /**
     * Format date object to DD/MM/YYYY
     */
    formatDisplayDate: function(d) {
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        return `${dd}/${mm}/${d.getFullYear()}`;
    },

    /**
     * Format date object to DD/MM
     */
    formatShortDate: function(d) {
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        return `${dd}/${mm}`;
    },

    /**
     * Get Vietnamese Day of Week Label
     */
    getDayOfWeekLabel: function(date) {
        const dayNames = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
        return dayNames[date.getDay()];
    },

    /**
     * Get Week Number in Year
     */
    getWeekNumber: function(d) {
        const target = new Date(d.valueOf());
        const dayNr = (d.getDay() + 6) % 7;
        target.setDate(target.getDate() - dayNr + 3);
        const firstThursday = target.valueOf();
        target.setMonth(0, 1);
        if (target.getDay() !== 4) {
            target.setMonth(0, 1 + ((4 - target.getDay() + 7) % 7));
        }
        return 1 + Math.ceil((firstThursday - target) / 604800000);
    },

    /**
     * Get Month Grid Matrix (5 or 6 weeks)
     */
    getMonthDaysGrid: function(year, month) {
        const firstDayOfMonth = new Date(year, month, 1);
        const lastDayOfMonth = new Date(year, month + 1, 0);

        const start = this.getStartOfWeek(firstDayOfMonth);
        const grid = [];
        
        let curr = new Date(start);
        while (curr <= lastDayOfMonth || grid.length % 7 !== 0 || grid.length < 35) {
            grid.push(new Date(curr));
            curr.setDate(curr.getDate() + 1);
            if (grid.length >= 42) break;
        }
        return grid;
    },

    /**
     * Get CSS Classes & Styling Tokens for Schedule Type
     */
    getScheduleTypeStyle: function(loaiLich) {
        const typeStr = (loaiLich || '').toLowerCase();
        if (typeStr.includes('tại viện')) {
            return {
                bgClass: 'bg-[#E8F1FB]',
                borderClass: 'border-[#27496D]',
                textClass: 'text-[#27496D]',
                badgeClass: 'bg-[#27496D] text-white',
                dotClass: 'bg-[#27496D]',
                label: 'Tại viện'
            };
        } else if (typeStr.includes('ngoại viện')) {
            return {
                bgClass: 'bg-[#FFF3E0]',
                borderClass: 'border-[#ED6C02]',
                textClass: 'text-[#E65100]',
                badgeClass: 'bg-[#ED6C02] text-white',
                dotClass: 'bg-[#ED6C02]',
                label: 'Ngoại viện'
            };
        } else if (typeStr.includes('phường')) {
            return {
                bgClass: 'bg-[#F3E8FF]',
                borderClass: 'border-[#7E22CE]',
                textClass: 'text-[#6B21A8]',
                badgeClass: 'bg-[#7E22CE] text-white',
                dotClass: 'bg-[#7E22CE]',
                label: 'Lịch phường'
            };
        } else {
            // Phát sinh / Khác
            return {
                bgClass: 'bg-[#FEE2E2]',
                borderClass: 'border-[#D32F2F]',
                textClass: 'text-[#991B1B]',
                badgeClass: 'bg-[#D32F2F] text-white',
                dotClass: 'bg-[#D32F2F]',
                label: 'Phát sinh'
            };
        }
    },

    /**
     * Format Planning Date Range (DD/MM/YYYY or DD/MM/YYYY - DD/MM/YYYY)
     */
    formatPlanningDateRange: function(tuNgay, denNgay) {
        if (!tuNgay) return '';
        let startISO = String(tuNgay).includes('T') ? String(tuNgay).split('T')[0] : String(tuNgay);
        let endISO = denNgay ? (String(denNgay).includes('T') ? String(denNgay).split('T')[0] : String(denNgay)) : startISO;

        const parseISO = (str) => {
            const parts = str.split('-');
            if (parts.length === 3) {
                return `${parts[2]}/${parts[1]}/${parts[0]}`;
            }
            return str;
        };

        const startFormatted = parseISO(startISO);
        const endFormatted = parseISO(endISO);

        if (startISO === endISO) {
            return startFormatted;
        }
        return `${startFormatted} - ${endFormatted}`;
    }
};

