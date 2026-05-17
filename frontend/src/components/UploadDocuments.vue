<template>
  <div class="upload-documents-wrapper">
    <transition name="slide-left">
      <div v-if="!collapsed" class="upload-documents">
        <p class="upload-documents__description">
          Убедитесь, что ваши документы находятся в поддерживаемых форматах (<strong class="upload-documents__format">PDF</strong>, <strong class="upload-documents__format">DOCX</strong>).
          Перетащите выбранные файлы в область ниже или кликните на неё, чтобы открыть стандартное окно выбора. 
          Вы можете загрузить один или несколько файлов.
        </p>

        <div class="upload-documents__dropmenu">
          <button class="upload-documents__button" @click="toggleFileList">
            Мои документы
          </button>
          
          <div class="files-wrapper" ref="filesWrapper" v-show="showFileList">
            <UploadFilesList />
          </div>
          
          <DropMenu @files-added="onFilesAdded" />
          <p class="upload-documents__warning">
            Каждый загруженный файл считается отдельной проверкой!
          </p>
        </div>

        <h3 class="upload-documents__title">Загруженные документы:</h3>
        <p v-if="rejectedFormatWarning" class="upload-documents__reject-warning">
          {{ rejectedFormatWarning }}
        </p>
        <div v-if="files.length === 0" class="upload-documents__empty">
          Загрузите файлы в поле выше для просмотра
        </div>
        <div v-else class="upload-documents__file-list">
          <ul class="upload-file-list">
            <li v-for="item in files" :key="item.id" class="upload-documents__file-item">
              <div class="upload-documents__file-info">
                <img :src="getFileIcon(item)" alt="" class="upload-documents__file-icon" />
                <span class="upload-documents__file-name">{{ truncateFileName(item.name) }}</span>
              </div>
              <div class="upload-documents__file-details">
                <span class="upload-documents__file-size">{{ formatFileSize(item.file?.size || 0) }}</span>
                <img
                  src="@/assets/trash.svg"
                  alt="Удалить"
                  class="upload-documents__file-delete"
                  @click="removeFile(item.id)"
                />
              </div>
            </li>
          </ul>
          <button class="upload__start" 
                  :disabled="!agreed || processing || availableFiles === 0" 
                  @click="startProcessing">
            <template v-if="!processing && availableFiles > 0">
              <p>Запустить проверку и анализ</p>
              <div class="upload__price">
                <p>({{ availableFiles }} <img class="price" src="@/assets/balance.svg" alt=""/>)</p>
              </div>
            </template>
            <template v-else-if="!processing && availableFiles === 0">
              <p>Добавьте файлы для продолжения</p>
            </template>
            <template v-else>
              <img class="upload__gear" src="@/assets/gear.png" alt="Processing" />
            </template>
          </button>

          <div class="agreement">
            <input type="checkbox" class="agreement__checkbox" v-model="agreed" />
            <p class="agreement__text">
              Я даю согласие на сбор, хранение и обработку <a href="#" class="blue agreement__link">персональных данных</a>, содержащихся в загружаемых мной файлах.
            </p>
          </div>
        </div>
      </div>
    </transition>

     
    <div class="small-menu" :class="{ 'hidden': !collapsed }">
      <div class="small-menu__files">
        <!-- Кнопка открытия меню - всегда первая -->
        <button class="small-menu__open-btn" @click="handleMenuToggle">
          <img src="@/assets/upload_folder.svg" class="small-menu__folder-icon" />
        </button>

        <button class="small-menu__add-btn" @click="triggerFileInput">
          <img src="@/assets/plus.png" class="small-menu__plus-icon" />
        </button>

        <input 
          type="file" 
          ref="fileInput" 
          @change="handleFileSelect" 
          multiple 
          accept=".pdf,.docx"
          style="display: none"
        />
        
       
        <div
          v-for="item in files"
          :key="item.id"
          class="small-menu__file"
          @mouseenter="showTooltip(item.id)"
          @mouseleave="hideTooltip">
          <img :src="getFileIcon(item)" class="small-menu__file-icon" />

          <transition name="fade">
            <div
              v-if="activeTooltip === item.id"
              class="small-menu__tooltip"
              @mouseenter="keepTooltipVisible"
              @mouseleave="hideTooltip">
              <span class="small-menu__tooltip-text">{{ truncateFileName(item.name, 20) }}</span>
              <img
                src="@/assets/trash_white.png"
                class="small-menu__tooltip-delete"
                @click.stop="removeFile(item.id)"
              />
            </div>
          </transition>
        </div>
      </div>
      
      <button 
        class="small-menu__start" 
        :disabled="!agreed || processing || availableFiles === 0" 
        @click="startProcessing"
        :class="{ 'processing': processing }">
        <img src="@/assets/play.png" class="start__icon" v-if="!processing"/>
        <template v-else>
          <img class="small-menu__gear" src="@/assets/gear.png" alt="Processing" />
        </template>
      </button>
    </div>
  </div>
</template>

<script>
import DropMenu from '@/components/DropMenu.vue'
import UploadFilesList from '@/components/UploadFilesList.vue'
import { mapStores } from 'pinia'
import { useDocumentsStore, resolveFileType, DOCUMENT_STATUS } from '@/stores/documents'

import pdfIcon from '@/assets/pdf.png'
import docIcon from '@/assets/doc.png'

const REJECTED_WARNING_TIMEOUT = 4000

export default {
  name: 'UploadDocuments',
  components: {
    DropMenu,
    UploadFilesList
  },
  props: {
    collapsed: {
      type: Boolean,
      default: false
    },
    visible: {
      type: Boolean,
      default: true,
    },
    processing: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      agreed: false,
      showFileList: false,
      activeTooltip: null,
      tooltipTimeout: null,
      rejectedFormatWarning: '',
      rejectedWarningTimer: null
    }
  },
  computed: {
    ...mapStores(useDocumentsStore),
    files() {
      return this.documentsStore.items
    },
    availableFiles() {
      return this.files.filter((item) => item.status === DOCUMENT_STATUS.IDLE).length
    }
  },
  methods: {

      
  keepTooltipVisible() {
    // Оставляем тултип видимым при наведении на него
    clearTimeout(this.tooltipTimeout);
  },

  showTooltip(id) {
    clearTimeout(this.tooltipTimeout);
    this.activeTooltip = id;
  },


  hideTooltip() {
    // Добавляем небольшую задержку перед скрытием
    this.tooltipTimeout = setTimeout(() => {
      this.activeTooltip = null;
    }, 200);
  },

  
    triggerFileInput() {
    this.$refs.fileInput.click();
  },
  handleFileSelect(event) {
    const selectedFiles = Array.from(event.target.files);
    this.onFilesAdded(selectedFiles);
    // Сбрасываем значение input, чтобы можно было выбрать те же файлы снова
    event.target.value = '';
  },
    handleMenuToggle() {
    this.$emit('toggle-menu');
    // Ждем завершения анимации раскрытия (200ms)
    setTimeout(() => {
      this.$emit('update-pdf');
    }, 200);
  },
    toggleFileList() {
      const wrapper = this.$refs.filesWrapper;
      if (this.showFileList) {
        wrapper.classList.remove('fade-in');
        wrapper.classList.add('fade-out');
        setTimeout(() => {
          this.showFileList = false;
        }, 100);
      } else {
       
        this.showFileList = true;
        this.$nextTick(() => {
          const wrapper = this.$refs.filesWrapper;
          wrapper.classList.remove('fade-out');
          wrapper.classList.add('fade-in');
        });
      }
    },
    onFilesAdded(newFiles) {
      const rejected = [];
      newFiles.forEach((file) => {
        const added = this.documentsStore.addFile(file);
        if (!added) rejected.push(file.name);
      });
      if (rejected.length > 0) {
        const hasDoc = rejected.some((name) => name.toLowerCase().endsWith('.doc'));
        this.showRejectedWarning(
          hasDoc
            ? 'Формат .doc не поддерживается. Пересохраните файл как .docx.'
            : `Поддерживаются только PDF и DOCX. Отклонены: ${rejected.join(', ')}`
        );
      }
    },
    showRejectedWarning(message) {
      this.rejectedFormatWarning = message;
      clearTimeout(this.rejectedWarningTimer);
      this.rejectedWarningTimer = setTimeout(() => {
        this.rejectedFormatWarning = '';
      }, REJECTED_WARNING_TIMEOUT);
    },
    getFileIcon(item) {
      const type = item.type || resolveFileType(item.name || '');
      if (type === 'pdf') return pdfIcon;
      if (type === 'docx') return docIcon;
      return docIcon;
    },
    formatFileSize(size) {
      if (size < 1024) return size + ' B';
      if (size < 1024 * 1024) return (size / 1024).toFixed(1) + ' KB';
      return (size / (1024 * 1024)).toFixed(1) + ' MB';
    },
    removeFile(id) {
      this.documentsStore.remove(id);
    },
    truncateFileName(name, maxLength = 30) {
      return name.length > maxLength ? name.slice(0, maxLength) + '..' : name;
    },
    startProcessing() {
      if (!this.agreed || this.processing || this.availableFiles === 0) return;
      this.$emit('processing-started');
    }
  },
  beforeUnmount() {
    clearTimeout(this.rejectedWarningTimer);
    clearTimeout(this.tooltipTimeout);
  }
}
</script>

<style scoped>
.upload-documents-wrapper {
  width: 450px; /* Фиксированная ширина */
  position: relative;
}

.start__icon {
  width: 20px;
  height: 20px;
}

.upload-documents {
  width: 450px;
  transition: all 0.3 ease;
}

.upload-documents.collapsed {
  width: 55px;
  opacity: 0;
  padding: 0;
  margin: 0;
  border: none;
}

.upload-documents.collapsed * {
  display: none;
}

.upload-documents__description {
  font-size: 13px;
  line-height: 150%;
  padding-bottom: 20px;
}
.upload-documents__dropmenu {
  display: flex;
  flex-direction: column;
}
.upload-documents__button {
  width: 100px;
  height: 20px;
  color: #000;
  background-color: #fff;
  border: none;
  outline: none;
  border: 1px solid #e6e6e6;
  font-size: 10px;
  font-weight: 600;
  border-radius: 5px;
  cursor: pointer;
  margin-bottom: 10px;
  transition: background-color 0.2s;
}
.upload-documents__button:hover {
  background-color: #e6e6e6;
}
.upload-documents__warning {
  margin: 5px auto 20px;
  font-size: 12px;
  font-weight: 500;
  color: #a2a2a2;
  text-align: center;
}
.upload-documents__format {
  color: #6c67fd;
}
.upload-documents__title {
  font-size: 18px;
  padding-bottom: 10px;
}
.upload-documents__empty {
  margin-bottom: 10px;
}
.upload-documents__reject-warning {
  font-size: 12px;
  color: #d12c2c;
  padding: 8px 10px;
  background: rgba(209, 44, 44, 0.08);
  border: 1px solid rgba(209, 44, 44, 0.3);
  border-radius: 8px;
  margin-bottom: 10px;
}
.upload-documents__file-list {
  list-style: none;
}

.danger {
  background-color: rgba(255,0,0,0.5);
  transition: color 0.2s;
  border-radius: 3px;
  padding: 0px 5px;
}

.danger:hover {
  background-color: rgba(255,0,0,1);
  cursor: pointer;
}


.upload-file-list {
  max-height: 170px;
  overflow: scroll;
}
.upload-documents__file-item {
  width: 450px;
  height: 40px;
  border: 1px solid #e6e6e6;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 10px;
  margin-bottom: 10px;
}
.upload-documents__file-info {
  display: flex;
  align-items: center;
  gap: 5px;
}
.upload-documents__file-icon {
  width: 17px;
  height: 17px;
}
.upload-documents__file-name {
  font-size: 14px;
  color: #000;
}
.upload-documents__file-details {
  display: flex;
  align-items: center;
  gap: 30px;
}
.upload-documents__file-size {
  font-size: 14px;
  color: #6c67fd;
}
.upload-documents__file-delete {
  width: 16px;
  height: 16px;
  cursor: pointer;
}
.upload__start {
  width: 450px;
  height: 50px;
  outline: none;
  border: 1px solid #6c67fd;
  background-color: #6c67fd;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  color: #fff;
  font-size: 16px;
  font-weight: bold;
  gap: 10px;
  cursor: pointer;
  transition: background-color 0.2s, color 0.2s;
}
.upload__start:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.upload__start:hover:not(:disabled) {
  background-color: #fff;
  color: #6c67fd;
}
.upload__start:hover:not(:disabled) .price {
  filter: invert(41%) sepia(75%) saturate(4456%) hue-rotate(233deg) brightness(101%) contrast(97%);
}
.upload__price {
  display: flex;
}
.price {
  filter: contrast(50);
}
.upload__gear {
  width: 24px;
  height: 24px;
  animation: spin 5s linear infinite;
}
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(540deg); }
}
.agreement {
  margin: 10px auto 0;
  display: flex;
  justify-content: center;
  align-items: start;
  gap: 5px;
  text-align: center;
}
.agreement__checkbox {
  cursor: pointer;
}
.agreement__text {
  font-size: 12px;
  width: 400px;
}
.agreement__link:hover {
  text-decoration: underline;
  text-underline-position: under;
}

.files-wrapper {
  transition: opacity 0.15s ease-in-out;
  opacity: 1;
}
.fade-in {
  opacity: 1;
}
.fade-out {
  opacity: 0;
}
.small-menu {
  position: absolute;
  left: 0;
  top: 0;
  width: 55px;
  height: fit-content;
  background: #FFF;
  border: 1px solid #e6e6e6;
  border-radius: 30px;
  padding: 10px 0 10px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  transition: all 0.3s ease;
  margin-right: 20px;
}

.small-menu.hidden {
  opacity: 0;
  pointer-events: none;
}

.small-menu__files {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  height: fit-content;
  width: 100%;
  padding: 0 5px;
  padding-bottom: 20px;
}


.small-menu__file-icon {
  width: 26px;
  height: 26px;
  transition: transform 0.2s;
}
.small-menu__file {
  display: flex;
  justify-content: center;
  width: 100%;
  position: relative;
}

.small-menu__tooltip {
  position: absolute;
  left: calc(100% + 20px);
  top: 50%;
  transform: translateY(-50%);
  background: #333;
  border: 1px solid #e6e6e6;
  border-radius: 6px;
  padding: 5px 8px;
  display: flex;
  align-items: center;
  gap: 10px;
  z-index: 1000; 
  min-width: 120px;
  white-space: nowrap;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
  transform: translateY(-50%) translateX(-10px);
}
.fade-enter-to, .fade-leave-from {
  opacity: 1;
  transform: translateY(-50%) translateX(0);
}

.small-menu__tooltip-text {
  font-size: 12px;
  color: #FFF;
  flex-grow: 1;
  text-align: left;
}

.small-menu__tooltip-delete {
  width: 15px;
  height: 15px;
  cursor: pointer;
  opacity: 0.7;
  transition: opacity 0.2s;
  flex-shrink: 0;
}

.small-menu__tooltip-delete:hover {
  opacity: 1;
}


.small-menu__start {
  width: 35px;
  height: 35px;
  border-radius: 50%;
  background: #6c67fd;
  color: white;
  border: none;
  cursor: pointer;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  box-shadow: 0 2px 5px rgba(108, 103, 253, 0.3);
}

.small-menu__start:disabled {
  background: #BBB9FF;
  cursor: not-allowed;
  box-shadow: none;
}

.small-menu__start:not(:disabled):hover {
  background: #5a55e0;
}

/* Анимация для основного контента */
.slide-left-enter-active,
.slide-left-leave-active {
  transition: all 0.3s ease;
}

.slide-left-enter-from,
.slide-left-leave-to {
  transform: translateX(-20px);
  opacity: 0;
}

.small-menu__open-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #6c67fd;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  margin-bottom: 0px;
  transition: all 0.2s;
  box-shadow: 0 2px 5px rgba(108, 103, 253, 0.1);
}

.small-menu__open-btn:hover {
  background: #4d48d1;
}

.small-menu__folder-icon {
  width: 22px;
  height: 22px;
  filter: brightness(0) invert(1);
}

.small-menu__gear {
  width: 23px;
  height: 23px;
  animation: spin 5s linear infinite;
}

.small-menu__add-btn {
  width: 35px;
  height: 35px;
  border-radius: 50%;
  background: #f4f4f4;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  margin-bottom: 15px;
  transition: all 0.2s;
}

.small-menu__add-btn:hover {
  background: #e0e0e0;
}

.small-menu__plus-icon {
  width: 9px;
  height: 9px;
}
</style>