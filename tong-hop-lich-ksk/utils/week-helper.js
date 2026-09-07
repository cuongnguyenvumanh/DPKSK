/**
 * MWK - TỔNG HỢP LỊCH KSK | WEEK HELPER UTILITIES
 */
(function(window) {
    const WeekHelper = {
        /**
         * Get ISO Week Number and Year for a given date or YYYY-MM-DD string
         */
        getWeekNumber: function(dateInput) {
            if (!dateInput) return { week: 1, year: new Date().getFullYear() };
            const d = new Date(dateInput);
            if (isNaN(d.getTime())) return { week: 1, year: new Date().getFullYear() };
            
            // ISO week date calculation
            d.setHours(0, 0, 0, 0);
            d.setDate(d.getDate() + 4 - (d.getDay() || 7));
            const yearStart = new Date(d.getFullYear(), 0, 1);
            const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
            return { week: weekNo, year: d.getFullYear() };
        },

        /**
         * Get formatted date range string for a given week and year (Monday -> Sunday)
         */
        getWeekDatesRange: function(weekNum, yearNum) {
            const simple = new Date(yearNum, 0, 1 + (weekNum - 1) * 7);
            const dow = simple.getDay();
            const ISOweekStart = simple;
            if (dow <= 4) {
                ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
            } else {
                ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());
            }
            
            const ISOweekEnd = new Date(ISOweekStart);
            ISOweekEnd.setDate(ISOweekStart.getDate() + 6);

            const formatDate = (dateObj) => {
                const day = String(dateObj.getDate()).padStart(2, '0');
                const month = String(dateObj.getMonth() + 1).padStart(2, '0');
                return `${day}/${month}/${dateObj.getFullYear()}`;
            };

            return `${formatDate(ISOweekStart)} - ${formatDate(ISOweekEnd)}`;
        },

        /**
         * Group array of items by Week (Key e.g. "2026-W33")
         */
        groupByWeek: function(items) {
            const groups = {};
            if (!Array.isArray(items)) return groups;

            items.forEach(item => {
                const dateStr = item.examDate || new Date().toISOString().split('T')[0];
                const { week, year } = this.getWeekNumber(dateStr);
                const key = `${year}-W${String(week).padStart(2, '0')}`;

                if (!groups[key]) {
                    groups[key] = {
                        week: week,
                        year: year,
                        key: key,
                        dateRange: this.getWeekDatesRange(week, year),
                        items: []
                    };
                }
                groups[key].items.push(item);
            });

            return groups;
        },

        /**
         * Group array of items by Facility (Cơ sở thực hiện)
         */
        groupByFacility: function(items) {
            const groups = {};
            if (!Array.isArray(items)) return groups;

            items.forEach(item => {
                const facility = item.facility || 'Chưa phân cơ sở';
                if (!groups[facility]) {
                    groups[facility] = [];
                }
                groups[facility].push(item);
            });

            return groups;
        },

        /**
         * Split array of items into Lịch tuần and Lịch phát sinh
         */
        splitWeeklyAndIncident: function(items) {
            const result = {
                lichTuan: [],
                lichPhatSinh: []
            };
            if (!Array.isArray(items)) return result;

            items.forEach(item => {
                if (item.scheduleForm === 'Lịch phát sinh') {
                    result.lichPhatSinh.push(item);
                } else {
                    result.lichTuan.push(item);
                }
            });

            return result;
        }
    };

    window.MWKWeekHelper = WeekHelper;
})(window);
