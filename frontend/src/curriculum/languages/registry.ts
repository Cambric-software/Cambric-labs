/**
 * Cambric Labs — Language Registry
 *
 * Authoritative list of programming languages the platform teaches and
 * analyzes. Each entry is a real, accurate LanguageSpec. New languages are
 * added here once; the curriculum loader and Developer Area read from this
 * single source of truth.
 *
 * Note: `analyzable` reflects whether a static analyzer ships for the
 * language in the Developer Area today. Languages can be taught before
 * their analyzer is complete — teaching and analysis are decoupled.
 */
import type { LanguageSpec } from '../types'

export const LANGUAGES: LanguageSpec[] = [
  {
    id: 'python',
    name: 'Python',
    tagline: 'Readable, beginner-friendly general-purpose language.',
    paradigms: ['imperative', 'object-oriented', 'functional', 'scripting'],
    editorMode: 'python',
    extension: 'py',
    lineComment: '#',
    analyzable: true,
    beginnerDifficulty: 1,
  },
  {
    id: 'javascript',
    name: 'JavaScript',
    tagline: 'The language of the web; runs in browsers and servers.',
    paradigms: ['imperative', 'object-oriented', 'functional', 'scripting'],
    editorMode: 'javascript',
    extension: 'js',
    lineComment: '//',
    analyzable: true,
    beginnerDifficulty: 2,
  },
  {
    id: 'typescript',
    name: 'TypeScript',
    tagline: 'JavaScript with a static type system.',
    paradigms: ['imperative', 'object-oriented', 'functional', 'scripting'],
    editorMode: 'javascript',
    extension: 'ts',
    lineComment: '//',
    analyzable: true,
    beginnerDifficulty: 2,
  },
  {
    id: 'java',
    name: 'Java',
    tagline: 'Static, JVM-based, verbose-but-portable OO language.',
    paradigms: ['object-oriented', 'imperative', 'concurrent'],
    editorMode: 'text/x-java',
    extension: 'java',
    lineComment: '//',
    analyzable: false,
    beginnerDifficulty: 3,
  },
  {
    id: 'csharp',
    name: 'C#',
    tagline: 'Static OO language for .NET; spans desktop, web, and games.',
    paradigms: ['object-oriented', 'functional', 'imperative', 'concurrent'],
    editorMode: 'text/x-csharp',
    extension: 'cs',
    lineComment: '//',
    analyzable: false,
    beginnerDifficulty: 3,
  },
  {
    id: 'cpp',
    name: 'C++',
    tagline: 'Systems language with manual memory control and zero-cost abstractions.',
    paradigms: ['imperative', 'object-oriented', 'systems', 'concurrent'],
    editorMode: 'text/x-c++src',
    extension: 'cpp',
    lineComment: '//',
    analyzable: false,
    beginnerDifficulty: 4,
  },
  {
    id: 'c',
    name: 'C',
    tagline: 'Minimal, close-to-metal systems language.',
    paradigms: ['imperative', 'systems'],
    editorMode: 'text/x-csrc',
    extension: 'c',
    lineComment: '//',
    analyzable: false,
    beginnerDifficulty: 4,
  },
  {
    id: 'rust',
    name: 'Rust',
    tagline: 'Memory-safe systems language with ownership and borrowing.',
    paradigms: ['imperative', 'functional', 'systems', 'concurrent'],
    editorMode: 'rust',
    extension: 'rs',
    lineComment: '//',
    analyzable: false,
    beginnerDifficulty: 5,
  },
  {
    id: 'go',
    name: 'Go',
    tagline: 'Simple statically-typed language with first-class concurrency.',
    paradigms: ['imperative', 'concurrent', 'systems'],
    editorMode: 'go',
    extension: 'go',
    lineComment: '//',
    analyzable: false,
    beginnerDifficulty: 2,
  },
  {
    id: 'ruby',
    name: 'Ruby',
    tagline: 'Expressive, dynamic OO language focused on developer happiness.',
    paradigms: ['object-oriented', 'functional', 'scripting'],
    editorMode: 'ruby',
    extension: 'rb',
    lineComment: '#',
    analyzable: false,
    beginnerDifficulty: 2,
  },
  {
    id: 'kotlin',
    name: 'Kotlin',
    tagline: 'Concise JVM language; null-safe and interoperable with Java.',
    paradigms: ['object-oriented', 'functional', 'imperative'],
    editorMode: 'text/x-kotlin',
    extension: 'kt',
    lineComment: '//',
    analyzable: false,
    beginnerDifficulty: 3,
  },
  {
    id: 'swift',
    name: 'Swift',
    tagline: 'Modern static language for Apple platforms.',
    paradigms: ['object-oriented', 'functional', 'imperative'],
    editorMode: 'swift',
    extension: 'swift',
    lineComment: '//',
    analyzable: false,
    beginnerDifficulty: 3,
  },
  {
    id: 'pseudo',
    name: 'Pseudocode',
    tagline: 'Language-neutral notation used to explain concepts.',
    paradigms: ['imperative'],
    editorMode: 'text/plain',
    extension: 'pseudo',
    lineComment: '//',
    analyzable: false,
    beginnerDifficulty: 1,
  },
]

/** Index languages by id for O(1) lookup. */
export const LANGUAGE_BY_ID: Record<string, LanguageSpec> = Object.fromEntries(
  LANGUAGES.map((lang) => [lang.id, lang]),
)

export function getLanguage(id: string): LanguageSpec | undefined {
  return LANGUAGE_BY_ID[id]
}

export function listLanguages(): LanguageSpec[] {
  return LANGUAGES
}

export function listAnalyzableLanguages(): LanguageSpec[] {
  return LANGUAGES.filter((lang) => lang.analyzable)
}
