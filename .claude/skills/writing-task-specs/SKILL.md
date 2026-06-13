---
name: writing-task-specs
description: This skill should be used whenever the user asks to "create a ticket", "write a task", "scope this out", "break this down", "raise a bug", "create a parent", "plan this feature", or any variant where work is being captured. Also use when the user describes a problem, bug, or feature idea and the natural next step is a written spec. Enforces the task-spec shapes (bug, small feature, large feature scoping, product/user story) and the conventions around parent/sub-task breakdown using markdown files under docs/tasks/.
---

# Writing Task Specs

Produce clear, consistent task specs as markdown files under `docs/tasks/` that match the shape of the work. A great spec lets a developer (or AI agent) pick it up and start without asking questions.

Tasks live as markdown, not in an external tracker. The full file/folder convention and templates live in [`docs/tasks/README.md`](../../../docs/tasks/README.md) — read it before creating files. The short version:

- **Parent task** → a folder `docs/tasks/<parent-slug>/` whose `README.md` *is* the parent spec.
- **Sub-task** → one file `docs/tasks/<parent-slug>/<child-slug>.md`.
- **Standalone task / bug** → a single file `docs/tasks/<slug>.md`.
- **Status** lives in YAML frontmatter: `status: todo | in-progress | in-review | done`, plus `blocked-by`, `estimate`, and (for children) `parent`.

## Critical rules

- Match the spec shape to the work — do not force a bug template onto a feature, or vice versa
- For large features, do the scoping work in conversation with the user before creating the files — do not invent sub-tasks without confirming the breakdown
- Sub-tasks must respect the deployment model: each one is small, independently mergeable, and revertible
- Before starting work on a task, set its frontmatter `status:` to `in-progress` and commit that change

## The four spec shapes

Before writing anything, identify which shape applies. The shapes are not interchangeable — they serve different purposes and have different audiences.

| Shape | Purpose | Typical outcome |
|-------|---------|-----------------|
| **Bug** | Something is broken. Specific, reproducible. | One file → one PR fix |
| **Small feature** | A single focused change that maps to one PR | One file → one PR |
| **User story** | A user need or product direction, written in plain language. Not technically scoped. | One file → later becomes a large feature when a developer picks it up |
| **Large feature (scoped)** | A technically broken-down feature with sequenced sub-tasks. The *result* of scoping a user story. | Parent folder + sub-task files → many PRs |

### The user story → large feature progression

These two shapes are connected. A **user story** describes *what* and *why* from the user's perspective. When a developer picks it up, they scope it technically — that scoping produces a **large feature** parent folder with sub-task files.

The user story content often gets carried forward into the large feature's context section. The user story file stays as a reference and gets linked from the large feature parent README.

```
User story (plain language, user perspective)
    ↓ developer picks it up, scopes technically
Large feature parent (architecture, waves, sub-tasks)
    ↓ sub-tasks get worked
PRs merge to main
```

Not every user story becomes a large feature — sometimes scoping reveals it's actually a small feature. That's fine. The point is that the user story doesn't try to answer technical questions.

## Title and slug conventions

The `title:` in frontmatter should be specific enough that a developer knows what they're looking at before opening the file. The slug (folder/file name) is the kebab-case short form.

- Active voice or noun phrase, no gerunds in active titles ("Fix" not "Fixing")
- Reference the app or domain when relevant (library, listen, watch, til, finance, journal)
- Slugs are lowercase kebab-case, derived from the title (`sticky-progress-bar`, `bulk-import-tracks`)
- No Claude / AI attribution

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

For a specific, reproducible issue. Direct, short, focused on getting the fix right. Lives as `docs/tasks/<slug>.md` (standalone) or as a child file under a parent.

### Structure

```markdown
---
title: <short specific title>
status: todo
estimate: 1h
---

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

```markdown
---
title: Library reading progress bar loses its label on long books
status: todo
estimate: 1h
---

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

For a single focused change that maps to one PR. Short spec, no sub-tasks. Lives as `docs/tasks/<slug>.md`.

### Structure

```markdown
---
title: <short specific title>
status: todo
estimate: 3h
---

**Problem**

[What user need or friction this addresses. 1–2 sentences.]

**Proposed solution**

[What's being built. Key behaviour. 2–4 sentences.]

**Acceptance criteria**

* [Concrete outcome 1]
* [Concrete outcome 2]
```

### Example

```markdown
---
title: Add bulk import for listen playlist tracks
status: todo
estimate: 4h
---

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

A user story captures a user need or product direction in plain language. It does **not** try to solve the problem technically — that happens later when a developer scopes it into a large feature. Lives as `docs/tasks/<slug>.md` until it's scoped, then gets linked from the large feature parent.

### What a user story is for

- Describing the problem from the user's perspective
- Exploring ideas and possible approaches without committing to one
- Capturing context that would otherwise live only in someone's head
- Creating a starting point that a developer can pick up and scope technically

### What a user story is NOT

- A technical spec (no file paths, no architecture diagrams, no sub-tasks)
- A commitment to a specific implementation
- A spec that gets worked on directly — it spawns work, it doesn't *become* work

### Structure

```markdown
---
title: <short specific title>
status: todo
---

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

```markdown
---
title: Import notes from existing documents into til
status: todo
---

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

A technically broken-down feature with sequenced sub-tasks. This is the *output* of scoping — usually produced when a developer takes a user story and works out the implementation. Lives as a folder `docs/tasks/<parent-slug>/` with a `README.md` (the parent spec) and one `.md` file per sub-task.

### When this shape is created

- A developer picks up a user story and scopes it technically
- The user and developer have a scoping conversation to break down the work
- Occasionally, for well-understood work, a large feature is created directly (no user story precursor needed)

### Scoping conversation steps

1. **Start from the user story.** Read the user story file. Understand the problem, the ideas explored, and the open questions.
2. **Identify the architectural shape.** What systems are touched? Frontend app, `packages/core` hooks, the Hasura layer, the `sworld-backend` Hono service? Is there an existing pattern to follow?
3. **Resolve the open questions.** The user story's open questions become decisions in the large feature README.
4. **Identify dependencies.** What blocks what? Where can work happen in parallel?
5. **Map to the deployment model.** Each sub-task must be small, independently mergeable, and revertible. Anything user-facing sits behind a feature flag until ready.
6. **Group into waves.** A wave is a set of sub-tasks that can be done in parallel. Subsequent waves depend on previous waves landing.
7. **Confirm with the user** before creating the folder and files. Show the proposed wave structure and dependency graph. Adjust until it's right.

### Parent README structure

The parent holds the technical scope. It does not get worked on directly — the sub-tasks do the work. Write it to `docs/tasks/<parent-slug>/README.md`.

```markdown
---
title: <feature title>
status: todo
estimate: 18h
---

**Context**

[Link to the user story file. 1–2 sentences summarising the user need this delivers on. Do not repeat the full user story — link to it.]

**Technical approach**

[The architectural decision. Why this approach over alternatives. Link to docs that explain broader patterns if relevant (compute-on-read, deployment model).]

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

**Wave 0 — [Name]**

| Sub-task | Work | Est | Blocked by |
|----------|------|-----|------------|
| `<child-slug>` | <description> | Xh | — |

**Wave 1 — [Name]**

[... same table format, blocked-by references earlier slugs]

**Dependency graph**

[Text-based diagram showing what blocks what, by slug]

**Verification**

* [Type-check, tests, build]
* [Manual checks]
* [E2E tests]

**Existing code references**

| What | Path |
|------|------|
| Reference implementation | packages/core/src/library/query-hooks/currentReading.ts |

**Related**

* docs/tasks/<user-story-slug>.md — user story
* docs/... — relevant docs
```

### Sub-task file structure

Each sub-task is one file, `docs/tasks/<parent-slug>/<child-slug>.md`, and a small focused PR. It inherits context from the parent — do not repeat the architecture or rationale. Its frontmatter carries `status`, `parent`, `blocked-by`, and `estimate`.

```markdown
---
title: <short specific title>
status: todo
parent: <parent-slug>
blocked-by: []
estimate: 2h
---

**What**

[1–2 sentences describing the specific change.]

**Files / scope**

[Files or modules touched. Be specific.]

**Acceptance criteria**

* [Concrete outcome]
* [Tests pass]
* [No regression on dependent code]
```

### Sub-task titles and slugs

The parent gives the context, so the sub-task title can be short:

- `Reading-stats aggregation in readingStats query-hook` → slug `reading-stats-aggregation`
- `Compute total listening time in listen query-hook` → slug `total-listening-time`
- `Types + helper for monthly finance comparison` → slug `monthly-comparison-types`
- `Hook wiring (useCurrentReading)` → slug `current-reading-wiring`

Do not prefix with `[domain]` or other tags — the folder already scopes the work.

### Wave and dependency example

A worked dependency graph for the `import-notes` parent:

```
Wave 0 (parallel, no blockers):
  parser-helper          — pure text→notes parser in packages/core
  import-dialog-shell     — empty dialog + button in apps/til

Wave 1 (depends on Wave 0):
  preview-table           — blocked-by: [parser-helper, import-dialog-shell]

Wave 2 (depends on Wave 1):
  save-wiring             — blocked-by: [preview-table]
```

Each child file's `blocked-by:` lists the sibling slugs above it. A sub-task can be *developed* in parallel even when blocked — it just can't merge until its blockers land.

## Process

When Claude has been working with the developer and a spec is needed:

1. **Identify the shape** — bug, small feature, user story, or large feature. Ask if unsure.
2. **For user stories** — focus on capturing the user's problem and ideas in plain language. Do not jump to technical scoping.
3. **For large features** — run the scoping conversation before creating files. Confirm the breakdown with the user. If there's an existing user story, start from it.
4. **Draft the spec** matching the shape's structure. Use the developer's existing context, do not re-investigate things already discussed.
5. **Create the file(s) under `docs/tasks/`** — standalone task = one file; large feature = folder + `README.md` + one file per sub-task, each with `parent`, `blocked-by`, and `estimate` in frontmatter.
6. **Confirm to the user** what was created, with the file paths.

## Validation checklist

Before creating a spec:

- Title is specific; slug is lowercase kebab-case; no square-bracket prefixes
- Shape matches the work (bug / small feature / user story / large feature)
- Detail level matches the shape — not over-documented, not under-documented
- Frontmatter present and valid (`status`, plus `parent`/`blocked-by`/`estimate` where relevant)
- For bugs: problem, root cause (or note that it's unknown), solution (if known), acceptance criteria
- For small features: problem, proposed solution, acceptance criteria
- For user stories: user problem is front and centre, ideas explored but no technical spec, open questions listed honestly
- For large features: scoping conversation done, parent README has architecture + wave breakdown, sub-tasks are small and revertible, `blocked-by` wiring matches the dependency graph, links back to user story if one exists
- UK English throughout
- No AI attribution

Internal-only refactors (type fixes, performance, cleanup users won't feel) don't need a spec note about visibility; user-facing changes should say so in the spec.
