#!/usr/bin/env bash
# Review-loop gate for the parallel-workflow self-review gate (step 11).
#
# Enforces that `gh pr create` cannot run until BOTH review skills have
# completed AFTER the last file edit in this session — i.e. the loop actually
# converged (no edits left unreviewed), not just "a review ran once".
#
# Wired as three hooks (see .claude/settings.local.json), all keyed by
# session_id so parallel worktree agents never clobber each other:
#   edit  -> PostToolUse(Write|Edit): stamp last_edit
#   skill -> PostToolUse(Skill):      stamp code_review / rpr on completion
#   guard -> PreToolUse(Bash):        deny gh pr create if a stamp is missing/stale
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
      # Claude Code 2.1.215 (2026-07-19) removed the model's ability to
      # self-invoke /code-review ("Claude no longer runs the /verify and
      # /code-review skills on its own"), making this stamp unobtainable
      # without manual user input on every PR. `bug-hunt` is the model-invocable
      # replacement finder; a user-typed /code-review still counts.
      bug-hunt|*code-review)    touch "$dir/code_review" ;;
      *reviewing-pull-requests) touch "$dir/rpr" ;;
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

    le="$dir/last_edit"; cr="$dir/code_review"; rp="$dir/rpr"
    problems=""
    add() { problems="${problems:+$problems; }$1"; }

    [ -f "$cr" ] || add "the bug-hunt skill has not run in this session"
    [ -f "$rp" ] || add "the reviewing-pull-requests skill has not run in this session"
    if [ -f "$le" ]; then
      [ -f "$cr" ] && [ "$le" -nt "$cr" ] && add "bug-hunt is stale — files were edited after it last ran"
      [ -f "$rp" ] && [ "$le" -nt "$rp" ] && add "reviewing-pull-requests is stale — files were edited after it last ran"
    fi

    if [ -n "$problems" ]; then
      reason="Review-loop gate (parallel-workflow step 11) blocked PR creation: ${problems}. Invoke the bug-hunt AND reviewing-pull-requests skills (via the Skill tool) on the worktree diff, fix all findings, and re-run BOTH until clean with NO edits afterward — then retry. Note: /code-review cannot be self-invoked since Claude Code 2.1.215; use bug-hunt. A user-typed /code-review also satisfies this stamp."
      jq -cn --arg r "$reason" \
        '{hookSpecificOutput:{hookEventName:"PreToolUse",permissionDecision:"deny",permissionDecisionReason:$r}}'
    fi
    ;;
esac
exit 0
