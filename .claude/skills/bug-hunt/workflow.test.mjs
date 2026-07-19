#!/usr/bin/env node
// Tests for the bug-hunt workflow script embedded in SKILL.md.
// Run: node .claude/skills/bug-hunt/workflow.test.mjs
//
// The script lives inline in SKILL.md because the Workflow tool's `script`
// parameter is the guaranteed-supported entry point. That keeps it invisible to
// normal tooling, so this test extracts it and executes it against stubs — the
// verification filter (refuted findings are dropped, low-confidence findings are
// dropped) is the part that must never silently regress.

import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const md = readFileSync(join(here, 'SKILL.md'), 'utf8')

const match = md.match(/```javascript\n([\s\S]*?)```/)
if (!match) {
  console.error('FAIL: no javascript block found in SKILL.md')
  process.exit(1)
}

const body = match[1].replace('export const meta', 'const meta')

const harness = `
const args = { worktree: '/tmp/wt', finders: 3 }
const agent = async (prompt, opts) => {
  if (opts.phase === 'Find') {
    return opts.label === 'find:logic'
      ? { findings: [
          { title: 'real bug',       file: 'a.ts', line: 3, severity: 'high',     detail: 'd', scenario: 's' },
          { title: 'false positive', file: 'b.ts', line: 9, severity: 'low',      detail: 'd', scenario: 's' },
          { title: 'low confidence', file: 'c.ts', line: 1, severity: 'critical', detail: 'd', scenario: 's' },
        ] }
      : { findings: [] }
  }
  if (prompt.includes('b.ts')) return { refuted: true,  confidence: 10, reason: 'guarded' }
  if (prompt.includes('c.ts')) return { refuted: false, confidence: 50, reason: 'unsure' }
  return { refuted: false, confidence: 95, reason: 'reproduced' }
}
const parallel = async (thunks) => Promise.all(thunks.map(f => f()))
const pipeline = async (items, ...stages) => Promise.all(items.map(async (item, i) => {
  let v = item
  for (const s of stages) v = await s(v, item, i)
  return v
}))
const log = () => {}
const main = async () => {
`

const tail = `
}
const r = await main()
const titles = r.confirmed.map(f => f.title)
const expect = (name, cond) => {
  console.log(cond ? \`  PASS  \${name}\` : \`  FAIL  \${name}\`)
  return cond
}
let ok = true
ok = expect('refuted finding is dropped',            !titles.includes('false positive')) && ok
ok = expect('sub-threshold confidence is dropped',   !titles.includes('low confidence')) && ok
ok = expect('verified finding survives',              titles.includes('real bug'))       && ok
ok = expect('exactly one confirmed',                  r.confirmed.length === 1)          && ok
ok = expect('dropped count reported',                 r.dropped === 2)                   && ok
console.log(ok ? '\\nAll tests passed.' : '\\nTests failed.')
process.exit(ok ? 0 : 1)
`

const mod = `data:text/javascript,${encodeURIComponent(harness + body + tail)}`
await import(mod)
