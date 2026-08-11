/**
 * Cambric Labs — Module: CPU & Memory (Foundations)
 *
 * Three lessons on the hardware that runs code: the CPU cycle, RAM vs
 * storage, and hexadecimal as a compact data notation.
 */
import type { LessonDetail } from '../types'

export const hardwareLessons: LessonDetail[] = [
  {
    id: 'lesson-cpu-cycle',
    title: 'The CPU: Fetch, Decode, Execute',
    moduleId: 'module-hardware',
    languageId: 'pseudo',
    difficulty: 1,
    estimatedMinutes: 9,
    summary:
      'A CPU repeats three steps billions of times per second: fetch an ' +
      'instruction, decode it, and execute it. Every program is a long ' +
      'series of these tiny cycles.',
    teachesConceptIds: ['cpu', 'process', 'instruction'],
    prerequisiteConceptIds: ['binary', 'bit'],
    objectives: [
      'Describe the fetch-decode-execute cycle.',
      'Explain what a clock cycle and clock speed mean.',
      'Distinguish an instruction from a program.',
      'Relate CPU registers to the idea of a working scratchpad.',
    ],
    content: [
      {
        kind: 'paragraph',
        text:
          'A computer looks like it is doing many things at once, but the CPU ' +
          'is doing one tiny thing at a time, very fast. It reads an ' +
          'instruction from memory, works out what that instruction means, ' +
          'does it, then moves to the next. Billions of these cycles per ' +
          'second produce the illusion of continuous, complex behaviour.',
      },
      {
        kind: 'heading',
        text: 'The three steps of every cycle',
      },
      {
        kind: 'steps',
        caption: 'One CPU cycle.',
        steps: [
          'Fetch: read the next instruction from memory (the address is in a special register called the program counter).',
          'Decode: the control unit works out which operation the bits encode (add, load, jump, ...).',
          'Execute: the relevant part of the CPU performs the operation and writes any result to a register or memory.',
        ],
      },
      {
        kind: 'callout',
        variant: 'info',
        title: 'A program is just a long sequence of cycles',
        text:
          'A Python print("hi") compiles down to many machine instructions. ' +
          'Each one is a fetch-decode-execute cycle. Your program runs when ' +
          'the CPU walks that instruction list, one cycle at a time.',
      },
      {
        kind: 'heading',
        text: 'Clock speed: cycles per second',
      },
      {
        kind: 'paragraph',
        text:
          'A 3 GHz CPU ticks about 3 billion times per second. Each tick can ' +
          'complete one (sometimes more) instruction. That speed is why a ' +
          'simple loop finishes instantly to your eyes but is still a long ' +
          'walk for the CPU — millions of cycles.',
      },
      {
        kind: 'callout',
        variant: 'tip',
        title: 'Faster clock is not always faster program',
        text:
          'A 4 GHz CPU is not always faster than a 3 GHz one. The number of ' +
          'instructions per cycle (IPC), cache hits, memory speed, and the ' +
          'algorithm all matter. A better algorithm on a slower CPU often ' +
          'beats a worse algorithm on a faster one.',
      },
      {
        kind: 'heading',
        text: 'Registers: the CPU scratchpad',
      },
      {
        kind: 'paragraph',
        text:
          'The CPU has a handful of ultra-fast slots called registers — ' +
          'usually fewer than 32. Most operations work on registers: load a ' +
          'value from RAM into a register, add two registers, store a ' +
          'register back to RAM. Registers are tiny but instant; RAM is ' +
          'large but slower.',
      },
      {
        kind: 'codeWithOutput',
        languageId: 'pseudo',
        caption: 'Pseudocode for adding two numbers at the instruction level.',
        code: '# registers: R1, R2, R3\nLOAD  [addr_a] -> R1   # fetch a from RAM\nLOAD  [addr_b] -> R2   # fetch b from RAM\nADD   R1 + R2   -> R3  # execute: add\nSTORE R3 -> [addr_c]  # write result to RAM',
        output: '# four cycles: two loads, one add, one store',
      },
      {
        kind: 'compare',
        languageIds: ['pseudo', 'python'],
        caption:
          'The CPU sees the left; Python hides it behind the right. The ' +
          'high-level statement is still those machine cycles underneath.',
        snippets: [
          '# LOAD a; LOAD b; ADD; STORE c\n# roughly 4 instructions',
          'c = a + b  # one statement, several machine cycles under the hood',
        ],
      },
    ],
    animation: {
      type: 'codeWalk',
      title: 'One fetch-decode-execute cycle',
      steps: [
        { caption: 'Program counter points at the next instruction address.', highlightLines: [1] },
        { caption: 'Fetch: the instruction bits travel from RAM to the CPU.' },
        { caption: 'Decode: the control unit recognises "ADD R1 R2 -> R3".' },
        { caption: 'Execute: the ALU adds R1 and R2, result lands in R3.' },
        { caption: 'Program counter advances to the next instruction. Repeat.' },
      ],
    },
    activity: {
      type: 'ordering',
      title: 'Order the CPU cycle',
      prompt: 'Put the three CPU cycle steps in the correct order.',
      languageId: 'pseudo',
      data: {
        items: ['Execute the operation and store any result', 'Fetch the next instruction from memory', 'Decode the instruction to find the operation'],
        correctOrder: [1, 2, 0],
      },
      checks: [],
    },
    comprehensionChecks: [
      {
        question: 'What does the program counter hold?',
        options: [
          'The result of the last instruction.',
          'The address of the next instruction to fetch.',
          'The clock speed.',
          'The number of registers.',
        ],
        correctIndex: 1,
        explanation:
          'The program counter is a special register that always points at ' +
          'the address of the next instruction. After a fetch, it advances ' +
          'so the next cycle fetches the following instruction.',
      },
      {
        question: 'Why is a 4 GHz CPU not always faster than a 3 GHz CPU?',
        options: [
          'Clock speed is irrelevant.',
          'Instructions per cycle, cache, memory speed, and the algorithm all matter, not just the tick rate.',
          '4 GHz CPUs are fake.',
          'The 3 GHz CPU has more registers.',
        ],
        correctIndex: 1,
        explanation:
          'Clock speed is one factor. IPC (how much work per tick), cache hit ' +
          'rate, memory latency, and especially the algorithm decide real ' +
          'speed. A better algorithm on a slower CPU usually wins.',
      },
    ],
  },

  {
    id: 'lesson-ram-and-storage',
    title: 'RAM vs Storage: Fast and Temporary, Slow and Permanent',
    moduleId: 'module-hardware',
    languageId: 'pseudo',
    difficulty: 2,
    estimatedMinutes: 9,
    summary:
      'RAM is fast, volatile working memory cleared on power loss; storage ' +
      'is slower, non-volatile, and keeps your files when the machine is off.',
    teachesConceptIds: ['ram', 'storage', 'memory-model', 'filesystem'],
    prerequisiteConceptIds: ['cpu', 'binary', 'byte'],
    objectives: [
      'Distinguish volatile (RAM) from non-volatile (storage) memory.',
      'Explain why running programs live in RAM, not on disk.',
      'Describe the speed and cost trade-off between RAM and storage.',
      'Relate "saving a file" to copying from RAM to storage.',
    ],
    content: [
      {
        kind: 'paragraph',
        text:
          'A computer has two main kinds of memory. RAM is fast and temporary — ' +
          'it holds the program and data you are using right now, and it is ' +
          'wiped when power is lost. Storage (disk, SSD) is slower but ' +
          'permanent — it keeps your files and installed programs even when ' +
          'the machine is off.',
      },
      {
        kind: 'heading',
        text: 'Running programs live in RAM',
      },
      {
        kind: 'paragraph',
        text:
          'When you launch a program, the operating system copies its ' +
          'instructions and data from storage into RAM. The CPU then reads ' +
          'and writes RAM during execution. RAM is fast enough to keep up ' +
          'with the CPU; storage is not. That is why programs do not run ' +
          'directly from disk — the CPU would spend most of its time waiting.',
      },
      {
        kind: 'callout',
        variant: 'info',
        title: 'RAM is volatile',
        text:
          'RAM needs constant power to hold its bits. Cut the power and the ' +
          'contents vanish in microseconds. This is why unsaved work is lost ' +
          'in a power cut — it existed only in RAM.',
      },
      {
        kind: 'heading',
        text: 'The speed gap, roughly',
      },
      {
        kind: 'codeWithOutput',
        languageId: 'pseudo',
        caption: 'Rough latency comparison (orders of magnitude).',
        code: 'register access:    ~1 ns       (CPU scratchpad)\nRAM access:         ~100 ns     (working memory)\nSSD read:           ~100,000 ns (storage)\nHDD read:           ~10,000,000 ns (spinning disk)',
        output: '# RAM is ~1000x faster than SSD; SSD is ~100x faster than HDD',
      },
      {
        kind: 'callout',
        variant: 'warning',
        title: 'The gap is why loading feels slow',
        text:
          'A big app loads slowly because it must copy gigabytes from slow ' +
          'storage into fast RAM before the CPU can run it. Once loaded, it ' +
          'is responsive because RAM keeps up with the CPU.',
      },
      {
        kind: 'heading',
        text: 'Saving = copying RAM to storage',
      },
      {
        kind: 'paragraph',
        text:
          'When you edit a document, your changes live in RAM. "Save" copies ' +
          'that RAM content to storage so it survives a power loss. Closing ' +
          'without saving discards the RAM copy — the storage version is ' +
          'unchanged, which is why your edits are gone.',
      },
      {
        kind: 'compare',
        languageIds: ['pseudo', 'python'],
        caption:
          'Loading a file conceptually; Python opens and reads it into a ' +
          'variable (RAM). The disk-to-RAM copy is what open() does.',
        snippets: [
          '# load: copy file bytes from storage into RAM\n# edit: mutate the RAM copy\n# save: copy RAM bytes back to storage',
          'data = open("notes.txt").read()  # disk -> RAM\ndata = data.replace("a", "b")\nopen("notes.txt", "w").write(data)  # RAM -> disk',
        ],
      },
    ],
    animation: {
      type: 'memoryDiagram',
      title: 'Storage vs RAM vs register speeds',
      steps: [
        { caption: 'Register: ~1 ns. The CPU touches it every cycle.' },
        { caption: 'RAM: ~100 ns. 100x slower than a register, but the working home for running code.' },
        { caption: 'SSD: ~100,000 ns. 1000x slower than RAM. Permanent but slow to read.' },
        { caption: 'HDD: ~10,000,000 ns. 100x slower than SSD. Spinning metal, cheapest per byte.' },
        { caption: 'This is why the OS loads programs into RAM before running them.' },
      ],
    },
    activity: {
      type: 'multipleChoice',
      title: 'Where does your work live?',
      prompt:
        'You are editing a document and have NOT pressed save. Where do ' +
        'your recent edits live?',
      languageId: 'pseudo',
      data: {
        question: 'Unsaved edits to a document — where are they?',
        options: [
          'On the SSD, permanently.',
          'In RAM only; they will be lost if power is cut.',
          'In the CPU registers.',
          'Nowhere — edits are imaginary until saved.',
        ],
        correctIndex: 1,
        explanation:
          'Edits live in RAM. RAM is volatile: lose power and the edits ' +
          'vanish. Saving copies them to storage (non-volatile) so they ' +
          'survive.',
      },
      checks: [],
    },
    comprehensionChecks: [
      {
        question: 'Why does the OS copy a program from storage into RAM before running it?',
        options: [
          'RAM is bigger than storage.',
          'RAM is fast enough to keep up with the CPU; running directly from storage would stall the CPU on every instruction.',
          'Storage cannot hold programs.',
          'RAM is non-volatile.',
        ],
        correctIndex: 1,
        explanation:
          'Storage is orders of magnitude slower than RAM. The CPU would ' +
          'spend most cycles waiting for disk. Copying to RAM first lets the ' +
          'CPU fetch instructions at full speed.',
      },
      {
        question: 'Which memory is non-volatile (keeps data without power)?',
        options: ['RAM', 'Registers', 'Storage (SSD/HDD)', 'Cache'],
        correctIndex: 2,
        explanation:
          'Storage (SSD, HDD) is non-volatile — it retains data without ' +
          'power. RAM, registers, and cache are all volatile and lose their ' +
          'contents on power loss.',
      },
    ],
  },

  {
    id: 'lesson-hexadecimal',
    title: 'Hexadecimal: A Compact Way to Read Bytes',
    moduleId: 'module-hardware',
    languageId: 'pseudo',
    difficulty: 2,
    estimatedMinutes: 9,
    summary:
      'Hexadecimal (base-16) packs one byte into two digits, making it the ' +
      'standard notation for memory addresses, colours, and raw byte data.',
    teachesConceptIds: ['hexadecimal', 'binary', 'byte', 'bit'],
    prerequisiteConceptIds: ['binary', 'bit', 'byte'],
    objectives: [
      'Convert between binary, decimal, and hexadecimal.',
      'Explain why hex is used to represent bytes.',
      'Read a colour like #FF0000 as a hex byte triple.',
      'Read a memory address written in hex.',
    ],
    content: [
      {
        kind: 'paragraph',
        text:
          'Binary is the truth of the machine, but 101100111000 is painful ' +
          'for humans to read. Hexadecimal (base-16) uses the digits 0-9 ' +
          'then A-F to pack four bits into one digit. A byte (8 bits) becomes ' +
          'exactly two hex digits — compact and easy to read.',
      },
      {
        kind: 'heading',
        text: 'Sixteen digits, four bits each',
      },
      {
        kind: 'codeWithOutput',
        languageId: 'pseudo',
        caption: 'The hex digits and their binary and decimal meanings.',
        code: 'hex:  0  1  2  3  4  5  6  7  8  9  A  B  C  D  E  F\ndec:  0  1  2  3  4  5  6  7  8  9 10 11 12 13 14 15\nbin: 0000 ...                                       1111\n# one hex digit == 4 bits == half a byte (a "nibble")',
        output: '# F = 15 = 1111 ; A = 10 = 1010 ; 0 = 0 = 0000',
      },
      {
        kind: 'callout',
        variant: 'tip',
        title: 'Each hex digit is a nibble',
        text:
          'Because 16 = 2^4, one hex digit maps to exactly four bits. So a ' +
          'byte (8 bits) is always two hex digits: 11111111 = FF, 00000000 = ' +
          '00, 10110011 = B3. No arithmetic needed — group the bits in fours ' +
          'and translate each group.',
      },
      {
        kind: 'heading',
        text: 'Converting by grouping',
      },
      {
        kind: 'codeWithOutput',
        languageId: 'pseudo',
        caption: 'Binary to hex: split into nibbles, translate each.',
        code: 'binary:  1011 0011\n         B    3\nhex:     B3\n\ndecimal: B3 = 11*16 + 3 = 179',
        output: '# 10110011 (binary) = B3 (hex) = 179 (decimal)',
      },
      {
        kind: 'heading',
        text: 'Hex is everywhere: colours and addresses',
      },
      {
        kind: 'paragraph',
        text:
          'A CSS colour like #FF0000 is three bytes: red=FF (255), green=00, ' +
          'blue=00. Hex makes the byte boundaries obvious. Memory addresses ' +
          'are also written in hex: 0x7FFE is a typical pointer value. The ' +
          '0x prefix just says "this is hex" — drop it and the digits are ' +
          'the address.',
      },
      {
        kind: 'codeWithOutput',
        languageId: 'python',
        caption: 'Python hex() and int() convert between notations.',
        code: 'print(hex(255))        # 0xff\nprint(int("ff", 16))   # 255\nprint(int("0xff", 16)) # 255\n# colour #FF8800: R=255, G=136, B=0\nprint(int("FF",16), int("88",16), int("00",16))',
        output: '0xff\n255\n255\n255 136 0',
      },
      {
        kind: 'callout',
        variant: 'info',
        title: 'Hex does not change the value, only the notation',
        text:
          '255, 0xFF, 11111111, and 0b11111111 are the same number in ' +
          'different clothing. The CPU stores bits; hex, decimal, and binary ' +
          'are just how we WRITE those bits for different human purposes.',
      },
      {
        kind: 'compare',
        languageIds: ['python', 'javascript'],
        caption:
          'Both languages support 0x literals and a conversion function.',
        snippets: [
          'print(0xFF)         # 255\nprint(hex(255))     # 0xff',
          'console.log(0xFF);          // 255\nconsole.log((255).toString(16)); // ff',
        ],
      },
    ],
    animation: {
      type: 'dataFlow',
      title: 'Binary -> nibbles -> hex',
      steps: [
        { caption: 'Byte: 10110011.' },
        { caption: 'Split into nibbles: 1011 and 0011.' },
        { caption: '1011 = 8+2+1 = 11 = B.' },
        { caption: '0011 = 2+1 = 3.' },
        { caption: 'Result: B3. Two hex digits, one byte — no long string of 1s and 0s.' },
      ],
    },
    activity: {
      type: 'predictOutput',
      title: 'Convert hex to decimal',
      prompt:
        'What is int("1F", 16)? (1F means 1*16 + 15.)',
      languageId: 'python',
      starterCode: 'print(int("1F", 16))',
      checks: [
        { description: 'Decimal value of hex 1F', assertion: { kind: 'outputEquals', value: '31' } },
      ],
    },
    comprehensionChecks: [
      {
        question: 'Why is hexadecimal used to represent bytes instead of binary?',
        options: [
          'Hex is faster for the CPU.',
          'One byte is exactly two hex digits, far more compact and readable than eight binary digits.',
          'Hex has more digits so it is more precise.',
          'Binary is not a real number system.',
        ],
        correctIndex: 1,
        explanation:
          '16 = 2^4, so each hex digit is exactly 4 bits. A byte (8 bits) ' +
          'becomes two hex digits. FF is far easier to read than 11111111.',
      },
      {
        question: 'In the colour #00FF00, what do the bytes mean?',
        options: [
          'Red=0, Green=255, Blue=0 — pure green.',
          'Red=255, Green=0, Blue=0 — pure red.',
          'All zero — black.',
          'All 255 — white.',
        ],
        correctIndex: 0,
        explanation:
          'The colour is three bytes: red=00, green=FF, blue=00. Green at ' +
          'full intensity, red and blue off — pure green. Hex makes the byte ' +
          'boundaries obvious.',
      },
    ],
  },
]
