/**
 * Cambric Labs — Module: The Memory Model (Systems)
 *
 * Two lessons: stack vs heap, and pointers and the bugs they cause.
 */
import type { LessonDetail } from '../types'

export const memoryModelLessons: LessonDetail[] = [
  {
    id: 'lesson-stack-vs-heap',
    title: 'Stack vs Heap: Two Kinds of Memory',
    moduleId: 'module-memory-model',
    languageId: 'c',
    difficulty: 4,
    estimatedMinutes: 12,
    summary:
      'The stack stores local variables in call frames; the heap stores ' +
      'long-lived or dynamically-sized data you allocate and free by hand. ' +
      'Each has different speed, lifetime, and safety trade-offs.',
    teachesConceptIds: ['stack-ds', 'memory-model', 'heap', 'pointer', 'memory-management'],
    prerequisiteConceptIds: ['ram', 'cpu', 'function', 'stack-ds'],
    objectives: [
      'Distinguish stack allocation from heap allocation.',
      'Explain why stack allocation is fast and automatic.',
      'Allocate and free heap memory in C with malloc and free.',
      'Identify the lifetime and ownership implications of each.',
    ],
    content: [
      {
        kind: 'paragraph',
        text:
          'In C, memory comes in two regions. The stack holds local ' +
          'variables inside function frames; it grows and shrinks as ' +
          'functions are called and return. The heap holds data you allocate ' +
          'at runtime (malloc) and must free yourself. Stack is fast and ' +
          'automatic; heap is flexible and dangerous.',
      },
      {
        kind: 'heading',
        text: 'The stack: a frame per function call',
      },
      {
        kind: 'codeWithOutput',
        languageId: 'c',
        caption: 'Locals live in the stack frame; freed automatically on return.',
        code: 'int add(int a, int b) {\n    int sum = a + b;   // sum lives in add\'s stack frame\n    return sum;\n}                        // frame popped; sum is gone\n\nint main() {\n    int x = add(2, 3);  // x lives in main\'s frame\n    return x;\n}',
        output: '# each call pushes a frame; return pops it. No manual free needed.',
      },
      {
        kind: 'callout',
        variant: 'info',
        title: 'Why stack is fast',
        text:
          'Allocating stack memory is moving a pointer (the stack pointer). ' +
          'Freeing is moving it back. There is no search, no fragmentation, ' +
          'no bookkeeping. That is why locals are effectively free.',
      },
      {
        kind: 'heading',
        text: 'The heap: allocate at runtime, free by hand',
      },
      {
        kind: 'codeWithOutput',
        languageId: 'c',
        caption: 'malloc asks the heap for bytes; free returns them.',
        code: '#include <stdlib.h>\n\nint *make_array(int n) {\n    int *arr = malloc(n * sizeof(int));  // heap: survives beyond this call\n    arr[0] = 42;\n    return arr;   // returning a heap pointer is fine; it outlives the frame\n}\n\nint main() {\n    int *a = make_array(10);\n    a[1] = 7;\n    free(a);     // YOU must free it; the heap does not auto-free\n    return 0;\n}',
        output: '# without free, the memory leaks; with use-after-free, undefined behaviour',
      },
      {
        kind: 'callout',
        variant: 'warning',
        title: 'The heap is where memory bugs live',
        text:
          'Forget to free → memory leak (the program slowly grows). Free twice ' +
          '→ double-free corruption. Use the pointer after free → undefined ' +
          'behaviour (may look fine, may crash, may be a security hole). ' +
          'Languages like Python and Java avoid this with a garbage collector; ' +
          'Rust avoids it with ownership. C makes you do it by hand.',
      },
      {
        kind: 'heading',
        text: 'When to use which',
      },
      {
        kind: 'paragraph',
        text:
          'Use the stack when the size is known at compile time and the data ' +
          'does not outlive the function (locals, small fixed arrays). Use the ' +
          'heap when the size is dynamic (read from input), the data must ' +
          'outlive the creating function (return a buffer), or the data is ' +
          'large (stack space is limited, often 1-8 MB).',
      },
      {
        kind: 'codeWithOutput',
        languageId: 'c',
        caption: 'Stack overflow: a huge local array blows the stack.',
        code: 'void big() {\n    int arr[1 << 20];  // 4MB on the stack — likely crashes\n    arr[0] = 1;\n}\n// stack is limited (~1-8MB per thread); 4MB locals overflow it\n// fix: use malloc for large or dynamically-sized buffers',
        output: '# Segmentation fault: stack overflow',
      },
      {
        kind: 'callout',
        variant: 'tip',
        title: 'Stack is bounded; heap is (almost) not',
        text:
          'A thread stack is typically 1-8 MB. Huge locals or unbounded ' +
          'recursion blow it. The heap is bounded by available RAM, which is ' +
          'usually gigabytes. Large or dynamically-sized buffers must live on ' +
          'the heap.',
      },
      {
        kind: 'compare',
        languageIds: ['c', 'python'],
        caption:
          'C makes stack/heap explicit (malloc/free). Python hides it: ' +
          'everything complex is heap-allocated and garbage-collected.',
        snippets: [
          'int *a = malloc(10 * sizeof(int));  // explicit heap\nfree(a);                               // explicit free',
          'a = [0] * 10  # heap-allocated list; GC frees it when unreachable',
        ],
      },
    ],
    animation: {
      type: 'memoryDiagram',
      title: 'Stack frames vs heap blocks',
      steps: [
        { caption: 'Call add(2,3): push a frame with locals a=2,b=3,sum. Stack grows.' },
        { caption: 'Return: pop the frame. sum is gone — automatic, instant.' },
        { caption: 'malloc(10 ints): heap gains a 40-byte block; returns its address. Stack unchanged.' },
        { caption: 'Return the pointer: the frame pops, but the heap block survives — its lifetime is independent.' },
        { caption: 'free(ptr): the heap block is returned. Forgetting to free leaks it; using it after free is undefined.' },
      ],
    },
    activity: {
      type: 'multipleChoice',
      title: 'Stack or heap?',
      prompt:
        'You need an array whose size is read from user input at runtime. ' +
        'Where should you allocate it?',
      languageId: 'c',
      data: {
        question: 'Runtime-sized array — stack or heap?',
        options: [
          'Stack — it is faster.',
          'Heap — the size is not known at compile time, so stack allocation is impossible; malloc at runtime.',
          'Neither — use a global.',
          'Stack, with a very large size.',
        ],
        correctIndex: 1,
        explanation:
          'Stack sizes must be known at compile time (the compiler emits a ' +
          'fixed frame size). A runtime-sized buffer must use malloc on the ' +
          'heap. (C99 VLAs use the stack but are optional and dangerous.)',
      },
      checks: [],
    },
    comprehensionChecks: [
      {
        question: 'Why is stack allocation faster than heap allocation?',
        options: [
          'The stack is in faster memory.',
          'Stack allocation is just moving a pointer (push a frame); heap allocation requires the allocator to find and track a free block.',
          'Stack variables are smaller.',
          'The stack is garbage-collected.',
        ],
        correctIndex: 1,
        explanation:
          'Pushing a stack frame is a single pointer move; there is no ' +
          'search or bookkeeping. Heap allocation asks the allocator to find ' +
          'a free block and record its metadata, which is far more work.',
      },
      {
        question: 'What happens if you forget to free heap memory in C?',
        options: [
          'The program crashes immediately.',
          'The memory leaks — it stays allocated and unreachable; over time the program grows and may exhaust memory.',
          'The stack overflows.',
          'Nothing — C frees it automatically.',
        ],
        correctIndex: 1,
        explanation:
          'C has no garbage collector. Unfreed heap memory leaks: it stays ' +
          'allocated but unreachable. Over a long-running process, repeated ' +
          'leaks exhaust memory. Tools like valgrind find these.',
      },
    ],
  },

  {
    id: 'lesson-pointers-and-bugs',
    title: 'Pointers: Power, and the Bugs They Cause',
    moduleId: 'module-memory-model',
    languageId: 'c',
    difficulty: 4,
    estimatedMinutes: 13,
    summary:
      'A pointer is a variable holding a memory address. The power to read ' +
      'and write any address enables use-after-free, dangling pointers, and ' +
      'buffer overflows — the root of most C security bugs.',
    teachesConceptIds: ['pointer', 'memory-model', 'dangling-pointer', 'memory-leak', 'buffer-overflow'],
    prerequisiteConceptIds: ['pointer', 'memory-model', 'stack-ds', 'heap'],
    objectives: [
      'Read and write through a pointer in C.',
      'Recognise a dangling pointer and a use-after-free.',
      'Explain how a buffer overflow corrupts memory.',
      'Describe how Rust prevents these bugs at compile time.',
    ],
    content: [
      {
        kind: 'paragraph',
        text:
          'A pointer is a variable whose value is a memory address. int *p ' +
          'holds the address of an int. Dereferencing (*p) reads or writes ' +
          'the int at that address. That is enormous power — you can read or ' +
          'write any byte — and it is the source of most C security bugs. ' +
          'Every pointer bug is "the address is wrong."',
      },
      {
        kind: 'heading',
        text: 'Read and write through a pointer',
      },
      {
        kind: 'codeWithOutput',
        languageId: 'c',
        caption: '& takes an address; * dereferences.',
        code: 'int x = 10;\nint *p = &x;     // p holds the ADDRESS of x\nprintf("%d\\n", *p);  // 10 — read through the pointer\n*p = 20;              // write through the pointer\nprintf("%d\\n", x);    // 20 — x was changed via p',
        output: '10\n20',
      },
      {
        kind: 'callout',
        variant: 'info',
        title: 'A pointer is just an address',
        text:
          'Under the hood, a pointer is a 64-bit number (on a 64-bit machine) ' +
          'that happens to be a memory address. The type (int *) tells the ' +
          'compiler how many bytes to read when you dereference. The address ' +
          'itself is just a number; the type is the interpretation.',
      },
      {
        kind: 'heading',
        text: 'Dangling pointer: pointing at freed memory',
      },
      {
        kind: 'code',
        languageId: 'c',
        caption: 'After free, the pointer still holds the address — but the memory is gone.',
        code: 'int *p = malloc(sizeof(int));\n*p = 42;\nfree(p);\n*p = 99;   // USE-AFTER-FREE — undefined behaviour\n// p is now DANGLING: it points at memory we no longer own\n// the memory may have been reused; writing 99 corrupts something else',
      },
      {
        kind: 'callout',
        variant: 'warning',
        title: 'Undefined behaviour is not "crashes"',
        text:
          'Use-after-free is undefined behaviour — it might work, might crash, ' +
          'might silently corrupt unrelated data. Worst case, an attacker ' +
          'controls the freed block and your write gives them control. This ' +
          'is how many C exploits work; it is why browsers moved memory- ' +
          'sensitive code to Rust.',
      },
      {
        kind: 'heading',
        text: 'Buffer overflow: writing past the end',
      },
      {
        kind: 'code',
        languageId: 'c',
        caption: 'No bounds check; writing past the array corrupts neighbours.',
        code: 'char buf[4];\nstrcpy(buf, "hello world");  // 12 bytes into a 4-byte buffer\n// writes "hello world\\0" over buf AND the memory after it\n// may overwrite other locals, the return address, anything',
      },
      {
        kind: 'callout',
        variant: 'warning',
        title: 'Overflows are the classic security exploit',
        text:
          'By writing past a buffer, an attacker can overwrite the function ' +
          'return address on the stack. When the function returns, it jumps ' +
          'to attacker-chosen code. This is the stack-smashing attack; modern ' +
          'compilers add stack canaries to detect it, but the root cause is ' +
          'unchecked pointer arithmetic.',
      },
      {
        kind: 'heading',
        text: 'How Rust prevents these at compile time',
      },
      {
        kind: 'paragraph',
        text:
          'Rust makes dangling pointers a compile-time error. The ownership ' +
          'system tracks who owns each heap allocation; when the owner goes ' +
          'out of scope, the memory is freed AND the compiler invalidates all ' +
          'references to it. Using a reference after the owner freed the ' +
          'memory is a compile error, not a runtime crash. This is why Rust ' +
          'is called "fearless concurrency" — the bugs C leaves to the ' +
          'programmer, Rust rejects before the program runs.',
      },
      {
        kind: 'codeWithOutput',
        languageId: 'rust',
        caption: 'Rust rejects use-after-free at compile time.',
        code: 'fn main() {\n    let r;                          // r: reference, not yet valid\n    {\n        let x = String::from("hi");\n        r = &x;                      // r borrows x\n    }                                // x dropped here; r would dangle\n    // println!("{}", r);           // COMPILE ERROR: x does not live long enough\n}',
        output: '# the borrow checker stops the program from compiling',
      },
      {
        kind: 'compare',
        languageIds: ['c', 'rust'],
        caption:
          'C allows the dangling pointer (runtime UB). Rust rejects it at ' +
          'compile time via the borrow checker.',
        snippets: [
          'free(p);\n*p = 99;   // UB: may work, may crash, may be exploited',
          'let r = &x;\n// x dropped; r invalid\n// println!("{}", r); // COMPILE ERROR',
        ],
      },
    ],
    animation: {
      type: 'memoryDiagram',
      title: 'Use-after-free: the address survives the memory',
      steps: [
        { caption: 'malloc(4). p = address 0x1000. *p = 42. Heap: [42] at 0x1000.' },
        { caption: 'free(p). Heap block at 0x1000 is returned to the allocator.' },
        { caption: 'p still holds 0x1000 — the ADDRESS survived, but the memory is no longer ours.' },
        { caption: '*p = 99. We wrote 99 to 0x1000 — but that block may now belong to another allocation.' },
        { caption: 'Undefined behaviour: silent corruption, a crash, or an attacker-controlled overwrite.' },
      ],
    },
    activity: {
      type: 'multipleChoice',
      title: 'What is a dangling pointer?',
      prompt:
        'After free(p), the variable p still holds the same address. What ' +
        'kind of bug is p now?',
      languageId: 'c',
      data: {
        question: 'What is p after free(p)?',
        options: [
          'A null pointer.',
          'A dangling pointer — it holds a valid-looking address, but the memory it points to has been freed; using it is undefined behaviour.',
          'A stack pointer.',
          'A typed pointer.',
        ],
        correctIndex: 1,
        explanation:
          'free returns the block to the allocator but does not change p. ' +
          'p still holds the old address, now pointing at freed (possibly ' +
          'reused) memory. Dereferencing it is use-after-free — undefined ' +
          'behaviour.',
      },
      checks: [],
    },
    comprehensionChecks: [
      {
        question: 'Why are buffer overflows a security problem, not just a crash?',
        options: [
          'They are slow.',
          'Writing past a buffer can overwrite the function return address on the stack, letting an attacker redirect execution to their own code.',
          'They use too much memory.',
          'They corrupt the compiler.',
        ],
        correctIndex: 1,
        explanation:
          'A stack buffer overflow can overwrite the saved return address. ' +
          'When the function returns, it jumps to wherever that address now ' +
          'points — attacker-chosen code. This is the classic stack-smashing ' +
          'exploit; canaries mitigate, but the root is unchecked writes.',
      },
      {
        question: 'How does Rust prevent use-after-free at compile time?',
        options: [
          'It runs a garbage collector.',
          'The borrow checker tracks lifetimes; using a reference after its owner has dropped the data is a compile error.',
          'It disables free.',
          'It uses null pointers instead.',
        ],
        correctIndex: 1,
        explanation:
          'Rust ownership ties each allocation to an owner; when the owner is ' +
          'dropped, all references to it are invalidated by the borrow ' +
          'checker. A use-after-free cannot compile, so it cannot run — the ' +
          'class of bug is eliminated without runtime cost.',
      },
    ],
  },
]
