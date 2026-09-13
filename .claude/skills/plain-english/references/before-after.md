# Before / after

Bad — jargon leaks into the reader-facing sentence:

> The client factory now resolves credentials per-request from the user's own record instead of a shared process-wide singleton, fixing cross-user session leakage.

Good:

> Right now, one part of the app could accidentally use someone else's login instead of your own. This fixes it so every action always uses your own account, never someone else's.
