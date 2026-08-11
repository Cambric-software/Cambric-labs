/**
 * Cambric Labs — Module: NoSQL (Backend / Databases)
 *
 * Two lessons: document databases (flexible schema, denormalization), and
 * key-value + CAP (when you trade consistency for availability).
 */
import type { LessonDetail } from '../types'

export const nosqlLessons: LessonDetail[] = [
  {
    id: 'lesson-document-databases',
    title: 'Document Databases: Flexible Schema, Denormalized by Design',
    moduleId: 'module-nosql',
    languageId: 'javascript',
    difficulty: 4,
    estimatedMinutes: 12,
    summary:
      'A document database stores self-describing records (usually JSON) ' +
      'with no fixed schema. This fits data that varies per record and ' +
      'reads that want the whole object at once — but you denormalize ' +
      'intentionally, because joins are expensive or impossible.',
    teachesConceptIds: ['nosql', 'document-store', 'database', 'indexing'],
    prerequisiteConceptIds: ['database', 'object', 'array', 'sql'],
    objectives: [
      'Contrast a fixed relational schema with a flexible document schema.',
      'Decide when to embed (denormalize) vs reference (normalize).',
      'Explain why document stores optimize reads over joins.',
      'Identify the migration cost when a denormalized structure changes.',
    ],
    content: [
      {
        kind: 'paragraph',
        text:
          'A relational table has a fixed shape: every row has the same ' +
          'columns, defined up front. A document database stores records ' +
          '(usually JSON objects) with no enforced shared schema — one ' +
          'document can have fields another lacks. This fits data that is ' +
          'inherently variable (each product has different attributes) and ' +
          'access patterns that fetch a whole object at once.',
      },
      {
        kind: 'heading',
        text: 'A document is a self-contained object',
      },
      {
        kind: 'codeWithOutput',
        languageId: 'javascript',
        caption: 'MongoDB: store the order and its items together; fetch in one read.',
        code: "// insert a whole order document\ndb.orders.insertOne({\n  _id: 'ord-42',\n  user: 'ada',\n  items: [\n    { sku: 'BOOK', qty: 2, price: 12 },\n    { sku: 'PEN',  qty: 5, price: 1  },\n  ],\n  total: 29,\n  status: 'paid',\n})\n\n// one read returns the whole order, no joins\nconst order = db.orders.findOne({ _id: 'ord-42' })\nconsole.log(order.items[0].sku)",
        output: 'BOOK',
      },
      {
        kind: 'callout',
        variant: 'info',
        title: 'Reads are cheap; joins are not',
        text:
          'In SQL you normalize (split into tables) and join at read time. ' +
          'In a document store you denormalize (embed related data) so the ' +
          'common read is a single document fetch with no join. The trade: ' +
          'updates that span many documents must update each copy — ' +
          'denormalization moves work from reads to writes.',
      },
      {
        kind: 'heading',
        text: 'Embed vs reference: the core decision',
      },
      {
        kind: 'compare',
        languageIds: ['javascript', 'javascript'],
        caption:
          'Embed (one read, duplicate writes) vs reference (join-like, single source).',
        snippets: [
          "// embed: items live INSIDE the order\n{ _id: 'ord', items: [{ sku: 'BOOK' }] }\n// fetch order -> items included in one read\n// rename 'BOOK' -> update EVERY order containing it",
          "// reference: store ids, look up separately\n{ _id: 'ord', itemIds: ['BOOK'] }\n{ _id: 'BOOK', name: '...' }\n// fetch order, then fetch items (two reads)\n// rename 'BOOK' -> update ONE product document",
        ],
      },
      {
        kind: 'callout',
        variant: 'warning',
        title: 'Embedding has a size limit',
        text:
          'A document should stay small (MongoDB caps a single document at ' +
          '16MB). Embedding unbounded arrays (every order of a customer, ' +
          'every comment on a post) grows documents without bound and ' +
          'slows every fetch. Reference instead when the related set is ' +
          'large or unbounded.',
      },
      {
        kind: 'heading',
        text: 'Schemaless does not mean schema-free',
      },
      {
        kind: 'paragraph',
        text:
          'A document store will accept any shape, but your application code ' +
          'still assumes a shape. If half your user documents have ' +
          'createdAt and half do not, your code must handle both — you ' +
          'have a schema, just an undocumented, inconsistent one enforced ' +
          'ad hoc. Validate at the application boundary; do not let ' +
          '"schemaless" become "schema-chaos."',
      },
      {
        kind: 'code',
        languageId: 'javascript',
        caption: 'Index the fields you query by, or every lookup scans the collection.',
        code: "// without an index, this scans every document\ndb.orders.find({ user: 'ada' })\n\n// create an index on user -> O(log n) lookup\ndb.orders.createIndex({ user: 1 })\n// now find by user is fast; the index is a sorted pointer set\n// compound index for common multi-field queries:\ndb.orders.createIndex({ user: 1, status: 1 })",
      },
      {
        kind: 'compare',
        languageIds: ['javascript', 'sql'],
        caption:
          'Document (embed, one read) vs relational (normalize, join).',
        snippets: [
          "// document: the order and its items are ONE document\n{ _id:'ord', items:[{sku:'BOOK'}], user:'ada' }",
          "-- relational: order and items are separate tables, joined at read\nSELECT o.*, i.sku FROM orders o JOIN items i ON i.order_id=o.id\nWHERE o.user='ada'",
        ],
      },
    ],
    animation: {
      type: 'dataFlow',
      title: 'Embed vs reference: read and update paths',
      steps: [
        { caption: 'Embed: order { _id, items:[...] }. Read order -> items included, one document fetch.' },
        { caption: 'Embed update: rename sku BOOK -> PEN. Must find and rewrite every order document containing BOOK. Many writes.' },
        { caption: 'Reference: order { _id, itemIds:["BOOK"] }, products { _id:"BOOK", ... }. Read order, then fetch products by ids. Two reads.' },
        { caption: 'Reference update: rename BOOK -> PEN. Update ONE product document. One write.' },
        { caption: 'Rule: embed when the child is small, bounded, and read-with-parent; reference when large, unbounded, or shared/independently updated.' },
      ],
    },
    activity: {
      type: 'multipleChoice',
      title: 'Embed or reference?',
      prompt:
        'You store posts and their comments. A popular post can have ' +
        'thousands of comments over years. Should comments be embedded ' +
        'in the post document or referenced?',
      languageId: 'javascript',
      data: {
        question: 'Embed or reference the comments?',
        options: [
          'Embed — fewer reads.',
          'Reference — comments are unbounded; embedding grows the post document without limit, slowing every fetch and risking the size cap.',
          'Embed in a separate collection.',
          'Neither; use a flat file.',
        ],
        correctIndex: 1,
        explanation:
          'Unbounded or large child sets must be referenced, not embedded. ' +
          'A post with 50,000 comments would be one giant document, slow ' +
          'to read in full and impossible to paginate efficiently. Store ' +
          'comments as their own documents with a postId reference; ' +
          'query and paginate them independently.',
      },
      checks: [],
    },
    comprehensionChecks: [
      {
        question: 'Why do document databases favor denormalization (embedding)?',
        options: [
          'They cannot store references.',
          'Embedding puts related data in one document, so the common read is a single fetch with no join — at the cost of duplicating data that must be updated in every copy.',
          'Embedding uses less disk.',
          'Joins are illegal in NoSQL.',
        ],
        correctIndex: 1,
        explanation:
          'The document model optimizes for the common read by keeping ' +
          'related data together. The price is denormalization: a value ' +
          'appearing in many documents must be updated in all of them. ' +
          'Embed when reads dominate and the data is small/bounded; ' +
          'reference when updates or size matter.',
      },
      {
        question: '"Schemaless" lets you store any shape. What is the real risk?',
        options: [
          'Disk fills up faster.',
          'The application still assumes a shape; without validation, documents drift (some have createdAt, some do not), creating an undocumented, inconsistent schema enforced ad hoc in code.',
          'Queries become slower.',
          'Indexes break.',
        ],
        correctIndex: 1,
        explanation:
          'The store is schemaless, but your code is not. If documents ' +
          'inconsistently contain fields, every reader must defensively ' +
          'handle missing fields. Validate and normalize on write so the ' +
          'stored shape matches what your code expects.',
      },
    ],
  },
  {
    id: 'lesson-key-value-and-cap',
    title: 'Key-Value Stores & the CAP Theorem',
    moduleId: 'module-nosql',
    languageId: 'python',
    difficulty: 4,
    estimatedMinutes: 12,
    summary:
      'A key-value store is the simplest database: get/set by key, O(1), ' +
      'blazing fast. Distributed ones force the CAP choice: when a network ' +
      'split happens, you keep Consistency or Availability, not both. ' +
      'Pick the trade your app can survive.',
    teachesConceptIds: ['nosql', 'redis-cache', 'cap-theorem', 'distributed-systems', 'consistency'],
    prerequisiteConceptIds: ['hashing', 'database', 'networking', 'cache'],
    objectives: [
      'Use a key-value store for O(1) lookup by a single key.',
      'Explain the CAP theorem and why a partition forces a choice.',
      'Contrast CP (consistency) and AP (availability) systems.',
      'Choose eventual consistency when it fits and avoid it when it does not.',
    ],
    content: [
      {
        kind: 'paragraph',
        text:
          'A key-value store is a giant hash map: you set a key to a value ' +
          'and get it back by key in O(1). There is no query language, no ' +
          'joins, no secondary indexes by default — just fast lookup. ' +
          'Redis and Memcached are the canonical examples, used for ' +
          'sessions, caches, rate-limit counters, and leaderboards. The ' +
          'simplicity is the feature: nothing is faster than a hash lookup.',
      },
      {
        kind: 'heading',
        text: 'Get and set, nothing more',
      },
      {
        kind: 'codeWithOutput',
        languageId: 'python',
        caption: 'Redis as a session and counter store.',
        code: "import redis\nr = redis.Redis()\n\n# session: key -> user id, with TTL\nr.setex('session:abc', 3600, 'user:42')\nprint(r.get('session:abc'))   # b'user:42'\n\n# atomic counter (no race condition)\nr.incr('views:home')        # -> 1\nr.incr('views:home')        # -> 2\nprint(r.get('views:home'))   # b'2'",
        output: "b'user:42'\nb'2'",
      },
      {
        kind: 'callout',
        variant: 'tip',
        title: 'INCR is atomic — no read-modify-write race',
        text:
          'A naive counter (read, +1, write) races when two requests do it ' +
          'simultaneously: both read 5, both write 6, you lose a count. ' +
          'Redis INCR is a single atomic command on the server — no race ' +
          'is possible. This is why rate limiting and view counts live in ' +
          'Redis, not a row in a relational db updated by hand.',
      },
      {
        kind: 'heading',
        text: 'Distribution forces the CAP choice',
      },
      {
        kind: 'paragraph',
        text:
          'A single-node key-value store is simple. But to survive a ' +
          'machine failure you replicate across nodes — and the moment you ' +
          'do, the CAP theorem bites. CAP says a distributed system can ' +
          'guarantee at most two of: Consistency (every read sees the ' +
          'latest write), Availability (every request gets a response), ' +
          'and Partition-tolerance (the system keeps working when the ' +
          'network splits). Since networks DO split, you really choose ' +
          'between C and A when a partition occurs.',
      },
      {
        kind: 'compare',
        languageIds: ['python', 'python'],
        caption:
          'CP (reject stale reads during a split) vs AP (serve, may be stale).',
        snippets: [
          "# CP: if the replica is partitioned from the primary,\n# refuse reads rather than return stale data\nif not can_reach_primary(): return ERROR 503",
          "# AP: always answer, even if the data may be slightly stale\n# (eventual consistency: replicas converge later)\nreturn local_copy  # may be behind; available now",
        ],
      },
      {
        kind: 'callout',
        variant: 'info',
        title: 'Pick the trade your app can survive',
        text:
          'A bank balance must be consistent (CP) — returning a stale ' +
          'balance could allow a double-spend. A product view count or a ' +
          'like counter can be eventually consistent (AP) — being off by a ' +
          'few during a partition is fine, and availability matters more. ' +
          'CAP is not "which is best," it is "which failure can your ' +
          'business tolerate."',
      },
      {
        kind: 'heading',
        text: 'Eventual consistency: correct, eventually',
      },
      {
        kind: 'paragraph',
        text:
          'An AP system returns the value it has now, which may lag behind ' +
          'the latest write. The replicas converge over time (seconds, ' +
          'usually), so reads are eventually consistent. This is fine for ' +
          'counts, feeds, and caches. It is dangerous for anything where ' +
          '"I read it just now" must be exactly true — a transfer, a ' +
          'reservation, a deduct-from-balance. There, choose CP or use ' +
          'strong-consistency primitives (linearizable reads, transactions).',
      },
      {
        kind: 'callout',
        variant: 'warning',
        title: 'CAP is about partitions, not normal operation',
        text:
          'During normal operation (no partition), a well-designed AP system ' +
          'can still be strongly consistent via quorum reads/writes. CAP ' +
          'only forces the trade when the network actually splits. The ' +
          'theorem is a guarantee about the worst case, not the common case.',
      },
      {
        kind: 'compare',
        languageIds: ['python', 'sql'],
        caption:
          'Key-value (one key, O(1), no joins) vs relational (query, join).',
        snippets: [
          "r.get('user:42')          # O(1) hash lookup, no query language",
          "SELECT * FROM users WHERE id=42  # query planner, can join, flexible",
        ],
      },
    ],
    animation: {
      type: 'timeline',
      title: 'A network split and the CAP choice',
      steps: [
        { caption: 'Two nodes replicate a key. Node A is primary, B replicates. Write to A -> replicates to B.' },
        { caption: 'Network partition: A and B cannot talk. A client writes to A; another reads from B.' },
        { caption: 'CP choice: B refuses the read (it cannot confirm it is up to date). Consistency preserved, availability lost during the split.' },
        { caption: 'AP choice: B answers with its (possibly stale) copy. Availability preserved, consistency relaxed (eventual).' },
        { caption: 'Partition heals: B catches up to A. An AP system is now consistent again — eventual consistency.' },
      ],
    },
    activity: {
      type: 'multipleChoice',
      title: 'CP or AP for this?',
      prompt:
        'You are building a "like" counter on social posts, replicated ' +
        'across regions. During a network split, should you choose CP or AP?',
      languageId: 'python',
      data: {
        question: 'Consistency or Availability for a like counter?',
        options: [
          'CP — never show a wrong count.',
          'AP — a like counter being off by a few during a partition is acceptable; keeping the button working matters more, and counts converge later.',
          'Neither; store likes only on one node.',
          'CP, because likes are money.',
        ],
        correctIndex: 1,
        explanation:
          'A like counter is the textbook eventually-consistent workload. ' +
          'Refusing reads during a partition (CP) would make the post ' +
          'appear broken to protect a number that does not need to be ' +
          'exact. Choose AP, accept brief staleness, let replicas converge.',
      },
      checks: [],
    },
    comprehensionChecks: [
      {
        question: 'What does the CAP theorem actually force you to choose, and when?',
        options: [
          'You choose two of C/A/P at all times.',
          'When a network partition occurs, you must choose between Consistency (refuse stale reads) and Availability (answer, possibly stale); you cannot have both during a split.',
          'You can have all three if you try hard enough.',
          'CAP only applies to single-node databases.',
        ],
        correctIndex: 1,
        explanation:
          'CAP is a worst-case theorem about partitions. Because real ' +
          'networks split, partition-tolerance is mandatory, so the real ' +
          'choice during a split is consistency vs availability. Normal ' +
          'operation can be strongly consistent via quorum; the theorem ' +
          'constrains only the partitioned case.',
      },
      {
        question: 'Why is Redis INCR safe for a view counter when a naive read-then-write in a db is not?',
        options: [
          'Redis is faster.',
          'INCR is a single atomic command executed on the server, so concurrent increments cannot interleave; a naive read+1+write races when two requests both read the same old value.',
          'Redis has no network.',
          'Redis disables concurrency.',
        ],
        correctIndex: 1,
        explanation:
          'A read-modify-write is not atomic: two requests can both read ' +
          '5 and both write 6, losing one increment. Redis INCR is one ' +
          'server-side atomic operation — the server serializes it, so no ' +
          'interleaving is possible. Atomicity, not speed, is the reason ' +
          'counters live in Redis.',
      },
    ],
  },
]
