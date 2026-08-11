/**
 * Cambric Labs — Module: Auth & Security (Backend)
 *
 * Two lessons: authentication (passwords -> hashing -> sessions/JWT),
 * and authorization + web vulnerabilities (CSRF, least privilege).
 */
import type { LessonDetail } from '../types'

export const authSecurityLessons: LessonDetail[] = [
  {
    id: 'lesson-authentication-passwords-sessions',
    title: 'Authentication: From Passwords to Sessions',
    moduleId: 'module-auth-security',
    languageId: 'python',
    difficulty: 4,
    estimatedMinutes: 13,
    summary:
      'You never store passwords — you store a slow, salted hash. On ' +
      'login you re-hash and compare. Then you mint a session token (or ' +
      'a signed JWT) so the browser proves identity on later requests ' +
      'without resending the password.',
    teachesConceptIds: ['authentication', 'password-hashing', 'session', 'jwt', 'cookie', 'hash-function'],
    prerequisiteConceptIds: ['hashing', 'http', 'client-server', 'security'],
    objectives: [
      'Explain why plaintext password storage is a critical vulnerability.',
      'Implement login with a slow, salted password hash (bcrypt).',
      'Distinguish session-based auth (server state) from JWT (signed, stateless).',
      'Choose HttpOnly, Secure, SameSite cookie flags appropriately.',
    ],
    content: [
      {
        kind: 'paragraph',
        text:
          'Authentication answers "who are you?" A user proves identity with ' +
          'something they know (a password). The server must verify that ' +
          'proof without ever learning the password itself, because ' +
          'databases leak. The rule: store a hash, never the plaintext. ' +
          'When the user logs in, re-hash the attempt and compare digests.',
      },
      {
        kind: 'heading',
        text: 'Never store the password; store a slow, salted hash',
      },
      {
        kind: 'code',
        languageId: 'python',
        caption: 'A raw SHA-256 is NOT enough — it is too fast to brute-force.',
        code: "import hashlib\n# BAD: fast hash, no salt. An attacker with the table can\n# try billions/sec; identical passwords hash identically.\nstored = hashlib.sha256('hunter2'.encode()).hexdigest()\n# instead, use a slow, salted KDF: bcrypt / scrypt / argon2",
      },
      {
        kind: 'codeWithOutput',
        languageId: 'python',
        caption: 'bcrypt hashes the password with a random salt AND a cost factor.',
        code: "import bcrypt\n\n# store on signup (hash includes a random salt + cost)\nstored = bcrypt.hashpw('hunter2'.encode(), bcrypt.gensalt(rounds=12))\nprint(stored)\n\n# on login: re-hash the attempt with the stored salt, compare\nok = bcrypt.checkpw('hunter2'.encode(), stored)\nprint('login:', ok)\n# wrong password -> checkpw returns False; the stored hash reveals nothing",
        output: "b'$2b$12$k9...'\nlogin: True",
      },
      {
        kind: 'callout',
        variant: 'warning',
        title: 'Why slow matters',
        text:
          'bcrypt with rounds=12 makes each guess ~250ms. An attacker who ' +
          'steals the hash table can try ~4 guesses/sec/core instead of ' +
          'billions. Slowing the attacker down by 10 orders of magnitude is ' +
          'the entire defense once the table is leaked. Salt defeats ' +
          'rainbow tables; the cost factor defeats brute force.',
      },
      {
        kind: 'heading',
        text: 'After verifying: mint a proof the browser can reuse',
      },
      {
        kind: 'paragraph',
        text:
          'Re-hashing the password on every request is expensive and ' +
          'exposes the password repeatedly. Instead, after a successful ' +
          'login the server mints a token representing that session and ' +
          'the browser sends it on each request. Two designs: server-side ' +
          'sessions (a random token pointing to server state) or JWTs ' +
          '(a self-contained, signed token).',
      },
      {
        kind: 'compare',
        languageIds: ['python', 'python'],
        caption:
          'Server session (opaque token, state on server) vs JWT (signed, stateless).',
        snippets: [
          "# session id -> lookup in a server store\nsession_id = secrets.token_urlsafe(32)\nsessions[session_id] = {'uid': 42}\n# browser sends the id; server looks it up",
          "# JWT: signed payload, no server lookup needed\nimport jwt\ntoken = jwt.encode({'uid': 42, 'exp': now+3600}, SECRET, 'HS256')\n# browser sends token; server verifies signature, reads uid",
        ],
      },
      {
        kind: 'callout',
        variant: 'danger',
        title: 'JWTs are signed, not encrypted',
        text:
          'Anyone can read a JWT payload (it is just base64). The signature ' +
          'only prevents tampering, not viewing. Never put a secret in a ' +
          'JWT. And a JWT cannot be revoked without a server-side blocklist, ' +
          'which reintroduces the state you were trying to avoid — pick ' +
          'sessions when you need revocation.',
      },
      {
        kind: 'heading',
        text: 'The cookie carries the token; flags protect it',
      },
      {
        kind: 'code',
        languageId: 'python',
        caption: 'Set the session cookie with the three protective flags.',
        code: "# Flask example\nresp.set_cookie(\n    'session', session_id,\n    httponly=True,   # JS cannot read it -> defeats XSS token theft\n    secure=True,     # only sent over HTTPS\n    samesite='Lax',   # not sent on cross-site requests -> mitigates CSRF\n    max_age=3600,\n)",
      },
      {
        kind: 'callout',
        variant: 'tip',
        title: 'HttpOnly is the XSS firewall',
        text:
          'If a malicious script can read document.cookie, it can steal the ' +
          'session and take over the account. HttpOnly hides the cookie from ' +
          'JavaScript entirely, so even an XSS cannot exfiltrate it. Always ' +
          'set it on auth cookies.',
      },
    ],
    animation: {
      type: 'timeline',
      title: 'From password to session cookie',
      steps: [
        { caption: 'Signup: user picks password "hunter2".' },
        { caption: 'Server: bcrypt.hashpw(password, gensalt(12)) -> stored hash (with salt + cost). DB stores only the hash.' },
        { caption: 'Login: user sends password. Server: bcrypt.checkpw(password, stored) -> True.' },
        { caption: 'Server mints session_id (random, opaque) and stores {session_id -> uid}. Sets HttpOnly+Secure+SameSite cookie.' },
        { caption: 'Later request: browser sends the cookie. Server looks up session_id -> uid. No password re-sent, no hash re-run.' },
      ],
    },
    activity: {
      type: 'spotBadPractice',
      title: 'Spot the bad practice',
      prompt:
        'Which line in this signup handler is a critical security flaw?',
      languageId: 'python',
      starterCode: "def signup(username, password):\n    import hashlib\n    stored = hashlib.sha256(password.encode()).hexdigest()\n    db.users.insert(username=username, pw=stored)\n    session_id = str(hash(password))\n    sessions[session_id] = username\n    return session_id",
      data: {
        badLine: "stored = hashlib.sha256(password.encode()).hexdigest()",
        explanation:
          'SHA-256 is a fast hash with no salt — brute-forceable at ' +
          'billions/sec and identical passwords hash identically. Use a ' +
          'slow KDF: bcrypt.hashpw(password, bcrypt.gensalt(12)). Also, ' +
          'str(hash(password)) is a weak session id — use secrets.token_urlsafe(32).',
      },
      checks: [],
    },
    comprehensionChecks: [
      {
        question: 'Why use bcrypt (slow, salted) instead of a fast hash like SHA-256 for passwords?',
        options: [
          'bcrypt produces shorter output.',
          'SHA-256 is too fast: an attacker with the leaked table can try billions of guesses per second; bcrypt\'s cost factor slows each guess to ~250ms, and its salt defeats rainbow tables.',
          'bcrypt is newer.',
          'SHA-256 is patented.',
        ],
        correctIndex: 1,
        explanation:
          'Once the database leaks, the only defense is making each guess ' +
          'expensive. A fast hash lets an attacker brute-force cheaply; a ' +
          'slow, salted KDF (bcrypt/scrypt/argon2) raises the cost per ' +
          'guess by orders of magnitude and salts each password so ' +
          'identical passwords hash differently.',
      },
      {
        question: 'What does the HttpOnly cookie flag actually defend against?',
        options: [
          'CSRF attacks.',
          'Token theft via XSS: JavaScript cannot read an HttpOnly cookie, so even if a script runs in the page, it cannot exfiltrate the session.',
          'Network sniffing.',
          'Password reuse.',
        ],
        correctIndex: 1,
        explanation:
          'SameSite=Lax mitigates CSRF (cross-site request forgery). ' +
          'HttpOnly defends against XSS token theft: it hides the cookie ' +
          'from document.cookie so injected scripts cannot steal it. ' +
          'Secure ensures HTTPS only. You need all three together.',
      },
    ],
  },
  {
    id: 'lesson-authorization-and-vulnerabilities',
    title: 'Authorization & Web Vulnerabilities: Least Privilege in Practice',
    moduleId: 'module-auth-security',
    languageId: 'python',
    difficulty: 4,
    estimatedMinutes: 12,
    summary:
      'Authentication says who you are; authorization says what you may ' +
      'do. Enforce least privilege on the server, never trust the client, ' +
      'and defend the classic web holes: CSRF, injection, and IDOR.',
    teachesConceptIds: ['authorization', 'csrf', 'oauth', 'authentication', 'security'],
    prerequisiteConceptIds: ['authentication', 'session', 'cookie', 'http', 'security'],
    objectives: [
      'Distinguish authentication from authorization and enforce checks server-side.',
      'Explain CSRF and how SameSite + tokens defend against it.',
      'Recognize IDOR (insecure direct object reference) and why client-side hiding is not authorization.',
      'Describe how OAuth delegates scoped access without sharing passwords.',
    ],
    content: [
      {
        kind: 'paragraph',
        text:
          'Authentication establishes identity; authorization decides ' +
          'permission. The single most important rule: authorization is ' +
          'enforced on the server, never on the client. Anything the ' +
          'browser sends — URLs, form fields, hidden inputs, tokens — can ' +
          'be changed by the user. If a request succeeds because the ' +
          'client "should not have sent it," that is your bug, not the ' +
          'user\'s fault.',
      },
      {
        kind: 'heading',
        text: 'IDOR: the authorization bug hiding in plain sight',
      },
      {
        kind: 'code',
        languageId: 'python',
        caption: 'A "secret" id in the URL is not a permission check.',
        code: "# BAD: the client controls whose order to fetch\n@app.get('/orders/<int:order_id>')\ndef get_order(order_id):\n    return db.orders.get(order_id)   # any logged-in user -> any order\n\n# GOOD: authorize that THIS user owns THIS order\n@app.get('/orders/<int:order_id>')\n@login_required\ndef get_order(order_id, user):\n    order = db.orders.get(order_id)\n    if order is None or order.user_id != user.id:\n        abort(404)            # 404, not 403, to avoid leaking existence\n    return order",
      },
      {
        kind: 'callout',
        variant: 'warning',
        title: 'Hide the failure mode too',
        text:
          'If you return 403 for resources the user cannot access but 404 ' +
          'for ones that do not exist, an attacker can enumerate ids to ' +
          'discover which orders exist. Return 404 for both "does not exist" ' +
          'and "not yours" so existence is not leaked.',
      },
      {
        kind: 'heading',
        text: 'CSRF: forging a request from another site',
      },
      {
        kind: 'paragraph',
        text:
          'The browser attaches your session cookie to any request to your ' +
          'origin, even if the request came from a different site. So an ' +
          'attacker\'s page can submit a form to your bank\'s transfer ' +
          'endpoint, and your cookie rides along — the server thinks you ' +
          'intended it. This is Cross-Site Request Forgery.',
      },
      {
        kind: 'code',
        languageId: 'html',
        caption: 'An attacker page auto-submits a transfer to your bank.',
        code: "<form action=\"https://bank.com/transfer\" method=\"POST\">\n  <input name=\"to\" value=\"attacker\">\n  <input name=\"amount\" value=\"10000\">\n</form>\n<script>document.forms[0].submit()</script>\n<!-- your browser attaches your bank session cookie -->\n<!-- the server sees a logged-in transfer you never made -->",
      },
      {
        kind: 'callout',
        variant: 'info',
        title: 'Three layers of CSRF defense',
        text:
          '1) SameSite=Lax/Strict stops the browser sending the cookie on ' +
          'cross-site requests in the first place. 2) A per-session CSRF ' +
          'token: the server embeds a secret in the form and rejects POSTs ' +
          'without the matching token (the attacker\'s site cannot read it). ' +
          '3) Verify the Origin/Referer header on state-changing requests. ' +
          'Use all that apply.',
      },
      {
        kind: 'heading',
        text: 'OAuth: delegated authorization without your password',
      },
      {
        kind: 'code',
        languageId: 'python',
        caption: 'OAuth flow: the user grants a scoped token, never the password.',
        code: "# 'Log in with X' = OAuth: you never give X your password.\n# 1) redirect user to provider's consent screen\nredirect(f\"https://provider.com/auth?client_id=app&scope=read:profile&redirect_uri=cb\")\n# 2) user approves; provider redirects back with a code\ncode = request.args['code']\n# 3) server exchanges code for an access token (server-side secret)\ntoken = exchange_code_for_token(code)\n# 4) app calls provider's API WITH the token, scoped to read:profile only\nprofile = provider.get('/me', token=token)",
      },
      {
        kind: 'callout',
        variant: 'tip',
        title: 'Scope = least privilege for third parties',
        text:
          'OAuth scopes ("read:profile", not "account") are least privilege ' +
          'for delegated access: the app gets exactly what it needs, nothing ' +
          'more, and the user consents to that specific scope at the ' +
          'provider\'s screen. The password never leaves the provider.',
      },
      {
        kind: 'compare',
        languageIds: ['python', 'python'],
        caption:
          'Client-gated (insecure) vs server-authorized (correct).',
        snippets: [
          "# client decides permission via hidden field\n<input type='hidden' name='role' value='user'>\n# attacker changes this to 'admin' in DevTools",
          "# server derives role from the session, never the request\nuser = session.user\nif not user.can('delete'): abort(403)",
        ],
      },
    ],
    animation: {
      type: 'timeline',
      title: 'A CSRF attack and its defense',
      steps: [
        { caption: 'You log into bank.com. Session cookie set (HttpOnly, but NOT SameSite in the vulnerable version).' },
        { caption: 'You visit attacker.com. It auto-submits a form POST to bank.com/transfer.' },
        { caption: 'Your browser attaches the bank cookie to the cross-site POST. Server sees an authenticated transfer.' },
        { caption: 'Defense 1: SameSite=Lax -> browser does NOT send the cookie on the cross-site POST. Request is rejected as unauthenticated.' },
        { caption: 'Defense 2: CSRF token -> the attacker has no way to read the token from your bank page (same-origin), so the POST is rejected even if the cookie leaked.' },
      ],
    },
    activity: {
      type: 'findBug',
      title: 'Find the authorization bug',
      prompt:
        'A user reports they could fetch another user\'s invoice by ' +
        'changing the id in the URL. Which line fails to authorize?',
      languageId: 'python',
      starterCode: "@app.get('/invoice/<int:iid>')\n@login_required\ndef get_invoice(iid, user):\n    invoice = db.invoices.get(iid)\n    return invoice",
      data: {
        buggyLine: 'return invoice',
        explanation:
          'There is no ownership check. The endpoint trusts that if the ' +
          'user is logged in, they may view any invoice id. Add: if ' +
          'invoice is None or invoice.user_id != user.id: abort(404). ' +
          'Return 404 (not 403) so existence is not leaked.',
      },
      checks: [],
    },
    comprehensionChecks: [
      {
        question: 'A user changes a hidden field role=admin in the browser DevTools and the server grants admin. What went wrong?',
        options: [
          'The hidden field was not encrypted.',
          'The server trusted client-supplied data for an authorization decision; it must derive the role from the server-side session, never from the request body.',
          'The form used GET instead of POST.',
          'The role field was too short.',
        ],
        correctIndex: 1,
        explanation:
          'Never trust the client for authorization. The browser is an ' +
          'open transport; every field is user-editable. Authority must ' +
          'come from the server\'s session/token, not from a value the ' +
          'client chose to send.',
      },
      {
        question: 'How does SameSite=Lax defend against CSRF?',
        options: [
          'It encrypts the cookie.',
          'It stops the browser from sending the session cookie on cross-site (top-level) requests, so a form auto-submitted from attacker.com arrives without your cookie and is rejected as unauthenticated.',
          'It signs the cookie.',
          'It shortens the cookie lifetime.',
        ],
        correctIndex: 1,
        explanation:
          'SameSite restricts when the cookie is sent. Lax omits it on ' +
          'cross-site POSTs (and sub-resource loads), so the forged request ' +
          'arrives cookie-less. Combined with a CSRF token (which the ' +
          'attacker cannot read cross-origin), CSRF becomes very hard.',
      },
    ],
  },
]
