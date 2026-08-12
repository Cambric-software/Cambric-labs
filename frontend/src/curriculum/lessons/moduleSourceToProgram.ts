/**
 * Cambric Labs — Module: From Source to Program (Foundations)
 *
 * Two lessons: compiler vs interpreter, and packages and the runtime.
 */
import type { LessonDetail } from '../types'

export const sourceToProgramLessons: LessonDetail[] = [
  {
    id: 'lesson-compilers-vs-interpreters',
    title: 'Compilers vs Interpreters: Two Paths from Code to Running',
    moduleId: 'module-source-to-program',
    languageId: 'pseudo',
    difficulty: 2,
    estimatedMinutes: 10,
    summary:
      'A compiler translates source to machine code ahead of time; an ' +
      'interpreter reads and runs source line by line. Each has distinct ' +
      'speed, error, and distribution trade-offs.',
    teachesConceptIds: ['compilation', 'interpretation', 'runtime', 'instruction'],
    prerequisiteConceptIds: ['cpu', 'instruction', 'program'],
    objectives: [
      'Distinguish ahead-of-time compilation from interpretation.',
      'Explain the speed and error-timing trade-offs.',
      'Describe bytecode and the hybrid (compile-then-interpret) model.',
      'Choose a mental model for how Python, C, and Java each run.',
    ],
    content: [
      {
        kind: 'paragraph',
        text:
          'Source code is text for humans. The CPU runs machine instructions, ' +
          'not text. Something has to bridge that gap. A compiler translates ' +
          'the whole program to machine code first, then you run the result. ' +
          'An interpreter reads the source and executes it directly. The ' +
          'choice shapes speed, error timing, and how you distribute a ' +
          'program.',
      },
      {
        kind: 'heading',
        text: 'Compile: translate once, run fast',
      },
      {
        kind: 'steps',
        caption: 'The ahead-of-time compilation pipeline (C, Rust, Go).',
        steps: [
          'Write source code in a .c / .rs / .go file.',
          'Run the compiler, which produces a native executable (machine code).',
          'Run the executable directly on the CPU — no translation needed at run time.',
        ],
      },
      {
        kind: 'callout',
        variant: 'info',
        title: 'Compile errors surface before you run',
        text:
          'A compiler checks the whole program first. If you call a function ' +
          'that does not exist, the program never runs — the compiler ' +
          'refuses to emit an executable. You catch many bugs before ' +
          'execution, not during it.',
      },
      {
        kind: 'heading',
        text: 'Interpret: read and run line by line',
      },
      {
        kind: 'steps',
        caption: 'The interpretation model (Python, Ruby, JavaScript).',
        steps: [
          'Write source code in a .py / .rb / .js file.',
          'Start the interpreter, which reads the source and executes each statement directly.',
          'No separate machine-code file is produced — the interpreter IS the runner.',
        ],
      },
      {
        kind: 'callout',
        variant: 'warning',
        title: 'Runtime errors surface during execution',
        text:
          'An interpreter cannot catch every error before running — some only ' +
          'appear when the offending line executes. A typo on line 500 may ' +
          'not surface until the program reaches it. Faster to iterate, but ' +
          'errors arrive later in the cycle.',
      },
      {
        kind: 'heading',
        text: 'The hybrid: compile to bytecode, interpret that',
      },
      {
        kind: 'paragraph',
        text:
          'Many languages split the difference. Python compiles source to ' +
          'bytecode (a portable, lower-level form), then a virtual machine ' +
          'interprets the bytecode. Java is similar: compile to .class ' +
          'bytecode, run on the JVM. You get portability (the bytecode runs ' +
          'anywhere the VM exists) and some of the speed of compilation.',
      },
      {
        kind: 'codeWithOutput',
        languageId: 'bash',
        caption: 'Python bytecode lives in __pycache__ after import.',
        code: '# after running a Python module, you find:\nls __pycache__\n# module.cpython-312.pyc  <- compiled bytecode, not machine code',
        output: '# the .pyc is run by the CPython VM at execution',
      },
      {
        kind: 'heading',
        text: 'Speed and distribution trade-offs',
      },
      {
        kind: 'paragraph',
        text:
          'Compiled programs run faster (no translation at run time) but the ' +
          'executable is tied to a CPU architecture. Interpreted programs ' +
          'run anywhere the interpreter exists but slower. Hybrid bytecode ' +
          'is portable like interpretation and faster than line-by-line ' +
          'interpretation, at the cost of needing the VM installed.',
      },
      {
        kind: 'compare',
        languageIds: ['c', 'python'],
        caption:
          'C is ahead-of-time compiled to a native binary. Python is ' +
          'compiled to bytecode then interpreted by the CPython VM.',
        snippets: [
          '// $ gcc app.c -o app   (compile)\n// $ ./app              (run native binary)',
          '# $ python app.py        (compile to bytecode + interpret)',
        ],
      },
    ],
    animation: {
      type: 'timeline',
      title: 'Two routes from source to running',
      steps: [
        { caption: 'Source: print("hi")' },
        { caption: 'Compiled route: source -> compiler -> machine code -> run. Errors caught at compile step.' },
        { caption: 'Interpreted route: source -> interpreter reads line -> runs line -> next line. Errors caught at run time.' },
        { caption: 'Hybrid (Python/Java): source -> bytecode -> VM interprets bytecode. Portable + faster than raw interpretation.' },
      ],
    },
    activity: {
      type: 'matching',
      title: 'Match language to execution model',
      prompt: 'Match each language to its primary execution model.',
      languageId: 'pseudo',
      data: {
        left: ['C', 'Python', 'Java'],
        right: ['Bytecode + JVM (hybrid)', 'Ahead-of-time compiled to native', 'Bytecode + CPython VM (hybrid)'],
        correctPairs: [[0, 1], [1, 2], [2, 0]],
      },
      checks: [],
    },
    comprehensionChecks: [
      {
        question: 'What is a key advantage of ahead-of-time compilation over interpretation?',
        options: [
          'Programs are smaller.',
          'Many errors are caught before the program runs, and execution is faster (no run-time translation).',
          'No CPU is needed.',
          'Programs run anywhere.',
        ],
        correctIndex: 1,
        explanation:
          'A compiler checks the whole program and emits native code, so ' +
          'type and reference errors surface at compile time, and execution ' +
          'skips the translation overhead that interpreters pay each run.',
      },
      {
        question: 'Python is best described as which model?',
        options: [
          'Ahead-of-time compiled to native machine code.',
          'Pure line-by-line interpretation with no compilation.',
          'Hybrid: compiled to bytecode, then interpreted by a virtual machine.',
          'A hardware language.',
        ],
        correctIndex: 2,
        explanation:
          'Python compiles source to .pyc bytecode (you can see it in ' +
          '__pycache__), then the CPython VM interprets that bytecode. It ' +
          'is a hybrid, not pure interpretation.',
      },
    ],
  },

  {
    id: 'lesson-packages-and-runtime',
    title: 'Packages & Runtimes: How Code Is Shared and Run',
    moduleId: 'module-source-to-program',
    languageId: 'pseudo',
    difficulty: 2,
    estimatedMinutes: 10,
    summary:
      'A package is a distributable unit of reusable code. A runtime is ' +
      'the environment that executes your program. Both shape how code is ' +
      'shared and run in practice.',
    teachesConceptIds: ['package', 'runtime', 'module-system', 'compilation'],
    prerequisiteConceptIds: ['compilation', 'interpretation', 'module-system'],
    objectives: [
      'Describe what a package is and why we use package managers.',
      'Explain the role of a runtime (CPython, Node.js, JVM).',
      'Distinguish a library (a dependency) from your program.',
      'Reason about version conflicts and why a lockfile exists.',
    ],
    content: [
      {
        kind: 'paragraph',
        text:
          'You rarely write everything from scratch. A package is a ' +
          'distributable bundle of code someone else wrote — a date library, ' +
          'a web framework, a CSV parser. A package manager downloads and ' +
          'tracks those bundles so you can declare "I depend on X" and let ' +
          'the tool fetch it.',
      },
      {
        kind: 'heading',
        text: 'The package manager workflow',
      },
      {
        kind: 'steps',
        caption: 'A typical install/use cycle.',
        steps: [
          'Declare dependencies in a manifest (requirements.txt, package.json, Cargo.toml).',
          'Run the package manager (pip, npm, cargo) to download and install them into your project.',
          'Import the package in your code and call its functions.',
        ],
      },
      {
        kind: 'codeWithOutput',
        languageId: 'bash',
        caption: 'Install and use a package in Python.',
        code: 'pip install requests          # download the package\n# then in code:\n# import requests\n# r = requests.get("https://example.com")\n# print(r.status_code)',
        output: '# "requests" is now available to import; you did not write it',
      },
      {
        kind: 'callout',
        variant: 'info',
        title: 'A library is a dependency',
        text:
          'When you import a package, your program depends on it. "Dependency" ' +
          'is the technical word for "code my program needs but did not write." ' +
          'Managing dependencies — which versions, where they come from — is ' +
          'a real engineering task, not a chore.',
      },
      {
        kind: 'heading',
        text: 'The runtime: the environment that runs your code',
      },
      {
        kind: 'paragraph',
        text:
          'A runtime is the program that executes your program. CPython is ' +
          'the runtime for Python (it interprets the bytecode). Node.js is ' +
          'the runtime for JavaScript outside the browser. The JVM is the ' +
          'runtime for Java bytecode. The runtime provides memory, the ' +
          'standard library, and services like garbage collection.',
      },
      {
        kind: 'callout',
        variant: 'tip',
        title: 'Same language, different runtime',
        text:
          'Python has CPython (the reference), PyPy (faster, JIT-compiled), ' +
          'and others. JavaScript has V8 (Chrome, Node), SpiderMonkey ' +
          '(Firefox). The language is the same; the runtime decides speed ' +
          'and available APIs.',
      },
      {
        kind: 'heading',
        text: 'Version conflicts and the lockfile',
      },
      {
        kind: 'paragraph',
        text:
          'If package A needs library X v1 and package B needs X v2, you have ' +
          'a conflict. Package managers solve this by pinning versions: a ' +
          'lockfile (requirements.lock, package-lock.json, Cargo.lock) ' +
          'records the exact versions installed so every machine gets the ' +
          'same dependencies — preventing "works on my machine" drift.',
      },
      {
        kind: 'compare',
        languageIds: ['python', 'javascript'],
        caption:
          'Each ecosystem has its own package manager and registry, but the ' +
          'shape is identical.',
        snippets: [
          '# pip + PyPI\n# requirements.txt: requests==2.31.0\n# pip install -r requirements.txt',
          '// npm + npm registry\n// package.json: "requests": "^2.31.0"\n// npm install',
        ],
      },
    ],
    animation: {
      type: 'timeline',
      title: 'From dependency declaration to running code',
      steps: [
        { caption: 'Write requirements.txt: requests==2.31.0.' },
        { caption: 'pip install fetches requests (and its sub-dependencies) into the environment.' },
        { caption: 'A lockfile records the exact versions resolved.' },
        { caption: 'import requests in code; the runtime resolves the name to the installed package.' },
        { caption: 'Run under CPython: the runtime loads the package and executes your code.' },
      ],
    },
    activity: {
      type: 'multipleChoice',
      title: 'What problem does a lockfile solve?',
      prompt:
        'Why commit a lockfile (package-lock.json / Cargo.lock) to version ' +
        'control?',
      languageId: 'pseudo',
      data: {
        question: 'Why is a lockfile committed?',
        options: [
          'It makes the program faster.',
          'It records exact dependency versions so every machine installs the same ones, avoiding "works on my machine" drift.',
          'It is required to compile.',
          'It stores user passwords.',
        ],
        correctIndex: 1,
        explanation:
          'A lockfile pins exact versions. Without it, different machines ' +
          'resolve different versions and break unpredictably. With it, ' +
          'every install reproduces the same dependency tree.',
      },
      checks: [],
    },
    comprehensionChecks: [
      {
        question: 'What is a runtime?',
        options: [
          'A clock that times your program.',
          'The environment that executes your program and provides services like memory and the standard library.',
          'A type of compiler.',
          'A package format.',
        ],
        correctIndex: 1,
        explanation:
          'The runtime (CPython, Node, JVM) is what actually runs your code. ' +
          'It owns memory allocation, the standard library, and services like ' +
          'garbage collection. The language is a spec; the runtime makes it run.',
      },
      {
        question: 'When you `import requests`, what is "requests"?',
        options: [
          'A built-in keyword.',
          'A package — a distributable bundle of code your program depends on but did not write.',
          'A runtime.',
          'A compiler flag.',
        ],
        correctIndex: 1,
        explanation:
          'requests is a package (a dependency). You declared it, the package ' +
          'manager installed it, and the runtime resolves the import to that ' +
          'installed code.',
      },
    ],
  },
]
