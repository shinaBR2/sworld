#!/usr/bin/env bash
# Back up every machine-only secret listed in secrets.manifest into Bitwarden.
# Each file is stored as one base64-encoded secure note in the 'sworld-secrets'
# folder, so restore reproduces the exact bytes. Re-runnable: updates in place.
#
# Usage:
#   bw login                 # once, interactive (master password + MFA)
#   ./backup-secrets.sh      # unlocks, then backs up
#   ./backup-secrets.sh --dry-run   # show what would be backed up, touch nothing
set -euo pipefail
cd "$(dirname "$0")"
# shellcheck source=secrets-common.sh
source ./secrets-common.sh

if [ "${1:-}" = "--dry-run" ]; then
  echo "DRY RUN — would back up to Bitwarden folder '$SECRETS_FOLDER' (workspace: $SWORLD_WORKSPACE):"
  n=0
  while IFS= read -r line; do
    p="$(resolve_path "$line")"
    if [ -e "$p" ] || [ -L "$p" ]; then
      printf '  [ok]   %s\n           -> %s\n' "$p" "$(slug_for "$line")"; n=$((n+1))
    else
      printf '  [MISS] %s (would be skipped)\n' "$p"
    fi
  done < <(manifest_lines)
  echo "$n file(s) would be backed up."
  exit 0
fi

require openssl "Preinstalled on macOS"
BW_SESSION="$(bw_session)"; export BW_SESSION
bw sync >/dev/null 2>&1 || true

FID="$(bw_folder_id)"
existing_items="$(bw list items --folderid "$FID")"
template="$(bw get template item)"

count=0
while IFS= read -r line; do
  p="$(resolve_path "$line")"
  name="$(slug_for "$line")"
  if [ ! -e "$p" ] && [ ! -L "$p" ]; then echo "  skip (missing): $p"; continue; fi

  content_b64="$(openssl base64 -A -in "$p")"
  item_json="$(printf '%s' "$template" | jq -c \
    --arg n "$name" --arg notes "$content_b64" --arg fid "$FID" \
    '.type=2 | .name=$n | .notes=$notes | .folderId=$fid
     | .secureNote={type:0} | .login=null | .card=null | .identity=null')"

  existing_id="$(printf '%s' "$existing_items" | jq -r --arg n "$name" '.[] | select(.name==$n) | .id' | head -n1)"
  if [ -n "$existing_id" ]; then
    printf '%s' "$item_json" | bw encode | bw edit item "$existing_id" >/dev/null
    echo "  updated: $p"
  else
    printf '%s' "$item_json" | bw encode | bw create item >/dev/null
    echo "  created: $p"
  fi
  count=$((count+1))
done < <(manifest_lines)

bw sync >/dev/null 2>&1 || true
echo "Backed up $count secret(s) to Bitwarden folder '$SECRETS_FOLDER'."
echo "Verify with: ./restore-secrets.sh --dry-run"
