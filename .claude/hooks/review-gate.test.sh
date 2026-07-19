#!/usr/bin/env bash
# Tests for review-gate.sh. Run: bash .claude/hooks/review-gate.test.sh
set -u

H="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/review-gate.sh"
bash -n "$H" || { echo "FATAL: syntax error in review-gate.sh"; exit 1; }

SID="review-gate-test-$$"
D="${TMPDIR:-/tmp}/claude-review-gate/$SID"
rm -rf "$D"
trap 'rm -rf "$D"' EXIT

# Assembled in pieces so this file can be grepped/edited without tripping the
# very guard it tests.
P="gh"" pr ""create"

fails=0

emit() { # key -> hook payload on stdout, value read from stdin
  python3 -c '
import json,sys
print(json.dumps({"session_id":sys.argv[1],"tool_input":{sys.argv[2]:sys.stdin.read()}}))
' "$SID" "$1"
}

ok() { # name, expect, got
  if [ "$2" = "$3" ]; then echo "  PASS  $1"; else
    echo "  FAIL  $1 — expected $2, got $3"; fails=$((fails + 1)); fi
}

check() { # name, command, expect(deny|allow)
  local out got
  out="$(printf '%s' "$2" | emit command | bash "$H" guard)"
  if [ -n "$out" ]; then got=deny; else got=allow; fi
  ok "$1" "$3" "$got"
}

# Every shape a real invocation takes must be blocked. These are the ones an
# earlier command-position regex let through.
echo "real commands, no stamp — must DENY:"
check "bare"                    "$P --title x"                      deny
check "after &&"                "git push && $P"                    deny
check "env assignment prefix"   "GH_TOKEN=abc $P --fill"            deny
check "absolute path"           "/opt/homebrew/bin/$P"              deny
check "wrapper with a flag"     "nice -n 10 $P"                     deny
check "nested bash -lc"         "bash -lc '$P'"                     deny
check "second line of a script" "$(printf 'cd /repo\n%s --fill' "$P")" deny

echo "unrelated commands — must ALLOW:"
check "no mention"              "echo hello"                        allow
check "sibling subcommand"      "gh pr view 123 --json state"       allow

echo "stamped — must ALLOW:"
mkdir -p "$D"; touch "$D/self_review"
check "allowed once reviewed"   "$P --title x"                      allow

# No sleep anywhere here, deliberately. An earlier version compared mtimes and
# a `sleep 1` in this very test is what hid the bug that /bin/bash 3.2 resolves
# `-nt` to whole seconds — an edit in the same second as the review read as
# fresh. `edit` now deletes the stamp, so a same-second edit must still block.
echo "staleness:"
printf '' | emit command | bash "$H" edit
check "blocked when edited after review" "$P --title x"             deny
ok "edit invalidates the review stamp" no "$([ -f "$D/self_review" ] && echo yes || echo no)"

# The name the guard waits on and the name the stamper writes must stay in
# sync — a rename on one side alone would deadlock the gate with no error.
echo "skill stamping:"
check_stamp() { # name, skill, expect(yes|no)
  rm -f "$D/self_review"
  printf '%s' "$2" | emit skill | bash "$H" skill
  local got=no; [ -f "$D/self_review" ] && got=yes
  ok "$1" "$3" "$got"
}
check_stamp "self-review stamps"             "self-review"            yes
check_stamp "plugin-qualified stamps"        "someplugin:self-review" yes
check_stamp "substring name does NOT stamp"  "not-really-self-review" no

# Every way the gate can degrade must still block PR creation — and must NOT
# block anything else. A silently-absent gate is the failure this guards.
echo "degraded paths — fail closed on PR creation only:"

degraded() { # name, payload-producer, command, expect(deny|allow), [env prefix]
  local out got
  out="$($2 "$3" | eval "${5:-} bash \"\$H\" guard")"
  if [ -n "$out" ]; then got=deny; else got=allow; fi
  ok "$1" "$4" "$got"
}

no_sid() { printf '{"tool_input":{"command":"%s"}}' "$1"; }
degraded "no session_id blocks PR creation" no_sid "$P" deny
degraded "no session_id allows other commands" no_sid "echo hi" allow

# jq absent: PATH is stripped to the system dirs, where jq does not live.
NOJQ='PATH=/usr/bin:/bin'
with_sid() { printf '{"session_id":"%s","tool_input":{"command":"%s"}}' "$SID" "$1"; }
degraded "no jq blocks PR creation"     with_sid "$P"      deny "$NOJQ"
degraded "no jq allows other commands"  with_sid "echo hi" allow "$NOJQ"

# The two above would pass even with the sed fallback deleted (no session_id
# also denies). This one would not: it needs session_id AND the skill name
# extracted without jq, so it pins field()'s fallback branch.
rm -f "$D/self_review" "$D/last_edit"
printf '%s' "self-review" | emit skill | eval "$NOJQ bash \"\$H\" skill"
ok "no jq still stamps from the skill name" yes "$([ -f "$D/self_review" ] && echo yes || echo no)"
degraded "no jq honours the stamp" with_sid "$P" allow "$NOJQ"

# An unwritable stamp dir must not brick the session: it blocks PR creation
# only. An earlier version denied EVERY Bash command here, including the ones
# you would use to recover.
echo "unwritable stamp dir:"
RO="${TMPDIR:-/tmp}/claude-review-gate-ro-$$"
rm -rf "$RO"; mkdir -p "$RO"; chmod 500 "$RO"
trap 'chmod 700 "$RO" 2>/dev/null; rm -rf "$D" "$RO"' EXIT
degraded "blocks PR creation"    with_sid "$P"      deny  "TMPDIR=$RO"
degraded "allows other commands" with_sid "echo hi" allow "TMPDIR=$RO"
# A degraded non-guard mode must stay silent — deny JSON from PostToolUse would
# be meaningless noise at best.
out="$(with_sid x | eval "TMPDIR=$RO bash \"\$H\" edit")"
ok "edit mode stays silent when degraded" "" "$out"

echo "edit stamping:"
rm -f "$D/last_edit"
printf '' | emit command | bash "$H" edit
got=no; [ -f "$D/last_edit" ] && got=yes
ok "edit mode stamps last_edit" yes "$got"

echo
if [ "$fails" -eq 0 ]; then
  echo "All tests passed."
else
  echo "$fails test(s) failed."
  exit 1
fi
