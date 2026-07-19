#!/usr/bin/env bash
# Shared helpers for backing up / restoring sworld's machine-only secrets.
# Contains ONLY path logic and Bitwarden plumbing — never any secret value.
# Sourced by backup-secrets.sh and restore-secrets.sh.

# Workspace root = the folder holding the three repos (sworld, sworld-backend,
# sworld-hasura-v2). Override with SWORLD_WORKSPACE when it lives elsewhere.
SWORLD_WORKSPACE="${SWORLD_WORKSPACE:-$HOME/Projects/sworld}"
# Bitwarden folder the secret items live under.
SECRETS_FOLDER="${SWORLD_SECRETS_FOLDER:-sworld-secrets}"
# Manifest sits next to these scripts.
_SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MANIFEST="${SECRETS_MANIFEST:-$_SCRIPT_DIR/secrets.manifest}"

# Resolve a manifest line to an absolute filesystem path.
#   '~/x' → $HOME/x   |   '/x' → /x (absolute)   |   'x' → $SWORLD_WORKSPACE/x
# The leading '~/' is stripped literally (never shell-expanded).
resolve_path() {
  local line="$1"
  if [ "${line#\~/}" != "$line" ]; then
    printf '%s/%s' "$HOME" "${line#\~/}"
  elif [ "${line#/}" != "$line" ]; then
    printf '%s' "$line"
  else
    printf '%s/%s' "$SWORLD_WORKSPACE" "$line"
  fi
}

# Deterministic Bitwarden item name for a manifest line (reversible enough to
# be unique; the manifest — not the name — is the source of truth for paths).
slug_for() {
  local line="$1"
  line="${line/#\~\//HOME/}"   # ~/x -> HOME/x
  printf 'sworld-secret:%s' "${line//\//__}"
}

# Emit non-comment, non-blank manifest lines.
manifest_lines() { grep -vE '^[[:space:]]*(#|$)' "$MANIFEST"; }

require() {
  command -v "$1" >/dev/null 2>&1 || { echo "ERROR: '$1' not found. $2" >&2; exit 1; }
}

# Echo an unlocked Bitwarden session key, or exit with guidance.
# Reuses $BW_SESSION if already exported; otherwise unlocks (prompts for the
# master password on an interactive terminal). Login (with MFA) must be done first.
bw_session() {
  require bw "Install with: brew install bitwarden-cli"
  require jq "Install with: brew install jq"
  local status
  status="$(bw status 2>/dev/null | jq -r '.status' 2>/dev/null || echo unauthenticated)"
  if [ "$status" = "unauthenticated" ]; then
    echo "ERROR: Bitwarden not logged in. Run 'bw login' first (needs your master password + MFA)." >&2
    exit 1
  fi
  if [ -n "${BW_SESSION:-}" ]; then printf '%s' "$BW_SESSION"; return; fi
  bw unlock --raw
}

# Id of the secrets folder, creating it if missing.
bw_folder_id() {
  local id
  id="$(bw list folders | jq -r --arg n "$SECRETS_FOLDER" '.[] | select(.name==$n) | .id' | head -n1)"
  if [ -z "$id" ]; then
    id="$(jq -nc --arg n "$SECRETS_FOLDER" '{name:$n}' | bw encode | bw create folder | jq -r '.id')"
    echo "Created Bitwarden folder '$SECRETS_FOLDER'." >&2
  fi
  printf '%s' "$id"
}
