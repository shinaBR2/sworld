# Secret backup / restore

Backs up every machine-only secret (the gitignored `.env` files, home-dir
credential stores, workspace-root keys) into **Bitwarden**, so a lost laptop is
a ten-minute recovery instead of a day. Part of [SWO-508]; the restore step is
what `bootstrap.sh` (SWO-509) calls on a fresh machine.

## Why Bitwarden (not an encrypted blob in git)

Committing an encrypted blob to git publishes the ciphertext forever and bets
everything on passphrase entropy against unlimited offline brute-force.
Bitwarden keeps the secrets behind an authenticated, MFA-guarded, rate-limited
account — there is no offline-crackable artifact. Harden the account so it's as
strong as the model allows:

- **KDF → Argon2id** (Settings → Security). Biggest single lever.
- **Strong master password** — long diceware, not memorable-clever.
- **Hosted** Bitwarden, not self-hosted.
- **Hardware-key or TOTP MFA** on the account.

Bitwarden derives the vault key from the master password alone (no 1Password-style
Secret Key), so those four are what close the gap.

## What's stored, and how

Each file in [`secrets.manifest`](./secrets.manifest) becomes one **base64
secure note** (byte-exact restore) named `sworld-secret:<slug>` in a Bitwarden
folder `sworld-secrets`. All-text secrets, well under the note size limit — no
Bitwarden Premium needed. The manifest holds **only paths, never values**, and
is safe to commit.

Not stored here (recreated by CLI login on a fresh machine): `~/.config/gcloud`,
Firebase auth.

## Usage

```bash
bw login                 # once — interactive (master password + MFA)

./backup-secrets.sh --dry-run    # list what would be backed up, touch nothing
./backup-secrets.sh              # unlock + back up (re-runnable; updates in place)

./restore-secrets.sh --dry-run   # list what would be restored
./restore-secrets.sh             # unlock + restore each file to its path
```

Re-run `backup-secrets.sh` whenever you rotate a secret — a snapshot goes stale.

## Config (env overrides)

| Var | Default | Meaning |
|-----|---------|---------|
| `SWORLD_WORKSPACE` | `~/Projects/sworld` | folder holding the three repos |
| `SWORLD_SECRETS_FOLDER` | `sworld-secrets` | Bitwarden folder name |
| `BW_SESSION` | — | reuse an existing unlocked session instead of prompting |
