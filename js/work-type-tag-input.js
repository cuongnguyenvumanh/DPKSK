/**
 * MWK - WORK TYPE MULTI-VALUE TAG / CHIP INPUT COMPONENT
 * Shared helper for Create, Edit, and View/Detail modes across all schedule types.
 * Unified Data Model: workTypes (Array of Strings) & loaiHinhCongViec (Array of Strings)
 */

(function(window) {
    const WorkTypeTagInput = {
        tags: [],
        accentColorClass: 'bg-[#E8F1FB] text-[#27496D] border-[#B3CDE6]',

        /**
         * Robust Helper to extract Work Types from any schedule object or data structure
         * Supports: workTypes (array/string), loaiHinhCongViec (array/string), workType (string)
         */
        extractWorkTypes: function(data) {
            if (!data) return ['Khám sức khỏe'];

            // If passed direct array
            if (Array.isArray(data)) {
                const cleaned = data.map(t => String(t).trim()).filter(Boolean);
                return cleaned.length > 0 ? cleaned : ['Khám sức khỏe'];
            }

            // If passed direct string
            if (typeof data === 'string' && data.trim()) {
                const parts = data.split(',').map(t => t.trim()).filter(Boolean);
                return parts.length > 0 ? parts : [data.trim()];
            }

            // If passed schedule object
            if (typeof data === 'object') {
                // 1. workTypes array
                if (Array.isArray(data.workTypes) && data.workTypes.length > 0) {
                    return data.workTypes.map(t => String(t).trim()).filter(Boolean);
                }
                // 2. loaiHinhCongViec array
                if (Array.isArray(data.loaiHinhCongViec) && data.loaiHinhCongViec.length > 0) {
                    return data.loaiHinhCongViec.map(t => String(t).trim()).filter(Boolean);
                }
                // 3. Legacy workTypes string
                if (typeof data.workTypes === 'string' && data.workTypes.trim()) {
                    return data.workTypes.split(',').map(t => t.trim()).filter(Boolean);
                }
                // 4. Legacy workType string
                if (typeof data.workType === 'string' && data.workType.trim()) {
                    return data.workType.split(',').map(t => t.trim()).filter(Boolean);
                }
                // 5. Legacy loaiHinhCongViec string
                if (typeof data.loaiHinhCongViec === 'string' && data.loaiHinhCongViec.trim()) {
                    return data.loaiHinhCongViec.split(',').map(t => t.trim()).filter(Boolean);
                }
            }

            return ['Khám sức khỏe'];
        },

        init: function(initialData = [], typeCode = 'NGOAI_VIEN') {
            this.tags = this.extractWorkTypes(initialData);
            this.setThemeColor(typeCode);
            this.setupEventListeners();
            this.renderTags();
        },

        setThemeColor: function(typeCode) {
            if (typeCode === 'NGOAI_VIEN') {
                this.accentColorClass = 'bg-[#FFF3E0] text-[#ED6C02] border-[#FFCC80]';
            } else if (typeCode === 'LICH_PHUONG') {
                this.accentColorClass = 'bg-[#F3E8FF] text-[#7E22CE] border-[#D8B4FE]';
            } else {
                this.accentColorClass = 'bg-[#E8F1FB] text-[#27496D] border-[#B3CDE6]';
            }
        },

        setupEventListeners: function() {
            const inputElem = document.getElementById('work-type-text-input');
            if (!inputElem) return;

            // Clone element to reset existing listeners cleanly
            const newInputElem = inputElem.cloneNode(true);
            inputElem.parentNode.replaceChild(newInputElem, inputElem);

            newInputElem.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    const val = newInputElem.value.trim();
                    if (val) {
                        this.addTag(val);
                        newInputElem.value = '';
                    }
                } else if (e.key === 'Backspace' && !newInputElem.value) {
                    if (this.tags.length > 0) {
                        this.tags.pop();
                        this.renderTags();
                    }
                }
            });
        },

        addTag: function(tagText) {
            const trimmed = (tagText || '').trim();
            if (!trimmed) return;

            // Case-insensitive duplicate check
            const exists = this.tags.some(t => t.toLowerCase() === trimmed.toLowerCase());
            if (exists) {
                if (window.showToast) {
                    window.showToast(`Loại hình "${trimmed}" đã có trong danh sách.`, 'warning');
                }
                return;
            }

            this.tags.push(trimmed);
            this.renderTags();
        },

        removeTag: function(tagText) {
            this.tags = this.tags.filter(t => t.toLowerCase() !== tagText.toLowerCase());
            this.renderTags();
        },

        setTags: function(data, typeCode) {
            if (typeCode) this.setThemeColor(typeCode);
            this.tags = this.extractWorkTypes(data);
            this.renderTags();
        },

        getTags: function() {
            return [...this.tags];
        },

        renderTags: function() {
            const wrapper = document.getElementById('work-type-tags-wrapper');
            if (!wrapper) return;

            wrapper.innerHTML = '';
            this.tags.forEach(tag => {
                const chip = document.createElement('span');
                chip.className = `inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] font-semibold text-xs border ${this.accentColorClass} shadow-2xs transition-all`;
                chip.innerHTML = `
                    <span>${this.escapeHtml(tag)}</span>
                    <button type="button" onclick="WorkTypeTagInput.removeTag('${this.escapeHtml(tag)}')" class="w-4 h-4 rounded-full flex items-center justify-center hover:bg-black/10 transition-colors cursor-pointer ml-0.5" title="Xóa loại hình này">
                        <i class="fa-solid fa-xmark text-[10px]"></i>
                    </button>
                `;
                wrapper.appendChild(chip);
            });

            // Hide error message if at least 1 tag exists
            const errElem = document.getElementById('err-workType');
            if (errElem && this.tags.length > 0) {
                errElem.classList.add('hidden');
            }
        },

        /**
         * Render Read-Only Tags HTML for View/Detail screens
         */
        renderReadOnlyTagsHtml: function(data, typeCode = 'NGOAI_VIEN') {
            const tags = this.extractWorkTypes(data);
            let themeBadgeClass = 'bg-[#E8F1FB] text-[#27496D] border-[#B3CDE6]';
            if (typeCode === 'NGOAI_VIEN') themeBadgeClass = 'bg-[#FFF3E0] text-[#ED6C02] border-[#FFCC80]';
            else if (typeCode === 'LICH_PHUONG') themeBadgeClass = 'bg-[#F3E8FF] text-[#7E22CE] border-[#D8B4FE]';

            if (tags.length === 0) {
                return `<span class="inline-flex items-center px-2.5 py-1 rounded-[4px] bg-[#F4F5F7] text-[#6B7280] font-semibold text-xs border border-[#D9DEE5]">Khám sức khỏe</span>`;
            }

            return tags.map(tag => `
                <span class="inline-flex items-center px-2.5 py-1 rounded-[4px] ${themeBadgeClass} font-semibold text-xs border shadow-2xs">
                    ${this.escapeHtml(tag)}
                </span>
            `).join(' ');
        },

        escapeHtml: function(str) {
            return (str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
        }
    };

    window.WorkTypeTagInput = WorkTypeTagInput;
})(window);
