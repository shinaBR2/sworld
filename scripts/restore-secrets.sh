#!/usr/bin/env bash
# Restore every secret in secrets.manifest from Bitwarden back to its path.
# Called by bootstrap.sh (SWO-509) on a fresh machine, or run standalone.
#
# Usage:
#   bw login                  # once, interactive (master password + MFA)
#   ./restore-secrets.sh      # unlocks, then restores
#   ./restore-secrets.sh --dry-run   # show what would be restored, touch nothing
#   ./restore-secrets.sh --verify    # prove vault copies are byte-exact vs local
#                                     #   files, WITHOUT overwriting anything
set -euo pipefail
cd "$(dirname "$0")"
# shellcheck source=secrets-common.sh
source ./secrets-common.sh

MODE="restore"
case "${1:-}" in
  --dry-run)
    echo "DRY RUN — would restore from Bitwarden folder '$SECRETS_FOLDER' (workspace: $SWORLD_WORKSPACE):"
    while IFS= read -r line; do
      printf '  %s\n    <- %s\n' "$(resolve_path "$line")" "$(slug_for "$line")"
    done < <(manifest_lines)
    exit 0 ;;
  --verify) MODE="verify" ;;
  "") ;;
  *) echo "Unknown option: $1" >&2; exit 2 ;;
esac

require openssl "Preinstalled on macOS"
BW_SESSION="$(bw_session)"; export BW_SESSION
bw sync >/dev/null 2>&1 || true

FID="$(bw list folders | jq -r --arg n "$SECRETS_FOLDER" '.[] | select(.name==$n) | .id' | head -n1)"
[ -z "$FID" ] && { echo "ERROR: Bitwarden folder '$SECRETS_FOLDER' not found — run backup-secrets.sh first." >&2; exit 1; }
items="$(bw list items --folderid "$FID")"

count=0; missing=0; differs=0
while IFS= read -r line; do
  p="$(resolve_path "$line")"
  name="$(slug_for "$line")"
  notes="$(printf '%s' "$items" | jq -r --arg n "$name" '.[] | select(.name==$n) | .notes' | head -n1)"
  if [ -z "$notes" ] || [ "$notes" = "null" ]; then
    echo "  MISSING in vault: $name  ($p)"; missing=$((missing+1)); continue
  fi

  if [ "$MODE" = "verify" ]; then
    tmp="$(mktemp)"
    printf '%s' "$notes" | openssl base64 -d -A > "$tmp"
    if [ ! -e "$p" ]; then echo "  vault-only (no local file): $p"
    elif cmp -s "$p" "$tmp"; then echo "  EXACT:   $p"
    else echo "  DIFFERS: $p"; differs=$((differs+1)); fi
    rm -f "$tmp"
  else
    mkdir -p "$(dirname "$p")"
    printf '%s' "$notes" | openssl base64 -d -A > "$p"
    chmod 600 "$p"
    echo "  restored: $p"
  fi
  count=$((count+1))
done < <(manifest_lines)

if [ "$MODE" = "verify" ]; then
  echo "Checked $count item(s): $differs differing, $missing missing from vault."
  { [ "$differs" -eq 0 ] && [ "$missing" -eq 0 ]; } || exit 1
  echo "All vault copies are byte-exact. ✅"
  exit 0
fi

# Recreate the workspace-root settings.local.json symlink (points into sworld/).
real="$SWORLD_WORKSPACE/sworld/.claude/settings.local.json"
link="$SWORLD_WORKSPACE/.claude/settings.local.json"
if [ -f "$real" ] && [ ! -e "$link" ]; then
  mkdir -p "$SWORLD_WORKSPACE/.claude"
  ln -s "../sworld/.claude/settings.local.json" "$link"
  echo "  linked: $link -> ../sworld/.claude/settings.local.json"
fi

echo "Restored $count secret(s)${missing:+, $missing missing}."
[ "$missing" -eq 0 ] || { echo "Some items were missing from the vault — run backup-secrets.sh on the source machine." >&2; exit 1; }
