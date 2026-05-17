import { describe, it, expect } from 'vitest'
import { formatFileSize, getFileExtension, truncateFileName, isAllowedFileType } from '@/helpers/fileUtils'

describe('fileUtils', () => {
  describe('formatFileSize', () => {
    it('форматирует байты', () => {
      expect(formatFileSize(500)).toBe('500 B')
      expect(formatFileSize(1023)).toBe('1023 B')
    })

    it('форматирует килобайты', () => {
      expect(formatFileSize(1024)).toBe('1.0 KB')
      expect(formatFileSize(1536)).toBe('1.5 KB')
    })

    it('форматирует мегабайты', () => {
      expect(formatFileSize(1048576)).toBe('1.0 MB')
      expect(formatFileSize(1572864)).toBe('1.5 MB')
    })
  })

  describe('getFileExtension', () => {
    it('возвращает расширение в нижнем регистре', () => {
      expect(getFileExtension('document.PDF')).toBe('pdf')
      expect(getFileExtension('file.DoCx')).toBe('docx')
    })

    it('возвращает пустую строку, если нет расширения', () => {
      expect(getFileExtension('noextension')).toBe('')
    })
  })

  describe('truncateFileName', () => {
    it('обрезает длинное имя и добавляет ..', () => {
        const longName = 'very_long_filename_that_exceeds_limit.pdf'
        expect(truncateFileName(longName, 20)).toBe('very_long_filename_t..')
        })

    it('не обрезает короткое имя', () => {
      const shortName = 'short.pdf'
      expect(truncateFileName(shortName, 20)).toBe('short.pdf')
    })
  })

  describe('isAllowedFileType', () => {
    it('разрешает .pdf, .doc, .docx', () => {
      expect(isAllowedFileType('file.pdf')).toBe(true)
      expect(isAllowedFileType('file.doc')).toBe(true)
      expect(isAllowedFileType('file.docx')).toBe(true)
    })

    it('запрещает другие расширения', () => {
      expect(isAllowedFileType('file.jpg')).toBe(false)
      expect(isAllowedFileType('file.exe')).toBe(false)
    })
  })
})