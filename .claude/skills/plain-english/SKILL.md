---
name: plain-english
description: The jargon-free "plain words" writing rule and the block templates that apply it — the mandatory opening summary a reader with zero context can understand in ten seconds, with no code, file paths, symbol names, or unexplained acronyms. Referenced by `writing-task-specs` (a ticket's "In plain words" opening) and `pr-descriptions` (PR summary and user-facing test plan) rather than duplicated in each. Auto-triggers whenever drafting any of those, or any other doc that needs to read cleanly for a non-technical reader.
---

* plain-english: the jargon-free "plain words" writing rule and the block templates that apply it, so any document reads cleanly for someone with zero context.

* Rules
  * No code, no file paths, no function or symbol names.
  * No bare acronym or internal term (a protocol name, an internal field name, "the singleton", a three-letter domain code) — if the reader has to already know the term to parse the sentence, rewrite the sentence.
  * Round numbers when a figure matters ("$120k", not "$119,847.32").
  * Describe what a user sees or experiences, not how the system does it internally.
    * example: [`references/before-after.md`](references/before-after.md)
  * A reader with zero context gets the gist in ten seconds, unaided.
  * Before publishing a sentence, read it back as someone who has never seen this codebase, this domain, or this feature, and if any single word would send them off to look something up before the sentence makes sense, rewrite it.
  * Apply the same law under the header and length that fit the context you're writing (any ticket, a PR summary, or a PR test plan).
    * contexts: [`references/applying-by-context.md`](references/applying-by-context.md)
