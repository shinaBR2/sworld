---
name: ci-loop
description: >-
  The post-PR CI gate loop — a strict sequential state machine that drives an open PR to settled:
  merge status → conflicts → unresolved review threads → CI checks, fixing/pushing/waiting/restarting
  until every gate is green, then reporting ready (never auto-merging). Use whenever the user says
  "do the loop", "run the loop", "the CI loop", "check the PR", or invokes /ci-loop. On merge it runs
  `cleanup` for teardown. It does NOT do the pre-PR self-review (that's `parallel-workflow`'s gate)
  and never touches issue status (that's the tracker's — see `task-tracker`).
user-invocable: true
---

# CI loop ("do the loop")

A strict sequential state machine. Each step is a **gate**. If any gate triggers a code change, push
the fix, wait 6 minutes for CI, then **restart from Step 1**. NEVER proceed to the next step after
fixing something. NEVER batch multiple steps in parallel.

**It is a LOOP, not a single pass.** There are exactly two ways out: the PR is `MERGED`/`CLOSED`
(Step 1), or every gate is green and stable — *settled*, as defined under "Merging" below. Anything
else means go round again.

**`pending` is a third state, and it is NOT an exit.** A gate that hasn't decided yet is neither a
pass nor a failure — it is *unsettled*, and the loop's job is to wait it out, not to hand back. When
any gate is pending: `sleep 360` in the **background** (never a foreground wait, never the Monitor
tool — a hook denies it), and on wake **restart from Step 1**. Do not report, do not ask the user
whether to continue, do not treat "I have nothing to fix right now" as done. Handing an unsettled PR
back to the user is the single most common way this loop gets broken.

Before entering the gates, push any unpushed local commits so the remote PR reflects the latest work.

## Scope boundary

This loop runs **after** a PR exists, to get it to merged. Do NOT arm a monitor or idle-poll while waiting — a hook denies the Monitor tool outright; drive the gates and stop. It is not the pre-PR self-review — that
loop (the `self-review` skill, before the PR is created) is `parallel-workflow`'s
pre-PR gate. When a PR merges, Step 1 hands off to `cleanup`. Issue status is never touched here — that's
the tracker's concern; see `task-tracker`.

**Every PR lives in `ShinaBR2/sworld`** — frontend, backend, and Hasura all ship from the one repo, so
every PR runs through this same loop. The `gh` calls below name that repo explicitly rather than relying
on the current directory's remote. Which checks actually run on a given PR is whatever the repo's
workflows decide; read `gh pr checks` rather than assuming a layer is covered.

## Step 1: Check merge status

- Run `gh pr view <number> --repo ShinaBR2/sworld --json state` as the **ONLY** command. Do NOT batch it with anything else.
- If `MERGED` → run `cleanup` for this PR (pass its number). Issue status is the tracker's — see `task-tracker`. Loop is done.
- If `CLOSED` → stop the loop. Report to user that the PR was closed without merging.
- If `OPEN` → proceed to Step 2.

## Step 2: Check merge conflicts

- Run `gh pr view <number> --repo ShinaBR2/sworld --json mergeable`.
- If conflicting → `git fetch origin main && git merge origin/main`, resolve conflicts, push. **STOP. Wait 6 minutes. Restart from Step 1.**
- If clean → proceed to Step 3.

## Step 3: Check unresolved review comments

- Query via GitHub **GraphQL API** (REST doesn't expose resolved status). Substitute `NUMBER` with the PR number:
  ```bash
  gh api graphql -f query='{ repository(owner:"ShinaBR2", name:"sworld") { pullRequest(number:NUMBER) { reviewThreads(first:100) { nodes { isResolved comments(first:1) { nodes { body path line } } } } } } }'
  ```
- Filter to `isResolved: false` threads only.
- If unresolved threads exist → read them, fix the code, push. **STOP. Wait 6 minutes. Restart from Step 1.**
- If no unresolved threads → proceed to Step 4.
- **NEVER manually resolve bugbot threads** — fix code, let bugbot re-resolve on next push.
- Bugbot CI check **ALWAYS shows SUCCESS** even when it finds real bugs, and shows SUCCESS while the review is still running. CI green means NOTHING about comments — you must read threads regardless, and a bot that hasn't reported yet is `pending`, not `pass` (see "Merging" below).

## Step 4: Check CI

- Run `gh pr checks <number> --repo ShinaBR2/sworld` (NEVER use `--watch`).
- If failures → fix them, push. **STOP. Wait 6 minutes. Restart from Step 1.**
- If **any check is `pending`** → nothing to fix, and nothing to report. Background-`sleep 360`, then **restart from Step 1**. A review bot still marked "Review in progress" counts as pending: it has not yet had its say, and Step 3 is the gate it feeds.
- **A `skipped` check counts as green, not as pending.** Gates that filter by path run a cheap always-on filter job and skip the expensive one when nothing relevant changed (see `e2e-main-pr.yml`); `gh pr checks` prints these as `skipped`. That is the designed pass state — never wait on it. Its *filter* job going red is a real failure and blocks like any other.
- If all green AND no unresolved comments → PR is ready. Report to user.
- **Flaky E2E**: if an E2E job failed at an infra/setup step (Playwright OS deps, Node.js setup, cache, runner allocation) and the PR doesn't touch test code, treat it as green — don't trigger reruns or block readiness on it. Reruns are only appropriate when the failure is in a step that executes changed code.
- **Known non-blocking checks** — confirm the specific failure mode before waving these through, then gate on `test` + CodeRabbit instead:
  - **Argos visual-regression** (`argos/Listen E2E`) does a pixel-perfect diff against the anonymous home, which is data-driven (the live production site against prod Hasura, no mocking) — it reports "changed" whenever the underlying data changes, not just on real UI regressions. Root-cause fix tracked separately (mask the data-driven pixels). If the diff is plausibly a genuine intended UI change, say so — it needs approving in Argos, not dismissing.

## Merging — never automatic

- **DEFAULT: never merge.** The user reviews every PR themselves. The loop's terminal action for an OPEN, settled PR is ALWAYS "report to the user that it's ready" — merging is a separate, explicit action taken only when the user has authorized it for that PR (e.g. "you can merge" / "merge when settled").
- **A PR is "settled"** only when **all three** hold at once. Any one of them missing means unsettled, and unsettled means go round again:
  1. **No conflicts** — OPEN and `MERGEABLE`.
  2. **No unresolved review threads** — zero `isResolved: false`. This is the whole point of the loop.
  3. **All CI green** — every check passed or was `skipped`, nothing `pending`, nothing failed.
- **A review bot's CI check going green does NOT mean the bot has finished reviewing.** CodeRabbit and Cursor bugbot report `SUCCESS` on their status check while the review itself is still running — and they report `SUCCESS` again after finding real bugs. So a fully green `gh pr checks` can sit alongside a bot that has not yet said anything, and moments later it posts blocking comments. Treat a bot as finished only when its check is green **and** it has actually left its review (its check description no longer reads "Review in progress", and Step 3's thread query reflects its verdict). Until then it is `pending`, whatever colour the check is — background-`sleep 360` and restart from Step 1. **Never call a PR settled on green CI alone.**
- **"You can auto merge when clean" means:** run the full loop until the PR is settled, THEN merge it yourself. It does NOT mean skip the flow and merge now, and it never means skip the review-comment gate (Step 3) — that is the single most important gate, since a green bugbot/CodeRabbit *check* says nothing about whether they left real comments.
- **Never delegate the merge condition to `gh pr merge --auto`.** In this repo it merges the instant the PR is mergeable — GitHub auto-merge only waits on *required* status checks, and this repo's branch protection defines none, so it does not wait for `test`/E2E to go green. Run the full CI loop yourself — Steps 1–4 above, including Step 4's `gh pr checks` — then run `gh pr merge <number> --repo ShinaBR2/sworld --squash` manually once settled. Skipping straight to Steps 1–3 and merging without Step 4 ships whatever CI state happens to be current, which given this repo's merge-is-deploy model means shipping broken code to production.
- Any fix mid-loop → push → wait 6 minutes → restart from Step 1. A new instruction mid-task folds into this process; it never cancels it or justifies a shortcut.

## The rule that gets violated

The #1 failure mode: batching multiple checks in parallel, fixing multiple things at once, or skipping Step 3 because CI is green. The steps are gates in strict order because each push triggers new CI + bugbot runs. Checking later steps before earlier ones settle is meaningless — the state changes after every push.

## Reporting

After each iteration, report what you found and fixed. Lead with unresolved comments if they exist — that's the #1 thing the user cares about.
