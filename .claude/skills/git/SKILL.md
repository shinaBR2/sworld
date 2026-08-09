---
name: git
description: Use whenever you touch git beyond an everyday commit — merging, syncing, resolving a conflict, force-pushing, a checkout, or branching off `main`.
user-invocable: false
---

# Git

A few rules that always hold here; the rest of git you already know.

- **"main" means `origin/main`.** Local `main` goes stale fast — work is always
  landing — so `git pull` it before you read it or branch off it. Reasoning off a
  stale checkout produces wrong conclusions, not just stale code.
- **The main worktree stays on `main`** — never `git checkout` a feature branch
  there. Every change gets its own worktree (`EnterWorktree`), so `main` is always
  clean to branch from.
- **Always merge, never rebase** — syncing, integrating, resolving conflicts, all
  of it.
- **Never force-push.**
