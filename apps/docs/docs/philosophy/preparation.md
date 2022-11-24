---
sidebar_position: 1
---

# Preparation

Building a website is hard, I have delayed my personal website for a very long time, and now I think I need to force myself to start working on it.

## Overall consideration

Before get start the implementation, I considered these things for a long time:

- Google Cloud Platform is a must. I don't like AWS and I don't trust Microsoft. Some people told AWS is better but for me, GCP is easier to understand and newer, and because they don't understand the GCP concept or use it in the wrong way.
- Real-time is a must, so I will go with either [Hasura](https://hasura.io/) or use [Firestore](https://firebase.google.com/docs/firestore). For this project, I will go with Firestore since I want to practice with noSQL database. I have worked with MySQL for years and I understand the only problem with using a NoSQL database is the developer's thinking since they keep the same mindset as MySQL and use it with NoSQL.
- Scaling might not be the problem until the end users are over one million or requests per second is over thousands. Until that, all the problems come from the developers. So Firestore can just able to handle everything as long as I do the right thing, with the right mindset.
- For UI, I will go with reactjs since I like its ecosystem and especially its philosophy. I don't like vuejs's philosophy, svelte is good but its ecosystem is not meet my simple requirement for building things fast. For the UI framework, I will go with [Material UI](https://mui.com/) without a doubt.
- Separation of concern is my rule of thumb. If one day I change from the Firestore database to use Hasura, there is no reason for my site to stop working. Basically, as long as the API between the backend and the frontend is still the same, everything should work.
- I like the idea of using the "feature flag" system, with that, I can ship code into production every day and prevent potential problems from the long-live branches.
- Monorepo is a good structure to go with, my code base will act as a lego system, I can plug and play every single piece and it should just work. Zero dependencies are the rule of thumb.
- Most important, MVP should be the "minimal viable process", **NOT** "minimum viable product". So I need to have a proper process no matter what my site is.

## Project structure

From this moment, my project structure will be a monorepo with contains multiple workspaces. Luckily, I can find easily a monorepo solution from this example: https://github.com/vercel/turbo/tree/main/examples/kitchen-sink.

Every project should contain some critical parts:

- API for the frontend: it should determine how to get the data regardless of the backend, network, and infrastructure. I will put this into one single monorepo workspace.
- Frontend UI: in the reactjs world, there are two types of a component: stateful and stateless. As long as the API still be the same, everything should just work. My all stateless components should be isolated and I can put them in another monorepo workspace and this is the core UI for everything. The stateful, Context will be put in other different workspaces. I am going to build many different sites, each site will go into this monorepo workspace.
- Admin pages: regardless of what the project is, we always need admin tools to manage everything. I will go with just simple create-react-app or whatever I want to learn for example [remix](https://remix.run/), [astro](https://astro.build/), [gatsby](https://gatsbyjs.com) (this is my favorite).

## Process

This is the most important part. Building a project may take months, or even never be completed if I don't have a proper process and keep consistent with it. I don't want to waste time reinventing the wheel, if there is any existing code base that I can reuse, just copy and tweak it.

There are some things that I must keep in mind:

- Take note of everything. I know there are days that I can not continue my work, and it's okay, but need to write things down. At least I know in the next day I come back, I know which is the system status is, and what is the next thing to work on.
- Break the work into smaller pieces.

So I need to define my own roadmap and checklist with high-level steps:

- Setup infrastructure in Google Cloud Platform
- Answer these questions:
  - How to deploy code?
  - How to monitor the system?
  - How to handle errors?
- Define which feature to implement as a checklist.
