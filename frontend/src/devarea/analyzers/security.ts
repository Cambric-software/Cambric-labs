/**
 * Cambric Labs — Developer Area: Security Analyzers (extended)
 *
 * Genuine security-focused static rules that go beyond the cross-language
 * hardcoded-secret detector in common.ts. Each catches a distinct, named
 * vulnerability class (XSS, command injection, path traversal, weak crypto,
 * open redirect) and explains the attack so a learner understands the risk,
 * not just the lint rule.
 *
 * Heuristic (no full parser) — runs instantly, stays memory-bounded. These
 * flag *suspicious* patterns; confirmation requires understanding intent.
 */
import type { AnalysisInput, Analyzer, Finding, SourceRange } from '../types'

function lineOf(source: string, offset: number): number {
  let line = 1
  for (let i = 0; i < offset && i < source.length; i++) {
    if (source[i] === '\n') line++
  }
  return line
}

function rangeFor(lineNumber: number, column: number, length: number): SourceRange {
  return { startLine: lineNumber, endLine: lineNumber, startColumn: column, endColumn: column + length }
}

const WEB_LANGS = ['javascript', 'typescript', 'php', 'ruby', 'python', 'java']

/**
 * XSS via innerHTML / document.write with dynamic content. Inserting
 * untrusted input as HTML lets an attacker inject <script> tags. Flag
 * innerHTML / outerHTML / insertAdjacentHTML assignments that reference a
 * variable (not a string literal), and document.write(variable).
 */
const xssInnerHTMLAnalyzer: Analyzer = {
  id: 'sec-xss-innerhtml',
  label: 'XSS via innerHTML',
  category: 'security',
  supportedLanguages: WEB_LANGS,
  analyze({ code }: AnalysisInput): Finding[] {
    const findings: Finding[] = []
    // .innerHTML = / .outerHTML = / insertAdjacentHTML(...,  where RHS is not a quoted literal
    const regex = /\.(innerHTML|outerHTML)\s*=\s*([^"'\s][^;]*)/g
    let match: RegExpExecArray | null
    while ((match = regex.exec(code)) !== null) {
      const rhs = match[2].trim()
      // skip pure string-literal assignments (no variable interpolation)
      if (/^['"`]/.test(rhs) && !/\$\{/.test(rhs) && !/\+/ .test(rhs)) continue
      const line = lineOf(code, match.index)
      findings.push({
        ruleId: 'sec-xss-innerhtml',
        category: 'security',
        severity: 'critical',
        message: `Potential XSS: ${match[1]} assigned dynamic content.`,
        range: rangeFor(line, match.index, match[0].length),
        explanation:
          'Assigning dynamic data to innerHTML/outerHTML renders it as HTML. ' +
          'If the data came from a user, an attacker can inject <script> or ' +
          'onerror= payloads that run in other users\' browsers (stored/reflected ' +
          'XSS). Use textContent (treats input as text, never HTML), or sanitize ' +
          'with a library like DOMPurify before inserting as HTML.',
        suggestion: { title: 'Use textContent, or sanitize HTML before insertion', rationale: 'textContent never parses input as HTML, eliminating script injection.' },
      })
    }
    // document.write with a non-literal argument
    const dwRegex = /document\s*\.\s*write\s*\(\s*([^)"']\w[^)]*)\)/g
    while ((match = dwRegex.exec(code)) !== null) {
      const line = lineOf(code, match.index)
      findings.push({
        ruleId: 'sec-xss-innerhtml',
        category: 'security',
        severity: 'critical',
        message: `Potential XSS: document.write with dynamic content.`,
        range: rangeFor(line, match.index, match[0].length),
        explanation:
          'document.write renders its argument as HTML in the document stream. ' +
          'Passing user-controlled data allows script injection (XSS). Use DOM ' +
          'APIs (createElement + textContent) so input is treated as text, not markup.',
        suggestion: { title: 'Use createElement + textContent' },
      })
    }
    return findings
  },
}

/**
 * Command injection: exec/spawn/system/os.system with a shell string built
 * from dynamic input. An attacker who controls part of the string can append
 * shell metacharacters (; | && $()) to run arbitrary commands. Flag shell-string
 * execution with concatenation or interpolation.
 */
const commandInjectionAnalyzer: Analyzer = {
  id: 'sec-command-injection',
  label: 'Command injection',
  category: 'security',
  supportedLanguages: ['javascript', 'typescript', 'python', 'ruby', 'php'],
  analyze({ code }: AnalysisInput): Finding[] {
    const findings: Finding[] = []
    // exec(...), execSync(...), spawn('sh', ['-c', ...]) with string concat/interp
    const regex = /(?:child_process\s*\.\s*)?(?:exec|execSync|spawn)\s*\(\s*([^)]+)/g
    let match: RegExpExecArray | null
    while ((match = regex.exec(code)) !== null) {
      const arg = match[1]
      // flag if the argument is a template literal with ${} or string concatenation with +
      const isDynamic = /\$\{/.test(arg) || /\+/.test(arg) || /%s|%d/.test(arg)
      if (!isDynamic) continue
      const line = lineOf(code, match.index)
      findings.push({
        ruleId: 'sec-command-injection',
        category: 'security',
        severity: 'critical',
        message: `Command built from dynamic input — command injection risk.`,
        range: rangeFor(line, match.index, match[0].length),
        explanation:
          'Passing a string built from user input to exec/spawn runs it through ' +
          'the shell. Shell metacharacters (;, |, &&, $(...)) in the input let an ' +
          'attacker append a second command. Use execFile/spawn with an ARG ARRAY ' +
          '(no shell) so each argument is a literal string the shell never parses, ' +
          'or shell-escape with a vetted library.',
        suggestion: { title: 'Pass arguments as an array, not a shell string', rationale: 'An arg array bypasses the shell entirely, so metacharacters are inert data, not commands.' },
      })
    }
    // Python: os.system, subprocess.call(shell=True) with concat
    const pyRegex = /(?:os|subprocess)\s*\.\s*(?:system|popen|call|run|Popen)\s*\(\s*([^)]+)/g
    while ((match = pyRegex.exec(code)) !== null) {
      const arg = match[1]
      const isDynamic = /\+/.test(arg) || /\$\{/.test(arg) || /%s|%d|\.format\(/.test(arg)
      if (!isDynamic) continue
      const line = lineOf(code, match.index)
      findings.push({
        ruleId: 'sec-command-injection',
        category: 'security',
        severity: 'critical',
        message: `Shell command built from dynamic input — command injection risk.`,
        range: rangeFor(line, match.index, match[0].length),
        explanation:
          'os.system / subprocess with shell=True parses the string through the ' +
          'shell, so input with ;, |, or $(...) runs extra commands. Use ' +
          'subprocess with shell=False and a list of arguments so each is passed ' +
          'verbatim, never shell-parsed.',
        suggestion: { title: 'Use subprocess with a list argument and shell=False' },
      })
    }
    return findings
  },
}

/**
 * Path traversal: file reads/writes that concatenate user input into a path
 * without normalization. ../ sequences let an attacker escape the intended
 * directory. Flag open/read/write where the path includes concatenation or
 * interpolation with a request/user variable.
 */
const pathTraversalAnalyzer: Analyzer = {
  id: 'sec-path-traversal',
  label: 'Path traversal',
  category: 'security',
  supportedLanguages: ['javascript', 'typescript', 'python', 'ruby', 'php', 'go'],
  analyze({ code }: AnalysisInput): Finding[] {
    const findings: Finding[] = []
    // file APIs that take a path: fs.readFile, open, Path.read, File.open
    const regex = /(?:fs|file|File|Path|os|IO)\s*\.\s*(?:readFile|readFileSync|read|writeFile|writeFileSync|write|open|createReadStream|createWriteStream)\s*\(\s*([^)]+)/g
    let match: RegExpExecArray | null
    while ((match = regex.exec(code)) !== null) {
      const arg = match[1]
      // flag concatenation or interpolation suggesting a dynamic (user) path
      const isDynamic = /\+/.test(arg) || /\$\{/.test(arg) || /%s|%d|\.format\(/.test(arg)
      if (!isDynamic) continue
      const line = lineOf(code, match.index)
      findings.push({
        ruleId: 'sec-path-traversal',
        category: 'security',
        severity: 'high',
        message: `File path built from dynamic input — path traversal risk.`,
        range: rangeFor(line, match.index, match[0].length),
        explanation:
          'Constructing a file path from user input lets an attacker inject ../ ' +
          'to escape the intended directory (e.g. ../../etc/passwd). Resolve the ' +
          'path with path.resolve, verify it starts within the allowed base ' +
          'directory (path.relative has no ..), and reject otherwise. Never trust ' +
          'user input as a raw path.',
        suggestion: { title: 'Resolve and verify the path stays within a base directory', rationale: 'path.relative(base, resolved) must not start with ".." — that guarantees containment.' },
      })
    }
    return findings
  },
}

/**
 * Weak cryptography: MD5 / SHA1 used for passwords or signatures. Both are
 * broken for collision resistance; MD5 is broken for signatures. Flag their
 * use, especially in password contexts.
 */
const weakCryptoAnalyzer: Analyzer = {
  id: 'sec-weak-crypto',
  label: 'Weak hash algorithm',
  category: 'security',
  supportedLanguages: ['javascript', 'typescript', 'python', 'java', 'go', 'php', 'ruby'],
  analyze({ code }: AnalysisInput): Finding[] {
    const findings: Finding[] = []
    // md5(...) / sha1(...) / createHash('md5'|'sha1')
    const regex = /(?:createHash\s*\(\s*['"](?:md5|sha1)['"]\s*\)|md5\s*\(|sha1\s*\(|hashlib\s*\.\s*(?:md5|sha1)\s*\()/gi
    let match: RegExpExecArray | null
    while ((match = regex.exec(code)) !== null) {
      const algo = /md5/i.test(match[0]) ? 'MD5' : 'SHA1'
      const line = lineOf(code, match.index)
      findings.push({
        ruleId: 'sec-weak-crypto',
        category: 'security',
        severity: 'high',
        message: `Use of weak hash ${algo}.`,
        range: rangeFor(line, match.index, match[0].length),
        explanation:
          `${algo} is cryptographically broken: collisions can be found fast, and ` +
          `${algo} is unsuitable for passwords (too fast — brute-forceable) and ` +
          `signatures (collisions). For password storage use bcrypt/argon2/scrypt ` +
          '(salted, slow). For integrity/signatures use SHA-256 or SHA-3. The only ' +
          `legitimate ${algo} use is a non-security checksum where collisions do not matter.`,
        suggestion: { title: 'Use SHA-256+ for integrity, bcrypt/argon2 for passwords', rationale: 'MD5/SHA1 are too fast for passwords and broken for collision resistance.' },
      })
    }
    return findings
  },
}

/**
 * Open redirect: a redirect URL taken from a query parameter without
 * validation. An attacker can craft a link like ?next=//evil.com to redirect
 * users to a phishing site under the legit domain's reputation. Flag
 * redirect/Location headers built from request data.
 */
const openRedirectAnalyzer: Analyzer = {
  id: 'sec-open-redirect',
  label: 'Open redirect',
  category: 'security',
  supportedLanguages: ['javascript', 'typescript', 'python', 'ruby', 'php'],
  analyze({ code }: AnalysisInput): Finding[] {
    const findings: Finding[] = []
    // res.redirect(req.query.x), Location: ${...}, redirect(request.args.x)
    const regex = /(?:res|response|ctx|reply)\s*\.\s*redirect\s*\(\s*req(?:uest)?\s*\.\s*(?:query|params|body|args)/gi
    let match: RegExpExecArray | null
    while ((match = regex.exec(code)) !== null) {
      const line = lineOf(code, match.index)
      findings.push({
        ruleId: 'sec-open-redirect',
        category: 'security',
        severity: 'high',
        message: `Redirect URL from user input — open redirect risk.`,
        range: rangeFor(line, match.index, match[0].length),
        explanation:
          'Redirecting to a URL taken directly from a query parameter lets an ' +
          'attacker craft https://your-site.com/?next=//evil.com. The victim sees ' +
          'your domain and trusts it, then lands on a phishing page. Validate ' +
          'redirect targets against an allow-list of known paths, or verify the ' +
          'target is a relative path under your origin before redirecting.',
        suggestion: { title: 'Allow-list redirect targets or require relative paths', rationale: 'Only redirect to paths you control; reject absolute or protocol-relative URLs.' },
      })
    }
    return findings
  },
}

export const SECURITY_ANALYZERS: Analyzer[] = [
  xssInnerHTMLAnalyzer,
  commandInjectionAnalyzer,
  pathTraversalAnalyzer,
  weakCryptoAnalyzer,
  openRedirectAnalyzer,
]
