/**
 * Cambric Labs — Lesson: SQL Fundamentals
 *
 * Teaches SQL as the language for asking questions of structured data.
 * Focuses on SELECT/WHERE/JOIN with genuine relational reasoning, not syntax
 * memorization.
 */
import type { LessonDetail } from '../types'

export const lessonSql: LessonDetail = {
  id: 'lesson-sql',
  title: 'SQL: Asking Questions of Structured Data',
  moduleId: 'module-sql',
  languageId: 'sql',
  difficulty: 2,
  estimatedMinutes: 14,
  summary:
    'SQL is the language for querying relational databases. Covers SELECT, ' +
    'WHERE, ORDER BY, and JOIN — asking questions of tables of data.',
  teachesConceptIds: ['sql', 'query', 'table', 'relational-model', 'foreign-key'],
  prerequisiteConceptIds: ['data-structure'],
  objectives: [
    'Read and write a SELECT query to retrieve columns from a table.',
    'Filter rows with WHERE using comparison and logical operators.',
    'Sort results with ORDER BY.',
    'Combine data from two tables with an INNER JOIN.',
  ],
  content: [
    {
      kind: 'paragraph',
      text:
        'A database is a structured collection of data, and SQL is the language ' +
        'for asking questions of it. The word SQL stands for "Structured Query ' +
        'Language." Unlike most languages you will learn, SQL is DECLARATIVE: ' +
        'you describe WHAT data you want, not HOW to get it. You never write a ' +
        'loop that scans rows — you say "give me all users older than 18" and ' +
        'the database figures out how to find them efficiently.',
    },
    {
      kind: 'callout',
      variant: 'info',
      title: 'Tables: data organized like a spreadsheet',
      text:
        'A relational database stores data in TABLES. A table has named COLUMNS ' +
        'and ROWS. Each row is one record; each column is one field of that ' +
        'record. A "users" table might have columns id, name, age — and each ' +
        'row is one user. SQL is how you ask for, add, change, or remove rows.',
    },
    {
      kind: 'heading',
      text: 'SELECT: choosing which columns to return',
    },
    {
      kind: 'codeWithOutput',
      languageId: 'sql',
      caption: 'Given a users table with columns id, name, age, country.',
      code:
        '-- Return just name and age for every row\nSELECT name, age\nFROM users;\n\n-- Return all columns with the star shorthand\nSELECT *\nFROM users;',
      output: 'name   | age\n-------|----\nAlice  | 30\nBob    | 25\nCarol  | 35\n(when using SELECT *)',
    },
    {
      kind: 'paragraph',
      text:
        'The order after SELECT lists the columns you want. SELECT * means "all ' +
        'columns." In production code, prefer listing columns explicitly — it ' +
        'protects against schema changes adding columns you did not expect, and ' +
        'it documents what you actually depend on.',
    },
    {
      kind: 'heading',
      text: 'WHERE: filtering which rows to return',
    },
    {
      kind: 'codeWithOutput',
      languageId: 'sql',
      caption: 'Only rows where the condition is true are returned.',
      code:
        '-- Users older than 28\nSELECT name, age\nFROM users\nWHERE age > 28;\n\n-- Users in Canada older than 28\nSELECT name, age\nFROM users\nWHERE age > 28 AND country = \'Canada\';',
      output: 'name  | age\n------|----\nCarol | 35\nAlice | 30',
    },
    {
      kind: 'callout',
      variant: 'tip',
      title: 'SQL reads like an English sentence',
      text:
        '"SELECT the name and age FROM the users table WHERE the age is greater ' +
        'than 28." SQL keywords (SELECT, FROM, WHERE, ORDER BY, JOIN) are ' +
        'English words chosen so queries read like questions. The database ' +
        'translates this English-like request into an efficient plan, using ' +
        'indexes to find matching rows without scanning every one.',
    },
    {
      kind: 'heading',
      text: 'ORDER BY: sorting the results',
    },
    {
      kind: 'codeWithOutput',
      languageId: 'sql',
      caption: 'Sort by a column. ASC = ascending (default), DESC = descending.',
      code:
        'SELECT name, age\nFROM users\nORDER BY age DESC;\n\n-- Sort by age descending, then name ascending for ties\nSELECT name, age\nFROM users\nORDER BY age DESC, name ASC;',
      output: 'name  | age\n------|----\nCarol | 35\nAlice | 30\nBob   | 25',
    },
    {
      kind: 'heading',
      text: 'JOIN: combining rows from two tables',
    },
    {
      kind: 'paragraph',
      text:
        'Real data lives in MANY tables. Users in one table, orders in another. ' +
        'A JOIN combines rows from two tables based on a related column — ' +
        'usually a foreign key. An INNER JOIN returns only rows where the ' +
        'relationship matches in BOTH tables.',
    },
    {
      kind: 'codeWithOutput',
      languageId: 'sql',
      caption: 'users table has id, name. orders table has id, user_id, product. Join on user_id = id.',
      code:
        '-- For each order, show the product and the buyer\'s name\nSELECT users.name, orders.product\nFROM users\nINNER JOIN orders ON users.id = orders.user_id;\n\n-- Find users who have NOT placed any order (LEFT JOIN)\nSELECT users.name\nFROM users\nLEFT JOIN orders ON users.id = orders.user_id\nWHERE orders.id IS NULL;',
      output: 'name  | product\n------|--------\nAlice | Laptop\nAlice | Mouse\nBob   | Keyboard\n(null-names filtered out by the WHERE orders.id IS NULL in the second query)',
    },
    {
      kind: 'callout',
      variant: 'warning',
      title: 'ON is the condition that connects the two tables',
      text:
        'The JOIN ... ON clause says which rows match across the two tables. ' +
        'Without ON, you get a CROSS JOIN (every row paired with every row — ' +
        'usually a bug). The condition users.id = orders.user_id means "match ' +
        'each order to the user whose id equals the order\'s user_id." That ' +
        'column (user_id) is the FOREIGN KEY — it references the primary key ' +
        'of the other table.',
    },
    {
      kind: 'steps',
      caption: 'The four core clauses in order of how you should THINK about a query',
      steps: [
        'FROM — which table(s) am I asking about?',
        'JOIN — do I need data from another table? On what relationship?',
        'WHERE — which rows do I want to keep?',
        'SELECT — which columns do I want to show?',
      ],
    },
    {
      kind: 'paragraph',
      text:
        'Note the order you THINK (FROM → JOIN → WHERE → SELECT) is the OPPOSITE ' +
        'of the order you WRITE (SELECT comes first). SQL syntax puts SELECT ' +
        'first historically, but the engine processes FROM and WHERE first. ' +
        'When debugging a query, read it FROM-clause-first — that is closer ' +
        'to how the database actually executes it.',
    },
    {
      kind: 'compare',
      languageIds: ['sql', 'python'],
      caption:
        'The same "find users over 28" question, asked two ways. SQL is the ' +
        'database-native, optimized path. Python loops work but push all the ' +
        'data over the network first.',
      snippets: [
        'SELECT name, age\nFROM users\nWHERE age > 28;',
        'result = [u for u in users if u.age > 28]\nfor u in result:\n    print(u.name, u.age)',
      ],
    },
  ],
  animation: {
    type: 'dataFlow',
    title: 'How a JOIN matches rows across two tables',
    steps: [
      { caption: 'users table: (1, Alice), (2, Bob), (3, Carol).', highlightLines: [1, 2, 3] },
      { caption: 'orders table: (101, user_id=1, Laptop), (102, user_id=1, Mouse), (103, user_id=2, Keyboard).', highlightLines: [4, 5, 6] },
      { caption: 'INNER JOIN ON users.id = orders.user_id: for order 101, match user 1 (Alice).', highlightLines: [7, 8] },
      { caption: 'Order 102 also matches Alice. Order 103 matches Bob (id 2).', highlightLines: [9, 10] },
      { caption: 'Result: (Alice, Laptop), (Alice, Mouse), (Bob, Keyboard). Carol has no orders, so she does not appear.', highlightLines: [11] },
    ],
  },
  activity: {
    type: 'fillBlank',
    title: 'Complete the query',
    prompt:
      'Write the SQL keyword that filters rows. Complete: SELECT name FROM ' +
      'users ___ age > 18;',
    languageId: 'sql',
    data: { expected: 'where' },
  },
  comprehensionChecks: [
    {
      question: 'What does SQL\'s WHERE clause do?',
      options: [
        'It chooses which columns to return',
        'It chooses which rows to return (filtering)',
        'It sorts the results',
        'It combines two tables',
      ],
      correctIndex: 1,
      explanation:
        'WHERE filters rows: only rows where the condition is true are returned. ' +
        'SELECT chooses columns. ORDER BY sorts. JOIN combines tables.',
    },
    {
      question: 'What does an INNER JOIN return?',
      options: [
        'Every row from the left table, even with no match',
        'Every row from both tables, paired in all combinations',
        'Only rows where the ON condition matches in BOTH tables',
        'Rows from the right table only',
      ],
      correctIndex: 2,
      explanation:
        'INNER JOIN keeps only rows where the relationship matches in both ' +
        'tables. A LEFT JOIN would also keep unmatched rows from the left ' +
        'table (filling the right side with NULLs).',
    },
    {
      question: 'In which order should you THINK about a SQL query\'s clauses?',
      options: [
        'SELECT, FROM, WHERE, JOIN',
        'FROM, JOIN, WHERE, SELECT',
        'WHERE, FROM, SELECT, JOIN',
        'The order does not matter',
      ],
      correctIndex: 1,
      explanation:
        'Think FROM first (which table), then JOIN (what other tables and how ' +
        'they connect), then WHERE (which rows to keep), then SELECT (which ' +
        'columns to show). This matches how the database executes the query. ' +
        'SQL syntax puts SELECT first only for historical readability.',
    },
  ],
}
