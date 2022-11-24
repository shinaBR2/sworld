---
sidebar_position: 2
---

# Setup infrastructure notes

This is the first step in building my project. Since the setup process follows the guide in Google Cloud Console, I still feel interested in this journey.

The first thing I need to do is create an organization in the Google Cloud Platform. I like Google's way to structure resources as a hierarchical model.

The first problem I encountered is choosing between the Cloud Identity and the Google workspace account. Since they are almost the same in terms of resources in Google Cloud Console, I decided to go with Cloud Identity because I don't need many Google workspace services like Gmail, drive at this moment. See more here: https://support.google.com/cloudidentity/answer/7319251?hl=en

I did follow the recommendation of Google for some default service accounts with the right roles. The next thing I notice is after linking my new Firebase project with the Google Cloud project, there are some new service accounts were created, one of them named "firebase-adminsdk". Another special one is "App Engine service accounts". The Google App Engine uses this service account by default when interacting with other Google Cloud services, such as Cloud Storage and Datastore, in the form of [application default credentials](https://cloud.google.com/docs/authentication/application-default-credentials).

The next important thing is the [default GCP resource location](https://cloud.google.com/firestore/docs/locations#default-cloud-location) since we can not change it later.

The next thing is reading over all documents of Firestore and watching this fantastic series: https://www.youtube.com/playlist?list=PLl-K7zZEsYLluG5MCVEzXAQ7ACZBCuZgZ. This awesome series made me forget that I should do this work later :D the database is later, I need to set up the infrastructure and architecture first. But again, this series is great.

Here are the next steps:

- Prepare Firebase project ✔️
- Deploy the first dev environment site ✔️
- Research to support multiple sites with Firebase hosting: https://firebase.google.com/docs/hosting/multisites ✔️
- Structure to support multiple sites? ✔️

## Integrate Firebase

It was not my initial intention since I want Firebase to act as a reactjs Context provider, but after a few hours trying to add Firebase into the project which the main issue is the environment variables, I figured out some interesting things:

- One of my workspace use [vite](https://vitejs.dev/) as a build time. In order to work with environment variables, it uses the prefix `VITE_`. This is good to avoid accidental pass the secrets into the frontend bundle.
- Even the fact that it was the official docs from turborepo: https://turbo.build/repo/docs/handbook/dev#using-environment-variables, everything is not just simple. Because my workspace uses vite, which is a different build tool, which a different way to handle environment variables, the `process` of `process.env` when I run `pnpm run dev` will be not defined.
- When using Vite as a build tool, in the code, I will get the environment variables by using `import.meta.env` instead of `process.env`.
