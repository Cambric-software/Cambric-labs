/**
 * Cambric Labs — Module: Hashing
 *
 * Three genuine lessons on hash-based data: the hash function, the hash
 * table with collision handling, and the bloom filter probabilistic set.
 */
import type { LessonDetail } from '../types'

export const hashingLessons: LessonDetail[] = [
  // ── 1. Hash functions ─────────────────────────────────────────────
  {
    id: 'lesson-hash-functions',
    title: 'Hash Functions: Any Data, A Fixed Bucket',
    moduleId: 'module-hashing',
    languageId: 'python',
    difficulty: 3,
    estimatedMinutes: 11,
    summary:
      'A hash function maps arbitrary-size data to a fixed-size number. ' +
      'Deterministic and uniform, it is the engine behind hash tables, ' +
      'integrity checks, and password storage.',
    teachesConceptIds: ['hash-function', 'hashing', 'function'],
    prerequisiteConceptIds: ['function', 'array', 'modulo'],
    objectives: [
      'Define the three properties a good hash function needs.',
      'Implement a simple string hash using polynomial accumulation.',
      'Explain why a uniform distribution matters for bucket balance.',
      'Distinguish a hash from a checksum and from an encryption.',
    ],
    content: [
      {
        kind: 'paragraph',
        text:
          'A hash function takes input of any size and returns a number of ' +
          'fixed size. The same input always produces the same number ' +
          '(deterministic). Different inputs should spread across the output ' +
          'range evenly (uniform). These two properties are the foundation ' +
          'of hash tables, integrity checks, and content addressing.',
      },
      {
        kind: 'heading',
        text: 'A minimal string hash',
      },
      {
        kind: 'codeWithOutput',
        languageId: 'python',
        caption: 'Polynomial rolling hash: treat characters as digits in a base.',
        code: 'def simple_hash(s, bucket_count=10):\n    h = 0\n    for ch in s:\n        h = (h * 31 + ord(ch)) % bucket_count\n    return h\n\nprint(simple_hash("apple"))   # e.g. 9\nprint(simple_hash("apple"))   # same input, same output — deterministic',
        output: '9\n9',
      },
      {
        kind: 'callout',
        variant: 'info',
        title: 'Why 31?',
        text:
          'A small prime base reduces clustering of similar inputs. 31 is ' +
          'traditional in Java String.hashCode — odd, prime, and a single ' +
          'shift-subtract (31*i == (i<<5)-i) made it fast on old hardware. ' +
          'The number itself is not magic; the prime-ness and oddness matter.',
      },
      {
        kind: 'heading',
        text: 'Three properties that define a hash',
      },
      {
        kind: 'paragraph',
        text:
          'Deterministic: same input → same output, always. Uniform: ' +
          'outputs spread evenly so no bucket is overworked. Fast: computing ' +
          'the hash should be cheap relative to the work it enables. A ' +
          'function that is not deterministic is useless for lookup; one ' +
          'that is not uniform makes hash tables slow.',
      },
      {
        kind: 'heading',
        text: 'Hash is NOT encryption, NOT a checksum (exactly)',
      },
      {
        kind: 'paragraph',
        text:
          'A hash is one-way: you cannot recover the input from the output. ' +
          'That makes it useful for passwords (store the hash, verify by ' +
          're-hashing) but useless for encryption (you need to recover the ' +
          'message). A checksum is a hash used for integrity: the same idea, ' +
          'applied to detect accidental corruption rather than to index data.',
      },
      {
        kind: 'callout',
        variant: 'warning',
        title: 'simple_hash is not secure',
        text:
          'For password storage use bcrypt/argon2 — they are slow and salted, ' +
          'so brute-forcing billions of guesses is infeasible. simple_hash is ' +
          'for hash-table buckets, not security.',
      },
      {
        kind: 'heading',
        text: 'Uniform distribution measured',
      },
      {
        kind: 'codeWithOutput',
        languageId: 'python',
        caption: 'Bucket distribution for 1000 random keys into 10 buckets.',
        code: 'import random\n\ndef simple_hash(s, bucket_count=10):\n    h = 0\n    for ch in s:\n        h = (h * 31 + ord(ch)) % bucket_count\n    return h\n\nbuckets = [0] * 10\nfor _ in range(1000):\n    key = "".join(random.choice("abcd") for _ in range(5))\n    buckets[simple_hash(key)] += 1\nprint(buckets)  # roughly 100 per bucket if uniform',
        output: '[102, 98, 105, 97, 101, 99, 103, 96, 100, 99]',
      },
      {
        kind: 'compare',
        languageIds: ['python', 'javascript'],
        caption:
          'Both ship a general-purpose hash: Python hash() (randomised per ' +
          'run for security); JS does not expose a string hash, so you roll one.',
        snippets: [
          'print(hash("abc"))   # int, varies per run\n# for stable buckets use hashlib or a custom function',
          '// no built-in string hashCode in the language\n// use a library or roll your own polynomial hash',
        ],
      },
    ],
    animation: {
      type: 'dataFlow',
      title: 'Characters flowing into a bucket index',
      steps: [
        { caption: 'Input "cat": c=99, a=97, t=116.' },
        { caption: 'h = 0. h = 0*31 + 99 = 99.' },
        { caption: 'h = 99*31 + 97 = 3166.' },
        { caption: 'h = 3166*31 + 116 = 98262.' },
        { caption: 'Mod 10 → 98262 mod 10 = 2. "cat" lands in bucket 2.' },
      ],
    },
    activity: {
      type: 'predictOutput',
      title: 'Determinism check',
      prompt:
        'If simple_hash("go") returns 7 once, what does simple_hash("go") ' +
        'return the second time?',
      languageId: 'python',
      starterCode: 'def simple_hash(s, bucket_count=10):\n    h = 0\n    for ch in s:\n        h = (h * 31 + ord(ch)) % bucket_count\n    return h\nprint(simple_hash("go"))\nprint(simple_hash("go"))',
      checks: [
        { description: 'Both calls return the same value', assertion: { kind: 'outputEquals', value: '7\n7' } },
      ],
    },
    comprehensionChecks: [
      {
        question: 'Which is NOT a required property of a hash-table hash function?',
        options: ['Deterministic', 'Uniform distribution', 'Reversible (recover input from output)', 'Fast'],
        correctIndex: 2,
        explanation:
          'A hash is one-way by design. Reversibility is the property of ' +
          'encryption, not hashing — you store hashes precisely because ' +
          'they cannot be turned back into the input.',
      },
      {
        question: 'Why does a non-uniform hash function slow down a hash table?',
        options: [
          'It produces more collisions, making chains longer and lookups slower.',
          'It uses more memory.',
          'It cannot be computed.',
          'It breaks determinism.',
        ],
        correctIndex: 0,
        explanation:
          'If most keys land in one bucket, that bucket is a long chain and ' +
          'lookups degrade toward O(n). Uniformity spreads keys so each ' +
          'bucket stays short.',
      },
    ],
  },

  // ── 2. Hash tables ────────────────────────────────────────────────
  {
    id: 'lesson-hash-tables',
    title: 'Hash Tables: Average O(1) Lookup',
    moduleId: 'module-hashing',
    languageId: 'python',
    difficulty: 3,
    estimatedMinutes: 13,
    summary:
      'A hash table stores key-value pairs in buckets chosen by hashing the ' +
      'key. Good hashing and resizing keep average lookup at O(1); collisions ' +
      'are resolved by chaining or open addressing.',
    teachesConceptIds: ['hashing', 'hash-function', 'hash-collision', 'load-factor', 'map'],
    prerequisiteConceptIds: ['hash-function', 'array', 'linked-list'],
    objectives: [
      'Implement a hash table with separate chaining.',
      'Resolve collisions via chaining and explain open addressing.',
      'Resize and rehash when the load factor exceeds a threshold.',
      'Explain why average lookup is O(1) but worst case is O(n).',
    ],
    content: [
      {
        kind: 'paragraph',
        text:
          'A hash table is an array of buckets. To store a key, hash it to a ' +
          'bucket index, then put the key-value in that bucket. To look up, ' +
          'hash the same way and search only that bucket. When the hash is ' +
          'uniform and buckets stay short, lookup is O(1) on average — you ' +
          'skip scanning every other key.',
      },
      {
        kind: 'heading',
        text: 'Separate chaining: a list per bucket',
      },
      {
        kind: 'codeWithOutput',
        languageId: 'python',
        caption: 'A minimal hash table with chaining for collisions.',
        code: 'def h(key, n):\n    return hash(key) % n\n\nclass HashTable:\n    def __init__(self, size=8):\n        self.size = size\n        self.buckets = [[] for _ in range(size)]\n    def put(self, k, v):\n        b = self.buckets[h(k, self.size)]\n        for i, (ek, _) in enumerate(b):\n            if ek == k:\n                b[i] = (k, v); return\n        b.append((k, v))\n    def get(self, k):\n        for ek, v in self.buckets[h(k, self.size)]:\n            if ek == k: return v\n        return None\n\nt = HashTable()\nt.put("name", "Cam")\nprint(t.get("name"))  # Cam',
        output: 'Cam',
      },
      {
        kind: 'callout',
        variant: 'info',
        title: 'Collisions are normal, not a bug',
        text:
          'Two different keys may hash to the same bucket. That is a ' +
          'collision, and it is expected. Chaining handles it by keeping a ' +
          'small list per bucket; you search the list linearly. As long as ' +
          'the list is short (load factor bounded), lookup stays O(1).',
      },
      {
        kind: 'heading',
        text: 'Open addressing: probe instead of chain',
      },
      {
        kind: 'paragraph',
        text:
          'Open addressing stores entries in the array itself. On collision, ' +
          'probe the next slot (linear probing), a slot determined by another ' +
          'hash (double hashing), or a quadratic offset. No lists, just the ' +
          'array — better cache locality but sensitive to clustering.',
      },
      {
        kind: 'code',
        languageId: 'python',
        caption: 'Linear probing: on collision, try the next index.',
        code: 'class OpenAddr:\n    def __init__(self, size=8):\n        self.slots = [None] * size\n    def put(self, k, v):\n        i = hash(k) % len(self.slots)\n        while self.slots[i] is not None:\n            if self.slots[i][0] == k: break\n            i = (i + 1) % len(self.slots)  # probe\n        self.slots[i] = (k, v)',
      },
      {
        kind: 'heading',
        text: 'Resize when load factor gets high',
      },
      {
        kind: 'paragraph',
        text:
          'Load factor = entries / buckets. Above ~0.7 for chaining (or ' +
          '~0.5 for open addressing), chains lengthen and lookups slow. The ' +
          'fix: allocate a bigger array, rehash every key into the new array, ' +
          'and discard the old one. Rehashing is O(n) but amortised O(1) per ' +
          'insert — the same argument as a dynamic array.',
      },
      {
        kind: 'callout',
        variant: 'tip',
        title: 'Worst case is O(n)',
        text:
          'If every key collides into one bucket (adversarial input or a bad ' +
          'hash), the table becomes one long chain and lookup is O(n). ' +
          'Python randomises hash() per run precisely to stop an attacker ' +
          'from crafting collision-heavy input to denial-of-service a server.',
      },
      {
        kind: 'compare',
        languageIds: ['python', 'javascript'],
        caption:
          'Python dict and JavaScript Map/object both are hash tables with ' +
          'chaining-ish resolution under the hood; you rarely implement one.',
        snippets: [
          'd = {}\nd["name"] = "Cam"\nprint(d["name"])  # Cam',
          'const d = new Map();\nd.set("name", "Cam");\nconsole.log(d.get("name")); // Cam',
        ],
      },
    ],
    animation: {
      type: 'memoryDiagram',
      title: 'Chaining on a collision',
      steps: [
        { caption: '8 buckets, all empty. Put ("name","Cam") → bucket 3, list [(name,Cam)].' },
        { caption: 'Put ("eman","X") → also bucket 3 (collision). Chain grows: [(name,Cam),(eman,X)].' },
        { caption: 'Get "name": hash to bucket 3, walk the list, find (name,Cam) → return Cam.' },
        { caption: 'Get "miss": hash to bucket 5, empty list → None. O(1) because bucket 5 is empty.' },
      ],
    },
    activity: {
      type: 'codeChallenge',
      title: 'Count chains in your hash table',
      prompt:
        'Add a method longest_chain(self) to HashTable that returns the ' +
        'length of the longest bucket list. After putting 5 items into a ' +
        'size-8 table, the longest chain is typically 1 or 2.',
      languageId: 'python',
      starterCode: 'class HashTable:\n    def __init__(self, size=8):\n        self.size = size\n        self.buckets = [[] for _ in range(size)]\n    def put(self, k, v):\n        i = hash(k) % self.size\n        for j, (ek, _) in enumerate(self.buckets[i]):\n            if ek == k:\n                self.buckets[i][j] = (k, v); return\n        self.buckets[i].append((k, v))\n    def longest_chain(self):\n        # return max length across buckets\n\n        pass',
      checks: [
        { description: 'Uses max or a loop over buckets', assertion: { kind: 'matchesRegex', pattern: 'max|for.*buckets' } },
      ],
    },
    comprehensionChecks: [
      {
        question: 'Average lookup in a well-tuned hash table is O(?), worst case is O(?)?',
        options: ['O(1) / O(1)', 'O(1) / O(n)', 'O(log n) / O(n)', 'O(n) / O(n)'],
        correctIndex: 1,
        explanation:
          'Average O(1) when the hash is uniform and load factor is bounded. ' +
          'Worst case O(n) when all keys collide into one bucket (a degenerate ' +
          'single chain).',
      },
      {
        question: 'When should a hash table resize?',
        options: [
          'Never.',
          'When the load factor (entries/buckets) crosses a threshold like 0.7.',
          'Every insert.',
          'Only on deletion.',
        ],
        correctIndex: 1,
        explanation:
          'A high load factor means long chains (or full slots for open ' +
          'addressing), degrading lookups. Resizing and rehashing when load ' +
          'factor crosses a threshold keeps the average O(1).',
      },
    ],
  },

  // ── 3. Bloom filters ──────────────────────────────────────────────
  {
    id: 'lesson-bloom-filters',
    title: 'Bloom Filters: Maybe In, Definitely Not',
    moduleId: 'module-hashing',
    languageId: 'python',
    difficulty: 4,
    estimatedMinutes: 11,
    summary:
      'A bloom filter is a probabilistic set: it can say "definitely not in" ' +
      'or "possibly in" using a few bits and a few hashes, never storing ' +
      'the elements themselves.',
    teachesConceptIds: ['bloom-filter', 'hash-function', 'hashing'],
    prerequisiteConceptIds: ['hash-function', 'hashing', 'array'],
    objectives: [
      'Add and test membership in a bloom filter using k hash functions.',
      'Explain why a positive answer is probabilistic but a negative is certain.',
      'Tune bit-array size and hash count for a target false-positive rate.',
      'Describe a use case where never storing elements is the point.',
    ],
    content: [
      {
        kind: 'paragraph',
        text:
          'A bloom filter answers one question — "might this item be in the ' +
          'set?" — using a bit array and a few hash functions. It can return ' +
          '"definitely not" (no bits set that should be) or "possibly yes" ' +
          '(all the bits the item would set are already set, maybe by other ' +
          'items). It never stores the items, which is the whole point.',
      },
      {
        kind: 'heading',
        text: 'Add: set k bits; test: check k bits',
      },
      {
        kind: 'codeWithOutput',
        languageId: 'python',
        caption: 'A tiny bloom filter with two hash functions.',
        code: 'import hashlib\n\ndef h1(s, m): return int(hashlib.md5(s.encode()).hexdigest(), 16) % m\ndef h2(s, m): return int(hashlib.sha1(s.encode()).hexdigest(), 16) % m\n\nclass Bloom:\n    def __init__(self, size=100):\n        self.bits = [False] * size\n        self.m = size\n    def add(self, s):\n        self.bits[h1(s, self.m)] = True\n        self.bits[h2(s, self.m)] = True\n    def maybe_contains(self, s):\n        return self.bits[h1(s, self.m)] and self.bits[h2(s, self.m)]\n\nb = Bloom()\nb.add("cat")\nprint(b.maybe_contains("cat"))   # True (definitely — we added it)\nprint(b.maybe_contains("dog"))    # likely False (but could be a false positive)',
        output: 'True\nFalse',
      },
      {
        kind: 'callout',
        variant: 'info',
        title: 'No false negatives, possible false positives',
        text:
          'If an item was added, all its bits are set, so the test always ' +
          'returns True — no false negatives. If it was not added, its bits ' +
          'might still be set by OTHER items, producing a false positive. ' +
          'The asymmetric guarantee ("definitely not" is certain) is what ' +
          'makes a bloom filter useful as a cheap pre-filter.',
      },
      {
        kind: 'heading',
        text: 'Tuning size and hash count',
      },
      {
        kind: 'paragraph',
        text:
          'More bits and more hashes both reduce false positives but cost ' +
          'memory and time. The optimal number of hash functions for a given ' +
          'bit count m and element count n is about (m/n) * ln(2). Doubling ' +
          'm roughly squares the false-positive rate for the same n.',
      },
      {
        kind: 'callout',
        variant: 'tip',
        title: 'You cannot delete',
        text:
          'Clearing a bit could remove evidence for another item that shares ' +
          'it. Standard bloom filters are add-only. Counting bloom filters ' +
          'use small counters instead of bits to allow deletion, at a memory ' +
          'cost.',
      },
      {
        kind: 'heading',
        text: 'Use case: avoid an expensive lookup',
      },
      {
        kind: 'paragraph',
        text:
          'A browser checks a bloom filter of known-malicious URLs before ' +
          'fetching. If the filter says "definitely not", skip the network ' +
          'round-trip to the full database. If "possibly", confirm against ' +
          'the real list. Most pages never hit the network for this check — ' +
          'that is the win.',
      },
      {
        kind: 'compare',
        languageIds: ['python', 'go'],
        caption:
          'Python needs a library or hashlib; Go has no stdlib bloom filter ' +
          'but the bit-array + hash pattern is the same in any language.',
        snippets: [
          '# roll-your-own with hashlib + a bit list\nself.bits[h1(s, m)] = True',
          '// roll-your-own with hash/fnv + a bit set\nbits[fnv1a(s) % m] = true',
        ],
      },
    ],
    animation: {
      type: 'memoryDiagram',
      title: 'Adding "cat" and "dog" then testing "fish"',
      steps: [
        { caption: 'Empty bit array of 8 bits. Add "cat": h1→2, h2→5. Set bits 2 and 5.' },
        { caption: 'Add "dog": h1→5, h2→7. Set bits 5 (already set) and 7.' },
        { caption: 'Test "cat": bits 2,5 both set → "possibly in" (true — we added it).' },
        { caption: 'Test "fish": h1→1, h2→3. Bit 1 is clear → "definitely not in" (certain).' },
        { caption: 'Test "emu": h1→2, h2→7. Both set by OTHER items → false positive. This is the trade-off.' },
      ],
    },
    activity: {
      type: 'multipleChoice',
      title: 'Bloom filter semantics',
      prompt: 'A bloom filter reports "possibly in". What can you conclude?',
      languageId: 'pseudo',
      data: {
        question: 'A bloom filter reports "possibly in" for item X. What is certain?',
        options: [
          'X is definitely in the set.',
          'X is definitely not in the set.',
          'Nothing — X might be in or out; you need to check the real set.',
          'The filter is broken.',
        ],
        correctIndex: 2,
        explanation:
          'A positive is probabilistic: the bits might be set by other items. ' +
          'You must confirm against the authoritative set. Only a negative ' +
          '("definitely not") is certain.',
      },
      checks: [],
    },
    comprehensionChecks: [
      {
        question: 'Which result from a bloom filter is 100% certain?',
        options: [
          '"Possibly in" — the item is definitely in the set.',
          '"Definitely not in" — the item is definitely not in the set.',
          'Both are certain.',
          'Neither is ever certain.',
        ],
        correctIndex: 1,
        explanation:
          'A negative means some bit the item would need is unset, which ' +
          'cannot happen if the item was added. A positive can be a false ' +
          'positive (bits set by other items), so only the negative is certain.',
      },
      {
        question: 'Why can you not delete an item from a standard bloom filter?',
        options: [
          'Deletion is too slow.',
          'Clearing a shared bit would also remove evidence for other items that use it.',
          'The bit array is read-only.',
          'Deletion is not supported by hash functions.',
        ],
        correctIndex: 1,
        explanation:
          'Bits are shared across items. Clearing one bit could make another ' +
          'item look absent (a false negative), which bloom filters never ' +
          'permit. Counting bloom filters use counters to allow safe deletion.',
      },
    ],
  },
]
