---
slug: e2e-with-hasura
title: E2E test with Hasura
authors: [ShinaBR2]
tags: [Auth0, Hasura, serverless, e2e]
---

# E2E testing with Hasura

Testing is the crucial part of product development. With the Hasura role base access control, it's neccessary to make sure the new changes always doesn't over step the border between different roles. Hasura also control permissions on rows and columns for each table, so this is also crucial to test.

Here is the goal I want to achieve with 2 roles: anonymous and user

- Keep clear permission for different roles, for example anonymous role should never be able to access some tables data
- Keep clear permission for specific tables, for example, anonymous and user role can't listing all the users in the database. User role can see their user's profile, of course.

It's important to think about e2e testing strategy is, we should treat it as how the real end users see the system, regardless the implementation.

At first, I thought here is the flow I would like to do e2e testing: test directly the dev environment like the real end user would. It should use the real data on my dev environment, not mocking the response from the Hasura in the playwright test.

However I faced some challenges, that's fun

- Authentication: I used Auth0 as authentication server, and my sites ONLY ALLOW SIGN IN USING GOOGLE. Password should never be exist in my sites, ever. We will need to run tests via CI of course, so no browser to simulate the signning in with Google flow.
- The repository for Hasura was different from the monorepo I'm using for all frontend sites. Due to the complexity of monorepo, I decided to separate out the Hasura into single repository. It means I can't reuse the graphql queries in Hasura repository from the monorepo. This is the trade-off and I'm fine with it.
- At first, I think about branching feature of Neon for testing database but I faced a critical challenge: Hasura does not support dynamic database URL. What I truly want is an isolated database when all mutations can happen and free to delete the test database after testing finished.
