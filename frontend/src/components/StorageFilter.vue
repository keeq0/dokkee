<template>
  <div class="filter-container">
    <div class="storage__filter" @click="toggleFilter">
      <p class="filter__type">Упорядочить по <span class="filter__value">{{ selectedOption.label }}</span></p>
      <img 
        src="@/assets/filter_icon.png" 
        class="filter__icon" 
        :class="{ 'rotate-icon': isOpen }"
      />
    </div>
    
    <transition name="dropdown">
      <div class="filter-options" v-show="isOpen">
        <div 
          v-for="option in sortOptions" 
          :key="option.value"
          class="filter-option"
          :class="{ 'selected': selectedOption.value === option.value }"
          @click="selectOption(option)"
        >
          {{ option.label }}
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
export default {
  data() {
    return {
      isOpen: false,
      selectedOption: { label: 'названию (А-Я)', value: 'name-asc' }, // Изменено здесь
      sortOptions: [
        { label: 'названию (А-Я)', value: 'name-asc' },
        { label: 'названию (Я-А)', value: 'name-desc' },
        { label: 'дате создания (новые)', value: 'date-new' },
        { label: 'дате создания (старые)', value: 'date-old' },
        { label: 'размеру (по возрастанию)', value: 'size-asc' },
        { label: 'размеру (по убыванию)', value: 'size-desc' },
        { label: 'типу файла', value: 'type' },
        { label: 'последнему изменению', value: 'last-modified' },
        { label: 'частоте использования', value: 'usage' },
      ]
    }
  },
  methods: {
    toggleFilter() {
      this.isOpen = !this.isOpen
    },
    selectOption(option) {
      this.selectedOption = option
      this.isOpen = false
      this.$emit('sort-changed', option.value)
    },
    closeOnClickOutside(e) {
      if (!this.$el.contains(e.target)) {
        this.isOpen = false
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
.filter-container {
  position: relative;
  width: 250px;
  user-select: none;
}

.storage__filter {
  width: 100%;
  height: 30px;
  border: 1px solid #6C67FD;
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

.storage__filter:hover {
  box-shadow: 0 1px 0px rgba(108, 103, 253, 0.2);
}

.filter__type {
  font-size: 10px;
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

.filter__type::after {
  content: "";
  flex: 0 0 10px;
}

.filter__value {
  color: #a2a2a2;
  margin-left: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex-shrink: 1;
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
  width: 200px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background-color: white;
  box-shadow: 0 2px 3px #13346e1f;
  z-index: 100;
  overflow: hidden;
  box-sizing: border-box;
  transform-origin: top center;
}

.filter-option {
  padding: 8px 12px;
  font-size: 10px;
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

/* Улучшенная анимация выпадения */
.dropdown-enter-active {
  animation: dropdown-in 0.25s ease-out both;
}

.dropdown-leave-active {
  animation: dropdown-out 0.2s ease-in both;
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