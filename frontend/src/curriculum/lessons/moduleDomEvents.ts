/**
 * Cambric Labs — Module: The DOM & Events (Web)
 *
 * Two lessons: the DOM tree and querying/manipulation, and the event
 * system with bubbling and delegation.
 */
import type { LessonDetail } from '../types'

export const domEventsLessons: LessonDetail[] = [
  {
    id: 'lesson-dom-tree',
    title: 'The DOM: A Live Tree of Nodes',
    moduleId: 'module-dom-events',
    languageId: 'javascript',
    difficulty: 3,
    estimatedMinutes: 12,
    summary:
      'The browser parses HTML into a live tree of nodes (the DOM) you can ' +
      'query with selectors and mutate with JavaScript to change the page.',
    teachesConceptIds: ['dom', 'dom-tree', 'selectors', 'event-listeners'],
    prerequisiteConceptIds: ['html', 'tree', 'javascript'],
    objectives: [
      'Explain how HTML becomes a tree of DOM nodes.',
      'Query elements with querySelector and querySelectorAll.',
      'Mutate the DOM: text, attributes, classes, and structure.',
      'Avoid reflow thrash by batching DOM writes.',
    ],
    content: [
      {
        kind: 'paragraph',
        text:
          'The browser does not see HTML as text — it parses it into a tree ' +
          'of nodes called the DOM (Document Object Model). Each tag becomes ' +
          'an element node; text becomes text nodes. JavaScript can walk, ' +
          'query, and mutate that tree, and the page re-renders to match. ' +
          'The DOM is live: change it, and the screen changes.',
      },
      {
        kind: 'heading',
        text: 'HTML to DOM: a tree of element nodes',
      },
      {
        kind: 'codeWithOutput',
        languageId: 'html',
        caption: 'HTML and the tree it produces.',
        code: '<ul id="list">\n  <li class="item">First</li>\n  <li class="item">Second</li>\n</ul>\n\n<!-- DOM tree:\n     ul#list\n     ├── li.item "First"\n     └── li.item "Second" -->',
        output: '# each tag is a node; the browser holds this tree in memory',
      },
      {
        kind: 'heading',
        text: 'Query with CSS selectors',
      },
      {
        kind: 'codeWithOutput',
        languageId: 'javascript',
        caption: 'querySelector finds the first match; querySelectorAll finds all.',
        code: 'const list = document.querySelector("#list");         // by id\nconst first = document.querySelector(".item");        // first .item\nconst all = document.querySelectorAll(".item");        // all .items (a NodeList)\nconsole.log(all.length);                               // 2\nconsole.log(first.textContent);                        // "First"',
        output: '2\nFirst',
      },
      {
        kind: 'callout',
        variant: 'tip',
        title: 'querySelector accepts any CSS selector',
        text:
          'The same selectors you use in CSS ("#id", ".class", "ul > li", ' +
          '"[data-role=x]") work in querySelector. You do not need a separate ' +
          'DOM selector language — reuse your CSS knowledge.',
      },
      {
        kind: 'heading',
        text: 'Mutate: text, attributes, classes',
      },
      {
        kind: 'codeWithOutput',
        languageId: 'javascript',
        caption: 'Change what the page shows by changing the DOM.',
        code: 'const li = document.querySelector(".item");\nli.textContent = "Updated";            // change text\nli.setAttribute("data-id", "42");    // add an attribute\nli.classList.add("done");             // add a class (toggles CSS)\nli.classList.toggle("hidden");        // flip a class on/off',
        output: '# the <li> on screen now says "Updated" and has class "done hidden"',
      },
      {
        kind: 'heading',
        text: 'Add and remove nodes',
      },
      {
        kind: 'codeWithOutput',
        languageId: 'javascript',
        caption: 'Create, append, and remove elements.',
        code: 'const ul = document.querySelector("#list");\nconst li = document.createElement("li");  // new node, not yet in tree\nli.textContent = "Third";\nul.append(li);                           // now visible\n\nconst gone = ul.querySelector(".item");\ngone.remove();                            // remove from DOM',
        output: '# the list now has: Second, Third (First was removed)',
      },
      {
        kind: 'callout',
        variant: 'warning',
        title: 'Reflow is expensive — batch writes',
        text:
          'Every structural change triggers a reflow (the browser recomputes ' +
          'layout). Reading layout back (offsetHeight) then writing again ' +
          'forces a sync reflow each time — "layout thrash." Build the new ' +
          'nodes detached, then append once, to minimise reflows.',
      },
      {
        kind: 'code',
        languageId: 'javascript',
        caption: 'Build detached, append once.',
        code: '// BAD: thrash — append inside a loop, reflow each time\nfor (const name of names) {\n  const li = document.createElement("li");\n  li.textContent = name;\n  ul.append(li);  // reflow per item\n}\n\n// GOOD: build a fragment, append once\nconst frag = document.createDocumentFragment();\nfor (const name of names) {\n  const li = document.createElement("li");\n  li.textContent = name;\n  frag.append(li);  // detached, no reflow\n}\nul.append(frag);  // ONE reflow',
      },
      {
        kind: 'compare',
        languageIds: ['javascript', 'html'],
        caption:
          'The HTML defines the initial DOM; JavaScript mutates the live tree.',
        snippets: [
          'const li = document.createElement("li");\nli.textContent = "New";\ndocument.querySelector("#list").append(li);',
          '<ul id="list"><li>Old</li></ul>',
        ],
      },
    ],
    animation: {
      type: 'treeTraversal',
      title: 'HTML parses into a live DOM tree',
      steps: [
        { caption: 'HTML <ul id=list><li>First</li><li>Second</li></ul>.' },
        { caption: 'Browser parses: a ul#list node with two li children.' },
        { caption: 'JS querySelector("#list") finds the ul node.' },
        { caption: 'JS append(new li) — the tree gains a child; the screen re-renders.' },
        { caption: 'JS remove(first li) — the tree loses a child; the screen re-renders. The tree IS the page.' },
      ],
    },
    activity: {
      type: 'codeChallenge',
      title: 'Add a list item',
      prompt:
        'Given <ul id="list"></ul>, add an <li> with text "Hello" using ' +
        'JavaScript. The list must end with one child saying Hello.',
      languageId: 'javascript',
      starterCode: 'const ul = document.querySelector("#list");\n// create an li, set its text, append it\n\n\n// (do not call remove — just add)',
      checks: [
        { description: 'Uses createElement', assertion: { kind: 'contains', value: 'createElement' } },
        { description: 'Appends to the list', assertion: { kind: 'contains', value: 'append' } },
      ],
    },
    comprehensionChecks: [
      {
        question: 'What is the DOM?',
        options: [
          'A CSS file.',
          'A live tree of nodes the browser builds from HTML, which JavaScript can query and mutate.',
          'A network protocol.',
          'A JavaScript library.',
        ],
        correctIndex: 1,
        explanation:
          'The DOM (Document Object Model) is the in-memory tree the browser ' +
          'builds by parsing HTML. It is live: JavaScript mutations to the ' +
          'tree immediately re-render on screen.',
      },
      {
        question: 'Why is building nodes in a DocumentFragment faster than appending each to the live DOM?',
        options: [
          'Fragments are smaller.',
          'A fragment is detached, so no reflow happens during construction; one final append triggers a single reflow instead of many.',
          'Fragments use less memory.',
          'They do not require selectors.',
        ],
        correctIndex: 1,
        explanation:
          'Each append to the live DOM can trigger a reflow. Building in a ' +
          'detached fragment avoids reflows during construction; appending the ' +
          'fragment once triggers a single reflow.',
      },
    ],
  },

  {
    id: 'lesson-events-bubbling',
    title: 'Events: Listen, Fire, Bubble',
    moduleId: 'module-dom-events',
    languageId: 'javascript',
    difficulty: 3,
    estimatedMinutes: 12,
    summary:
      'Events fire when something happens. They bubble up the DOM from the ' +
      'target, which enables delegation: one listener on a parent handles ' +
      'many children.',
    teachesConceptIds: ['events', 'event-listeners', 'dom', 'event-bubbling'],
    prerequisiteConceptIds: ['dom', 'javascript', 'function'],
    objectives: [
      'Register an event listener with addEventListener.',
      'Explain the capturing and bubbling phases.',
      'Use event delegation to handle many children with one listener.',
      'Stop propagation and prevent default when appropriate.',
    ],
    content: [
      {
        kind: 'paragraph',
        text:
          'When a user clicks, types, or scrolls, the browser fires an event. ' +
          'You register a listener that runs when that event happens. Events ' +
          'also travel (bubble) up the DOM from the target to the root, so a ' +
          'listener on a parent sees events from any of its children. That ' +
          'bubbling is the basis of delegation.',
      },
      {
        kind: 'heading',
        text: 'Register a listener',
      },
      {
        kind: 'codeWithOutput',
        languageId: 'javascript',
        caption: 'addEventListener runs a function when the event fires.',
        code: 'const btn = document.querySelector("#go");\nbtn.addEventListener("click", (event) => {\n  console.log("clicked", event.target);\n});\n// event.target is the element that was actually clicked',
        output: '# clicking the button logs: clicked <button id="go">',
      },
      {
        kind: 'callout',
        variant: 'info',
        title: 'target vs currentTarget',
        text:
          'event.target is the deepest element that received the click (the ' +
          'real target). event.currentTarget is the element the listener is ' +
          'attached to. They differ during bubbling: the listener on a ' +
          'parent sees target = the child, currentTarget = the parent.',
      },
      {
        kind: 'heading',
        text: 'Bubbling: events travel up',
      },
      {
        kind: 'paragraph',
        text:
          'After firing on the target, an event bubbles up to each ancestor ' +
          'in turn. A click on an <li> bubbles to the <ul>, then the <body>, ' +
          'then the document. Listeners on any of those can handle it. This ' +
          'is why a listener on a container catches clicks on any child.',
      },
      {
        kind: 'codeWithOutput',
        languageId: 'javascript',
        caption: 'Bubbling lets a parent see child clicks.',
        code: 'document.querySelector("#list").addEventListener("click", (e) => {\n  if (e.target.matches("li")) {\n    console.log("clicked li:", e.target.textContent);\n  }\n});\n// clicking any <li> inside #list logs its text — one listener, many items',
        output: '# click "First" → clicked li: First\n# click "Second" → clicked li: Second',
      },
      {
        kind: 'callout',
        variant: 'tip',
        title: 'Delegation: one listener for many children',
        text:
          'Attaching a listener to every <li> is wasteful and breaks when ' +
          'you add new items (the new ones have no listener). Delegation — ' +
          'one listener on the parent that checks e.target — handles all ' +
          'current AND future children with a single binding.',
      },
      {
        kind: 'heading',
        text: 'preventDefault and stopPropagation',
      },
      {
        kind: 'code',
        languageId: 'javascript',
        caption: 'Two distinct controls.',
        code: 'form.addEventListener("submit", (e) => {\n  e.preventDefault();      // do not reload the page (the form default)\n  // ...handle via fetch instead\n});\n\ndocument.querySelector("#inner").addEventListener("click", (e) => {\n  e.stopPropagation();    // do not bubble to parent handlers\n  // parent click handlers will NOT run for this click\n});',
      },
      {
        kind: 'callout',
        variant: 'warning',
        title: 'preventDefault ≠ stopPropagation',
        text:
          'preventDefault stops the browser DEFAULT (form submit, link ' +
          'navigation). stopPropagation stops BUBBLING to other listeners. ' +
          'They are independent: you can prevent default and still bubble, ' +
          'or stop bubbling and still let the default happen.',
      },
      {
        kind: 'compare',
        languageIds: ['javascript', 'html'],
        caption:
          'addEventListener in JS vs the older onclick attribute — prefer ' +
          'addEventListener (multiple listeners, no HTML/JS coupling).',
        snippets: [
          'btn.addEventListener("click", handler);',
          '<button onclick="handler()">Go</button>',
        ],
      },
    ],
    animation: {
      type: 'treeTraversal',
      title: 'A click bubbling up the DOM',
      steps: [
        { caption: 'Click the inner <li>. Event fires on the <li> (target).' },
        { caption: 'Bubbles to parent <ul>. A listener there catches it; e.target is the <li>.' },
        { caption: 'Bubbles to <body>, then document. Any ancestor listener sees it.' },
        { caption: 'stopPropagation at the <ul> stops it reaching <body>/document.' },
        { caption: 'Delegation: one <ul> listener handles clicks on any <li>, present or future.' },
      ],
    },
    activity: {
      type: 'multipleChoice',
      title: 'Why use event delegation?',
      prompt:
        'You have a <ul> with 100 <li> children and more added dynamically. ' +
        'Why attach one listener to the <ul> instead of one per <li>?',
      languageId: 'javascript',
      data: {
        question: 'Why delegate to the <ul> instead of a listener per <li>?',
        options: [
          'It is faster to type.',
          'One listener (not 100), and it automatically covers dynamically added <li> children because they bubble to the same parent.',
          'It is required by the browser.',
          'Individual listeners do not work.',
        ],
        correctIndex: 1,
        explanation:
          'Delegation uses one binding and catches events from all current ' +
          'and future children via bubbling. Per-child listeners are wasteful ' +
          'and must be re-attached for every new child.',
      },
      checks: [],
    },
    comprehensionChecks: [
      {
        question: 'What does event.target refer to in a bubbled event?',
        options: [
          'The element the listener is attached to.',
          'The deepest element that actually received the event (the real target), even during bubbling.',
          'The document root.',
          'The parent of the clicked element.',
        ],
        correctIndex: 1,
        explanation:
          'target is always the element that originally received the event, ' +
          'even as the event bubbles to ancestors. currentTarget is the ' +
          'element the listener is attached to, which changes per ancestor.',
      },
      {
        question: 'What is the difference between preventDefault and stopPropagation?',
        options: [
          'They are the same thing.',
          'preventDefault stops the browser default (submit, link navigation); stopPropagation stops the event bubbling to other listeners.',
          'preventDefault stops bubbling; stopPropagation stops the default.',
          'Both stop the event entirely.',
        ],
        correctIndex: 1,
        explanation:
          'They are independent. preventDefault cancels the browser action ' +
          '(form submit reload). stopPropagation stops the event reaching ' +
          'ancestor listeners. You can do either, both, or neither.',
      },
    ],
  },
]
