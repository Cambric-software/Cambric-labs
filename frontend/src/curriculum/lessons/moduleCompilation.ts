/**
 * Cambric Labs — Module: Compilation (Systems)
 *
 * Two lessons: lexing+parsing (source text -> tokens -> AST), and
 * codegen+JIT (IR -> machine code, ahead-of-time vs just-in-time).
 */
import type { LessonDetail } from '../types'

export const compilationLessons: LessonDetail[] = [
  {
    id: 'lesson-lexing-and-parsing',
    title: 'Lexing & Parsing: From Text to an AST',
    moduleId: 'module-compilation',
    languageId: 'python',
    difficulty: 4,
    estimatedMinutes: 13,
    summary:
      'Source code is just text. A compiler first groups characters into ' +
      'tokens (lexing), then builds a tree of expressions and statements ' +
      '(parsing). The AST is the structure every later phase — type ' +
      'checking, optimization, code generation — actually works on.',
    teachesConceptIds: ['lexer', 'parser', 'ast', 'compiler', 'token'],
    prerequisiteConceptIds: ['string', 'function', 'recursion', 'tree', 'compilation'],
    objectives: [
      'Tokenize source text into a stream of tokens.',
      'Build a parse tree / AST from tokens using recursive descent.',
      'Explain why a tree (not the original text) is the working representation.',
      'Diagnose a syntax error as a failure to match a grammar rule.',
    ],
    content: [
      {
        kind: 'paragraph',
        text:
          'To a computer, "x = 1 + 2" is nine characters with no meaning. ' +
          'Before any analysis, the compiler must turn that text into a ' +
          'structure it can reason about. That happens in two phases: ' +
          'lexing groups characters into tokens (words), and parsing ' +
          'arranges tokens into a tree (sentences). The tree — the ' +
          'abstract syntax tree (AST) — is what every later phase actually ' +
          'reads.',
      },
      {
        kind: 'heading',
        text: 'Phase 1: lexing — characters to tokens',
      },
      {
        kind: 'codeWithOutput',
        languageId: 'python',
        caption: 'A lexer groups adjacent characters into typed tokens.',
        code: "import re\n\nTOKEN_SPEC = [\n    ('NUMBER',   r'\\d+'),\n    ('ID',       r'[a-zA-Z_]+'),\n    ('OP',       r'[=+]'),\n    ('SKIP',     r'\\s+'),\n]\n\ndef lex(code):\n    pos = 0\n    tokens = []\n    while pos < len(code):\n        for kind, pat in TOKEN_SPEC:\n            m = re.compile(pat).match(code, pos)\n            if m:\n                if kind != 'SKIP':\n                    tokens.append((kind, m.group(0)))\n                pos = m.end()\n                break\n        else:\n            raise SyntaxError(f'unexpected {code[pos]!r}')\n    return tokens\n\nprint(lex('x = 1 + 2'))",
        output: "[('ID', 'x'), ('OP', '='), ('NUMBER', '1'), ('OP', '+'), ('NUMBER', '2')]",
      },
      {
        kind: 'callout',
        variant: 'info',
        title: 'Whitespace and comments vanish here',
        text:
          'Whitespace and comments carry no meaning for the parse, so the ' +
          'lexer drops them. By the parsing phase, the structure is just a ' +
          'stream of meaningful tokens — formatting no longer matters. ' +
          'This is why most languages do not care about indentation ' +
          '(Python is the famous exception: its lexer emits INDENT/DEDENT ' +
          'tokens).',
      },
      {
        kind: 'heading',
        text: 'Phase 2: parsing — tokens to a tree',
      },
      {
        kind: 'paragraph',
        text:
          'Parsing matches the token stream against the language grammar. ' +
          'The simplest technique is recursive descent: one function per ' +
          'grammar rule, each consuming the tokens its rule allows and ' +
          'returning a node. The result is a tree because rules are nested: ' +
          'an expression contains terms, a term contains factors, etc.',
      },
      {
        kind: 'code',
        languageId: 'python',
        caption: 'A tiny recursive-descent parser for "ID = NUMBER (+ NUMBER)*".',
        code: "# tokens: ID '=' NUMBER ('+' NUMBER)* EOF\ndef parse_assign(tokens):\n    pos = 0\n    name = tokens[pos]; pos += 1        # ID\n    assert tokens[pos][1] == '='; pos += 1   # '='\n    left = {'kind': 'num', 'value': int(tokens[pos][1])}; pos += 1\n    while pos < len(tokens) and tokens[pos][1] == '+':\n        pos += 1\n        right = {'kind': 'num', 'value': int(tokens[pos][1])}; pos += 1\n        left = {'kind': 'add', 'left': left, 'right': right}\n    return {'kind': 'assign', 'target': name[1], 'value': left}\n\n# parse_assign([('ID','x'),('OP','='),('NUMBER','1'),('OP','+'),('NUMBER','2')])\n# -> {'kind':'assign','target':'x','value':{'kind':'add','left':{...1}, 'right':{...2}}}",
      },
      {
        kind: 'callout',
        variant: 'tip',
        title: 'The AST encodes precedence',
        text:
          '"1 + 2 * 3" must multiply 2 and 3 before adding 1. The grammar ' +
          'rules express this nesting: a term can be a factor or factor ' +
          '"*" factor, so multiplication binds tighter and sits lower in ' +
          'the tree. The tree structure IS the precedence — no parentheses ' +
          'needed in the data.',
      },
      {
        kind: 'heading',
        text: 'Why a tree, not the text?',
      },
      {
        kind: 'paragraph',
        text:
          'Text is linear and ambiguous (is "+" addition or string concat?). ' +
          'The AST is unambiguous and structured: each node has a known kind ' +
          'and children. Type checking walks the tree bottom-up; code ' +
          'generation walks it emitting instructions; optimization rewrites ' +
          'it. Every later phase works on the tree because it is the ' +
          'meaning, with the surface syntax stripped away.',
      },
      {
        kind: 'callout',
        variant: 'warning',
        title: 'A syntax error is a parse failure',
        text:
          '"x = 1 +" is a syntax error because after consuming "+", the ' +
          'parser expects a NUMBER but finds end-of-input. The error message ' +
          'points to where a grammar rule could not be completed. Syntax ' +
          'errors are caught here, before any type checking or codegen — ' +
          'the program never runs if it does not parse.',
      },
      {
        kind: 'compare',
        languageIds: ['python', 'python'],
        caption:
          'Text (linear, ambiguous) vs AST (structured, typed nodes).',
        snippets: [
          "# source text: linear characters, precedence implicit\n'x = 1 + 2 * 3'",
          "# AST: structured, precedence encoded in nesting\n{'kind':'assign','target':'x','value':{'kind':'add','left':{'num':1},'right':{'kind':'mul','left':{'num':2},'right':{'num':3}}}}",
        ],
      },
    ],
    animation: {
      type: 'codeWalk',
      title: 'Text -> tokens -> AST',
      steps: [
        { caption: 'Source text: "x = 1 + 2". A flat string of characters.' },
        { caption: 'Lex: group chars into tokens [ID:x, OP:=, NUM:1, OP:+, NUM:2]. Whitespace dropped.' },
        { caption: 'Parse ID "=" ... : match the assign rule. Consume x, =.' },
        { caption: 'Parse the value: NUM "+" NUM -> an add node with two number children.' },
        { caption: 'Result AST: assign(target=x, value=add(left=num(1), right=num(2))). Later phases read THIS, not the text.' },
      ],
    },
    activity: {
      type: 'multipleChoice',
      title: 'Where does precedence live?',
      prompt:
        'In "1 + 2 * 3", how does the AST know to multiply before adding?',
      languageId: 'python',
      data: {
        question: 'Where is operator precedence represented?',
        options: [
          'In the order of the tokens.',
          'In the structure of the AST: multiplication sits lower (binds tighter), so the add node has the mul node as a child, encoding "do the mul first."',
          'In a runtime check.',
          'In the lexer.',
        ],
        correctIndex: 1,
        explanation:
          'Precedence is structural. The grammar rule for a term allows ' +
          'multiplication at a lower level than addition, so 2*3 becomes ' +
          'a mul node that is a child of the add node. Walking the tree ' +
          'bottom-up evaluates the mul before the add — no precedence table ' +
          'needed at evaluation time.',
      },
      checks: [],
    },
    comprehensionChecks: [
      {
        question: 'What is the job of the lexer, and what does it discard?',
        options: [
          'It builds the AST and discards tokens.',
          'It groups characters into typed tokens, discarding things that carry no meaning (whitespace, comments).',
          'It generates machine code.',
          'It checks types.',
        ],
        correctIndex: 1,
        explanation:
          'The lexer is the first pass: scan characters left to right, ' +
          'emit tokens (NUMBER, ID, OP), drop whitespace and comments. The ' +
          'parser then consumes those tokens to build the tree. Lexing ' +
          'reduces noise so parsing works on meaningful units.',
      },
      {
        question: 'Why do type checking and code generation work on the AST instead of the source text?',
        options: [
          'The AST is smaller and uses less memory.',
          'The AST is unambiguous and structured: each node has a known kind and children, encoding precedence and grouping, so later phases can match on structure instead of re-parsing text.',
          'The AST is faster to read from disk.',
          'The text is encrypted.',
        ],
        correctIndex: 1,
        explanation:
          'Text is linear and ambiguous; the same characters can mean ' +
          'different things in context. The AST resolves all of that into ' +
          'typed, nested nodes, so type checking and codegen can pattern-' +
          'match on node kinds and recurse on children without ever ' +
          're-reading characters. The tree is the meaning.',
      },
    ],
  },
  {
    id: 'lesson-codegen-and-jit',
    title: 'Code Generation & JIT: Turning the AST into Running Code',
    moduleId: 'module-compilation',
    languageId: 'rust',
    difficulty: 5,
    estimatedMinutes: 13,
    summary:
      'After parsing and type checking, the compiler walks the AST and ' +
      'emits instructions — machine code ahead-of-time, or bytecode run by ' +
      'an interpreter. A JIT compiler does both: it interprets first, then ' +
      'compiles the hot paths to native code at runtime for near-compiled ' +
      'speed.',
    teachesConceptIds: ['codegen', 'just-in-time', 'compiler', 'ast', 'linking'],
    prerequisiteConceptIds: ['ast', 'lexer', 'parser', 'compilation', 'function'],
    objectives: [
      'Walk an AST to emit target instructions.',
      'Distinguish ahead-of-time (AOT) compilation from interpretation and JIT.',
      'Explain why a JIT compiles only hot paths.',
      'Describe linking as resolving symbols across compiled units.',
    ],
    content: [
      {
        kind: 'paragraph',
        text:
          'The AST is meaning, but it is not yet executable. Code ' +
          'generation walks the tree and emits instructions the machine (or ' +
          'a virtual machine) can run. Three deployment shapes exist: ' +
          'ahead-of-time (AOT) — compile to machine code once, run many ' +
          'times (C, Rust); interpretation — compile to bytecode, run on a ' +
          'virtual machine each time (Python, the JVM before JIT); and ' +
          'just-in-time (JIT) — interpret first, compile hot code to native ' +
          'at runtime (the JVM and V8). Each trades startup time, peak ' +
          'speed, and portability differently.',
      },
      {
        kind: 'heading',
        text: 'Codegen: walk the AST, emit instructions',
      },
      {
        kind: 'codeWithOutput',
        languageId: 'rust',
        caption: 'A toy codegen emits a stack-machine bytecode for an add node.',
        code: "// AST node: Add { left: Box<Node>, right: Box<Node> }\n// stack machine: PUSH n; ADD pops two, pushes sum\n\nfn gen(node: &Node, out: &mut Vec<Instr>) {\n    match node {\n        Node::Num(n)  => out.push(Instr::Push(*n)),\n        Node::Add(l, r) => {\n            gen(l, out);   // leaves left value on stack\n            gen(r, out);   // leaves right value on stack\n            out.push(Instr::Add);  // pops two, pushes sum\n        }\n    }\n}\n// gen(add(num(1), num(2))) -> [Push(1), Push(2), Add]",
        output: '[Push(1), Push(2), Add]',
      },
      {
        kind: 'callout',
        variant: 'info',
        title: 'Real codegen targets a real ISA',
        text:
          'A toy targets a stack machine; a real compiler targets x86-64 or ' +
          'ARM. The principle is the same — walk the tree, emit ' +
          'instructions — but real codegen must handle registers, calling ' +
          'conventions, and an enormous instruction set. That complexity is ' +
          'why LLVM exists: a reusable codegen backend that many languages ' +
          'share (Rust, Swift, Clang) instead of each writing their own.',
      },
      {
        kind: 'heading',
        text: 'AOT vs interpreter vs JIT',
      },
      {
        kind: 'compare',
        languageIds: ['rust', 'python'],
        caption:
          'AOT (Rust: compile once, native at startup) vs interpreted (Python: bytecode + VM each run).',
        snippets: [
          "// Rust: cargo build emits a native binary once\n// startup: instant; peak speed: max; portability: per-ISA\nfn main() { println!(\"{}\", 1 + 2); }",
          "# Python: source -> bytecode (once per run), VM interprets bytecode\n# startup: parse+compile each run; peak: slower; portability: any VM\ndef main(): print(1 + 2)",
        ],
      },
      {
        kind: 'callout',
        variant: 'tip',
        title: 'Why JIT exists: best of both',
        text:
          'A pure interpreter starts fast (no compile) but runs slow. AOT ' +
          'runs fast but must compile everything, even cold code, slowing ' +
          'startup. A JIT starts as an interpreter, profiles which code ' +
          'runs often, and compiles ONLY the hot paths to native — fast ' +
          'startup AND fast steady-state. It can also use runtime ' +
          'information (this branch is always true) that AOT cannot.',
      },
      {
        kind: 'heading',
        text: 'A JIT compiles hot paths, not all code',
      },
      {
        kind: 'paragraph',
        text:
          'Compiling everything at startup is expensive. A JIT interprets ' +
          'first — cheap to start — and counts how often each function or ' +
          'loop runs. When a function gets "hot" (crosses a threshold), the ' +
          'JIT compiles it to native and swaps the interpreter call for a ' +
          'native call. Cold code stays interpreted; only the few hot loops ' +
          'that dominate runtime get the expensive native treatment.',
      },
      {
        kind: 'callout',
        variant: 'warning',
        title: 'Deoptimization: the JIT\'s escape hatch',
        text:
          'A JIT optimizes based on assumptions (this variable is always ' +
          'an int). If a later call violates the assumption, the optimized ' +
          'code is invalid and must "deoptimize" — throw away the native ' +
          'version, fall back to the interpreter, and recompile with the new ' +
          'type information. This is why JITs are complex: they must be ' +
          'able to invalidate speculative optimizations safely.',
      },
      {
        kind: 'heading',
        text: 'Linking: resolving symbols across units',
      },
      {
        kind: 'paragraph',
        text:
          'You compile files separately into object files, each with ' +
          'undefined references to functions in other files. Linking ' +
          'resolves those references: it matches each call to printf to the ' +
          'address of the printf in the C library, producing one executable. ' +
          'Static linking copies the library in (big binary, no ' +
          'dependencies); dynamic linking leaves a reference resolved at ' +
          'load time (small binary, needs the .so/.dll present).',
      },
      {
        kind: 'compare',
        languageIds: ['rust', 'rust'],
        caption:
          'Static link (self-contained) vs dynamic link (smaller, needs lib at runtime).',
        snippets: [
          "// static: libc is copied into the binary\n// big file, runs anywhere, no .so needed\n$ RUSTFLAGS='-C target-feature=+crt-static' cargo build",
          "// dynamic: binary references libc.so at load time\n// small file, needs matching libc on the host\n$ cargo build   // default on Linux",
        ],
      },
    ],
    animation: {
      type: 'dataFlow',
      title: 'AOT vs interpreter vs JIT over a program\'s lifetime',
      steps: [
        { caption: 'AOT: before run, compile ALL of main to native. Startup: run native immediately. Steady: max speed.' },
        { caption: 'Interpreter: at run, parse to bytecode, interpret each instruction. Startup: fast (no full compile). Steady: slow (interpreting).' },
        { caption: 'JIT: start as interpreter. main runs interpreted; cheap startup.' },
        { caption: 'JIT detects hotLoop runs 10k times. Compiles hotLoop to native; swaps the call. Cold code still interpreted.' },
        { caption: 'JIT steady: hot paths native, cold interpreted. Fast startup + fast steady-state, at the cost of a complex runtime.' },
      ],
    },
    activity: {
      type: 'multipleChoice',
      title: 'Which deployment model?',
      prompt:
        'You ship a CLI tool that must start in <50ms and run a tight ' +
        'math loop for minutes. Which model fits best?',
      languageId: 'rust',
      data: {
        question: 'AOT, interpreter, or JIT?',
        options: [
          'Interpreter — fastest startup.',
          'AOT — compiles ahead of time, so startup is instant (native) and the hot loop runs at max speed; no runtime compile cost.',
          'JIT — best of both.',
          'None; ship the source.',
        ],
        correctIndex: 1,
        explanation:
          'For a shipped CLI with a known hot path, AOT is ideal: the ' +
          'compile cost is paid once at build time (not at every run), ' +
          'startup is native-fast, and the math loop runs at full speed. ' +
          'A JIT\'s startup compilation would hurt the <50ms goal; an ' +
          'interpreter would be too slow for minutes of math. JIT shines ' +
          'in long-running servers where steady-state dominates.',
      },
      checks: [],
    },
    comprehensionChecks: [
      {
        question: 'Why does a JIT compile only hot paths instead of all code?',
        options: [
          'It cannot compile cold code.',
          'Compiling all code at startup is too expensive; interpreting is cheap to start, so it profiles which code runs often and spends the compile cost only where it pays off.',
          'Hot paths are easier to compile.',
          'Cold code is not valid.',
        ],
        correctIndex: 1,
        explanation:
          'JIT philosophy: most programs spend most time in a tiny fraction ' +
          'of code. Compiling everything wastes startup on code that ' +
          'rarely runs. Interpreting first is cheap; compiling only the ' +
          'hot loops gives native speed where it matters, with minimal ' +
          'startup cost — the best of AOT and interpretation.',
      },
      {
        question: 'What problem does linking solve?',
        options: [
          'It optimizes the AST.',
          'It resolves cross-file symbol references: each object file has calls to functions defined elsewhere; the linker matches each call to the definition\'s address, producing one executable.',
          'It tokenizes source.',
          'It runs the program.',
        ],
        correctIndex: 1,
        explanation:
          'Separate compilation leaves "printf" as an unresolved symbol in ' +
          'your object file. The linker walks all object files (and ' +
          'libraries), matching each undefined reference to a definition, ' +
          'and patches in the final addresses. Static linking copies the ' +
          'definitions in; dynamic linking leaves them to be resolved by ' +
          'the loader at runtime.',
      },
    ],
  },
]
