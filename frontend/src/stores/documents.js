import { defineStore } from 'pinia'
import { getFileExtension } from '@/helpers/fileUtils'

export const DOCUMENT_STATUS = Object.freeze({
  IDLE: 'idle',
  EXTRACTING: 'extracting',
  ANALYZING: 'analyzing',
  DONE: 'done',
  ERROR: 'error'
})

export const SUPPORTED_PREVIEW_TYPES = Object.freeze({
  pdf: 'pdf',
  docx: 'docx'
})

let nextId = 1

export function resolveFileType(filename) {
  const ext = getFileExtension(filename)
  return SUPPORTED_PREVIEW_TYPES[ext] || null
}

export function createDocumentRecord({ file = null, name = '', type = null, url = null } = {}) {
  return {
    id: nextId++,
    name: name || file?.name || 'Документ',
    file,
    url,
    type,
    status: DOCUMENT_STATUS.IDLE,
    progress: 0,
    extractedText: '',
    htmlPreview: '',
    analysisResult: null,
    analysisError: false,
    risks: [],
    pinnedRisk: null,
    chatHistory: [],
    // conversation - полная история сообщений DeepSeek для этого документа
    // (начальный analysis-промпт + ответ + последующие чат-сообщения).
    // Используется чтобы модель помнила контекст документа и отчёт при чате.
    conversation: []
  }
}

export const useDocumentsStore = defineStore('documents', {
  state: () => ({
    items: [],
    selectedId: null
  }),
  getters: {
    count: (state) => state.items.length,
    selected: (state) =>
      state.items.find((item) => item.id === state.selectedId) || null,
    byId: (state) => (id) => state.items.find((item) => item.id === id) || null
  },
  actions: {
    add(doc) {
      this.items.push(doc)
      return doc
    },
    addFile(file) {
      const type = resolveFileType(file.name)
      if (!type) return null
      const url = typeof URL !== 'undefined' && URL.createObjectURL
        ? URL.createObjectURL(file)
        : null
      const record = createDocumentRecord({ file, name: file.name, type, url })
      this.items.push(record)
      if (this.selectedId === null) {
        this.selectedId = record.id
      }
      return record
    },
    select(id) {
      this.selectedId = id
    },
    remove(id) {
      const item = this.items.find((i) => i.id === id)
      if (item?.url && typeof URL !== 'undefined' && URL.revokeObjectURL) {
        URL.revokeObjectURL(item.url)
      }
      this.items = this.items.filter((i) => i.id !== id)
      if (this.selectedId === id) {
        this.selectedId = this.items[0]?.id ?? null
      }
    },
    update(id, patch) {
      const item = this.items.find((i) => i.id === id)
      if (item) Object.assign(item, patch)
      return item || null
    },
    setStatus(id, status) {
      return this.update(id, { status })
    },
    setProgress(id, progress) {
      return this.update(id, { progress: Math.max(0, Math.min(100, progress)) })
    },
    setExtractedText(id, text) {
      return this.update(id, { extractedText: text })
    },
    setHtmlPreview(id, html) {
      return this.update(id, { htmlPreview: html })
    },
    setAnalysisResult(id, result) {
      return this.update(id, {
        analysisResult: result,
        analysisError: false,
        status: DOCUMENT_STATUS.DONE,
        progress: 100
      })
    },
    setAnalysisError(id, error = true) {
      return this.update(id, {
        analysisError: error,
        analysisResult: null,
        status: DOCUMENT_STATUS.ERROR
      })
    },
    setRisks(id, risks) {
      return this.update(id, { risks })
    },
    addChatMessage(id, msg) {
      const item = this.items.find((i) => i.id === id)
      if (item) item.chatHistory.push(msg)
      return item || null
    },
    setChatHistory(id, history) {
      return this.update(id, { chatHistory: history })
    },
    setConversation(id, conversation) {
      return this.update(id, { conversation })
    },
    appendConversation(id, ...messages) {
      const item = this.items.find((i) => i.id === id)
      if (!item) return null
      if (!Array.isArray(item.conversation)) item.conversation = []
      messages.filter(Boolean).forEach((m) => item.conversation.push(m))
      return item
    },
    setRiskCompleted(id, riskIndex, completed = true) {
      const item = this.items.find((i) => i.id === id)
      if (!item || !Array.isArray(item.risks)) return null
      const risk = item.risks[riskIndex]
      if (!risk) return null
      risk.completed = completed
      return item
    },
    reset() {
      this.items.forEach((item) => {
        if (item?.url && typeof URL !== 'undefined' && URL.revokeObjectURL) {
          URL.revokeObjectURL(item.url)
        }
      })
      this.items = []
      this.selectedId = null
    }
  }
})
