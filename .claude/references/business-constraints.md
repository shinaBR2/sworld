# Business constraints — product rules, not technical ones

The single home for rules the **product** decided, independent of how anything is
built. A constraint here isn't a consequence of the infrastructure, the
architecture, or the deploy model — it's a choice about how the product behaves,
and it would still hold if the whole stack were rewritten.

A skill that needs one of these points here rather than restating it, so the rule
and its rationale live in one place.

## Deletes are decided per table, never assumed

Whether a user may delete a table's rows is a **product decision recorded in that
table's Hasura `delete_permissions`**, and it varies by content:

- For some content a user may delete their **own** rows.
- For other content (e.g. `videos`) **only an admin** may delete.

There is no blanket rule in either direction. Before building a delete anywhere,
check the table's permission; if it isn't granted there, that's a metadata change
to approve first — the frontend can't grant it. (The metadata *mechanism* is the
`hasura-architecture` skill's; the *rule that it varies by content* is the
constraint here.)
