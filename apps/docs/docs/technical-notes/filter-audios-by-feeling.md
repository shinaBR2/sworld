---
sidebar_position: 6
---

# Filter audios by feeling

After consideration all pros and cons, I decied:

- Do client side filtering because right now, the number of audios in system is not high, no need complex pagination technique.
- In order to do that, each audio document **MUST** have a map contains the feeling id. For now, I don't need to show any feeling of each audio anywhere, so I just keep the value is boolean, just for filtering only.

The good thing is no need to do any extra works for querying using `where`, no need any pagination mechanism, but the performance still good enough.
