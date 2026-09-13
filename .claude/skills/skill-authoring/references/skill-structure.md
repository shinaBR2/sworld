# Skill structure

A skill's content — everything below the frontmatter — is three parts and nothing else: one sentence defining it, its rules, and the steps it walks you through.

## The three parts

Each part is a top-level bullet: the definition line, then `* Rules`, then `* Steps`, with their contents nested one level under the header bullet.

- **Definition** — the first line, one sentence: `* <skill-name>: <the job it makes you better at>`.
- **Rules** — one sentence each, sentence-cased, no `rule: ` prefix. A rule is anything that changes a verdict at runtime, including the condition that ends the work.
- **Steps** — one sentence each, numbered when a step cannot come before the one above it, plain bullets otherwise. A sub-bullet carries a boundary or a path, never an explanation.

## Example

```markdown
* release-notes: turns a merged range of commits into notes a customer can read.

* Rules
  * a commit with no ticket is a question for whoever wrote it, not a release note.
  * describe the change the user sees, never the code that made it.
  * a reverted change and its revert both drop out.
  * stop when every commit in the range is in the notes or excluded with a reason.

* Steps
  1. Fix the range against the last published tag, before reading any commit.
  2. Group by product area, then drop everything a customer cannot observe.
     * areas: [`references/product-areas.md`](references/product-areas.md)
  3. Write each line in the customer's words, checked against the ticket, not the diff.
```
