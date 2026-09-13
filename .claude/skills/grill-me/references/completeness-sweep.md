# The completeness sweep

A decision tree only covers the branches you thought to draw — the real failure is a whole actor or scenario nobody mapped, so it never gets grilled and surfaces later as a missing requirement. Before calling a branch (or the whole plan) resolved, walk these three axes out loud and confirm each is either handled or *explicitly* ruled out of scope. Silence is not coverage.

- **Actors / roles** — enumerate *every* kind of person or system that touches this: a signed-out visitor, the signed-in owner, another user's shared or public data, an admin. For each, is there a story — or a deliberate "not this one"? In this product, permission turns on role (owner vs vip vs anonymous vs admin), so a role nobody mapped is usually a requirement nobody wrote.
- **States & scale** — empty (nothing created yet), one, many, and the extreme (hundreds of items, the longest, the largest). Where does behaviour change as the count grows?
- **Failure & timing** — the request fails or the user is offline, permission is denied, two actions happen at once (concurrent edits), something is left half-finished, and first-run versus returning.

Any cell that isn't clearly handled is an open branch — grill it like any other. Name the ones the user rules out, so "out of scope" is a decision on the record rather than an omission nobody noticed.
