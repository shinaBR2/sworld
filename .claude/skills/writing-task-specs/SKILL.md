---
name: writing-task-specs
description: This skill should be used whenever the user asks to "create a ticket", "write a task", "scope this out", "break this down", "raise a bug", "create a parent", "plan this feature", or any variant where work is being captured. Also use when the user describes a problem, bug, or feature idea and the natural next step is a written spec. Enforces the task-spec shapes (bug, small feature, large feature scoping, product/user story) and the conventions around parent/sub-task breakdown as Linear issues and projects.
---

# Writing Task Specs

Produce clear, consistent task specs in **Linear** that match the shape of the work. A great spec lets a developer (or AI agent) pick it up and start without asking questions.

Tasks live in Linear — there is no in-repo task tracker. Everything goes in the **SWorld** team (`SWO`). Create and edit through the **`linear` CLI** ([schpet/linear-cli](https://github.com/schpet/linear-cli), installed via `brew install schpet/tap/linear`, authenticated with `linear auth login`) run with Bash — **never through any Linear MCP tools** (a connected Linear MCP server authenticates as the wrong account; if the CLI is missing or broken, stop and tell the user instead of falling back to MCP). The CLI takes `--state`, `--project`, and `--label` **by name** (e.g. `-s "In Progress"`, `--project "Main"`) and resolves them to the workspace's IDs for you — you never pass raw UUIDs. Pass markdown bodies with `--description-file` (issues) / `--content-file` (documents) rather than inline strings, and add `--no-interactive` when creating issues so it never prompts. If the matching project for an app doesn't exist yet, create it with `linear project create` first. For anything the CLI doesn't expose (e.g. querying parent/sub-issue relationships), use `linear auth token` + a direct Linear GraphQL API call with curl. The short version of the model:

**A `project` is an app** — the long-lived container for everything in one app: `Til`, `Watch`, `Listen`, `Game`, `Docs`, and `Main` (the main app, covering its finance, journal, and library areas). For a brand-new app surface, create the project with `linear project create` first. A project is *never* a single feature, and is never marked `Done`. Every issue belongs to exactly one project — its app.

- **Bug / small feature** → a single **issue** (`linear issue create`) in the app's project. Bugs carry the `bug` label.
- **User story** → an **issue in `Backlog`** in the app's project, written in plain language, not technically scoped. When a developer picks it up and scopes it, it spawns a large feature.
- **Large feature (scoped)** → a **parent issue** in the app's project, with one **sub-issue** per sub-task (`--parent SWO-NNN` = the parent issue). The parent issue's description + (for a heavy concept) a **Linear document** hold the spec; **waves** are encoded by **blocking relations** between sub-issues (`linear issue relation add`, optionally a `wave-N` label); **blocked-by** is a **blocking relation**; **estimate** is the issue **estimate** field (`--estimate`).

The fields that an in-repo tracker would keep in frontmatter are native Linear fields:

| Was frontmatter | Linear field (via `linear issue create` / `update`) |
|-----------------|------------------------------------------------------|
| `status:` | `-s/--state` — `Backlog` / `Todo` / `In Progress` / `In Review` / `Done` |
| `estimate:` | `--estimate` |
| which app | `--project` |
| `parent:` (which feature) | `--parent SWO-NNN` (the feature's parent issue) |
| `blocked-by:` | `linear issue relation add SWO-child blocked-by SWO-dep` |
| wave grouping | blocked-by relations (optionally a `wave-N` label) |
| bug / user-story tagging | `-l/--label` (repeatable) |

## Critical rules

- Match the spec shape to the work — do not force a bug template onto a feature, or vice versa
- For large features, do the scoping work in conversation with the user before creating the parent issue and sub-issues — do not invent sub-tasks without confirming the breakdown
- Sub-tasks must respect the deployment model: each one is small, independently mergeable, and revertible
- Always create in the **SWorld** team; attach every issue to the matching app **project** (Til, Watch, Listen, Game, Docs, Main) — a large feature is a parent issue *inside* its app's project, not a project of its own
- Before starting work on an issue, set its `state` to `In Progress` (see the `parallel-workflow` skill)

## The four spec shapes

Before writing anything, identify which shape applies. The shapes are not interchangeable — they serve different purposes and have different audiences.

| Shape | Purpose | Typical outcome |
|-------|---------|-----------------|
| **Bug** | Something is broken. Specific, reproducible. | One issue → one PR fix |
| **Small feature** | A single focused change that maps to one PR | One issue → one PR |
| **User story** | A user need or product direction, written in plain language. Not technically scoped. | One issue in `Backlog` → later becomes a parent issue when a developer picks it up |
| **Large feature (scoped)** | A technically broken-down feature with sequenced sub-tasks. The *result* of scoping a user story. | One parent issue + sub-issues → many PRs |

### The user story → large feature progression

These two shapes are connected. A **user story** describes *what* and *why* from the user's perspective. When a developer picks it up, they scope it technically — that scoping produces a **parent issue** (with sub-issues) inside the app's project.

The user story content often gets carried forward into the parent issue's context. The user story issue stays as a reference — link it from the parent issue (mention it in the description and relate the parent to it).

```
User story issue (plain language, user perspective, in Backlog)
    ↓ developer picks it up, scopes technically
Parent issue (description + document, sub-issues wired by blocking relations)
    ↓ sub-issues get worked
PRs merge to main
```

Not every user story becomes a large feature — sometimes scoping reveals it's actually a small feature. That's fine. The point is that the user story doesn't try to answer technical questions.

## Title and slug conventions

The issue/project **title** should be specific enough that a developer knows what they're looking at before opening it. Linear assigns the identifier (`SWO-123`); you don't pick one.

- Active voice or noun phrase, no gerunds in active titles ("Fix" not "Fixing")
- Reference the app or domain when relevant (library, listen, watch, til, finance, journal)
- No square-bracket prefixes — put the domain in the title naturally
- No Claude / AI attribution

A **slug** is still useful — it's the kebab-case short form derived from the title, used to name the worktree and branch when the work starts (see `parallel-workflow`). Keep it short: `sticky-progress-bar`, `bulk-import-tracks`.

Good titles:

- `Library progress bar loses its label when many chapters are listed`
- `Add bulk import for listen playlist tracks`
- `Migrate library read path to compute-on-read GraphQL`
- `Document ingestion — AI extraction with human review`

Bad:

- `Bug in library` (vague)
- `[finance] Fix totals` (square brackets, not specific — use the domain in the title naturally)
- `As a user I want to import tracks` (user-story prefix, redundant for the title)

## Shape 1 — Bug

For a specific, reproducible issue. Direct, short, focused on getting the fix right. Create a single issue with the `bug` label, `state: Todo`, and an `estimate`. The body below is the issue **description** (Linear descriptions are Markdown).

### Description structure

```markdown
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

### Example — the library progress bug

Created with `linear issue create --team SWO --project "Main" -l bug -s "Todo" --estimate 1 -t "Library reading progress bar loses its label on long books" --description-file <spec.md> --no-interactive` (library is a feature area of the main app), where the description file holds:

```markdown
**Problem**

When a book in the library app has many chapters, scrolling down to the chapters at the bottom of the reader loses the sticky progress bar that shows current chapter and percentage. The reader can't tell how far through the book they are, making it hard to resume.

Reported by a user during testing on a long audiobook.

**Root cause**

The progress bar relies on `position: sticky; top: 0`, but the reader's parent containers don't constrain height, so the chapter list grows to full content height and the page scrolls rather than the reader's internal scroll container. Since `position: sticky` only works relative to the nearest scrolling ancestor, the bar scrolls away.

**Solution**

Give the reader wrapper a constrained height (e.g. `calc(100vh - <header height>)`) so the reader's built-in `overflow-y: auto` activates and becomes the scroll context. The existing sticky CSS on the progress bar will then keep it pinned at the top.

Key files:
* `apps/main/src/components/ReaderLayout.tsx` — the wrapper has `overflow: 'hidden'` which may also interfere
* `apps/main/src/components/BookReader.tsx` — the Stack wrapping the reader needs a height constraint

**Acceptance criteria**

* Progress bar remains visible when scrolling through a book with many chapters
* The chapter list on the left stays in sync with the progress bar
* No layout regressions on short books
```

### Bug tips

- Always note who reported it if known — useful for follow-up
- If root cause is unclear, write "Root cause: needs investigation" rather than guessing
- Acceptance criteria should include "no regression" checks where the fix touches shared code

## Shape 2 — Small feature / improvement

For a single focused change that maps to one PR. Short spec, no sub-tasks. A single issue (`state: Todo`, an `estimate`, attached to the relevant `project`).

### Description structure

```markdown
**Problem**

[What user need or friction this addresses. 1–2 sentences.]

**Proposed solution**

[What's being built. Key behaviour. 2–4 sentences.]

**Acceptance criteria**

* [Concrete outcome 1]
* [Concrete outcome 2]
```

### Example

`linear issue create --team SWO --project "Listen" -s "Todo" --estimate 4 -t "Add bulk import for listen playlist tracks" --description-file <spec.md> --no-interactive`, description:

```markdown
**Problem**

Users building a playlist in the listen app have to add each track individually, which is slow when working from a tracklist they already have written down (15+ tracks).

**Proposed solution**

Add a "Paste tracklist" button to the playlist view. The button opens a dialog where users paste tabular text (from a notes app, a spreadsheet, or a webpage). The parser splits the text into rows and pre-populates a confirmation table where users review, edit, or delete rows before saving.

Behind feature flag `bulk_import_tracks`.

**Acceptance criteria**

* "Paste tracklist" button visible on the playlist view when the flag is on
* Pasting tabular text creates editable rows with title and artist pre-filled where detectable
* User can edit, add, or delete rows before saving
* Saving creates the tracks via the existing mutation flow
* Existing single-track entry continues to work unchanged
```

## Shape 3 — User story

A user story captures a user need or product direction in plain language. It does **not** try to solve the problem technically — that happens later when a developer scopes it into a large feature. Create it as an issue in **`Backlog`** (`state: "Backlog"`). When it's scoped, link it from the resulting parent issue.

### What a user story is for

- Describing the problem from the user's perspective
- Exploring ideas and possible approaches without committing to one
- Capturing context that would otherwise live only in someone's head
- Creating a starting point that a developer can pick up and scope technically

### What a user story is NOT

- A technical spec (no file paths, no architecture diagrams, no sub-tasks)
- A commitment to a specific implementation
- A spec that gets worked on directly — it spawns work (a parent issue + sub-issues), it doesn't *become* work

### Description structure

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

### Example — document ingestion for the til app

`linear issue create --team SWO --project "Til" -s "Backlog" -t "Import notes from existing documents into til" --description-file <spec.md> --no-interactive`, description:

```markdown
**The user's problem**

People accumulate "today I learned" notes in all sorts of places — a notes app, a scratch markdown file, the back of a meeting doc. Right now, getting them into the til app means re-typing each entry by hand. For someone migrating a backlog of 40+ notes, this takes hours and introduces transcription errors.

Users have told us they sometimes don't bother capturing learnings at all because the friction of getting them in isn't worth it — the notes just stay scattered.

**The internal problem**

Every migration request becomes a manual cleanup job — pasting, reformatting, fixing tags. This doesn't scale as more people start using the app.

**The opportunity**

If users could paste or upload an existing document and have the individual notes extracted automatically (with a chance to review before saving), we'd remove the biggest friction point in adopting the app. Users would bring their whole backlog instead of starting from scratch.

**Ideas and approaches**

*Option A: Paste from clipboard.* User copies text from their notes app and pastes into a text area. We split on headings or blank lines. Simple, works for plain text, doesn't handle PDFs or rich formatting.

*Option B: File upload with AI extraction.* User uploads a markdown, PDF, or text file. An AI model extracts discrete notes and suggests tags. More powerful, handles more formats, but adds complexity and cost per extraction.

*Option C: Hybrid.* Start with paste-from-clipboard as the baseline. Add AI extraction for files as a second phase. This lets us ship something useful quickly and iterate.

The hybrid approach feels right — paste covers most cases (most people keep notes as plain text), and AI extraction can come later for the richer formats.

**User experience**

1. User is on the til list view
2. Clicks "Import notes"
3. Dialog opens with a paste area and (later) a file upload zone
4. User pastes their notes
5. Preview list shows extracted notes with title and suggested tags pre-filled
6. User reviews, edits, deletes, or adds notes
7. Clicks "Import" — notes are created

**Scope**

In scope: paste-from-clipboard extraction, preview and edit step, creating notes via existing mutations.

Out of scope: file upload, AI extraction, auto-tagging, duplicate detection. These are future enhancements.

**Open questions**

- What separators do we split on? Headings only, blank lines, or both?
- Should we try to auto-suggest tags from the note content, or leave that to the user?
- Do we preserve markdown formatting in the body, or strip to plain text?

**Future possibilities (out of scope)**

- AI extraction from PDFs and rich documents
- Auto-tagging based on note content
- Importing into other apps (journal, library) from the same flow
```

### User story tips

- Write for a reader who doesn't know the codebase. Plain language throughout.
- The "Ideas and approaches" section is the most valuable part — it gives the developer options and tradeoffs to work with during scoping
- Don't force a single solution. If there are multiple good approaches, describe them all.
- Keep "Open questions" honest. Unanswered questions are better than assumed answers.

## Shape 4 — Large feature (scoped)

A technically broken-down feature with sequenced sub-tasks. This is the *output* of scoping — usually produced when a developer takes a user story and works out the implementation. It is a **parent issue** (`linear issue create --team SWO --project "<app>" …`) whose **description** carries the technical scope, with one **sub-issue per sub-task** (`--parent SWO-NNN` = the parent issue), and **blocking relations** (`linear issue relation add`) for the dependency graph (which also encode the waves).

### When this shape is created

- A developer picks up a user story and scopes it technically
- The user and developer have a scoping conversation to break down the work
- Occasionally, for well-understood work, a large feature is created directly (no user story precursor needed)

### Scoping conversation steps

1. **Start from the user story.** Read the user story issue. Understand the problem, the ideas explored, and the open questions.
2. **Identify the architectural shape.** What systems are touched? Frontend app, `packages/core` hooks, the Hasura layer, the `sworld-backend` Hono service? Is there an existing pattern to follow?
3. **Resolve the open questions.** The user story's open questions become decisions in the parent issue's description.
4. **Identify dependencies.** What blocks what? Where can work happen in parallel?
5. **Map to the deployment model.** Each sub-task must be small, independently mergeable, and revertible. Anything user-facing sits behind a feature flag until ready.
6. **Group into waves.** A wave is a set of sub-tasks that can be done in parallel — encode it with **blocking relations** (each wave's sub-issues are `blockedBy` the previous wave's). Subsequent waves depend on previous waves landing.
7. **Confirm with the user** before creating the parent issue and sub-issues. Show the proposed wave structure and dependency graph. Adjust until it's right.

### Parent issue description structure

The parent issue holds the technical scope. It is not worked on directly — its sub-issues do the work. Set this as the parent issue `description` (and, for a heavy domain concept, also create a Linear **document** attached to the app's project — see `product-planning`).

```markdown
**Context**

[Link to the user story issue (SWO-NNN). 1–2 sentences summarising the user need this delivers on. Do not repeat the full user story — link to it.]

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

**Waves & sub-tasks (N total)**

**Wave 0 — [Wave name]**

| Sub-task | Work | Est | Blocked by |
|----------|------|-----|------------|
| <title> | <description> | Xh | — |

**Wave 1 — [Wave name]**

[... same table format, blocked-by references earlier sub-tasks]

**Dependency graph**

[Text-based diagram showing what blocks what]

**Verification**

* [Type-check, tests, build]
* [Manual checks]
* [E2E tests]

**Existing code references**

| What | Path |
|------|------|
| Reference implementation | packages/core/src/library/query-hooks/currentReading.ts |

**Related**

* SWO-NNN — user story
* [Linear document or external doc] — relevant patterns
```

### Sub-task issue structure

Each sub-task is one sub-issue under the parent, and a small focused PR. It inherits context from the parent issue — do not repeat the architecture or rationale. Create with `linear issue create --team SWO --project "<app>" --parent SWO-NNN -s "Todo" --estimate N …`, then `linear issue relation add SWO-<new> blocked-by SWO-<dep>` for each dependency.

```markdown
**What**

[1–2 sentences describing the specific change.]

**Files / scope**

[Files or modules touched. Be specific.]

**Acceptance criteria**

* [Concrete outcome]
* [Tests pass]
* [No regression on dependent code]
```

### Sub-task titles

The parent issue gives the context, so the sub-task title can be short:

- `Reading-stats aggregation in readingStats query-hook`
- `Compute total listening time in listen query-hook`
- `Types + helper for monthly finance comparison`
- `Hook wiring (useCurrentReading)`

Do not prefix with `[domain]` or other tags — the parent issue already scopes the work.

### Wave and dependency example

A worked dependency graph for an `Import notes` parent issue (waves are encoded by `blockedBy` relations between sub-issues):

```
Wave 0 — Foundations (no blockers):
  parser-helper          — pure text→notes parser in packages/core
  import-dialog-shell    — empty dialog + button in apps/til

Wave 1 — Preview:
  preview-table          — blockedBy: [parser-helper, import-dialog-shell]

Wave 2 — Save:
  save-wiring            — blockedBy: [preview-table]
```

Each issue's `blockedBy` lists the issues above it. A sub-task can be *developed* in parallel even when blocked — it just can't merge until its blockers are `Done`.

## Process

When Claude has been working with the developer and a spec is needed:

1. **Identify the shape** — bug, small feature, user story, or large feature. Ask if unsure.
2. **For user stories** — focus on capturing the user's problem and ideas in plain language, as an issue in `Backlog`. Do not jump to technical scoping.
3. **For large features** — run the scoping conversation before creating anything. Confirm the breakdown with the user. If there's an existing user story, start from it.
4. **Draft the spec** matching the shape's structure. Use the developer's existing context, do not re-investigate things already discussed.
5. **Create in Linear** — `linear issue create` for a bug / small feature / user story; for a large feature: `linear issue create` for the parent (attached to the app `--project`), then `linear issue create` per sub-task with `--parent`, `--project`, and `--estimate` set, plus `linear issue relation add … blocked-by …` for dependencies. For a heavy domain concept, add a `linear document create --project "<app>" -t "…" -f <doc.md>`.
6. **Confirm to the user** what was created, with the issue identifiers and URLs.

## Validation checklist

Before creating a spec:

- Title is specific; no square-bracket prefixes
- Created in the **SWorld** team and attached to the right app **project**
- Shape matches the work (bug / small feature / user story / large feature)
- Detail level matches the shape — not over-documented, not under-documented
- Linear fields set: `--state`, plus `--estimate` / `--label` / `--parent` / blocked-by relations where relevant
- For bugs: `bug` label; problem, root cause (or note that it's unknown), solution (if known), acceptance criteria
- For small features: problem, proposed solution, acceptance criteria
- For user stories: `state: Backlog`, user problem front and centre, ideas explored but no technical spec, open questions listed honestly
- For large features: scoping conversation done, parent issue description has architecture + wave breakdown, sub-issues are small and revertible, `blockedBy` wiring matches the dependency graph and encodes the waves, links back to the user story issue if one exists
- UK English throughout
- No AI attribution

Internal-only refactors (type fixes, performance, cleanup users won't feel) don't need a spec note about visibility; user-facing changes should say so in the spec.
