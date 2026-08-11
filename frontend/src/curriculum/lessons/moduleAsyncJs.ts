/**
 * Cambric Labs — Module: Async JavaScript (Web)
 *
 * Two lessons: the event loop (call stack vs task vs microtask), and
 * promises + async/await (chaining, error handling, parallelism).
 */
import type { LessonDetail } from '../types'

export const asyncJsLessons: LessonDetail[] = [
  {
    id: 'lesson-event-loop',
    title: 'The Event Loop: How JavaScript Runs Async Without Threads',
    moduleId: 'module-async-js',
    languageId: 'javascript',
    difficulty: 4,
    estimatedMinutes: 11,
    summary:
      'JavaScript is single-threaded, yet it does I/O without freezing. ' +
      'The secret is the event loop: a call stack for sync code, a task ' +
      'queue for macrotasks (timers, I/O), and a microtask queue for ' +
      'promise continuations drained before any task.',
    teachesConceptIds: ['event-loop', 'task-queue', 'microtask', 'callback', 'async'],
    prerequisiteConceptIds: ['function', 'async', 'callback', 'stack-ds', 'queue-ds'],
    objectives: [
      'Explain why a single-threaded runtime does not block on I/O.',
      'Distinguish the call stack, the task (macrotask) queue, and the microtask queue.',
      'Predict execution order of sync code, setTimeout, and promise callbacks.',
      'Explain why a recursive sync loop blocks the loop and starves tasks.',
    ],
    content: [
      {
        kind: 'paragraph',
        text:
          'JavaScript has exactly one call stack. While a function runs, ' +
          'nothing else can. So how does a browser fetch a file, wait for ' +
          'the network, and still respond to clicks? It does not pause the ' +
          'stack on the network — it schedules the "what to do when it ' +
          'finishes" as a callback and keeps the loop turning. The event ' +
          'loop is the dispatcher that decides what runs next.',
      },
      {
        kind: 'heading',
        text: 'Three queues: stack, macrotasks, microtasks',
      },
      {
        kind: 'codeWithOutput',
        languageId: 'javascript',
        caption: 'A timer vs a promise: predict the order before reading the output.',
        code: "console.log('A: sync')\n\nsetTimeout(() => console.log('C: task (setTimeout)'), 0)\n\nPromise.resolve().then(() => console.log('B: microtask (promise)'))\n\nconsole.log('D: sync')\n// A, D are sync — run now, top to bottom.\n// The timer and the promise are NOT run yet; they are queued.",
        output: 'A: sync\nD: sync\nB: microtask (promise)\nC: task (setTimeout)',
      },
      {
        kind: 'callout',
        variant: 'info',
        title: 'Microtasks beat macrotasks',
        text:
          'After the stack empties, the loop drains the ENTIRE microtask ' +
          'queue before pulling even ONE macrotask. So a promise callback ' +
          'always runs before a setTimeout callback scheduled earlier. ' +
          'This is why promises feel "faster" than timers — they are.',
      },
      {
        kind: 'heading',
        text: 'The loop, one turn at a time',
      },
      {
        kind: 'steps',
        caption: 'What the loop does for the snippet above',
        steps: [
          'Run all sync code: print A, register the timer, register the promise then, print D. Stack is now empty.',
          'Stack empty? Drain microtasks: run the promise then, print B. Microtask queue empty.',
          'Pull ONE macrotask: the timer callback. Run it, print C.',
          'Drain microtasks again (none). Pull next macrotask (none). Idle.',
        ],
      },
      {
        kind: 'callout',
        variant: 'warning',
        title: 'The loop cannot preempt running code',
        text:
          'The loop only checks the queues when the stack is empty. If a ' +
          'sync function runs for 5 seconds, no timer, promise, or click ' +
          'handler can fire during that time — the page is frozen. "Async" ' +
          'in JS means "deferred via a queue," NOT "running on another ' +
          'thread." Heavy CPU work must be chunked or sent to a Web Worker.',
      },
      {
        kind: 'heading',
        text: 'Blocking the loop starves everyone',
      },
      {
        kind: 'code',
        languageId: 'javascript',
        caption: 'A tight sync loop freezes the UI; the timer never gets its turn.',
        code: "const start = Date.now()\nwhile (Date.now() - start < 1000) { /* spin for 1s */ }\n// during this second, no button click, no paint, no timer fires\nsetTimeout(() => console.log('finally'), 0)\n// prints after the loop ends, ~1s late — it was queued but never pulled",
      },
      {
        kind: 'compare',
        languageIds: ['javascript', 'python'],
        caption:
          'JS uses a single thread + event loop. Python (default CPython) ' +
          'also has a GIL but the asyncio model is explicit cooperative.',
        snippets: [
          "// JS: the runtime drives the loop for you\nsetTimeout(() => console.log('hi'), 0)",
          "# Python asyncio: YOU drive the loop\nimport asyncio\nasync def main():\n    await asyncio.sleep(0)\n    print('hi')\nasyncio.run(main())",
        ],
      },
    ],
    animation: {
      type: 'eventLoop',
      title: 'Stack, microtask queue, task queue',
      steps: [
        { caption: 'Stack: run console.log("A"). Print A. Stack empties.' },
        { caption: 'setTimeout(cb,0): push cb onto the TASK queue. Stack continues.' },
        { caption: 'Promise.resolve().then(cb2): push cb2 onto the MICROTASK queue.' },
        { caption: 'Stack: run console.log("D"). Print D. Stack empties.' },
        { caption: 'Loop: stack empty → drain ALL microtasks. Run cb2 → print B.' },
        { caption: 'Loop: microtasks empty → pull ONE task. Run cb → print C. Done.' },
      ],
    },
    activity: {
      type: 'predictOutput',
      title: 'Predict the order',
      prompt:
        'What does this print, in order? ' +
        "console.log('1'); setTimeout(()=>console.log('2'),0); " +
        "Promise.resolve().then(()=>console.log('3')); console.log('4')",
      languageId: 'javascript',
      data: {
        expected: '1\n4\n3\n2',
        explanation:
          '1 and 4 are sync. After the stack empties, microtasks run before ' +
          'macrotasks, so the promise (3) runs before the timer (2).',
      },
      checks: [],
    },
    comprehensionChecks: [
      {
        question:
          'A setTimeout callback and a Promise.then callback are both scheduled. Which runs first and why?',
        options: [
          'The setTimeout callback, because it was queued earlier.',
          'The Promise.then callback, because the loop drains the entire microtask queue before pulling any macrotask.',
          'They run at the same time on different threads.',
          'Whichever was registered first.',
        ],
        correctIndex: 1,
        explanation:
          'Macrotasks (setTimeout) live in the task queue; promise ' +
          'continuations live in the microtask queue. After the stack ' +
          'empties, microtasks are drained completely before a single ' +
          'macrotask is pulled, so the promise always wins.',
      },
      {
        question: 'Why does a long-running synchronous function "freeze" the page?',
        options: [
          'It uses too much memory.',
          'The event loop only checks the queues when the call stack is empty; while the sync function runs, no timer, promise, or input handler can fire.',
          'It blocks the CPU cache.',
          'It disables garbage collection.',
        ],
        correctIndex: 1,
        explanation:
          'JS has one stack. The loop cannot preempt running code, so a ' +
          'long sync function keeps the stack non-empty and starves every ' +
          'queued task — including rendering and input. Chunk the work or ' +
          'move it to a Worker.',
      },
    ],
  },
  {
    id: 'lesson-promises-async-await',
    title: 'Promises & async/await: Taming Asynchronous Flow',
    moduleId: 'module-async-js',
    languageId: 'javascript',
    difficulty: 4,
    estimatedMinutes: 13,
    summary:
      'A promise is a value from the future; async/await lets you read ' +
      'async code top-to-bottom as if it were synchronous. Master chaining, ' +
      'error propagation, and Promise.all for parallelism.',
    teachesConceptIds: ['promise', 'async-await', 'microtask', 'event-loop'],
    prerequisiteConceptIds: ['callback', 'async', 'event-loop', 'function', 'error-handling'],
    objectives: [
      'Explain the three promise states and how a value flows through then.',
      'Rewrite callback-based code as async/await.',
      'Handle async errors with try/catch and .catch.',
      'Run independent async operations in parallel with Promise.all.',
    ],
    content: [
      {
        kind: 'paragraph',
        text:
          'A callback is "run this later." A promise is "here is a box for ' +
          'the result; I will fill it." The box has three states: pending ' +
          '(waiting), fulfilled (got a value), or rejected (got an error). ' +
          'You attach handlers with .then and .catch; the runtime runs them ' +
          'as microtasks when the box is settled. async/await is sugar over ' +
          'this: await means "pause this function until the box is filled," ' +
          'and the function reads top-to-bottom instead of nesting.',
      },
      {
        kind: 'heading',
        text: 'The callback pyramid, and why promises flatten it',
      },
      {
        kind: 'code',
        languageId: 'javascript',
        caption: 'Three sequential async steps as nested callbacks — the Pyramid of Doom.',
        code: "getUser(1, (user) => {\n  getOrders(user, (orders) => {\n    getItems(orders[0], (items) => {\n      console.log(items)   // three levels deep\n    })\n  })\n})",
      },
      {
        kind: 'codeWithOutput',
        languageId: 'javascript',
        caption: 'Promises chain: each then receives the previous result.',
        code: "function getUser(id) { return Promise.resolve({ id, name: 'Ada' }) }\nfunction getOrders(user) { return Promise.resolve(['ord-7', 'ord-9']) }\nfunction getItems(orderId) { return Promise.resolve(['book', 'pen']) }\n\ngetUser(1)\n  .then(getOrders)      // receives user, returns a promise of orders\n  .then(orders => getItems(orders[0]))  // receives orders, returns promise of items\n  .then(items => console.log(items))\n  .catch(err => console.error('failed:', err))",
        output: "[ 'book', 'pen' ]",
      },
      {
        kind: 'callout',
        variant: 'tip',
        title: 'A then handler returning a promise is awaited',
        text:
          'When a .then returns a promise, the chain waits for it before ' +
          'passing its value to the next .then. Returning a plain value ' +
          'wraps it in an already-resolved promise. This is what lets you ' +
          'sequence async steps without nesting.',
      },
      {
        kind: 'heading',
        text: 'async/await: the same flow, reading like normal code',
      },
      {
        kind: 'codeWithOutput',
        languageId: 'javascript',
        caption: 'await suspends the async function; the event loop runs other work meanwhile.',
        code: "async function loadItems(userId) {\n  const user = await getUser(userId)       // pause until resolved\n  const orders = await getOrders(user)      // pause again\n  const items = await getItems(orders[0])   // pause again\n  return items\n}\n\nloadItems(1).then(items => console.log(items))\n// reads top-to-bottom; no nesting. Errors: wrap in try/catch.",
        output: "[ 'book', 'pen' ]",
      },
      {
        kind: 'callout',
        variant: 'warning',
        title: 'await pauses the FUNCTION, not the event loop',
        text:
          'await does not block the world. It suspends only the async ' +
          'function it sits in; the call stack unwinds and the loop keeps ' +
          'running timers, handlers, and other microtasks. When the awaited ' +
          'promise settles, the function resumes as a microtask. Blocking ' +
          'the loop still requires a sync while-loop.',
      },
      {
        kind: 'heading',
        text: 'Sequential vs parallel: do not await what can run together',
      },
      {
        kind: 'compare',
        languageIds: ['javascript', 'javascript'],
        caption:
          'Sequential (3s total) vs parallel (1s total) when each call takes 1s.',
        snippets: [
          "// SEQUENTIAL: 3s — each waits for the previous\nasync function slow() {\n  const a = await fetchA()  // 1s\n  const b = await fetchB()  // 1s\n  const c = await fetchC()  // 1s\n  return [a, b, c]\n}",
          "// PARALLEL: 1s — all start, await all together\nasync function fast() {\n  const [a, b, c] = await Promise.all([\n    fetchA(), fetchB(), fetchC()\n  ])\n  return [a, b, c]\n}",
        ],
      },
      {
        kind: 'callout',
        variant: 'info',
        title: 'Promise.all fails fast; Promise.allSettled does not',
        text:
          'Promise.all rejects as soon as ANY input rejects (and the others ' +
          'are still running but ignored). If you need every result ' +
          'regardless of failures, use Promise.allSettled, which never ' +
          'rejects and gives each result as {status, value} or {status, reason}.',
      },
      {
        kind: 'heading',
        text: 'Error handling: one path, not one per call',
      },
      {
        kind: 'codeWithOutput',
        languageId: 'javascript',
        caption: 'A try/catch around an await catches a rejection from any awaited call.',
        code: "async function save(doc) {\n  try {\n    await validate(doc)\n    await db.insert(doc)\n    await notify(doc.id)\n  } catch (err) {\n    // catches a rejection from validate, insert, OR notify\n    console.error('save failed:', err.message)\n  }\n}\n// Without try/catch, the async function returns a rejected promise;\n// the caller's .catch (or await in its own try/catch) must handle it.",
        output: 'save failed: network unreachable',
      },
    ],
    animation: {
      type: 'asyncFlow',
      title: 'Sequential await vs Promise.all',
      steps: [
        { caption: 'Sequential: start fetchA. await — function suspends. Loop free.' },
        { caption: 'fetchA settles (1s). Resume: a=A. Start fetchB. await. ... fetchB settles (1s). fetchC ... (1s). Total 3s.' },
        { caption: 'Parallel: start fetchA, fetchB, fetchC ALL at once (no await between).' },
        { caption: 'await Promise.all — suspend until all three settle.' },
        { caption: 'All three settle ~simultaneously (1s). Resume with [A,B,C]. Total 1s.' },
      ],
    },
    activity: {
      type: 'findBug',
      title: 'Find the bug',
      prompt:
        'The three fetches are independent, but this code runs for 3 seconds ' +
        'when it could take 1. What is the bug?',
      languageId: 'javascript',
      starterCode: "async function load() {\n  const a = await fetchA()\n  const b = await fetchB()\n  const c = await fetchC()\n  return [a, b, c]\n}",
      data: {
        buggyLine: 'const a = await fetchA()',
        explanation:
          'The three awaits serialize independent work. Start all three ' +
          'with Promise.all([fetchA(), fetchB(), fetchC()]) and await the ' +
          'array once, so they run concurrently and finish in ~1s not 3s.',
      },
      checks: [],
    },
    comprehensionChecks: [
      {
        question: 'What does `await` actually do inside an async function?',
        options: [
          'Blocks the entire event loop until the promise settles.',
          'Suspends the async function and returns control to the event loop; when the promise settles, the function resumes as a microtask.',
          'Starts a new thread to wait for the promise.',
          'Converts the promise into a synchronous value immediately.',
        ],
        correctIndex: 1,
        explanation:
          'await does not block the loop. It suspends the surrounding ' +
          'async function, unwinds the stack, and lets the loop keep ' +
          'working. When the awaited promise settles, the continuation ' +
          'is queued as a microtask and the function resumes with the ' +
          'resolved value.',
      },
      {
        question: 'You run Promise.all([p1, p2, p3]) and p2 rejects. What happens?',
        options: [
          'It waits for p1 and p3, then rejects with p2’s reason.',
          'It rejects immediately with p2’s reason; p1 and p3 keep running but their results are ignored.',
          'It resolves with [v1, undefined, v3].',
          'It throws a syntax error.',
        ],
        correctIndex: 1,
        explanation:
          'Promise.all is fail-fast: the first rejection rejects the ' +
          'composite promise immediately. The other promises are not ' +
          'cancelled (JS has no cancellation) but their results are ' +
          'discarded. Use Promise.allSettled if you need every outcome.',
      },
    ],
  },
]
