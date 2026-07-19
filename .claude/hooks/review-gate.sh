#!/usr/bin/env bash
# Review-loop gate for the parallel-workflow self-review gate (step 11).
#
# Blocks PR creation until the `self-review` skill has run AFTER the last file
# edit in this session — i.e. the loop actually converged, not just "a review
# ran once".
#
# Wired as three hooks in .claude/settings.json, all keyed by session_id so
# parallel worktree agents never clobber each other:
#   edit  -> PostToolUse(Write|Edit): stamp last_edit
#   skill -> PostToolUse(Skill):      stamp self_review on completion
#   guard -> PreToolUse(Bash):        deny PR creation if the stamp is missing/stale
#
# The guard matches the phrase ANYWHERE in the command, deliberately. Trying to
# match only in command position needs quote-aware parsing; a regex that fakes
# it lets real invocations through (a leading VAR=value, an absolute path, a
# wrapper, a nested shell). The cost of matching everywhere is that a command
# merely mentioning the phrase in quotes is also blocked — rare, and obvious
# when it happens. Assemble the string in pieces to work around it, as
# review-gate.test.sh does. A noisy block beats a silent hole.
set -u

mode="${1:-}"
input="$(cat)"
sid="$(printf '%s' "$input" | jq -r '.session_id // ""' 2>/dev/null)"
[ -n "$sid" ] || sid="nosession"
dir="${TMPDIR:-/tmp}/claude-review-gate/${sid}"
mkdir -p "$dir" 2>/dev/null || true

case "$mode" in
  edit)
    touch "$dir/last_edit"
    ;;

  skill)
    sk="$(printf '%s' "$input" | jq -r '.tool_input.skill // ""' 2>/dev/null)"
    # Exact name, optionally plugin-qualified. A substring match would let a
    # skill called `not-really-self-review` stamp the gate.
    case "${sk##*:}" in
      self-review) touch "$dir/self_review" ;;
    esac
    ;;

  guard)
    cmd="$(printf '%s' "$input" | jq -r '.tool_input.command // ""' 2>/dev/null)"
    printf '%s' "$cmd" | grep -Eq 'gh[[:space:]]+pr[[:space:]]+create' || exit 0

    le="$dir/last_edit"; sr="$dir/self_review"
    if [ ! -f "$sr" ]; then
      problem="the self-review skill has not run in this session"
    elif [ -f "$le" ] && [ "$le" -nt "$sr" ]; then
      problem="self-review is stale — files were edited after it last ran"
    else
      exit 0
    fi

    reason="Review-loop gate (parallel-workflow step 11) blocked PR creation: ${problem}. Invoke the self-review skill (via the Skill tool) on the worktree diff, fix all findings, and re-run until clean with NO edits afterward — then retry."
    jq -cn --arg r "$reason" \
      '{hookSpecificOutput:{hookEventName:"PreToolUse",permissionDecision:"deny",permissionDecisionReason:$r}}'
    ;;
esac
exit 0
