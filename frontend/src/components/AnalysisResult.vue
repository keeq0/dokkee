<template>
  <div class="analysis">
    <div class="analysis__header">
      <div class="analysis__header-left">
      <div class="analysis__file-selector">
        <p class="file-selector__text">Файл:</p>
        <div
          class="file-selector"
          :class="{ 'file-selector--disabled': documents.length === 0, 'file-selector--open': fileSelectorOpen }"
          @click="openFileSelector">
          <p class="file">{{ truncatedDocumentName }}{{ totalPages ? ` (${totalPages} стр.)` : '' }}</p>
          <img src="@/assets/black-arrow.png" class="file-selector__icon" />
          <ul v-if="fileSelectorOpen" class="file-selector__dropdown" @click.stop>
            <li
              v-for="doc in documents"
              :key="doc.id"
              class="file-selector__item"
              :class="{ 'file-selector__item--active': selectedDocument && doc.id === selectedDocument.id }"
              @click="selectDocument(doc.id)">
              <span class="file-selector__item-name">{{ doc.name }}</span>
              <span class="file-selector__item-type">{{ doc.type ? doc.type.toUpperCase() : '' }}</span>
            </li>
          </ul>
        </div>
      </div>
      <div
        class="analysis__font-size-selector"
        :class="{ 'font-size-selector--open': fontSizeOpen }"
        @click="toggleFontSize"
        ref="fontSizeRoot">
        <p class="font-size-selector__size">{{ fontScalePercent }}%</p>
        <img src="@/assets/black-arrow.png" class="file-selector__icon" />
        <div v-if="fontSizeOpen" class="font-size-popover" @click.stop>
          <label class="font-size-popover__label" for="font-size-input">Размер текста</label>
          <div class="font-size-popover__controls">
            <input
              id="font-size-input"
              type="number"
              class="font-size-popover__input"
              :min="fontScaleMin"
              :max="fontScaleMax"
              step="1"
              :value="fontScalePercent"
              @input="onFontScaleInput"
              @blur="commitFontScale"
              @keydown.enter="commitFontScale" />
            <span class="font-size-popover__unit">%</span>
            <button
              type="button"
              class="font-size-popover__reset"
              :disabled="fontScalePercent === 100"
              @click="resetFontScale">
              Сброс
            </button>
          </div>
          <input
            type="range"
            class="font-size-popover__slider"
            :min="fontScaleMin"
            :max="fontScaleMax"
            step="1"
            :value="fontScalePercent"
            @input="onFontScaleInput" />
          <div class="font-size-popover__legend">
            <span>{{ fontScaleMin }}%</span>
            <span>100%</span>
            <span>{{ fontScaleMax }}%</span>
          </div>
        </div>
      </div>
      </div>
      <div class="analysis__progress">
        <div class="progress__info">
          <img src="@/assets/ai.svg" class="progress__info-icon" />
          <p class="progress__status">{{ progressStatusText }}</p>
        </div>
        <div class="progress__bar">
          <div class="bar">
            <div class="bar__fill" :style="{ width: progressPercent + '%' }"></div>
          </div>
          <p class="bar__percentage">{{ progressPercent }}%</p>
        </div>
        <div
          v-if="documents.length > 0"
          class="progress__popover"
          role="tooltip">
          <ul class="progress__popover-list">
            <li
              v-for="item in documentProgressList"
              :key="item.id"
              class="progress__popover-item"
              :class="{ 'progress__popover-item--active': item.isSelected }">
              <span class="progress__popover-name" :title="item.name">{{ item.name }}</span>
              <div class="progress__popover-bar">
                <div class="progress__popover-fill" :style="{ width: item.progress + '%' }"></div>
              </div>
              <span class="progress__popover-percent">{{ item.progress }}%</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
    <div class="analysis__content">

      <div class="content__document-wrap">
        <div
          class="content__document"
          ref="documentContainer"
          :style="{ '--preview-font-scale': fontScale }"
          @mousedown="onContainerMouseDown"
          @mousemove="onContainerMouseMove"
          @mouseup="onContainerMouseUp"
          @mouseleave="onContainerMouseUp">
          <div v-if="!hasDocument" class="content__placeholder">
            Загрузите документ(-ы) для начала работы
          </div>
          <div v-if="resizing" class="pdf-loading-overlay">
            <div class="pdf-loading-dots">
              <div class="pdf-loading-dot"></div>
              <div class="pdf-loading-dot"></div>
              <div class="pdf-loading-dot"></div>
            </div>
          </div>
        </div>
        <transition name="risk-popover-slide">
          <div
            v-if="activeRisk"
            class="risk-popover"
            :class="[
              `risk-popover--${RISK_LEVEL_KEYS[activeRisk.level]}`,
              { 'risk-popover--expanded': popoverExpanded }
            ]"
            @click.stop>
            <div class="risk-popover__main">
              <div class="risk-popover__top">
                <span class="risk-popover__level-pill">{{ activeRisk.level }}</span>
                <h5 class="risk-popover__title">{{ activeRisk.name }}</h5>
                <button
                  type="button"
                  class="risk-popover__accept"
                  :class="{ 'risk-popover__accept--active': activeRisk.completed }"
                  @click="toggleRiskCompleted">
                  <span>{{ activeRisk.completed ? 'Снять' : 'Принять риск' }}</span>
                  <span class="risk-popover__accept-arrow">›</span>
                </button>
              </div>
              <div class="risk-popover__quote-row">
                <span class="risk-popover__quote-bar" aria-hidden="true"></span>
                <blockquote class="risk-popover__quote">{{ activeRisk.section ? `${activeRisk.section}: ` : '' }}{{ activeRisk.quote }}</blockquote>
              </div>
              <p class="risk-popover__comment">{{ activeRisk.comment }}</p>
              <div class="risk-popover__bottom-row">
                <button
                  type="button"
                  class="risk-popover__recom-btn"
                  :class="{ 'risk-popover__recom-btn--active': recommendationsExpanded }"
                  :disabled="!activeRisk.recommendations?.length"
                  @click="recommendationsExpanded = !recommendationsExpanded">
                  РЕКОМЕНДАЦИИ
                </button>
                <button
                  type="button"
                  class="risk-popover__ask"
                  @click="askAiAboutRisk">
                  Спросить у ИИ ›
                </button>
              </div>
              <ul v-if="recommendationsExpanded && activeRisk.recommendations?.length" class="risk-popover__recommendations">
                <li v-for="(rec, idx) in activeRisk.recommendations" :key="idx">{{ rec }}</li>
              </ul>
            </div>
            <button
              type="button"
              class="risk-popover__expand"
              :aria-label="popoverExpanded ? 'Свернуть' : 'Раскрыть'"
              @click="popoverExpanded = !popoverExpanded">
              <span class="risk-popover__expand-label">{{ popoverExpanded ? 'Свернуть' : 'Раскрыть' }}</span>
            </button>
            <button
              type="button"
              class="risk-popover__close"
              @click="closeRiskPopover"
              aria-label="Закрыть">×</button>
          </div>
        </transition>
      </div>

      <div class="content__panel" :class="{ 'expanded': expanded }">
        <ul class="panel__levels">
          <li class="levels__item">
            <div class="item__color green"></div>
            <p class="item__text">Хорошо</p>
          </li>
          <li class="levels__item">
            <div class="item__color yellow"></div>
            <p class="item__text">Сомнительно</p>
          </li>
          <li class="levels__item">
            <div class="item__color red"></div>
            <p class="item__text">Большие риски</p>
          </li>
        </ul>
        <div class="ai-assistant__block">
          <button
            class="panel__button ai-assistant"
            :disabled="!aiAssistantAvailable"
            @click="toggleAssistant">
            <img src="@/assets/ai_white.svg" class="button__icon" alt=""/>
            <p>ИИ-помощник</p>
          </button>
        </div>

        <div class="help-buttons__block">
          <button class="panel__button save" :disabled="!analysisComplete">
            <p>Сохранить</p>
          </button>
          <button
            class="panel__button save"
            :disabled="!analysisComplete || isExporting"
            @click="downloadReport">
            <p>{{ isExporting ? 'Готовлю...' : 'Скачать отчёт' }}</p>
          </button>
        </div>
        <div class="risk-panel">
          <p v-if="!risks.length" class="risk-panel__empty">
            Риски появятся после анализа документа.
          </p>
          <template v-else>
            <section
              v-for="level in [RISK_LEVEL.DANGER, RISK_LEVEL.WARN, RISK_LEVEL.GOOD]"
              :key="level"
              v-show="groupedRisks[level].length > 0"
              class="risk-panel__group"
              :class="`risk-panel__group--${RISK_LEVEL_KEYS[level]}`">
              <h4 class="risk-panel__group-title">{{ level }} ({{ groupedRisks[level].length }})</h4>
              <ul class="risk-panel__list">
                <li
                  v-for="risk in groupedRisks[level]"
                  :key="risks.indexOf(risk)"
                  class="risk-panel__item"
                  :class="{ 'risk-panel__item--active': activeRiskKey === risks.indexOf(risk), 'risk-panel__item--completed': risk.completed }"
                  @click="selectRisk(risks.indexOf(risk))">
                  {{ riskDisplayName(risk) }}
                </li>
              </ul>
            </section>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { renderAsync as renderDocxAsync } from 'docx-preview';
import { mapStores } from 'pinia';
import { chatCompletion, DEEPSEEK_MODELS } from '@/services/deepseek';
import { highlightTextInRoot, clearHighlights } from '@/services/highlight';
import { downloadAnalysisReport } from '@/services/reportExport';
import {
  buildAnalysisPrompt,
  parseAnalysisResponse,
  groupRisksByLevel,
  RISK_LEVEL,
  RISK_LEVEL_KEYS
} from '@/services/risks';
import { useDocumentsStore, DOCUMENT_STATUS } from '@/stores/documents';
import {
  createProgressEmulator,
  getProgressStatusText
} from '@/composables/useAnalysisProgress';

export default {
  name: 'AnalysisResult',
  components: {},
  props: {
    expanded: {
      type: Boolean,
      default: false
    }
  },
  emits: ['analysis-complete', 'show-assistant', 'document-changed'],
  data() {
    return {
      totalPages: 0,
      pdfjsLib: null,
      zoom: 1.5,
      minZoom: 1,
      maxZoom: 3,
      resizing: false,
      fileSelectorOpen: false,
      fontSizeOpen: false,
      fontScalePercent: 100,
      fontScaleMin: 50,
      fontScaleMax: 200,
      renderedDocId: null,
      analysisControllers: new Map(),
      emulators: new Map(),
      onDocumentClick: null,
      activeRiskKey: null,
      recommendationsExpanded: false,
      popoverExpanded: false,
      isExporting: false,
      fontScaleRerenderTimer: null,
      panState: {
        active: false,
        startX: 0,
        startY: 0,
        scrollLeft: 0,
        scrollTop: 0
      },
      RISK_LEVEL,
      RISK_LEVEL_KEYS
    };
  },
  computed: {
    ...mapStores(useDocumentsStore),
    documents() {
      return this.documentsStore.items;
    },
    selectedDocument() {
      return this.documentsStore.selected;
    },
    documentName() {
      return this.selectedDocument?.name || 'Документ';
    },
    documentUrl() {
      return this.selectedDocument?.url || '';
    },
    documentType() {
      return this.selectedDocument?.type || null;
    },
    analysisResult() {
      return this.selectedDocument?.analysisResult ?? null;
    },
    analysisError() {
      return this.selectedDocument?.analysisError ?? false;
    },
    analysisInProgress() {
      const status = this.selectedDocument?.status;
      return status === DOCUMENT_STATUS.EXTRACTING || status === DOCUMENT_STATUS.ANALYZING;
    },
    truncatedDocumentName() {
      return this.documentName && this.documentName.length > 15
        ? this.documentName.slice(0, 15) + '..'
        : this.documentName;
    },
    hasDocument() {
      return Boolean(this.selectedDocument);
    },
    analysisComplete() {
      return this.analysisResult !== null && !this.analysisError && !this.analysisInProgress;
    },
    aiAssistantAvailable() {
      // Кнопка ИИ-помощник активна сразу после старта анализа,
      // а не только после 100%-завершения.
      return this.analysisInProgress || this.analysisComplete;
    },
    progressPercent() {
      if (this.analysisComplete) return 100;
      return this.selectedDocument?.progress ?? 0;
    },
    progressStatusText() {
      if (this.analysisError) return 'Ошибка анализа';
      if (this.analysisComplete) return 'Анализ завершён';
      if (this.analysisInProgress) {
        return getProgressStatusText(this.progressPercent);
      }
      return 'Ожидаю…';
    },
    documentProgressList() {
      return this.documents.map((doc) => ({
        id: doc.id,
        name: doc.name,
        progress: doc.status === DOCUMENT_STATUS.DONE ? 100 : doc.progress || 0,
        isSelected: this.selectedDocument?.id === doc.id
      }));
    },
    fontScale() {
      return this.fontScalePercent / 100;
    },
    risks() {
      return this.selectedDocument?.risks || [];
    },
    groupedRisks() {
      return groupRisksByLevel(this.risks);
    },
    activeRisk() {
      if (this.activeRiskKey === null) return null;
      return this.risks[this.activeRiskKey] || null;
    }
  },
  methods: {
    openFileSelector() {
      if (this.documents.length > 0) {
        this.fileSelectorOpen = !this.fileSelectorOpen;
        if (this.fileSelectorOpen) this.fontSizeOpen = false;
      }
    },
    selectDocument(id) {
      this.fileSelectorOpen = false;
      if (id === this.documentsStore.selectedId) return;
      this.documentsStore.select(id);
    },
    toggleFontSize() {
      this.fontSizeOpen = !this.fontSizeOpen;
      if (this.fontSizeOpen) this.fileSelectorOpen = false;
    },
    clampFontScale(value) {
      const n = Number(value);
      if (!Number.isFinite(n)) return this.fontScalePercent;
      return Math.max(this.fontScaleMin, Math.min(this.fontScaleMax, Math.round(n)));
    },
    onFontScaleInput(event) {
      this.fontScalePercent = this.clampFontScale(event.target.value);
    },
    commitFontScale(event) {
      this.fontScalePercent = this.clampFontScale(event.target.value);
    },
    resetFontScale() {
      this.fontScalePercent = 100;
    },
    riskDisplayName(risk) {
      // В risk-panel показываем только название (без пункта/раздела).
      // Пункт виден в попапе. Очищаем префикс типа "п. 2.3 - Название" -> "Название".
      const name = risk?.name || (risk?.quote || '').slice(0, 40);
      if (!risk?.section) return name;
      // Если name начинается с section, обрезаем префикс.
      const sectionPrefix = String(risk.section).trim();
      const trimmed = name.replace(new RegExp(`^\\s*${sectionPrefix.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\$&')}\\s*[-—:.]?\\s*`, 'i'), '');
      return trimmed || name;
    },
    selectRisk(index) {
      this.activeRiskKey = index;
      this.recommendationsExpanded = false;
      this.fileSelectorOpen = false;
      this.fontSizeOpen = false;
      // Попап теперь не позиционируем по координатам - он закреплён внизу
      // через CSS. Только скроллим к маркеру в документе.
      this.$nextTick(() => this.scrollToActiveRiskMark(index));
    },
    closeRiskPopover() {
      this.activeRiskKey = null;
      this.recommendationsExpanded = false;
      this.popoverExpanded = false;
    },
    scrollToActiveRiskMark(index) {
      const docContainer = this.$refs.documentContainer;
      if (!docContainer) return;
      const mark = docContainer.querySelector(`.risk-highlight[data-risk-id="${index}"]`);
      if (!mark) return;
      mark.scrollIntoView({ behavior: 'smooth', block: 'center' });
    },
    toggleRiskCompleted() {
      if (this.activeRiskKey === null) return;
      const doc = this.selectedDocument;
      if (!doc) return;
      const risk = this.risks[this.activeRiskKey];
      if (!risk) return;
      this.documentsStore.setRiskCompleted(doc.id, this.activeRiskKey, !risk.completed);
    },
    askAiAboutRisk() {
      if (!this.activeRisk) return;
      const doc = this.selectedDocument;
      if (doc) {
        this.documentsStore.update(doc.id, { pinnedRisk: { ...this.activeRisk } });
      }
      this.$emit('show-assistant', { risk: this.activeRisk });
      this.closeRiskPopover();
    },
    onContainerMouseDown(event) {
      // Drag-to-pan только при увеличенном масштабе (> 100%) и если кликнули
      // НЕ по интерактивному элементу (риск-маркер, текст для выделения и т.п.).
      if (this.fontScale <= 1) return;
      if (event.button !== 0) return;
      if (event.target.closest('.risk-highlight, .risk-popover, mark.risk-highlight')) return;
      const container = this.$refs.documentContainer;
      if (!container) return;
      this.panState.active = true;
      this.panState.startX = event.clientX;
      this.panState.startY = event.clientY;
      this.panState.scrollLeft = container.scrollLeft;
      this.panState.scrollTop = container.scrollTop;
      container.classList.add('content__document--panning');
      event.preventDefault();
    },
    onContainerMouseMove(event) {
      if (!this.panState.active) return;
      const container = this.$refs.documentContainer;
      if (!container) return;
      const dx = event.clientX - this.panState.startX;
      const dy = event.clientY - this.panState.startY;
      container.scrollLeft = this.panState.scrollLeft - dx;
      container.scrollTop = this.panState.scrollTop - dy;
    },
    onContainerMouseUp() {
      if (!this.panState.active) return;
      this.panState.active = false;
      const container = this.$refs.documentContainer;
      if (container) container.classList.remove('content__document--panning');
    },
    getHighlightRoots() {
      const container = this.$refs.documentContainer;
      if (!container) return [];
      // DOCX - один root .docx-preview (wrap mode).
      // PDF - множество .pdf-text-layer по одному на страницу (overlay mode).
      const roots = Array.from(container.querySelectorAll('.docx-preview, .pdf-text-layer'));
      return roots;
    },
    getHighlightConfigForRoot(root) {
      if (root.classList.contains('pdf-text-layer')) {
        return { mode: 'overlay', baseClass: 'risk-highlight risk-highlight--overlay' };
      }
      return { mode: 'wrap', baseClass: 'risk-highlight' };
    },
    applyRiskHighlights() {
      const roots = this.getHighlightRoots();
      if (roots.length === 0) return;
      roots.forEach((root) => this.clearRiskHighlights(root));
      this.risks.forEach((risk, index) => {
        if (!risk?.quote || risk.quote.length < 3) return;
        const levelKey = RISK_LEVEL_KEYS[risk.level];
        if (!levelKey) return;
        for (const root of roots) {
          const { mode, baseClass } = this.getHighlightConfigForRoot(root);
          const result = highlightTextInRoot(root, risk.quote, {
            mode,
            className: `${baseClass} risk-highlight--${levelKey}`,
            dataset: { riskId: String(index) },
            onClick: (event) => {
              event.stopPropagation();
              this.selectRisk(index);
            }
          });
          if (result) break;
        }
      });
    },
    clearRiskHighlights(rootEl) {
      const root = rootEl || this.$refs.documentContainer;
      if (!root) return;
      clearHighlights(root, 'mark.risk-highlight');
      root.querySelectorAll('span.risk-highlight--overlay').forEach((el) => el.remove());
    },
    handleDocumentClick(event) {
      if (this.fontSizeOpen && !this.$refs.fontSizeRoot?.contains(event.target)) {
        this.fontSizeOpen = false;
      }
      if (this.fileSelectorOpen) {
        const fileSelector = this.$el.querySelector?.('.file-selector');
        if (fileSelector && !fileSelector.contains(event.target)) {
          this.fileSelectorOpen = false;
        }
      }
      if (this.activeRiskKey !== null) {
        const popover = this.$el.querySelector?.('.risk-popover');
        const isRiskPanel = event.target.closest?.('.risk-panel');
        const isHighlight = event.target.closest?.('.risk-highlight');
        if (popover && !popover.contains(event.target) && !isRiskPanel && !isHighlight) {
          this.closeRiskPopover();
        }
      }
    },
    async ensurePdfJs() {
      if (this.pdfjsLib) return this.pdfjsLib;
      const pdfLibUrl = '/pdfjs/legacy/build/pdf.mjs';
      try {
        this.pdfjsLib = await import(/* webpackIgnore: true */ /* @vite-ignore */ pdfLibUrl);
        this.pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdfjs/legacy/build/pdf.worker.mjs';
        return this.pdfjsLib;
      } catch (error) {
        console.warn('PDF.js не загружен:', error?.message || error);
        return null;
      }
    },
    async renderSelectedDocument() {
      const doc = this.selectedDocument;
      if (!doc) return;
      if (this.renderedDocId === doc.id && doc.htmlPreview) return;
      const container = this.$refs.documentContainer;
      if (!container) return;

      container.querySelectorAll('.docx-preview, .pdf-page-container').forEach((el) => el.remove());

      if (doc.type === 'pdf') {
        await this.renderPDF(doc);
      } else if (doc.type === 'docx') {
        await this.renderDocx(doc);
      }
      this.renderedDocId = doc.id;
    },
    startAnalysisForAll(options = []) {
      this.documents.forEach((doc) => {
        if (doc.status !== DOCUMENT_STATUS.IDLE) return;
        if (doc.analysisResult || doc.analysisError) return;
        this.runAnalysisFor(doc.id, options);
      });
    },
    startEmulatorFor(docId) {
      this.stopEmulatorFor(docId);
      const emulator = createProgressEmulator({
        onProgress: (value) => {
          const item = this.documentsStore.byId(docId);
          if (!item) return;
          if (item.status === DOCUMENT_STATUS.DONE || item.status === DOCUMENT_STATUS.ERROR) return;
          this.documentsStore.setProgress(docId, value);
        }
      });
      this.emulators.set(docId, emulator);
      emulator.start();
    },
    stopEmulatorFor(docId) {
      const emulator = this.emulators.get(docId);
      if (emulator) {
        emulator.stop();
        this.emulators.delete(docId);
      }
    },
    async runAnalysisFor(docId, options = []) {
      const doc = this.documentsStore.byId(docId);
      if (!doc) return;
      if (doc.analysisResult || doc.analysisError) return;
      if (doc.status === DOCUMENT_STATUS.ANALYZING || doc.status === DOCUMENT_STATUS.EXTRACTING) return;

      this.startEmulatorFor(docId);

      let text = doc.extractedText;
      if (!text) {
        this.documentsStore.setStatus(docId, DOCUMENT_STATUS.EXTRACTING);
        if (doc.type === 'pdf') {
          text = await this.extractPdfText(doc);
        } else if (doc.type === 'docx') {
          if (!doc.htmlPreview) {
            await this.renderDocx(doc);
          }
          text = this.documentsStore.byId(docId)?.extractedText || '';
        }
        if (text) this.documentsStore.setExtractedText(docId, text);
      }
      if (!text) {
        this.stopEmulatorFor(docId);
        this.documentsStore.setAnalysisError(docId, true);
        return;
      }
      await this.analyzeDocument(doc, text, options);
    },
    async analyzeDocument(doc, text, options = []) {
      const existingController = this.analysisControllers.get(doc.id);
      if (existingController) existingController.abort();
      const controller = new AbortController();
      this.analysisControllers.set(doc.id, controller);
      this.documentsStore.setStatus(doc.id, DOCUMENT_STATUS.ANALYZING);

      // Базовая система-сообщение и первый пользовательский промпт сохраняются
      // в conversation документа, чтобы потом чат-сессия могла обращаться к
      // этому же контексту.
      const systemMessage = {
        role: 'system',
        content: 'You are a professional document analyst. Always respond in Russian, following the exact formatting instructions.'
      };
      const userMessage = {
        role: 'user',
        content: buildAnalysisPrompt(text, { options })
      };
      this.documentsStore.setConversation(doc.id, [systemMessage, userMessage]);

      try {
        const raw = await chatCompletion({
          model: DEEPSEEK_MODELS.REASONER,
          messages: [systemMessage, userMessage],
          temperature: 1.0,
          topP: 0.7,
          maxTokens: 8000,
          extra: { max_cot_tokens: 8000 },
          signal: controller.signal
        });
        const { report, risks } = parseAnalysisResponse(raw);
        this.stopEmulatorFor(doc.id);
        this.documentsStore.setRisks(doc.id, risks);
        this.documentsStore.setAnalysisResult(doc.id, report);
        this.documentsStore.appendConversation(doc.id, { role: 'assistant', content: raw });
        await this.$nextTick();
        if (this.selectedDocument?.id === doc.id) {
          this.applyRiskHighlights();
        }
        this.$emit('analysis-complete', { result: report, error: false, documentId: doc.id });
      } catch (error) {
        this.stopEmulatorFor(doc.id);
        if (error?.name === 'CanceledError' || error?.code === 'ERR_CANCELED') {
          return;
        }
        console.error('Ошибка при анализе документа:', error?.message || error);
        this.documentsStore.setAnalysisError(doc.id, true);
        this.$emit('analysis-complete', { result: null, error: true, documentId: doc.id });
      } finally {
        this.analysisControllers.delete(doc.id);
      }
    },

    async extractPdfText(doc) {
      const lib = await this.ensurePdfJs();
      if (!doc?.url || !lib) return '';
      // verbosity: 0 - только ошибки, без TT/font warnings от pdf.js.
      const loadingTask = lib.getDocument({ url: doc.url, verbosity: 0 });
      const pdf = await loadingTask.promise;
      this.totalPages = pdf.numPages;
      let fullText = '';
      for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
        const page = await pdf.getPage(pageNumber);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item) => item.str).join(' ');
        fullText += pageText + '\n';
      }
      return fullText;
    },

    async renderDocx(doc) {
      if (!doc?.file) return;
      const container = this.$refs.documentContainer;
      if (!container) return;
      const wrapper = document.createElement('div');
      wrapper.className = 'docx-preview';
      container.appendChild(wrapper);
      // docx-preview сохраняет inline-стили оригинального документа:
      // отступы, выравнивание, табы, списки, таблицы - близко к Word.
      // ignoreWidth/Height: true чтобы не задавать жёсткую ширину/высоту
      // страницы DOCX - позволит документу адаптироваться под viewport.
      await renderDocxAsync(doc.file, wrapper, null, {
        className: 'docx',
        inWrapper: false,
        ignoreWidth: true,
        ignoreHeight: true,
        ignoreFonts: false,
        breakPages: false,
        ignoreLastRenderedPageBreak: true,
        experimental: false,
        trimXmlDeclaration: true,
        useBase64URL: false,
        debug: false
      });
      const text = (wrapper.innerText || '').replace(/\s+/g, ' ').trim();
      if (text && !doc.extractedText) {
        this.documentsStore.setExtractedText(doc.id, text);
      }
      this.documentsStore.setHtmlPreview(doc.id, wrapper.innerHTML);
      this.totalPages = 1;
      // Сохраняем оригинальные font-size/padding inline-стилей, чтобы потом
      // масштабировать их через DOM-walk (CSS zoom поддерживается не везде).
      this.snapshotDocxOriginalStyles(wrapper);
      this.applyDocxFontScale();
    },
    snapshotDocxOriginalStyles(rootEl) {
      // Идём по ВСЕМ потомкам и через getComputedStyle получаем актуальный
      // font-size в px - неважно, задан он inline, через docx-preview class
      // (.docx p { font-size: 11pt }) или наследован от родителя.
      // Сохраняем числовое значение в data-dp-fs-px, чтобы потом умножать на scale.
      const root = rootEl || this.$refs.documentContainer?.querySelector?.('.docx-preview');
      if (!root) return;
      const all = root.querySelectorAll('*');
      all.forEach((el) => {
        if (!el.dataset || el.dataset.dpFsPx) return;
        const fs = parseFloat(window.getComputedStyle(el).fontSize);
        if (fs > 0) el.dataset.dpFsPx = String(fs);
      });
    },
    applyDocxFontScale() {
      const root = this.$refs.documentContainer?.querySelector?.('.docx-preview');
      if (!root) return;
      const scale = this.fontScale || 1;
      const all = root.querySelectorAll('[data-dp-fs-px]');
      all.forEach((el) => {
        const orig = parseFloat(el.dataset.dpFsPx);
        if (!Number.isFinite(orig)) return;
        el.style.fontSize = `${orig * scale}px`;
      });
    },

    async renderPDF(doc) {
      // Гибридный подход pdf.js:
      // - <canvas> рисует страницу с полным форматированием (шрифты, отступы,
      //   таблицы, изображения - точная копия PDF).
      // - Поверх кладётся .pdf-text-layer (invisible) с правильно позиционированными
      //   span'ами текста. Это даёт выделение, копирование и базу для overlay-маркеров.
      // - Цветовые метки рисков накладываются позиционно (absolute) через
      //   highlight service в overlay-режиме, считывая getClientRects Range'а
      //   из text-layer'а.
      // CSS-переменные --total-scale-factor / --scale-round-x обязательны:
      // без них pdf.js v5 не может вычислить ширину/высоту layer'а и размер
      // шрифта спанов.
      const lib = await this.ensurePdfJs();
      if (!doc?.url || !lib) return;
      const container = this.$refs.documentContainer;
      if (!container) return;
      container.classList.add('pdf-loading');
      try {
        const loadingTask = lib.getDocument({ url: doc.url, verbosity: 0 });
        const pdf = await loadingTask.promise;
        this.totalPages = pdf.numPages;
        const containerWidth = Math.max(container.clientWidth, 320);
        const fontScale = this.fontScale || 1;
        let extractedText = '';

        for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
          const page = await pdf.getPage(pageNumber);
          const unscaledViewport = page.getViewport({ scale: 1 });
          const scale = (containerWidth / unscaledViewport.width) * fontScale;
          const viewport = page.getViewport({ scale });

          const pageContainer = document.createElement('div');
          pageContainer.className = 'pdf-page-container';
          pageContainer.style.position = 'relative';
          pageContainer.style.width = `${viewport.width}px`;
          pageContainer.style.height = `${viewport.height}px`;

          // Canvas - визуальный рендер (forматирование, шрифты, лейаут).
          const canvas = document.createElement('canvas');
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          canvas.className = 'pdf-page';
          const ctx = canvas.getContext('2d');
          await page.render({ canvasContext: ctx, viewport }).promise;
          pageContainer.appendChild(canvas);

          // Text-layer - invisible selectable text сверху canvas'а.
          const textLayerDiv = document.createElement('div');
          textLayerDiv.className = 'pdf-text-layer';
          textLayerDiv.style.setProperty('--total-scale-factor', String(viewport.scale));
          textLayerDiv.style.setProperty('--scale-factor', String(viewport.scale));
          textLayerDiv.style.setProperty('--scale-round-x', '1px');
          textLayerDiv.style.setProperty('--scale-round-y', '1px');
          textLayerDiv.style.width = `${viewport.width}px`;
          textLayerDiv.style.height = `${viewport.height}px`;
          pageContainer.appendChild(textLayerDiv);

          const textContent = await page.getTextContent();
          extractedText += textContent.items.map((it) => it.str).join(' ') + '\n';
          try {
            if (lib.TextLayer) {
              const textLayer = new lib.TextLayer({
                textContentSource: textContent,
                container: textLayerDiv,
                viewport
              });
              await textLayer.render();
            }
          } catch (error) {
            console.warn('PDF text-layer render:', error?.message || error);
          }

          container.appendChild(pageContainer);
        }

        if (extractedText && !doc.extractedText) {
          this.documentsStore.setExtractedText(doc.id, extractedText.trim());
        }
      } finally {
        container.classList.remove('pdf-loading');
      }
    },
    toggleAssistant() {
      this.$emit('show-assistant');
    },
    async downloadReport() {
      const doc = this.selectedDocument;
      if (!doc?.analysisResult || this.isExporting) return;
      this.isExporting = true;
      try {
        await downloadAnalysisReport({
          title: `Отчёт анализа: ${doc.name}`,
          markdown: doc.analysisResult,
          filename: `report-${doc.name.replace(/\.[^.]+$/, '')}`,
          meta: `Сгенерировано Dockee, ${new Date().toLocaleString('ru-RU')}`
        });
      } catch (error) {
        console.error('Не удалось скачать отчёт:', error?.message || error);
      } finally {
        this.isExporting = false;
      }
    },

    // Полный re-render PDF: вызывается при изменении ширины (Скрыть меню)
    // и font-scale (масштаб слайдера). Canvas не масштабируется CSS-ом - его
    // нужно пере-рисовывать с новым viewport.scale.
    async updatePdfSize() {
      if (!this.selectedDocument || this.selectedDocument.type !== 'pdf') return;
      this.resizing = true;
      try {
        await this.$nextTick();
        const container = this.$refs.documentContainer;
        if (container) {
          container.querySelectorAll('.pdf-page-container, .docx-preview').forEach((el) => el.remove());
        }
        await this.renderPDF(this.selectedDocument);
        if (this.risks.length > 0) {
          this.applyRiskHighlights();
        }
      } catch (error) {
        console.error('PDF re-render error:', error);
      } finally {
        this.resizing = false;
      }
    }
  },
  watch: {
    fontScalePercent() {
      const type = this.selectedDocument?.type;
      if (type === 'docx') {
        // DOCX масштабируется DOM-walk'ом - мгновенно, без re-render.
        this.applyDocxFontScale();
        return;
      }
      if (type === 'pdf') {
        // PDF пере-рендеривает canvas с новым viewport.scale.
        // Дебаунс 400ms - не дёргать рендер на каждый тик слайдера.
        if (this.fontScaleRerenderTimer) clearTimeout(this.fontScaleRerenderTimer);
        this.fontScaleRerenderTimer = setTimeout(() => {
          this.updatePdfSize();
          this.fontScaleRerenderTimer = null;
        }, 400);
      }
    },
    'selectedDocument.id': {
      immediate: true,
      async handler(newId, oldId) {
        this.closeRiskPopover();
        // При смене документа (не первом монтировании) скрываем ассистента -
        // он покажет уже отчёт нового документа при следующем открытии.
        if (oldId != null && newId !== oldId) {
          this.$emit('document-changed', { newId, oldId });
        }
        if (!newId) {
          this.renderedDocId = null;
          this.totalPages = 0;
          // Документов не осталось - очищаем просмотрщик.
          const container = this.$refs.documentContainer;
          if (container) {
            container.querySelectorAll('.docx-preview, .pdf-page-container').forEach((el) => el.remove());
          }
          return;
        }
        await this.$nextTick();
        await this.renderSelectedDocument();
        if (this.risks.length > 0) {
          this.applyRiskHighlights();
        }
      }
    }
  },
  mounted() {
    this.onDocumentClick = (event) => this.handleDocumentClick(event);
    document.addEventListener('click', this.onDocumentClick);
  },
  beforeUnmount() {
    if (this.onDocumentClick) {
      document.removeEventListener('click', this.onDocumentClick);
      this.onDocumentClick = null;
    }
    if (this.fontScaleRerenderTimer) {
      clearTimeout(this.fontScaleRerenderTimer);
      this.fontScaleRerenderTimer = null;
    }
    this.analysisControllers.forEach((controller) => controller.abort());
    this.analysisControllers.clear();
    this.emulators.forEach((emulator) => emulator.stop());
    this.emulators.clear();
  }
};
</script>

<style scoped>
/* ... все стили без изменений, как в исходном файле ... */
@keyframes fadeInEffect {
  from { opacity: 0; }
  to { opacity: 1; }
}

.analysis {
  width: 100%;
  height: 100%;
  background-color: #FFF;
  border-radius: 30px;
  border: 1px solid #E6E6E6;
  overflow: hidden;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
}

.expanded .analysis {
  width: 1000px;
}
.analysis__header {
  display: flex;
  gap: 5px;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 20px;
  padding: 10px 20px;
  border-bottom: 1px solid #e6e6e6;
}

.analysis__header-left {
  display: flex;
  gap: 5px;
}

.header__file {
  font-size: 12px;
  font-weight: 500;
  color: #a2a2a2;
}
.analysis__content {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  position: relative;
  height: 500px;
  overflow: hidden;
}
.content__document-wrap {
  position: relative;
  width: 100%;
  height: 500px;
  overflow: hidden;
  border-radius: 8px;
  background: #fff;
}
.content__document {
  width: 100%;
  height: 500px;
  overflow: auto;
  position: relative;
  background: #fff;
  border-radius: 8px;
}

.content__document--panning {
  cursor: grabbing;
  user-select: none;
}

.content__placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 320px;
  padding: 24px;
  color: #a2a2a2;
  font-size: 14px;
  text-align: center;
}

.expanded .content__document {
  width: 100%;
  flex: 1;
}
.expanded .content__document-wrap {
  flex: 1;
}

.docx-preview {
  color: #222;
  user-select: text;
  background: #fff;
  width: 100%;
  box-sizing: border-box;
}

/* Перебиваем огромные поля страницы Word (padding: 56.7pt 42.5pt ...) на
   компактные 10px. Сохраняем форматирование текста, но не оставляем
   гигантских пустых полей вокруг документа. */
.docx-preview :deep(.docx),
.docx-preview :deep(section.docx),
.docx-preview :deep(article.docx) {
  padding: 10px !important;
  margin: 0 0 12px 0 !important;
  width: 100% !important;
  max-width: 100% !important;
  min-width: 0 !important;
  min-height: 0 !important;
  height: auto !important;
  box-shadow: none !important;
  background: transparent !important;
}
.docx-preview :deep(section.docx > div),
.docx-preview :deep(section.docx > article),
.docx-preview :deep(article > div) {
  padding: 0 !important;
  margin: 0 !important;
  width: auto !important;
  max-width: 100% !important;
}

.content__panel {
  width: 200px;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  min-height: 0;
}
.panel__levels {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 5px;
  padding: 0;
  margin: 0;
  border-left: 1px solid #e6e6e6;
  border-bottom: 1px dashed #e6e6e6;
  padding: 10px;
  }
.levels__item {
  display: flex;
  gap: 5px;
  align-items: center;
}
.item__color {
  width: 20px;
  height: 10px;
  border-radius: 50px;
}
.green {
  background-color: #00800040;
}
.yellow {
  background-color: #ffd90050;
}
.red {
  background-color: #ff000040;
}
.item__text {
  font-size: 11px;
  transition: all 0.3s ease;
  font-weight: 500;
}
.panel__button {
  width: 120px;
  height: 35px;
  border-radius: 50px;
  outline: none;
  border: none;
  cursor: pointer;
  font-size: 11px;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  transition: all 0.3s ease;
}

.panel__button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

.help-buttons__block {
  display: flex;
  flex-direction: column;
  gap: 5px;
  align-items: center;
  padding: 10px;
  border-left: 1px solid #e6e6e6;
  border-bottom: 1px dashed #e6e6e6;
}

.ai-assistant {
  background-color: #6C67FD;
  color: #FFF;
  border: 1px solid #6C67FD;
  transition: 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
}

.ai-assistant__block {
  border-left: 1px solid #e6e6e6;
  border-bottom: 1px dashed #e6e6e6;
  padding: 10px;
  align-items: center;
  display: flex;
  justify-content: center;
}

.ai-assistant:hover {
  background-color: #fff;
  color: #6C67FD;
}

.button__icon {
  width: 15px;
  height: 15px;
  transition: all 0.3s ease;
}
.note, .save {
  background-color: #FFF;
  color: #000;
  border: 1px solid #e6e6e6;
  transition: 0.2s;
}
.note:hover, .save:hover {
  background: #6C67FD;
  color: #FFF;
}
.download {
  margin-top: 30px;
}
.download, .download-all {
  background-color: #333;
  color: #FFF;
  border: 1px solid #333;
  transition: 0.2s;
}
.download-all {
  height: 50px;
}
.download:hover, .download-all:hover {
  background-color: #fff;
  color: #333;
}

@keyframes dot-wave {
  0%, 60%, 100% { transform: translateY(0); }
  30% { transform: translateY(-10px); }
}

.pdf-loading-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 10;
  display: flex;
  gap: 8px;
}

.pdf-loading-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: #6C67FD;
  animation: dot-wave 1.5s infinite ease-in-out;
}

.pdf-loading-dot:nth-child(1) {
  animation-delay: 0s;
}
.pdf-loading-dot:nth-child(2) {
  animation-delay: 0.3s;
}
.pdf-loading-dot:nth-child(3) {
  animation-delay: 0.6s;
}

.content__document {
  position: relative;
  min-height: 200px;
}

.pdf-content {
  transition: opacity 0.3s ease;
}

.pdf-loading-dots {
  display: flex;
  gap: 10px;
}

/* Стили для увеличенной панели */
.expanded .content__panel {
  width: 170px;
}

.expanded .panel__button {
  width: 150px;
  height: 42px;
  font-size: 13px;
  gap: 8px;
}

.expanded .button__icon {
  width: 18px;
  height: 18px;
}

.expanded .panel__levels {
  gap: 8px;
}

.expanded .levels__item {
  gap: 8px;
}

.expanded .item__color {
  width: 20px;
  height: 10px;
}

.expanded .item__text {
  font-size: 13px;
}

.expanded .download-all {
  height: 60px;
}

.analysis__file-selector {
  display: flex;
  gap: 10px;
  align-items: center;
  font-size: 12px;
  color: #a2a2a2;
  font-weight: 500;
}

.file-selector {
  position: relative;
  width: 200px;
  height: 25px;
  border: 1px solid #e6e6e6;
  border-radius: 50px;
  padding: 5px 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.file-selector--disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.file-selector--open .file-selector__icon {
  transform: rotate(180deg);
}

.file-selector__icon {
  width: 8px;
  height: 8px;
  transition: transform 0.2s ease;
}

.file-selector__dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  width: 100%;
  max-height: 200px;
  overflow-y: auto;
  background: #fff;
  border: 1px solid #e6e6e6;
  border-radius: 10px;
  padding: 4px;
  margin: 0;
  list-style: none;
  z-index: 20;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.file-selector__item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 8px;
  gap: 8px;
  border-radius: 6px;
  font-size: 12px;
  color: #333;
}

.file-selector__item:hover {
  background-color: #f3f3f3;
}

.file-selector__item--active {
  background-color: rgba(108, 103, 253, 0.1);
  color: #6c67fd;
  font-weight: 600;
}

.file-selector__item-name {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.file-selector__item-type {
  font-size: 10px;
  color: #a2a2a2;
  font-weight: 600;
}

.file {
  font-size: 12px;
  font-weight: 500;
  color:#a2a2a2;
}

.analysis__font-size-selector {
  position: relative;
  width: 70px;
  height: 25px;
  border: 1px solid #e6e6e6;
  border-radius: 50px;
  padding: 5px 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 4px;
}

.analysis__font-size-selector .file-selector__icon {
  transition: transform 0.2s ease;
}

.font-size-selector--open .file-selector__icon {
  transform: rotate(180deg);
}

.font-size-selector__size {
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
}

.font-size-popover {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  width: 220px;
  background: #fff;
  border: 1px solid #e6e6e6;
  border-radius: 12px;
  padding: 12px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.1);
  z-index: 25;
  cursor: default;
}

.font-size-popover__label {
  display: block;
  font-size: 11px;
  font-weight: 600;
  color: #6c67fd;
  margin-bottom: 8px;
}

.font-size-popover__controls {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 10px;
}

.font-size-popover__input {
  width: 56px;
  height: 26px;
  padding: 4px 6px;
  border: 1px solid #e6e6e6;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  outline: none;
  text-align: center;
}

.font-size-popover__input:focus {
  border-color: #6c67fd;
}

.font-size-popover__input::-webkit-outer-spin-button,
.font-size-popover__input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.font-size-popover__unit {
  font-size: 12px;
  color: #6b6b6b;
}

.font-size-popover__reset {
  margin-left: auto;
  height: 26px;
  padding: 0 10px;
  border: 1px solid #e6e6e6;
  border-radius: 6px;
  background: #fff;
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.15s ease, color 0.15s ease, border-color 0.15s ease;
}

.font-size-popover__reset:hover:not(:disabled) {
  background: #6c67fd;
  color: #fff;
  border-color: #6c67fd;
}

.font-size-popover__reset:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.font-size-popover__slider {
  width: 100%;
  margin: 0;
  accent-color: #6c67fd;
  cursor: pointer;
}

.font-size-popover__legend {
  display: flex;
  justify-content: space-between;
  font-size: 10px;
  color: #a2a2a2;
  margin-top: 4px;
}

.analysis__progress {
  position: relative;
  width: 100%;
  max-width: 260px;
  min-height: 30px;
  border: 1px solid #e6e6e6;
  border-radius: 16px;
  display: flex;
  align-items: stretch;
}

.progress__popover {
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  min-width: 200px;
  max-width: 260px;
  background: #fff;
  border: 1px solid #e6e6e6;
  border-radius: 12px;
  padding: 8px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.1);
  opacity: 0;
  pointer-events: none;
  transform: translateY(-4px);
  transition: opacity 0.15s ease, transform 0.15s ease;
  z-index: 30;
}

.analysis__progress:hover .progress__popover,
.analysis__progress:focus-within .progress__popover {
  opacity: 1;
  transform: translateY(0);
  pointer-events: auto;
}

.progress__popover-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.progress__popover-item {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 80px 36px;
  gap: 8px;
  align-items: center;
  padding: 4px 6px;
  border-radius: 6px;
  font-size: 11px;
  color: #333;
}

.progress__popover-item--active {
  background: rgba(108, 103, 253, 0.08);
  color: #6c67fd;
  font-weight: 600;
}

.progress__popover-name {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.progress__popover-bar {
  height: 6px;
  background: #e9e9e9;
  border-radius: 50px;
  overflow: hidden;
}

.progress__popover-fill {
  height: 100%;
  background: #4caf50;
  border-radius: 50px;
  transition: width 0.3s ease;
}

.progress__popover-percent {
  font-size: 11px;
  text-align: right;
  color: inherit;
}

.progress__info {
  width: 60%;
  display: flex;
  align-items: center;
  gap: 6px;
  border-right: 1px solid #e6e6e6;
  padding: 4px 8px;
}

.progress__bar {
  width: 40%;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 10px;
}

.bar {
  width: 100px;
  height: 10px;
  background-color: #d9d9d9;
  border-radius: 50px;
  overflow: hidden;
}

.bar__fill {
  height: 100%;
  width: 0;
  background-color: #4caf50;
  border-radius: 50px;
  transition: width 0.3s ease;
}

.bar__percentage {
  font-size: 13px;
  font-weight: 500;
}

.progress__info-icon {
  width: 17px;
  height: 17px;
}

.progress__status {
  font-size: 11px;
  font-weight: 500;
  line-height: 1.25;
}

.risk-panel {
  width: 100%;
  flex: 1 1 0;
  min-height: 0;
  border-left: 1px solid #e6e6e6;
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow-y: auto;
}

.risk-panel__empty {
  font-size: 11px;
  color: #a2a2a2;
  margin: 0;
}

.risk-panel__group {
  border-radius: 8px;
  padding: 6px 8px;
  border: 1px solid transparent;
}

.risk-panel__group--good {
  background: rgba(0, 128, 0, 0.05);
  border-color: rgba(0, 128, 0, 0.18);
}

.risk-panel__group--warn {
  background: rgba(255, 217, 0, 0.07);
  border-color: rgba(255, 184, 0, 0.3);
}

.risk-panel__group--danger {
  background: rgba(255, 0, 0, 0.05);
  border-color: rgba(255, 0, 0, 0.22);
}

.risk-panel__group-title {
  font-size: 11px;
  font-weight: 600;
  margin: 0 0 6px;
  color: #333;
}

.risk-panel__group--good .risk-panel__group-title { color: #1f7a1f; }
.risk-panel__group--warn .risk-panel__group-title { color: #b58400; }
.risk-panel__group--danger .risk-panel__group-title { color: #c43030; }

.risk-panel__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.risk-panel__item {
  font-size: 11px;
  line-height: 1.3;
  padding: 4px 6px;
  border-radius: 6px;
  cursor: pointer;
  color: #333;
  background: rgba(255, 255, 255, 0.6);
  border: 1px solid transparent;
  transition: background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease;
}

.risk-panel__item:hover {
  background: #fff;
  border-color: #d9d9d9;
}

.risk-panel__item--active {
  background: #fff;
  border-color: #6c67fd;
  color: #6c67fd;
  font-weight: 600;
}

.risk-panel__item--completed {
  background: #1f7a1f;
  color: #fff;
  border-color: #1f7a1f;
}
.risk-panel__item--completed:hover { background: #186218; }

.risk-panel__item--completed.risk-panel__item--active {
  background: #1f7a1f;
  color: #fff;
  border-color: #14541a;
}


/* Карточка риска - дизайн из issue #19. */
.risk-popover {
  position: absolute;
  z-index: 40;
  left: 12px;
  right: 12px;
  bottom: 12px;
  max-width: 477px;
  margin-left: auto;
  margin-right: auto;
  min-height: 134px;
  background: #FFFFFF;
  border: 1px solid #E6E6E6;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-radius: 28px;
  cursor: default;
  display: flex;
  font-family: 'Montserrat', 'PT Sans', sans-serif;
  overflow: hidden;
}

.risk-popover--expanded {
  max-height: 80%;
}

.risk-popover-slide-enter-active,
.risk-popover-slide-leave-active {
  transition: transform 0.2s ease, opacity 0.2s ease;
}
.risk-popover-slide-enter-from,
.risk-popover-slide-leave-to {
  transform: translateY(20px);
  opacity: 0;
}

.risk-popover__main {
  flex: 1;
  min-width: 0;
  padding: 11px 16px 11px 21px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  overflow-y: auto;
}

.risk-popover__top {
  display: flex;
  align-items: center;
  gap: 10px;
}

.risk-popover__level-pill {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  height: 15px;
  padding: 0 8px;
  border-radius: 10px;
  font-size: 8px;
  font-weight: 600;
  color: #fff;
  text-transform: uppercase;
  letter-spacing: 0.02em;
  white-space: nowrap;
}
.risk-popover--good .risk-popover__level-pill { background: rgba(0, 128, 0, 0.85); }
.risk-popover--warn .risk-popover__level-pill { background: rgba(217, 156, 0, 0.9); color: #fff; }
.risk-popover--danger .risk-popover__level-pill { background: rgba(208, 64, 64, 0.92); }

.risk-popover__title {
  flex: 1;
  min-width: 0;
  margin: 0;
  font-size: 12px;
  font-weight: 700;
  color: #000;
  line-height: 1.25;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.risk-popover__accept {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 18px;
  padding: 0 8px;
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid #E6E6E6;
  border-radius: 10px;
  font-family: inherit;
  font-size: 9px;
  font-weight: 500;
  color: #000;
  cursor: pointer;
  transition: background-color 0.15s ease, color 0.15s ease;
}
.risk-popover__accept:hover { background: #f3f3f3; }
.risk-popover__accept--active {
  background: #1f7a1f;
  color: #fff;
  border-color: #1f7a1f;
}
.risk-popover__accept--active:hover { background: #156115; }
.risk-popover__accept-arrow { font-size: 12px; line-height: 1; }

.risk-popover__quote-row {
  display: flex;
  gap: 8px;
  align-items: stretch;
}
.risk-popover__quote-bar {
  flex-shrink: 0;
  width: 1px;
  background: #A2A2A2;
  border-radius: 1px;
}
.risk-popover__quote {
  flex: 1;
  margin: 0;
  font-style: italic;
  font-weight: 500;
  font-size: 10px;
  line-height: 1.3;
  color: #A2A2A2;
}

.risk-popover__comment {
  margin: 4px 0 0;
  font-size: 10px;
  font-weight: 500;
  line-height: 1.35;
  color: #000;
}

.risk-popover__bottom-row {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-top: auto;
  padding-top: 6px;
}

.risk-popover__recom-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 18px;
  padding: 0 14px;
  background: #FFFFFF;
  border: 1px solid #E6E6E6;
  border-radius: 10px;
  font-family: inherit;
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 0.02em;
  color: #A2A2A2;
  cursor: pointer;
  transition: background-color 0.15s ease, color 0.15s ease;
}
.risk-popover__recom-btn:hover:not(:disabled) { background: #f3f3f3; color: #555; }
.risk-popover__recom-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.risk-popover__recom-btn--active {
  background: #6c67fd;
  color: #fff;
  border-color: #6c67fd;
}

.risk-popover__ask {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 18px;
  padding: 0 12px;
  background: transparent;
  border: 1px solid #6c67fd;
  border-radius: 10px;
  font-family: inherit;
  font-size: 9px;
  font-weight: 500;
  color: #6c67fd;
  cursor: pointer;
  transition: background-color 0.15s ease, color 0.15s ease;
}
.risk-popover__ask:hover { background: #6c67fd; color: #fff; }

.risk-popover__recommendations {
  list-style: disc;
  padding: 4px 0 4px 16px;
  margin: 6px 0 0;
  font-size: 10px;
  font-weight: 500;
  color: #000;
  line-height: 1.45;
}

.risk-popover__expand {
  flex-shrink: 0;
  width: 32px;
  border: none;
  border-left: 1px solid #E6E6E6;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  transition: background-color 0.15s ease;
}
.risk-popover__expand:hover { background: #f7f7f7; }
.risk-popover__expand-label {
  font-family: inherit;
  font-size: 11px;
  font-weight: 500;
  color: #A2A2A2;
  writing-mode: vertical-rl;
  transform: rotate(180deg);
  white-space: nowrap;
}

.risk-popover__close {
  position: absolute;
  top: 6px;
  right: 40px;
  background: transparent;
  border: none;
  color: #A2A2A2;
  font-size: 18px;
  line-height: 1;
  cursor: pointer;
  padding: 2px 6px;
  border-radius: 50%;
}
.risk-popover__close:hover { color: #000; background: #f3f3f3; }
</style>

<style>
/* Неscoped: применяется к программно созданным элементам docx-preview,
   pdf canvas + text-layer и динамическим mark/overlay, у которых нет data-v-* */

.pdf-page-container {
  margin: 0 auto 12px;
  background: #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}
.pdf-page {
  display: block;
  width: 100%;
  height: auto;
}

/* Invisible text-layer поверх canvas - содержит spans с правильным позиционированием.
   pdf.js v5 строит их через calc(var(--total-scale-factor) * Xpx). */
.pdf-text-layer {
  position: absolute;
  inset: 0;
  overflow: hidden;
  line-height: 1;
  color: transparent;
  user-select: text;
  z-index: 2;
}
.pdf-text-layer span,
.pdf-text-layer br {
  color: transparent;
  position: absolute;
  white-space: pre;
  cursor: text;
  transform-origin: 0% 0%;
}
.pdf-text-layer ::selection {
  background: rgba(108, 103, 253, 0.4);
}

.risk-highlight {
  border-radius: 8px;
  padding: 0 5px;
  cursor: pointer;
  transition: filter 0.15s ease, background-color 0.15s ease;
}

.risk-highlight:hover {
  filter: brightness(0.7);
}

.risk-highlight--overlay {
  padding: 0;
  border-radius: 2px;
}

.risk-highlight--good {
  background-color: rgba(0, 200, 0, 0.45);
}

.risk-highlight--warn {
  background-color: rgba(255, 200, 0, 0.5);
}

.risk-highlight--danger {
  background-color: rgba(255, 70, 70, 0.5);
}


.docx {
  padding: 30px !important;
}
</style>