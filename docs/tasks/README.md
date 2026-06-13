# Tasks

This is where work is captured and tracked. Tasks live as markdown files here — there is no external tracker. The canonical guide for *how to write* a good spec is the [`writing-task-specs` skill](../../.claude/skills/writing-task-specs/SKILL.md); this README is the *file convention* that skill points to.

## Layout

```text
docs/tasks/
├── README.md                       # this file
├── <slug>.md                       # a standalone task or bug (no breakdown needed)
└── <parent-slug>/                  # a parent task / feature
    ├── README.md                   # the parent spec (context, approach, waves, deps)
    ├── <child-slug>.md             # one sub-task
    └── <child-slug>.md             # another sub-task
```

- **Standalone task / bug** — a single file `docs/tasks/<slug>.md`. Use this when the work maps to one PR and needs no breakdown.
- **Parent task / feature** — a folder `docs/tasks/<parent-slug>/`. Its `README.md` *is* the parent spec. Each sub-task is one `.md` file in the folder.

Slugs are lowercase kebab-case, derived from the title (`sticky-progress-bar`, `import-notes`).

## Frontmatter

Every task file starts with YAML frontmatter. This replaces the states an external tracker would hold.

```yaml
---
title: <short specific title>
status: todo            # todo | in-progress | in-review | done
parent: <parent-slug>   # omit for standalone tasks and parent READMEs
blocked-by: []          # list of sibling child-slugs this depends on
estimate: 2h
---
```

### Status lifecycle

| status        | meaning |
|---------------|---------|
| `todo`        | written, not started |
| `in-progress` | actively being worked |
| `in-review`   | PR open, awaiting review/merge |
| `done`        | merged |

**Set `status: in-progress` and commit that change before you start work** on a task — that commit is how the rest of the team (and any agent) sees the task is taken. Move to `in-review` when the PR is open, `done` once merged.

### blocked-by sequencing

`blocked-by` lists the **sibling slugs** a sub-task depends on (file name without `.md`). It encodes the dependency graph that the parent README's waves describe:

- A sub-task with `blocked-by: []` is in Wave 0 — start it immediately.
- A sub-task with `blocked-by: [parser-helper]` can be *developed* in parallel but cannot **merge** until `parser-helper` is `done`.
- The parent README's dependency graph is the human-readable view; each child's `blocked-by` is the machine-checkable source of truth. Keep them in sync.

## Templates

### Standalone task / bug

```markdown
---
title: <short specific title>
status: todo
estimate: 1h
---

**Problem**

[What is broken or needed, and where. Specific enough to picture without seeing it.]

**Solution**

[Proposed fix or change. Key files if obvious.]

**Acceptance criteria**

* [Concrete, verifiable outcome]
* [No regression on X]
```

### Parent README (`<parent-slug>/README.md`)

```markdown
---
title: <feature title>
status: todo
estimate: 18h
---

**Context**

[Link to the user story file if one exists. 1–2 sentences on the user need this delivers.]

**Technical approach**

[The architectural decision and why. Link to relevant docs/patterns.]

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

| Sub-task | Work | Est | Blocked by |
|----------|------|-----|------------|
| `<child-slug>` | <description> | Xh | `<earlier-slug>` |

**Dependency graph**

[Text diagram of what blocks what, by slug.]

**Verification**

* [Type-check, tests, build]
* [Manual / E2E checks]

**Related**

* docs/tasks/<user-story-slug>.md — user story
```

### Sub-task (`<parent-slug>/<child-slug>.md`)

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

## See also

- [`writing-task-specs` skill](../../.claude/skills/writing-task-specs/SKILL.md) — the four spec shapes (bug, small feature, user story, large feature), the user-story → large-feature progression, scoping conversation, and the validation checklist.
