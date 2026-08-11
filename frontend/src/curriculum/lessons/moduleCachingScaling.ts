/**
 * Cambric Labs — Module: Caching & Scaling (Backend)
 *
 * Two lessons: caching (write-through/TTL/write-behind, the hardest
 * problem in invalidation), and horizontal scaling (stateless, load
 * balancing, queues, sharding).
 */
import type { LessonDetail } from '../types'

export const cachingScalingLessons: LessonDetail[] = [
  {
    id: 'lesson-caching',
    title: 'Caching: Trading Memory for Speed (and the Invalidation Problem)',
    moduleId: 'module-caching-scaling',
    languageId: 'python',
    difficulty: 4,
    estimatedMinutes: 12,
    summary:
      'A cache is a small fast store that keeps recently used data so future ' +
      'reads skip the slow path. The hard part is not storing — it is ' +
      'deciding when a cached value is stale. TTL, write-through, and ' +
      'write-behind each trade latency, consistency, and complexity.',
    teachesConceptIds: ['cache', 'cache-invalidation', 'redis-cache', 'cdn', 'performance'],
    prerequisiteConceptIds: ['memory-model', 'client-server', 'database', 'http'],
    objectives: [
      'Explain the cache hit/miss tradeoff and when caching pays off.',
      'Compare TTL, write-through, and write-behind invalidation strategies.',
      'Reason about the cache stampede and how request coalescing prevents it.',
      'Choose an eviction policy (LRU) and a realistic cache size.',
    ],
    content: [
      {
        kind: 'paragraph',
        text:
          'Reading from memory is nanoseconds; reading from a database over ' +
          'the network is milliseconds — a 1000x gap. A cache sits in front ' +
          'of the slow store and keeps hot data in memory so most reads ' +
          'never hit the database. The catch: the cache is a copy. When the ' +
          'source changes, the copy is now wrong. Deciding when a cached ' +
          'value is stale — and what to do about it — is the entire hard ' +
          'part of caching.',
      },
      {
        kind: 'heading',
        text: 'Three ways to keep a cache fresh',
      },
      {
        kind: 'compare',
        languageIds: ['python', 'python'],
        caption:
          'Write-through (strong, slow) vs write-behind (fast, risky) vs TTL (simple, stale).',
        snippets: [
          "# write-through: update cache AND db in the write path\n# consistent, but every write pays the db latency\nset(key, value); db.update(key, value)",
          "# write-behind: update cache now, async-write db later\n# fast writes, but a crash loses unflushed updates\nset(key, value); queue.defer(lambda: db.update(key, value))",
        ],
      },
      {
        kind: 'callout',
        variant: 'info',
        title: 'TTL: the simplest, stalest option',
        text:
          'Give every entry a time-to-live; after it expires the next read ' +
          'is a miss and refreshes from the source. Between expiry and the ' +
          'next read, the value can be stale, but you never have to track ' +
          'writes. TTL is the right default when "slightly stale" is ' +
          'acceptable (a leaderboard, a config) and wrong when it is not ' +
          '(a balance).',
      },
      {
        kind: 'heading',
        text: 'The cache stampede',
      },
      {
        kind: 'code',
        languageId: 'python',
        caption: 'On a miss, many requests race to refresh the same key.',
        code: "def get_user(uid):\n    v = cache.get(f'user:{uid}')\n    if v is None:           # MISS\n        v = db.fetch_user(uid)   # SLOW — and every concurrent caller does this too\n        cache.set(f'user:{uid}', v, ttl=60)\n    return v\n# a popular key expires -> 1000 requests all miss -> 1000 db fetches\n# the cache was supposed to PREVENT that load; now it causes a spike",
      },
      {
        kind: 'codeWithOutput',
        languageId: 'python',
        caption: 'Single-flight / request coalescing: one refresh serves all waiters.',
        code: "from asyncio import Lock, gather, sleep\n\nrefreshing = {}  # key -> in-flight refresh\n\nasync def get_user(uid, db, cache):\n    v = await cache.get(f'user:{uid}')\n    if v is not None:\n        return v                       # HIT\n    # MISS — but dedupe concurrent refreshes\n    if f'user:{uid}' not in refreshing:\n        refreshing[f'user:{uid}'] = Lock()\n    async with refreshing[f'user:{uid}']:\n        v = await cache.get(f'user:{uid}')  # double-check: someone refreshed it\n        if v is None:\n            v = await db.fetch_user(uid)    # ONE db hit\n            await cache.set(f'user:{uid}', v, ttl=60)\n    return v\n# 1000 concurrent misses -> 1 db fetch, 999 wait on the lock",
        output: '1 db fetch serves 1000 requests',
      },
      {
        kind: 'callout',
        variant: 'warning',
        title: 'Caches must fail open, not down',
        text:
          'If the cache is unreachable, the system must fall back to the ' +
          'database (slower, but correct), never error out. A cache ' +
          'outage should degrade latency, not break correctness. The ' +
          'database is the source of truth; the cache is an optimization.',
      },
      {
        kind: 'heading',
        text: 'Eviction: when the cache is full, who leaves?',
      },
      {
        kind: 'paragraph',
        text:
          'Memory is bounded, so a full cache must evict something. LRU ' +
          '(least-recently-used) evicts the entry not accessed for the ' +
          'longest time — a good, cheap heuristic that hot data stays and ' +
          'cold data goes. Redis gives you LRU/LFU/no-eviction as policies; ' +
          'pick based on access pattern.',
      },
      {
        kind: 'compare',
        languageIds: ['python', 'python'],
        caption:
          'No cache (every read hits db) vs cache with TTL+stampede guard.',
        snippets: [
          "def get(x): return db.get(x)            # every read = a db round trip",
          "def get(x):\n  v = cache.get(x, ttl=30)\n  if v is None:\n    v = db.get(x); cache.set(x, v, 30)\n  return v   # most reads hit memory; db load drops ~100x",
        ],
      },
    ],
    animation: {
      type: 'timeline',
      title: 'Cache stampede and single-flight prevention',
      steps: [
        { caption: 'Popular key user:42 has TTL=60s. Many requests HIT the cache for 59s.' },
        { caption: 'T=60s: key expires. 1000 concurrent requests MISS simultaneously.' },
        { caption: 'Without dedupe: all 1000 fetch user:42 from the db — a 1000x load spike on the db.' },
        { caption: 'With single-flight: the first miss acquires a lock; the other 999 await it.' },
        { caption: 'One db fetch fills the cache; all 1000 waiters return the refreshed value. db load: 1 fetch.' },
      ],
    },
    activity: {
      type: 'multipleChoice',
      title: 'Why a cache, and why not always?',
      prompt:
        'A dashboard reads a config that changes once a day, and a bank ' +
        'reads a live account balance. Which caching strategy fits each?',
      languageId: 'python',
      data: {
        question: 'Match strategy to data',
        options: [
          'TTL=60s for both — simplicity first.',
          'TTL for the config (stale is fine); no cache (or write-through) for the balance (stale is unacceptable).',
          'Write-behind for both.',
          'No cache for either; caching is only for static assets.',
        ],
        correctIndex: 1,
        explanation:
          'TTL fits data where "slightly stale" is acceptable (a config ' +
          'shown once a day). A balance must be exact, so either skip the ' +
          'cache or use write-through so the cache and db update ' +
          'atomically. Match the strategy to the staleness budget.',
      },
      checks: [],
    },
    comprehensionChecks: [
      {
        question: 'What is a cache stampede and how does single-flight prevent it?',
        options: [
          'A stampede is too many hits; single-flight caps hit rate.',
          'A popular key expires and many concurrent requests all miss and refresh from the source at once; single-flight dedupes them so one refresh serves all waiters via a shared lock.',
          'A stampede is memory overflow; single-flight adds more servers.',
          'A stampede is a write conflict; single-flight disables writes.',
        ],
        correctIndex: 1,
        explanation:
          'On expiry, every concurrent reader sees a miss. Without ' +
          'deduplication each issues a source fetch, recreating the load ' +
          'the cache existed to remove. A per-key lock (single-flight) ' +
          'lets the first miss do the work and the rest await it, ' +
          'collapsing N fetches into 1.',
      },
      {
        question: 'Why must a cache fail open (fall back to the source) when it is unreachable?',
        options: [
          'To keep the cache warm.',
          'Because the cache is an optimization over the source of truth, not a replacement for it; correctness must survive a cache outage, only latency degrades.',
          'To avoid paying for the cache.',
          'To reduce memory use.',
        ],
        correctIndex: 1,
        explanation:
          'The database is the source of truth. If the cache is down, ' +
          'reads must still return correct data by going to the db. ' +
          'Treat the cache as a latency optimization that can disappear ' +
          'at any time; never make correctness depend on it.',
      },
    ],
  },
  {
    id: 'lesson-horizontal-scaling',
    title: 'Horizontal Scaling: Many Cheap Machines Beat One Big One',
    moduleId: 'module-caching-scaling',
    languageId: 'python',
    difficulty: 4,
    estimatedMinutes: 12,
    summary:
      'Vertical scaling makes one machine bigger until you cannot afford ' +
      'it; horizontal scaling adds more machines. Stateless services scale ' +
      'out trivially behind a load balancer. Stateful data needs sharding, ' +
      'queues, and eventually a distributed-systems mindset.',
    teachesConceptIds: ['horizontal-scaling', 'load-balancing', 'message-queue', 'sharding', 'distributed-systems'],
    prerequisiteConceptIds: ['client-server', 'cache', 'database', 'session'],
    objectives: [
      'Distinguish vertical from horizontal scaling and when each applies.',
      'Explain why stateless services scale out and stateful ones do not.',
      'Describe a load balancer and session affinity tradeoffs.',
      'Use a message queue to smooth load spikes and decouple producers from consumers.',
    ],
    content: [
      {
        kind: 'paragraph',
        text:
          'When load grows you have two choices: make the machine bigger ' +
          '(vertical — more CPU, RAM) or add more machines (horizontal — ' +
          'more instances). Vertical is simple but has a hard ceiling and ' +
          'a single point of failure; horizontal is the only way past one ' +
          'machine\'s limits and gives redundancy for free. The catch: ' +
          'horizontal scaling demands that your services be stateless.',
      },
      {
        kind: 'heading',
        text: 'Stateless scales; stateful does not',
      },
      {
        kind: 'code',
        languageId: 'python',
        caption: 'In-memory session state breaks the moment you add a second instance.',
        code: "# instance A keeps sessions in a dict\nsessions = {}   # {session_id -> user}\n\n# user logs in -> hits A -> sessions[id] = user\n# next request -> load balancer sends to B -> B has no sessions -> logged out\n# you CANNOT add B without sharing the session store",
      },
      {
        kind: 'codeWithOutput',
        languageId: 'python',
        caption: 'Move session to a shared store; now any instance can serve any request.',
        code: "def login(user, response):\n    session_id = secrets.token_urlsafe(32)\n    redis.setex(f'session:{session_id}', 3600, user.id)  # shared store\n    response.set_cookie('session', session_id, httponly=True, secure=True)\n\n@route('/me')\ndef me(request):\n    uid = redis.get(f'session:{request.cookie}')  # any instance reads it\n    return users[uid]\n# now the load balancer can send any request to any instance — stateless",
        output: 'any instance serves any request; add/remove instances freely',
      },
      {
        kind: 'callout',
        variant: 'tip',
        title: 'Stateless = disposable',
        text:
          'A stateless instance keeps no per-user data in memory; all state ' +
          'lives in a shared store (db, redis). That means you can kill, ' +
          'restart, or add instances at will — autoscaling, zero-downtime ' +
          'deploys, and failover all become possible because no instance is ' +
          'special.',
      },
      {
        kind: 'heading',
        text: 'The load balancer: distributing requests',
      },
      {
        kind: 'paragraph',
        text:
          'A load balancer sits in front of your instances and picks one per ' +
          'request. Round-robin is simple and usually enough. "Least ' +
          'connections" sends to the instance with the fewest in-flight ' +
          'requests, better when requests vary in cost. Health checks remove ' +
          'sick instances from rotation automatically.',
      },
      {
        kind: 'callout',
        variant: 'warning',
        title: 'Session affinity is a trap',
        text:
          '"Sticky sessions" (send the same user to the same instance) let ' +
          'you keep in-memory sessions, but they create hot spots and break ' +
          'when that instance dies. Prefer a shared session store; use ' +
          'stickiness only as a temporary crutch, not architecture.',
      },
      {
        kind: 'heading',
        text: 'Smoothing spikes with a queue',
      },
      {
        kind: 'code',
        languageId: 'python',
        caption: 'A queue absorbs bursty producers; workers drain at their own pace.',
        code: "# web handler (producer): just enqueue, return 202 fast\n@route('/export', methods=['POST'])\ndef export(req):\n    queue.put({'job': 'export', 'user': req.uid})\n    return 'started', 202   # never blocks on the slow work\n\n# worker (consumer): pulls jobs one at a time\ndef worker():\n    while True:\n        job = queue.get()\n        do_slow_export(job)   # a 1000-request spike -> queues, not crashes",
      },
      {
        kind: 'callout',
        variant: 'info',
        title: 'Queues turn spikes into backlog',
        text:
          'A synchronous service dies under a 1000x spike because it tries ' +
          'to do all the work at once. A queue accepts the 1000 requests ' +
          'instantly (fast ack) and lets N workers drain them over time. ' +
          'Latency rises; the system stays up. Producers and consumers are ' +
          'decoupled — scale them independently.',
      },
      {
        kind: 'heading',
        text: 'When the database is the bottleneck: shard',
      },
      {
        kind: 'paragraph',
        text:
          'A single database has a write ceiling. Once you hit it, you ' +
          'partition (shard) the data: users whose id hashes to shard 0 ' +
          'live in db0, shard 1 in db1, etc. Each shard now handles a ' +
          'slice of writes. The cost: cross-shard queries and transactions ' +
          'become hard, so shard only along a natural partition key ' +
          '(tenant, region) you rarely cross.',
      },
      {
        kind: 'compare',
        languageIds: ['python', 'python'],
        caption:
          'Stateful instance (cannot scale) vs shared-store stateless (can).',
        snippets: [
          "sessions = {}  # per-instance; adding instances breaks auth",
          "redis.setex('session:'+id, 3600, uid)  # shared; any instance serves",
        ],
      },
    ],
    animation: {
      type: 'timeline',
      title: 'A spike: synchronous crash vs queue absorption',
      steps: [
        { caption: 'Normal: 10 req/s. 3 instances handle them with ease.' },
        { caption: 'Spike: 1000 req/s of slow exports arrive.' },
        { caption: 'Synchronous: all 3 instances start 1000/3 exports each; CPU saturates; new requests time out; the service appears down.' },
        { caption: 'With a queue: the web handlers enqueue 1000 jobs in ms and ack 202. Workers (say 10) pull jobs at their pace.' },
        { caption: 'The 1000 jobs drain over ~30s. Latency rose; availability stayed at 100%. The spike became a backlog, not an outage.' },
      ],
    },
    activity: {
      type: 'multipleChoice',
      title: 'What blocks horizontal scaling?',
      prompt:
        'You add a second instance and users start getting logged out. ' +
        'What is the root cause and the fix?',
      languageId: 'python',
      data: {
        question: 'Why did adding an instance break login?',
        options: [
          'The load balancer is misconfigured.',
          'Sessions live in per-instance memory; the second instance does not share them. Move sessions to a shared store (Redis) so any instance can serve any request.',
          'The new instance has less RAM.',
          'HTTP is stateless so this cannot happen.',
        ],
        correctIndex: 1,
        explanation:
          'In-memory sessions make each instance stateful and ' +
          'irreplaceable. The fix is to externalize state into a shared ' +
          'store; then instances are interchangeable and the load ' +
          'balancer can route freely. Stateless services scale out; ' +
          'stateful ones do not.',
      },
      checks: [],
    },
    comprehensionChecks: [
      {
        question: 'Why does making a service stateless enable horizontal scaling and zero-downtime deploys?',
        options: [
          'Stateless code runs faster.',
          'No instance holds per-user state, so any instance can serve any request; you can add, remove, restart, or fail over instances freely without losing sessions.',
          'Stateless services use less memory.',
          'Stateless code is easier to compile.',
        ],
        correctIndex: 1,
        explanation:
          'When all state lives in a shared store, instances are ' +
          'interchangeable workers. That makes autoscaling, blue/green ' +
          'deploys, and failover trivial — kill or add instances at will; ' +
          'the shared store carries the continuity.',
      },
      {
        question: 'How does a message queue help a service survive a traffic spike?',
        options: [
          'It caches the responses.',
          'Producers enqueue fast and ack immediately; workers drain at their own pace, so a 1000x spike becomes a backlog (higher latency) rather than a crash (lower availability).',
          'It shards the database.',
          'It scales the load balancer.',
        ],
        correctIndex: 1,
        explanation:
          'A synchronous service tries to do all concurrent work at once ' +
          'and saturates. A queue accepts work at memory speed and lets a ' +
          'fixed pool of workers process it over time, decoupling arrival ' +
          'rate from processing rate. Latency rises; the system stays up.',
      },
    ],
  },
]
