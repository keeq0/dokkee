<template>
  <div
    :class="['assistant', { 'assistant--visible': internalVisible, 'assistant--fullscreen': isFullscreen }]"
    :style="{ width: isFullscreen ? '100%' : currentWidth + 'px' }"
  >
    <div
      v-if="!isFullscreen"
      class="assistant__resize-handle"
      @mousedown="startResize"
    ></div>

    <div class="assistant__header">
      <div class="assistant__title">
        <h3>ИИ-помощник</h3>
        <h2>Анализ документа(-ов)</h2>
      </div>
      <div class="assistant__header-actions">
        <button class="fullscreen-toggle" @click="toggleFullscreen">
          <img src="@/assets/fullscreen.svg" alt="fullscreen" />
        </button>
        <button
          v-if="headings.length > 0 && allMessagesComplete"
          class="nav-toggle"
          @click="toggleToc"
        >
          Навигация
        </button>
        <button class="assistant__close" @click="hideAssistant">
          <p>Скрыть</p>
        </button>
      </div>
    </div>

    <!-- Панель навигации -->
    <transition name="toc-slide">
      <div v-if="showToc" class="toc-panel">
        <div class="toc-header">
          <span>Содержание</span>
          <button @click="showToc = false">✕</button>
        </div>
        <ul>
          <li
            v-for="(heading, idx) in headings"
            :key="idx"
            :style="{ paddingLeft: (heading.level - 2) * 12 + 'px' }"
            @click="scrollToHeading(idx)"
          >
            {{ heading.text }}
          </li>
        </ul>
      </div>
    </transition>

    <!-- Область сообщений (отчёт + чат) -->
    <div
      class="assistant__messages"
      ref="messagesContainer"
      @scroll="handleScroll"
    >
      <!-- Первое сообщение (анализ) -->
      <div class="assistant__first-message">
        <template v-if="showFirstLoading">
          <div class="loading-dots">•••</div>
        </template>
        <template v-else>
          <div class="message message--first">
            <img src="@/assets/ai.svg" class="assistant__logo" alt="" />
            <p class="message__text message__text--no-margin" v-html="typedFirstMessage"></p>
          </div>
        </template>
      </div>

      <div v-if="firstMessageComplete" class="dashed-line"></div>

      <!-- Второе сообщение (отчёт) -->
      <div class="assistant__second-message" v-if="firstMessageComplete">
        <template v-if="showSecondLoading">
          <div class="loading-dots">•••</div>
        </template>
        <template v-else>
          <div class="message message--complete">
            <div class="message__header-row">
              <img src="@/assets/ai.svg" class="assistant__logo" alt="" />
              <h4 class="message__header message__header--no-margin" v-html="typedSecondHeader"></h4>
            </div>
            <div class="message__text" v-html="displayText"></div>
          </div>
        </template>
      </div>

      <!-- История чата -->
      <div
        v-if="allMessagesComplete && chatMessages.length"
        class="chat-history"
      >
        <div
          v-for="(msg, idx) in chatMessages"
          :key="'msg-' + idx"
          :class="['chat-message', msg.role === 'user' ? 'chat-message--user' : 'chat-message--ai']"
        >
          <div class="chat-message__avatar">
            <img v-if="msg.role === 'user'" src="@/assets/user.png" alt="user" />
            <img v-else src="@/assets/ai.svg" alt="ai" />
          </div>
          <div class="chat-message__content" v-html="renderMarkdown(msg.content)"></div>
          <div
            v-if="msg.role === 'user' && msg.pinnedRisk"
            class="chat-pinned-risk chat-pinned-risk--inline"
            :class="`chat-pinned-risk--${pinnedRiskLevelKeyOf(msg.pinnedRisk)}`">
            <div class="chat-pinned-risk__head">
              <span class="chat-pinned-risk__badge">{{ msg.pinnedRisk.level }}</span>
            </div>
            <div class="chat-pinned-risk__title">{{ msg.pinnedRisk.name || msg.pinnedRisk.level }}</div>
            <blockquote class="chat-pinned-risk__quote">{{ msg.pinnedRisk.quote }}</blockquote>
          </div>
        </div>
      </div>

      <!-- Индикатор загрузки ответа -->
      <div v-if="isWaitingForAnswer" class="chat-message chat-message--ai chat-message--loading">
        <div class="chat-message__avatar">
          <img src="@/assets/ai.svg" alt="ai" />
        </div>
        <div class="chat-message__content">
          <div class="typing-indicator">•••</div>
        </div>
      </div>

      <!-- Кнопка остановки стрима -->
      <button
        v-if="isStreaming"
        type="button"
        class="chat-stop-button"
        @click="stopStreaming">
        Остановить
      </button>

      <div
        v-if="showScrollToBottom"
        class="scroll-to-bottom"
        @click="scrollToBottom({ force: true })"
      >
        <img src="@/assets/arrow_down.png" class="scroll-to-bottom__icon" alt="" />
      </div>
    </div>

    <!-- Поле ввода сообщений -->
    <div class="chat-input-area" v-if="allMessagesComplete">
      <div v-if="pinnedRisk" class="chat-pinned-risk" :class="`chat-pinned-risk--${pinnedRiskLevelKey}`">
        <div class="chat-pinned-risk__head">
          <span class="chat-pinned-risk__badge">Спрашиваешь о риске</span>
          <button
            type="button"
            class="chat-pinned-risk__close"
            aria-label="Убрать закреплённый риск"
            @click="clearPinnedRisk">
            ×
          </button>
        </div>
        <div class="chat-pinned-risk__title">{{ pinnedRisk.name || pinnedRisk.level }}</div>
        <blockquote class="chat-pinned-risk__quote">{{ pinnedRisk.quote }}</blockquote>
      </div>
      <textarea
        v-model="questionText"
        class="chat-input"
        :placeholder="pinnedRisk ? 'Спросите о закреплённом риске' : 'Задайте вопрос ИИ-помощнику'"
        :disabled="isWaitingForAnswer"
        rows="3"
        @keydown.enter.prevent="sendQuestion"
      ></textarea>
      <button
        class="chat-send"
        :class="{ active: questionText.trim().length > 0 }"
        :disabled="isWaitingForAnswer || questionText.trim().length === 0"
        @click="sendQuestion"
      >
        <img src="@/assets/arrow_right-white.png" alt="send" />
      </button>
    </div>

    <footer class="assistant__footer">
      <div class="footer__text">
        Есть вопросы или что-то не устраивает? Мы всегда открыты к вашим отзывам и предложениям — свяжитесь с нами, и мы постараемся решить любые возникшие проблемы.
      </div>
      <button
        class="footer__button report"
        :class="{ visible: allMessagesComplete }"
        @click="downloadReport"
      >
        Скачать отчёт
      </button>
    </footer>
  </div>
</template>

<script>
import MarkdownIt from 'markdown-it';
import { mapStores } from 'pinia';
import { chatCompletion } from '@/services/deepseek';
import { downloadAnalysisReport } from '@/services/reportExport';
import { useDocumentsStore } from '@/stores/documents';
import { createTextStreamer } from '@/composables/useStreamingText';

export default {
  name: 'AiAssistant',
  props: {
    visible: { type: Boolean, default: false },
    analysisResult: String,
    analysisError: Boolean,
    documentUrl: { type: String, default: '' },
    documentText: { type: String, default: '' }
  },
  data() {
    return {
      internalVisible: this.visible,
      isFullscreen: false,
      savedWidth: 0,
      firstMessageComplete: false,
      showFirstLoading: true,
      fullFirstMessage:
        'Я начинаю анализ прикрепленных вами документов. Вы получите полный отчёт и рекомендации. Пожалуйста, подождите минуточку!',
      typedFirstMessage: '',
      firstTypingIndex: 0,
      firstTypingInterval: null,
      showSecondLoading: true,
      fullSecondHeader: 'Анализ ваших документов успешно завершен.',
      fullSecondBody: this.analysisError
        ? 'Анализ недоступен'
        : this.analysisResult || 'Идет анализ документа...',
      typedSecondHeader: '',
      displayText: '',
      secondTypingIndex: 0,
      secondTypingInterval: null,
      headerTypingSpeed: 20,
      allMessagesComplete: false,
      showScrollToBottom: false,
      waitingForAnalysis: false,
      currentWidth: 0,
      isResizing: false,
      startX: 0,
      startWidth: 0,
      minWidth: 430,
      maxWidth: 0,
      md: null,
      headings: [],
      showToc: false,
      rawHtml: '',
      questionText: '',
      isWaitingForAnswer: false,
      activeStreamer: null,
      pendingPinnedRisk: null,
      // Авто-скролл к низу включён пока пользователь сам не отскроллил вверх.
      // Когда возвращается в самый низ - снова true.
      autoScrollEnabled: true,
      // Активный стрим - флаг для UI (кнопка "Остановить").
      isStreaming: false
    };
  },
  computed: {
    ...mapStores(useDocumentsStore),
    selectedDocument() {
      return this.documentsStore.selected;
    },
    selectedDocId() {
      return this.selectedDocument?.id ?? null;
    },
    chatMessages() {
      return this.selectedDocument?.chatHistory || [];
    },
    pinnedRisk() {
      return this.selectedDocument?.pinnedRisk || null;
    },
    pinnedRiskLevelKey() {
      return this.pinnedRiskLevelKeyOf(this.pinnedRisk);
    }
  },
  watch: {
    visible(newVal) {
      this.internalVisible = newVal;
    },
    analysisResult(newVal) {
      if (newVal && this.waitingForAnalysis && !this.allMessagesComplete) {
        this.fullSecondBody = newVal;
        this.startSecondSequence();
        this.waitingForAnalysis = false;
      } else if (newVal && !this.allMessagesComplete) {
        this.fullSecondBody = newVal;
      }
    },
    analysisError(newVal) {
      if (newVal && this.waitingForAnalysis && !this.allMessagesComplete) {
        this.fullSecondBody = 'Анализ недоступен';
        this.startSecondSequence();
        this.waitingForAnalysis = false;
      } else if (newVal && !this.allMessagesComplete) {
        this.fullSecondBody = 'Анализ недоступен';
      }
    },
    selectedDocId(newId, oldId) {
      // Сбрасываем состояние ассистента только при РЕАЛЬНОЙ смене документа
      // (oldId уже был определён). При первом монтировании watcher тоже срабатывает
      // на null -> id, но сбрасывать тут не надо — компонент только инициализируется.
      if (newId === oldId) return;
      if (oldId == null) return;
      if (this.activeStreamer) {
        this.activeStreamer.stop({ flush: true });
        this.activeStreamer = null;
      }
      this.resetForNewDocument();
    }
  },
  created() {
    this.md = new MarkdownIt({
      html: false,
      breaks: true,
      linkify: true,
      typographer: true
    });
    this.md.enable(['table']);
  },
  mounted() {
    this.updateMaxWidth();
    window.addEventListener('resize', this.updateMaxWidth);
    this.currentWidth = Math.min(
      Math.max(window.innerWidth * 0.465, this.minWidth),
      this.maxWidth
    );
    // Если открываемся уже с готовым анализом - пропускаем typing-анимацию.
    if (this.analysisResult || this.analysisError) {
      this.firstMessageComplete = true;
      this.showFirstLoading = false;
      this.typedFirstMessage = this.fullFirstMessage;
      this.showSecondLoading = false;
      this.typedSecondHeader = this.fullSecondHeader;
      this.fullSecondBody = this.analysisError ? 'Анализ недоступен' : this.analysisResult;
      this.allMessagesComplete = true;
      this.prepareFullHtmlImmediate();
    } else {
      setTimeout(() => {
        this.showFirstLoading = false;
        this.startFirstTyping();
      }, 2000);
    }
    this.$nextTick(() => this.handleScroll());
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.updateMaxWidth);
    if (this.firstTypingInterval) clearInterval(this.firstTypingInterval);
    if (this.secondTypingInterval) clearInterval(this.secondTypingInterval);
    if (this.activeStreamer) {
      this.activeStreamer.stop({ flush: false });
      this.activeStreamer = null;
    }
  },
  methods: {
    // ----- Рендеринг Markdown -----
    renderMarkdown(text) {
      if (!text) return '';
      try {
        return this.md ? this.md.render(text) : this.escapeHtml(text);
      } catch (e) {
        return this.escapeHtml(text);
      }
    },
    escapeHtml(str) {
      return str.replace(/[&<>]/g, (m) => {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
      });
    },

    pinnedRiskLevelKeyOf(risk) {
      const level = risk?.level;
      if (level === 'Большие риски') return 'danger';
      if (level === 'Сомнительно') return 'warn';
      if (level === 'Хорошо') return 'good';
      return '';
    },
    resetForNewDocument() {
      // Останавливаем активные интервалы.
      if (this.firstTypingInterval) {
        clearInterval(this.firstTypingInterval);
        this.firstTypingInterval = null;
      }
      if (this.secondTypingInterval) {
        clearInterval(this.secondTypingInterval);
        this.secondTypingInterval = null;
      }
      this.questionText = '';
      this.isWaitingForAnswer = false;
      this.showToc = false;
      this.headings = [];

      const hasResult = !!this.analysisResult;
      const hasError = !!this.analysisError;

      if (hasResult || hasError) {
        // Анализ уже сделан - сразу показываем готовое состояние без typing.
        this.firstMessageComplete = true;
        this.showFirstLoading = false;
        this.typedFirstMessage = this.fullFirstMessage;
        this.showSecondLoading = false;
        this.typedSecondHeader = this.fullSecondHeader;
        this.fullSecondBody = hasError ? 'Анализ недоступен' : this.analysisResult;
        this.allMessagesComplete = true;
        this.waitingForAnalysis = false;
        this.prepareFullHtmlImmediate();
      } else {
        // Анализ ещё не готов - сбрасываем и запускаем typing.
        this.firstMessageComplete = false;
        this.showFirstLoading = true;
        this.showSecondLoading = true;
        this.allMessagesComplete = false;
        this.waitingForAnalysis = false;
        this.typedFirstMessage = '';
        this.typedSecondHeader = '';
        this.displayText = '';
        this.rawHtml = '';
        this.fullSecondBody = 'Идет анализ документа...';
        setTimeout(() => {
          this.showFirstLoading = false;
          this.startFirstTyping();
        }, 200);
      }
      this.$nextTick(() => this.scrollToBottom());
    },
    prepareFullHtmlImmediate() {
      // Аналог prepareFullHtml, но без typing - сразу выставляем displayText.
      try {
        const cleanText = String(this.fullSecondBody || '').replace(/^[-—*_]{3,}\s*$/gm, '');
        const fullHtml = this.md ? this.md.render(cleanText) : '<p>Ошибка парсера</p>';
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = fullHtml;
        const headings = [];
        tempDiv.querySelectorAll('h2, h3, h4').forEach((tag, idx) => {
          const level = parseInt(tag.tagName[1]);
          const text = tag.innerText;
          const id = `heading-${idx}`;
          tag.id = id;
          headings.push({ text, level, id });
        });
        this.headings = headings;
        this.rawHtml = tempDiv.innerHTML;
        this.displayText = this.rawHtml;
      } catch (error) {
        this.displayText = '<p style="color:red">Ошибка при формировании отчёта.</p>';
      }
    },

    // ----- Управление панелью -----
    hideAssistant() {
      this.internalVisible = false;
      this.$emit('close');
    },
    toggleToc() {
      this.showToc = !this.showToc;
    },
    toggleFullscreen() {
      if (this.isFullscreen) {
        this.isFullscreen = false;
        this.currentWidth = this.savedWidth || Math.min(
          Math.max(window.innerWidth * 0.465, this.minWidth),
          this.maxWidth
        );
      } else {
        this.savedWidth = this.currentWidth;
        this.isFullscreen = true;
      }
    },

    // ----- Изменение размера (без анимации) -----
    updateMaxWidth() {
      this.maxWidth = window.innerWidth * 0.79;
      if (this.currentWidth > this.maxWidth) this.currentWidth = this.maxWidth;
    },
    startResize(e) {
      if (this.isFullscreen) return;
      e.preventDefault();
      this.isResizing = true;
      this.startX = e.clientX;
      this.startWidth = this.currentWidth;
      document.addEventListener('mousemove', this.handleResize);
      document.addEventListener('mouseup', this.stopResize);
      document.body.style.cursor = 'ew-resize';
      document.body.style.userSelect = 'none';
    },
    handleResize(e) {
      if (!this.isResizing || this.isFullscreen) return;
      e.preventDefault();
      let newWidth = this.startWidth - (e.clientX - this.startX);
      newWidth = Math.min(Math.max(newWidth, this.minWidth), this.maxWidth);
      this.currentWidth = Math.min(newWidth, window.innerWidth - 50);
    },
    stopResize() {
      this.isResizing = false;
      document.removeEventListener('mousemove', this.handleResize);
      document.removeEventListener('mouseup', this.stopResize);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    },

    // ----- Первое сообщение -----
    startFirstTyping() {
      const text = this.fullFirstMessage;
      this.typedFirstMessage = '';
      this.firstTypingIndex = 0;
      this.firstTypingInterval = setInterval(() => {
        this.typedFirstMessage += text[this.firstTypingIndex];
        this.firstTypingIndex++;
        if (this.firstTypingIndex >= text.length) {
          clearInterval(this.firstTypingInterval);
          this.firstMessageComplete = true;
          this.waitForAnalysis();
        }
      }, 4);
    },
    waitForAnalysis() {
      this.waitingForAnalysis = true;
      this.showSecondLoading = true;
      if (this.analysisResult || this.analysisError) {
        this.startSecondSequence();
        this.waitingForAnalysis = false;
      }
    },

    // ----- Второе сообщение (отчёт) -----
    startSecondSequence() {
      this.showSecondLoading = false;
      this.startSecondTypingHeader();
    },
    startSecondTypingHeader() {
      this.typedSecondHeader = '';
      this.secondTypingIndex = 0;
      const interval = setInterval(() => {
        this.typedSecondHeader += this.fullSecondHeader[this.secondTypingIndex];
        this.secondTypingIndex++;
        if (this.secondTypingIndex >= this.fullSecondHeader.length) {
          clearInterval(interval);
          this.prepareFullHtml();
        }
      }, this.headerTypingSpeed);
      this.secondTypingInterval = interval;
    },
    prepareFullHtml() {
      let cleanText = this.fullSecondBody.replace(/^[-—*_]{3,}\s*$/gm, '');
      try {
        let fullHtml = this.md ? this.md.render(cleanText) : '<p>Ошибка парсера</p>';
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = fullHtml;
        const headings = [];
        tempDiv.querySelectorAll('h2, h3, h4').forEach((tag, idx) => {
          const level = parseInt(tag.tagName[1]);
          const text = tag.innerText;
          const id = `heading-${idx}`;
          tag.id = id;
          headings.push({ text, level, id });
        });
        this.headings = headings;
        this.rawHtml = tempDiv.innerHTML;
        this.startTypingContent();
      } catch (error) {
        this.rawHtml = '<p style="color:red">Ошибка при формировании отчёта.</p>';
        this.startTypingContent();
      }
    },
    startTypingContent() {
      this.displayText = this.rawHtml;
      this.allMessagesComplete = true;
      this.$emit('processing-complete');
      this.scrollToBottom();
    },

    // ----- Прокрутка -----
    handleScroll() {
      const container = this.$refs.messagesContainer;
      if (!container) return;
      const nearBottom = container.scrollHeight - (container.scrollTop + container.clientHeight) <= 24;
      // Если пользователь сам отскроллил - выключаем авто-скролл.
      // Когда возвращается вниз - снова включаем.
      this.autoScrollEnabled = nearBottom;
      this.showScrollToBottom = !nearBottom && container.scrollHeight > container.clientHeight;
    },
    scrollToHeading(index) {
      const heading = this.headings[index];
      if (!heading) return;
      const element = document.getElementById(heading.id);
      if (element && this.$refs.messagesContainer) {
        const elementTop = element.offsetTop;
        this.$refs.messagesContainer.scrollTo({
          top: elementTop - 20,
          behavior: 'smooth'
        });
      }
      this.showToc = false;
    },
    scrollToBottom({ force = false } = {}) {
      const el = this.$refs.messagesContainer;
      if (!el) return;
      // Если пользователь отскроллил вверх во время стрима - не дёргаем его
      // вниз автоматически. force=true для явного клика на кнопку.
      if (!force && !this.autoScrollEnabled) return;
      if (typeof el.scrollTo === 'function') {
        el.scrollTo({ top: el.scrollHeight, behavior: force ? 'smooth' : 'auto' });
      } else {
        el.scrollTop = el.scrollHeight;
      }
      if (force) {
        this.autoScrollEnabled = true;
        this.showScrollToBottom = false;
      }
    },

    // ----- Отправка вопроса -----
    async sendQuestion() {
      if (!this.allMessagesComplete || this.isWaitingForAnswer) return;
      const text = this.questionText.trim();
      if (!text) return;
      const docId = this.selectedDocId;
      if (docId == null) return;

      const pinned = this.pinnedRisk;
      this.pendingPinnedRisk = pinned;
      if (pinned) {
        this.documentsStore.update(docId, { pinnedRisk: null });
      }

      this.documentsStore.addChatMessage(docId, {
        role: 'user',
        content: text,
        pinnedRisk: pinned ? { ...pinned } : null
      });
      this.questionText = '';
      this.isWaitingForAnswer = true;
      this.$nextTick(() => this.scrollToBottom());

      try {
        // Используем conversation из стора (полная DeepSeek-сессия документа,
        // включая system + начальный analysis-промпт + ответ ИИ) +
        // предыдущие чат-сообщения этого документа + текущий вопрос.
        // Это позволяет модели помнить полный текст документа и отчёт.
        const docConversation = this.selectedDocument?.conversation || [];
        const chatPrior = this.chatMessages
          .slice(0, -1)
          .map((m) => ({ role: m.role, content: m.content }));
        const pinnedPreamble = pinned ? this.buildPinnedPreamble(pinned) : null;
        const messagesForApi = [
          ...docConversation,
          ...chatPrior,
          ...(pinnedPreamble ? [{ role: 'system', content: pinnedPreamble }] : []),
          { role: 'user', content: text }
        ];

        const answer = await chatCompletion({
          messages: messagesForApi,
          temperature: 0.7,
          maxTokens: 2000
        });
        // Сохраняем пару user+assistant в conversation, чтобы при следующем
        // вопросе модель видела всю накопленную сессию.
        this.documentsStore.appendConversation(
          docId,
          { role: 'user', content: text },
          { role: 'assistant', content: answer }
        );
        this.streamAssistantAnswer(docId, answer);
      } catch (error) {
        let errorMsg = 'Извините, произошла ошибка. Попробуйте позже.';
        if (error.response) errorMsg += ` Код: ${error.response.status}`;
        this.documentsStore.addChatMessage(docId, { role: 'assistant', content: errorMsg });
        this.isWaitingForAnswer = false;
        this.$nextTick(() => this.scrollToBottom());
      }
    },
    streamAssistantAnswer(docId, fullText) {
      if (this.activeStreamer) {
        this.activeStreamer.stop({ flush: true });
        this.activeStreamer = null;
      }
      const history = this.documentsStore.byId(docId)?.chatHistory || [];
      const messageIndex = history.length;
      this.documentsStore.addChatMessage(docId, { role: 'assistant', content: '' });
      this.$nextTick(() => this.scrollToBottom());

      this.isStreaming = true;
      const streamer = createTextStreamer({
        content: fullText,
        chunkSize: 4,
        delay: 18,
        onUpdate: (partial) => {
          const item = this.documentsStore.byId(docId);
          if (!item) return;
          const arr = item.chatHistory;
          if (!arr || !arr[messageIndex]) return;
          arr[messageIndex].content = partial;
          this.scrollToBottom();
        },
        onDone: () => {
          this.activeStreamer = null;
          this.isWaitingForAnswer = false;
          this.isStreaming = false;
          this.$nextTick(() => this.scrollToBottom());
        }
      });
      this.activeStreamer = streamer;
      streamer.start();
    },
    stopStreaming() {
      // Принудительно завершает стриминг: вставляет полный текст и убирает
      // флаги. Помощник остаётся открытым.
      if (!this.activeStreamer) return;
      this.activeStreamer.stop({ flush: true });
      this.activeStreamer = null;
      this.isStreaming = false;
      this.isWaitingForAnswer = false;
    },
    clearPinnedRisk() {
      const docId = this.selectedDocId;
      if (docId == null) return;
      this.documentsStore.update(docId, { pinnedRisk: null });
    },
    buildPinnedPreamble(pinnedRisk) {
      if (!pinnedRisk) return null;
      return `Следующий вопрос пользователя задан в контексте конкретного риска:
- Уровень: ${pinnedRisk.level}
- Название: ${pinnedRisk.name}
${pinnedRisk.section ? `- Раздел/пункт: ${pinnedRisk.section}\n` : ''}- Цитата из документа: "${pinnedRisk.quote}"
- Комментарий по риску: ${pinnedRisk.comment}
Отвечай предметно, опираясь именно на этот фрагмент и его контекст в документе.`;
    },

    // ----- Скачивание отчёта -----
    async downloadReport() {
      const markdown = this.selectedDocument?.analysisResult || this.fullSecondBody;
      if (!markdown) return;
      const docName = this.selectedDocument?.name || 'document';
      try {
        await downloadAnalysisReport({
          title: `Отчёт анализа: ${docName}`,
          markdown,
          filename: `report-${docName.replace(/\.[^.]+$/, '')}-${new Date().toISOString().slice(0, 10)}`,
          meta: `Сгенерировано Dockee, ${new Date().toLocaleString('ru-RU')}`
        });
      } catch (error) {
        console.error('Ошибка при создании PDF:', error?.message || error);
      }
    }
  }
};
</script>

<style scoped>
.assistant {
  position: fixed;
  top: 0;
  right: 0;
  height: 100vh;
  background: #333;
  color: #fff;
  padding: 20px;
  box-sizing: border-box;
  transform: translateX(100%);
  transition: transform 0.2s ease-out; /* убрали анимацию ширины */
  will-change: transform;
  z-index: 1000;
  display: flex;
  flex-direction: column;
}
.assistant__resize-handle {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 6px;
  background: #444;
  cursor: ew-resize;
  z-index: 1001;
  transition: background 0.2s;
}
.assistant__resize-handle:hover {
  background: #666;
}
.assistant--visible {
  transform: translateX(0);
}

.assistant__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 20px;
  flex-shrink: 0;
}
.assistant__title h3 {
  font-size: 10px;
  color: #d9d9d9;
  margin: 0;
}
.assistant__header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}
.fullscreen-toggle {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
}
.fullscreen-toggle img {
  width: 18px;
  height: 18px;
  filter: invert(70%);
}
.nav-toggle {
  background: #444;
  border: none;
  color: white;
  padding: 6px 12px;
  border-radius: 20px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  transition: background 0.2s;
}
.nav-toggle:hover { background: #6C67FD; }
.assistant__close {
  background: transparent;
  border: 1px solid #a2a2a2;
  border-radius: 50px;
  padding: 5px 10px;
  outline: none;
  color: #a2a2a2;
  font-size: 12px;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  transition: .2s;
}
.assistant__close:hover { color: #FFF; border-color: #FFF; }

.toc-panel {
  position: absolute;
  right: 20px;
  top: 85px;
  width: 320px;
  max-height: 70vh;
  height: fit-content;
  background: #2a2a2a;
  border-radius: 12px;
  padding: 12px;
  overflow-y: auto;
  z-index: 1002;
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  border: 1px solid #555;
}
.toc-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
  margin-bottom: 8px;
  padding-bottom: 4px;
}
.toc-header button { background: none; border: none; color: #aaa; cursor: pointer; font-size: 16px; }
.toc-panel ul { list-style: none; margin: 0; padding: 0; }
.toc-panel li { padding: 4px 8px; cursor: pointer; border-radius: 6px; font-size: 13px; }
.toc-panel li:hover { background: #444; }
.toc-slide-enter-active, .toc-slide-leave-active { transition: all 0.25s ease; }
.toc-slide-enter-from { opacity: 0; transform: translateX(20px); }
.toc-slide-leave-to { opacity: 0; transform: translateX(20px); }

.assistant__messages {
  flex: 1;
  overflow-y: auto;
  padding-right: 10px;
  margin-bottom: 20px;
  line-height: 1.5;
  font-size: 14px;
  position: relative;
}
.assistant__messages::-webkit-scrollbar { width: 8px; }
.assistant__messages::-webkit-scrollbar-track { background: #444; border-radius: 4px; }
.assistant__messages::-webkit-scrollbar-thumb { background: #888; border-radius: 4px; }
.assistant__messages::-webkit-scrollbar-thumb:hover { background: #aaa; }

.message.message--first { display: flex; gap: 15px; align-items: flex-start; }
.message.message--complete { display: flex; flex-direction: column; gap: 12px; }
.message__header-row { display: flex; align-items: center; gap: 10px; }
.message__header {
  font-size: 18px;
  font-weight: bold;
  margin: 0;
  padding: 0;
  opacity: 0;
  animation: fadeIn 0.25s forwards;
}
/* Убрать отступы только для заголовка второго сообщения */
.message__header--no-margin {
  margin: 0 !important;
  padding: 0 !important;
}
.message__text {
  margin: 0;
  padding: 0;
  opacity: 0;
  animation: fadeIn 0.25s forwards;
}
/* Убрать отступы только для первого сообщения */
.message__text--no-margin {
  margin: 0 !important;
  padding: 0 !important;
}
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

.chat-history { margin-top: 20px; }
.chat-message {
  display: grid;
  grid-template-columns: 32px 1fr;
  column-gap: 12px;
  row-gap: 6px;
  margin-bottom: 16px;
  align-items: start;
}
.chat-message--user { grid-template-columns: 1fr 32px; }
.chat-message--user .chat-message__avatar { grid-column: 2; grid-row: 1; }
.chat-message--user .chat-message__content { grid-column: 1; grid-row: 1; justify-self: end; max-width: 75%; }
.chat-message--user .chat-pinned-risk { grid-column: 1; grid-row: 2; justify-self: end; max-width: 75%; }
.chat-message--ai .chat-message__content { grid-column: 2; grid-row: 1; width: 100%; max-width: 100%; }
.chat-message--loading .chat-message__content {
  grid-column: 2; grid-row: 1;
  width: 48px;
  height: 48px;
  min-width: 48px;
  min-height: 48px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
.chat-message__avatar {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  background: #444;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.chat-message__avatar img { width: 20px; height: 20px; }
.chat-message__content {
  padding: 10px 14px;
  border-radius: 18px;
  word-wrap: break-word;
  overflow-wrap: break-word;
  background: #2c2c2c;
  color: #fff;
  line-height: 1.4;
}
.chat-message--user .chat-message__content { background: #6C67FD; color: white; }
.chat-message--ai .chat-message__content { background: #3a3a3a; }
.chat-message--loading .chat-message__content { background: #3a3a3a; }
.typing-indicator { font-size: 20px; letter-spacing: 2px; animation: blink 1.2s infinite; }
@keyframes blink { 0% { opacity: 0.2; } 50% { opacity: 1; } 100% { opacity: 0.2; } }

.chat-stop-button {
  margin: 8px auto;
  display: block;
  padding: 6px 14px;
  background: rgba(208, 64, 64, 0.9);
  color: #fff;
  border: none;
  border-radius: 16px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  transition: background 0.15s ease;
}
.chat-stop-button:hover { background: rgba(180, 40, 40, 1); }

.chat-input-area {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: 10px;
  margin-top: 10px;
  margin-bottom: 20px;
  background: transparent;
  width: 100%;
  flex-shrink: 0;
}

.chat-pinned-risk {
  grid-column: 1 / -1;
  padding: 8px 12px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.06);
  color: #fff;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.chat-pinned-risk--good { border-color: rgba(31, 157, 74, 0.6); }
.chat-pinned-risk--warn { border-color: rgba(217, 156, 0, 0.6); }
.chat-pinned-risk--danger { border-color: rgba(208, 64, 64, 0.6); }

/* Inline pinned-risk (под сообщением пользователя в чате) выглядит так же,
   как блок над полем ввода: полноцветный фон по уровню риска, белый текст. */
.chat-pinned-risk--inline {
  margin-top: 0;
  width: auto;
  border-width: 2px;
}
.chat-pinned-risk--inline.chat-pinned-risk--good {
  background: rgba(31, 122, 31, 0.05);
  border-color: rgba(31, 122, 31, 1);
}
.chat-pinned-risk--inline.chat-pinned-risk--warn {
  background: rgba(217, 156, 0, 0.05);
  border-color: rgba(217, 156, 0, 1);
}
.chat-pinned-risk--inline.chat-pinned-risk--danger {
  background: rgba(208, 64, 64, 0.05);
  border-color: rgba(208, 64, 64, 1);
}

.chat-pinned-risk__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.chat-pinned-risk__badge {
  font-size: 10px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: #c8c8e8;
}

.chat-pinned-risk__close {
  background: transparent;
  border: none;
  color: #c8c8e8;
  font-size: 16px;
  line-height: 1;
  cursor: pointer;
  padding: 0 4px;
}
.chat-pinned-risk__close:hover { color: #fff; }

.chat-pinned-risk__title {
  font-size: 13px;
  font-weight: 600;
  color: #fff;
}

.chat-pinned-risk__quote {
  margin: 0;
  font-size: 12px;
  font-style: italic;
  color: #c8c8e8;
  border-left: 2px solid rgba(255, 255, 255, 0.25);
  padding-left: 8px;
  max-height: 60px;
  overflow-y: auto;
}
.chat-input {
  width: 100%;
  height: 100px;
  border: 1px solid #5e5e5e;
  border-radius: 30px;
  padding: 15px;
  background: #333;
  color: #fff;
  font-size: 14px;
  resize: none;
  outline: none;
  font-family: inherit;
}
.chat-input:focus { border-color: #6C67FD; }
.chat-input:disabled { opacity: 0.6; }
.chat-send {
  width: 25px;
  height: 25px;
  background-color: #a2a2a2;
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s;
  flex-shrink: 0;
}
.chat-send.active { background-color: #6C67FD; }
.chat-send img { width: 14px; height: 14px; filter: brightness(0) invert(1); }
.chat-send:disabled { cursor: not-allowed; opacity: 0.5; }

/* Остальные элементы получают стандартные отступы (было) */
.assistant__messages :deep(h1),
.assistant__messages :deep(h2),
.assistant__messages :deep(h3),
.assistant__messages :deep(h4),
.assistant__messages :deep(h5),
.assistant__messages :deep(h6) {
  margin-top: 1.2em;
  margin-bottom: 0.5em;
  font-weight: 600;
  line-height: 1.2;
}
.assistant__messages :deep(h1) { font-size: 1.6rem; border-left: 4px solid #6C67FD; padding-left: 12px; }
.assistant__messages :deep(h2) { font-size: 1.4rem; border-bottom: 1px solid #5e5e5e; padding-bottom: 4px; }
.assistant__messages :deep(h3) { font-size: 1.2rem; }
.assistant__messages :deep(h4) { font-size: 1.1rem; }
.assistant__messages :deep(p) {
  margin: 0.8em 0;
  line-height: 1.5;
}
.assistant__messages :deep(ul),
.assistant__messages :deep(ol) { margin: 0.6em 0 0.6em 1.8em; padding-left: 0; }
.assistant__messages :deep(li) { margin: 0.3em 0; line-height: 1.4; }
.assistant__messages :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 1.2em 0;
  font-size: 0.9rem;
  background: #2c2c2c;
  color: #e0e0e0;
}
.assistant__messages :deep(th),
.assistant__messages :deep(td) {
  border: 1px solid #555 !important;
  padding: 8px 10px !important;
  text-align: left;
  vertical-align: top;
}
.assistant__messages :deep(th) { background-color: #444; font-weight: 700; }
.assistant__messages :deep(tr:nth-child(even)) { background-color: #3a3a3a; }
.assistant__messages :deep(pre) {
  background: #1e1e1e;
  border-radius: 8px;
  padding: 12px;
  overflow-x: auto;
  margin: 1em 0;
  font-family: monospace;
  font-size: 0.85rem;
  line-height: 1.4;
}
.assistant__messages :deep(code) {
  background: #2a2a2a;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: monospace;
  font-size: 0.85rem;
}
.assistant__messages :deep(pre code) { background: transparent; padding: 0; }
.assistant__messages :deep(blockquote) {
  margin: 1em 0;
  padding: 8px 16px;
  border-left: 4px solid #6C67FD;
  background: rgba(108,103,253,0.1);
  border-radius: 0 8px 8px 0;
  font-style: italic;
  color: #ccc;
}
.assistant__messages :deep(a) {
  color: #6C67FD;
  text-decoration: none;
  border-bottom: 1px dotted rgba(108,103,253,0.5);
}
.assistant__messages :deep(a):hover { text-decoration: underline; }
.assistant__messages :deep(hr) {
  border: none;
  height: 1px;
  background: linear-gradient(to right, #5e5e5e, #aaa, #5e5e5e);
  margin: 24px 0;
}

.assistant__logo { width: 25px; height: 25px; }
.loading-dots { font-size: 24px; color: #a2a2a2; animation: blink 1s infinite; }
.assistant__footer {
  background: #333;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  margin: 0 -20px -20px -20px;
  padding: 20px;
  border-top: 1px solid #5e5e5e;
  flex-shrink: 0;
}
.footer__text { font-size: 12px; color: #a2a2a2; max-width: 400px; margin: 0; }
.footer__button.report {
  min-width: 120px;
  height: 30px;
  background-color: #6C67FD;
  border: none;
  border-radius: 50px;
  font-size: 12px;
  font-weight: 500;
  color: #FFF;
  cursor: pointer;
  transition: all 0.2s;
  opacity: 1;
}
.footer__button.report:hover { background-color: #FFF; color: #6C67FD; }
.dashed-line {
  width: 100%;
  height: 1px;
  background: repeating-linear-gradient(90deg, #5e5e5e, #5e5e5e 3px, transparent 3px, transparent 5px);
  margin: 20px 0;
}
.scroll-to-bottom {
  position: sticky;
  bottom: 15px;
  left: 50%;
  transform: translateX(-50%);
  width: 25px;
  height: 25px;
  background: #fff;
  color: #333;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0,0,0,0.3);
  border: 1px solid #a2a2a2;
}
.scroll-to-bottom:hover { background-color: #e6e6e6; }
.scroll-to-bottom__icon { height: 15px; }
</style>