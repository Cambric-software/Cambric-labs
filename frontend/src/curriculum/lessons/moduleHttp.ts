/**
 * Cambric Labs — Module: HTTP & REST (Web)
 *
 * Two lessons: the HTTP request/response cycle and REST conventions.
 */
import type { LessonDetail } from '../types'

export const httpLessons: LessonDetail[] = [
  {
    id: 'lesson-http-basics',
    title: 'HTTP: Request and Response',
    moduleId: 'module-http',
    languageId: 'bash',
    difficulty: 2,
    estimatedMinutes: 11,
    summary:
      'Every web interaction is an HTTP request the browser sends and a ' +
      'response the server returns. Methods, headers, and status codes are ' +
      'the grammar of that exchange.',
    teachesConceptIds: ['http', 'request-response', 'status-codes', 'rest'],
    prerequisiteConceptIds: ['client-server', 'network'],
    objectives: [
      'Describe the HTTP request/response cycle.',
      'Use GET, POST, PUT, DELETE methods appropriately.',
      'Interpret 2xx, 3xx, 4xx, 5xx status code classes.',
      'Explain the role of headers in a request and response.',
    ],
    content: [
      {
        kind: 'paragraph',
        text:
          'Every time a browser shows a page, it sent an HTTP request to a ' +
          'server and received an HTTP response. HTTP is a text protocol: a ' +
          'request line, some headers, maybe a body; the server replies with ' +
          'a status line, headers, and maybe a body. The whole web is built ' +
          'on this simple exchange.',
      },
      {
        kind: 'heading',
        text: 'The request: method, path, headers, body',
      },
      {
        kind: 'codeWithOutput',
        languageId: 'bash',
        caption: 'A raw HTTP GET request.',
        code: 'GET /api/users/42 HTTP/1.1\nHost: example.com\nAccept: application/json\n\n# method: GET (read)\n# path: /api/users/42\n# headers: Host (required), Accept (what client wants)\n# body: none for GET',
        output: '# the server reads this and builds a response',
      },
      {
        kind: 'heading',
        text: 'The response: status, headers, body',
      },
      {
        kind: 'codeWithOutput',
        languageId: 'bash',
        caption: 'A raw HTTP response.',
        code: 'HTTP/1.1 200 OK\nContent-Type: application/json\nContent-Length: 47\n\n{"id": 42, "name": "Cam", "role": "admin"}\n\n# status: 200 OK (success)\n# headers: Content-Type (what the body is), Content-Length\n# body: the JSON payload',
        output: '# the browser parses the JSON and renders or hands to JS',
      },
      {
        kind: 'callout',
        variant: 'info',
        title: 'Headers carry metadata',
        text:
          'Headers are key:value pairs. The request carries metadata about ' +
          'the client (Accept, User-Agent, Authorization). The response ' +
          'carries metadata about the body (Content-Type, Content-Length, ' +
          'Cache-Control). They do not carry the data itself — the body does.',
      },
      {
        kind: 'heading',
        text: 'Methods express intent',
      },
      {
        kind: 'steps',
        caption: 'The five core HTTP methods.',
        steps: [
          'GET: read a resource. Should not change server state. Safe and idempotent.',
          'POST: create a new resource (submit a form, add a record). Not idempotent.',
          'PUT: replace a whole resource at a known URL. Idempotent.',
          'PATCH: partially update a resource. Not necessarily idempotent.',
          'DELETE: remove a resource. Idempotent.',
        ],
      },
      {
        kind: 'callout',
        variant: 'tip',
        title: 'Idempotent: same result no matter how many times',
        text:
          'GET, PUT, DELETE are idempotent — calling them ten times has the ' +
          'same effect as calling once. POST is not: ten POSTs create ten ' +
          'records. This matters for retry logic: a dropped GET can be safely ' +
          'retried; a dropped POST might create a duplicate.',
      },
      {
        kind: 'heading',
        text: 'Status codes: five classes',
      },
      {
        kind: 'codeWithOutput',
        languageId: 'bash',
        caption: 'Status code ranges and their meanings.',
        code: '# 1xx Informational        (rare, protocol-level)\n# 2xx Success               200 OK, 201 Created, 204 No Content\n# 3xx Redirection           301 Moved, 304 Not Modified\n# 4xx Client error          400 Bad Request, 401 Unauthorized, 404 Not Found, 429 Too Many\n# 5xx Server error          500 Internal, 502 Bad Gateway, 503 Unavailable',
        output: '# 4xx: the client sent something wrong\n# 5xx: the server failed',
      },
      {
        kind: 'callout',
        variant: 'warning',
        title: '401 vs 403 — not the same',
        text:
          '401 Unauthorized means "I do not know who you are — log in." ' +
          '403 Forbidden means "I know who you are, but you cannot do this." ' +
          'Mixing them up misleads clients about whether to authenticate ' +
          'again or give up.',
      },
      {
        kind: 'compare',
        languageIds: ['bash', 'javascript'],
        caption:
          'A raw request vs the fetch() call that sends the same request.',
        snippets: [
          'GET /api/users/42 HTTP/1.1\nHost: example.com',
          'const r = await fetch("/api/users/42");\nconst user = await r.json();',
        ],
      },
    ],
    animation: {
      type: 'timeline',
      title: 'One HTTP request/response cycle',
      steps: [
        { caption: 'Client sends GET /api/users/42 with headers.' },
        { caption: 'Server receives, routes to handler, looks up user 42.' },
        { caption: 'Server builds response: 200 OK, Content-Type: application/json, body.' },
        { caption: 'Client receives, parses status (200 = success), parses JSON body.' },
        { caption: 'One exchange, one resource. The next request is independent (stateless).' },
      ],
    },
    activity: {
      type: 'multipleChoice',
      title: 'Which status code for an unknown URL?',
      prompt:
        'A client requests /api/users/9999 which does not exist. What ' +
        'status should the server return?',
      languageId: 'bash',
      data: {
        question: 'Status for a non-existent resource?',
        options: ['200 OK', '404 Not Found (client asked for something that does not exist)', '500 Internal Server Error', '301 Moved'],
        correctIndex: 1,
        explanation:
          '404 is the client-error code for "the resource you asked for ' +
          'does not exist." 500 would mean the server broke, not that the ' +
          'resource is absent. 200 would be lying.',
      },
      checks: [],
    },
    comprehensionChecks: [
      {
        question: 'Which HTTP method is NOT idempotent (calling twice changes the result)?',
        options: ['GET', 'PUT', 'DELETE', 'POST'],
        correctIndex: 3,
        explanation:
          'POST creates a new resource each time, so ten POSTs create ten ' +
          'records. GET, PUT, DELETE are idempotent — ten calls have the same ' +
          'effect as one. This is why a dropped POST is risky to retry without ' +
          'an idempotency key.',
      },
      {
        question: 'What does a 5xx status code mean?',
        options: [
          'The client sent a bad request.',
          'The server failed to fulfil a valid request.',
          'The resource moved.',
          'Authentication is required.',
        ],
        correctIndex: 1,
        explanation:
          '5xx is a server error: the server was asked to do something ' +
          'valid and failed (500 internal error, 502 bad gateway, 503 ' +
          'unavailable). 4xx is the client fault; 5xx is the server fault.',
      },
    ],
  },

  {
    id: 'lesson-rest',
    title: 'REST: Resource-Oriented HTTP',
    moduleId: 'module-http',
    languageId: 'bash',
    difficulty: 3,
    estimatedMinutes: 11,
    summary:
      'REST maps CRUD operations onto HTTP methods and resource URLs. It ' +
      'is a convention for building predictable, stateless APIs.',
    teachesConceptIds: ['rest', 'http', 'request-response', 'crud'],
    prerequisiteConceptIds: ['http', 'request-response', 'status-codes'],
    objectives: [
      'Map CRUD operations to HTTP methods and resource URLs.',
      'Design a RESTful URL scheme for a resource.',
      'Explain statelessness and why it matters for scaling.',
      'Distinguish REST from GraphQL/RPC.',
    ],
    content: [
      {
        kind: 'paragraph',
        text:
          'REST (Representational State Transfer) is a convention for ' +
          'designing web APIs: treat things as resources identified by URLs, ' +
          'and use HTTP methods as the verbs. The result is predictable — a ' +
          'client can guess the URL for "update user 42" because the pattern ' +
          'is consistent across resources.',
      },
      {
        kind: 'heading',
        text: 'CRUD mapped to HTTP',
      },
      {
        kind: 'codeWithOutput',
        languageId: 'bash',
        caption: 'The standard REST URL + method pattern.',
        code: '# Create:  POST   /api/users          body = new user data\n# Read:    GET    /api/users          → list all\n#          GET    /api/users/42       → one user\n# Update:  PUT    /api/users/42       body = full replacement\n#          PATCH  /api/users/42       body = partial fields\n# Delete:  DELETE /api/users/42\n\n# The URL is the NOUN (user 42); the method is the VERB (read/replace/remove)',
        output: '# consistent across resources: /api/posts, /api/comments, etc.',
      },
      {
        kind: 'callout',
        variant: 'tip',
        title: 'URL = noun, method = verb',
        text:
          'The resource is the noun (/users/42). The HTTP method is the verb ' +
          '(GET, POST, PUT, DELETE). Never put verbs in the URL — ' +
          '/api/getUser/42 is an anti-pattern; GET /api/users/42 already says "get."',
      },
      {
        kind: 'heading',
        text: 'Status codes that match the action',
      },
      {
        kind: 'code',
        languageId: 'bash',
        caption: 'Conventional status for each REST action.',
        code: '# POST   /api/users     → 201 Created + Location: /api/users/99\n# GET    /api/users/42  → 200 OK + body\n# PUT    /api/users/42  → 200 OK (or 204 No Content)\n# DELETE /api/users/42 → 204 No Content (nothing to return)\n# GET    /api/users/99  → 404 Not Found',
      },
      {
        kind: 'callout',
        variant: 'info',
        title: '201 Created includes a Location header',
        text:
          'When you POST to create a resource, return 201 and a Location ' +
          'header pointing at the new URL (/api/users/99). The client can ' +
          'then immediately GET that URL — they know where the new resource ' +
          'lives without guessing.',
      },
      {
        kind: 'heading',
        text: 'Stateless: each request carries everything needed',
      },
      {
        kind: 'paragraph',
        text:
          'A REST server does not remember state between requests. Each ' +
          'request must carry everything the server needs to handle it ' +
          '(authentication token, the resource ID, the new data). This ' +
          'statelessness is why REST scales: any server can handle any ' +
          'request, so you can add servers behind a load balancer freely.',
      },
      {
        kind: 'callout',
        variant: 'warning',
        title: 'Sessions break statelessness',
        text:
          'A server-side session ("remember this client between requests") ' +
          'makes the server stateful — the client is pinned to the server ' +
          'that holds its session. REST-strict designs prefer stateless ' +
          'tokens (JWT) so any server can serve any request.',
      },
      {
        kind: 'heading',
        text: 'REST vs GraphQL vs RPC',
      },
      {
        kind: 'paragraph',
        text:
          'REST returns fixed shapes per endpoint. GraphQL lets the client ' +
          'ask for exactly the fields it wants in one request. RPC exposes ' +
          'named actions (POST /api/doThing) rather than resources. REST ' +
          'wins on predictability and caching; GraphQL wins on flexibility; ' +
          'RPC wins on action-shaped operations that do not map to CRUD.',
      },
      {
        kind: 'compare',
        languageIds: ['bash', 'javascript'],
        caption:
          'A REST call as raw HTTP vs the same call via fetch().',
        snippets: [
          'POST /api/users HTTP/1.1\nContent-Type: application/json\n\n{"name": "Cam"}',
          'const r = await fetch("/api/users", {\n  method: "POST",\n  headers: { "Content-Type": "application/json" },\n  body: JSON.stringify({ name: "Cam" }),\n});',
        ],
      },
    ],
    animation: {
      type: 'dataFlow',
      title: 'CRUD mapped to REST endpoints',
      steps: [
        { caption: 'Create: POST /api/users with body → 201, Location: /api/users/99.' },
        { caption: 'Read list: GET /api/users → 200, body is an array.' },
        { caption: 'Read one: GET /api/users/42 → 200, body is one object.' },
        { caption: 'Update: PUT /api/users/42 with new body → 200.' },
        { caption: 'Delete: DELETE /api/users/42 → 204. The URL pattern is the noun; the method is the verb.' },
      ],
    },
    activity: {
      type: 'multipleChoice',
      title: 'Which is RESTful?',
      prompt: 'Which URL + method follows REST conventions for updating user 42?',
      languageId: 'bash',
      data: {
        question: 'Which is the RESTful way to update user 42?',
        options: [
          'POST /api/updateUser?id=42',
          'GET /api/updateUser/42',
          'PUT /api/users/42 with the new data in the body',
          'POST /api/users/42/update',
        ],
        correctIndex: 2,
        explanation:
          'PUT /api/users/42 uses the resource noun (/users/42) and the ' +
          'update verb (PUT). Verbs in the URL (/updateUser) are an ' +
          'anti-pattern — the method already expresses the action.',
      },
      checks: [],
    },
    comprehensionChecks: [
      {
        question: 'Why does statelessness help REST scale?',
        options: [
          'It makes requests faster.',
          'Any server can handle any request because each request is self-contained, so you can add servers behind a load balancer freely.',
          'It removes the need for authentication.',
          'It uses less memory.',
        ],
        correctIndex: 1,
        explanation:
          'If a server holds no state between requests, any server can ' +
          'serve any client. A load balancer can spread requests across ' +
          'many servers without pinning a client to one — horizontal scaling ' +
          'becomes trivial.',
      },
      {
        question: 'When you POST to create a resource, what should the response include?',
        options: [
          '200 OK only.',
          '201 Created and a Location header pointing at the new resource URL.',
          '404 Not Found.',
          'A DELETE request.',
        ],
        correctIndex: 1,
        explanation:
          '201 Created signals success, and the Location header tells the ' +
          'client the new URL (/api/users/99). The client can immediately GET ' +
          'that URL — it knows where the resource lives.',
      },
    ],
  },
]
