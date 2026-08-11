/**
 * Cambric Labs — Module: Relational Design (Backend)
 *
 * Two lessons: normalization (1NF-3NF) and indexes + transactions.
 */
import type { LessonDetail } from '../types'

export const relationalDesignLessons: LessonDetail[] = [
  {
    id: 'lesson-normalization',
    title: 'Normalization: Eliminate Redundancy',
    moduleId: 'module-relational-design',
    languageId: 'sql',
    difficulty: 3,
    estimatedMinutes: 13,
    summary:
      'Normal forms remove data redundancy and update anomalies. The core ' +
      'rule: every non-key column depends on the key, the whole key, and ' +
      'nothing but the key.',
    teachesConceptIds: ['normalization', 'primary-key', 'foreign-key', 'database', 'relational-database'],
    prerequisiteConceptIds: ['sql', 'primary-key', 'foreign-key'],
    objectives: [
      'Identify first, second, and third normal form violations.',
      'Explain why redundancy causes update anomalies.',
      'Split a denormalized table into normalized relations.',
      'State the "key, whole key, nothing but the key" rule.',
    ],
    content: [
      {
        kind: 'paragraph',
        text:
          'A denormalized table feels convenient — all data in one place — ' +
          'but it duplicates data, and duplicated data goes wrong. If a ' +
          'customer\'s address appears in every order row, changing the ' +
          'address means updating many rows, and missing one leaves ' +
          'inconsistent data. Normalization splits tables so each fact lives ' +
          'in exactly one place.',
      },
      {
        kind: 'heading',
        text: 'The denormalized starting point',
      },
      {
        kind: 'codeWithOutput',
        languageId: 'sql',
        caption: 'A single table repeating customer and product data per order line.',
        code: 'CREATE TABLE orders (\n  order_id INT,\n  customer_id INT,\n  customer_name TEXT,    -- repeated per order!\n  customer_address TEXT, -- repeated per order!\n  product_id INT,\n  product_name TEXT,     -- repeated per order line!\n  price DECIMAL,\n  quantity INT\n);\n-- customer "Cam" address appears in 100 order rows → 100 copies to update',
        output: '# if Cam moves, you must update 100 rows; miss one and the data is inconsistent',
      },
      {
        kind: 'heading',
        text: '1NF: atomic values, no repeating groups',
      },
      {
        kind: 'paragraph',
        text:
          'First normal form requires each cell to hold a single value (no ' +
          'arrays, no comma-separated lists) and no repeating columns. A ' +
          'products column holding "pen,paper,ink" violates 1NF — you cannot ' +
          'query or update one product without string parsing.',
      },
      {
        kind: 'callout',
        variant: 'info',
        title: '1NF fix: one row per fact',
        text:
          'A single order row holding three products as "pen,paper,ink" ' +
          'violates 1NF. The fix is one row per (order, product) pair — ' +
          'three rows instead of one with a list. Each cell is atomic.',
      },
      {
        kind: 'heading',
        text: '2NF: depend on the WHOLE key',
      },
      {
        kind: 'paragraph',
        text:
          'Second normal form applies to tables with a composite key (a key ' +
          'of multiple columns). It requires every non-key column to depend ' +
          'on the ENTIRE key, not just part of it. If (order_id, product_id) ' +
          'is the key but product_name depends only on product_id, that is ' +
          'a 2NF violation — product_name should move to a products table.',
      },
      {
        kind: 'codeWithOutput',
        languageId: 'sql',
        caption: 'Split product data out to satisfy 2NF.',
        code: '-- before (2NF violation): product_name depends on product_id, not the full key\n-- orders(order_id, product_id, product_name, price, quantity)\n\n-- after: product_name/price live in products; orders references product_id\nCREATE TABLE products (\n  product_id INT PRIMARY KEY,\n  product_name TEXT,\n  price DECIMAL\n);\nCREATE TABLE order_items (\n  order_id INT,\n  product_id INT REFERENCES products(product_id),\n  quantity INT,\n  PRIMARY KEY (order_id, product_id)  -- composite key\n);',
        output: '# product_name now lives once, in products; referenced by order_items',
      },
      {
        kind: 'heading',
        text: '3NF: nothing but the key',
      },
      {
        kind: 'paragraph',
        text:
          'Third normal form requires non-key columns to depend on NOTHING ' +
          'but the key — no transitive dependencies. If orders has ' +
          'customer_id, customer_name, and customer_address, then ' +
          'customer_name/address depend on customer_id, not on order_id. ' +
          'That is a transitive dependency (order_id → customer_id → ' +
          'address); it violates 3NF. Move customer data to a customers table.',
      },
      {
        kind: 'codeWithOutput',
        languageId: 'sql',
        caption: 'The fully normalized schema: one fact in one place.',
        code: 'CREATE TABLE customers (\n  customer_id INT PRIMARY KEY,\n  customer_name TEXT,\n  customer_address TEXT  -- lives once, here\n);\nCREATE TABLE orders (\n  order_id INT PRIMARY KEY,\n  customer_id INT REFERENCES customers(customer_id)\n);\nCREATE TABLE order_items (\n  order_id INT REFERENCES orders(order_id),\n  product_id INT REFERENCES products(product_id),\n  quantity INT,\n  PRIMARY KEY (order_id, product_id)\n);',
        output: '# Cam moves → update one row in customers. Every order sees the new address via the join.',
      },
      {
        kind: 'callout',
        variant: 'tip',
        title: 'The rhyme that sums it all up',
        text:
          '"Every non-key attribute must provide a fact about the key, the ' +
          'whole key, and nothing but the key, so help me Codd." 1NF = ' +
          'atomic. 2NF = whole key. 3NF = nothing but the key.',
      },
      {
        kind: 'heading',
        text: 'The cost: joins',
      },
      {
        kind: 'paragraph',
        text:
          'Normalization removes redundancy but requires joins to ' +
          'reassemble the data. Reading an order line with customer and ' +
          'product details now joins three tables. For read-heavy workloads, ' +
          'a denormalized read model (or a cache) is sometimes deliberately ' +
          'chosen for speed — normalisation is the correctness baseline, not ' +
          'a law you can never relax.',
      },
      {
        kind: 'compare',
        languageIds: ['sql', 'python'],
        caption:
          'The SQL models it; the Python ORM (e.g. SQLAlchemy) mirrors it ' +
          'as relationships between model classes.',
        snippets: [
          'CREATE TABLE orders (\n  order_id INT PRIMARY KEY,\n  customer_id INT REFERENCES customers(customer_id)\n);',
          'class Order(Base):\n    __tablename__ = "orders"\n    id = Column(Integer, primary_key=True)\n    customer_id = Column(ForeignKey("customers.customer_id"))',
        ],
      },
    ],
    animation: {
      type: 'dataFlow',
      title: 'Denormalized → normalized',
      steps: [
        { caption: 'One orders table repeats customer_name/address and product_name per row.' },
        { caption: '1NF: split any multi-value cells into one row per fact.' },
        { caption: '2NF: pull product_name/price into a products table (depends on product_id, not the whole key).' },
        { caption: '3NF: pull customer_name/address into a customers table (depends on customer_id, not order_id).' },
        { caption: 'Result: three tables, each fact in one place. Joins reassemble; updates touch one row.' },
      ],
    },
    activity: {
      type: 'multipleChoice',
      title: 'Which normal form is violated?',
      prompt:
        'A table orders(order_id, customer_id, customer_name) has ' +
        'customer_name depending on customer_id, not on order_id. Which ' +
        'normal form does this violate?',
      languageId: 'sql',
      data: {
        question: 'customer_name depends on customer_id, not order_id. Which NF is violated?',
        options: ['1NF (not atomic)', '2NF (partial key dependency)', '3NF (transitive dependency — non-key depends on another non-key)', 'No violation'],
        correctIndex: 2,
        explanation:
          'This is a transitive dependency: order_id → customer_id → ' +
          'customer_name. customer_name depends on customer_id (a non-key), ' +
          'not directly on the key (order_id). That violates 3NF; the fix ' +
          'is a separate customers table.',
      },
      checks: [],
    },
    comprehensionChecks: [
      {
        question: 'What update anomaly does redundancy cause in a denormalized orders table?',
        options: [
          'Orders cannot be inserted.',
          'A customer address repeated in many order rows must be updated in every row; missing one leaves inconsistent data.',
          'The table is too small.',
          'Indexes break.',
        ],
        correctIndex: 1,
        explanation:
          'When a fact (customer address) is duplicated across rows, ' +
          'updating it requires touching every copy. Missing any leaves ' +
          'inconsistent data — the classic update anomaly normalization fixes.',
      },
      {
        question: 'The rhyme "the key, the whole key, and nothing but the key" maps to which normal forms?',
        options: [
          '1NF, 2NF, 3NF respectively',
          '3NF, 2NF, 1NF respectively',
          'All 3NF',
          'All 2NF',
        ],
        correctIndex: 0,
        explanation:
          '"The key" = 2NF (depend on the whole key, no partial). "The ' +
          'whole key" reinforces 2NF. "Nothing but the key" = 3NF (no ' +
          'transitive dependency on a non-key). 1NF (atomic) is the ' +
          'prerequisite before the rhyme applies.',
      },
    ],
  },

  {
    id: 'lesson-indexes-transactions',
    title: 'Indexes & Transactions: Speed and Safety',
    moduleId: 'module-relational-design',
    languageId: 'sql',
    difficulty: 4,
    estimatedMinutes: 14,
    summary:
      'Indexes make reads O(log n) but slow writes; transactions group ' +
      'operations so they all succeed or none do, via ACID guarantees.',
    teachesConceptIds: ['indexing', 'query-plan', 'acid', 'transaction', 'isolation-levels'],
    prerequisiteConceptIds: ['sql', 'normalization', 'primary-key', 'b-tree'],
    objectives: [
      'Explain why an index speeds reads but slows writes.',
      'Choose columns to index based on query patterns.',
      'Group operations in a transaction so they commit atomically.',
      'Distinguish isolation levels and the anomalies they prevent.',
    ],
    content: [
      {
        kind: 'paragraph',
        text:
          'Two concerns dominate database design: speed and safety. Indexes ' +
          'make reads fast by avoiding full-table scans, at the cost of ' +
          'slower writes (the index must be maintained). Transactions make ' +
          'multi-statement operations safe by guaranteeing they all commit ' +
          'or none do — the ACID properties.',
      },
      {
        kind: 'heading',
        text: 'Indexes: a sorted copy of a column',
      },
      {
        kind: 'codeWithOutput',
        languageId: 'sql',
        caption: 'Create an index; the database maintains a B-tree on that column.',
        code: 'CREATE INDEX idx_users_email ON users(email);\n-- now: SELECT * FROM users WHERE email = ?\n-- uses the B-tree → O(log n) instead of scanning every row\n\n-- without the index, every query checks every row (full scan): O(n)',
        output: '# the index is a separate sorted structure pointing into the table',
      },
      {
        kind: 'callout',
        variant: 'info',
        title: 'Indexes trade write speed for read speed',
        text:
          'An index is a second sorted copy of the data. On INSERT/UPDATE/DELETE ' +
          'the database must update BOTH the table and the index. So indexes ' +
          'speed WHERE/join/sort reads but slow every write. Index columns ' +
          'you query by; do not index everything.',
      },
      {
        kind: 'heading',
        text: 'Index what you query by',
      },
      {
        kind: 'paragraph',
        text:
          'Index the columns that appear in WHERE, JOIN, and ORDER BY. If you ' +
          'frequently look up users by email, index email. If you never ' +
          'query by age, do not index age — it just slows writes for no read ' +
          'benefit. Use EXPLAIN to see whether a query uses an index or scans.',
      },
      {
        kind: 'codeWithOutput',
        languageId: 'sql',
        caption: 'EXPLAIN shows the query plan (index vs scan).',
        code: 'EXPLAIN SELECT * FROM users WHERE email = "cam@example.com";\n-- with idx_users_email:    Index Scan using idx_users_email  (fast)\n-- without the index:       Seq Scan on users              (slow, full table)',
        output: '# the planner chooses the index if it lowers cost',
      },
      {
        kind: 'heading',
        text: 'Transactions: all or nothing',
      },
      {
        kind: 'paragraph',
        text:
          'A transfer from account A to B is two operations: debit A, credit ' +
          'B. If the database crashes between them, money vanishes. A ' +
          'transaction groups them: either both commit or neither does. ' +
          'This atomicity is one of the four ACID guarantees.',
      },
      {
        kind: 'codeWithOutput',
        languageId: 'sql',
        caption: 'A transaction wraps the two updates.',
        code: 'BEGIN;\nUPDATE accounts SET balance = balance - 100 WHERE id = 1;  -- debit A\nUPDATE accounts SET balance = balance + 100 WHERE id = 2;  -- credit B\nCOMMIT;\n-- if either fails, ROLLBACK undoes both; money is never half-moved',
        output: '# BEGIN starts; COMMIT makes permanent; ROLLBACK undoes',
      },
      {
        kind: 'callout',
        variant: 'tip',
        title: 'ACID: the four guarantees',
        text:
          'Atomicity (all or nothing), Consistency (constraints hold after), ' +
          'Isolation (concurrent transactions do not interfere), Durability ' +
          '(committed data survives a crash). Together they let you reason ' +
          'about a transaction as if it ran alone and instantaneously.',
      },
      {
        kind: 'heading',
        text: 'Isolation levels: what concurrent txns see',
      },
      {
        kind: 'paragraph',
        text:
          'Read Uncommitted sees uncommitted changes (dirty reads). Read ' +
          'Committed sees only committed data. Repeatable Read guarantees the ' +
          'same query returns the same rows within a transaction. Serializable ' +
          'makes concurrent transactions behave as if they ran one at a time. ' +
          'Higher isolation is safer but slower.',
      },
      {
        kind: 'callout',
        variant: 'warning',
        title: 'Lower isolation → anomalies',
        text:
          'Read Uncommitted can show data that is later rolled back (dirty ' +
          'read). Repeatable Read can still allow phantom rows (a new row ' +
          'appears between two reads). Serializable prevents all anomalies ' +
          'but can reduce throughput. Choose the weakest level your logic ' +
          'tolerates.',
      },
      {
        kind: 'compare',
        languageIds: ['sql', 'python'],
        caption:
          'Raw SQL transaction vs the same via SQLAlchemy (which exposes ' +
          'begin/commit/rollback).',
        snippets: [
          'BEGIN;\nUPDATE accounts SET balance = balance - 100 WHERE id = 1;\nCOMMIT;',
          'with engine.begin() as conn:  # auto-begin\n    conn.execute(text("UPDATE accounts SET balance = balance - 100 WHERE id = 1"))\n# commit on exit; rollback on exception',
        ],
      },
    ],
    animation: {
      type: 'timeline',
      title: 'A transaction: both updates commit or neither',
      steps: [
        { caption: 'BEGIN. Transaction T1 starts.' },
        { caption: 'Debit A: balance -= 100. (Not yet permanent.)' },
        { caption: 'Credit B: balance += 100. (Not yet permanent.)' },
        { caption: 'COMMIT. Both changes become permanent atomically.' },
        { caption: 'If a crash happens at step 3: on recovery the DB rolls back T1 entirely — no half-transfer.' },
      ],
    },
    activity: {
      type: 'multipleChoice',
      title: 'To index or not?',
      prompt:
        'You have a users table you query by email frequently and update ' +
        'rarely. Should you index email?',
      languageId: 'sql',
      data: {
        question: 'Index the email column?',
        options: [
          'No — indexes only slow writes.',
          'Yes — you query by email (WHERE email = ?), so an index turns each lookup from O(n) scan to O(log n); the rare-write cost is worth it.',
          'No — email is text.',
          'Only if the table is small.',
        ],
        correctIndex: 1,
        explanation:
          'Index columns you query by. A frequent email lookup with rare ' +
          'writes is the ideal index case: O(n) scans become O(log n), and ' +
          'the write cost is paid rarely.',
      },
      checks: [],
    },
    comprehensionChecks: [
      {
        question: 'Why does adding an index slow down writes?',
        options: [
          'Indexes use more memory.',
          'Each INSERT/UPDATE/DELETE must update both the table and the index structure, doubling the write work.',
          'Indexes are buggy.',
          'The database recompiles.',
        ],
        correctIndex: 1,
        explanation:
          'An index is a second sorted copy of the column. Every write must ' +
          'update the table AND maintain the index (rebalance the B-tree). ' +
          'Reads get faster; writes get slower. Index columns you query by, ' +
          'not every column.',
      },
      {
        question: 'What does Atomicity (the A in ACID) guarantee about a transaction?',
        options: [
          'It runs instantly.',
          'All statements commit, or none do — there is no partial commit.',
          'It is encrypted.',
          'It runs alone.',
        ],
        correctIndex: 1,
        explanation:
          'Atomicity means the transaction is indivisible: either every ' +
          'statement commits permanently, or on any failure the whole ' +
          'transaction is rolled back. No partial state is ever visible.',
      },
    ],
  },
]
