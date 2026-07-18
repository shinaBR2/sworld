---
name: plain-english
description: The jargon-free "plain words" writing rule and the block templates that apply it — the mandatory opening summary a reader with zero context can understand in ten seconds, with no code, file paths, symbol names, or unexplained acronyms. Referenced by `writing-task-specs` (ticket "In plain words" / "Why this matters" blocks) and `pr-descriptions` (PR summary and user-facing test plan) rather than duplicated in each. Auto-triggers whenever drafting any of those, or any other doc that needs to read cleanly for a non-technical reader.
---

# Plain English

One law, reused everywhere a document needs to be readable by someone with zero context. It used to get restated slightly differently every time a skill needed it — this is the single canonical version; `writing-task-specs` and `pr-descriptions` both apply it instead of each keeping their own copy.

## The law

- No code, no file paths, no function or symbol names.
- No bare acronym or internal term (a protocol name, an internal field name, "the singleton", a three-letter domain code) — if the reader has to already know the term to parse the sentence, rewrite the sentence.
- Round numbers when a figure matters ("$120k", not "$119,847.32").
- Describe what a user sees or experiences, not how the system does it internally.
- A reader with zero context gets the gist in ten seconds, unaided.

## The test before publishing a sentence

Read it back as someone who has never seen this codebase, this domain, or this feature before. If any single word would send them off to look something up before the sentence makes sense, rewrite it.

## Applying it by context

The law doesn't change — only the header and length it sits under, which belongs to the consuming skill:

| Context | Header | Length | Owned by |
|---|---|---|---|
| Bug / small feature / large-feature-parent ticket | `**In plain words**` | 2–4 sentences | `writing-task-specs` |
| Sub-issue (child of a large feature) | `**Why this matters**` | one sentence | `writing-task-specs` |
| User story | no separate header — its opening section already is the plain-words block | 2–4 paragraphs | `writing-task-specs` |
| PR summary | the description's opening sentences | 1–3 sentences | `pr-descriptions` |
| PR test plan (user-facing change) | Test plan steps | click-by-click | `pr-descriptions` |

## Before / after

Bad — jargon leaks into the reader-facing sentence:

> The client factory now resolves credentials per-request from the user's own record instead of a shared process-wide singleton, fixing cross-user session leakage.

Good:

> Right now, one part of the app could accidentally use someone else's login instead of your own. This fixes it so every action always uses your own account, never someone else's.

## Why this is its own skill, not copy-pasted text

The rule already has two independent, real consumers — `writing-task-specs`'s four ticket shapes and `pr-descriptions`'s summary/test-plan — not a hypothetical future one. Duplicating prose risks drift: one copy gets refined during a review and the other quietly falls behind. Whenever this law changes, it changes once, here, and both consumers pick it up.
