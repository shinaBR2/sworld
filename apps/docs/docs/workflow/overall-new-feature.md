---
sidebar_position: 1
---

# Overall new feature

Below are the steps to do for all features on any site.

Sorry, I feel harmful when using "I" instead of "we" in almost all documents here, but this is my personal project.

## Data structure

All data are the same as the basic CRUD operations. Some other special data have some more requirement

Consider the following things:

- Do I need a feature flag (how big is this feature)?
- How to structure the required data and the relationship between data. The timestamp is **MUST**.
- Do I need real-time?
- Do I need to run any migration?
- Who will be able to read the data?
- Who will be able to write the data?
- Do I need soft delete?
- Do I need any reports? What metrics will I want to keep my eye on it?

The output of this step should include:

- Data model with the data converter
- Firestore Security rules or Hasura metadata
- Nice to have: data flow documentation

## API

The next step output should be:

- Client-side hooks to get or update the data
- Server-side (if needed) code including listener, migrations, cronjob.

## UI

This is the last step which will start from the UI components using Storybook.
