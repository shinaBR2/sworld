#!/usr/bin/env bash
# Blocks file writes to a repo's main worktree, unconditionally — the main
# worktree of every repo in this workspace must only ever hold `main`, never
# feature work (see .claude/skills/parallel-workflow: "NEVER create branches or
# make changes in the main worktree"). Unlike the branch-aware variants elsewhere,
# there is no "a branch is deliberately checked out here" exception: any write to
# a main worktree is the accident this guards against.
#
# A linked worktree's git dir (.git/worktrees/<name>) differs from its common dir
# (.git); in the main worktree the two are identical. That is the whole worktree
# test, so no machine-specific paths are needed. Paths outside any repo are left
# alone — this is portable across all three repos and any clone.

set -uo pipefail

input=$(cat)
# Edit/Write use file_path; NotebookEdit uses notebook_path.
file_path=$(printf '%s' "$input" | jq -r '.tool_input.file_path // .tool_input.notebook_path // empty')

# No path to check (or not a file tool) — nothing to gate.
[ -n "$file_path" ] || exit 0

# Follow symlinks before classifying: a symlink inside a linked worktree can
# point at a file in the main worktree, and the editing tool writes through it.
target=$file_path
hops=0
while [ -L "$target" ] && [ "$hops" -lt 40 ]; do
  link=$(readlink "$target")
  case "$link" in
    /*) target=$link ;;
    *) target=$(dirname "$target")/$link ;;
  esac
  hops=$((hops + 1))
done

# The file may not exist yet, so resolve from its nearest existing ancestor,
# and resolve that physically so a symlinked directory can't disguise it either.
dir=$(dirname "$target")
while [ ! -d "$dir" ] && [ "$dir" != "/" ] && [ "$dir" != "." ]; do
  dir=$(dirname "$dir")
done
dir=$(cd "$dir" 2>/dev/null && pwd -P) || exit 0

# Outside a git repo (scratchpad, ~/.claude, /tmp) — allow.
git_dir=$(git -C "$dir" rev-parse --absolute-git-dir 2>/dev/null) || exit 0
common_dir=$(git -C "$dir" rev-parse --path-format=absolute --git-common-dir 2>/dev/null) || exit 0

# Linked worktree (git dir differs from common dir) — this is where work belongs,
# so allow. Anything else is a main worktree and is blocked below.
[ "$git_dir" = "$common_dir" ] || exit 0

toplevel=$(git -C "$dir" rev-parse --show-toplevel 2>/dev/null)

resolved_note=""
[ "$target" = "$file_path" ] || resolved_note="
  (via symlink, resolves to $target)"

cat >&2 <<EOF
Blocked: this writes to the main worktree ($toplevel), which must only ever hold main.

  $file_path$resolved_note

All work happens in a linked worktree — the main worktree is never edited, whatever
branch it currently sits on. To do this work, use a worktree (see the
parallel-workflow skill):
  1. Make sure a Linear issue exists for this work.
  2. git -C $toplevel fetch origin main
  3. git -C $toplevel worktree add -b swo-NNN-<slug> .claude/worktrees/swo-NNN-<slug> origin/main
  4. Re-run this edit against the path inside that worktree.

This hook gates the Edit, Write and NotebookEdit tools. Reading the main worktree
is fine, as is advancing it with: git -C $toplevel pull --ff-only origin main
EOF
exit 2
