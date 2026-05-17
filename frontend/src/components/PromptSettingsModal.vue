<template>
  <transition name="modal-fade">
    <div v-if="visible" class="prompt-modal" role="dialog" aria-modal="true" @click.self="onCancel">
      <div class="prompt-modal__panel">
        <header class="prompt-modal__header">
          <h3 class="prompt-modal__title">Настройка анализа</h3>
          <button type="button" class="prompt-modal__close" aria-label="Закрыть" @click="onCancel">×</button>
        </header>
        <p class="prompt-modal__hint">
          Отметьте дополнительные фокусы. ИИ применит их к базовому промпту.
        </p>
        <ul class="prompt-modal__options">
          <li v-for="key in optionKeys" :key="key" class="prompt-modal__option">
            <label class="prompt-modal__label">
              <input
                type="checkbox"
                class="prompt-modal__checkbox"
                :checked="selected[key]"
                @change="toggle(key)" />
              <span class="prompt-modal__option-text">{{ labels[key] }}</span>
            </label>
          </li>
        </ul>
        <footer class="prompt-modal__footer">
          <button type="button" class="prompt-modal__btn" @click="onCancel">Отмена</button>
          <button type="button" class="prompt-modal__btn prompt-modal__btn--primary" @click="onConfirm">
            Запустить анализ<span v-if="selectedCount"> ({{ selectedCount }})</span>
          </button>
        </footer>
      </div>
    </div>
  </transition>
</template>

<script>
import { PROMPT_OPTION_LABELS } from '@/services/risks';

const STORAGE_KEY = 'dokkee:prompt-options';

function loadFromStorage() {
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch (error) {
    return null;
  }
}

function saveToStorage(state) {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  } catch (error) {
    // ignore quota / private mode
  }
}

export default {
  name: 'PromptSettingsModal',
  props: {
    visible: { type: Boolean, default: false }
  },
  emits: ['confirm', 'cancel'],
  data() {
    return {
      labels: PROMPT_OPTION_LABELS,
      selected: this.buildInitialState()
    };
  },
  computed: {
    optionKeys() {
      return Object.keys(this.labels);
    },
    selectedKeys() {
      return this.optionKeys.filter((key) => this.selected[key]);
    },
    selectedCount() {
      return this.selectedKeys.length;
    }
  },
  methods: {
    buildInitialState() {
      const fromStorage = loadFromStorage() || {};
      const state = {};
      Object.keys(PROMPT_OPTION_LABELS).forEach((key) => {
        state[key] = Boolean(fromStorage[key]);
      });
      return state;
    },
    toggle(key) {
      this.selected = { ...this.selected, [key]: !this.selected[key] };
    },
    onConfirm() {
      saveToStorage(this.selected);
      this.$emit('confirm', [...this.selectedKeys]);
    },
    onCancel() {
      this.$emit('cancel');
    }
  }
};
</script>

<style scoped>
.prompt-modal {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(2px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.prompt-modal__panel {
  width: 460px;
  max-width: calc(100vw - 32px);
  background: #fff;
  border-radius: 16px;
  padding: 20px 22px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.prompt-modal__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.prompt-modal__title {
  font-size: 18px;
  font-weight: 700;
  margin: 0;
}

.prompt-modal__close {
  background: transparent;
  border: none;
  font-size: 22px;
  line-height: 1;
  cursor: pointer;
  color: #666;
  padding: 0 4px;
}

.prompt-modal__close:hover {
  color: #000;
}

.prompt-modal__hint {
  font-size: 12px;
  color: #6b6b6b;
  margin: 0;
}

.prompt-modal__options {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.prompt-modal__option {
  padding: 8px 10px;
  border: 1px solid #ececec;
  border-radius: 8px;
  transition: background-color 0.15s ease, border-color 0.15s ease;
}

.prompt-modal__option:hover {
  background: #f7f7f7;
  border-color: #d9d9d9;
}

.prompt-modal__label {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  font-size: 13px;
  color: #222;
}

.prompt-modal__checkbox {
  cursor: pointer;
  width: 16px;
  height: 16px;
  accent-color: #6c67fd;
}

.prompt-modal__option-text {
  line-height: 1.3;
}

.prompt-modal__footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 4px;
}

.prompt-modal__btn {
  height: 36px;
  padding: 0 16px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  border: 1px solid #d9d9d9;
  background: #fff;
  transition: background-color 0.15s ease, color 0.15s ease, border-color 0.15s ease;
}

.prompt-modal__btn:hover {
  background: #f3f3f3;
}

.prompt-modal__btn--primary {
  background: #6c67fd;
  color: #fff;
  border-color: #6c67fd;
}

.prompt-modal__btn--primary:hover {
  background: #5854d8;
  border-color: #5854d8;
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.2s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
</style>
