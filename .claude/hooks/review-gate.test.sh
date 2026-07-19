#!/usr/bin/env bash
# Tests for review-gate.sh. Run: bash .claude/hooks/review-gate.test.sh
#
# The guard's command matching is subtle: it must block real PR-creation
# commands while ignoring commands that merely mention the phrase in prose
# (writing docs or a ticket about this gate). Both directions are tested.
set -u

H="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/review-gate.sh"
bash -n "$H" || { echo "FATAL: syntax error in review-gate.sh"; exit 1; }

SID="review-gate-test-$$"
D="${TMPDIR:-/tmp}/claude-review-gate/$SID"
rm -rf "$D"
trap 'rm -rf "$D"' EXIT

# Assembled at runtime so this file can be grepped/edited without tripping the
# very guard it tests.
P="gh pr create"

fails=0

run() {
  printf '%s' "$1" | python3 -c '
import json,sys
print(json.dumps({"session_id":sys.argv[1],"tool_input":{"command":sys.stdin.read()}}))
' "$SID" | bash "$H" guard
}

check() { # name, command, expect(deny|allow)
  local out got
  out="$(run "$2")"
  if [ -n "$out" ]; then got=deny; else got=allow; fi
  if [ "$got" = "$3" ]; then
    echo "  PASS  $1"
  else
    echo "  FAIL  $1 — expected $3, got $got"
    fails=$((fails + 1))
  fi
}

echo "no stamps present:"
check "bare command"                  "$P --title x"                                              deny
check "after &&"                      "git push && $P"                                            deny
check "after ;"                       "git push; $P"                                              deny
check "inside bash -c"                "bash -c '$P'"                                              deny
check "prose mention is not a command" "linear issue create -d 'hook denies $P until reviews run'" allow
check "prose inside echo"             "echo 'see docs about $P here'"                             allow
check "unrelated command"             "echo hello"                                                allow

echo "stamp present:"
mkdir -p "$D"; touch "$D/self_review"
check "allowed once reviewed"         "$P --title x"                                              allow

echo "stamp staleness:"
sleep 1; touch "$D/last_edit"
check "blocked when edited after review" "$P --title x"                                           deny

# The skill name the guard waits on and the name the stamper writes must stay in
# sync — a rename on one side alone would deadlock the gate with no error.
echo "skill stamping:"
stamp() {
  printf '' | python3 -c '
import json,sys
print(json.dumps({"session_id":sys.argv[1],"tool_input":{"skill":sys.argv[2]}}))
' "$SID" "$1" | bash "$H" skill
}

check_stamp() { # name, skill, expect(yes|no)
  rm -f "$D/self_review"
  stamp "$2"
  local got=no; [ -f "$D/self_review" ] && got=yes
  if [ "$got" = "$3" ]; then
    echo "  PASS  $1"
  else
    echo "  FAIL  $1 — expected $3, got $got"
    fails=$((fails + 1))
  fi
}

check_stamp "self-review stamps the gate"     "self-review"          yes
check_stamp "unrelated skill does not stamp"  "ci-loop"              no

echo
if [ "$fails" -eq 0 ]; then
  echo "All tests passed."
else
  echo "$fails test(s) failed."
  exit 1
fi
