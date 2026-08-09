---
name: writing-task-specs
description: This skill should be used whenever the user asks to "create a ticket", "write a task", "scope this out", "break this down", "raise a bug", "create a parent", "plan this feature", or any variant where work is being captured. Also use when the user describes a problem, bug, or feature idea and the natural next step is a written spec. Enforces the task-spec shapes (bug, small feature, large feature scoping, product/user story) and the conventions around parent/sub-task breakdown as tracker issues and projects (see `task-tracker` for the tracker itself and its commands).
---

# Writing Task Specs

Produce clear, consistent task specs that match the shape of the work, so a developer (or AI agent) can pick one up and start without asking questions.

This skill owns the **shapes** of a good spec — the templates below. The `task-tracker` skill owns the tracker itself: which tool it is, the team, the project-is-an-app model, the state lifecycle, and every command form. Read it for how to create and wire what this skill describes. The model in one line: every issue lives in an **app's project**, and a large feature is a **parent issue inside** that project — never a project of its own.

## The four shapes — identify which one first

The shapes are not interchangeable; they serve different audiences. Pick the shape before writing anything (ask if unsure), and match its detail level — neither over- nor under-documented.

| Shape | Purpose | Typical outcome |
|-------|---------|-----------------|
| **Bug** | Something is broken. Specific, reproducible. | One issue → one PR fix |
| **Small feature** | A single focused change that maps to one PR | One issue → one PR |
| **User story** | A user need or product direction, in plain language. Not technically scoped. | One issue in `Backlog` → later becomes a parent issue when a developer picks it up |
| **Large feature (scoped)** | A technically broken-down feature with sequenced sub-tasks. The *result* of scoping a user story. | One parent issue + sub-issues → many PRs |

A **user story** and a **large feature** are the same work at two stages: a story describes *what* and *why* from the user's side; when a developer picks it up and scopes it technically, that produces the parent issue (with sub-issues). The story stays as a reference — link it from the parent.

```
User story issue (plain language, user perspective, in Backlog)
    ↓ developer picks it up, scopes technically
Parent issue (description + document, sub-issues wired by blocking relations)
    ↓ sub-issues get worked
PRs merge to main
```

Not every story becomes a large feature — scoping sometimes reveals it's really a small feature. That's fine; the point is the story doesn't try to answer technical questions.

## Every ticket opens in plain words

Whatever the shape, the **first thing in the description** is a plain-English orientation block — the ticket's answer to "what is this about?" — that anyone (a non-technical tester, a first-week dev, the owner skimming on their phone) understands *before* any file path, symbol, or acronym appears.

The jargon-free law — what counts as plain, the comprehension test, before/after examples, and the header and length per context — lives in `plain-english`; load it before writing the block. This skill owns only *where* the block sits and which header each shape uses:

- **Bug, Small feature, Large-feature parent** → `**In plain words**`.
- **User story** → its own `**The user's problem**` section *is* the block; no separate header.
- **Sub-issue** → `**Why this matters**`: one line on what part of the user-facing feature this piece contributes.

## Titles and slugs

The title should tell a developer what they're looking at before they open it. The tracker assigns the identifier; you don't pick one (see `task-tracker`).

- Active voice or noun phrase, no gerunds ("Fix" not "Fixing")
- Name the app or domain when relevant (library, listen, watch, til, finance, journal)
- No square-bracket prefixes — put the domain in the title naturally; no AI attribution

The **slug** is the kebab-case short form of the title, used to name the worktree and branch (see `task-tracker`). Keep it short: `sticky-progress-bar`, `bulk-import-tracks`.

Good: `Library progress bar loses its label when many chapters are listed` · `Add bulk import for listen playlist tracks` · `Migrate library read path to compute-on-read GraphQL`

Bad: `Bug in library` (vague) · `[finance] Fix totals` (brackets, not specific) · `As a user I want to import tracks` (story prefix, redundant)

## Shape 1 — Bug

A specific, reproducible issue. Create a single issue with the `bug` label and an `estimate`. The body below is the issue **description** (Markdown).

```markdown
**In plain words**  _(see `plain-english`)_

[2–4 sentences: what a user sees going wrong and why it matters.]

**Problem**

[1–3 sentences. What is broken, where, who reported it. Be specific enough that the reader can picture the bug without seeing it.]

**Root cause**

[If known: the underlying reason. Skip if not yet investigated — leave a note that root cause needs investigation.]

**Solution**

[Proposed fix. Key files if obvious. Skip if the fix path is unclear and needs investigation first.]

**Acceptance criteria**

* [Concrete, verifiable outcome 1]
* [Concrete, verifiable outcome 2]
* [No regression on X]
```

Note who reported it if known, and where the fix touches shared code, make "no regression on X" a criterion. A filled-in example is in `references/spec-examples.md`.

## Shape 2 — Small feature / improvement

A single focused change that maps to one PR. No sub-tasks. One issue with an `estimate`, attached to its project.

```markdown
**In plain words**  _(see `plain-english`)_

[2–4 sentences: what the user can't do easily today, what they'll be able to do after, and why it's worth building.]

**Problem**

[What user need or friction this addresses. 1–2 sentences.]

**Proposed solution**

[What's being built. Key behaviour. 2–4 sentences.]

**Acceptance criteria**

* [Concrete outcome 1]
* [Concrete outcome 2]
```

A filled-in example — bulk import for listen tracks — is in `references/spec-examples.md`.

## Shape 3 — User story

Captures a user need in plain language. It does **not** solve the problem technically — that happens later when a developer scopes it. Create it as an issue in **`Backlog`** (see `task-tracker`); link it from the parent issue once scoped.

A user story is for describing the problem from the user's side, exploring approaches without committing to one, and giving a developer a starting point to scope. It is **not** a technical spec, a commitment to an implementation, or something worked on directly — it *spawns* work, it doesn't *become* work.

```markdown
**The user's problem**

[2–4 paragraphs in plain language. Who has this problem? What does their current experience look like? What's frustrating or broken about it? Write as if you're explaining to someone outside the team.]

**The internal problem**

[Optional. If there's an internal cost too — manual work, maintenance burden, workarounds. 1–3 paragraphs.]

**The opportunity**

[What would be different if this were solved? What does the ideal experience look like? 1–2 paragraphs.]

**Ideas and approaches**

[Explore possible solutions at a product level. What could the experience be? What are the tradeoffs between approaches? It's fine to list multiple options with pros/cons. This section is deliberately open — it gives the developer context for when they scope it technically.]

**User experience**

[Walk through what the user would see and do, step by step. Keep it concrete but don't prescribe UI specifics — describe the *flow*, not the *implementation*.]

**Scope**

[What's in scope for this story. What's deliberately out of scope and why — this prevents scope creep when someone picks it up.]

**Open questions**

[Things that need to be figured out during scoping. Better to list unknowns than to invent answers.]

**Future possibilities (out of scope)**

[Things that would be valuable later but are explicitly deferred. Useful context for the developer doing the scoping — they'll know what to design for without building it.]
```

The **Ideas and approaches** and **Open questions** sections carry the most value — give real options and tradeoffs, and list unknowns honestly rather than inventing answers. The richest filled-in example — document ingestion for til — is in `references/spec-examples.md`; read it when scoping any user story.

## Shape 4 — Large feature (scoped)

A parent issue in the app's project whose **description** carries the technical scope, with one **sub-issue per sub-task** and **blocking relations** for the dependency graph (which also encode waves). Usually the output of a developer scoping a user story; occasionally created directly for well-understood work. See `task-tracker` for the create and relation commands.

### Scoping conversation

Before creating anything:

1. **Start from the user story** (if any) — the problem, ideas explored, open questions.
2. **Identify the architectural shape.** What's touched — a frontend app, `packages/core` hooks, the Hasura layer, the Hono backend? Is there an existing pattern? For frontend work, `frontend-ui-architecture` decides *where* each piece lands, which shapes how a sub-task is scoped.
3. **Resolve the open questions** — they become decisions in the parent description.
4. **Write the goal & verification sub-issue first** (see below) — before naming a single code sub-task. If you can't write a concrete walkthrough and "how to know it's done" list yet, the concept isn't settled — go back to `product-planning`.
5. **Break into sub-tasks**, each passing `micro-prs`' one-purpose test and staying inside one app/package — split now, at scoping time, not after the branch is built.
6. **Derive the dependency graph from the code** with `dependency-analysis` — it decides which sub-tasks are isolated and which carry a real `blockedBy`. This skill only records what it returns.
7. **Group into waves only where step 6 found a real blocker.** If everything is parallel, skip waves and the dependency-graph section.
8. **Confirm the breakdown with the user** before creating anything.

### Parent issue description

Not worked on directly — its sub-issues do the work. For a heavy domain concept, also create a tracker **document** attached to the project (see `product-planning` and `task-tracker`).

```markdown
**In plain words**  _(see `plain-english`)_

[2–4 sentences: what this feature lets a user do that they can't today, and why it matters — before any architecture appears.]

**Context**

[Link to the user story issue. 1–2 sentences summarising the user need this delivers on. Do not repeat the full user story — link to it.]

**Technical approach**

[The architectural decision. Why this approach over alternatives. Link to docs/documents that explain broader patterns if relevant (compute-on-read, deployment model).]

**[Domain-specific sections as needed]**

For features involving data models or complex logic, include sections like:
* GraphQL query / data model
* Domain knowledge (rules a developer needs)
* Return types / interfaces

**Estimation**

| | Hours |
|---|---|
| Sequential total | Xh |
| Parallel total (critical path) | Xh |

**Sub-tasks (N total)**

Flat by default — one table, no waves, when nothing has a real dependency (the common case):

| Sub-task | Work | Est |
|----------|------|-----|
| <title> | <description> | Xh |

Only when a real dependency exists, group into waves instead and add a **Dependency graph** section (a text diagram of what blocks what):

**Wave 0 — [Wave name]**

| Sub-task | Work | Est | Blocked by |
|----------|------|-----|------------|
| <title> | <description> | Xh | — |

**Wave 1 — [Wave name]**

[... same table format, blocked-by references earlier sub-tasks]

**Verification**

* [Type-check, tests, build]
* [Manual checks]
* [E2E tests]

**Existing code references**

| What | Path |
|------|------|
| Reference implementation | packages/core/src/library/query-hooks/currentReading.ts |

**Related**

* [link to the user story issue] — user story
* [Tracker document or external doc] — relevant patterns
```

### Sub-task issue

Each sub-task is one sub-issue under the parent, and one small PR. It inherits context from the parent — do not repeat the architecture or rationale.

```markdown
**Why this matters**  _(one plain-language line — see `plain-english`)_

[One sentence, no jargon: what part of the user-facing feature this piece contributes to.]

**What**

[1–2 sentences describing the specific change.]

**Files / scope**

[Files or modules touched, in this ONE repo/app only — see `micro-prs`. If the list spans two apps or two repos, split the sub-task before creating it.]

**Acceptance criteria**

* [Concrete outcome]
* [Tests pass]
* [No regression on dependent code]
```

Run `micro-prs`' one-purpose test against the `What` and `Files / scope` before creating it — if either quietly covers more than one independently-nameable job, it's two sub-tasks, not one.

### The goal & verification sub-issue — every large feature's first sub-issue

Before any code sub-issue, write one whose entire job is answering: **"how does anyone, with zero context, know the whole feature works once every sub-issue is done?"** Each sub-issue's own acceptance criteria only prove its own slice; nobody's prove the assembled feature delivers the user story. This sub-issue is that missing check — and writing it first doubles as a sanity check on the breakdown, because if you can't write a concrete verification step, the shape isn't settled.

Create it as the **first** sub-issue, titled `Goal & verification — <feature>`, with no `blockedBy` (nothing precedes it; every other sub-issue may link back to it):

```markdown
**Why this matters**

This is the checklist for the whole feature, not one slice of it — read it before touching any of the other sub-issues, and use it to confirm the parent is actually done once they've all landed.

**Goal — what "done" looks like**

[Plain-English walkthrough of the feature end-to-end, written as if explaining to someone who has never seen this app. What can a user now do that they couldn't before? No jargon, no file paths — see `plain-english`.]

**User stories**

* As a <who>, I can <what>, so that <why>.
* [one per distinct user-facing capability the feature delivers]

**Full walkthrough — a fresh dev or non-technical tester can follow this with no other context**

1. [Concrete, click-by-click step]
2. [Concrete, click-by-click step]
3. ...
N. [The observable result that proves it worked]

**How to know the whole feature is done**

* [Observable outcome — something you can see, click, or check, not an implementation detail]
* [Observable outcome]
* ...

**Explicitly out of scope**

[What this feature deliberately does NOT do, so review doesn't drift into scope creep]
```

Mark it `Done` once the user confirms the walkthrough matches their intent — its deliverable is the spec being right, not code. It then sits as the reference every other sub-issue links back to, and is the acceptance test for the parent once every sub-issue merges.

### Sub-task titles

The parent gives the context, so titles can be short and untagged (no `[domain]` prefix): `Reading-stats aggregation in readingStats query-hook` · `Compute total listening time in listen query-hook` · `Hook wiring (useCurrentReading)`.

### Sequencing — flat by default, waves only when earned

Most breakdowns are a flat list — nothing has a real dependency, so nothing gets a `blockedBy`:

```text
No waves — all startable now:
  types-only             — new interfaces in packages/core, no implementation
  ui-shell               — empty dialog + button in apps/til, no wiring yet
  parser-helper          — pure text→notes parser in packages/core, unit-tested alone
  hasura-permissions     — read permission for the new table (apps/hasura, its own PR)
```

Waves appear only where `dependency-analysis` returned real edges. A worked graph for an `Import notes` parent:

```text
Wave 0 — Foundations (no blockers):
  parser-helper          — pure text→notes parser in packages/core
  import-dialog-shell    — empty dialog + button in apps/til

Wave 1 — Preview:
  preview-table          — blockedBy: [parser-helper, import-dialog-shell]

Wave 2 — Save:
  save-wiring            — blockedBy: [preview-table]
```

A sub-task can be *developed* in parallel even when blocked — it just can't merge until its blockers are `Done`. Never invent a `blockedBy`: every edge comes from `dependency-analysis`, which owns the real-vs-fake test.

## Creating it

Creating an issue is an external write, so **get the user's sign-off on the plan before creating anything — for every shape**, not just large features (this mirrors the workspace's plan-before-code gate). Draft the spec matching the shape, using the developer's existing context rather than re-investigating what's already been discussed. Then create it per `task-tracker` — one issue for a bug / small feature / user story; for a large feature, the parent first, then the goal & verification sub-issue, then one sub-issue per code sub-task (parent, project, estimate set, and a `blocked-by` only where step 6 found a real dependency). Confirm back to the user with the identifiers and URLs.

## Before you create — checklist

The template shows each shape's own sections; these are the cross-shape things it doesn't:

- Shape matches the work, and detail level matches the shape
- Title specific, no bracket prefixes; attached to the right app project
- Plan signed off by the user before this write
- UK English throughout; no AI attribution
