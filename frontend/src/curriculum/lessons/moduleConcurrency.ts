/**
 * Cambric Labs — Module: Concurrency (Systems)
 *
 * Two lessons: threads and data races (why shared mutable state + threads
 * is hard, the mutex), and deadlock + higher-level patterns (channels,
 * condition variables, message passing).
 */
import type { LessonDetail } from '../types'

export const concurrencyLessons: LessonDetail[] = [
  {
    id: 'lesson-threads-and-data-races',
    title: 'Threads & Data Races: Why Shared Mutable State Is Hard',
    moduleId: 'module-concurrency',
    languageId: 'rust',
    difficulty: 4,
    estimatedMinutes: 13,
    summary:
      'A thread is an independent flow of execution sharing memory with ' +
      'others. Shared memory makes threads fast to communicate but ' +
      'introduces data races: two threads read-modify-write the same ' +
      'location and updates get lost. A mutex serializes access, but only ' +
      'if you use it everywhere.',
    teachesConceptIds: ['thread', 'concurrency', 'data-race', 'mutex', 'atomic-operation'],
    prerequisiteConceptIds: ['function', 'memory-model', 'stack-ds', 'process'],
    objectives: [
      'Explain what a thread is and how it shares memory with other threads.',
      'Reproduce a data race via a read-modify-write interleaving.',
      'Use a mutex to serialize access to shared state.',
      'Explain why "mostly locking" is as bad as "not locking."',
    ],
    content: [
      {
        kind: 'paragraph',
        text:
          'A process has its own memory; a thread shares memory with other ' +
          'threads in the same process. Sharing memory is what makes ' +
          'threads a fast concurrency model — no copying, just talk via ' +
          'shared variables. But sharing memory is also what makes threads ' +
          'dangerous: if two threads read and write the same variable ' +
          'without coordination, updates can be lost. That lost update is a ' +
          'data race, and it is the central pitfall of threads.',
      },
      {
        kind: 'heading',
        text: 'A data race: the lost update',
      },
      {
        kind: 'codeWithOutput',
        languageId: 'rust',
        caption: 'Two threads increment a shared counter; some increments vanish.',
        code: "use std::thread;\nlet counter = std::sync::Arc::new(std::sync::Mutex::new(0));\n// (this version uses a Mutex; see the unsafe version below)\nlet handles: Vec<_> = (0..2).map(|_| {\n    let c = counter.clone();\n    thread::spawn(move || {\n        for _ in 0..1000 { *c.lock().unwrap() += 1; }\n    })\n}).collect();\nfor h in handles { h.join().unwrap(); }\nprintln!(\"{}\", *counter.lock().unwrap());  // 2000 (with the Mutex)",
        output: '2000',
      },
      {
        kind: 'code',
        languageId: 'rust',
        caption: 'WITHOUT the mutex: the increment is read-modify-write, and threads interleave.',
        code: "// *c += 1 is really three steps:\n//   1) tmp = *c        (read)\n//   2) tmp = tmp + 1    (modify)\n//   3) *c = tmp         (write)\n// Thread A reads 0, Thread B reads 0 (before A writes)\n// both compute 1, both write 1 -> one increment LOST\n// run with 2 threads x 1000 -> result is sometimes 1998, sometimes 1743, ...",
      },
      {
        kind: 'callout',
        variant: 'danger',
        title: 'A data race is undefined behaviour',
        text:
          'A data race is not "the wrong answer sometimes." In C/C++/Rust ' +
          'it is undefined behaviour — the compiler is allowed to assume ' +
          'no race exists, so the program can do anything, not just produce ' +
          'a stale count. The only correct program is one with no data ' +
          'races, enforced by synchronization.',
      },
      {
        kind: 'heading',
        text: 'A mutex serializes access',
      },
      {
        kind: 'code',
        languageId: 'rust',
        caption: 'lock() guarantees exclusive access; the lock is released when the guard drops.',
        code: "use std::sync::Mutex;\nlet m = Mutex::new(0);\n{\n    let mut g = m.lock().unwrap();   // blocks until it gets exclusive access\n    *g += 1;                        // safe: no other thread holds the lock\n}                                   // g drops here -> lock released\n// the lock is released automatically when the guard goes out of scope\n// (Rust ties locking to ownership, so you cannot forget to unlock)",
      },
      {
        kind: 'callout',
        variant: 'warning',
        title: '"Mostly locking" is as bad as not locking',
        text:
          'A mutex only works if EVERY access to the shared data takes the ' +
          'lock. One forgotten lock path and you have a race. This is why ' +
          'Rust makes the safe path the default: the compiler enforces that ' +
          'mutable shared state goes through a synchronization primitive, ' +
          'so you cannot "forget" a lock.',
      },
      {
        kind: 'heading',
        text: 'Atomics: lock-free for simple cases',
      },
      {
        kind: 'codeWithOutput',
        languageId: 'rust',
        caption: 'An AtomicUsize increment is a single hardware instruction — no lock, no race.',
        code: "use std::sync::atomic::{AtomicUsize, Ordering};\nlet counter = AtomicUsize::new(0);\n// fetch_add is a single atomic instruction; cannot be interleaved\ncounter.fetch_add(1, Ordering::Relaxed);\ncounter.fetch_add(1, Ordering::Relaxed);\nprintln!(\"{}\", counter.load(Ordering::Relaxed));",
        output: '2',
      },
      {
        kind: 'callout',
        variant: 'info',
        title: 'Atomics vs mutex',
        text:
          'For a single counter, an atomic is faster and simpler than a ' +
          'mutex — the hardware guarantees the read-modify-write is one ' +
          'step. Use a mutex when you need to make several operations ' +
          'atomic together (update two related fields). Use atomics for ' +
          'single independent values (counters, flags).',
      },
      {
        kind: 'compare',
        languageIds: ['rust', 'python'],
        caption:
          'Rust forbids the race at compile time (Send/Sync); Python has a GIL that serializes bytecode but still races on read-modify-write.',
        snippets: [
          "// Rust: shared &mut across threads requires a synchronization primitive\n// the compiler rejects unsynchronized shared mutation",
          "# Python GIL: only one thread runs bytecode at a time,\n# but x += 1 can still be interrupted between read and write\nimport threading\nx = 0\ndef inc():\n    for _ in range(1000): global x; x += 1",
        ],
      },
    ],
    animation: {
      type: 'timeline',
      title: 'A lost update: two threads, one counter, no lock',
      steps: [
        { caption: 'counter = 0. Thread A and Thread B each loop 1000 times.' },
        { caption: 'A reads counter -> 0. B reads counter -> 0 (before A writes). Both hold 0.' },
        { caption: 'A computes 0+1=1, writes counter=1. B computes 0+1=1, writes counter=1. TWO increments produced ONE change.' },
        { caption: 'A lost update. Repeated across the loop -> final count < 2000, non-deterministically.' },
        { caption: 'Fix: wrap counter in a Mutex. lock() before read-modify-write; only one thread in the critical section at a time. No interleaving, no loss.' },
      ],
    },
    activity: {
      type: 'multipleChoice',
      title: 'What is a data race?',
      prompt:
        'Two threads do `x += 1` on a shared int with no lock. What is ' +
        'this and why is it bad?',
      languageId: 'rust',
      data: {
        question: 'What is the problem?',
        options: [
          'A deadlock: both threads wait forever.',
          'A data race: the read-modify-write can interleave so updates are lost, and it is undefined behaviour in most languages.',
          'A memory leak.',
          'Nothing; the answer is always correct.',
        ],
        correctIndex: 1,
        explanation:
          'x += 1 is read, modify, write — three steps. Without a lock, ' +
          'two threads can both read the same old value and both write ' +
          'the same new value, losing an update. Worse, in C/C++/Rust a ' +
          'data race is undefined behaviour, not just a wrong count. ' +
          'Synchronize with a mutex or atomic to prevent it.',
      },
      checks: [],
    },
    comprehensionChecks: [
      {
        question: 'Why is "taking the lock on most access paths" still unsafe?',
        options: [
          'Locks are slow.',
          'A mutex only prevents races if EVERY access to the shared data takes the lock; one unlocked path is enough to race with the locked ones.',
          'Mostly locking causes deadlocks.',
          'It uses too much memory.',
        ],
        correctIndex: 1,
        explanation:
          'Synchronization is all-or-nothing per shared datum. Any single ' +
          'unlocked access races with every locked one, because the lock ' +
          'only protects accesses that take it. This is why languages that ' +
          'enforce locking at the type level (Rust) are safer than those ' +
          'that rely on programmer discipline.',
      },
      {
        question: 'When is an atomic preferable to a mutex?',
        options: [
          'When you need to update several fields together.',
          'When the shared state is a single independent value (a counter, a flag); an atomic makes the read-modify-write one hardware instruction, lock-free and race-free.',
          'When the critical section is large.',
          'Atomics are always better than mutexes.',
        ],
        correctIndex: 1,
        explanation:
          'Atomics excel at single-value counters and flags: the hardware ' +
          'guarantees the operation is indivisible, with no lock overhead. ' +
          'Use a mutex when several operations must be atomic together ' +
          '(update two related fields, read-then-decide-then-write); an ' +
          'atomic cannot group those.',
      },
    ],
  },
  {
    id: 'lesson-deadlock-and-patterns',
    title: 'Deadlock & Concurrency Patterns: Channels Over Shared Locks',
    moduleId: 'module-concurrency',
    languageId: 'go',
    difficulty: 5,
    estimatedMinutes: 13,
    summary:
      'Locks introduce deadlock: two threads each hold a lock the other ' +
      'needs, both wait forever. The four Coffman conditions explain why, ' +
      'and "share memory by communicating" via channels sidesteps the ' +
      'whole problem by making ownership explicit.',
    teachesConceptIds: ['deadlock', 'mutex', 'channel', 'condition-variable', 'read-write-lock'],
    prerequisiteConceptIds: ['thread', 'mutex', 'concurrency', 'data-race', 'queue-ds'],
    objectives: [
      'Recognize the four conditions for deadlock.',
      'Order locks consistently to break the circular-wait condition.',
      'Use a channel to pass ownership of data instead of sharing it.',
      'Choose a read-write lock when reads dominate writes.',
    ],
    content: [
      {
        kind: 'paragraph',
        text:
          'Locks fixed data races, but they introduced a new failure: ' +
          'deadlock. Two threads each hold a lock and wait for the other\'s ' +
          'lock — both block forever. The program does not crash; it just ' +
          'hangs, which is often worse because it fails silently in ' +
          'production. Understanding WHY deadlock happens is the key to ' +
          'avoiding it.',
      },
      {
        kind: 'heading',
        text: 'The four Coffman conditions',
      },
      {
        kind: 'steps',
        caption: 'Deadlock requires ALL four; break any one to prevent it',
        steps: [
          'Mutual exclusion: at least one resource is held exclusively (a lock).',
          'Hold and wait: a thread holds one resource while waiting for another.',
          'No preemption: resources are only released voluntarily (you cannot force a thread to drop a lock).',
          'Circular wait: a cycle of threads each waiting for the next one\'s resource. This is the one you usually break.',
        ],
      },
      {
        kind: 'code',
        languageId: 'go',
        caption: 'Classic deadlock: lock A then B in one goroutine, B then A in another.',
        code: "var a, b sync.Mutex\n\n// goroutine 1: lock a, then b\nfunc f() {\n    a.Lock(); defer a.Unlock()\n    b.Lock(); defer b.Unlock()\n    // work\n}\n\n// goroutine 2: lock b, then a\nfunc g() {\n    b.Lock(); defer b.Unlock()\n    a.Lock(); defer a.Unlock()\n    // work\n}\n// f holds a, waits for b; g holds b, waits for a. DEADLOCK.",
      },
      {
        kind: 'callout',
        variant: 'warning',
        title: 'Fix: lock in a global order',
        text:
          'If every thread acquires locks in the same global order, the ' +
          'circular-wait cycle cannot form: there is no way for two ' +
          'threads to each hold the lock the other needs, because the one ' +
          'further "ahead" in the order would have to acquire out of order. ' +
          'Consistent lock ordering breaks the deadlock mechanically.',
      },
      {
        kind: 'heading',
        text: 'Share memory by communicating (channels)',
      },
      {
        kind: 'paragraph',
        text:
          'Go\'s mantra is "do not communicate by sharing memory; instead, ' +
          'share memory by communicating." Instead of two threads poking ' +
          'the same variable through locks, one thread owns the data and ' +
          'the other sends messages (or the data itself) over a channel. ' +
          'Ownership moves with the message, so only one thread touches the ' +
          'data at a time — by construction, no locks, no races, no deadlock.',
      },
      {
        kind: 'codeWithOutput',
        languageId: 'go',
        caption: 'A channel hands the value from producer to consumer; no shared variable.',
        code: "ch := make(chan int)\n\n// producer: sends values, then closes\ngo func() {\n    for i := 0; i < 3; i++ { ch <- i }\n    close(ch)\n}()\n\n// consumer: ranges until the channel closes\nfor v := range ch {\n    println(v)   // 0, 1, 2\n}",
        output: '0\n1\n2',
      },
      {
        kind: 'callout',
        variant: 'tip',
        title: 'A channel is a thread-safe queue',
        text:
          'Conceptually a channel is a synchronized FIFO: the send blocks ' +
          'until a receiver is ready (unbuffered) or a slot is free ' +
          '(buffered), and the receive blocks until a value is available. ' +
          'The synchronization is built into the primitive, so you do not ' +
          'write a lock — and cannot deadlock on one you never wrote.',
      },
      {
        kind: 'heading',
        text: 'Read-write lock: many readers, one writer',
      },
      {
        kind: 'code',
        languageId: 'go',
        caption: 'RWMutex lets many readers in, or one exclusive writer.',
        code: "var rw sync.RWMutex\nvar data map[string]int\n\nfunc read(k string) int {\n    rw.RLock(); defer rw.RUnlock()   // shared read lock; many at once\n    return data[k]\n}\n\nfunc write(k string, v int) {\n    rw.Lock(); defer rw.Unlock()      // exclusive write lock; blocks all readers\n    data[k] = v\n}\n// when reads >> writes, this scales far better than a plain Mutex",
      },
      {
        kind: 'compare',
        languageIds: ['go', 'rust'],
        caption:
          'Go channels (message passing) vs Rust Mutex (shared state). Both are safe; the idiom differs.',
        snippets: [
          "// Go: send the value over a channel; receiver owns it\nch <- value\nv := <-ch",
          "// Rust: share behind a Mutex; lock to access\nlet g = m.lock().unwrap();\n*g += 1",
        ],
      },
    ],
    animation: {
      type: 'timeline',
      title: 'Deadlock and the channel alternative',
      steps: [
        { caption: 'f locks A, then tries to lock B. g locks B, then tries to lock A.' },
        { caption: 'f holds A, waits for B. g holds B, waits for A. Circular wait -> DEADLOCK. Both block forever.' },
        { caption: 'Fix 1 (lock ordering): both always lock A then B. Whichever gets A first proceeds; the other waits for A, not B. No cycle.' },
        { caption: 'Fix 2 (channels): f owns the data; g sends a request on ch and waits for the reply. No shared lock exists -> no deadlock is possible.' },
        { caption: 'Lesson: prefer message passing (one owner at a time) over shared mutable state behind locks; it removes the deadlock class entirely.' },
      ],
    },
    activity: {
      type: 'ordering',
      title: 'Order the lock-acquire steps to avoid deadlock',
      prompt:
        'Two functions each need locks A and B. Reorder the steps so ' +
        'neither can deadlock.',
      languageId: 'go',
      data: {
        items: [
          'g: lock B',
          'g: lock A',
          'f: lock A',
          'f: lock B',
        ],
        correctOrder: ['f: lock A', 'f: lock B', 'g: lock A', 'g: lock B'],
        explanation:
          'If both functions acquire locks in the same global order ' +
          '(A then B), there is no circular wait. f gets A, then B; g ' +
          'must wait for A before touching either. Whichever gets A ' +
          'first completes fully; the other waits at A, not holding B. ' +
          'No cycle, no deadlock.',
      },
      checks: [],
    },
    comprehensionChecks: [
      {
        question: 'Which Coffman condition do you most often break to prevent deadlock, and how?',
        options: [
          'Mutual exclusion, by removing all locks.',
          'Circular wait, by imposing a global order in which locks are acquired so a cycle cannot form.',
          'No preemption, by killing threads.',
          'Hold and wait, by acquiring no locks at all.',
        ],
        correctIndex: 1,
        explanation:
          'Consistent lock ordering breaks circular wait: if everyone ' +
          'acquires locks in the same order, no thread can hold a lock ' +
          'that an "earlier" thread needs, so the wait graph cannot cycle. ' +
          'It is the most practical condition to break without weakening ' +
          'the locking that prevents data races.',
      },
      {
        question: 'How does "share memory by communicating" (channels) avoid deadlock?',
        options: [
          'Channels are faster than locks.',
          'A channel transfers ownership of data from sender to receiver, so only one thread touches the data at a time; there is no shared lock to wait on, so the circular-wait condition cannot arise.',
          'Channels disable threads.',
          'Channels use no memory.',
        ],
        correctIndex: 1,
        explanation:
          'Message passing moves the data with the message, so the ' +
          'receiver is the sole owner while it works. There is no shared ' +
          'mutable state behind a lock, hence no lock-ordering deadlock. ' +
          'You can still block on a channel (a send with no receiver), but ' +
          'the classic lock-cycle deadlock class disappears.',
      },
    ],
  },
]
