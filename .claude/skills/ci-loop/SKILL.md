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

**Repo-qualify every `gh` command.** Each PR lives in exactly one repo (`sworld`, `sworld-backend`, or
`sworld-hasura-v2`, all under `ShinaBR2`). The Step 3 GraphQL query takes a `name:"<repo>"` placeholder —
fill in the repo the PR actually lives in; querying the wrong repo silently returns nothing.

## Step 1: Check merge status

- Run `gh pr view <number> --repo "ShinaBR2/<repo>" --json state` as the **ONLY** command. Do NOT batch it with anything else.
- If `MERGED` → run `cleanup` for this PR (pass its number + repo). Issue status is the tracker's — see `task-tracker`. Loop is done.
- If `CLOSED` → stop the loop. Report to user that the PR was closed without merging.
- If `OPEN` → proceed to Step 2.

## Step 2: Check merge conflicts

- Run `gh pr view <number> --repo "ShinaBR2/<repo>" --json mergeable`.
- If conflicting → `git fetch origin main && git merge origin/main`, resolve conflicts, push. **STOP. Wait 6 minutes. Restart from Step 1.**
- If clean → proceed to Step 3.

## Step 3: Check unresolved review comments

- Query via GitHub **GraphQL API** (REST doesn't expose resolved status). Substitute `<repo>` with the repo the PR actually lives in — `sworld`, `sworld-backend`, or `sworld-hasura-v2` — and `NUMBER` with the PR number. Querying the wrong repo silently returns nothing:
  ```bash
  gh api graphql -f query='{ repository(owner:"ShinaBR2", name:"<repo>") { pullRequest(number:NUMBER) { reviewThreads(first:100) { nodes { isResolved comments(first:1) { nodes { body path line } } } } } } }'
  ```
- Filter to `isResolved: false` threads only.
- If unresolved threads exist → read them, fix the code, push. **STOP. Wait 6 minutes. Restart from Step 1.**
- If no unresolved threads → proceed to Step 4.
- **NEVER manually resolve bugbot threads** — fix code, let bugbot re-resolve on next push.
- Bugbot CI check **ALWAYS shows SUCCESS** even when it finds real bugs. CI green means NOTHING about comments — you must read threads regardless.

## Step 4: Check CI

- Run `gh pr checks <number> --repo "ShinaBR2/<repo>"` (NEVER use `--watch`).
- If failures → fix them, push. **STOP. Wait 6 minutes. Restart from Step 1.**
- If **any check is `pending`** → nothing to fix, and nothing to report. Background-`sleep 360`, then **restart from Step 1**. A review bot still marked "Review in progress" counts as pending: it has not yet had its say, and Step 3 is the gate it feeds.
- If all green AND no unresolved comments → PR is ready. Report to user.
- **Flaky E2E**: if an E2E job failed at an infra/setup step (Playwright OS deps, Node.js setup, cache, runner allocation) and the PR doesn't touch test code, treat it as green — don't trigger reruns or block readiness on it. Reruns are only appropriate when the failure is in a step that executes changed code.
- **Known non-blocking checks** — confirm the specific failure mode before waving these through, then gate on `test` + CodeRabbit instead:
  - **Argos visual-regression** (`argos/Listen E2E`) does a pixel-perfect diff against the anonymous home, which is data-driven (the live production site against prod Hasura, no mocking) — it reports "changed" whenever the underlying data changes, not just on real UI regressions. Root-cause fix tracked separately (mask the data-driven pixels). If the diff is plausibly a genuine intended UI change, say so — it needs approving in Argos, not dismissing.

## Merging — never automatic

- **DEFAULT: never merge.** The user reviews every PR themselves. The loop's terminal action for an OPEN, settled PR is ALWAYS "report to the user that it's ready" — merging is a separate, explicit action taken only when the user has authorized it for that PR (e.g. "you can merge" / "merge when settled").
- **A PR is "settled"** when the loop has run to completion and every gate is green AND stable: OPEN + mergeable (no conflicts), CI fully passed (nothing `pending`, no failures), and zero unresolved review threads. `pending` is not `pass` — never act on an unsettled gate.
- **"You can auto merge when clean" means:** run the full loop until the PR is settled, THEN merge it yourself. It does NOT mean skip the flow and merge now, and it never means skip the review-comment gate (Step 3) — that is the single most important gate, since a green bugbot/CodeRabbit *check* says nothing about whether they left real comments.
- **Never delegate the merge condition to `gh pr merge --auto`.** In this repo it merges the instant the PR is mergeable — GitHub auto-merge only waits on *required* status checks, and this repo's branch protection defines none, so it does not wait for `test`/E2E to go green. Run the full CI loop yourself — Steps 1–4 above, including Step 4's `gh pr checks` — then run `gh pr merge <number> --repo "ShinaBR2/<repo>" --squash` manually once settled. Skipping straight to Steps 1–3 and merging without Step 4 ships whatever CI state happens to be current, which given this workspace's merge-is-deploy model means shipping broken code to production.
- Any fix mid-loop → push → wait 6 minutes → restart from Step 1. A new instruction mid-task folds into this process; it never cancels it or justifies a shortcut.

## The rule that gets violated

The #1 failure mode: batching multiple checks in parallel, fixing multiple things at once, or skipping Step 3 because CI is green. The steps are gates in strict order because each push triggers new CI + bugbot runs. Checking later steps before earlier ones settle is meaningless — the state changes after every push.

## Reporting

After each iteration, report what you found and fixed. Lead with unresolved comments if they exist — that's the #1 thing the user cares about.
