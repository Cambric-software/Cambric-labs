/**
 * Cambric Labs — Module: Design Patterns (Software Engineering)
 *
 * Two lessons: the Gang of Four essentials (strategy, observer, decorator,
 * factory), and modern caution (patterns are tools, not goals — favor
 * composition over inheritance, avoid pattern-worship).
 */
import type { LessonDetail } from '../types'

export const designPatternsLessons: LessonDetail[] = [
  {
    id: 'lesson-essential-design-patterns',
    title: 'Essential Design Patterns: Strategy, Observer, Decorator, Factory',
    moduleId: 'module-design-patterns',
    languageId: 'typescript',
    difficulty: 4,
    estimatedMinutes: 13,
    summary:
      'A design pattern is a named, reusable solution to a recurring ' +
      'design problem. The handful that matter — strategy (swap behavior), ' +
      'observer (broadcast changes), decorator (add behavior without ' +
      'subclassing), factory (decouple construction) — appear constantly ' +
      'because they encode stable design tradeoffs.',
    teachesConceptIds: ['design-pattern', 'strategy-pattern', 'decorator', 'observer-pattern', 'factory-pattern'],
    prerequisiteConceptIds: ['function', 'object', 'interface', 'inheritance', 'composition'],
    objectives: [
      'Use strategy to swap an algorithm without changing callers.',
      'Use observer to broadcast changes to decoupled listeners.',
      'Use decorator to add behavior without deep inheritance.',
      'Use factory to decouple construction from use.',
    ],
    content: [
      {
        kind: 'paragraph',
        text:
          'A design pattern is not code you copy; it is a named solution ' +
          'to a problem that recurs across codebases. The names matter ' +
          'because they let a team say "use a strategy here" and be ' +
          'understood. The four patterns here — strategy, observer, ' +
          'decorator, factory — are the load-bearing few; learn them and ' +
          'you recognize 90% of the patterns in real code.',
      },
      {
        kind: 'heading',
        text: 'Strategy: swap the algorithm, keep the caller',
      },
      {
        kind: 'codeWithOutput',
        languageId: 'typescript',
        caption: 'Pass the behavior in; the caller never changes when the sort key changes.',
        code: "type Sorter = (a: number, b: number) => number\n\n// the behavior is injected, not hardcoded\nfunction sort(nums: number[], strategy: Sorter): number[] {\n  return [...nums].sort(strategy)\n}\n\nconst asc:  Sorter = (a, b) => a - b\nconst desc: Sorter = (a, b) => b - a\n\nconsole.log(sort([3, 1, 2], asc))\nconsole.log(sort([3, 1, 2], desc))",
        output: '[1, 2, 3]\n[3, 2, 1]',
      },
      {
        kind: 'callout',
        variant: 'info',
        title: 'Strategy replaces the switch',
        text:
          'Without strategy you write `if (mode === "asc") {...} else {...}` ' +
          'inside the sort, growing a branch per mode. Strategy moves each ' +
          'branch into a separate object and injects the right one, so the ' +
          'sort has zero branches and new modes add without touching it. ' +
          'Open-closed: open for extension, closed for modification.',
      },
      {
        kind: 'heading',
        text: 'Observer: broadcast changes to decoupled listeners',
      },
      {
        kind: 'code',
        languageId: 'typescript',
        caption: 'The subject notifies subscribed observers; they react without the subject knowing them.',
        code: "type Listener = (temp: number) => void\n\nclass WeatherStation {\n  private listeners: Listener[] = []\n  private temp = 0\n  subscribe(l: Listener) { this.listeners.push(l) }\n  setTemp(t: number) {\n    this.temp = t\n    for (const l of this.listeners) l(t)   // broadcast; subject knows nothing about listeners\n  }\n}\n\nconst station = new WeatherStation()\nstation.subscribe(t => console.log('Display:', t))\nstation.subscribe(t => console.log('Alert:', t > 30 ? 'HOT' : 'ok'))\nstation.setTemp(32)\n// Display: 32  /  Alert: HOT  -- both react, station stays decoupled",
      },
      {
        kind: 'callout',
        variant: 'tip',
        title: 'Observer = pub/sub at the object level',
        text:
          'The subject owns the state and notifies anonymous listeners; ' +
          'listeners react without the subject knowing who they are. This ' +
          'is how event systems (DOM events, message queues, React state) ' +
          'work: one source, many decoupled consumers. The pattern appears ' +
          'everywhere because decoupling producer from consumer is ' +
          'universally useful.',
      },
      {
        kind: 'heading',
        text: 'Decorator: add behavior without subclassing',
      },
      {
        kind: 'codeWithOutput',
        languageId: 'typescript',
        caption: 'Wrap a logger to add behavior; stack wrappers instead of building a class per combination.',
        code: "interface Logger { log(msg: string): void }\n\nclass PlainLogger implements Logger {\n  log(msg: string) { console.log(msg) }\n}\n\nclass TimestampDecorator implements Logger {\n  constructor(private inner: Logger) {}\n  log(msg: string) { this.inner.log(`[${new Date().toISOString()}] ${msg}`) }\n}\n\nclass UpperDecorator implements Logger {\n  constructor(private inner: Logger) {}\n  log(msg: string) { this.inner.log(msg.toUpperCase()) }\n}\n\n// compose: timestamp + upper, any order, no class per combo\nconst logger = new UpperDecorator(new TimestampDecorator(new PlainLogger()))\nlogger.log('hello')",
        output: '[2026-01-01T00:00:00.000Z] HELLO',
      },
      {
        kind: 'callout',
        variant: 'warning',
        title: 'Decorator beats deep inheritance',
        text:
          'Without decorator you subclass for every combination: ' +
          'TimestampLogger, UpperLogger, UpperTimestampLogger, ' +
          'TimestampUpperLogger — factorial explosion. Decorator wraps the ' +
          'same interface and stacks, so you compose one object per ' +
          'combination at runtime with no new classes.',
      },
      {
        kind: 'heading',
        text: 'Factory: decouple construction from use',
      },
      {
        kind: 'code',
        languageId: 'typescript',
        caption: 'A factory builds the right concrete type; callers depend on the abstraction, not the class.',
        code: "interface Button { render(): string }\nclass WebButton implements Button { render() { return '<button>' } }\nclass MobileButton implements Button { render() { return '<input type=button>' } }\n\n// the factory knows the platform; callers do not\nfunction makeButton(platform: 'web' | 'mobile'): Button {\n  return platform === 'web' ? new WebButton() : new MobileButton()\n}\n\n// caller depends on Button (the interface), not on WebButton/MobileButton\nconst btn = makeButton('mobile')\nconsole.log(btn.render())   // <input type=button>\n// adding a third platform only changes the factory; callers are untouched",
      },
      {
        kind: 'compare',
        languageIds: ['typescript', 'typescript'],
        caption:
          'Hardcoded switch (closed) vs strategy (open: add a strategy without touching the caller).',
        snippets: [
          "function sort(nums, mode) {\n  if (mode === 'asc')  return [...nums].sort((a,b)=>a-b)\n  if (mode === 'desc') return [...nums].sort((a,b)=>b-a)\n  // each new mode adds a branch here -> caller changes",
          "function sort(nums, strategy) { return [...nums].sort(strategy) }\n// new mode = new strategy fn, no change to sort -> open-closed",
        ],
      },
    ],
    animation: {
      type: 'dataFlow',
      title: 'Decorator: stacking wrappers, no class explosion',
      steps: [
        { caption: 'PlainLogger.log("hi") -> console: hi.' },
        { caption: 'Wrap in TimestampDecorator: it adds a timestamp, then calls PlainLogger.log. Output: [time] hi.' },
        { caption: 'Wrap that in UpperDecorator: it uppercases, then calls TimestampDecorator. Output: [time] HI.' },
        { caption: 'Without decorator: to get "uppercase + timestamp" you would build a class UpperTimestampLogger; and TimestampUpperLogger for the other order. n! classes.' },
        { caption: 'With decorator: stack wrappers at runtime; any order, any combination, zero new classes. Composition over inheritance.' },
      ],
    },
    activity: {
      type: 'multipleChoice',
      title: 'Which pattern?',
      prompt:
        'You have a payment system that must support credit card, PayPal, ' +
        'and crypto, chosen per transaction. Which pattern keeps the ' +
        'checkout code free of payment-specific branches?',
      languageId: 'typescript',
      data: {
        question: 'Which pattern decouples the payment method?',
        options: [
          'Observer.',
          'Strategy: each payment method is a strategy object with a pay() method; the checkout calls pay() without knowing which, so adding a method adds a strategy, not a branch.',
          'Decorator.',
          'Factory only.',
        ],
        correctIndex: 1,
        explanation:
          'Strategy is built for "swap the algorithm without changing ' +
          'the caller." Each payment method becomes a strategy (card, ' +
          'paypal, crypto) implementing pay(); checkout holds whichever ' +
          'was chosen and calls pay() uniformly. Adding a method adds a ' +
          'new strategy class — no checkout branch is touched. ' +
          'Open-closed at the call site.',
      },
      checks: [],
    },
    comprehensionChecks: [
      {
        question: 'How does the strategy pattern satisfy the open-closed principle?',
        options: [
          'It deletes old code.',
          'New behaviors are added as new strategy objects injected into a caller that never changes, so the caller is open to extension (new strategies) but closed to modification (no new branches).',
          'It uses fewer imports.',
          'It makes code run faster.',
        ],
        correctIndex: 1,
        explanation:
          'Without strategy, each new behavior adds a branch in the ' +
          'caller — modifying closed code. Strategy moves each behavior ' +
          'into its own object and injects the right one, so the caller ' +
          'has zero branches and stays unchanged when a new behavior is ' +
          'added. That is open-closed: extend by adding, not by editing.',
      },
      {
        question: 'Why does decorator beat inheritance for combining behaviors like "timestamp" and "uppercase"?',
        options: [
          'Inheritance is slower.',
          'Inheritance produces a factorial explosion of classes (one per ordering and combination); decorator wraps the same interface and stacks at runtime, composing any combination of behaviors with zero new classes.',
          'Decorators cannot use inheritance.',
          'Inheritance is deprecated.',
        ],
        correctIndex: 1,
        explanation:
          'Two behaviors in two orders = 4 subclasses; three behaviors ' +
          'in any order = many more. Inheritance models combos as classes, ' +
          'exploding combinatorially. Decorator models each behavior as a ' +
          'wrapper over the shared interface, so you stack them at runtime ' +
          'in any order — composition over inheritance, one class per ' +
          'behavior, infinite combinations.',
      },
    ],
  },
  {
    id: 'lesson-patterns-as-tools',
    title: 'Patterns Are Tools, Not Goals: Composition Over Inheritance',
    moduleId: 'module-design-patterns',
    languageId: 'typescript',
    difficulty: 4,
    estimatedMinutes: 11,
    summary:
      'Patterns are vocabulary, not architecture. Applying a pattern ' +
      'where it does not fit makes code worse, not better — pattern-' +
      'worship produces AbstractSingletonFactories. Use patterns to ' +
      'solve a real problem, favor composition over inheritance, and ' +
      'reach for a pattern only when the problem it names actually ' +
      'appears.',
    teachesConceptIds: ['design-pattern', 'composition', 'inheritance', 'interface', 'refactoring'],
    prerequisiteConceptIds: ['design-pattern', 'strategy-pattern', 'decorator', 'function', 'object'],
    objectives: [
      'Recognize when a pattern is over-applied.',
      'Prefer composition (has-a) over inheritance (is-a) for behavior reuse.',
      'Identify pattern-worship (AbstractSingletonFactory) as an anti-pattern.',
      'Reach for a pattern only when its named problem is present.',
    ],
    content: [
      {
        kind: 'paragraph',
        text:
          'Knowing the patterns is useful; applying them everywhere is ' +
          'harmful. A pattern is a named solution to a named problem — ' +
          'it pays for itself only when that problem is actually present. ' +
          'Pattern-worship, applying patterns because they sound ' +
          'sophisticated, produces the AbstractSingletonFactory mockery: ' +
          'code that is "correct" by pattern-book standards and impossible ' +
          'to read or change.',
      },
      {
        kind: 'heading',
        text: 'Apply a pattern when the problem is present',
      },
      {
        kind: 'compare',
        languageIds: ['typescript', 'typescript'],
        caption:
          'Premature strategy (one implementation, branchy) vs the problem actually appearing.',
        snippets: [
          "// over-engineered: ONE discount rule, but a strategy + factory + registry\n// the indirection earns nothing; you still only ever have one strategy\nclass DiscountStrategy { apply(p) { return p * 0.9 } }",
          "// the problem appears: now you need member, seasonal, and clearance\n// each is a real algorithm, chosen per order -> strategy earns its keep\nconst strategies = { member: p=>p*0.85, seasonal: p=>p*0.9, clearance: p=>p*0.7 }",
        ],
      },
      {
        kind: 'callout',
        variant: 'warning',
        title: 'Do not reach for a pattern to look smart',
        text:
          'A strategy with one implementation is a function. A factory ' +
          'that always returns one type is a constructor. An observer with ' +
          'one listener is a direct call. The pattern earns its name only ' +
          'when the second implementation, type, or listener appears — or ' +
          'you can foresee it. Otherwise the indirection is dead weight ' +
          'future readers must decode.',
      },
      {
        kind: 'heading',
        text: 'Favor composition over inheritance',
      },
      {
        kind: 'paragraph',
        text:
          'Inheritance (is-a) is rigid: a subclass is locked to one parent ' +
          'forever, and behavior changes require editing up the chain. ' +
          'Composition (has-a) is flexible: an object holds the behaviors ' +
          'it needs and delegates, swapping them at runtime. Modern design ' +
          'reaches for composition first, inheritance rarely, because ' +
          'flexibility beats taxonomy.',
      },
      {
        kind: 'compare',
        languageIds: ['typescript', 'typescript'],
        caption:
          'Inheritance (rigid taxonomy) vs composition (flexible delegation).',
        snippets: [
          "// inheritance: a Duck is a Bird is an Animal; behaviors locked up the chain\nclass FlyingDuck extends Duck { fly() {} }   // what about rubber ducks?\nclass RubberDuck extends Duck { /* cannot fly, inherits it anyway -> wrong */ }",
          "// composition: a Duck HAS behaviors it is given; swap any at runtime\nclass Duck {\n  constructor(private fly: FlyBehavior, private quack: QuackBehavior) {}\n  doFly() { this.fly() }   // rubber duck gets a NoFly behavior injected\n}",
        ],
      },
      {
        kind: 'callout',
        variant: 'tip',
        title: 'Compose small behaviors; inject the ones you need',
        text:
          'The classic "SimUDuck" exercise: ducks that fly and quack. ' +
          'Inheritance forces every duck to inherit fly (wrong for rubber ' +
          'ducks) and quack (wrong for mute ducks). Composition gives each ' +
          'duck the fly and quack behaviors it actually needs, injected — ' +
          'rubber duck gets NoFly and Squeak. No wrong inheritance; the ' +
          'behaviors are pluggable.',
      },
      {
        kind: 'heading',
        text: 'The AbstractSingletonFactory anti-pattern',
      },
      {
        kind: 'code',
        languageId: 'typescript',
        caption: 'Pattern-worship: applying patterns that earn nothing.',
        code: "// one logger, but wrapped in a factory of a registry of a strategy of a singleton\nabstract class AbstractLoggerFactoryProviderRegistrySingleton {\n  abstract create(): Logger\n}\n// why? there is only ever one logger; the indirection names patterns but solves no problem\n// a reader must now untangle four layers to find console.log\n\n// the cure: delete the layers, keep the plain object\nclass Logger { log(m: string) { console.log(m) } }",
      },
      {
        kind: 'callout',
        variant: 'danger',
        title: 'Names should reveal intent, not hide it',
        text:
          'When pattern names obscure what code does — when a reader ' +
          'cannot tell from the structure whether the indirection earns ' +
          'its keep — the pattern has become the problem. The test: if ' +
          'you deleted the pattern layer and the code still worked and ' +
          'was clearer, the layer was pattern-worship. Delete it.',
      },
      {
        kind: 'heading',
        text: 'When patterns pay off',
      },
      {
        kind: 'steps',
        caption: 'Reach for a pattern when these are true',
        steps: [
          'The named problem is actually present (multiple algorithms, many listeners, behaviors to combine).',
          'You can foresee a second instance arriving (a second payment method, a second observer).',
          'The indirection is earning its keep — readers understand the pattern name and it clarifies intent.',
          'You have tried the simpler version (a function, a direct call) and felt the pain the pattern removes.',
        ],
      },
      {
        kind: 'compare',
        languageIds: ['typescript', 'typescript'],
        caption:
          'Pattern-worship (layers earning nothing) vs a plain object (clear).',
        snippets: [
          "abstract class AbstractLoggerFactoryProviderRegistrySingleton {\n  abstract create(): Logger  // four layers, one logger",
          "class Logger { log(m: string) { console.log(m) } }  // one layer, same behavior",
        ],
      },
    ],
    animation: {
      type: 'timeline',
      title: 'Composition over inheritance: the SimUDuck lesson',
      steps: [
        { caption: 'Inheritance: Duck extends Bird. FlyingDuck extends Duck and gets fly(). RubberDuck extends Duck and INHERITS fly() — but rubber ducks cannot fly. Wrong behavior, forced by the taxonomy.' },
        { caption: 'Patch: override fly() in RubberDuck to throw. Now the hierarchy is full of "does not apply" overrides — a smell.' },
        { caption: 'Composition: Duck HAS a FlyBehavior and a QuackBehavior, injected. It delegates: doFly() calls this.fly().' },
        { caption: 'RubberDuck gets NoFly and Squeak injected. FlyingDuck gets FlyWithWings and Quack. Each duck has the behaviors it actually needs.' },
        { caption: 'Behaviors are pluggable at runtime: a duck can be given a different fly mid-life. No rigid taxonomy, no wrong inheritance. Flexibility beats is-a.' },
      ],
    },
    activity: {
      type: 'multipleChoice',
      title: 'Pattern-worship or justified?',
      prompt:
        'You have one report generator. A teammate proposes ' +
        'AbstractReportFactorySingletonRegistryStrategy. What should you do?',
      languageId: 'typescript',
      data: {
        question: 'Is the pattern justified?',
        options: [
          'Yes; patterns are always good.',
          'No — with one implementation, the layers earn nothing. Use a plain function/class; reach for factory/strategy when a second report type actually appears or is clearly foreseeable.',
          'Yes; it shows seniority.',
          'No; patterns are bad.',
        ],
        correctIndex: 1,
        explanation:
          'A pattern earns its name only when its named problem appears. ' +
          'One report = no factory (just construct it), no strategy (just ' +
          'the algorithm), no registry (one thing to look up). The layers ' +
          'are dead weight future readers must untangle. Use the plain ' +
          'object now; refactor into a pattern when the second report ' +
          'arrives and the indirection starts paying.',
      },
      checks: [],
    },
    comprehensionChecks: [
      {
        question: 'Why is composition (has-a) generally preferred over inheritance (is-a) for reusing behavior?',
        options: [
          'Inheritance is slower.',
          'Inheritance locks a class to one parent forever and forces behavior changes up the chain; composition lets an object hold and delegate to pluggable behaviors, swappable at runtime without editing a hierarchy.',
          'Composition uses less memory.',
          'Inheritance is deprecated.',
        ],
        correctIndex: 1,
        explanation:
          'Inheritance is a rigid taxonomy: a Duck IS-A Bird forever, ' +
          'and adding a behavior means editing the chain or overriding ' +
          'in every subclass that should not have it. Composition is ' +
          'flexible: a Duck HAS-A FlyBehavior it delegates to, swappable ' +
          'per instance and at runtime. You compose exactly the behaviors ' +
          'you need without forcing them through a hierarchy.',
      },
      {
        question: 'When is a pattern actually justified rather than pattern-worship?',
        options: [
          'When it sounds sophisticated.',
          'When the named problem the pattern solves is actually present (or clearly foreseeable), and the indirection earns its keep by making the code clearer to readers.',
          'When the team knows the pattern name.',
          'Always, for completeness.',
        ],
        correctIndex: 1,
        explanation:
          'A pattern is a named solution to a named problem. It is ' +
          'justified when that problem is present — multiple algorithms ' +
          '(strategy), many decoupled listeners (observer), behaviors to ' +
          'combine (decorator), construction to decouple (factory). With ' +
          'one instance of the thing, the pattern is dead weight; the test ' +
          'is whether deleting the layer leaves clearer code that still works.',
      },
    ],
  },
]
