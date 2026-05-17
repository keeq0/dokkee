import { describe, it, expect } from 'vitest'
import {
  buildAnalysisPrompt,
  parseAnalysisResponse,
  groupRisksByLevel,
  RISK_LEVEL
} from '@/services/risks'

describe('buildAnalysisPrompt', () => {
  it('подставляет текст документа и обрезает до maxChars', () => {
    const long = 'a'.repeat(20000)
    const prompt = buildAnalysisPrompt(long, { maxChars: 100 })
    expect(prompt).toContain('a'.repeat(100))
    expect(prompt).not.toContain('a'.repeat(101))
  })

  it('содержит маркеры RISKS', () => {
    const prompt = buildAnalysisPrompt('doc')
    expect(prompt).toContain('<!--RISKS-->')
    expect(prompt).toContain('<!--/RISKS-->')
  })

  it('перечисляет три уровня рисков', () => {
    const prompt = buildAnalysisPrompt('doc')
    expect(prompt).toContain('Хорошо')
    expect(prompt).toContain('Сомнительно')
    expect(prompt).toContain('Большие риски')
  })

  it('без options не содержит блок ДОПОЛНИТЕЛЬНЫХ ФОКУСОВ', () => {
    const prompt = buildAnalysisPrompt('doc')
    expect(prompt).not.toContain('ДОПОЛНИТЕЛЬНЫЕ ФОКУСЫ')
  })

  it('добавляет блок инструкций для выбранных options', () => {
    const prompt = buildAnalysisPrompt('doc', { options: ['gdpr', 'tax'] })
    expect(prompt).toContain('ДОПОЛНИТЕЛЬНЫЕ ФОКУСЫ АНАЛИЗА')
    expect(prompt).toContain('GDPR')
    expect(prompt).toContain('152-ФЗ')
    expect(prompt).toContain('налог')
    expect(prompt).not.toContain('коррупционные')
  })

  it('игнорирует неизвестные ключи options', () => {
    const prompt = buildAnalysisPrompt('doc', { options: ['unknown', 'corruption'] })
    expect(prompt).toContain('коррупционные')
    expect(prompt).not.toContain('unknown')
  })
})

describe('parseAnalysisResponse', () => {
  const sampleRisks = [
    {
      level: 'Большие риски',
      name: 'Штраф 1М',
      quote: 'Сторона обязана уплатить штраф 1 000 000 рублей',
      comment: 'Слишком высокая фиксированная сумма',
      recommendations: ['Снизить', 'Привязать к проценту']
    },
    {
      level: 'Хорошо',
      name: 'Чёткие сроки',
      quote: 'Срок поставки 30 дней',
      comment: 'Чёткая формулировка',
      recommendations: []
    }
  ]

  it('возвращает report без блока рисков и массив рисков', () => {
    const raw = `## Отчёт
Основной текст отчёта.

<!--RISKS-->
\`\`\`json
${JSON.stringify(sampleRisks)}
\`\`\`
<!--/RISKS-->`
    const { report, risks } = parseAnalysisResponse(raw)
    expect(report).toContain('## Отчёт')
    expect(report).toContain('Основной текст отчёта')
    expect(report).not.toContain('RISKS')
    expect(report).not.toContain('Штраф 1М')
    expect(risks).toHaveLength(2)
    expect(risks[0].level).toBe('Большие риски')
    expect(risks[0].recommendations).toHaveLength(2)
  })

  it('работает без markdown fence (голый JSON)', () => {
    const raw = `Отчёт.

<!--RISKS-->
${JSON.stringify(sampleRisks)}
<!--/RISKS-->`
    const { risks } = parseAnalysisResponse(raw)
    expect(risks).toHaveLength(2)
  })

  it('игнорирует элементы с неизвестным уровнем', () => {
    const raw = `<!--RISKS-->
${JSON.stringify([
  ...sampleRisks,
  { level: 'Что-то странное', name: 'x', quote: 'y', comment: 'z' }
])}
<!--/RISKS-->`
    const { risks } = parseAnalysisResponse(raw)
    expect(risks).toHaveLength(2)
  })

  it('возвращает report=raw и пустые риски, если маркеров нет', () => {
    const raw = '## Отчёт без рисков'
    const { report, risks } = parseAnalysisResponse(raw)
    expect(report).toBe('## Отчёт без рисков')
    expect(risks).toEqual([])
  })

  it('возвращает пустые риски при невалидном JSON, но отдаёт отчёт без блока', () => {
    const raw = `Отчёт.

<!--RISKS-->
не json{{
<!--/RISKS-->

Хвост.`
    const { report, risks } = parseAnalysisResponse(raw)
    expect(risks).toEqual([])
    expect(report).toContain('Отчёт')
    expect(report).toContain('Хвост')
    expect(report).not.toContain('RISKS')
  })

  it('пропускает риск без name и без quote', () => {
    const raw = `<!--RISKS-->
${JSON.stringify([
  { level: 'Сомнительно', name: '', quote: '', comment: 'без идентификации' },
  { level: 'Хорошо', name: 'OK', quote: 'q' }
])}
<!--/RISKS-->`
    const { risks } = parseAnalysisResponse(raw)
    expect(risks).toHaveLength(1)
    expect(risks[0].name).toBe('OK')
  })

  it('null/undefined raw -> пустой отчёт и пустые риски', () => {
    expect(parseAnalysisResponse(null)).toEqual({ report: '', risks: [] })
    expect(parseAnalysisResponse(undefined)).toEqual({ report: '', risks: [] })
  })
})

describe('groupRisksByLevel', () => {
  it('группирует риски по level', () => {
    const grouped = groupRisksByLevel([
      { level: 'Хорошо', name: 'g1' },
      { level: 'Большие риски', name: 'd1' },
      { level: 'Сомнительно', name: 'w1' },
      { level: 'Хорошо', name: 'g2' }
    ])
    expect(grouped[RISK_LEVEL.DANGER]).toHaveLength(1)
    expect(grouped[RISK_LEVEL.WARN]).toHaveLength(1)
    expect(grouped[RISK_LEVEL.GOOD]).toHaveLength(2)
  })

  it('возвращает пустые массивы для пустого ввода', () => {
    const grouped = groupRisksByLevel([])
    expect(grouped[RISK_LEVEL.DANGER]).toEqual([])
    expect(grouped[RISK_LEVEL.WARN]).toEqual([])
    expect(grouped[RISK_LEVEL.GOOD]).toEqual([])
  })
})
