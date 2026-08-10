/**
 * Cambric Labs — Lesson: HTML
 *
 * Teaches HTML as STRUCTURE, not appearance. Drives home the semantic markup
 * idea (the browser sees meaning, not just formatting), the box model
 * preview, and the content vs presentation separation.
 */
import type { LessonDetail } from '../types'

export const lessonHtml: LessonDetail = {
  id: 'lesson-html',
  title: 'HTML: Describing Structure, Not Appearance',
  moduleId: 'module-html',
  languageId: 'html',
  difficulty: 2,
  estimatedMinutes: 13,
  summary:
    'HTML describes the STRUCTURE and MEANING of a page, not how it looks. ' +
    'Covers elements, nesting, attributes, and why semantic tags matter.',
  teachesConceptIds: ['html', 'markup', 'element', 'attribute', 'dom'],
  prerequisiteConceptIds: [],
  objectives: [
    'Explain the difference between structure (HTML) and appearance (CSS).',
    'Read and write nested HTML elements with correct open/close tags.',
    'Use attributes to provide extra information to an element.',
    'Choose semantic tags (h1, article, nav) over generic divs.',
  ],
  content: [
    {
      kind: 'paragraph',
      text:
        'A web page is not a picture. It is a structured document, and HTML is ' +
        'the language that describes that structure. The crucial idea: HTML ' +
        'says WHAT something IS (a heading, a paragraph, a list, a link), not ' +
        'what it LOOKS LIKE. Appearance is the job of CSS. This separation is ' +
        'not just aesthetic philosophy — it is why screen readers can read ' +
        'pages to blind users, why search engines understand pages, and why ' +
        'the same page can reflow for a phone screen.',
    },
    {
      kind: 'callout',
      variant: 'info',
      title: 'HTML is markup, not a programming language',
      text:
        'HTML has no variables, no loops, no logic. It is MARKUP: you wrap ' +
        'content in TAGS that label what the content is. <p>This is a ' +
        'paragraph</p> tells the browser "this content is a paragraph." The ' +
        'browser then applies default styling and accessibility behavior based ' +
        'on that label. HTML5 introduced SEMANTIC tags (header, nav, article, ' +
        'section, footer) that carry real meaning beyond the generic <div>.',
    },
    {
      kind: 'heading',
      text: 'The anatomy of an element',
    },
    {
      kind: 'codeWithOutput',
      languageId: 'html',
      caption: 'An element is an opening tag, content, and a closing tag. Attributes live in the opening tag.',
      code:
        '<a href="https://example.com" class="link">Click here</a>\n ^  ^                ^             ^          ^\n tag attribute   value   class      content  closing tag',
      output: 'Renders as a clickable link reading "Click here" pointing to example.com.',
    },
    {
      kind: 'paragraph',
      text:
        'The tag name (a) says this is a link. The href attribute says WHERE ' +
        'the link points. The class attribute is a hook CSS and JavaScript can ' +
        'use to find this element. The content "Click here" is what the user ' +
        'sees. The closing tag </a> ends the element. Every element follows ' +
        'this pattern.',
    },
    {
      kind: 'heading',
      text: 'Nesting: elements inside elements',
    },
    {
      kind: 'codeWithOutput',
      languageId: 'html',
      caption: 'A list is ul containing li children. Nesting must be properly closed — tags cannot cross.',
      code:
        '<ul>\n  <li>First item</li>\n  <li>Second item</li>\n</ul>\n\n<!-- WRONG: tags cross. The browser tries to fix this and the result is unpredictable. -->\n<ul><li>Item</ul></li>',
      output: 'Renders a bulleted list with two items.',
    },
    {
      kind: 'callout',
      variant: 'warning',
      title: 'Crossing tags is one of the most common beginner errors',
      text:
        '<b><i>text</b></i> is illegal — the bold tag is closed before the italic ' +
        'tag, even though bold was opened first. Tags must close in REVERSE ' +
        'order of opening (last opened, first closed), like nested parentheses. ' +
        'The browser will attempt to auto-correct, but the resulting structure ' +
        'is unreliable and can break your CSS and JavaScript.',
    },
    {
      kind: 'heading',
      text: 'Semantic tags vs generic divs',
    },
    {
      kind: 'codeWithOutput',
      languageId: 'html',
      caption: 'The same layout, but the right version carries meaning that tools can use.',
      code:
        '<!-- Works, but tells nothing about purpose -->\n<div class="header">\n  <div class="nav">\n    <div class="item">Home</div>\n  </div>\n</div>\n\n<!-- Semantic: meaning is explicit -->\n<header>\n  <nav>\n    <a href="/">Home</a>\n  </nav>\n</header>',
      output: 'Both render similarly, but the semantic version is understood by screen readers and search engines.',
    },
    {
      kind: 'steps',
      caption: 'Why semantics matter — three concrete benefits',
      steps: [
        'Accessibility: screen readers announce "navigation" for <nav>, but only "region" for a div.',
        'SEO: search engines weight content inside <article> and <main> more heavily than <div>.',
        'Maintainability: another developer reading <header> immediately understands its role; <div class="header"> requires reading the CSS.',
      ],
    },
    {
      kind: 'heading',
      text: 'The document skeleton',
    },
    {
      kind: 'codeWithOutput',
      languageId: 'html',
      caption: 'Every HTML page has this minimal structure. The browser expects it.',
      code:
        '<!DOCTYPE html>\n<html>\n  <head>\n    <title>My Page</title>\n    <meta charset="utf-8">\n  </head>\n  <body>\n    <h1>Welcome</h1>\n    <p>This is a paragraph.</p>\n  </body>\n</html>',
      output: 'A complete page: the title appears in the browser tab; the body renders the heading and paragraph.',
    },
    {
      kind: 'paragraph',
      text:
        'The head holds metadata the browser needs (title, character encoding, ' +
        'links to CSS) that is NOT shown in the page body. The body holds ' +
        'everything the user SEES. DOCTYPE tells the browser to use the HTML5 ' +
        'rules. The html element wraps everything.',
    },
    {
      kind: 'compare',
      languageIds: ['html', 'css'],
      caption:
        'HTML defines structure; CSS defines appearance. Here the same HTML ' +
        'structure is styled by CSS to look different — but the HTML does not change.',
      snippets: [
        '<!-- structure: what the content IS -->\n<button class="btn">Save</button>',
        '/* appearance: what it looks like */\n.btn {\n  background: #3b82f6;\n  color: white;\n  padding: 8px 16px;\n  border-radius: 6px;\n}',
      ],
    },
  ],
  animation: {
    type: 'treeTraversal',
    title: 'The HTML tree (DOM) for the skeleton above',
    steps: [
      { caption: 'html is the root. It has two children: head and body.', highlightLines: [2] },
      { caption: 'head contains title and meta — metadata, not visible content.', highlightLines: [3] },
      { caption: 'body contains h1 and p — these are what the user sees.', highlightLines: [8] },
      { caption: 'Each element is a node in a tree the browser builds (the DOM).', highlightLines: [9] },
      { caption: 'CSS and JavaScript navigate this tree to find and change elements.', highlightLines: [10] },
    ],
  },
  activity: {
    type: 'findBug',
    title: 'Find the bug in this HTML',
    prompt:
      'This HTML has a tag-nesting error. Which line contains the mistake?',
    languageId: 'html',
    data: {
      snippetA: '<section>\n  <p>A paragraph\n  <strong>bold</strong>\n</p>\n</section>',
      options: [
        'Line 1: <section> should not wrap paragraphs',
        'Line 2: the <p> tag is never closed before <strong> is closed — tags are crossed',
        'Line 3: <strong> cannot appear inside <p>',
        'Line 4: </section> closes before </p>',
      ],
      correctIndex: 1,
      explanation:
        'The <p> opens on line 2 but is never closed before the content ends. ' +
        'Then </section> appears on line 4, but the <p> was never properly ' +
        'closed. Tags must be closed in reverse order of opening. Fix: add ' +
        '</p> after the </strong> on line 3.',
    },
  },
  comprehensionChecks: [
    {
      question: 'What does HTML describe?',
      options: [
        'How a web page looks (colors, fonts, layout)',
        'The structure and meaning of a web page\'s content',
        'The behavior and interactivity of a page',
        'The database schema behind a page',
      ],
      correctIndex: 1,
      explanation:
        'HTML describes structure and meaning (semantics). Appearance is CSS. ' +
        'Behavior is JavaScript. Keeping these separate is what makes the web ' +
        'accessible and flexible.',
    },
    {
      question: 'Why should you prefer <nav> over <div class="nav">?',
      options: [
        'It renders faster in the browser',
        'It uses fewer bytes in the file',
        'Screen readers and search engines understand its meaning automatically',
        'It allows more CSS properties',
      ],
      correctIndex: 2,
      explanation:
        'Semantic tags carry built-in meaning that assistive technology and ' +
        'search engines use. A div with a class name has no inherent meaning — ' +
        'tools must guess from the class name, which is unreliable.',
    },
    {
      question: 'Which of these is valid HTML (tags properly nested)?',
      options: [
        '<b><i>text</b></i>',
        '<div><span>text</div></span>',
        '<ul><li>item</li></ul>',
        '<p><strong>bold</p></strong>',
      ],
      correctIndex: 2,
      explanation:
        'Tags must close in reverse order of opening (like parentheses). Only ' +
        '<ul><li>item</li></ul> respects this: li is opened last and closed ' +
        'first. All others cross tags, which is invalid.',
    },
  ],
}
