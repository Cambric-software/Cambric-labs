/**
 * Cambric Labs — Module: Frontend Architecture (Web)
 *
 * Two lessons: component thinking (props in, UI out), and state management
 * (single source of truth, one-way flow, why mutation is a footgun).
 */
import type { LessonDetail } from '../types'

export const frontendArchLessons: LessonDetail[] = [
  {
    id: 'lesson-component-model',
    title: 'Components: UI as a Function of Data',
    moduleId: 'module-frontend-arch',
    languageId: 'typescript',
    difficulty: 4,
    estimatedMinutes: 12,
    summary:
      'A component is a function from props (and state) to UI. The same ' +
      'inputs always produce the same output, so the screen is just the ' +
      'composition of many small such functions — no manual DOM mutation.',
    teachesConceptIds: ['component', 'virtual-dom', 'rendering', 'immutability'],
    prerequisiteConceptIds: ['function', 'javascript', 'dom', 'object', 'array'],
    objectives: [
      'Explain the "UI = f(state)" model and why it beats manual DOM updates.',
      'Compose components via props (data down) and events (actions up).',
      'Explain why the virtual DOM lets declarative rendering stay fast.',
      'Identify the anti-pattern of mutating state directly.',
    ],
    content: [
      {
        kind: 'paragraph',
        text:
          'Before components, "web app" meant imperative DOM scripting: ' +
          'find the element, change its text, append a child, repeat. Every ' +
          'state change required code describing exactly which DOM nodes to ' +
          'touch. Components invert this: you describe what the UI should ' +
          'look like for a given piece of data, and the framework computes ' +
          'the DOM updates for you. The component is a pure-ish function: ' +
          'props in, UI out.',
      },
      {
        kind: 'heading',
        text: 'UI is a function of state',
      },
      {
        kind: 'codeWithOutput',
        languageId: 'typescript',
        caption: 'A counter component: same count, same markup, every time.',
        code: "function Counter({ count }: { count: number }) {\n  return <button>Clicked {count} times</button>\n}\n\n// render <Counter count={0} /> then <Counter count={1} />\n// the framework diffs and updates only the changed text, not the whole tree",
        output: '<button>Clicked 0 times</button>  ->  <button>Clicked 1 times</button>',
      },
      {
        kind: 'callout',
        variant: 'info',
        title: 'Declarative vs imperative',
        text:
          'Imperative: "set the button text to the new count." Declarative: ' +
          '"whenever count is N, the button shows N." The declarative version ' +
          'cannot drift from the data because it is derived from it. Bugs ' +
          'come from UI and state disagreeing; deriving UI from state removes ' +
          'the disagreement by construction.',
      },
      {
        kind: 'heading',
        text: 'Data down, events up (the one-way flow)',
      },
      {
        kind: 'code',
        languageId: 'typescript',
        caption: 'Parent owns the state; child reports intent via a callback prop.',
        code: "function App() {\n  const [count, setCount] = useState(0)\n  return (\n    <Counter\n      count={count}\n      onIncrement={() => setCount(count + 1)}\n    />\n  )\n}\n\n// Counter (child) receives count (data) and onIncrement (event).\n// It never owns the count; it asks the parent to change it.",
      },
      {
        kind: 'callout',
        variant: 'warning',
        title: 'Two-way binding hides the flow',
        text:
          'Some frameworks sync the model and input both ways automatically. ' +
          'It feels magical until two sources of truth disagree and you ' +
          'cannot tell which update wins. One-way data flow makes the path ' +
          'traceable: state -> props -> UI -> event -> state.',
      },
      {
        kind: 'heading',
        text: 'The virtual DOM: diff, not rebuild',
      },
      {
        kind: 'paragraph',
        text:
          'Recreating every DOM node on each render would be slow (the real ' +
          'DOM is expensive to mutate). Frameworks keep a lightweight ' +
          'JavaScript description of the tree — the virtual DOM — and on ' +
          'each render compute a diff between the old and new descriptions, ' +
          'then apply only the minimal set of real DOM edits. The component ' +
          'stays simple (describe the whole tree); performance stays good ' +
          '(only changes touch the browser).',
      },
      {
        kind: 'compare',
        languageIds: ['javascript', 'typescript'],
        caption:
          'Imperative DOM (manual, drifts) vs declarative component (derived, safe).',
        snippets: [
          "// imperative: must remember every node to touch\nconst btn = document.querySelector('#c')\nbtn.textContent = `Clicked ${count} times`",
          "// declarative: describe the whole tree, let it diff\n<Counter count={count} onIncrement={inc} />",
        ],
      },
    ],
    animation: {
      type: 'dataFlow',
      title: 'One-way data flow: state -> props -> UI -> event -> state',
      steps: [
        { caption: 'App holds state count=0. Renders <Counter count={0} />.' },
        { caption: 'Counter receives count=0 as props. Renders button "Clicked 0 times".' },
        { caption: 'User clicks. Counter calls onIncrement() (event goes UP to parent).' },
        { caption: 'Parent updates state: setCount(1). State is now 1.' },
        { caption: 'Re-render: <Counter count={1} />. Diff updates only the changed text. UI matches state.' },
      ],
    },
    activity: {
      type: 'multipleChoice',
      title: 'Where should the count live?',
      prompt:
        'Two sibling counters both need the current count. Where should ' +
        'the state live?',
      languageId: 'typescript',
      data: {
        question: 'Where does shared state belong?',
        options: [
          'In each counter component, synced with the other.',
          'In their common parent; the parent passes count down as props and receives increments up via callbacks.',
          'In the DOM, read from a data attribute.',
          'In a global variable both components import.',
        ],
        correctIndex: 1,
        explanation:
          'Lift shared state to the closest common ancestor. Each child ' +
          'stays a pure function of props; the single owner cannot disagree ' +
          'with itself. This is "lifting state up."',
      },
      checks: [],
    },
    comprehensionChecks: [
      {
        question: 'Why is "UI = f(state)" safer than manually mutating the DOM?',
        options: [
          'It runs faster because functions are fast.',
          'The UI is derived from the data, so it can never drift out of sync with the data; bugs from disagreement are removed by construction.',
          'It uses less memory.',
          'It avoids the browser entirely.',
        ],
        correctIndex: 1,
        explanation:
          'When UI is a pure function of state, the screen is always the ' +
          'correct rendering of the current state — there is no separate ' +
          'imperative path that can forget to update a node. The framework ' +
          'computes the diff; you only describe the target.',
      },
      {
        question: 'What problem does the virtual DOM solve?',
        options: [
          'It makes components smaller.',
          'It lets you describe the whole tree each render while only touching the real DOM where it changed, keeping the simple model without paying the cost of full rebuilds.',
          'It replaces the real DOM.',
          'It compiles TypeScript.',
        ],
        correctIndex: 1,
        explanation:
          'Naively rebuilding real DOM nodes per render is too slow. The ' +
          'virtual DOM is a cheap JS tree; the framework diffs old vs new ' +
          'and patches only the changed real nodes, giving declarative ' +
          'simplicity with near-imperative performance.',
      },
    ],
  },
  {
    id: 'lesson-state-management',
    title: 'State Management: One Source of Truth, Immutable Updates',
    moduleId: 'module-frontend-arch',
    languageId: 'typescript',
    difficulty: 4,
    estimatedMinutes: 12,
    summary:
      'State is the single source of truth for the UI. Mutating it directly ' +
      'hides changes from the renderer; replacing it immutably makes every ' +
      'update visible, cheap to compare, and replayable for debugging.',
    teachesConceptIds: ['state-management', 'immutability', 'rendering', 'component'],
    prerequisiteConceptIds: ['component', 'object', 'array', 'function', 'javascript'],
    objectives: [
      'Explain why direct state mutation is a bug source.',
      'Produce immutable updates (spread, map, filter) that return new objects.',
      'Normalize nested state so updates are shallow and predictable.',
      'Compare local component state, lifted state, and a global store.',
    ],
    content: [
      {
        kind: 'paragraph',
        text:
          'If state is the single source of truth, then changing state must ' +
          'be visible to the renderer — otherwise it cannot know to re-render. ' +
          'Mutating an object in place does not change its identity, so a ' +
          'renderer that checks "did the reference change?" sees nothing and ' +
          'skips the update. Immutable replacement — building a new object ' +
          'instead of editing the old one — makes identity a reliable change ' +
          'signal.',
      },
      {
        kind: 'heading',
        text: 'Mutation hides change; replacement reveals it',
      },
      {
        kind: 'code',
        languageId: 'typescript',
        caption: 'Mutating state: the reference is unchanged, so nothing re-renders.',
        code: "const [user, setUser] = useState({ name: 'Ada', score: 0 })\n\nuser.score = 10          // BAD: mutated in place\n// setUser was never called; the reference is the same object\n// the renderer compares old === new (true) and skips the update",
      },
      {
        kind: 'codeWithOutput',
        languageId: 'typescript',
        caption: 'Immutable update: spread the old, override the changed field.',
        code: "setUser({ ...user, score: 10 })   // GOOD: new object, old spread\n// new reference !== old; renderer sees the change and re-renders\n// user.name is preserved; only score changed\n\n// arrays: never push; return a new array\nsetItems(prev => [...prev, newItem])       // add\nsetItems(prev => prev.filter(i => i.id !== id))  // remove\nsetItems(prev => prev.map(i => i.id === id ? { ...i, done: true } : i))  // update one",
        output: 're-render triggered: user.score 0 -> 10',
      },
      {
        kind: 'callout',
        variant: 'warning',
        title: 'Nested mutation is the silent killer',
        text:
          'Spreading the top object does NOT copy nested objects — they are ' +
          'shared by reference. Mutating a nested array "inside" your spread ' +
          'still mutates the old state. Always replace each level you change, ' +
          'or normalize state so entities are flat and updates are shallow.',
      },
      {
        kind: 'heading',
        text: 'Normalize: flat tables, not nested trees',
      },
      {
        kind: 'code',
        languageId: 'typescript',
        caption: 'A normalized store: one table per entity, ids as references.',
        code: "// nested (hard to update one todo in one list):\n// { lists: [{ id: 1, todos: [{ id: 9, done: false }] }] }\n\n// normalized (update one todo without touching lists):\nconst state = {\n  lists:   { byId: { 1: { id: 1, todoIds: [9] } } },\n  todos:   { byId: { 9: { id: 9, done: false } } },\n}\n// toggle todo 9: replace only todos.byId[9]; lists untouched",
      },
      {
        kind: 'callout',
        variant: 'tip',
        title: 'Normalization is a database idea',
        text:
          'You already know this from relational databases: store each ' +
          'entity once in a table keyed by id, and reference it by id elsewhere. ' +
          'The same trick makes frontend state updates shallow and predictable ' +
          'instead of deeply nested surgery.',
      },
      {
        kind: 'heading',
        text: 'Local vs lifted vs global',
      },
      {
        kind: 'steps',
        caption: 'Choosing where state lives',
        steps: [
          'Local: used by ONE component (a form field) -> useState in that component.',
          'Lifted: shared by a few siblings -> the closest common parent owns it.',
          'Global: needed across far-apart parts of the tree (auth, theme, cart) -> a context/store outside the tree.',
        ],
      },
      {
        kind: 'compare',
        languageIds: ['typescript', 'typescript'],
        caption:
          'Direct mutation (broken) vs immutable replacement (correct).',
        snippets: [
          "user.score = 10        // same reference, no re-render",
          "setUser({ ...user, score: 10 })  // new reference, re-render",
        ],
      },
    ],
    animation: {
      type: 'dataFlow',
      title: 'Immutable update -> re-render',
      steps: [
        { caption: 'state.user = { name: "Ada", score: 0 }. Render shows score 0.' },
        { caption: 'BAD: user.score = 10. The object reference is unchanged.' },
        { caption: 'Renderer: oldUser === newUser (same object) -> SKIP. UI still shows 0.' },
        { caption: 'GOOD: setUser({ ...user, score: 10 }). A NEW object is created; old spread, score overridden.' },
        { caption: 'Renderer: oldUser !== newUser -> re-render. UI shows 10. State and UI agree.' },
      ],
    },
    activity: {
      type: 'fixCode',
      title: 'Fix the broken update',
      prompt:
        'This toggle does not re-render. Fix the update so the renderer sees the change.',
      languageId: 'typescript',
      starterCode: "const [todos, setTodos] = useState([{ id: 1, done: false }])\n\nfunction toggle(id) {\n  todos[0].done = true\n  setTodos(todos)\n}",
      data: {
        explanation:
          'todos[0].done = true mutates the existing object; setTodos(todos) ' +
          'passes the same array reference. Replace the changed item immutably: ' +
          'setTodos(todos.map(t => t.id === id ? { ...t, done: true } : t)).',
      },
      checks: [
        { description: 'does not mutate the existing object', assertion: { kind: 'notContains', value: 'todos[0].done = true' } },
        { description: 'returns a new array via map', assertion: { kind: 'matchesRegex', pattern: '\\.map\\(' } },
      ],
    },
    comprehensionChecks: [
      {
        question: 'Why does `setUser({ ...user, score: 10 })` trigger a re-render but `user.score = 10` does not?',
        options: [
          'Spread is faster than assignment.',
          'The spread creates a new object reference, so the renderer sees old !== new; mutation keeps the same reference, so it looks unchanged.',
          'Spread validates the fields.',
          'Assignment is async.',
        ],
        correctIndex: 1,
        explanation:
          'React (and similar renderers) decide whether to re-render by ' +
          'reference equality. Spreading builds a new object (new identity) ' +
          'so the change is detected; in-place mutation keeps the same ' +
          'identity and the renderer skips the update. This is why ' +
          'immutability is the discipline, not a style preference.',
      },
      {
        question: 'You have many todos nested inside lists. What makes updating one todo cheap and predictable?',
        options: [
          'Deep-clone the whole state each time.',
          'Normalize: store todos in their own table keyed by id, referenced by id from lists, so updating one todo replaces only that one entry.',
          'Put all state in one giant object.',
          'Avoid arrays entirely.',
        ],
        correctIndex: 1,
        explanation:
          'Normalization (one table per entity, ids as links) lets you ' +
          'update a single todo by replacing only todos.byId[id], without ' +
          'touching the lists that reference it. It is shallow, predictable, ' +
          'and the same pattern relational databases use.',
      },
    ],
  },
]
