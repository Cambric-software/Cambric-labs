// Pure-node cycle check on the concept catalog (regex extraction, no TS runner).
const fs = require('fs')
const src = fs.readFileSync('src/curriculum/concepts/catalog.ts', 'utf8')

// Extract concept blocks: id: 'x', ... prerequisiteConceptIds: [ 'a', 'b' ]
const blocks = [...src.matchAll(/id:\s*'([^']+)'/g)].map(m => m[1])
const prereqMatches = [...src.matchAll(/prerequisiteConceptIds:\s*\[([^\]]*)\]/g)]
const prereqs = prereqMatches.map(m =>
  [...m[1].matchAll(/'([^']+)'/g)].map(x => x[1])
)

const ids = blocks
const dupIds = ids.filter((id, i) => ids.indexOf(id) !== i)
console.log('concept count:', ids.length)
console.log('duplicate ids:', dupIds)

const byId = new Set(ids)
let missing = 0
for (const ps of prereqs) for (const p of ps) if (!byId.has(p)) missing++
console.log('missing prereq refs:', missing)

// cycle detection
const adj = new Map()
ids.forEach((id, i) => adj.set(id, prereqs[i] || []))
const WHITE = 0, GRAY = 1, BLACK = 2
const color = new Map(ids.map(id => [id, WHITE]))
let cycle = null
function dfs(id, path) {
  color.set(id, GRAY)
  for (const dep of (adj.get(id) || [])) {
    if (!byId.has(dep)) continue
    const c = color.get(dep)
    if (c === GRAY) { cycle = [...path, id, dep]; return true }
    if (c === WHITE && dfs(dep, [...path, id])) return true
  }
  color.set(id, BLACK)
  return false
}
for (const id of ids) if (color.get(id) === WHITE && dfs(id, [])) break
console.log('cycle:', cycle ? cycle.join(' -> ') : 'none')
