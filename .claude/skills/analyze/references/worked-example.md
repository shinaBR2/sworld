# Analyze — worked example

A per-user third-party login feature (connect an external account, then import from
it), scoped into a parent plus sub-issues. What an up-front analyze pass catches —
each of which, skipped, surfaces the expensive way, mid-build in a sub-issue's
self-review:

- **Requirement pass — actor gap:** the connect/import actions are marked for any
  signed-in user, but the implementation runs against a single shared account
  belonging to the owner — so any user could act as the owner. "What does a
  *non-owner* actually get here?" was never enumerated.
- **Requirement pass — half-finished gap:** a user with a working connection starts a
  re-login and abandons it; the design reuses the same field for the in-progress
  session, so the abandoned attempt overwrites and destroys their working one.
  "Returning user, login left half-finished" was never handled.
- **Breakdown integrity:** the parent sits live with a `blocked-by` on a sub-issue
  already closed/superseded; its Goal still promises behaviour no remaining sub-issue
  delivers; and a real deploy-order blocker between two children lives only in prose —
  under merge-is-deploy, shipping them in the wrong order breaks prod.

The first two are *Owner decision* findings (they change what gets built); the
integrity ones are *Reconcile now*.

Verdict: blocked on the owner resolving the two Owner-decision findings before this is safe to build.
