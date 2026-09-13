# The shape a ticket takes

Every ticket, whatever its size, is these sections in order — keep the ones that apply, drop the ones that don't:

- **In plain words** — the problem, short, no jargon (`plain-english`). Always first.
- **User story** — on a feature's parent ticket: who needs this and why, from the user's side. A feature often starts life as just this — a parent carrying the user story, captured before it's broken into children.
- **Root cause & solution** — what's actually wrong (a bug) or what's being built (a feature), and the approach. Skip root cause if it still needs investigating; say so.
- **Goal — what it looks like when this is done.** Concrete and checkable: what a person can now see or do that they couldn't before. This is the acceptance test — specific enough that someone with no context can confirm it.

On a **parent**, the Goal describes the *whole* feature finished. That's the one check that proves the assembled children deliver the story — no single child's Goal can, since each only covers its own slice.

## Example — a small bug ticket

> **In plain words**
> On the listen app, your place in a track is lost when you reload the page — you have to scrub back to where you were every time.
>
> **Root cause & solution**
> The player reads the saved position from a stale in-memory value instead of the stored one. Read it from storage on load.
>
> **Goal**
> Reload the listen app mid-track and playback resumes from the exact second you left off — not the start, not a few seconds out.

The Goal is the tell: "resumes from the exact second" is checkable by anyone; "position persists correctly" would not be. A parent feature ticket adds a **User story** section above Root cause & solution; a child sub-ticket drops it.
