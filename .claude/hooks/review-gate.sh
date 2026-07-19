#!/usr/bin/env bash
# Review-loop gate for the parallel-workflow self-review gate (step 11).
#
# Blocks PR creation unless the `self-review` skill was invoked AFTER the last
# file edit in this session. That is weaker than "the loop converged" and the
# difference matters: PostToolUse(Skill) fires when the Skill tool RETURNS the
# instructions, not when the review finishes. What the gate actually enforces is
# "the skill was loaded, and nothing has been edited since" — which approximates
# convergence, because every fix stamps last_edit and forces a fresh invocation.
#
# Wired as three hooks in .claude/settings.json, all keyed by session_id so
# parallel worktree agents never clobber each other:
#   edit  -> PostToolUse(Write|Edit): INVALIDATE self_review, stamp last_edit
#   skill -> PostToolUse(Skill):      stamp self_review on invocation
#   guard -> PreToolUse(Bash):        deny PR creation if self_review is absent
#
# An edit deletes the stamp rather than the guard comparing mtimes. Comparing
# was the obvious design and it was wrong: `[ a -nt b ]` under /bin/bash 3.2
# (the only bash on macOS, and what settings.json invokes) resolves to whole
# SECONDS, so an edit landing in the same second as the review looked fresh and
# the gate opened. Deleting takes the clock out of the decision entirely.
# last_edit survives only to tell "never reviewed" apart from "invalidated".
#
# Known holes — the gate is a backstop, not a proof:
#   - Bash writes don't stamp. A build, a formatter or a stray `sed` after the
#     final pass leaves the review looking fresh.
#   - Subagents get their OWN session_id, so their stamps land in a different
#     bucket. Edits delegated to a subagent never mark the parent stale; a
#     review delegated to a subagent never unblocks the parent.
#   - The stamp records that A review ran, not that THIS diff was reviewed.
# The `self-review` skill documents these for the operator; keep both in sync.
#
# The guard matches the phrase ANYWHERE in the command, deliberately. Trying to
# match only in command position needs quote-aware parsing; a regex that fakes
# it lets real invocations through (a leading VAR=value, an absolute path, a
# wrapper, a nested shell). The cost of matching everywhere is that a command
# merely mentioning the phrase in quotes is also blocked — rare, and obvious
# when it happens. Assemble the string in pieces to work around it, as
# review-gate.test.sh does. A noisy block beats a silent hole.
#
# Every degraded path fails CLOSED for the same reason: a gate that silently
# vanishes (missing jq, unparseable payload, no session_id, unwritable stamp
# dir) is worse than one that blocks loudly. Degrading never denies unrelated
# Bash commands though — only ones that look like PR creation.
set -u

# Emits the PreToolUse deny JSON. Hand-rolled rather than via jq so the deny
# path survives jq being absent. Every reason string passed here MUST stay free
# of double quotes and backslashes — nothing escapes them.
deny() {
  printf '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"deny","permissionDecisionReason":"%s"}}\n' "$1"
  exit 0
}

mode="${1:-}"
input="$(cat)"

have_jq=1
command -v jq >/dev/null 2>&1 || have_jq=0

field() { # field-name -> value on stdout
  if [ "$have_jq" -eq 1 ]; then
    printf '%s' "$input" | jq -r ".$1 // \"\"" 2>/dev/null
  else
    # Only used for session_id and the skill name without jq — both are simple
    # tokens with nothing to escape. The command is never parsed this way; see
    # guard_cmd, which greps the raw payload instead.
    printf '%s' "$input" | sed -n "s/.*\"${1##*.}\"[[:space:]]*:[[:space:]]*\"\([^\"]*\)\".*/\1/p" | head -1
  fi
}

guard_cmd() { # the Bash command to match against, on stdout
  local c=""
  [ "$have_jq" -eq 1 ] && c="$(printf '%s' "$input" | jq -r '.tool_input.command // ""' 2>/dev/null)"
  # Falling back to the raw payload keeps the match working when jq is absent
  # or the payload is unparseable — the phrase survives JSON escaping intact.
  [ -n "$c" ] || c="$input"
  printf '%s' "$c"
}

sid="$(field 'session_id')"

# No session_id means the stamps cannot be keyed to this session. The previous
# behaviour — a shared `nosession` bucket — was an allow-hole: one session's
# stamp unblocked every other session that landed there.
if [ -z "$sid" ]; then
  [ "$mode" = "guard" ] || exit 0
  guard_cmd | grep -Eq 'gh[[:space:]]+pr[[:space:]]+create' || exit 0
  deny "Review-loop gate could not identify the session (no session_id in the hook payload), so it cannot verify that self-review has run. Blocking PR creation. This is a gate malfunction, not a review failure - report it rather than working around it."
fi

dir="${TMPDIR:-/tmp}/claude-review-gate/${sid}"
if ! mkdir -p "$dir" 2>/dev/null; then
  [ "$mode" = "guard" ] || exit 0
  guard_cmd | grep -Eq 'gh[[:space:]]+pr[[:space:]]+create' || exit 0
  deny "Review-loop gate cannot write its stamp directory, so it cannot verify that self-review has run. Blocking PR creation. Check that TMPDIR is writable. This is a gate malfunction, not a review failure - report it rather than working around it."
fi

case "$mode" in
  edit)
    rm -f "$dir/self_review"
    touch "$dir/last_edit"
    ;;

  skill)
    sk="$(field 'tool_input.skill')"
    # Exact name, optionally plugin-qualified. A substring match would let a
    # skill called `not-really-self-review` stamp the gate.
    case "${sk##*:}" in
      self-review) touch "$dir/self_review" ;;
    esac
    ;;

  guard)
    guard_cmd | grep -Eq 'gh[[:space:]]+pr[[:space:]]+create' || exit 0

    [ -f "$dir/self_review" ] && exit 0
    if [ -f "$dir/last_edit" ]; then
      problem="self-review is stale - files were edited after it last ran"
    else
      problem="the self-review skill has not run in this session"
    fi

    deny "Review-loop gate (parallel-workflow step 11) blocked PR creation: ${problem}. Invoke the self-review skill (via the Skill tool, not the slash command) on the worktree diff, fix all findings, and re-run until clean with NO edits afterward - then retry."
    ;;
esac
exit 0
