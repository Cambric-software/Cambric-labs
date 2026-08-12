/**
 * Cambric Labs — Lesson: Git & Version Control
 *
 * Teaches Git as a model of SNAPSHOTS, not just commands. Focuses on the
 * mental model (commits as snapshots, branches as labels, the working
 * directory vs staging area vs repository) so commands become intuitive.
 */
import type { LessonDetail } from '../types'

export const lessonGit: LessonDetail = {
  id: 'lesson-git',
  title: 'Git: Snapshots of Your Code Over Time',
  moduleId: 'module-git',
  languageId: 'bash',
  difficulty: 2,
  estimatedMinutes: 13,
  summary:
    'Git records snapshots of your project so you can track history, branch ' +
    'off experiments, and collaborate without overwriting each other.',
  teachesConceptIds: ['version-control', 'commit', 'branch', 'working-directory'],
  prerequisiteConceptIds: [],
  objectives: [
    'Explain the three areas: working directory, staging area, repository.',
    'Create a commit that records a snapshot of your changes.',
    'Create a branch to work on a change in isolation.',
    'Merge a branch back into the main line.',
  ],
  content: [
    {
      kind: 'paragraph',
      text:
        'Every time you change code, you risk losing the working version. ' +
        'Version control solves this: it records SNAPSHOTS of your project ' +
        'over time so you can go back to any point, see exactly what changed, ' +
        'and try experimental changes without risk. Git is the dominant ' +
        'version control system, and understanding its mental model makes its ' +
        'commands intuitive instead of mysterious.',
    },
    {
      kind: 'callout',
      variant: 'info',
      title: 'Git stores snapshots, not diffs',
      text:
        'A common misconception is that Git stores "the changes you made." It ' +
        'actually stores a full SNAPSHOT of every file at each commit (sharing ' +
        'unchanged files efficiently). This is why checking out an old version ' +
        'is instant — Git does not replay a history of diffs, it just restores ' +
        'the stored snapshot. Each commit is a complete picture of your ' +
        'project at one moment.',
    },
    {
      kind: 'heading',
      text: 'The three areas of a Git project',
    },
    {
      kind: 'steps',
      caption: 'Changes flow: working directory → staging area → repository (commit)',
      steps: [
        'Working directory: the actual files on your disk. You edit these freely.',
        'Staging area (the index): a holding area. You add changes here when they are ready to be part of the next snapshot.',
        'Repository (.git): the history of committed snapshots. Once committed, a snapshot is permanent and can be shared.',
      ],
    },
    {
      kind: 'codeWithOutput',
      languageId: 'bash',
      caption: 'The basic cycle: edit, stage, commit, repeat.',
      code:
        '# Edit a file, then stage it (mark it ready for the next snapshot)\ngit add README.md\n\n# Commit the staged change with a message describing it\ngit commit -m "Add README with project description"\n\n# See the history of commits\ngit log --oneline',
      output: '[main abc1234] Add README with project description\n 1 file changed, 5 insertions(+)\n\nabc1234 (HEAD -> main) Add README with project description\n9a8b7c6 Initial commit',
    },
    {
      kind: 'callout',
      variant: 'tip',
      title: 'Commit messages describe WHY, not WHAT',
      text:
        'The code itself shows what changed (git diff). The commit message ' +
        'should explain the REASON for the change. "Fix login redirect bug when ' +
        'session expires" is useful. "changed stuff" is not. Future you will ' +
        'thank you for writing the why.',
    },
    {
      kind: 'heading',
      text: 'Branches: labels that move',
    },
    {
      kind: 'paragraph',
      text:
        'A branch is just a movable label pointing at a commit. When you ' +
        'commit on a branch, the label moves forward to the new commit. ' +
        'Branches are cheap (they are just pointers). They let you work on ' +
        'a feature without disturbing the main line until you are ready.',
    },
    {
      kind: 'codeWithOutput',
      languageId: 'bash',
      caption: 'Create a branch for a feature, switch to it, commit on it.',
      code:
        '# Create and switch to a new branch\ngit checkout -b feature/dark-mode\n\n# Make changes, stage, commit (the feature branch label moves forward)\ngit add styles.css\ngit commit -m "Add dark mode color scheme"\n\n# Switch back to main (main label has not moved — it still points at the old commit)\ngit checkout main\n\n# Merge the feature back into main\ngit merge feature/dark-mode',
      output: 'Switched to a new branch \'feature/dark-mode\'\n[feature/dark-mode def5678] Add dark mode color scheme\n 1 file changed, 20 insertions(+)\nSwitched to branch \'main\'\nUpdating abc1234..def5678\nFast-forward\n styles.css | 20 ++++++++++++',
    },
    {
      kind: 'callout',
      variant: 'warning',
      title: 'The working directory, staging, and repo are SEPARATE',
      text:
        'A classic beginner trap: you edit a file, run git commit, and nothing ' +
        'happens — the commit says "nothing to commit." Why? You edited the ' +
        'working directory but did not STAGE the change. git commit only ' +
        'records what is in the STAGING area. You must git add first. This ' +
        'two-step (add then commit) lets you group related changes into ' +
        'logical commits even if you edited many files at once.',
    },
    {
      kind: 'heading',
      text: 'Why this matters for collaboration',
    },
    {
      kind: 'paragraph',
      text:
        'When a team uses Git, each person works on their own branch. They ' +
        'commit their changes locally. When ready, they push their branch to ' +
        'a shared server (GitHub, GitLab). A teammate reviews the changes and ' +
        'merges them. This means two people can work on the same file ' +
        'simultaneously — Git tracks both histories and combines them. If ' +
        'they edited the same lines, Git asks a human to resolve the conflict.',
    },
    {
      kind: 'compare',
      languageIds: ['bash', 'bash'],
      caption:
        'Two equivalent ways to create and switch to a branch. The modern ' +
        'switch command is clearer and avoids the dual meaning of checkout.',
      snippets: [
        '# Older syntax: checkout does both branch creation and switching\ngit checkout -b feature/login',
        '# Modern syntax (Git 2.23+): explicit and less error-prone\ngit switch -c feature/login',
      ],
    },
  ],
  animation: {
    type: 'dataFlow',
    title: 'A commit: from working directory to repository',
    steps: [
      { caption: 'You edit styles.css in the WORKING DIRECTORY (your files on disk).', highlightLines: [1] },
      { caption: 'git add styles.css copies the change to the STAGING AREA (the index).', highlightLines: [2] },
      { caption: 'The staging area now holds styles.css, ready to be part of the next snapshot.', highlightLines: [3] },
      { caption: 'git commit -m "..." takes the staged snapshot and stores it in the REPOSITORY.', highlightLines: [4] },
      { caption: 'A new commit object is created with a unique hash (e.g. def5678). The branch label moves to it.', highlightLines: [5] },
    ],
  },
  activity: {
    type: 'multipleChoice',
    title: 'Why did the commit say "nothing to commit"?',
    prompt:
      'You edited a file and ran git commit -m "fix bug", but Git said ' +
      '"nothing to commit, working tree clean." What did you forget?',
    languageId: 'bash',
    data: {
      options: [
        'You forgot to run git init first',
        'You forgot to stage the change with git add before committing',
        'You need to push to a remote before you can commit',
        'Your file is too large for Git to handle',
      ],
      correctIndex: 1,
      explanation:
        'git commit only records what is in the STAGING area. If you edited a ' +
        'file but never ran git add, the staging area is empty, so there is ' +
        'nothing to commit. Fix: run git add <file> first, then commit.',
    },
  },
  comprehensionChecks: [
    {
      question: 'What does Git actually store at each commit?',
      options: [
        'Only the lines that changed (a diff)',
        'A full snapshot of every file at that point in time',
        'A backup of the entire repository',
        'Only the commit message and metadata',
      ],
      correctIndex: 1,
      explanation:
        'Git stores a complete snapshot of the project at each commit, sharing ' +
        'unchanged files between commits for efficiency. This makes checking ' +
        'out old versions instant — no replaying diffs.',
    },
    {
      question: 'What is the purpose of the staging area (the index)?',
      options: [
        'It is a backup of your files in case you lose them',
        'It lets you choose which changes go into the next commit, so you can group related changes',
        'It is where Git stores the remote server connection',
        'It holds the commit messages before they are saved',
      ],
      correctIndex: 1,
      explanation:
        'The staging area is a holding area. You add the changes you want in ' +
        'the next commit, then commit. This lets you make a commit of only ' +
        'the bug fix you finished, even if you have unrelated work-in-progress ' +
        'changes in other files.',
    },
    {
      question: 'In Git, what is a branch?',
      options: [
        'A copy of the entire repository stored on a server',
        'A lightweight movable label pointing at a commit',
        'A saved backup of your working directory',
        'A folder containing experimental files',
      ],
      correctIndex: 1,
      explanation:
        'A branch is just a pointer to a commit. Creating a branch is cheap ' +
        '(it creates one small pointer). When you commit on a branch, only ' +
        'that branch\'s label moves; other branches stay where they were.',
    },
  ],
}
