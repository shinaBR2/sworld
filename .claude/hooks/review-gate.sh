#!/usr/bin/env bash
# Review-loop gate for the parallel-workflow self-review gate (step 11).
#
# Enforces that `gh pr create` cannot run until the `self-review` skill has
# completed AFTER the last file edit in this session — i.e. the loop actually
# converged (no edits left unreviewed), not just "a review ran once".
#
# Wired as three hooks (see .claude/settings.local.json), all keyed by
# session_id so parallel worktree agents never clobber each other:
#   edit  -> PostToolUse(Write|Edit): stamp last_edit
#   skill -> PostToolUse(Skill):      stamp self_review on completion
#   guard -> PreToolUse(Bash):        deny gh pr create if the stamp is missing/stale
set -u

mode="${1:-}"
input="$(cat)"
sid="$(printf '%s' "$input" | jq -r '.session_id // "nosession"' 2>/dev/null)"
dir="${TMPDIR:-/tmp}/claude-review-gate/${sid}"
mkdir -p "$dir" 2>/dev/null || true

case "$mode" in
  edit)
    touch "$dir/last_edit"
    ;;

  skill)
    sk="$(printf '%s' "$input" | jq -r '.tool_input.skill // ""' 2>/dev/null)"
    case "$sk" in
      *self-review) touch "$dir/self_review" ;;
    esac
    ;;

  nomonitor)
    # Deny the Monitor tool: subagents must not self-watch CI. Idle monitors
    # leave background agents polling PRs (some already merged) — wasted
    # resources. CI-settling + merge is the orchestrator's job.
    jq -cn '{hookSpecificOutput:{hookEventName:"PreToolUse",permissionDecision:"deny",permissionDecisionReason:"CI self-monitoring is disabled in this workflow to avoid idle background agents polling PRs (some already merged). Do NOT arm a monitor, sleep, or idle-poll. Finish your task — complete the review loop, create the PR, and report its number + state — then STOP. The orchestrator owns CI-settling and merging."}}'
    ;;

  guard)
    cmd="$(printf '%s' "$input" | jq -r '.tool_input.command // ""' 2>/dev/null)"
    # Match only in COMMAND position — start of string, or after a shell
    # operator/separator. Grepping the raw string matched any command that
    # merely mentions the phrase in prose (writing docs or a ticket about this
    # gate), which blocked unrelated work.
    printf '%s' "$cmd" | grep -Eq '(^|[;&|(]|&&|\|\||[[:space:]]-c)[^[:alnum:]_-]*gh[[:space:]]+pr[[:space:]]+create' || exit 0

    le="$dir/last_edit"; sr="$dir/self_review"
    problem=""

    if [ ! -f "$sr" ]; then
      problem="the self-review skill has not run in this session"
    elif [ -f "$le" ] && [ "$le" -nt "$sr" ]; then
      problem="self-review is stale — files were edited after it last ran"
    fi

    if [ -n "$problem" ]; then
      reason="Review-loop gate (parallel-workflow step 11) blocked PR creation: ${problem}. Invoke the self-review skill (via the Skill tool) on the worktree diff, fix all findings, and re-run until clean with NO edits afterward — then retry."
      jq -cn --arg r "$reason" \
        '{hookSpecificOutput:{hookEventName:"PreToolUse",permissionDecision:"deny",permissionDecisionReason:$r}}'
    fi
    ;;
esac
exit 0
