---
slug: firebase-nosql-database
title: Firebase NoSQL database
authors: [ShinaBR2]
tags: [Firebase, NoSQL]
---

There are many kinds of NoSQL databases, this article mainly focuses on Firebase's products are the "Firebase real-time database" and "Firestore". However, the mindset and theory will be similar to all other NoSQL databases.

A little reminder, this article is not a comprehensive guide about the NoSQL world. From now on this article, whenever I use "NoSQL", I am talking about the above databases, for other kinds of NoSQL databases, it may vary.

## Inspired

Must checkout:

- [Firebase for SQL developers series](https://www.youtube.com/playlist?list=PLl-K7zZEsYLlP-k-RKFa7RyNPa9_wCH2s)
- [Get to know Firestore](https://www.youtube.com/playlist?list=PLl-K7zZEsYLluG5MCVEzXAQ7ACZBCuZgZ)

## Mindset

First and foremost, mindset is the key to everything.

The rule of thumb when working with NoSQL is **denormalization**. It's the process of duplicating your data into multiple places in your database. If you feel this is wrong when you come from the MySQL world, that's okay, but this is the first step you need to change your mind. Otherwise, you can not go further. Not because you're bad, just if you can not use the right thing the way it is, don't use it.

After we have denormalized our data, the next thing is keeping the data consistent. In order to do that, whenever we update the data, we need to do it in multiple places.

[Arrays are evil](https://firebase.blog/posts/2014/04/best-practices-arrays-in-firebase#arrays-are-evil), old but still valuable.

NoSQL is based on the theory that reading is more often than writing.

A reminder, no matter what kind of your database you are using, the relation among your data still be the same. Don't use your brain to remember how you should structure the database, let's understand the relationship of your data instead.

## Structure data

This is my personal thinking, it may not suitable in some cases, any feedback will be appreciated.

A real-world example, we usually have many data that live in terms of "1 - 1", "1 - n", and "n - n" relationships, no matter how you store them in the database. The principle of relational databases still is valuable here, regarding the primary key, foreign keys, and conjunction tables.

For example, we have some entities A, B, and C with the following relationship:

- A and B: "1 - 1" relationship
- One "A entity" may have n entities of C, which means a "1 - n" relationship.
- B and C: "n - n" relationship.

Before considering the relationship, we will create some collections at the top level `A_Collection`, `B_Collection`, and `C_Collection` which store all entities of each collection, it's straightforward.

Question: why do we need to have these collections regardless of the relationship?

The answer: Because we can get the entity from its primary key.
We can use security rules for these collections for example only the admin can read/write all entities, but the other users can read/write their owned data only.

### "1 - 1" relationship

We can choose either store inside each A entity "b_primary_key", or the entire B entity.

Question: what should we store in each A entity?

The answer: depends on how we read the data. If we will want to get the B entity besides the A entity most of the time, store the entire B entity, otherwise, just store the primary key.

### "1 - n" relationship

We will have a "list of primary keys of C entities" inside each A entity to get the reference whenever we need it, but **DO NOT** store it as arrays. We can choose either to store only the primary key of C entities (whose value is boolean like `true`) or store entire C entities. The reason is similar to the above "1 - 1" relationship.

### "n - n" relationship

For the "n - n" relationship between B and C, [this Stackoverflow question](https://stackoverflow.com/questions/41527058/many-to-many-relationship-in-firebase) is a great answer for it, here is the summary:

- First approach: create a new table like `B_anc_C_Collection` which acts as a conjunction table in MySQL world
- Second approach: we have 4 collections `B_Collection`, `C_Collection`, `B_to_C_Collection`, and `C_to_B_Collection`.

Question: for the second approach, **when** should we look for `B_to_C_Collection`, and when `C_to_B_Collection`?

The answer: depends on what "input" you have, think of them as a "groupBy" collection.

## Write the data

At this moment, your data should be live in multiple places in the database. In order to keep data consistent regardless of how we read the data, we need to write data to all places at the same time. The "transaction" concept should be the key here. It means batch writing all data at the same time and ending up with success or failure, making sure **NO PARTIAL** data were written.

The question here (maybe) is how can we remember where to batch-write the data. I should remind you again of my above words.

> "No matter what kind of your database you are using, the relation among your data still be the same. Don't use your brain to remember how you should structure the database, let's understand the relationship of your data instead".

From my point of view, there are two kinds of batch-write operations. First, we don't care about the current data. The second one, we depend on the latest, up-to-date data.

Let's call the first approach just simple "batched-write", second one is "transaction".

"Batched-write" is just simply answers these questions:

- When the process is started and ended?
- What should we do during the process?

"Transaction" is a bit more complex, here are the steps.

- Read the latest data to make sure we are working with the up-to-date data
- Do logic
- Tell the database what are we going to change

The database behind the scence will double-check the places we want to read + write data, if nothing changes from the moment we start the transaction, go ahead and commit all the changes. Otherwise, back to step one. The process will repeat until either successful or fail due to too many tries.

This strategy is known as "optimistic concurrency control", it means to optimize for the happy case (which happens most of the time), and if the worst case happens, just retry the whole process again.
