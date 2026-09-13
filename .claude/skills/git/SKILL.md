---
name: git
description: Use whenever you touch git beyond an everyday commit — merging, syncing, resolving a conflict, force-pushing, a checkout, or branching off `main`.
user-invocable: false
---

* git: keeps you correct on the git operations beyond an everyday commit — merging, syncing, resolving conflicts, force-pushing, checkouts, and branching off `main`.

* Rules
  * "main" means `origin/main`, and local `main` goes stale fast because work is always landing, so `git pull` it before you read it or branch off it — reasoning off a stale checkout produces wrong conclusions, not just stale code.
  * The main worktree stays on `main` and never gets a feature branch checked out into it, so `main` is always clean to branch from — every change gets its own worktree via `EnterWorktree`.
  * Always merge, never rebase — whether syncing, integrating, or resolving conflicts.
  * Never force-push.
