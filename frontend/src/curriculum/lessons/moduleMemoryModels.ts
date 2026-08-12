/**
 * Cambric Labs — Module: Memory Models (Programming Languages track)
 *
 * Two lessons on how languages manage memory lifetime: the three strategies
 * (manual, garbage collection, ownership/borrowing), and how Rust's ownership
 * model achieves memory safety without a garbage collector. Real code in C,
 * Python, Java, and Rust makes the tradeoffs concrete.
 */
import type { LessonDetail } from '../types'

export const memoryModelsLessons: LessonDetail[] = [
  {
    id: 'lesson-memory-management-strategies',
    title: 'Memory Management: Manual, GC, and Ownership',
    moduleId: 'module-memory-models',
    languageId: 'python',
    difficulty: 4,
    estimatedMinutes: 14,
    summary:
      'Every program that allocates memory must eventually free it. Languages ' +
      'differ in WHO frees it and WHEN: manual (C — you call free), garbage ' +
      'collection (Python, Java — a runtime finds and frees unused memory), and ' +
      'ownership (Rust — the compiler proves when memory is safe to free). Each ' +
      'strategy trades control, safety, and performance differently.',
    teachesConceptIds: ['memory-management', 'garbage-collection', 'manual-memory', 'ownership', 'memory-leak'],
    prerequisiteConceptIds: ['variable', 'pointer', 'stack-ds', 'heap', 'type-system'],
    objectives: [
      'Distinguish the three memory-management strategies: manual, GC, ownership.',
      'Explain how a garbage collector finds unused memory (reachability).',
      'Describe the tradeoffs: control vs safety vs performance.',
      'Recognize which strategy a language uses and the bugs it allows.',
    ],
    content: [
      {
        kind: 'paragraph',
        text:
          'When a program needs memory, it asks the operating system for some (via ' +
          'malloc/new). The hard question is: when is it safe to give it back? If ' +
          'you free too early, you corrupt data someone still uses (use-after-free). ' +
          'If you never free, memory grows without bound (a leak). Languages answer ' +
          'this three ways, and the choice defines the language\'s character.',
      },
      {
        kind: 'heading',
        text: 'Strategy 1: Manual management (C, C++)',
      },
      {
        kind: 'codeWithOutput',
        languageId: 'c',
        caption: 'In C, you explicitly allocate and free. You get full control — and full responsibility for every bug.',
        code: '#include <stdlib.h>\n#include <string.h>\n\nint main() {\n    char *buf = malloc(100);   // ask OS for 100 bytes\n    strcpy(buf, "hello");\n    free(buf);                 // give it back\n    // buf is now a DANGLING POINTER — using it is undefined behavior\n    strcpy(buf, "world");      // use-after-free: corrupts memory\n    return 0;\n}',
        output: '(no output, but memory is corrupted — undefined behavior)',
      },
      {
        kind: 'callout',
        variant: 'danger',
        title: 'Manual memory is maximally flexible, maximally dangerous',
        text:
          'C gives you malloc and free; nothing tracks what is still in use. If you ' +
          'free memory that something else still points to (use-after-free), you ' +
          'corrupt memory. If you free twice (double-free), you corrupt the allocator. ' +
          'If you never free (leak), memory grows. These bugs cause ~70% of security ' +
          'vulnerabilities (CVEs). The control is total, but the safety is zero.',
      },
      {
        kind: 'heading',
        text: 'Strategy 2: Garbage collection (Python, Java, JavaScript)',
      },
      {
        kind: 'code',
        languageId: 'python',
        caption: 'In Python, you never free memory. The runtime tracks what is reachable and frees the rest.',
        code: "def make_list():\n    data = [1, 2, 3]   # allocated on the heap\n    return data          # caller now holds a reference\n\nresult = make_list()\n# 'data' the name went out of scope, but the list object\n# is still reachable through 'result' -> not freed yet.\n\ndel result             # no more references -> unreachable\n# The garbage collector will free the list automatically,\n# at some point, when it runs. You never call free().",
      },
      {
        kind: 'callout',
        variant: 'info',
        title: 'GC uses reachability: can you still get to it?',
        text:
          'A garbage collector periodically traces from the program\'s roots ' +
          '(local variables, globals) through every reference. Any object reachable ' +
          'from a root is still in use; anything unreachable is garbage and freed. ' +
          'You never free manually — when the last reference drops, the object ' +
          'becomes unreachable and the collector reclaims it. Use-after-free is ' +
          'impossible: if you can reach it, it is not freed.',
      },
      {
        kind: 'compare',
        languageIds: ['java', 'python'],
        caption: 'Java and Python both use GC; the difference is mostly when the collector runs.',
        snippets: [
          "// Java: references, GC frees unreachable objects.\nList<Integer> list = new ArrayList<>();\nlist.add(1);\nlist = null;   // no reference -> unreachable -> GC frees it\n// Use-after-free is impossible: if reachable, not freed.",
          "# Python: same model, reference counting + cycle GC.\nimport gc\nclass Node:\n    def __init__(self): self.next = None\na = Node(); b = Node()\na.next = b; b.next = a   # reference cycle\ndel a; del b              # cycle: refcount > 0 but unreachable\ngc.collect()              # cycle detector frees both",
        ],
      },
      {
        kind: 'callout',
        variant: 'warning',
        title: 'GC trades safety for runtime cost and unpredictability',
        text:
          'GC eliminates use-after-free and double-free. But the collector runs ' +
          'periodically, pausing the program to trace — a "GC pause" that can cause ' +
          'latency spikes. GC also has overhead (tracking metadata, tracing). And ' +
          'you can still leak memory: if you hold a reference forever (in a cache, ' +
          'a global list), the object is "reachable" and never freed, even if you ' +
          'forgot about it. GC prevents crashes, not logical leaks.',
      },
      {
        kind: 'heading',
        text: 'Strategy 3: Ownership (Rust)',
      },
      {
        kind: 'code',
        languageId: 'rust',
        caption: 'Rust has no GC, but the compiler proves when memory is safe to free — statically, at compile time.',
        code: 'fn main() {\n    let s1 = String::from("hello");  // s1 owns the heap memory\n    let s2 = s1;                       // ownership MOVES to s2\n    // s1 is now invalid — the compiler forbids using it\n    // println!("{}", s1);  // ERROR: value borrowed here after move\n\n    // When s2 goes out of scope at the end of main,\n    // Rust frees the memory — no GC, no free() call,\n    // and use-after-free is impossible because the\n    // compiler statically tracks every owner.\n}',
      },
      {
        kind: 'callout',
        variant: 'success',
        title: 'Ownership: safety of GC, control of manual, at compile time',
        text:
          'Rust\'s insight: if exactly one variable OWNS each piece of memory, and ' +
          'ownership is tracked at compile time, the compiler knows precisely when ' +
          'memory becomes unreachable (when the owner goes out of scope) and inserts ' +
          'the free for you. No GC pauses (freeing is deterministic), no use-after-free ' +
          '(the compiler forbids using a moved value), no double-free (one owner). The ' +
          'cost is you must respect ownership rules, which takes learning.',
      },
      {
        kind: 'heading',
        text: 'The three-way tradeoff',
      },
      {
        kind: 'compare',
        languageIds: ['c', 'python', 'rust'],
        caption: 'Manual (C) = control, no safety. GC (Python) = safety, runtime cost. Ownership (Rust) = safety + control, but learning curve.',
        snippets: [
          "/* C: manual. Total control, zero safety.\n   You free. Bugs: use-after-free, double-free,\n   leaks. ~70% of CVEs. Performance: maximal. */\nchar *b = malloc(100);\nfree(b);\nstrcpy(b, \"x\");  // use-after-free: corrupts",
          "# Python: GC. Safe from manual bugs, but\n#  runtime overhead + GC pauses + logical leaks\n#  (holding refs). Performance: good enough for most.\ndata = [1, 2, 3]\ndel data    # unreachable -> GC frees\ndata.append(4)  # NameError, not corruption",
          "// Rust: ownership. No GC, no manual free.\n//  Compiler proves safety + inserts deterministic frees.\n//  Cost: ownership/borrowing rules to learn.\nlet s = String::from(\"hi\");\n// s freed here automatically — proven safe by compiler",
        ],
      },
      {
        kind: 'paragraph',
        text:
          'No strategy is universally best. C\'s manual control is essential for ' +
          'kernels and embedded systems with no runtime. GC is the right default ' +
          'for application software where developer productivity and safety matter ' +
          'more than microsecond latency. Ownership is the answer when you need ' +
          'both safety and predictable performance (browsers, game engines, systems ' +
          'tools). Knowing all three lets you choose the right tool and understand ' +
          'the tradeoffs a language bakes in.',
      },
    ],
    animation: {
      type: 'compare',
      title: 'Three ways to free memory',
      steps: [
        { caption: 'C (manual): you call malloc(100), get a pointer. You use it. You call free(ptr). If you or anyone else uses ptr afterward — use-after-free, memory corruption. The bug is yours to make and yours to find.' },
        { caption: 'Python (GC): the list object is allocated. References point to it. When the last reference is dropped, the object is unreachable. The garbage collector traces from roots, finds it unreachable, and frees it — automatically, at some later point. You never call free.' },
        { caption: 'Rust (ownership): the String is allocated, owned by s1. Ownership moves to s2. The compiler knows s1 is now invalid (forbids its use). When s2\'s scope ends, the compiler inserts the free — deterministically, at compile time. No GC pause, no use-after-free, no manual free.' },
        { caption: 'The tradeoff: C gives control and danger. GC gives safety and runtime cost. Ownership gives safety and control but requires you to learn the ownership rules. Each eliminates different bug classes and accepts different costs.' },
      ],
    },
    activity: {
      type: 'multipleChoice',
      title: 'Which strategy, which bug?',
      prompt:
        'A program holds a reference to a large object in a global cache, ' +
        'forgets about it, and the program\'s memory grows over days until it ' +
        'crashes with out-of-memory. The language is Python (garbage collected). ' +
        'What happened?',
      languageId: 'python',
      data: {
        question: 'Why did memory grow under GC?',
        options: [
          'The garbage collector is broken.',
          'The object is still reachable (held by the global cache), so the GC correctly does not free it. GC prevents use-after-free, not logical leaks — you must remove the reference yourself.',
          'Python does not have a garbage collector.',
          'The object was freed but came back.',
        ],
        correctIndex: 1,
        explanation:
          'GC frees unreachable memory. If a reference still exists (in a global, ' +
          'a cache, a long-lived list), the object is reachable and the GC correctly ' +
          'keeps it. This is a logical leak, not a GC failure. GC eliminates crashes ' +
          '(use-after-free, double-free) but cannot know you no longer NEED an object ' +
          'you still reference. The fix is to remove the reference (evict from the ' +
          'cache, clear the list) so the object becomes unreachable. Rust would catch ' +
          'some of these via lifetime analysis; C would leak identically (you forgot ' +
          'to free).',
      },
      checks: [],
    },
    comprehensionChecks: [
      {
        question: 'How does a tracing garbage collector decide which memory to free?',
        options: [
          'It frees the oldest objects.',
          'It frees objects that have not been used in the last second.',
          'It traces from roots (local variables, globals) through references; any object not reachable from a root is garbage and freed. Reachable objects are kept, guaranteeing use-after-free is impossible.',
          'It frees memory at random.',
        ],
        correctIndex: 2,
        explanation:
          'A tracing GC starts from roots (stack variables, globals, registers) ' +
          'and follows every reference, marking each object it can reach. Anything ' +
          'unreachable is garbage — no code can ever access it — so freeing it is ' +
          'safe. This guarantee (if reachable, not freed) is why GC eliminates ' +
          'use-after-free: you can never hold a reference to freed memory, because ' +
          'the presence of your reference makes it reachable and therefore not freed.',
      },
      {
        question: 'What does Rust\'s ownership model provide that neither manual C nor GC languages do?',
        options: [
          'Faster programs.',
          'Memory safety (no use-after-free, double-free, or leaks from forgetting to free) WITH deterministic freeing (no GC pauses), proven at compile time — the control of manual plus the safety of GC, at the cost of learning ownership rules.',
          'Easier syntax.',
          'More libraries.',
        ],
        correctIndex: 1,
        explanation:
          'Rust\'s ownership uniquely combines: no GC (freeing is deterministic, ' +
          'no pause — like C) AND no use-after-free/double-free (the compiler ' +
          'statically proves one owner per value and inserts the free at scope end ' +
          '— like GC safety). Neither pure-manual C (safety) nor GC languages ' +
          '(determinism, no pauses) achieve both. The tradeoff is the learning ' +
          'curve: you must respect ownership and borrowing rules, and some patterns ' +
          'require explicit thought about lifetimes.',
      },
    ],
  },
  {
    id: 'lesson-ownership-and-borrowing-concepts',
    title: 'Ownership & Borrowing: Safety Without a Garbage Collector',
    moduleId: 'module-memory-models',
    languageId: 'rust',
    difficulty: 5,
    estimatedMinutes: 15,
    summary:
      'Rust\'s ownership model has three rules: each value has one owner, ' +
      'ownership moves on assignment, and borrows are references that do not ' +
      'transfer ownership. The compiler enforces these statically, inserting ' +
      'deterministic frees and forbidding use-after-free — memory safety with ' +
      'no garbage collector and no runtime cost. This lesson makes the rules ' +
      'concrete with code.',
    teachesConceptIds: ['ownership', 'borrowing', 'lifetime', 'pointer', 'move-semantics'],
    prerequisiteConceptIds: ['memory-management', 'garbage-collection', 'manual-memory', 'pointer', 'stack-ds', 'heap'],
    objectives: [
      'State the three ownership rules and what each prevents.',
      'Distinguish a move (ownership transfers) from a borrow (a reference).',
      'Explain why mutable borrows are exclusive (no aliasing + mutation).',
      'Trace a value\'s owner through code to determine when it is freed.',
    ],
    content: [
      {
        kind: 'paragraph',
        text:
          'Rust achieves memory safety without a garbage collector using three ' +
          'rules enforced at compile time. Together they let the compiler know ' +
          'exactly when each piece of memory is safe to free, insert the free ' +
          'deterministically, and forbid the bugs (use-after-free, double-free, ' +
          'data races) that plague C/C++. The rules are simple to state and ' +
          'take practice to use; this lesson makes them concrete.',
      },
      {
        kind: 'heading',
        text: 'Rule 1: Each value has exactly one owner',
      },
      {
        kind: 'code',
        languageId: 'rust',
        caption: 'A variable owns its value. When the owner goes out of scope, the value is dropped (freed).',
        code: 'fn main() {\n    let s = String::from("hello");  // s owns the String\n    // ... use s ...\n}   // s goes out of scope here -> String is dropped (freed)\n    // The compiler inserts the drop. Deterministic, no GC.',
      },
      {
        kind: 'callout',
        variant: 'info',
        title: 'One owner means a clear free point',
        text:
          'Because exactly one variable owns each value, the compiler knows the ' +
          'precise point where the value is no longer needed: when that owner goes ' +
          'out of scope. It inserts the free there. No tracing, no GC pause — the ' +
          'free is as deterministic as a manual free() call, but the compiler ' +
          'guarantees it happens exactly once.',
      },
      {
        kind: 'heading',
        text: 'Rule 2: Ownership moves on assignment',
      },
      {
        kind: 'code',
        languageId: 'rust',
        caption: 'Assigning a heap value to another variable MOVES ownership. The old variable is invalid.',
        code: 'fn main() {\n    let s1 = String::from("hello");\n    let s2 = s1;            // ownership moves s1 -> s2\n    // println!("{}", s1);  // ERROR: borrow of moved value: `s1`\n    println!("{}", s2);    // OK: s2 owns it now\n}   // s2 dropped here -> memory freed once (not twice)',
      },
      {
        kind: 'callout',
        variant: 'warning',
        title: 'The move prevents double-free',
        text:
          'If both s1 and s2 pointed to the same heap memory (as in C\'s pointer ' +
          'copy), freeing s1 and s2 at scope end would free the same memory twice ' +
          '(double-free). Rust prevents this by MOVING ownership: s1 is invalid after ' +
          'the move, so only s2 is freed. The compiler rejects any use of s1 after the ' +
          'move, statically guaranteeing exactly one free.',
      },
      {
        kind: 'compare',
        languageIds: ['rust', 'rust'],
        caption: 'Stack types (integers) are copied, not moved; heap types (String) are moved. This is the Copy trait.',
        snippets: [
          "// Stack types implement Copy -> assigned by copy, not move.\nlet x = 5;\nlet y = x;     // i32 is Copy: both x and y are valid\nprintln!(\"{} {}\", x, y);  // OK, no move",
          "// Heap types (String) do NOT implement Copy -> moved.\nlet s1 = String::from(\"a\");\nlet s2 = s1;  // String is moved: s1 invalid\n// println!(\"{}\", s1);  // ERROR: borrow of moved value\nprintln!(\"{}\", s2);  // OK",
        ],
      },
      {
        kind: 'heading',
        text: 'Rule 3: Borrows are references that do not transfer ownership',
      },
      {
        kind: 'codeWithOutput',
        languageId: 'rust',
        caption: '& creates a borrow (a reference). The borrow does not own; the original keeps ownership.',
        code: 'fn main() {\n    let s = String::from("hello");\n    let len = calculate_length(&s);  // borrow s, do not move\n    println!("\'{}\' has length {}", s, len);  // s still valid: not moved\n}\n\nfn calculate_length(s: &String) -> usize {\n    s.len()   // s is a reference; we read but do not own\n}   // s (the reference) goes out of scope, but it does NOT\n    // drop the String because it does not own it.',
        output: "'hello' has length 5",
      },
      {
        kind: 'callout',
        variant: 'success',
        title: 'Borrowing lets you use without owning',
        text:
          'A borrow (`&s`) is a reference: you can read the value, but you do not ' +
          'own it and must not free it. The original owner keeps ownership. This lets ' +
          'you pass data to functions without moving it, so the caller retains access. ' +
          'Borrows are checked at compile time: the compiler ensures no borrow outlives ' +
          'the owner (so you never hold a reference to freed memory).',
      },
      {
        kind: 'heading',
        text: 'Mutable borrows are exclusive: no aliasing + mutation',
      },
      {
        kind: 'code',
        languageId: 'rust',
        caption: 'You can have many shared borrows OR one mutable borrow, never both. This prevents data races.',
        code: 'fn main() {\n    let mut s = String::from("hi");\n    let r1 = &mut s;        // mutable borrow: exclusive access\n    // let r2 = &mut s;      // ERROR: cannot borrow `s` as mutable more than once\n    r1.push_str("!");\n    println!("{}", r1);\n    // The rule: either many readers OR one writer, never both.\n    // This prevents data races at compile time — no two threads\n    // can alias+mutate the same memory through references.\n}',
      },
      {
        kind: 'callout',
        variant: 'info',
        title: 'Why exclusive mutable borrows matter',
        text:
          'If two references could mutate the same memory simultaneously, you get data ' +
          'races (one overwrites the other\'s write) or iterator invalidation (a ' +
          'mutation breaks a reference you hold). Rust forbids aliasing+mutation: ' +
          'either many shared `&` borrows (read-only) or exactly one `&mut` borrow ' +
          '(exclusive write). This is checked at compile time, eliminating a whole ' +
          'class of concurrency bugs that plague C++ and GC languages.',
      },
      {
        kind: 'heading',
        text: 'Tracing ownership: when is memory freed?',
      },
      {
        kind: 'code',
        languageId: 'rust',
        caption: 'Trace the owner through the code to find the free point.',
        code: 'fn main() {\n    let s1 = String::from("hello");  // s1 owns\n    let s2 = s1;                       // moves to s2; s1 invalid\n    let len = calc(&s2);                // borrows s2; s2 still owns\n    // s1 is already invalid here (moved)\n    // s2 is valid here\n    drop(s2);                          // explicitly drop s2 -> freed\n    // s2 now invalid\n}   // nothing to drop at scope end (already dropped)\n\nfn calc(s: &String) -> usize { s.len() }',
      },
      {
        kind: 'paragraph',
        text:
          'Ownership is a discipline, and the compiler is a strict teacher. The ' +
          'rules feel restrictive at first, but they encode invariants that make ' +
          'large refactoring safe: if you change a type or an API, the compiler ' +
          'tells you every place ownership or borrows break. The payoff is memory ' +
          'safety and fearless concurrency — you can add threads without fear of ' +
          'data races, because the ownership rules forbid the aliasing that causes ' +
          'them, at compile time, with no runtime cost.',
      },
    ],
    animation: {
      type: 'memoryDiagram',
      title: 'Move vs borrow: who owns the String?',
      steps: [
        { caption: 's1 = String::from("hello"). The String (ptr, len, capacity) sits on the stack; the heap holds "hello". s1 owns both.' },
        { caption: 's2 = s1. Ownership MOVES. The stack data is copied to s2, but s1 is marked invalid by the compiler. Only s2 owns the heap. At scope end, only s2 drops — no double-free.' },
        { caption: 'calc(&s2). A borrow: a reference to s2\'s String is passed. calc reads len but does not own; the String is NOT freed when calc returns. s2 still owns it.' },
        { caption: 'drop(s2). Explicit free. The compiler knows s2 was the owner; it frees the heap once. Using s2 afterward is a compile error (moved/dropped), preventing use-after-free — statically, before the program ever runs.' },
      ],
    },
    activity: {
      type: 'multipleChoice',
      title: 'Why does `let s2 = s1;` invalidate s1?',
      prompt:
        'In Rust, after `let s1 = String::from("x"); let s2 = s1;`, using s1 ' +
        'is a compile error ("borrow of moved value"). Why does Rust invalidate s1 ' +
        'instead of copying the String?',
      languageId: 'rust',
      data: {
        question: 'Why move instead of copy?',
        options: [
          'Rust cannot copy Strings.',
          'If both s1 and s2 owned the same heap memory, freeing both at scope end would double-free. Moving ownership to s2 means only s2 is freed — exactly one free, no double-free, and use-after-free is impossible because s1 is statically invalid.',
          'Copying is too slow.',
          's1 is deleted from memory.',
        ],
        correctIndex: 1,
        explanation:
          'A String owns heap memory. If assignment copied the pointer (like C), ' +
          'both s1 and s2 would point to the same heap, and freeing both at scope ' +
          'end would free the same memory twice (double-free — memory corruption). ' +
          'Rust prevents this by MOVING ownership: s1 is invalid after the move, so ' +
          'only s2 is dropped. The compiler statically forbids using s1, so ' +
          'use-after-free is impossible. Stack types (integers) implement Copy and ' +
          'are duplicated; heap types are moved to preserve the one-owner invariant.',
      },
      checks: [],
    },
    comprehensionChecks: [
      {
        question: 'What are the three ownership rules in Rust, and what does each prevent?',
        options: [
          'Rules: no pointers, no references, no mutation.',
          'Rule 1: each value has ONE owner (gives a clear free point). Rule 2: ownership MOVES on assignment (prevents double-free — only the new owner is freed). Rule 3: borrows are references that do not transfer ownership (lets you use without owning; the compiler ensures borrows do not outlive the owner, preventing use-after-free and, via exclusive mutable borrows, data races).',
          'Rules: use malloc, use free, use realloc.',
          'Rules: no global variables, no threads, no heap.',
        ],
        correctIndex: 1,
        explanation:
          'The three rules are: (1) one owner per value — the compiler knows exactly ' +
          'when to free (scope end of the owner). (2) assignment moves ownership — ' +
          'the old variable is invalid, so only one variable is freed (no double-free). ' +
          '(3) borrows (&) are non-owning references — you can read/use without ' +
          'transferring ownership, and the compiler guarantees no borrow outlives its ' +
          'owner (no dangling references). Mutable borrows are exclusive (no aliasing ' +
          '+ mutation), which prevents data races at compile time. Together these ' +
          'eliminate use-after-free, double-free, and data races with no GC and no ' +
          'runtime cost.',
      },
      {
        question: 'Why does Rust forbid having both a `&` (shared) borrow and a `&mut` (exclusive) borrow of the same value at the same time?',
        options: [
          'It is too slow.',
          'Allowing both means aliasing (a shared reference) AND mutation (the exclusive reference) simultaneously. The mutation could invalidate what the shared reference points to (iterator invalidation, data race). Forbidding the combination — many readers OR one writer, never both — prevents these bugs at compile time.',
          'It is a bug in Rust.',
          'Shared borrows cannot exist.',
        ],
        correctIndex: 1,
        explanation:
          'If you hold a `&` reference to a value and someone else holds a `&mut` to ' +
          'the same value, the mutation could resize/move/free the underlying data, ' +
          'leaving your `&` pointing at invalid memory (iterator invalidation, the ' +
          'classic C++ bug). Or in concurrent code, two threads aliasing+mutating ' +
          'causes a data race. Rust forbids the combination: either many `&` borrows ' +
          '(all read-only, no mutation possible) or exactly one `&mut` (exclusive, no ' +
          'other alias). This is the "aliasing XOR mutability" rule, and it is the ' +
          'foundation of Rust\'s fearless concurrency.',
      },
    ],
  },
]
