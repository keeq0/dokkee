import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import {
  useDocumentsStore,
  createDocumentRecord,
  resolveFileType,
  DOCUMENT_STATUS
} from '@/stores/documents'

describe('documents store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('инициализируется пустым', () => {
    const store = useDocumentsStore()
    expect(store.items).toEqual([])
    expect(store.selectedId).toBeNull()
    expect(store.count).toBe(0)
    expect(store.selected).toBeNull()
  })

  it('add добавляет документ и пересчитывает count (обратная совместимость)', () => {
    const store = useDocumentsStore()
    store.add({ id: 1, title: 'doc-1' })
    store.add({ id: 2, title: 'doc-2' })
    expect(store.items).toHaveLength(2)
    expect(store.count).toBe(2)
  })

  it('select выставляет selectedId, getter selected возвращает документ', () => {
    const store = useDocumentsStore()
    store.add({ id: 10, title: 'doc-10' })
    store.add({ id: 20, title: 'doc-20' })
    store.select(20)
    expect(store.selectedId).toBe(20)
    expect(store.selected).toEqual({ id: 20, title: 'doc-20' })
  })

  it('selected возвращает null, если выбранный id не существует', () => {
    const store = useDocumentsStore()
    store.add({ id: 1, title: 'doc-1' })
    store.select(999)
    expect(store.selected).toBeNull()
  })

  it('remove удаляет документ; при удалении выбранного выбирается первый из оставшихся', () => {
    const store = useDocumentsStore()
    store.add({ id: 1, title: 'doc-1' })
    store.add({ id: 2, title: 'doc-2' })
    store.select(1)
    store.remove(1)
    expect(store.items).toHaveLength(1)
    expect(store.items[0].id).toBe(2)
    expect(store.selectedId).toBe(2)
  })

  it('remove последнего документа сбрасывает selectedId в null', () => {
    const store = useDocumentsStore()
    store.add({ id: 1, title: 'doc-1' })
    store.select(1)
    store.remove(1)
    expect(store.items).toEqual([])
    expect(store.selectedId).toBeNull()
  })

  it('remove не сбрасывает selectedId, если удалён другой документ', () => {
    const store = useDocumentsStore()
    store.add({ id: 1, title: 'doc-1' })
    store.add({ id: 2, title: 'doc-2' })
    store.select(2)
    store.remove(1)
    expect(store.selectedId).toBe(2)
    expect(store.selected).toEqual({ id: 2, title: 'doc-2' })
  })

  it('reset очищает всё', () => {
    const store = useDocumentsStore()
    store.add({ id: 1, title: 'doc-1' })
    store.select(1)
    store.reset()
    expect(store.items).toEqual([])
    expect(store.selectedId).toBeNull()
    expect(store.count).toBe(0)
  })

  describe('resolveFileType', () => {
    it('распознаёт pdf и docx', () => {
      expect(resolveFileType('file.pdf')).toBe('pdf')
      expect(resolveFileType('file.DOCX')).toBe('docx')
    })

    it('возвращает null для .doc и неподдерживаемых форматов', () => {
      expect(resolveFileType('file.doc')).toBeNull()
      expect(resolveFileType('file.png')).toBeNull()
      expect(resolveFileType('noext')).toBeNull()
    })
  })

  describe('createDocumentRecord', () => {
    it('создаёт запись с дефолтными полями', () => {
      const rec = createDocumentRecord({ name: 'test.pdf', type: 'pdf' })
      expect(rec.name).toBe('test.pdf')
      expect(rec.type).toBe('pdf')
      expect(rec.status).toBe(DOCUMENT_STATUS.IDLE)
      expect(rec.progress).toBe(0)
      expect(rec.extractedText).toBe('')
      expect(rec.htmlPreview).toBe('')
      expect(rec.analysisResult).toBeNull()
      expect(rec.analysisError).toBe(false)
      expect(rec.risks).toEqual([])
      expect(rec.chatHistory).toEqual([])
      expect(rec.id).toEqual(expect.any(Number))
    })

    it('каждая запись имеет уникальный id', () => {
      const a = createDocumentRecord({ name: 'a' })
      const b = createDocumentRecord({ name: 'b' })
      expect(a.id).not.toBe(b.id)
    })
  })

  describe('addFile', () => {
    beforeEach(() => {
      vi.stubGlobal('URL', {
        createObjectURL: vi.fn(() => 'blob:fake-url'),
        revokeObjectURL: vi.fn()
      })
    })

    it('добавляет pdf через addFile с url и type', () => {
      const store = useDocumentsStore()
      const rec = store.addFile({ name: 'doc.pdf' })
      expect(rec).not.toBeNull()
      expect(rec.type).toBe('pdf')
      expect(rec.url).toBe('blob:fake-url')
      expect(store.items).toHaveLength(1)
    })

    it('первый файл становится выбранным автоматически', () => {
      const store = useDocumentsStore()
      const rec = store.addFile({ name: 'a.pdf' })
      expect(store.selectedId).toBe(rec.id)
    })

    it('последующий файл не меняет выбор', () => {
      const store = useDocumentsStore()
      const first = store.addFile({ name: 'a.pdf' })
      store.addFile({ name: 'b.docx' })
      expect(store.selectedId).toBe(first.id)
    })

    it('возвращает null и не добавляет неподдерживаемые форматы', () => {
      const store = useDocumentsStore()
      expect(store.addFile({ name: 'file.doc' })).toBeNull()
      expect(store.addFile({ name: 'file.txt' })).toBeNull()
      expect(store.items).toEqual([])
    })

    it('remove освобождает objectURL', () => {
      const store = useDocumentsStore()
      const rec = store.addFile({ name: 'a.pdf' })
      store.remove(rec.id)
      expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:fake-url')
    })
  })

  describe('update / set* actions', () => {
    let store
    let rec

    beforeEach(() => {
      store = useDocumentsStore()
      rec = createDocumentRecord({ name: 'a.pdf', type: 'pdf' })
      store.add(rec)
    })

    it('setStatus / setProgress / setExtractedText / setHtmlPreview', () => {
      store.setStatus(rec.id, DOCUMENT_STATUS.EXTRACTING)
      store.setProgress(rec.id, 42)
      store.setExtractedText(rec.id, 'plain text')
      store.setHtmlPreview(rec.id, '<p>hi</p>')

      const item = store.byId(rec.id)
      expect(item.status).toBe(DOCUMENT_STATUS.EXTRACTING)
      expect(item.progress).toBe(42)
      expect(item.extractedText).toBe('plain text')
      expect(item.htmlPreview).toBe('<p>hi</p>')
    })

    it('setProgress зажимает значение в диапазон [0, 100]', () => {
      store.setProgress(rec.id, -10)
      expect(store.byId(rec.id).progress).toBe(0)
      store.setProgress(rec.id, 200)
      expect(store.byId(rec.id).progress).toBe(100)
    })

    it('setAnalysisResult выставляет DONE и 100%', () => {
      store.setAnalysisResult(rec.id, '## report')
      const item = store.byId(rec.id)
      expect(item.analysisResult).toBe('## report')
      expect(item.analysisError).toBe(false)
      expect(item.status).toBe(DOCUMENT_STATUS.DONE)
      expect(item.progress).toBe(100)
    })

    it('setAnalysisError выставляет ERROR и сбрасывает result', () => {
      store.setAnalysisResult(rec.id, '## report')
      store.setAnalysisError(rec.id)
      const item = store.byId(rec.id)
      expect(item.analysisResult).toBeNull()
      expect(item.analysisError).toBe(true)
      expect(item.status).toBe(DOCUMENT_STATUS.ERROR)
    })

    it('setRisks и addChatMessage', () => {
      store.setRisks(rec.id, [{ level: 'Хорошо', name: 'r1' }])
      store.addChatMessage(rec.id, { role: 'user', content: 'q' })
      store.addChatMessage(rec.id, { role: 'assistant', content: 'a' })

      const item = store.byId(rec.id)
      expect(item.risks).toEqual([{ level: 'Хорошо', name: 'r1' }])
      expect(item.chatHistory).toHaveLength(2)
    })

    it('update с несуществующим id возвращает null', () => {
      expect(store.update(99999, { progress: 50 })).toBeNull()
    })
  })
})
