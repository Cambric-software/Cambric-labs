/**
 * Cambric Labs — Module: Files & the Terminal (Foundations)
 *
 * Two lessons: the filesystem as a tree, and the terminal/command line.
 */
import type { LessonDetail } from '../types'

export const terminalAndFilesLessons: LessonDetail[] = [
  {
    id: 'lesson-filesystem',
    title: 'The Filesystem: A Tree of Folders and Files',
    moduleId: 'module-terminal-and-files',
    languageId: 'pseudo',
    difficulty: 1,
    estimatedMinutes: 9,
    summary:
      'The filesystem organises data as a tree of folders containing files. ' +
      'Paths are just directions through that tree.',
    teachesConceptIds: ['filesystem', 'tree', 'operating-system'],
    prerequisiteConceptIds: ['storage', 'tree'],
    objectives: [
      'Describe a filesystem as a tree of directories and files.',
      'Read an absolute and a relative path.',
      'Explain the difference between a file and a directory.',
      'Navigate using . (current) and .. (parent).',
    ],
    content: [
      {
        kind: 'paragraph',
        text:
          'Everything you save — documents, programs, photos — lives in the ' +
          'filesystem, which is a tree. Directories (folders) contain files ' +
          'and other directories. A path is just a set of directions: "from ' +
          'the root, go into home, then into cam, then open notes.txt."',
      },
      {
        kind: 'heading',
        text: 'A tree, rooted at /',
      },
      {
        kind: 'codeWithOutput',
        languageId: 'pseudo',
        caption: 'A small filesystem tree.',
        code: '/\n  home/\n    cam/\n      notes.txt\n      projects/\n        app.py\n  etc/\n    config.yaml',
        output: '# "/" is the root; every path starts here (absolute)',
      },
      {
        kind: 'callout',
        variant: 'info',
        title: 'A directory is a special file that lists children',
        text:
          'On disk, a directory is just a file whose content is a list of ' +
          'names and pointers to other files/directories. The tree shape is ' +
          'a convention layered over that, which is why you can have cycles ' +
          'via symlinks but the everyday model is strictly a tree.',
      },
      {
        kind: 'heading',
        text: 'Absolute vs relative paths',
      },
      {
        kind: 'paragraph',
        text:
          'An absolute path starts from the root (/home/cam/notes.txt) and ' +
          'works from anywhere. A relative path starts from the current ' +
          'directory: if you are in /home/cam, then projects/app.py is a ' +
          'relative path to the same file as /home/cam/projects/app.py.',
      },
      {
        kind: 'codeWithOutput',
        languageId: 'bash',
        caption: 'Absolute and relative paths point to the same file.',
        code: '# absolute (from root):\n/home/cam/projects/app.py\n\n# if your current directory is /home/cam:\nprojects/app.py       # same file, relative\n./projects/app.py    # the ./ means "current dir", optional\n../etc/config.yaml   # .. means "parent" — go up one level',
        output: '# all three resolve to real files',
      },
      {
        kind: 'callout',
        variant: 'tip',
        title: '. and .. are the navigation keys',
        text:
          '. means "the current directory" and .. means "go up to the parent." ' +
          'Almost every relative path uses one of these. ../.. means "go up ' +
          'two levels." Tab-completion in terminals uses these constantly.',
      },
      {
        kind: 'heading',
        text: 'File vs directory: the core distinction',
      },
      {
        kind: 'paragraph',
        text:
          'A file holds data (text, an image, a program). A directory holds ' +
          'references to other files and directories — it is the container, ' +
          'not the content. You read a file; you list a directory. Most ' +
          'commands behave differently for each (ls on a directory lists it; ' +
          'ls on a file errors or shows the file name).',
      },
      {
        kind: 'compare',
        languageIds: ['bash', 'python'],
        caption:
          'The shell and Python both express paths as strings with the same ' +
          'separators. Python adds pathlib for object-oriented paths.',
        snippets: [
          'ls /home/cam/projects       # list the directory\ncat /home/cam/projects/app.py  # read the file',
          'from pathlib import Path\np = Path("/home/cam/projects/app.py")\nprint(p.parent)  # /home/cam/projects',
        ],
      },
    ],
    animation: {
      type: 'treeTraversal',
      title: 'Walking a path through the filesystem tree',
      steps: [
        { caption: 'Path: /home/cam/projects/app.py. Start at root /.' },
        { caption: 'Enter home/. Enter cam/. Enter projects/.' },
        { caption: 'Open app.py. Four steps, one per path segment.' },
        { caption: 'A relative path projects/app.py from /home/cam skips the first two steps.' },
      ],
    },
    activity: {
      type: 'multipleChoice',
      title: 'What does .. mean in a path?',
      prompt: 'In the path ../etc/config, what does the .. represent?',
      languageId: 'pseudo',
      data: {
        question: 'What does .. mean in a path?',
        options: [
          'The root directory.',
          'The parent of the current directory (go up one level).',
          'A hidden file.',
          'The current directory.',
        ],
        correctIndex: 1,
        explanation:
          '.. always means "go up to the parent." It is how relative paths ' +
          'escape the current directory. . means "current directory."',
      },
      checks: [],
    },
    comprehensionChecks: [
      {
        question: 'What is the difference between an absolute and a relative path?',
        options: [
          'Absolute paths are longer.',
          'Absolute paths start from the root (/) and work anywhere; relative paths start from the current directory.',
          'Absolute paths are faster.',
          'Relative paths are only for files.',
        ],
        correctIndex: 1,
        explanation:
          'Absolute paths begin with / and are anchored at the filesystem ' +
          'root, so they resolve the same from any current directory. ' +
          'Relative paths depend on where you are when you use them.',
      },
      {
        question: 'What distinguishes a file from a directory?',
        options: [
          'Files are bigger.',
          'A file holds data; a directory holds references to other files and directories.',
          'Directories cannot be renamed.',
          'Files cannot be inside directories.',
        ],
        correctIndex: 1,
        explanation:
          'A file stores content (text, image, code). A directory stores a ' +
          'list of names pointing to files and subdirectories. You read a ' +
          'file; you list a directory.',
      },
    ],
  },

  {
    id: 'lesson-command-line',
    title: 'The Command Line: Talking to the OS in Text',
    moduleId: 'module-terminal-and-files',
    languageId: 'bash',
    difficulty: 2,
    estimatedMinutes: 11,
    summary:
      'A terminal lets you type commands the operating system runs directly. ' +
      'A few core commands (ls, cd, cat, mkdir) cover most daily filesystem work.',
    teachesConceptIds: ['command-line', 'terminal', 'filesystem', 'operating-system', 'process'],
    prerequisiteConceptIds: ['filesystem', 'terminal'],
    objectives: [
      'Use ls, cd, pwd, cat, mkdir, and rm to navigate and modify the filesystem.',
      'Explain what a shell is and how it parses a command line.',
      'Distinguish flags (options) from arguments.',
      'Combine commands with pipes and redirects.',
    ],
    content: [
      {
        kind: 'paragraph',
        text:
          'A terminal is a text window that sends commands to a shell and ' +
          'shows the output. The shell (bash, zsh, PowerShell) reads each ' +
          'line, splits it into a program name plus arguments, runs that ' +
          'program, and prints the result. It is the most direct way to talk ' +
          'to the operating system.',
      },
      {
        kind: 'heading',
        text: 'The five commands you use daily',
      },
      {
        kind: 'codeWithOutput',
        languageId: 'bash',
        caption: 'Navigation and inspection commands.',
        code: 'pwd               # print working directory — where am I?\nls                # list files in the current directory\nls -l             # long format (permissions, size, date)\ncd projects       # change into the projects subdirectory\ncd ..             # go back up to the parent\ncat app.py        # print the contents of app.py',
        output: '/home/cam\napp.py  notes.txt  README.md\n# -l output shows permissions, owner, size, date\n# cat prints the file contents',
      },
      {
        kind: 'callout',
        variant: 'info',
        title: 'Flags vs arguments',
        text:
          'In ls -l projects, "-l" is a flag (an option that changes how ls ' +
          'behaves — long format) and "projects" is an argument (the thing ' +
          'to act on). Flags usually start with - and can be combined: ' +
          'ls -la means -l and -a together.',
      },
      {
        kind: 'heading',
        text: 'Creating and removing',
      },
      {
        kind: 'codeWithOutput',
        languageId: 'bash',
        caption: 'mkdir and rm change the filesystem.',
        code: 'mkdir new_folder      # make a directory\ntouch file.txt        # create an empty file (or update its time)\nrm file.txt           # remove a file (no trash — gone)\nrm -r new_folder      # remove a directory recursively (and contents)',
        output: '# rm is permanent — there is usually no undo',
      },
      {
        kind: 'callout',
        variant: 'warning',
        title: 'rm is forever',
        text:
          'rm deletes immediately — it does not move to a trash. A typo like ' +
          'rm -rf / has destroyed production servers. Always re-read an rm ' +
          'command before pressing enter, especially with -r and -f.',
      },
      {
        kind: 'heading',
        text: 'Pipes and redirects: chain commands',
      },
      {
        kind: 'paragraph',
        text:
          'The | pipe takes one command output and feeds it as input to the ' +
          'next. The > redirect writes output to a file instead of the ' +
          'screen. These two symbols turn simple commands into a composable ' +
          'toolkit.',
      },
      {
        kind: 'codeWithOutput',
        languageId: 'bash',
        caption: 'Pipes and redirects compose commands.',
        code: 'ls -l | grep ".py"      # list files, keep only .py lines\nls > files.txt          # write the listing to files.txt (overwrites)\necho "hi" >> files.txt   # append to files.txt\nsort < names.txt         # read names.txt as input to sort',
        output: '# grep filters; > and >> redirect; < feeds a file as input',
      },
      {
        kind: 'callout',
        variant: 'tip',
        title: 'Why text matters',
        text:
          'Because commands read and write text, you can combine them: ' +
          'grep, sort, wc, head, tail. Each does one thing; the pipe lets you ' +
          'build a pipeline. This is the Unix philosophy — small sharp tools ' +
          'that work together through text.',
      },
      {
        kind: 'compare',
        languageIds: ['bash', 'powershell'],
        caption:
          'Bash (Linux/macOS) and PowerShell (Windows) are different shells ' +
          'with similar concepts. Most commands have analogues.',
        snippets: [
          'ls -l                # bash\nls | grep ".py"       # bash pipe',
          'Get-ChildItem        # PowerShell (alias: ls)\nGet-ChildItem | Select-String ".py"  # PS pipe',
        ],
      },
    ],
    animation: {
      type: 'timeline',
      title: 'A pipe: ls output feeds grep',
      steps: [
        { caption: 'ls -l prints a long listing to stdout.' },
        { caption: 'The | symbol connects ls stdout to grep stdin.' },
        { caption: 'grep ".py" reads each line, keeps only those containing ".py".' },
        { caption: 'grep stdout goes to the terminal. You see only the .py files.' },
        { caption: 'Two programs, one stream of text, composed by a single character.' },
      ],
    },
    activity: {
      type: 'multipleChoice',
      title: 'What does | do?',
      prompt: 'In `ls | grep ".py"`, what does the | (pipe) do?',
      languageId: 'bash',
      data: {
        question: 'What does the pipe | do?',
        options: [
          'Runs the two commands one after another.',
          'Connects the first command stdout to the second command stdin, so the second filters the first output.',
          'Prints both outputs separately.',
          'Causes an error.',
        ],
        correctIndex: 1,
        explanation:
          'The pipe feeds the first command stdout as the second command ' +
          'stdin. grep receives the ls listing and filters it. The two run ' +
          'as a pipeline, sharing a stream of text.',
      },
      checks: [],
    },
    comprehensionChecks: [
      {
        question: 'In `ls -l projects`, what is "-l"?',
        options: [
          'A file to list.',
          'A flag (option) that changes how ls behaves — here, long format.',
          'The output file.',
          'An error.',
        ],
        correctIndex: 1,
        explanation:
          '-l is a flag: an option that modifies the command behaviour. ' +
          'projects is the argument (what to act on). Flags typically start ' +
          'with - and can be combined, e.g. -la.',
      },
      {
        question: 'Why is rm considered dangerous?',
        options: [
          'It is slow.',
          'It deletes immediately with no trash/undo; a typo can wipe important files irrecoverably.',
          'It uses too much memory.',
          'It only works on directories.',
        ],
        correctIndex: 1,
        explanation:
          'rm removes files directly from the filesystem — there is no ' +
          'recycle bin and no undo. Combined with -r (recursive) and -f ' +
          '(force), a small typo can delete huge trees permanently.',
      },
    ],
  },
]
