#!/usr/bin/env bash
# Deny the Monitor tool session-wide (main agent and subagents alike): nobody
# self-watches CI here.
#
# Idle monitors leave background agents polling PRs (some already merged),
# burning resources for nothing. CI-settling and merging are the orchestrator's
# job — see the `ci-loop` skill.
#
# Wired as PreToolUse(Monitor) in .claude/settings.json. This is a separate
# concern from the review gate and deliberately lives in its own file.
set -u

cat <<'JSON'
{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"deny","permissionDecisionReason":"CI self-monitoring is disabled in this workflow to avoid idle background agents polling PRs (some already merged). Do NOT arm a monitor, sleep, or idle-poll. Finish your task — complete the review loop, create the PR, and report its number + state — then STOP. The orchestrator owns CI-settling and merging."}}
JSON
