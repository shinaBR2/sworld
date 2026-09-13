# Authoring notes

Illustrations for the `skill-authoring` rules — kept out of the SKILL.md body so they don't bloat it.

## How skills load — directory layout

```
skill-name/
├── SKILL.md (required — frontmatter with name + description, then instructions)
└── Bundled resources (optional)
    ├── scripts/    - executable code for deterministic/repetitive tasks
    ├── references/ - docs loaded into context as needed
    └── assets/     - files used in output (templates, icons, fonts)
```

The three load levels:

1. **Metadata** (name + description) — always in context.
2. **SKILL.md body** — loaded whenever the skill triggers.
3. **Bundled resources** — pulled in only as needed (scripts can execute *without* being loaded into context).

## A pushy description — worked example

Claude tends to *undertrigger*, so a description should lean towards catching a case rather than missing it. Not:

> How to build a fast dashboard.

but:

> How to build a fast dashboard. Use this whenever the user mentions dashboards, metrics, or wants to display any kind of data, even if they don't say 'dashboard.'
