<template>
  <div class="main-page">
    <div class="main-page__header">
      <h1 class="main-page__title">Загрузка документов</h1>
      <button 
        class="main-page__hide" 
        @click="toggleUploadDocuments"
        :disabled="uploadDocumentsCollapsed"
        :class="{ 'disabled': uploadDocumentsCollapsed }">
        Скрыть меню
      </button>
    </div>
    <div class="main-page__content">
      <div class="upload-documents-container" :class="{ 'collapsed': uploadDocumentsCollapsed }">
        <UploadDocuments
          @update-pdf="handlePdfUpdate"
          :collapsed="uploadDocumentsCollapsed"
          @toggle-menu="uploadDocumentsCollapsed = false"
          :processing="processing"
          @processing-started="handleProcessingStarted" />
      </div>
      <div class="analysis-container" :class="{ 'expanded': uploadDocumentsCollapsed }">
        <AnalysisResult
          ref="analysisResult"
          :expanded="uploadDocumentsCollapsed"
          @analysis-complete="handleAnalysisComplete"
          @show-assistant="activateAssistant"
          @document-changed="handleDocumentChanged" />
      </div>

      <AiAssistant
        v-if="showAssistant"
        ref="assistantRef"
        :visible="assistantVisible"
        @close="hideAssistant"
        @processing-complete="handleProcessingComplete"
        :analysisResult="analysisResult"
        :analysisError="analysisError" />
      <PromptSettingsModal
        :visible="promptModalOpen"
        @confirm="handlePromptConfirm"
        @cancel="handlePromptCancel" />
    </div>
  </div>
</template>

<script>
import { mapStores } from 'pinia';
import AiAssistant from '@/components/AiAssistant.vue';
import AnalysisResult from '@/components/AnalysisResult.vue';
import PromptSettingsModal from '@/components/PromptSettingsModal.vue';
import UploadDocuments from '@/components/UploadDocuments.vue';
import { useDocumentsStore } from '@/stores/documents';

export default {
  name: 'MainPage',
  components: { AiAssistant, AnalysisResult, PromptSettingsModal, UploadDocuments },
  data() {
    return {
      uploadDocumentsCollapsed: false,
      showUploadDocuments: true,
      processing: false,
      showAssistant: false,
      assistantVisible: false,
      promptModalOpen: false,
      // Флаг "первое автооткрытие случилось". Сбрасывается на новой сессии анализа.
      firstAnalysisAutoOpened: false,
      // ID документов, для которых пользователь уже видел результат (или анализ
      // уже завершён) - используется для подавления повторных авто-открытий.
      analysisDoneSeen: new Set()
    }
  },
  computed: {
    ...mapStores(useDocumentsStore),
    analysisResult() {
      return this.documentsStore.selected?.analysisResult ?? null;
    },
    analysisError() {
      return this.documentsStore.selected?.analysisError ?? false;
    }
  },
  methods: {
    handlePdfUpdate() {
    this.$nextTick(() => {
      if (this.$refs.analysisResult) {
        this.$refs.analysisResult.updatePdfSize();
      }
    });
  },
  toggleUploadDocuments() {
    this.uploadDocumentsCollapsed = !this.uploadDocumentsCollapsed;
    this.$nextTick(() => {
      if (this.$refs.analysisResult) {
        this.$refs.analysisResult.updatePdfSize();
      }
    });
  },
    handleAnalysisComplete(payload) {
      // payload: { result, error, documentId }
      const docId = payload?.documentId;
      if (docId == null) return;
      if (this.analysisDoneSeen.has(docId)) return;
      this.analysisDoneSeen.add(docId);

      // Авто-переоткрытие: только ОДИН раз за сессию И только при ПЕРВОМ
      // завершённом документе И только если активен ИМЕННО ЭТОТ документ
      // в просмотрщике И ассистент сейчас скрыт (пользователь его закрыл).
      if (this.firstAnalysisAutoOpened) return;
      this.firstAnalysisAutoOpened = true;
      const activeDocId = this.documentsStore.selectedId;
      if (activeDocId !== docId) return;
      if (this.showAssistant) return;
      this.activateAssistant();
    },

    activateAssistant() {
      this.showAssistant = true;
      this.$nextTick(() => {
        this.assistantVisible = true;
      });
    },


    handleProcessingStarted() {
      this.promptModalOpen = true;
    },
    handlePromptConfirm(options) {
      this.promptModalOpen = false;
      this.processing = true;
      // Новая сессия анализа - сбрасываем флаги автооткрытия.
      this.firstAnalysisAutoOpened = false;
      this.analysisDoneSeen = new Set();
      // Сразу открываем ассистента с активным документом (требование #19 п. 1.1).
      this.activateAssistant();
      this.$nextTick(() => {
        if (this.$refs.analysisResult?.startAnalysisForAll) {
          this.$refs.analysisResult.startAnalysisForAll(options);
        }
      });
    },
    handlePromptCancel() {
      this.promptModalOpen = false;
    },
    handleProcessingComplete() {
      this.processing = false;
    },

    hideAssistant() {
      this.assistantVisible = false;
    },
    handleDocumentChanged() {
      // При смене документа НЕ скрываем ассистента: он реактивно покажет
      // отчёт и чат нового документа (через store.selected). Состояние каждого
      // документа сохраняется per-doc в documents store.
    }
  }
}
</script>

<style scoped>


.upload-documents-container {
  width: 450px;
  transition: width 0.3s ease;
}

.upload-documents-container.collapsed {
  width: 70px;
}

/* Анимация для плавного скрытия */
.slide-left-enter-active,
.slide-left-leave-active {
  transition: all 0.5s ease;
}

.slide-left-enter-from,
.slide-left-leave-to {
  transform: translateX(-100%);
  opacity: 0;
}

.main-page__title {
  font-size: 28px;
}
.main-page__content {
  display: flex;
  position: relative;
  height: 600px;
}

.analysis-container {
  position: absolute;
  left: 470px; /* 450px upload + 20px gap */
  width: 620px;
  transition: all 0.3s ease;
}

.analysis-container.expanded {
  left: 75px; /* 55px collapsed + 20px gap */
  width: calc(100% - 95px);
  max-width: none;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter, .fade-leave-to {
  opacity: 0;
}

.analysis-result-wrapper {
  flex: 1;
  min-width: 520px;
  transition: all 0.3s ease;
}



.analysis-result-wrapper.expanded {
  width: calc(100% - 75px); 
  max-width: none;
}

.main-page__header {
  display: flex;
  align-items: center;
  gap: 15px;
  padding-bottom: 20px;
}

.main-page__hide {
  width: fit-content;
  height: 25px;
  background: #fff;
  border: none;
  outline: none;
  border-radius: 10px;
  color: #000;
  font-weight: 500;
  font-size: 12px;
  cursor: pointer;
  border: 1px solid #e6e6e6;
  padding: 0 10px;
}

.main-page__hide:hover:not(.disabled) {
  background-color: #f7f7f7;
}

.main-page__hide.disabled {
  color: #e6e6e6;
  cursor: not-allowed;
  border-color: #e6e6e6;
}
</style>