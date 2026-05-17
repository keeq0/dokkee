<template>
    <div class="analysis__options">
        <div class="option">
            <label class="options__label">Период</label>
            <div class="filter-container  period">
                <div class="storage__filter period-filter" @click="togglePeriodFilter">
                    <p class="filter__type">
                        {{ formatDate(selectedPeriod.start) }} - {{ formatDate(selectedPeriod.end) }}
                    </p>
                    <img 
                        src="@/assets/filter_icon.png" 
                        class="filter__icon" 
                        :class="{ 'rotate-icon': isPeriodOpen }"
                    />
                </div>
                
                <transition name="dropdown">
                    <div class="filter-options period-options" v-show="isPeriodOpen">
                        <div class="period-picker">
                            <div class="period-inputs">
                                <div class="period-input-group">
                                    <label>От:</label>
                                    <input 
                                        type="date" 
                                        v-model="periodStart" 
                                        @change="updatePeriod"
                                        class="period-date-input"
                                    />
                                </div>
                                <div class="period-input-group">
                                    <label>До:</label>
                                    <input 
                                        type="date" 
                                        v-model="periodEnd" 
                                        @change="updatePeriod"
                                        class="period-date-input"
                                    />
                                </div>
                            </div>
                            <div class="period-presets">
                                <div 
                                    v-for="preset in periodPresets" 
                                    :key="preset.value"
                                    class="period-preset"
                                    @click="selectPreset(preset)"
                                >
                                    {{ preset.label }}
                                </div>
                            </div>
                        </div>
                    </div>
                </transition>
            </div>
        </div>
        
        <div class="option">
            <label class="options__label">Тип файлов</label>
            <div class="filter-container">
                <div class="storage__filter" @click="toggleFileTypeFilter">
                    <p class="filter__type">{{ selectedFileType.label }}</p>
                    <img 
                        src="@/assets/filter_icon.png" 
                        class="filter__icon" 
                        :class="{ 'rotate-icon': isFileTypeOpen }"
                    />
                </div>
                
                <transition name="dropdown">
                    <div class="filter-options" v-show="isFileTypeOpen">
                        <div 
                            v-for="option in fileTypeOptions" 
                            :key="option.value"
                            class="filter-option"
                            :class="{ 'selected': selectedFileType.value === option.value }"
                            @click="selectFileType(option)"
                        >
                            {{ option.label }}
                        </div>
                    </div>
                </transition>
            </div>
        </div>
        
        <div class="option">
            <label class="options__label">Контрагент</label>
            <div class="filter-container">
                <div class="storage__filter" @click="toggleCounterpartyFilter">
                    <p class="filter__type">{{ selectedCounterparty.label }}</p>
                    <img 
                        src="@/assets/filter_icon.png" 
                        class="filter__icon" 
                        :class="{ 'rotate-icon': isCounterpartyOpen }"
                    />
                </div>
                
                <transition name="dropdown">
                    <div class="filter-options" v-show="isCounterpartyOpen">
                        <div 
                            v-for="option in counterpartyOptions" 
                            :key="option.value"
                            class="filter-option"
                            :class="{ 'selected': selectedCounterparty.value === option.value }"
                            @click="selectCounterparty(option)"
                        >
                            {{ option.label }}
                        </div>
                    </div>
                </transition>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    data() {
        const today = new Date();
        const firstDayOfYear = new Date(today.getFullYear(), 0, 1);
        
        return {
            // Для фильтра по периоду
            isPeriodOpen: false,
            periodStart: this.formatDateForInput(firstDayOfYear),
            periodEnd: this.formatDateForInput(today),
            selectedPeriod: {
                start: firstDayOfYear,
                end: today
            },
            periodPresets: [
                { label: 'Сегодня', value: 'today' },
                { label: 'Вчера', value: 'yesterday' },
                { label: 'Эта неделя', value: 'this_week' },
                { label: 'Прошлая неделя', value: 'last_week' },
                { label: 'Этот месяц', value: 'this_month' },
                { label: 'Прошлый месяц', value: 'last_month' },
                { label: 'Этот год', value: 'this_year' },
            ],
            
            // Для фильтра по типу файлов
            isFileTypeOpen: false,
            selectedFileType: { label: 'Все', value: 'all' },
            fileTypeOptions: [
                { label: 'Все', value: 'all' },
                { label: 'Документы', value: 'documents' },
                { label: 'Изображения', value: 'images' },
                { label: 'Таблицы', value: 'tables' },
                { label: 'Презентации', value: 'presentations' },
                { label: 'PDF', value: 'pdf' },
                { label: 'Архивы', value: 'archives' },
            ],
            
            // Для фильтра по контрагентам
            isCounterpartyOpen: false,
            selectedCounterparty: { label: 'Все контрагенты', value: 'all' },
            counterpartyOptions: [
                { label: 'Все контрагенты', value: 'all' },
                { label: 'ООО "Ромашка"', value: 'romashka' },
                { label: 'ИП Иванов', value: 'ivanov' },
                { label: 'АО "Технологии"', value: 'tech' },
                { label: 'ЗАО "Строймаш"', value: 'stroymash' },
            ]
        }
    },
    methods: {
        // Методы для фильтра по периоду
        togglePeriodFilter() {
            this.isPeriodOpen = !this.isPeriodOpen
            if (this.isPeriodOpen) {
                this.isFileTypeOpen = false
                this.isCounterpartyOpen = false
            }
        },
        formatDate(date) {
            return date.toLocaleDateString('ru-RU', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            }).replace(/\s/g, '')
        },
        formatDateForInput(date) {
            const year = date.getFullYear()
            const month = String(date.getMonth() + 1).padStart(2, '0')
            const day = String(date.getDate()).padStart(2, '0')
            return `${year}-${month}-${day}`
        },
        updatePeriod() {
            this.selectedPeriod = {
                start: new Date(this.periodStart),
                end: new Date(this.periodEnd)
            }
            this.$emit('period-changed', this.selectedPeriod)
        },
        selectPreset(preset) {
            const today = new Date()
            let start, end
            
            switch(preset.value) {
                case 'today':
                    start = end = new Date()
                    break
                case 'yesterday':
                    start = end = new Date()
                    start.setDate(start.getDate() - 1)
                    break
                case 'this_week':
                    start = new Date()
                    start.setDate(start.getDate() - start.getDay() + (start.getDay() === 0 ? -6 : 1))
                    end = new Date()
                    break
                case 'last_week':
                    end = new Date()
                    end.setDate(end.getDate() - end.getDay())
                    start = new Date(end)
                    start.setDate(start.getDate() - 6)
                    break
                case 'this_month':
                    start = new Date(today.getFullYear(), today.getMonth(), 1)
                    end = new Date()
                    break
                case 'last_month':
                    start = new Date(today.getFullYear(), today.getMonth() - 1, 1)
                    end = new Date(today.getFullYear(), today.getMonth(), 0)
                    break
                case 'this_year':
                    start = new Date(today.getFullYear(), 0, 1)
                    end = new Date()
                    break
            }
            
            this.periodStart = this.formatDateForInput(start)
            this.periodEnd = this.formatDateForInput(end)
            this.selectedPeriod = { start, end }
            this.isPeriodOpen = false
            this.$emit('period-changed', this.selectedPeriod)
        },
        
        // Методы для фильтра по типу файлов
        toggleFileTypeFilter() {
            this.isFileTypeOpen = !this.isFileTypeOpen
            if (this.isFileTypeOpen) {
                this.isPeriodOpen = false
                this.isCounterpartyOpen = false
            }
        },
        selectFileType(option) {
            this.selectedFileType = option
            this.isFileTypeOpen = false
            this.$emit('file-type-changed', option.value)
        },
        
        // Методы для фильтра по контрагентам
        toggleCounterpartyFilter() {
            this.isCounterpartyOpen = !this.isCounterpartyOpen
            if (this.isCounterpartyOpen) {
                this.isPeriodOpen = false
                this.isFileTypeOpen = false
            }
        },
        selectCounterparty(option) {
            this.selectedCounterparty = option
            this.isCounterpartyOpen = false
            this.$emit('counterparty-changed', option.value)
        },
        
        // Закрытие при клике вне элемента
        closeOnClickOutside(e) {
            if (!this.$el.contains(e.target)) {
                this.isPeriodOpen = false
                this.isFileTypeOpen = false
                this.isCounterpartyOpen = false
            }
        }
    },
    mounted() {
        document.addEventListener('click', this.closeOnClickOutside)
    },
    beforeUnmount() {
        document.removeEventListener('click', this.closeOnClickOutside)
    }
}
</script>

<style scoped>
.analysis__options {
    display: flex;
    width: 520px;
    justify-content: space-between;
    padding-top: 10px;
}
.option {
    display: flex;
    flex-direction: column;
    gap: 5px;
    cursor: pointer;
}
.options__label {
    font-size: 10px;
    font-weight: 500;
}

.filter-container {
    position: relative;
    width: 150px;
    user-select: none;
}

.storage__filter {
    width: 100%;
    height: 30px;
    border: 1px solid #e6e6e6;
    border-radius: 10px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 10px;
    cursor: pointer;
    background-color: white;
    transition: all 0.3s ease;
    box-sizing: border-box;
}

.filter__type {
    font-size: 11px;
    color: #a2a2a2;
    margin: 0;
    display: flex;
    align-items: center;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    flex-grow: 1;
    min-width: 0;
}

.filter__icon {
    width: 10px;
    height: 10px;
    transition: transform 0.3s ease;
    flex-shrink: 0;
    margin-left: 5px;
}

.rotate-icon {
    transform: rotate(180deg);
}

.filter-options {
    position: absolute;
    top: 35px;
    left: 0;
    width: 100%;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    background-color: white;
    box-shadow: 0 2px 3px #13346e1f;
    z-index: 100;
    overflow: hidden;
    box-sizing: border-box;
    transform-origin: top center;
}

.period-options {
    padding: 12px;
    width: 360px;
}

.period-picker {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.period-inputs {
    display: flex;
    gap: 10px;
}

.period-input-group {
    display: flex;
    flex-direction: column;
    gap: 5px;
    flex: 1;
}

.period-input-group label {
    font-size: 10px;
    color: #a2a2a2;
}

.period-date-input {
    height: 30px;
    border: 1px solid #e0e0e0;
    border-radius: 6px;
    padding: 0 8px;
    font-size: 11px;
    outline: none;
    transition: border-color 0.2s;
}

.period-date-input:focus {
    border-color: #6C67FD;
}

.period-presets {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
}

.period-preset {
    padding: 6px 10px;
    font-size: 10px;
    background-color: #f5f5ff;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s ease;
}

.period-preset:hover {
    background-color: #e0e0ff;
}

.filter-option {
    padding: 8px 12px;
    font-size: 11px;
    color: #333;
    cursor: pointer;
    transition: all 0.2s ease;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.filter-option:hover {
    background-color: #f5f5ff;
    color: #6C67FD;
}

.filter-option.selected {
    background-color: #6C67FD;
    color: white;
}

.filter-option:first-child {
    border-top-left-radius: 8px;
    border-top-right-radius: 8px;
}

.filter-option:last-child {
    border-bottom-left-radius: 8px;
    border-bottom-right-radius: 8px;
}

/* Анимация выпадения */
.dropdown-enter-active {
    animation: dropdown-in 0.25s ease-out both;
}

.dropdown-leave-active {
    animation: dropdown-out 0.2s ease-in both;
}

.period {
    width: 200px;
}

@keyframes dropdown-in {
    0% {
        opacity: 0;
        transform: translateY(-10px) scaleY(0.95);
    }
    100% {
        opacity: 1;
        transform: translateY(0) scaleY(1);
    }
}

@keyframes dropdown-out {
    0% {
        opacity: 1;
        transform: translateY(0) scaleY(1);
    }
    100% {
        opacity: 0;
        transform: translateY(-10px) scaleY(0.95);
    }
}
</style>