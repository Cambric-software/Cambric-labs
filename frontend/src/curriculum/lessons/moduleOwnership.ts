/**
 * Cambric Labs — Module: Ownership & Borrowing (Systems)
 *
 * Two lessons: ownership (one owner, automatic free on drop, move), and
 * borrowing + lifetimes (references without dangling, the borrow checker).
 */
import type { LessonDetail } from '../types'

export const ownershipLessons: LessonDetail[] = [
  {
    id: 'lesson-ownership',
    title: 'Ownership: One Owner, Automatic Cleanup, No Leaks',
    moduleId: 'module-ownership',
    languageId: 'rust',
    difficulty: 4,
    estimatedMinutes: 13,
    summary:
      'In Rust every value has exactly one owner; when the owner goes out ' +
      'of scope the value is dropped (freed) automatically. Assigning or ' +
      'returning a value moves ownership, so the old binding is invalid. ' +
      'This single rule eliminates leaks and double-frees with no garbage ' +
      'collector.',
    teachesConceptIds: ['ownership', 'move-semantics', 'memory-management', 'lifetime', 'immutability'],
    prerequisiteConceptIds: ['memory-model', 'stack-ds', 'heap', 'pointer', 'function'],
    objectives: [
      'Explain the single-owner rule and how drop gives automatic freeing.',
      'Distinguish a move (ownership transferred) from a copy (value duplicated).',
      'Predict which binding is valid after an assignment or function call.',
      'Explain why ownership eliminates use-after-free and leaks at compile time.',
    ],
    content: [
      {
        kind: 'paragraph',
        text:
          'C lets you allocate and forget to free (leak), or free and keep ' +
          'using (use-after-free). Garbage-collected languages avoid both ' +
          'but add a runtime. Rust picks a third path: every value has ' +
          'exactly one owner, and when that owner leaves scope the value ' +
          'is dropped — freed, deterministically, with no GC. There is no ' +
          'way to forget to free, and no way to use freed memory, because ' +
          'the compiler tracks ownership and rejects violations before the ' +
          'program runs.',
      },
      {
        kind: 'heading',
        text: 'One owner; drop frees automatically',
      },
      {
        kind: 'code',
        languageId: 'rust',
        caption: 'When s goes out of scope, its heap buffer is freed — no free() call.',
        code: "fn main() {\n    {\n        let s = String::from(\"hi\");  // s owns the heap buffer\n        println!(\"{}\", s);\n    }   // s goes out of scope -> String::drop frees the buffer\n    // no leak, no free() call; the compiler inserted the drop\n}",
      },
      {
        kind: 'callout',
        variant: 'info',
        title: 'Deterministic, not garbage-collected',
        text:
          'Rust frees memory at a known point — the end of the owning ' +
          'scope — not "whenever the GC gets around to it." That means ' +
          'no GC pause, predictable resource cleanup (files, locks, ' +
          'sockets all use the same drop mechanism), and no runtime ' +
          'overhead.',
      },
      {
        kind: 'heading',
        text: 'Assignment moves ownership; the old binding dies',
      },
      {
        kind: 'code',
        languageId: 'rust',
        caption: 'A String is moved, not copied — using the old binding is a compile error.',
        code: "let s1 = String::from(\"hi\");\nlet s2 = s1;            // MOVE: s2 now owns the buffer; s1 is invalid\n// println!(\"{}\", s1);    // COMPILE ERROR: value borrowed after move\n// why: if both pointed at the same buffer, who frees it?\n//      double-free. So Rust invalidates s1 at compile time.",
      },
      {
        kind: 'callout',
        variant: 'warning',
        title: 'Why move instead of copy?',
        text:
          'A String holds a heap buffer pointer. Copying the pointer would ' +
          'leave two owners of one buffer -> double-free when both drop. ' +
          'Moving transfers the buffer to the new owner and invalidates the ' +
          'old one, so exactly one drop happens. The rule is: heap-owning ' +
          'types move; small stack types (integers, bools) implement Copy ' +
          'and are duplicated because copying them is cheap and safe.',
      },
      {
        kind: 'heading',
        text: 'Copy types: duplicated, not moved',
      },
      {
        kind: 'codeWithOutput',
        languageId: 'rust',
        caption: 'Integers are Copy: x stays valid after the assignment.',
        code: "let x = 5;\nlet y = x;    // COPY (i32 implements Copy): x and y are independent\nprintln!(\"{} {}\", x, y);   // both valid\n// an i32 is a fixed 4 bytes on the stack; duplicating it is free and safe",
        output: '5 5',
      },
      {
        kind: 'heading',
        text: 'Functions take ownership; return gives it back',
      },
      {
        kind: 'code',
        languageId: 'rust',
        caption: 'Passing a String into a function moves it; you must return or clone to keep using it.',
        code: "fn takes(s: String) { /* s owns it here; dropped at end of fn */ }\n\nlet s = String::from(\"hi\");\ntakes(s);\n// println!(\"{}\", s);  // COMPILE ERROR: s was moved into takes\n\n// options to keep using s after:\n// 1) have takes return it back\n// 2) pass a reference (borrow) instead — next lesson\n// 3) s.clone() to duplicate the heap buffer (costs an allocation)",
      },
      {
        kind: 'compare',
        languageIds: ['c', 'rust'],
        caption:
          'C trusts you to free exactly once (UB if wrong). Rust enforces once at compile time.',
        snippets: [
          "char *s = strdup(\"hi\");\n// ... use s ...\nfree(s);   // YOU must free exactly once\n// forget -> leak; twice -> corruption; after free -> UB",
          "let s = String::from(\"hi\");\n// ... use s ...\n// no free() call; compiler inserts drop once\n// cannot leak, double-free, or use-after-free",
        ],
      },
    ],
    animation: {
      type: 'memoryDiagram',
      title: 'Move: ownership transfers, the old binding dies',
      steps: [
        { caption: 's1 = String::from("hi"). s1 owns {ptr, len, cap} pointing at heap buffer "hi".' },
        { caption: 's2 = s1. Ownership MOVES: s2 now owns {ptr,len,cap} and the heap buffer.' },
        { caption: 's1 is invalidated by the compiler. Using s1 now is a compile error (use after move).' },
        { caption: 'End of scope: s2 drops -> heap buffer freed exactly once. No double-free possible because s1 cannot drop it.' },
        { caption: 'Contrast C: both s1 and s2 would point at the same buffer; both frees -> double-free. Rust prevents this statically.' },
      ],
    },
    activity: {
      type: 'predictOutput',
      title: 'Will it compile?',
      prompt:
        'Does this compile? If not, which line fails and why?',
      languageId: 'rust',
      starterCode: "let s = String::from(\"hi\");\nlet t = s;\nprintln!(\"{} {}\", s, t);",
      data: {
        expected: 'COMPILE ERROR on the println: s was moved into t and is no longer valid.',
        explanation:
          'String does not implement Copy, so `let t = s` moves ownership ' +
          'from s to t. s is now invalid. Using s in the println is a ' +
          'borrow-after-move compile error. Fix: borrow with a reference ' +
          '(&s), clone, or drop the use of s.',
      },
      checks: [],
    },
    comprehensionChecks: [
      {
        question: 'Why does `let t = s` invalidate `s` for a String but not for an i32?',
        options: [
          'Strings are slower.',
          'A String owns a heap buffer; copying just the pointer would create two owners of one buffer (double-free). An i32 is a small stack value that implements Copy, so it is safely duplicated.',
          'i32 cannot be assigned.',
          'Strings are immutable.',
        ],
        correctIndex: 1,
        explanation:
          'Moving prevents double-free for heap-owning types: only one ' +
          'owner can drop. Copy types like i32 are fixed-size stack values ' +
          'where duplication is cheap and safe, so they implement Copy and ' +
          'are duplicated on assignment instead of moved.',
      },
      {
        question: 'How does ownership eliminate memory leaks without a garbage collector?',
        options: [
          'Rust scans memory periodically.',
          'Every value has one owner; when the owner leaves scope, the compiler inserts a drop that frees it, so there is always exactly one deterministic free and no way to forget it.',
          'Rust disables the heap.',
          'Leaks are caught at runtime.',
        ],
        correctIndex: 1,
        explanation:
          'The single-owner + drop-on-scope-exit rule means freeing is ' +
          'automatic and deterministic: the compiler guarantees a drop at ' +
          'the right place, once. You cannot forget to free (no explicit ' +
          'free to forget) and cannot double-free (only one owner). No GC ' +
          'runtime is needed because the rule is enforced statically.',
      },
    ],
  },
  {
    id: 'lesson-borrowing-lifetimes',
    title: 'Borrowing & Lifetimes: References Without Dangling',
    moduleId: 'module-ownership',
    languageId: 'rust',
    difficulty: 5,
    estimatedMinutes: 14,
    summary:
      'Moving ownership for every read is clumsy. Borrowing lets you use a ' +
      'value via a reference without taking ownership. The borrow checker ' +
      'ensures no reference outlives its data, so dangling pointers become ' +
      'a compile error — the same safety as GC, with zero runtime cost.',
    teachesConceptIds: ['borrowing', 'lifetime', 'ownership', 'pointer', 'immutability'],
    prerequisiteConceptIds: ['ownership', 'move-semantics', 'pointer', 'function', 'memory-model'],
    objectives: [
      'Borrow a value with & instead of moving ownership.',
      'Explain the "many readers OR one writer" aliasing rule.',
      'Read a lifetime annotation and understand what it constrains.',
      'Diagnose a dangling-reference compile error.',
    ],
    content: [
      {
        kind: 'paragraph',
        text:
          'If every read took ownership, you would have to return or clone ' +
          'values constantly. Borrowing solves this: a reference (&T) lets ' +
          'you use a value without owning it, so the original keeps ' +
          'ownership and frees it later. The borrow checker enforces one ' +
          'rule: a reference must never outlive the data it points to. ' +
          'Violate that and you get a compile error — never a dangling ' +
          'pointer at runtime.',
      },
      {
        kind: 'heading',
        text: 'Borrow instead of move',
      },
      {
        kind: 'codeWithOutput',
        languageId: 'rust',
        caption: '& borrows: the function reads the value without taking it.',
        code: "fn len(s: &String) -> usize {  // borrows, does not own\n    s.len()\n}   // s the reference goes out of scope, but the String is NOT freed (not owned)\n\nlet s = String::from(\"hello\");\nlet n = len(&s);     // pass a reference; s keeps ownership\nprintln!(\"{} has {} chars\", s, n);  // s still valid — it was borrowed, not moved",
        output: 'hello has 5 chars',
      },
      {
        kind: 'callout',
        variant: 'info',
        title: 'A reference does not own, so it does not free',
        text:
          'When a reference goes out of scope nothing is freed, because the ' +
          'reference does not own the data. Only the owner frees. This is ' +
          'why borrowing is cheap: you hand out a view of the data without ' +
          'transferring the responsibility to clean it up.',
      },
      {
        kind: 'heading',
        text: 'The aliasing rule: many readers, or one writer',
      },
      {
        kind: 'code',
        languageId: 'rust',
        caption: 'You may have many shared refs, or one mutable ref — never both at once.',
        code: "let mut s = String::from(\"hi\");\n\n// OK: many shared (immutable) borrows at once\nlet r1 = &s;\nlet r2 = &s;       // fine: multiple readers\nprintln!(\"{} {}\", r1, r2);\n\n// after r1/r2 are last used, you can mutably borrow\nlet r3 = &mut s;    // OK now: exclusive writer\nr3.push_str(\"!\");\n// let r4 = &s;    // COMPILE ERROR: cannot borrow as immutable while mutably borrowed\n// rule prevents data races: no two references can race if one is &mut",
      },
      {
        kind: 'callout',
        variant: 'warning',
        title: 'This is why Rust is "fearless concurrency"',
        text:
          'A data race is exactly two references to the same data where at ' +
          'least one is a write. The aliasing rule forbids that combination ' +
          'at compile time, so a program that compiles cannot have data ' +
          'races — without any runtime locking. You still need locks for ' +
          'atomicity across operations, but the race itself is impossible.',
      },
      {
        kind: 'heading',
        text: 'Lifetimes: proving a reference does not outlive its data',
      },
      {
        kind: 'paragraph',
        text:
          'A lifetime is the span during which a reference is valid. The ' +
          'compiler infers lifetimes almost always, but when a function ' +
          'returns a reference it cannot guess which input the output ' +
          'depends on, so you annotate it. The annotation is a contract: ' +
          'the returned reference lives at most as long as the named input. ' +
          'It costs nothing at runtime — it is a compile-time proof.',
      },
      {
        kind: 'code',
        languageId: 'rust',
        caption: "The lifetime 'a says: the returned reference lives as long as the longer input.",
        code: "fn longest<'a>(x: &'a str, y: &'a str) -> &'a str {\n    if x.len() > y.len() { x } else { y }\n}\n// 'a is a generic lifetime: the caller picks a region where BOTH x and y live\n// the return is valid for that whole region — no dangling possible\n// the body returns x or y, both of which live 'a, so the contract holds",
      },
      {
        kind: 'heading',
        text: 'Catching a dangling reference at compile time',
      },
      {
        kind: 'code',
        languageId: 'rust',
        caption: 'Returning a reference to a local is a compile error — the local is dropped.',
        code: "fn dangle() -> &String {       // COMPILE ERROR\n    let s = String::from(\"hi\");\n    &s                       // s is dropped when dangle returns\n}                              // the reference would point at freed memory\n\n// fix: return the owned value, transferring ownership to the caller\nfn no_dangle() -> String {\n    let s = String::from(\"hi\");\n    s                        // move s out; caller owns and frees it\n}",
      },
      {
        kind: 'callout',
        variant: 'success',
        title: 'The compiler refused to compile a use-after-free',
        text:
          'In C, returning &local is a silent dangling pointer — it crashes ' +
          'later, unpredictably. In Rust the borrow checker rejects it at ' +
          'compile time because the local\'s lifetime ends at the return. ' +
          'This is the whole point: memory-safety bugs become compile ' +
          'errors, caught before the program can ever run.',
      },
      {
        kind: 'compare',
        languageIds: ['c', 'rust'],
        caption:
          'C allows a dangling pointer (runtime UB). Rust rejects it at compile time.',
        snippets: [
          "char *f() {\n  char s[] = \"hi\";\n  return s;   // returns pointer to stack local — UB\n}",
          "fn f() -> &String {\n  let s = String::from(\"hi\");\n  &s          // COMPILE ERROR: does not live long enough\n}",
        ],
      },
    ],
    animation: {
      type: 'memoryDiagram',
      title: 'A dangling reference, caught at compile time',
      steps: [
        { caption: 'fn dangle(): let s = String::from("hi"). s owns the heap buffer; s lives only inside dangle.' },
        { caption: 'return &s. We try to return a reference to s.' },
        { caption: 'dangle returns. s goes out of scope -> String::drop frees the heap buffer.' },
        { caption: 'The caller now holds a reference to freed memory — a dangling pointer. In C: silent UB, crash later.' },
        { caption: 'In Rust: the borrow checker sees the reference outlives s, and REFUSES TO COMPILE. The bug cannot run.' },
      ],
    },
    activity: {
      type: 'multipleChoice',
      title: 'The aliasing rule',
      prompt:
        'You have `let r1 = &s; let r2 = &mut s;`. What happens?',
      languageId: 'rust',
      data: {
        question: 'Many readers or one writer — which is this?',
        options: [
          'It compiles; r1 and r2 share s.',
          'Compile error: you cannot have a shared borrow (r1) and a mutable borrow (r2) of the same value alive at the same time.',
          'r2 overwrites r1.',
          'It panics at runtime.',
        ],
        correctIndex: 1,
        explanation:
          'The rule is "many readers OR one writer, never both." A ' +
          'mutable borrow requires exclusive access, so no other borrow ' +
          'may exist simultaneously. This prevents data races statically: ' +
          'fix by dropping r1 before mutably borrowing, or by designing ' +
          'around interior mutability (RefCell) when you genuinely need it.',
      },
      checks: [],
    },
    comprehensionChecks: [
      {
        question: 'What does a lifetime annotation like `&\'a str` actually constrain?',
        options: [
          'How long the program runs.',
          'It is a compile-time contract: the reference is valid for at least the region \'a, and the compiler proves no reference outlives the data it points to. It costs nothing at runtime.',
          'The maximum length of the string.',
          'The number of references allowed.',
        ],
        correctIndex: 1,
        explanation:
          'Lifetimes are erased at compile time. The annotation tells the ' +
          'compiler how the output reference relates to the inputs, so it ' +
          'can prove the output does not outlive any data it depends on. ' +
          'It is a static proof of non-dangling, with zero runtime cost.',
      },
      {
        question: 'Why does returning `&s` (a reference to a local String) fail to compile in Rust but works (dangerously) in C?',
        options: [
          'Rust strings are different.',
          'In C the local is heap-allocated; in Rust it is not.',
          'The local is dropped when the function returns, so the reference would dangle. Rust\'s borrow checker catches this at compile time; C allows it as undefined behaviour that crashes later.',
          'Rust does not allow functions to return references.',
        ],
        correctIndex: 2,
        explanation:
          'Both languages free the local on return, making the reference ' +
          'dangling. The difference is detection: C emits it and you ' +
          'discover the bug at runtime (if at all); Rust\'s borrow ' +
          'checker proves the reference outlives the local and rejects ' +
          'the program before it runs. Same bug, different safety net.',
      },
    ],
  },
]
