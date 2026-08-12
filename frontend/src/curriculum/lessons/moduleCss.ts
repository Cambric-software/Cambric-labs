/**
 * Cambric Labs — Module: CSS (Web)
 *
 * Three lessons: the box model, flexbox/grid layout, and responsive design.
 */
import type { LessonDetail } from '../types'

export const cssLessons: LessonDetail[] = [
  {
    id: 'lesson-box-model',
    title: 'The CSS Box Model: Content, Padding, Border, Margin',
    moduleId: 'module-css',
    languageId: 'css',
    difficulty: 2,
    estimatedMinutes: 11,
    summary:
      'Every element is a box of nested rectangles: content, padding, ' +
      'border, margin. box-sizing decides whether width includes padding and ' +
      'border.',
    teachesConceptIds: ['css', 'box-model', 'selectors'],
    prerequisiteConceptIds: ['html', 'css'],
    objectives: [
      'Describe the four nested rectangles of the box model.',
      'Distinguish content-box from border-box sizing.',
      'Center a block element using margin: auto.',
      'Explain why margin collapse merges adjacent vertical margins.',
    ],
    content: [
      {
        kind: 'paragraph',
        text:
          'Every HTML element renders as a rectangle — actually four nested ' +
          'rectangles. From inside out: the content (text or image), padding ' +
          '(space inside the border), border (a visible edge), and margin ' +
          '(space outside, pushing other elements away). Understanding these ' +
          'four layers solves most "why is my layout off" puzzles.',
      },
      {
        kind: 'heading',
        text: 'The four layers, inside out',
      },
      {
        kind: 'code',
        languageId: 'css',
        caption: 'Padding grows inward; margin pushes outward.',
        code: '.box {\n  width: 200px;          /* content width */\n  padding: 20px;         /* space inside the border */\n  border: 2px solid black; /* a visible edge */\n  margin: 16px;          /* space outside, pushes neighbours */\n}',
      },
      {
        kind: 'callout',
        variant: 'info',
        title: 'Padding is inside, margin is outside',
        text:
          'Padding pushes the content away from the border — it grows the ' +
          'element. Margin pushes the element away from neighbours — it does ' +
          'NOT grow the element. Background colour fills content + padding, ' +
          'not margin.',
      },
      {
        kind: 'heading',
        text: 'box-sizing: does width include padding?',
      },
      {
        kind: 'paragraph',
        text:
          'By default (content-box), width means the content only. So a ' +
          '200px box with 20px padding is actually 240px wide on screen. ' +
          'This is the source of countless layout bugs. Setting ' +
          'box-sizing: border-box makes width include padding and border, so ' +
          'the on-screen size matches what you wrote.',
      },
      {
        kind: 'codeWithOutput',
        languageId: 'css',
        caption: 'The universal border-box reset.',
        code: '*, *::before, *::after {\n  box-sizing: border-box;  /* width now includes padding+border */\n}\n/* now: width: 200px; padding: 20px; border: 2px\n   renders as exactly 200px on screen */',
        output: '# content-box total = 200 + 2*20 + 2*2 = 244px\n# border-box total = 200px (padding+border fit inside)',
      },
      {
        kind: 'callout',
        variant: 'tip',
        title: 'Almost everyone resets to border-box',
        text:
          'Most CSS reset/normalise files set box-sizing: border-box globally ' +
          'because it matches how designers think ("I said 200px, I want ' +
          '200px"). You rarely want content-box except for pixel-precise ' +
          'content sizing.',
      },
      {
        kind: 'heading',
        text: 'Centering a block with margin: auto',
      },
      {
        kind: 'code',
        languageId: 'css',
        caption: 'Auto horizontal margins center a block with a fixed width.',
        code: '.card {\n  width: 400px;\n  margin: 0 auto;   /* top/bottom 0, left/right auto → centered */\n}\n/* auto only works for blocks with a width; inline elements ignore it */',
      },
      {
        kind: 'callout',
        variant: 'warning',
        title: 'margin: auto needs a width',
        text:
          'A block element is full-width by default, so auto margins have no ' +
          'space to share. Set a width (or max-width) first, then auto fills ' +
          'the remaining space equally on both sides — centering it.',
      },
      {
        kind: 'heading',
        text: 'Margin collapse: vertical margins merge',
      },
      {
        kind: 'paragraph',
        text:
          'When two block elements stack vertically, their adjacent margins ' +
          'do NOT add — the larger one wins. A 20px bottom margin and a 30px ' +
          'top margin produce 30px of gap, not 50. This is margin collapse, ' +
          'and it only affects vertical margins of blocks, not horizontal or ' +
          'flex/grid children.',
      },
      {
        kind: 'compare',
        languageIds: ['css', 'html'],
        caption:
          'The box model is CSS; the HTML element is what you apply it to.',
        snippets: [
          '.card { padding: 16px; border: 1px solid #ccc; margin: 8px; }',
          '<div class="card">Content here</div>',
        ],
      },
    ],
    animation: {
      type: 'memoryDiagram',
      title: 'The four nested rectangles',
      steps: [
        { caption: 'Innermost: content (text/image). Width = content width.' },
        { caption: 'Padding: a band inside the border, same background as content.' },
        { caption: 'Border: a visible edge around padding.' },
        { caption: 'Margin: transparent space outside, pushing neighbours.' },
        { caption: 'border-box: width covers content+padding+border. content-box: width is content only.' },
      ],
    },
    activity: {
      type: 'multipleChoice',
      title: 'Why does the element look wider than the width you set?',
      prompt:
        'You set width: 200px; padding: 20px; border: 2px and the element ' +
        'measures 244px on screen. Why?',
      languageId: 'css',
      data: {
        question: 'Why is the on-screen width 244px, not 200px?',
        options: [
          'CSS is broken.',
          'Default box-sizing is content-box, so width is content only; padding and border add on top (200 + 2*20 + 2*2 = 244).',
          'The browser is old.',
          'Margin is included in width.',
        ],
        correctIndex: 1,
        explanation:
          'content-box (the default) treats width as content only. Padding ' +
          'and border are added on top. Set box-sizing: border-box to make ' +
          'width include them, so the element measures exactly 200px.',
      },
      checks: [],
    },
    comprehensionChecks: [
      {
        question: 'What does box-sizing: border-box change?',
        options: [
          'It makes the border thicker.',
          'It makes width and height include padding and border, so the on-screen size matches the declared size.',
          'It removes margins.',
          'It makes the element inline.',
        ],
        correctIndex: 1,
        explanation:
          'border-box includes padding and border inside the declared width. ' +
          'width: 200px with 20px padding renders at 200px, not 240px. It is ' +
          'the default in most resets.',
      },
      {
        question: 'Two stacked blocks have margin-bottom: 20px and margin-top: 30px. What is the gap between them?',
        options: ['50px (they add)', '30px (the larger wins — margin collapse)', '20px (the smaller wins)', '0px'],
        correctIndex: 1,
        explanation:
          'Vertical margins of adjacent blocks collapse: they do not add, ' +
          'the larger one wins. The gap is 30px. Horizontal margins and ' +
          'flex/grid children do not collapse.',
      },
    ],
  },

  {
    id: 'lesson-flexbox',
    title: 'Flexbox: One-Dimensional Layout',
    moduleId: 'module-css',
    languageId: 'css',
    difficulty: 3,
    estimatedMinutes: 12,
    summary:
      'Flexbox arranges items in a row or column, with powerful alignment, ' +
      'distribution, and reordering. It is the default for one-dimensional ' +
      'layouts.',
    teachesConceptIds: ['css', 'flexbox', 'css-layout', 'responsive-design'],
    prerequisiteConceptIds: ['css', 'box-model'],
    objectives: [
      'Lay out a row or column of items with display: flex.',
      'Align items with justify-content and align-items.',
      'Distribute space with flex-grow, flex-shrink, flex-basis.',
      'Choose between flexbox (1D) and grid (2D).',
    ],
    content: [
      {
        kind: 'paragraph',
        text:
          'Flexbox is the modern answer to "put these in a row, space them ' +
          'evenly, center them vertically." A flex container lays its ' +
          'children along a single axis (row or column) and gives you ' +
          'fine-grained control over alignment, order, and how spare space ' +
          'is distributed.',
      },
      {
        kind: 'heading',
        text: 'Turn a container into a flex container',
      },
      {
        kind: 'codeWithOutput',
        languageId: 'css',
        caption: 'display: flex makes children flex items, laid in a row by default.',
        code: '.toolbar {\n  display: flex;          /* children become flex items */\n  flex-direction: row;    /* default; row | row-reverse | column | column-reverse */\n  gap: 12px;              /* space BETWEEN items, no margin hacks */\n}',
        output: '# children sit side by side with 12px gaps',
      },
      {
        kind: 'callout',
        variant: 'info',
        title: 'Main axis vs cross axis',
        text:
          'Flex has two axes. The main axis follows flex-direction (row = ' +
          'horizontal). The cross axis is perpendicular (vertical for a row). ' +
          'justify-content aligns on the main axis; align-items aligns on the ' +
          'cross axis. Mixing them up is the most common flexbox mistake.',
      },
      {
        kind: 'heading',
        text: 'Distribution: justify-content',
      },
      {
        kind: 'code',
        languageId: 'css',
        caption: 'How spare space is shared along the main axis.',
        code: '.row { display: flex; }\n.row.start    { justify-content: flex-start; }  /* pack left */\n.row.center   { justify-content: center; }        /* pack middle */\n.row.between  { justify-content: space-between; }  /* first/last at edges, rest spread */\n.row.around   { justify-content: space-around; }   /* equal space around each */\n.row.evenly   { justify-content: space-evenly; }   /* equal space incl. edges */',
      },
      {
        kind: 'heading',
        text: 'Cross-axis alignment: align-items',
      },
      {
        kind: 'code',
        languageId: 'css',
        caption: 'How items align perpendicular to the main axis.',
        code: '.row { display: flex; align-items: center; }  /* vertically center */\n/* stretch (default): items fill the cross size\n   flex-start: align to top\n   flex-end: align to bottom\n   center: center on cross axis */',
      },
      {
        kind: 'callout',
        variant: 'tip',
        title: 'Centering finally became easy',
        text:
          'Before flexbox, centering a div vertically was a notorious hack ' +
          'fest. With flex it is two lines: display: flex; align-items: ' +
          'center; justify-content: center. This is why flexbox became the ' +
          'default for components and toolbars.',
      },
      {
        kind: 'heading',
        text: 'flex-grow: share spare space',
      },
      {
        kind: 'codeWithOutput',
        languageId: 'css',
        caption: 'A sidebar that stays fixed and a main that grows.',
        code: '.layout { display: flex; }\n.sidebar { flex: 0 0 200px; }  /* no grow, no shrink, basis 200px */\n.main    { flex: 1 0 auto; }    /* grow:1 → takes all spare space */\n/* basis is the starting size; grow/shrink say how it reacts to spare/overflow */',
        output: '# sidebar stays 200px; main fills the rest of the row',
      },
      {
        kind: 'callout',
        variant: 'info',
        title: 'The flex shorthand',
        text:
          'flex: grow shrink basis. flex: 1 means 1 1 0 (grow, shrink, no ' +
          'starting size — share everything equally). flex: 0 0 200px means ' +
          'a fixed 200px item that neither grows nor shrinks. The shorthand ' +
          'is clearer than setting the three longhands separately.',
      },
      {
        kind: 'heading',
        text: 'Flex (1D) vs Grid (2D)',
      },
      {
        kind: 'paragraph',
        text:
          'Flexbox is one-dimensional: a row OR a column. Grid is two- ' +
          'dimensional: rows AND columns at the same time. Use flex for ' +
          'navbars, card rows, toolbars. Use grid for full page layouts, ' +
          'photo galleries, dashboards. Many layouts combine both: grid for ' +
          'the page, flex inside each cell.',
      },
      {
        kind: 'compare',
        languageIds: ['css', 'html'],
        caption:
          'A flex toolbar and the HTML it styles.',
        snippets: [
          '.toolbar { display: flex; gap: 8px; align-items: center; }',
          '<nav class="toolbar"><a>Home</a><a>About</a></nav>',
        ],
      },
    ],
    animation: {
      type: 'dataFlow',
      title: 'justify-content distributes spare space',
      steps: [
        { caption: 'Three small items in a wide flex row. Spare space exists.' },
        { caption: 'flex-start: pack items at the start, spare space at the end.' },
        { caption: 'center: pack items in the middle, spare space split both ends.' },
        { caption: 'space-between: first and last at edges, spare space split between items.' },
        { caption: 'space-evenly: equal spare space around every item, including the edges.' },
      ],
    },
    activity: {
      type: 'multipleChoice',
      title: 'Which property aligns on the cross axis?',
      prompt:
        'You have display: flex; flex-direction: row. Which property ' +
        'controls VERTICAL alignment of the items?',
      languageId: 'css',
      data: {
        question: 'Which property aligns flex items vertically (cross axis) in a row?',
        options: ['justify-content', 'align-items', 'flex-grow', 'gap'],
        correctIndex: 1,
        explanation:
          'align-items aligns on the cross axis (vertical for a row). ' +
          'justify-content aligns on the main axis (horizontal for a row). ' +
          'Mixing these up is the classic flexbox mistake.',
      },
      checks: [],
    },
    comprehensionChecks: [
      {
        question: 'What is the difference between flexbox and grid?',
        options: [
          'Flexbox is faster.',
          'Flexbox is one-dimensional (row OR column); grid is two-dimensional (rows AND columns simultaneously).',
          'Grid is newer and replaces flexbox.',
          'They are the same.',
        ],
        correctIndex: 1,
        explanation:
          'Flex lays out along one axis. Grid lays out in two axes at once. ' +
          'Use flex for toolbars and card rows; grid for page layouts and ' +
          'galleries. They compose: grid for the page, flex inside cells.',
      },
      {
        question: 'What does flex: 1 mean?',
        options: [
          'A fixed 1px width.',
          'grow: 1, shrink: 1, basis: 0 — the item shares all spare space equally with other flex:1 items.',
          'No growing or shrinking.',
          'Display as a block.',
        ],
        correctIndex: 1,
        explanation:
          'flex: 1 expands to flex-grow:1, flex-shrink:1, flex-basis:0. The ' +
          'item starts at zero width and grows to take its equal share of ' +
          'spare space — perfect for equal-width columns.',
      },
    ],
  },

  {
    id: 'lesson-responsive-design',
    title: 'Responsive Design: One Site, Every Screen',
    moduleId: 'module-css',
    languageId: 'css',
    difficulty: 3,
    estimatedMinutes: 11,
    summary:
      'Responsive design adapts a layout to any screen using relative units, ' +
      'media queries, and a mobile-first mindset.',
    teachesConceptIds: ['responsive-design', 'css', 'css-layout'],
    prerequisiteConceptIds: ['css', 'flexbox', 'box-model'],
    objectives: [
      'Use relative units (rem, %, vw) instead of fixed px.',
      'Add a media query to change layout at a breakpoint.',
      'Apply the mobile-first principle.',
      'Set a responsive viewport meta tag.',
    ],
    content: [
      {
        kind: 'paragraph',
        text:
          'A site that looks right on a phone, a tablet, and a desktop is ' +
          'responsive. The three tools are relative units (sizes that scale ' +
          'with the screen), media queries (rules that apply above/below a ' +
          'width), and a mobile-first mindset (write the small layout first, ' +
          'then enhance for larger screens).',
      },
      {
        kind: 'heading',
        text: 'Relative units scale with the user',
      },
      {
        kind: 'codeWithOutput',
        languageId: 'css',
        caption: 'rem, %, vw, vh instead of fixed px.',
        code: 'h1 { font-size: 2rem; }       /* 2x root font size, scales with user setting */\n.card { width: 90%; }       /* 90% of parent — shrinks on small screens */\n.hero { height: 100vh; }   /* full viewport height */\np { font-size: 1rem; max-width: 60ch; }  /* ch = width of "0" — line length */',
        output: '# px is fixed; rem/%/vw/vh/ch respond to the screen or user setting',
      },
      {
        kind: 'callout',
        variant: 'tip',
        title: 'rem respects user font-size settings',
        text:
          'Browsers let users set a default font size. rem is relative to that ' +
          'root size, so 1.2rem scales up for a user who asked for larger ' +
          'text. px does not — it is the same regardless of the user setting, ' +
          'which is an accessibility regression.',
      },
      {
        kind: 'heading',
        text: 'Media queries: rules at a breakpoint',
      },
      {
        kind: 'codeWithOutput',
        languageId: 'css',
        caption: 'Change the layout when the screen is at least 768px.',
        code: '.grid { display: block; }   /* mobile: stack cards */\n\n@media (min-width: 768px) {\n  .grid {\n    display: flex;           /* tablet+: side by side */\n    flex-wrap: wrap;\n  }\n  .card { flex: 1 1 300px; }\n}',
        output: '# below 768px: stacked\n# 768px and up: flex row, wrapping cards',
      },
      {
        kind: 'callout',
        variant: 'info',
        title: 'Breakpoints follow content, not devices',
        text:
          'Do not target "iPhone width" — new devices appear constantly. ' +
          'Resize the window until the layout breaks, then add a media query ' +
          'at that width. Content-driven breakpoints stay correct as devices ' +
          'change.',
      },
      {
        kind: 'heading',
        text: 'Mobile-first: small layout as the base',
      },
      {
        kind: 'paragraph',
        text:
          'Write the narrow-screen styles as the default, then use ' +
          'min-width media queries to ADD layout for wider screens. This is ' +
          'mobile-first: the base is the constrained case, and each ' +
          'breakpoint enhances. It tends to produce smaller, faster CSS ' +
          'because the base is simpler and enhancements layer on.',
      },
      {
        kind: 'code',
        languageId: 'css',
        caption: 'Mobile-first pattern: base is single column; add columns at breakpoints.',
        code: '/* base: mobile, single column */\n.cards { display: grid; grid-template-columns: 1fr; gap: 12px; }\n\n/* tablet: two columns */\n@media (min-width: 600px) {\n  .cards { grid-template-columns: 1fr 1fr; }\n}\n\n/* desktop: three columns */\n@media (min-width: 900px) {\n  .cards { grid-template-columns: repeat(3, 1fr); }\n}',
      },
      {
        kind: 'callout',
        variant: 'warning',
        title: 'The viewport meta tag is required',
        text:
          'Without <meta name="viewport" content="width=device-width, ' +
          'initial-scale=1">, mobile browsers render at a fake 980px width ' +
          'and shrink the result. Your responsive CSS never triggers because ' +
          'the browser pretends to be wide. Every responsive page needs this tag.',
      },
      {
        kind: 'compare',
        languageIds: ['css', 'html'],
        caption:
          'The viewport tag enables responsive CSS on mobile browsers.',
        snippets: [
          '@media (min-width: 768px) { .grid { display: flex; } }',
          '<meta name="viewport" content="width=device-width, initial-scale=1">',
        ],
      },
    ],
    animation: {
      type: 'timeline',
      title: 'A layout responding to screen width',
      steps: [
        { caption: 'Mobile (350px): one column, stacked cards. Base CSS.' },
        { caption: 'Cross 600px: media query fires, two columns.' },
        { caption: 'Cross 900px: three columns. Each breakpoint adds layout.' },
        { caption: 'On every size the cards fill the width — no horizontal scroll.' },
      ],
    },
    activity: {
      type: 'multipleChoice',
      title: 'Why mobile-first?',
      prompt:
        'Why write the narrow-screen layout as the default and use ' +
        'min-width queries to enhance?',
      languageId: 'css',
      data: {
        question: 'What is the advantage of mobile-first CSS?',
        options: [
          'It is faster to type.',
          'The base (constrained) case is simple, and each min-width query layers on enhancements — smaller, faster CSS and a correct progressive enhancement.',
          'It avoids media queries entirely.',
          'Desktop users see the mobile site.',
        ],
        correctIndex: 1,
        explanation:
          'Mobile-first makes the constrained layout the base and adds ' +
          'enhancements at breakpoints. The base tends to be simpler (no ' +
          'overrides to undo), and old/min-width queries only add, never ' +
          'remove, which keeps CSS small and predictable.',
      },
      checks: [],
    },
    comprehensionChecks: [
      {
        question: 'Why use rem instead of px for font sizes?',
        options: [
          'rem is faster.',
          'rem is relative to the root font size, so it respects the user browser font-size setting — an accessibility win.',
          'px is deprecated.',
          'rem makes text bigger.',
        ],
        correctIndex: 1,
        explanation:
          'rem scales with the user root font size, so a user who asked for ' +
          'larger text gets it. px is fixed regardless, overriding the user ' +
          'preference — an accessibility regression.',
      },
      {
        question: 'What does the viewport meta tag do?',
        options: [
          'It makes the page faster.',
          'It tells mobile browsers to use the real device width instead of a fake 980px, so responsive media queries trigger correctly.',
          'It adds a scrollbar.',
          'It hides content on mobile.',
        ],
        correctIndex: 1,
        explanation:
          'Without the viewport tag, mobile browsers render at a fake 980px ' +
          'and zoom out, so your responsive breakpoints never fire. The tag ' +
          'makes the browser use the real device width, enabling your CSS.',
      },
    ],
  },
]
