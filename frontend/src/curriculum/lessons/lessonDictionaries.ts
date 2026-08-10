/**
 * Cambric Labs — Lesson: Dictionaries (Maps)
 *
 * Teaches key-value maps. The genuine insight is that a dict answers "what is
 * the value for this key?" in one step regardless of size (hash lookup), and
 * that keys must be hashable. Avoids the shallow "dict of names" tour by
 * surfacing hashability and the KeyError-vs-default pattern.
 */
import type { LessonDetail } from '../types'

export const lessonDictionaries: LessonDetail = {
  id: 'lesson-dictionaries',
  title: 'Dictionaries: Keys to Values',
  moduleId: 'module-collections',
  languageId: 'python',
  difficulty: 3,
  estimatedMinutes: 13,
  summary:
    'Store key-to-value associations, look up a value by key in one step, and ' +
    'handle missing keys. Understand why keys must be hashable.',
  teachesConceptIds: ['map', 'collection', 'immutability'],
  prerequisiteConceptIds: ['collection', 'array', 'variable', 'type'],
  objectives: [
    'Create a dictionary and look up a value by key.',
    'Add, update, and remove key-value pairs.',
    'Choose between direct lookup and .get() to handle missing keys.',
    'Explain why list keys are not allowed (hashability).',
  ],
  content: [
    {
      kind: 'paragraph',
      text:
        'A dictionary maps keys to values. Instead of finding an element by its ' +
        'position (like a list), you find it by a key you choose — a name, an id, ' +
        'any hashable value. Lookups take roughly constant time no matter how ' +
        'many entries the dictionary holds.',
    },
    {
      kind: 'heading',
      text: 'Creating and looking up',
    },
    {
      kind: 'codeWithOutput',
      languageId: 'python',
      caption: 'A dictionary of capitals, looked up by country.',
      code: 'capitals = {"France": "Paris", "Japan": "Tokyo"}\nprint(capitals["Japan"])   # Tokyo\nprint(capitals["France"])  # Paris',
      output: 'Tokyo\nParis',
    },
    {
      kind: 'callout',
      variant: 'warning',
      title: 'Missing key raises KeyError',
      text:
        'capitals["Brazil"] raises KeyError because the key is not present. You ' +
        'either guard with `in` first, or use .get(key, default) which returns the ' +
        'default instead of crashing.',
    },
    {
      kind: 'codeWithOutput',
      languageId: 'python',
      caption: 'Two safe ways to handle a missing key.',
      code: 'capitals = {"France": "Paris"}\n# guard with in\nif "Brazil" in capitals:\n    print(capitals["Brazil"])\nelse:\n    print("unknown")\n\n# or use .get with a default\nprint(capitals.get("Brazil", "unknown"))',
      output: 'unknown\nunknown',
    },
    {
      kind: 'heading',
      text: 'Adding, updating, and removing',
    },
    {
      kind: 'codeWithOutput',
      languageId: 'python',
      caption: 'Assign updates an existing key or creates a new one.',
      code: 'scores = {"ada": 9}\nscores["ada"] = 10        # update existing\nscores["bob"] = 7         # add new\ndel scores["bob"]         # remove\nprint(scores)             # {\'ada\': 10}',
      output: "{'ada': 10}",
    },
    {
      kind: 'paragraph',
      text:
        'Assigning to a key that exists overwrites its value; assigning to a key ' +
        'that does not exist inserts a new pair. This dual behavior — update or ' +
        'insert — is called an "upsert" and is the normal way dictionaries grow.',
    },
    {
      kind: 'heading',
      text: 'Keys must be hashable',
    },
    {
      kind: 'paragraph',
      text:
        'A dictionary finds values by hashing the key — turning it into a number ' +
        'that locates the entry. Mutable values like lists cannot be hashed ' +
        'because their contents could change, which would break the lookup. So ' +
        'keys must be immutable: strings, numbers, tuples of immutables.',
    },
    {
      kind: 'codeWithOutput',
      languageId: 'python',
      caption: 'A list key fails; a tuple key works.',
      code: 'd = {}\n# d[[1, 2]] = "x"   # TypeError: list is unhashable\nd[(1, 2)] = "point"      # ok: tuple is hashable\nprint(d[(1, 2)])         # point',
      output: 'point',
    },
    {
      kind: 'callout',
      variant: 'tip',
      title: 'When to use a dict vs a list',
      text:
        'Use a list when you care about order and position. Use a dict when you ' +
        'care about looking things up by a meaningful key. A list of 10,000 ' +
        'records searched by id is O(n); a dict is O(1).',
    },
    {
      kind: 'compare',
      languageIds: ['python', 'typescript'],
      caption:
        'Python dict and JavaScript object/Map both map keys to values. JS plain ' +
        'objects coerce keys to strings; a Map keeps keys typed and allows any ' +
        'value as a key — closer to Python dict semantics.',
      snippets: [
        'capitals = {"Japan": "Tokyo"}\ncapitals.get("Japan", "?")  # Tokyo\n# keys must be hashable',
        'const capitals = { Japan: "Tokyo" };\ncapitals.Japan ?? "?";      // Tokyo\n// or use a Map for typed keys',
      ],
    },
  ],
  animation: {
    type: 'memoryDiagram',
    title: 'A hash lookup in one step',
    steps: [
      { caption: 'capitals = {"France": "Paris", "Japan": "Tokyo"} stores two key-value entries.', highlightLines: [] },
      { caption: 'capitals["Japan"] hashes "Japan" to a bucket index.', highlightLines: [] },
      { caption: 'That bucket holds the entry ("Japan" -> "Tokyo").', highlightLines: [] },
      { caption: 'The value "Tokyo" is returned — one lookup, regardless of how many other entries exist.', highlightLines: [] },
      { caption: 'Contrast with a list: finding a value by content would scan every element. The key is the shortcut.', highlightLines: [] },
    ],
  },
  activity: {
    type: 'codeChallenge',
    title: 'Count word occurrences',
    prompt:
      'Given `words = ["a", "b", "a", "c", "b", "a"]`, build a dictionary ' +
      'counting how many times each word appears, then print counts["a"]. ' +
      'The result must be 3. Use .get(word, 0) + 1 to increment safely.',
    languageId: 'python',
    starterCode: 'words = ["a", "b", "a", "c", "b", "a"]\ncounts = {}\nfor w in words:\n    counts[w] = counts.get(w, 0) + 1\n\nprint(counts["a"])',
    checks: [
      { description: 'Uses a for loop.', assertion: { kind: 'contains', value: 'for ' } },
      { description: 'Uses .get(', assertion: { kind: 'contains', value: '.get(' } },
      { description: 'Prints 3', assertion: { kind: 'outputContains', value: '3' } },
    ],
  },
  comprehensionChecks: [
    {
      question: 'What happens with `d["missing"]` when the key is not in d?',
      options: ['Returns None', 'Returns an empty string', 'Raises KeyError', 'Returns 0'],
      correctIndex: 2,
      explanation:
        'Direct indexing raises KeyError. To avoid the crash use d.get("missing") ' +
        '(returns None) or d.get("missing", default) for a custom default.',
    },
    {
      question: 'Why can a list not be a dictionary key?',
      options: [
        'Lists are too long.',
        'Lists are mutable, so their hash could change and break lookups.',
        'Lists cannot be stored in memory.',
        'Lists are only for numbers.',
      ],
      correctIndex: 1,
      explanation:
        'Dictionary keys must be hashable. A list is mutable; if it changed after ' +
        'being used as a key, the stored hash would no longer match, making the ' +
        'entry unreachable. Immutable values (strings, tuples) are safe keys.',
    },
  ],
}
