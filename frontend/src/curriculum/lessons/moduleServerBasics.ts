/**
 * Cambric Labs — Module: Servers & Routing (Backend)
 *
 * Two lessons: the HTTP server cycle and routing, and middleware.
 */
import type { LessonDetail } from '../types'

export const serverBasicsLessons: LessonDetail[] = [
  {
    id: 'lesson-http-servers',
    title: 'HTTP Servers: Receive, Route, Respond',
    moduleId: 'module-server-basics',
    languageId: 'python',
    difficulty: 3,
    estimatedMinutes: 12,
    summary:
      'A web server is a loop that receives an HTTP request, routes it to a ' +
      'handler, and sends a response. Frameworks abstract the loop and give ' +
      'you routing.',
    teachesConceptIds: ['server', 'routing', 'http', 'request-response', 'rest'],
    prerequisiteConceptIds: ['http', 'rest', 'request-response', 'function'],
    objectives: [
      'Describe the request-handling loop a server runs.',
      'Define routes that map URL+method to handler functions.',
      'Extract path parameters and query strings.',
      'Return JSON responses with correct status codes.',
    ],
    content: [
      {
        kind: 'paragraph',
        text:
          'A web server is, at its core, a loop: accept a connection, read ' +
          'the HTTP request, decide what to do, write the HTTP response, ' +
          'repeat. Frameworks like FastAPI, Express, and Flask abstract the ' +
          'loop and the protocol parsing; your job is to write the handlers ' +
          'and the routing that decides which handler each request reaches.',
      },
      {
        kind: 'heading',
        text: 'The request-handling loop',
      },
      {
        kind: 'steps',
        caption: 'What every web server does, conceptually.',
        steps: [
          'Listen on a port (e.g. 8000) for incoming TCP connections.',
          'Parse the raw bytes of each request into method, path, headers, body.',
          'Route: find the handler registered for this method + path pattern.',
          'Run the handler, which returns a response (status, headers, body).',
          'Write the response bytes back to the connection, close or reuse it.',
        ],
      },
      {
        kind: 'callout',
        variant: 'info',
        title: 'The framework owns the loop',
        text:
          'You almost never write the accept-and-parse loop yourself. The ' +
          'framework (FastAPI, Express) runs it and calls YOUR function with ' +
          'a parsed request object. Your function returns a response; the ' +
          'framework serialises and sends it.',
      },
      {
        kind: 'heading',
        text: 'Routing: map URL + method to a handler',
      },
      {
        kind: 'codeWithOutput',
        languageId: 'python',
        caption: 'FastAPI routes map method+path to a function.',
        code: 'from fastapi import FastAPI\n\napp = FastAPI()\n\n@app.get("/")\ndef root():\n    return {"message": "hello"}\n\n@app.get("/users/{user_id}")\ndef get_user(user_id: int):        # path param extracted from URL\n    return {"id": user_id, "name": f"user{user_id}"}\n\n# GET /users/42 → {"id": 42, "name": "user42"}',
        output: '# the framework parses the URL, extracts user_id=42, calls get_user(42)',
      },
      {
        kind: 'callout',
        variant: 'tip',
        title: 'Path params vs query strings',
        text:
          '/users/{user_id} is a path parameter — part of the URL pattern. ' +
          '/search?q=cam&page=2 is a query string — optional key=value pairs ' +
          'after the ?. Path params identify a resource; query strings ' +
          'filter or configure it.',
      },
      {
        kind: 'codeWithOutput',
        languageId: 'python',
        caption: 'Query parameters in FastAPI.',
        code: 'from fastapi import FastAPI\n\napp = FastAPI()\n\n@app.get("/search")\ndef search(q: str, page: int = 1):  # q required, page optional default 1\n    return {"query": q, "page": page}\n\n# GET /search?q=cam&page=3 → {"query": "cam", "page": 3}',
        output: '# the framework parses the query string and type-converts',
      },
      {
        kind: 'heading',
        text: 'Return the right status code',
      },
      {
        kind: 'code',
        languageId: 'python',
        caption: 'Success vs not-found vs error.',
        code: 'from fastapi import FastAPI, HTTPException\n\napp = FastAPI()\nusers = {1: "Cam"}\n\n@app.get("/users/{user_id}")\ndef get_user(user_id: int):\n    if user_id not in users:\n        raise HTTPException(status_code=404, detail="not found")\n    return {"id": user_id, "name": users[user_id]}\n# 200 OK by default; 404 when the user is absent',
      },
      {
        kind: 'callout',
        variant: 'warning',
        title: 'Do not return 200 for errors',
        text:
          'A common mistake is to return 200 OK with {error: "not found"} in ' +
          'the body. That lies about the status. Return 404, 400, 422 — the ' +
          'status code is the machine-readable truth; the body is extra ' +
          'detail. Clients check the status, not the body, for error logic.',
      },
      {
        kind: 'compare',
       languageIds: ['python', 'javascript'],
        caption:
          'FastAPI (Python) and Express (Node) both map method+path to a ' +
          'handler that returns a response. The shape is identical.',
        snippets: [
          '@app.get("/users/{id}")\ndef get_user(id: int):\n    return {"id": id}',
          'app.get("/users/:id", (req, res) => {\n  res.json({ id: req.params.id });\n});',
        ],
      },
    ],
    animation: {
      type: 'dataFlow',
      title: 'A request flows through the server',
      steps: [
        { caption: 'GET /users/42 arrives at port 8000.' },
        { caption: 'Framework parses: method=GET, path=/users/42, params={user_id:"42"}.' },
        { caption: 'Router matches the /users/{user_id} pattern, calls get_user(42).' },
        { caption: 'Handler returns {"id":42,"name":"user42"}.' },
        { caption: 'Framework serialises to JSON, writes 200 OK + body back to the client.' },
      ],
    },
    activity: {
      type: 'codeChallenge',
      title: 'Add a new route',
      prompt:
        'Add a GET /health route to this FastAPI app that returns ' +
        '{"status":"ok"}. The output must be that JSON.',
      languageId: 'python',
      starterCode: 'from fastapi import FastAPI\napp = FastAPI()\n\n# add a /health route here\n\n\n# test: client.get("/health").json() must be {"status": "ok"}',
      checks: [
        { description: 'Uses the decorator', assertion: { kind: 'contains', value: '@app.get' } },
        { description: 'Returns the status JSON', assertion: { kind: 'contains', value: '"status"' } },
      ],
    },
    comprehensionChecks: [
      {
        question: 'What does the framework own, vs what you write?',
        options: [
          'You own the accept loop and parsing.',
          'The framework owns the accept/parse/send loop; you write the route handlers that the framework calls with a parsed request.',
          'The framework writes your handlers.',
          'You write the HTTP protocol parser.',
        ],
        correctIndex: 1,
        explanation:
          'The framework runs the server loop (accept, parse, send). You ' +
          'register routes and write handlers; the framework calls them with ' +
          'a parsed request and serialises what they return.',
      },
      {
        question: 'Why should you return 404, not 200 with an error in the body?',
        options: [
          '200 is slower.',
          'The status code is the machine-readable truth; clients check the status for error logic, not the body.',
          '404 is faster.',
          'The body is ignored.',
        ],
        correctIndex: 1,
        explanation:
          'Status codes are the contract. Clients branch on the status ' +
          '(2xx = success, 4xx = client error). Returning 200 with an error ' +
          'body forces every client to parse the body to detect failure, ' +
          'breaking the contract.',
      },
    ],
  },

  {
    id: 'lesson-middleware',
    title: 'Middleware: The Pipe Before Your Handler',
    moduleId: 'module-server-basics',
    languageId: 'python',
    difficulty: 3,
    estimatedMinutes: 11,
    summary:
      'Middleware is code that runs before (and after) your handler — for ' +
      'logging, auth, CORS, and other cross-cutting concerns — without ' +
      'cluttering every route.',
    teachesConceptIds: ['middleware', 'routing', 'server', 'cors'],
    prerequisiteConceptIds: ['server', 'routing', 'function', 'http'],
    objectives: [
      'Describe middleware as a chain that wraps each request.',
      'Implement logging and timing middleware.',
      'Explain CORS middleware and why browsers need it.',
      'Order middleware correctly (auth before handler).',
    ],
    content: [
      {
        kind: 'paragraph',
        text:
          'Some logic applies to EVERY request: logging, auth, CORS, request ' +
          'ID, error handling. Duplicating that in each handler is a mess. ' +
          'Middleware solves it: a chain of functions that each see the ' +
          'request, can short-circuit (reject), or call the next layer. The ' +
          'handler is just the last middleware in the chain.',
      },
      {
        kind: 'heading',
        text: 'A chain that wraps the request',
      },
      {
        kind: 'codeWithOutput',
        languageId: 'python',
        caption: 'FastAPI middleware runs before routes.',
        code: 'import time\nfrom fastapi import FastAPI, Request\n\napp = FastAPI()\n\n@app.middleware("http")\nasync def log_timing(request: Request, call_next):\n    start = time.time()\n    response = await call_next(request)   # hand to the next layer\n    ms = (time.time() - start) * 1000\n    response.headers["X-Duration-ms"] = f"{ms:.1f}"\n    print(f"{request.method} {request.url.path} {ms:.1f}ms")\n    return response',
        output: '# every response now has an X-Duration-ms header and a log line',
      },
      {
        kind: 'callout',
        variant: 'info',
        title: 'call_next is the key',
        text:
          'Middleware receives the request AND a call_next function. Calling ' +
          'it hands control down the chain, eventually reaching your handler. ' +
          'The value call_next returns IS the response your handler produced — ' +
          'middleware can inspect or modify it before returning.',
      },
      {
        kind: 'heading',
        text: 'Order matters: auth before handler',
      },
      {
        kind: 'paragraph',
        text:
          'Middleware runs in registration order. If auth middleware rejects a ' +
          'request (no valid token), it must run BEFORE the handler. If ' +
          'logging runs first, it still logs the rejected request (good), ' +
          'then auth short-circuits before the handler. Getting the order ' +
          'wrong means a handler runs without auth, or logging misses requests.',
      },
      {
        kind: 'code',
        languageId: 'python',
        caption: 'Typical middleware order (outermost to innermost).',
        code: '# 1. error_handler: catch any exception, return 500 JSON\n# 2. request_id: attach a unique ID to each request/response\n# 3. logging: log method/path/id\n# 4. auth: verify token; reject with 401 if invalid\n# 5. cors: add CORS headers\n# 6. handler: the actual route logic',
      },
      {
        kind: 'callout',
        variant: 'warning',
        title: 'CORS is a browser security feature',
        text:
          'CORS (Cross-Origin Resource Sharing) blocks a web page from ' +
          'calling an API on a different origin unless the API explicitly ' +
          'allows it via headers. It is enforced by the BROWSER, not the ' +
          'server — curl ignores CORS. You add CORS middleware so browsers ' +
          'allow your frontend to call your API.',
      },
      {
        kind: 'code',
        languageId: 'python',
        caption: 'CORS middleware adds the browser-required headers.',
        code: 'from fastapi.middleware.cors import CORSMiddleware\n\napp.add_middleware(\n    CORSMiddleware,\n    allow_origins=["https://yourapp.com"],  # which sites may call\n    allow_methods=["GET", "POST", "PUT", "DELETE"],\n    allow_headers=["Authorization"],\n)',
      },
      {
        kind: 'heading',
        text: 'Cross-cutting concerns stay out of handlers',
      },
      {
        kind: 'paragraph',
        text:
          'Without middleware, every handler would start by checking auth, ' +
          'logging the request, setting CORS headers, and catching errors. ' +
          'With middleware, handlers contain ONLY the business logic — ' +
          'cleaner, testable, and consistent. Middleware is how you keep ' +
          'cross-cutting concerns in one place.',
      },
      {
        kind: 'compare',
       languageIds: ['python', 'javascript'],
        caption:
          'FastAPI middleware (async, call_next) and Express middleware ' +
          '(next()) are the same concept with different names.',
        snippets: [
          'async def mw(request, call_next):\n    response = await call_next(request)\n    return response',
          'function mw(req, res, next) {\n  // do something\n  next(); // hand to next\n}',
        ],
      },
    ],
    animation: {
      type: 'dataFlow',
      title: 'A request passes through the middleware chain',
      steps: [
        { caption: 'Request arrives. Logging starts a timer.' },
        { caption: 'Request ID attached. Logging records method/path/id.' },
        { caption: 'Auth checks the token. Invalid → 401 short-circuits (handler never runs).' },
        { caption: 'Valid → CORS headers added → handler runs, returns response.' },
        { caption: 'Response unwinds back up: CORS, auth (none), logging (stops timer, logs). One request, one chain.' },
      ],
    },
    activity: {
      type: 'multipleChoice',
      title: 'Why use middleware instead of per-handler code?',
      prompt:
        'Why put logging/auth/CORS in middleware rather than in each ' +
        'handler?',
      languageId: 'python',
      data: {
        question: 'Why middleware instead of per-handler logic?',
        options: [
          'It is faster.',
          'Cross-cutting concerns live in one place and run for every route, keeping handlers focused on business logic.',
          'Handlers cannot log.',
          'It is required by HTTP.',
        ],
        correctIndex: 1,
        explanation:
          'Middleware centralises cross-cutting logic so it applies to ' +
          'every request once, consistently. Handlers stay focused on the ' +
          'actual business rule instead of repeating auth/logging/CORS boilerplate.',
      },
      checks: [],
    },
    comprehensionChecks: [
      {
        question: 'What does the call_next (or next) function do in middleware?',
        options: [
          'It returns the final response immediately.',
          'It hands control to the next middleware or the handler, returning the response they produce.',
          'It closes the connection.',
          'It parses the request body.',
        ],
        correctIndex: 1,
        explanation:
          'call_next invokes the next layer in the chain, eventually reaching ' +
          'the handler. The value it returns is the response produced ' +
          'downstream, which the middleware can inspect or modify before ' +
          'returning to its own caller.',
      },
      {
        question: 'CORS is enforced by which component?',
        options: [
          'The server.',
          'The browser — it blocks cross-origin responses unless the server sent CORS headers allowing them.',
          'The router.',
          'The database.',
        ],
        correctIndex: 1,
        explanation:
          'CORS is a browser security mechanism. The server sends headers ' +
          'saying which origins may read the response; the browser enforces ' +
          'that policy. Non-browser clients (curl) ignore CORS entirely.',
      },
    ],
  },
]
