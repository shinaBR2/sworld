---
name: pr-descriptions
description: This skill should be used whenever the user asks to "create a PR", "open a pull request", "raise a PR", "push and PR", "write a PR description", or "draft a PR". Also use when updating an existing PR's title or description. Enforces the conventional commit title format and the lean body: a Category + Impact header, then Summary and Test plan.
---

* pr-descriptions: produces a short, scannable PR — a conventional-commit title and a lean body that orients a reviewer in 30 seconds.

* Rules
  * Keep the body under ~100 words and don't pad it by restating the diff.
  * The PR must link to its tracker issue: the `SWO-NNN` reaches the integration through the branch name and/or the body so the issue moves to In Review — where the ID sits is an implementation detail, the link is what matters (`task-tracker`).
  * The title is conventional commits, `type(scope): <short imperative>` (e.g. `fix(listen): playback position persists across reloads`), where the scope is the app or surface actually changing — `library`, `listen`, `watch`, `til`, `game`, `docs`, `extension`, `core`, `ui`, `auth`, `db`, `ci` — with no `[bracket]` prefixes.
  * Category is exactly one of: bug fix; pure blocker (exists only to unblock later work, e.g. a migration that must deploy first); wiring (connecting already-built pieces — how a new feature lands); refactor (no behaviour change — also covers docs, chore, CI, and config).
  * Impact is user-facing or not, where a flag-gated change is still user-facing if an end user sees something different with the flag on, and when in doubt treat it as user-facing.
  * The Summary and any user-facing test step are read by a non-technical end user, so write them to the `plain-english` law — no function names, file paths, or insider shorthand — while a no-user-facing-change PR may then explain the developer's view, still plainly.
  * A user-facing test plan is manual steps a non-technical person can follow — the exact page click by click, the exact thing to look at, plain pass/fail — with the change confirmed genuinely visible and actually changing.
  * A not-user-facing PR has no checkbox list and does not re-list the automated checks CI already runs (type-checks, unit tests, "CI green" are all redundant); list only a check CI can't run (e.g. a deploy-order check for a blocker), or one line saying CI covers it.
  * No changelog section — versioning is driven by changesets (`pnpm changeset` when the change should appear in a package's changelog).
  * Open the PR assigned to the user (`--assignee "@me"`) and never as a draft, because the only reviewers are the code-review bots and a draft can stop them running.
  * When updating an existing PR, rewrite the title and Summary to describe the branch's whole current state, not a changelog of recent changes (no "also adds" / "now includes").

* Steps
  1. Review the actual diff against `origin/main`, fetched fresh because the local copy goes stale as other work lands, and state what you actually reviewed rather than asserting it.
  2. Write the conventional-commit title.
  3. Write the body — the two-line Category/Impact header, then Summary and Test plan, nothing else.
     * template to produce: [`references/body-template.md`](references/body-template.md)
     * worked examples (a refactor, a bug fix, a flag-gated feature): [`references/examples.md`](references/examples.md)
  4. Open the PR, or edit an existing one, passing the multi-line body through the heredoc idiom so the markdown survives and re-confirming the change landed — the edit command has a silent-failure trap.
     * heredoc idiom and the reliable edit path: `.claude/references/github-cli.md`
