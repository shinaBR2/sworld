---
slug: firestore-data-modeling
title: Firestore data modeling
authors: [ShinaBR2]
tags: [Firestore, Firebase, database, mindset]
---

## Firestore features

Important factors (not all):

- Query performance depends on the result set, **NOT** on the size of the collection. Querying a collection that has millions of records should have the same as a collection that has hundred of records if the result is the same.
- There is a limitation to the size of a document.
- Firestore charges for document read, write and delete operations.

Subcollection vs top-level collection, consider these things:

- Security Rules
- How to query: do I usually query among ALL items => top-level collection, or do I usually query all items WITHIN a document => subcollection

Note: this is opinionated, NOT strictly.

Let's review an example of a music listen to site.

## Feature

As an end user, I want to:

- Listen to some all my configured audios by default
- Filter audio by feeling

## Understand the data

Audio contains basic information like name, src, created date, etc.
Feeling is simple, just contains name and value.

An audio can have multiple feelings, multiple audios can have the same feeling, its many-to-many relationship. For many-to-many relationship, we will have 4 collections **at the concept level**: `audios`, `feelings`, `audiosGroupedByFeeling`, `feelingsGroupedByAudio`.

One important factor, it's likely to have thousands of audio have the same feeling, but one audio usually has just a few feelings.

## Design and decide

Obviously, we will have 2 top collections are `audios` and `feelings`.

Based on my design:

- It's **rarely** need filtering ALL feelings by an audio. The only thing I need is when viewing the audio detail, I may want to see if that audio contains what feelings.
- It's **usually** need filtering ALL audios by a feeling.

Important: array is evil, ignored by default!

### Filtering feelings by audio

Remember, we rarely use this query!

We have some ways:

- Use current top-level `feelings` collection, add a map inside each feeling document (key is audio id, value is boolean) for filtering
- Create a new top-level collection (for example, `feelingsGroupedByAudio`)
- Use a map field inside each audio document (key is feeling id, value is boolean)
- Use a map field inside each audio document (key is feeling id, value is the feeling document or partial of it)
- Use subcollection inside each audio document

First approach will make feeling document size really big. Adding a new data just for a rare used query but increase the document size is not a good trade off.

The second approach is subjective, it's not really great to me whenever I see in the database another collection just for group by mechanism. Another point is, we need to have an intermediate collection for this approach. The path should be something like `/feelingsGroupedByAudio/${audioId}/feelingIntermediateCollection/${feelingId}`.

Third approach, we need some additional queries to get all the feeling data when we have the audio id, which is not good in terms of performance.

Forth approach, it's fine since the document size is bigger but not much. We can store only essential information that need to display on the client side, without additional query.

Last approach is fine too. It's pros is the the size of audio document is minimum, but we will need additional query to get feelings when we need (in the "audio detail view").

So we can consider between the fourth and fifth approach. I chose the fourth because:

- I may want to show the main feeling of an audio in the future without additional query, without having "audio detail view"
- "Deleting a document does not delete its subcollections!", according the offiical docs: https://firebase.google.com/docs/firestore/data-model

### Filtering audios by feeling

Remember, we often use this query!

We have some ways:

- Use the current `audios` top-level collection, add a map inside each audio document (key is feeling id, value is boolean) for filtering
- Create a new top level collection (for example, `audiosGroupedByFeeling`)
- Use a map field inside each feeling document (key is audio id, value is boolean)
- Use a map field inside each feeling document (key is audio id, value is the audio document or partial of it)
- Use subcollection inside each feeling document

The first approach is fine, the size of the audio document is increased a bit, but we can query easily. A small problem is we need a field name like `feelingMap` inside each audio document somehow ugly to me. And we need to use `where` function to get the data.

The second approach has the same problem as the second approach of the previous section. We will have an additional collection just for groups by mechanism, and an intermediate collection.

Using a map field in each feeling document will make the size bigger since the amount of data of an audio document is much bigger than the feeling document. The fourth approach is the worst way.

Fifth approach is basically a group by mechanism. The good point is both feeling and audio document size is minimum, no additional ugly name `feelingMap` field, and query is still straightforward.

I chose the fifth approach in this case.

### Client side vs server side query

From the previous section, I chose:

- Each audio document has a map field (key is feeling id, value is the feeling document or partial of it)
- Create a new subcollection inside each feeling document, for example path `/feelings/${feelingId}/audios`

I got the consideration between client-side query and server-side query here. Some popup questions:

- Why do I need to call to the server side again to query since I already have feeling information in each audio document? I can just do filtering on the client side instead, it will save cost of Firestore read.
- For the "default state" when no feeling is selected, I fetch data from the `audios` collection, but when I choose a feeling, it looks for another collection (`/feelings/${feelingId}/audios`). Is that stupid?

Here are some criteria to consider:

- Security rules. In this case, no problem. But in many cases, we may have different policies for top-level collection and subcollection.
- Pagination. It's a common pattern when you already load the first 20 audios from the top `audios` collection, and then you want to filter audios by feeling, which potentially leads to unexpected behavior when doing it on the client side.
- Filtering on the client-side require we have enough information from the beginning. In this case, we can not filter audios by feeling if the audio document itself does not contain the feeling information.

## Conclusions

Nothing is perfect, and no solution is ideal for all cases, but at least we have some rules to follow:

- Let the view and the frequency of queries determine the data model
- Keep the document size minimum
- Query performance in Firestore depends on the result set. So no need to have a top-level just for the group by mechanism.
