---
name: skill-creator
description: Create new skills and iteratively improve existing ones. Use whenever the work touches a skill at all — creating one from scratch, editing, refining, trimming, or splitting an existing skill, testing a skill against realistic prompts, or sharpening a `description:` so it triggers reliably. Fires on any edit under `.claude/skills/` or to a `SKILL.md`, even when the user doesn't say "skill".
---

# Skill Creator

Creating a skill is ordinary work — make the directory, copy the frontmatter shape
from a sibling skill, draft, ask about edge cases, iterate. You do all of that
unaided. This skill holds only the parts you'd otherwise get *wrong*: what belongs in
a skill and what doesn't, how skills load and trigger, and how to test one.

Three things you need from the user, and only from the user — everything else you
work out yourself:

1. **What should it let you do, and when should it fire?** — the intent and the
   trigger contexts. This becomes the `description`.
2. **What repo-specific facts must it encode that you can't discover** — a name, flag,
   value, or a non-obvious ordering.
3. **Should it be tested** against real prompts, or is it a taste/style skill where
   evals don't help?

Work out where the user already is and jump in there: if they have a draft, go
straight to testing; if they say "skip the evals, just vibe with me," do that.

---

## What belongs in a skill

### Skills are modules — treat them exactly like code

**This rule outranks every style preference below.** Manage skills the way this repo
manages reusable code: isolated units, a clear API, no leaked internals. Duplication
across skills drifts exactly like copy-pasted code drifts, and nothing type-checks it.

- **One owner per concern.** Exactly one skill defines a given thing — a topic, or a
  single rule, law, or convention. If it's already owned, extend that skill and
  reference it by name; don't write a second one that covers part of it. When a rule
  has no home yet but several skills need it, create the canonical skill first, then
  wire the references (as `plain-english` did for the jargon-free law, and
  `frontend-ui-architecture` for UI placement). A skill being long is fine; length is
  never a reason to split. Splitting is justified by a *different concern*, not by size.
- **Consumers call by name and nothing more.** A skill that invokes another names it
  and states what it's for — the way a caller invokes a method. It must NOT restate
  the callee's steps, commands, thresholds, tool mechanics, vocabulary, or history. If
  the callee changes, no consumer should need editing.
- **No private helper promoted to public API.** If a skill exists only to be run by
  one other skill, it isn't a skill — it's a section of that skill. Fold it in.
- **A cross-reference is one clause.** "Run the `X` skill" or "see `X` for Y". The
  moment a reference starts explaining *how* X works, the boundary has leaked.

When editing a skill, grep the other skills for its name and check every hit is still
a name-only mention. Stale restatements are the failure mode this rule exists to prevent.

### Write only what the agent can't work out at runtime

A skill records *what to do* and *why* — and only the parts the agent couldn't get
right on its own. Everything else is noise that buries the one thing the skill alone
can tell the reader. Before writing any line, ask: **would I get this right at runtime
without being told?** If yes, leave it out. This is the single biggest source of
bloat, and it comes in three shapes:

- **The obvious.** Mechanics the agent knows cold — the git, the shell, the everyday
  tooling — and steps or caveats a competent agent supplies unaided. A skill that
  reads like a script the agent could have written itself is mostly noise. Inlined
  detail also *drifts*: the command goes stale while the agent's own knowledge stays
  current.
- **The restatement.** Saying a thing more than once — a summary that re-derives the
  steps, a definition repeated for emphasis, the same rule in three places. State each
  fact once, where it belongs. What matters in most skills is a tiny core — the
  **conditions** and **definitions** the agent can't infer; write those sharply and
  let the rest go.
- **The leaked mechanic.** When a reference file owns a tool (its commands, flags,
  quirks — even its *name*), route everything about it through the pointer. Say "read
  X per `references/foo.md`" and stop. The tool name is itself a mechanic — a second
  copy that drifts if the tool ever changes. State the condition or intent; let the
  reference own the how.

Reserve explicit, literal detail for the three cases where the agent *can't* be
trusted to get it right unaided:

- **Non-obvious** — a step no reasonable agent would infer (a surprising ordering, a
  subtle precondition).
- **Repo-specific** — a name, flag, or convention that only holds here and can't be
  guessed. (Not a *path used to say where something lives* — see below.)
- **Destructive-if-wrong** — where a wrong guess loses work or ships something bad, so
  pinning down the exact form earns its space.

One genuine exception runs the other way: **code that executes without the agent in
the loop must be a literal, checkable script**, not intent. A background poll loop (as
`wait-for-pr-merge` externalizes) runs detached — the agent isn't there to fill in the
mechanics. The line is simple: run *by* the agent → intent is enough; run *detached* →
write the script.

### Two things whose home is outside the skill

Each lives elsewhere, so a copy inside the skill is drift or a leak:

- **Repo paths.** Name locations by concept ("the shared core package", "the Hasura
  metadata"), not by path — a path is the first thing a refactor breaks, and the
  current one is always discoverable from the code. Fine to keep: a pointer to a
  `references/` fact-file, and the path slot an example command needs
  (`docker build -f <dockerfile> .`).
- **Private values.** Public repo — state the *mechanism* (which keys exist, that a
  flag overrides a default), never the *values* (user IDs, account names, secrets),
  which stay in local config and memory. Use a placeholder and scan the diff for real
  IDs, handles, and tokens before finishing.

### Style

- **Imperative, and explain the why.** Explain *why* something matters rather than
  leaning on heavy-handed MUSTs — given the reasoning, the model goes beyond rote
  compliance. All-caps ALWAYS/NEVER is a yellow flag: reframe and give the reason.
- **Keep examples evergreen.** An example illustrates a rule — it must not tie the
  skill to volatile state. No real ticket or PR numbers, dated URLs, or live record
  IDs: the moment that record moves, the example misleads the next reader. Use a
  generic scenario that still reads true a year from now.
- **No surprises.** A skill's contents shouldn't surprise the user given its stated
  intent. No malware, exploit code, or anything built to facilitate unauthorized
  access or data exfiltration. (Harmless things like "roleplay as an X" are fine.)

---

## How skills load

```
skill-name/
├── SKILL.md (required — frontmatter with name + description, then instructions)
└── Bundled resources (optional)
    ├── scripts/    - executable code for deterministic/repetitive tasks
    ├── references/ - docs loaded into context as needed
    └── assets/     - files used in output (templates, icons, fonts)
```

Three load levels — put each thing at the level where it's needed:

1. **Metadata** (name + description) — always in context.
2. **SKILL.md body** — loaded whenever the skill triggers. Aim under ~500 lines; if
   you're near it, add hierarchy with clear pointers to where to look next.
3. **Bundled resources** — pulled in only as needed (scripts can execute *without*
   being loaded into context). Give large reference files (>300 lines) a table of
   contents.

Anything you bundle must actually ship alongside the SKILL.md, or it fails at runtime.
When a skill spans several domains, split by variant so only the relevant file loads
(e.g. `references/{aws,gcp,azure}.md` under a SKILL.md that selects between them).

---

## The description — the sole trigger

Claude picks a skill from its name + description alone, so the description carries both
*what it does* and *when to reach for it* — every "when to use" cue lives here, not in
the body. Claude tends to *undertrigger*, so make it a little pushy: not "How to build
a fast dashboard" but "How to build a fast dashboard. Use this whenever the user
mentions dashboards, metrics, or wants to display any kind of data, even if they don't
say 'dashboard.'"

Pressure-test it with a handful of realistic queries — a mix of *should-trigger* and
*should-not-trigger*, the near-misses sharing keywords but needing something different.
The ambiguous cases are the valuable ones. Refine until it catches the real cases and
leaves the near-misses alone. (A trivial one-step task may not trigger a skill even
with a perfect description — Claude reaches for skills on work it can't easily handle
directly — so don't chase the un-catchable.)

---

## Testing

Worth it for skills with verifiable outputs (file transforms, extraction, codegen,
fixed workflow steps); skip it for taste/style skills where there's nothing objective
to compare.

Write 2-3 prompts a real user would actually say, confirm them with the user, then for
each run two subagents in the same turn:

- **With-skill:** give it the skill and the task.
- **Baseline:** the same prompt with no skill (new skill), or a `cp -r` snapshot of the
  old version (when improving one).

Comparing the two shows what the skill actually *changes*, not just whether its output
looks plausible. **Read the transcripts, not only the final outputs** — if the skill
sent the model down a worse path or wasted its effort, that's the signal to cut the
part causing it. When you rewrite, generalize from the feedback rather than overfitting
to these few prompts; and if every run reinvented the same helper, bundle it once in
`scripts/`.
