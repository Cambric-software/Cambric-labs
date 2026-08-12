/**
 * Cambric Labs — Lesson Quality Scorer
 *
 * Scores each lesson on dimensions that correlate with genuine educational
 * value (rather than inflated counts):
 *   - objectivesCoverage: does the lesson content address each stated objective?
 *   - hasActivity: an interactive activity is present.
 *   - hasAnimation: a step-through animation is present.
 *   - hasComprehension: at least one comprehension check.
 *   - hasCodeExamples: contains at least one code block with real code.
 *   - hasCompareBlock: a cross-language comparison block (reinforces transfer).
 *   - contentVariety: uses multiple block types (not just walls of paragraphs).
 *   - nonTemplateContent: body is not a shallow restatement of the title/summary.
 *   - explanationDepth: heuristic on explanation length vs. title complexity.
 *
 * Each dimension yields 0..1; the composite score is a weighted sum. The
 * scorer is pure and operates on a single LessonDetail at a time, so it can
 * run lazily as lessons are loaded — never loading all bodies at once.
 */
import type { LessonDetail, LessonBlock } from './types'

export interface QualityDimension {
  key: string
  label: string
  score: number
  detail: string
}

export interface QualityReport {
  lessonId: string
  composite: number
  dimensions: QualityDimension[]
}

const WEIGHTS: Record<string, number> = {
  objectivesCoverage: 0.2,
  hasActivity: 0.15,
  hasComprehension: 0.12,
  hasCodeExamples: 0.15,
  hasAnimation: 0.08,
  hasCompareBlock: 0.05,
  contentVariety: 0.1,
  nonTemplateContent: 0.1,
  explanationDepth: 0.05,
}

export function scoreLesson(lesson: LessonDetail): QualityReport {
  const dims: QualityDimension[] = []

  const text = collectText(lesson.content).toLowerCase()
  const objectivesCovered = lesson.objectives.filter((obj) =>
    keywordOverlap(obj.toLowerCase(), text),
  )
  const coverage = lesson.objectives.length === 0
    ? 1
    : objectivesCovered.length / lesson.objectives.length
  dims.push({
    key: 'objectivesCoverage',
    label: 'Objectives covered by content',
    score: coverage,
    detail: lesson.objectives.length === 0
      ? 'No objectives declared'
      : `${objectivesCovered.length}/${lesson.objectives.length} objectives reflected in content`,
  })

  dims.push({
    key: 'hasActivity',
    label: 'Interactive activity present',
    score: lesson.activity ? 1 : 0,
    detail: lesson.activity ? `Activity type: ${lesson.activity.type}` : 'Missing',
  })

  dims.push({
    key: 'hasComprehension',
    label: 'Comprehension check present',
    score: lesson.comprehensionChecks && lesson.comprehensionChecks.length > 0 ? 1 : 0,
    detail: lesson.comprehensionChecks?.length
      ? `${lesson.comprehensionChecks.length} check(s)`
      : 'Missing',
  })

  const codeBlocks = countCodeBlocks(lesson.content)
  const realCode = codeBlocks.filter((b) => b.length > 12).length
  dims.push({
    key: 'hasCodeExamples',
    label: 'Substantive code examples',
    score: realCode >= 2 ? 1 : realCode === 1 ? 0.5 : 0,
    detail: `${realCode} substantive code block(s) (≥2 ideal)`,
  })

  dims.push({
    key: 'hasAnimation',
    label: 'Animation present',
    score: lesson.animation ? 1 : 0,
    detail: lesson.animation ? `${lesson.animation.steps.length} steps` : 'Missing',
  })

  const hasCompare = lesson.content.some((b) => b.kind === 'compare')
  dims.push({
    key: 'hasCompareBlock',
    label: 'Cross-language comparison',
    score: hasCompare ? 1 : 0,
    detail: hasCompare ? 'Present' : 'Missing',
  })

  // Content variety: does the lesson use multiple block types, or is it a
  // wall of paragraphs? A genuinely educational lesson mixes paragraphs,
  // headings, code, callouts, and steps.
  const blockTypes = new Set(lesson.content.map((b) => b.kind))
  const varietyScore = Math.min(1, blockTypes.size / 4)
  dims.push({
    key: 'contentVariety',
    label: 'Content variety (block types)',
    score: varietyScore,
    detail: `${blockTypes.size} distinct block type(s): ${[...blockTypes].join(', ')}`,
  })

  // Non-template content: the body must contain substantial text that is NOT
  // just a restatement of the title/summary. We tokenize title+summary, then
  // check how many body tokens are OUTSIDE that set. A lesson that only
  // repeats its own summary is a template, not content.
  const headTokens = tokenize(`${lesson.title} ${lesson.summary}`)
  const bodyTokens = tokenize(text)
  const novelBodyTokens = [...bodyTokens].filter((t) => !headTokens.has(t))
  const novelRatio = bodyTokens.size === 0 ? 0 : novelBodyTokens.length / bodyTokens.size
  dims.push({
    key: 'nonTemplateContent',
    label: 'Non-template body content',
    score: novelRatio >= 0.5 ? 1 : novelRatio >= 0.3 ? 0.5 : 0,
    detail: `${Math.round(novelRatio * 100)}% of body tokens are novel (not in title/summary)`,
  })

  // Explanation depth: ratio of explanation words to title words. A real
  // lesson explains more than it titles.
  const titleWords = lesson.title.split(/\s+/).length
  const textWords = text.split(/\s+/).filter(Boolean).length
  const depth = titleWords === 0 ? 0 : Math.min(1, textWords / (titleWords * 40))
  dims.push({
    key: 'explanationDepth',
    label: 'Explanation depth',
    score: depth,
    detail: `${textWords} words of explanation for a ${titleWords}-word title`,
  })

  let composite = 0
  for (const d of dims) composite += d.score * (WEIGHTS[d.key] ?? 0)
  return {
    lessonId: lesson.id,
    composite: Math.round(composite * 100) / 100,
    dimensions: dims,
  }
}

function tokenize(text: string): Set<string> {
  const words = text.toLowerCase().match(/[a-z0-9]{3,}/g) ?? []
  return new Set(words)
}

function collectText(blocks: LessonBlock[]): string {
  const parts: string[] = []
  for (const b of blocks) {
    switch (b.kind) {
      case 'paragraph': case 'heading': parts.push(b.text); break
      case 'callout': parts.push(b.text); break
      case 'code': parts.push(b.code); break
      case 'codeWithOutput': parts.push(b.code); parts.push(b.output); break
      case 'compare': parts.push(b.snippets.join(' ')); break
      case 'steps': parts.push(b.steps.join(' ')); break
    }
  }
  return parts.join(' ')
}

function countCodeBlocks(blocks: LessonBlock[]): string[] {
  const out: string[] = []
  for (const b of blocks) {
    if (b.kind === 'code') out.push(b.code)
    else if (b.kind === 'codeWithOutput') out.push(b.code)
    else if (b.kind === 'compare') out.push(...b.snippets)
  }
  return out
}

function keywordOverlap(objective: string, text: string): boolean {
  // Extract the salient nouns from the objective and check at least one
  // meaningful word appears in the lesson text.
  const words = objective.match(/[a-z]{3,}/g) ?? []
  const salient = words.filter(
    (w) => !['the', 'and', 'for', 'with', 'that', 'this', 'your', 'how', 'use', 'why', 'when'].includes(w),
  )
  if (salient.length === 0) return true
  return salient.some((w) => text.includes(w))
}
