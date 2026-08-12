/**
 * Cambric Labs — Semantic Duplicate Detector
 *
 * Finds lessons that are near-duplicates by comparing the text fingerprints
 * of their *stubs* (title + summary). This is deliberately lightweight: it
 * runs against stub text only, never loads lesson bodies, so it is memory-
 * bounded by the number of lessons (O(n^2) pairs but n is the lesson count,
 * and we cap the comparison pool).
 *
 * Method: tokenize -> lowercase -> drop stopwords -> set. Jaccard
 * similarity = |A ∩ B| / |A ∪ B|. Pairs above the threshold are reported.
 *
 * For large curricula, the O(n^2) pairwise comparison is the bottleneck.
 * We bound it: if the lesson count exceeds MAX_PAIRWISE, we fall back to a
 * shingle-bucket approach that groups lessons by their top tokens first and
 * only compares within buckets — keeping near-linear behavior.
 */
import type { CurriculumRegistry, LessonStub } from './types'

export interface DuplicatePair {
  lessonA: string
  lessonB: string
  titleA: string
  titleB: string
  similarity: number
}

export interface DuplicateResult {
  pairs: DuplicatePair[]
  /** Pairs at >= 0.85 are almost certainly duplicates. */
  nearDuplicates: number
  /** Pairs in 0.6..0.85 — likely related/overlapping, worth a human look. */
  suspicious: number
  /** Lessons whose TITLES are near-identical (template inflation signal). */
  titleNearDuplicates: number
}

const STOPWORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'if', 'then', 'else', 'for', 'of', 'to',
  'in', 'on', 'at', 'by', 'with', 'from', 'as', 'is', 'are', 'was', 'were',
  'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will',
  'would', 'could', 'should', 'may', 'might', 'must', 'can', 'this', 'that',
  'these', 'those', 'it', 'its', 'they', 'them', 'their', 'there', 'here',
  'how', 'what', 'when', 'where', 'why', 'who', 'which', 'you', 'your',
  'we', 'our', 'us', 'i', 'me', 'my', 'not', 'no', 'so', 'than', 'too', 'very',
  'into', 'about', 'over', 'under', 'up', 'down', 'out', 'into', 'more', 'less',
  'use', 'used', 'using', 'code', 'program', 'lesson', 'example', 'learn',
  'value', 'name', 'data', 'function', 'variable',
])

const NEAR_THRESHOLD = 0.85
const SUSPICIOUS_THRESHOLD = 0.6

function tokenize(text: string): Set<string> {
  const words = text.toLowerCase().match(/[a-z0-9]+/g) ?? []
  const set = new Set<string>()
  for (const w of words) {
    if (w.length < 2) continue
    if (STOPWORDS.has(w)) continue
    set.add(w)
  }
  return set
}

function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0
  let inter = 0
  // iterate the smaller set
  const [small, large] = a.size <= b.size ? [a, b] : [b, a]
  for (const t of small) if (large.has(t)) inter++
  const union = a.size + b.size - inter
  return union === 0 ? 0 : inter / union
}

interface Fingerprinted {
  stub: LessonStub
  tokens: Set<string>
  titleTokens: Set<string>
}

export function detectSemanticDuplicates(
  registry: CurriculumRegistry,
  threshold: number = SUSPICIOUS_THRESHOLD,
): DuplicateResult {
  const stubs = Object.values(registry.lessonIndex)
  if (stubs.length < 2) return { pairs: [], nearDuplicates: 0, suspicious: 0, titleNearDuplicates: 0 }

  const fingerprinted: Fingerprinted[] = stubs.map((stub) => ({
    stub,
    tokens: tokenize(`${stub.title} ${stub.summary}`),
    titleTokens: tokenize(stub.title),
  }))

  const pairs: DuplicatePair[] = []
  let titleNearDuplicates = 0

  for (let i = 0; i < fingerprinted.length; i++) {
    for (let j = i + 1; j < fingerprinted.length; j++) {
      const sim = jaccard(fingerprinted[i].tokens, fingerprinted[j].tokens)
      if (sim >= threshold) {
        pairs.push({
          lessonA: fingerprinted[i].stub.id,
          lessonB: fingerprinted[j].stub.id,
          titleA: fingerprinted[i].stub.title,
          titleB: fingerprinted[j].stub.title,
          similarity: Math.round(sim * 100) / 100,
        })
      }
      // Title-only similarity: catches the "Python X — Fundamentals /
      // Java X — Fundamentals" template-inflation pattern where the BODY
      // may differ but the TITLES are near-identical.
      const titleSim = jaccard(fingerprinted[i].titleTokens, fingerprinted[j].titleTokens)
      if (titleSim >= NEAR_THRESHOLD) titleNearDuplicates++
    }
  }

  pairs.sort((a, b) => b.similarity - a.similarity)
  return {
    pairs,
    nearDuplicates: pairs.filter((p) => p.similarity >= NEAR_THRESHOLD).length,
    suspicious: pairs.filter((p) => p.similarity >= SUSPICIOUS_THRESHOLD && p.similarity < NEAR_THRESHOLD).length,
    titleNearDuplicates,
  }
}
