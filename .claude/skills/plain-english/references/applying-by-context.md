# Applying the law by context

The law doesn't change — only the header and length it sits under. This table is the source of truth for both; a consuming skill picks the row for the block it's writing. Where a shape template echoes a length as a fill-in hint, this table still governs if the two ever differ:

| Context | Header | Length | Used by |
|---|---|---|---|
| Any ticket (bug, feature, parent, or child sub-ticket) | `**In plain words**` | short — a sentence or two for a bug or child sub-ticket, up to a few for a feature or parent | `writing-task-specs` |
| PR summary | the description's opening sentences | 1–3 sentences | `pr-descriptions` |
| PR test plan (user-facing change) | Test plan steps | click-by-click | `pr-descriptions` |
