/**
 * Cambric Labs — Module: Type Systems (Programming Languages track)
 *
 * Two lessons comparing how languages handle types: static vs dynamic
 * (when are type errors caught — compile time or runtime?), and strong vs
 * weak (how much implicit conversion happens?). Uses real code in Python,
 * JavaScript, Java, TypeScript, Rust, and C to build transferable insight.
 */
import type { LessonDetail } from '../types'

export const typeSystemsLessons: LessonDetail[] = [
  {
    id: 'lesson-static-vs-dynamic-typing',
    title: 'Static vs Dynamic Typing: When Is a Type Error Caught?',
    moduleId: 'module-type-systems',
    languageId: 'typescript',
    difficulty: 3,
    estimatedMinutes: 13,
    summary:
      'Static typing checks types before the program runs (compile time); ' +
      'dynamic typing checks them while running (runtime). The choice is a ' +
      'tradeoff: static catches bugs early and enables tooling, dynamic ' +
      'allows flexibility and faster iteration. Understanding both makes you ' +
      'fluent in either.',
    teachesConceptIds: ['type-system', 'static-typing', 'dynamic-typing', 'type-inference', 'type-error'],
    prerequisiteConceptIds: ['variable', 'type', 'function', 'parameter'],
    objectives: [
      'Distinguish static typing (checked before running) from dynamic typing (checked while running).',
      'Explain how type inference (Rust, TypeScript, modern Java) blurs the line.',
      'Describe the tradeoff: early bug detection vs flexibility.',
      'Predict which kind of type error a static vs dynamic language produces.',
    ],
    content: [
      {
        kind: 'paragraph',
        text:
          'Every value has a type — string, number, list. The question a language ' +
          'designer answers is: WHEN do we check that types are used correctly? ' +
          'A statically-typed language checks before the program runs (during ' +
          'compilation); a dynamically-typed language checks while the program runs. ' +
          'This single design choice shapes how you write code, what tooling you get, ' +
          'and which bugs you can catch early.',
      },
      {
        kind: 'heading',
        text: 'Dynamic typing: check at runtime (Python, JavaScript)',
      },
      {
        kind: 'codeWithOutput',
        languageId: 'python',
        caption: 'Python does not check types until the line runs. A type error hides until execution reaches it.',
        code: 'def greet(name):\n    return "Hello, " + name\n\ngreet("Alice")   # works: "Hello, Alice"\ngreet(42)        # TypeError at RUNTIME: cannot concatenate str and int',
        output: "Hello, Alice\nTypeError: can only concatenate str (not \"int\") to str",
      },
      {
        kind: 'callout',
        variant: 'warning',
        title: 'Dynamic errors hide in unrun code',
        text:
          'In Python, the `greet(42)` error only fires if that line actually ' +
          'executes. If it sits in a rarely-run error path, the bug ships to ' +
          'production and crashes the first time a user triggers it. You cannot ' +
          'know the program is type-safe without running every line — which is ' +
          'impossible in practice. This is the core cost of dynamic typing.',
      },
      {
        kind: 'heading',
        text: 'Static typing: check at compile time (Java, Rust, TypeScript)',
      },
      {
        kind: 'compare',
        languageIds: ['typescript', 'java'],
        caption: 'TypeScript and Java reject the wrong-type argument before the program runs.',
        snippets: [
          "function greet(name: string): string {\n  return 'Hello, ' + name;\n}\ngreet('Alice');  // OK\ngreet(42);       // ERROR before running:\n                 // Argument of type 'number' is not\n                 // assignable to parameter of type 'string'.",
          "String greet(String name) {\n  return \"Hello, \" + name;\n}\ngreet(\"Alice\");  // OK\ngreet(42);       // ERROR: incompatible types:\n                 // int cannot be converted to String",
        ],
      },
      {
        kind: 'callout',
        variant: 'success',
        title: 'Static typing catches the error before you run',
        text:
          'The compiler sees `greet(42)` and refuses to produce a runnable program. ' +
          'The bug cannot ship, because the code never runs. This is the core ' +
          'benefit of static typing: a whole class of bugs (wrong-type arguments, ' +
          'missing fields, typos in method names) is eliminated at compile time, ' +
          'even in code paths that never execute during testing.',
      },
      {
        kind: 'heading',
        text: 'Type inference: static typing without the boilerplate',
      },
      {
        kind: 'compare',
        languageIds: ['rust', 'typescript'],
        caption: 'Modern statically-typed languages infer the type — you rarely write it.',
        snippets: [
          "// Rust is statically typed, but infers types.\nlet x = 5;          // type inferred as i32\nlet name = \"Alice\";  // type inferred as &str\n// x = \"string\";    // ERROR: mismatched types (i32 vs &str)",
          "// TypeScript infers from the literal.\nlet x = 5;           // type inferred as number\nlet name = \"Alice\";  // type inferred as string\n// x = \"string\";   // ERROR: Type 'string' is not\n                    // assignable to type 'number'.",
        ],
      },
      {
        kind: 'paragraph',
        text:
          'The old criticism of static typing — "you write the type twice, once ' +
          'in the code and once in the annotation" — is obsolete. Modern languages ' +
          '(Rust, TypeScript, Haskell, modern Java with `var`) infer the type from ' +
          'how you use the value. You get compile-time safety without writing ' +
          'types everywhere. The type checker proves correctness; you write less.',
      },
      {
        kind: 'heading',
        text: 'The tradeoff: safety vs flexibility',
      },
      {
        kind: 'compare',
        languageIds: ['python', 'rust'],
        caption: 'Dynamic (Python) is flexible and fast to prototype; static (Rust) is safe and fast to run.',
        snippets: [
          "# Python: no annotations needed, prototype instantly.\n# A dict can hold any types; a function can take anything.\ndef process(data):\n    return data.get('key', 0) * 2   # works for any dict-like\n\n# BUT: the wrong kind of data crashes at runtime,\n# and refactoring is scary — the type checker cannot\n# tell you everywhere a field is used.",
          "// Rust: types proven safe, refactor fearlessly.\n// The compiler tells you every call site that breaks.\nstruct Config { key: i32 }\nfn process(c: &Config) -> i32 { c.key * 2 }\n\n// BUT: more upfront thought about shapes,\n// and some flexible patterns need generics or traits.",
        ],
      },
      {
        kind: 'callout',
        variant: 'info',
        title: 'Neither is universally better',
        text:
          'Dynamic typing shines for prototyping, scripts, glue code, and domains ' +
          'where shapes change fast. Static typing shines for large codebases, ' +
          'refactoring, public APIs, and teams where the person reading the code is ' +
          'not the person who wrote it. Most modern languages let you mix: Python and ' +
          'JavaScript have optional type annotations (mypy, TypeScript); Rust and Java ' +
          'infer types to cut boilerplate. The real skill is understanding both.',
      },
    ],
    animation: {
      type: 'compare',
      title: 'When is the type error caught?',
      steps: [
        { caption: 'Dynamic (Python): you write `greet(42)`. The program starts. The correct lines run fine.', payload: { side: 'left', sideLabel: 'Dynamic (Python)' } },
        { caption: 'Execution reaches `greet(42)`. Python tries to concatenate "Hello, " + 42. TypeError — the program crashes, in production, the first time this path runs.', payload: { side: 'left', sideLabel: 'Dynamic (Python)' } },
        { caption: 'Static (TypeScript): you write `greet(42)`. The compiler checks every call against the declared type BEFORE producing a runnable program.', payload: { side: 'right', sideLabel: 'Static (TypeScript)' } },
        { caption: 'The compiler sees `greet(42)` but `name: string`. It refuses to emit JavaScript. The bug cannot ship — even if the line is in untested code — because the program never existed with the bug in it.', payload: { side: 'right', sideLabel: 'Static (TypeScript)' } },
        { caption: 'Same logic error, opposite outcomes. Static typing trades upfront annotation for the guarantee that a whole class of runtime type errors is impossible.', payload: { side: 'both' } },
      ],
    },
    activity: {
      type: 'multipleChoice',
      title: 'Static vs dynamic: where is the error caught?',
      prompt:
        'A Python program has a line `result = user.age + " years"` where age ' +
        'is an int. The line is in an error-handling branch that only runs when ' +
        'a network call fails. When is this bug caught?',
      languageId: 'python',
      data: {
        question: 'When does the type error surface?',
        options: [
          'At compile time, before the program runs.',
          'At runtime, only when the network fails and that branch executes — it could hide for weeks in production until a user triggers it.',
          'Immediately when the program starts.',
          'Never — Python silently converts.',
        ],
        correctIndex: 1,
        explanation:
          'Python is dynamically typed: type checks happen at runtime, at the ' +
          'moment each line executes. If the buggy line sits in an error path ' +
          'that never runs during testing, the bug ships to production and ' +
          'crashes the first time a user hits a network failure. This is the ' +
          'core cost of dynamic typing — you cannot prove type safety without ' +
          'running every line, which is impossible. A statically-typed language ' +
          'would reject the `int + str` at compile time, even in unrun code.',
      },
      checks: [],
    },
    comprehensionChecks: [
      {
        question: 'How does type inference change the static-vs-dynamic tradeoff?',
        options: [
          'It makes static typing dynamic.',
          'It removes the main cost of static typing (verbose annotations) by inferring types from usage, so you get compile-time safety with little boilerplate — blurring the line between static and dynamic ergonomics.',
          'It makes dynamic typing static.',
          'It disables the type checker.',
        ],
        correctIndex: 1,
        explanation:
          'The historical complaint about static typing was annotation burden: ' +
          'writing `int x = 5` instead of `x = 5`. Type inference (Rust, ' +
          'TypeScript, modern Java `var`, Haskell) deduces the type from the ' +
          'literal or usage, so `let x = 5` is proven `i32` without you writing ' +
          'it. You keep compile-time safety and lose most of the verbosity, ' +
          'narrowing the ergonomics gap with dynamic languages.',
      },
      {
        question: 'Which kind of type error is ONLY possible to catch with static typing (not dynamic)?',
        options: [
          'A wrong-type argument in a line that runs during every test.',
          'A wrong-type argument in a code path that never executes during testing — a type error hidden in dead or rare code.',
          'A null pointer dereference.',
          'A division by zero.',
        ],
        correctIndex: 1,
        explanation:
          'Dynamic typing checks at runtime, so it only catches type errors in ' +
          'code that actually executes. A type error in an untested branch (a ' +
          'rare error path, a feature behind a flag) ships silently and crashes ' +
          'the first user to hit it. Static typing checks every line against the ' +
          'declared types at compile time, so even unrun code is type-checked. ' +
          'This is why static typing catches bugs that dynamic typing cannot.',
      },
    ],
  },
  {
    id: 'lesson-strong-vs-weak-typing',
    title: 'Strong vs Weak Typing: How Much Implicit Conversion Happens?',
    moduleId: 'module-type-systems',
    languageId: 'javascript',
    difficulty: 3,
    estimatedMinutes: 12,
    summary:
      'Strong vs weak typing is a separate axis from static vs dynamic. It ' +
      'measures how much the language silently converts between types for you. ' +
      'Weak typing (JavaScript, C) converts automatically, sometimes producing ' +
      'surprising results; strong typing (Python, Rust) refuses, forcing you ' +
      'to be explicit. Understanding this prevents the most confusing bugs.',
    teachesConceptIds: ['type-system', 'strong-typing', 'weak-typing', 'type-coercion', 'type-error'],
    prerequisiteConceptIds: ['type-system', 'static-typing', 'dynamic-typing', 'variable', 'type'],
    objectives: [
      'Separate the strong/weak axis from the static/dynamic axis.',
      'Recognize JavaScript coercion footguns ("1" + 1, [] + {})',
      'Explain why strong typing refuses implicit conversion.',
      'Predict which languages coerce and which refuse.',
    ],
    content: [
      {
        kind: 'paragraph',
        text:
          'Strong vs weak typing is NOT the same as static vs dynamic. Static/' +
          'dynamic is about WHEN types are checked. Strong/weak is about HOW MUCH ' +
          'the language silently converts between types for you. A strongly-typed ' +
          'language (Python, Rust) refuses to mix incompatible types and errors. ' +
          'A weakly-typed language (JavaScript, C) silently converts one to the ' +
          'other, sometimes producing results that surprise everyone.',
      },
      {
        kind: 'heading',
        text: 'JavaScript: weak typing produces famous surprises',
      },
      {
        kind: 'codeWithOutput',
        languageId: 'javascript',
        caption: 'JavaScript silently converts types, producing results no one expects.',
        code: "console.log('1' + 1);    // '11'  — number 1 coerced to string\nconsole.log('1' - 1);    // 0     — string '1' coerced to number\nconsole.log([] + {});    // '[object Object]'\nconsole.log(true + 1);   // 2     — true coerced to 1\nconsole.log(null + 1);   // 1     — null coerced to 0",
        output: '11\n0\n[object Object]\n2\n1',
      },
      {
        kind: 'callout',
        variant: 'warning',
        title: 'Why "1" + 1 is "11" but "1" - 1 is 0',
        text:
          'The `+` operator is overloaded: if either operand is a string, JS ' +
          'converts the other to a string and concatenates ("1" + 1 → "1" + "1" ' +
          '→ "11"). But `-` has no string meaning, so JS converts both to numbers ' +
          '("1" - 1 → 1 - 1 → 0). The same value "1" acts as text or a number ' +
          'depending on the operator. This is weak typing: the language silently ' +
          'picks a conversion, and the result depends on rules most programmers ' +
          'never fully learn.',
      },
      {
        kind: 'heading',
        text: 'Python: strong typing refuses to convert',
      },
      {
        kind: 'codeWithOutput',
        languageId: 'python',
        caption: 'Python is dynamically typed but STRONGLY typed — it refuses to silently convert string to int.',
        code: "print('1' + 1)   # TypeError: can only concatenate str (not \"int\") to str\nprint(1 + True) # 2 — bool is a subtype of int, documented",
        output: 'TypeError: can only concatenate str (not "int") to str',
      },
      {
        kind: 'paragraph',
        text:
          'Python is dynamically typed (no compile-time checks) but strongly typed: ' +
          'it refuses to silently convert a string to a number for `+`. You must ' +
          'convert explicitly (`int("1") + 1`). This proves the two axes are ' +
          'independent: a language can be dynamic+strong (Python), dynamic+weak ' +
          '(JavaScript), static+strong (Rust), or static+weak (C).',
      },
      {
        kind: 'heading',
        text: 'The two independent axes',
      },
      {
        kind: 'compare',
        languageIds: ['python', 'javascript'],
        caption: 'Python (dynamic + strong) vs JavaScript (dynamic + weak). Both check types at runtime; only Python refuses to coerce.',
        snippets: [
          "# DYNAMIC + STRONG (Python):\n# types checked at runtime, but NO silent conversion.\n'1' + 1    # TypeError (refuses to coerce)\n# You must be explicit: int('1') + 1  == 2",
          "// DYNAMIC + WEAK (JavaScript):\n// types checked at runtime, WITH silent conversion.\n'1' + 1    // '11' (number coerced to string)\n'1' - 1    // 0 (string coerced to number)",
        ],
      },
      {
        kind: 'heading',
        text: 'C: static + weak — the dangerous combination',
      },
      {
        kind: 'codeWithOutput',
        languageId: 'c',
        caption: 'C is statically typed but weakly typed: it checks types at compile time, then silently converts in ways that lose data.',
        code: '#include <stdio.h>\nint main() {\n    int i = 100000;\n    short s = i;       // silent truncation, no error\n    printf("%d\\n", s); // -31072 on most systems\n    return 0;\n}',
        output: '-31072',
      },
      {
        kind: 'callout',
        variant: 'danger',
        title: 'Static + weak is not always safe',
        text:
          'C is statically typed (the compiler knows `i` is int and `s` is short), ' +
          'but weakly typed: it silently converts the int to a short, truncating ' +
          'the value with no error. 100000 becomes -31072 because it overflows the ' +
          'short\'s range. Static typing did NOT prevent the bug, because the ' +
          'language still allows silent conversion. This is why "static" and ' +
          '"strong" must be evaluated separately — Rust is static+strong and ' +
          'rejects this with a type error; C is static+weak and allows it.',
      },
      {
        kind: 'heading',
        text: 'Why strong typing matters: fewer surprises',
      },
      {
        kind: 'paragraph',
        text:
          'Strong typing is about predictability. When `+` means one thing for ' +
          'strings and another for numbers, and the language silently picks, you ' +
          'must memorize coercion rules to predict your own code. When the language ' +
          'refuses and forces you to convert explicitly, the code does exactly what ' +
          'it says. The cost is a few explicit conversions (`Number(x)`, `int(x)`); ' +
          'the benefit is that bugs from silent conversion (a user-supplied string ' +
          'becoming a number in arithmetic) become impossible.',
      },
    ],
    animation: {
      type: 'compare',
      title: 'Same expression, different outcomes',
      steps: [
        { caption: 'JavaScript (weak): "1" + 1. The + operator sees a string, coerces the number 1 to string "1", concatenates. Result: "11" — a string, not a number.', payload: { side: 'left', sideLabel: 'Weak (JS)' } },
        { caption: 'Python (strong): "1" + 1. Python refuses to convert string to int silently. TypeError — the program stops, forcing you to write int("1") + 1 explicitly.', payload: { side: 'right', sideLabel: 'Strong (Python)' } },
        { caption: 'C (static + weak): short s = 100000. The compiler knows the types, but silently truncates 100000 to fit a short. No error; the value silently corrupts to -31072. The bug is invisible.', payload: { side: 'left', sideLabel: 'Static + Weak (C)' } },
        { caption: 'Rust (static + strong): let s: i16 = 100000; The compiler refuses: "literal out of range for i16". The bug is impossible — the code does not compile.', payload: { side: 'right', sideLabel: 'Static + Strong (Rust)' } },
        { caption: 'The lesson: strong typing refuses silent conversion, making behavior predictable. Weak typing silently picks a conversion, and the result depends on rules you must memorize. Static vs dynamic is when; strong vs weak is how much the language silently rewrites your values.', payload: { side: 'both' } },
      ],
    },
    activity: {
      type: 'predictOutput',
      title: 'Predict the coercion result',
      prompt: 'What does this JavaScript expression evaluate to, and why?',
      languageId: 'javascript',
      data: {
        prompt: 'console.log("3" + 4 - "2")',
        starterCode: 'console.log("3" + 4 - "2")',
        expectedOutput: '32',
        checks: [
          { type: 'outputEquals', value: '32' },
        ],
        explanation:
          '"3" + 4 → "34" (the + sees a string, coerces 4 to "4", concatenates). ' +
          'Then "34" - "2" → 32 (the - has no string meaning, so both coerce to ' +
          'numbers: 34 - 2). The result is the number 32. Notice the SAME operator ' +
          '(+) coerced in one direction and (-) in another. This unpredictability ' +
          'is the cost of weak typing — use Number() to be explicit.',
      },
      checks: [],
    },
    comprehensionChecks: [
      {
        question: 'Is Python statically or dynamically typed, and strongly or weakly typed?',
        options: [
          'Statically and weakly typed.',
          'Dynamically and weakly typed.',
          'Dynamically and strongly typed: types are checked at runtime (dynamic), but Python refuses to silently convert between incompatible types (strong) — "1" + 1 raises TypeError.',
          'Statically and strongly typed.',
        ],
        correctIndex: 2,
        explanation:
          'Python checks types at runtime (dynamic), but it does NOT silently ' +
          'coerce: "1" + 1 raises TypeError, not "11". So Python is dynamic+strong. ' +
          'This proves the two axes are independent — JavaScript is dynamic+weak ' +
          '(same when, but it coerces). Rust is static+strong (compile-time checks, ' +
          'no coercion). C is static+weak (compile-time checks, but silent truncation).',
      },
      {
        question: 'Why does `short s = 100000;` in C compile without error but produce -31072?',
        options: [
          'C is dynamically typed.',
          'C is statically typed (the compiler sees int and short) but weakly typed: it silently converts the int to a short, truncating the value. Static typing did not prevent the bug because the language still permits silent conversion.',
          'C has no type system.',
          '100000 is not a valid number.',
        ],
        correctIndex: 1,
        explanation:
          'C is statically typed — the compiler knows `i` is int and `s` is short. ' +
          'But C is weakly typed: it allows the assignment with silent conversion, ' +
          'truncating 100000 to fit a 16-bit short, producing -31072 with no error. ' +
          'This is the dangerous combination: static checking catches type mismatches ' +
          'at compile time, but weak typing still permits data-losing conversions. ' +
          'Rust (static+strong) would reject this with a type error.',
      },
    ],
  },
]
