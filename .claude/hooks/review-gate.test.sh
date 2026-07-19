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

echo "staleness:"
sleep 1; touch "$D/last_edit"
check "blocked when edited after review" "$P --title x"             deny

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
