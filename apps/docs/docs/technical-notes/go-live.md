---
sidebar_position: 8
---

# Go live

Steps:

- Create a new GCP project
- Go to Firebase console, add new project, choose above created GCP project
- Configure Google Analytic with "Default Account for Firebase"
- In Firebase Console, set up a new web app, use Firebase hosting

Important:

- Enable billing for new GCP project, in my experience, maximum project can be linked to a billing account is 5.

## General settings

In the Firebase project setting:

- MOST IMPORTANT: select default GCP resource location
- Environment: for environment type, choose "Production"
- Public settings: enter the public-facing name and support email

## Firebase Hosting

We need multiple sites for Firebase Hosting, after that:

- Configure custom domain, verify it. Even it still show "Needs setup" but it seems everything is still working. Use any DNS lookup to make sure the domain is pointed into the IP provided by Firebase Hosting.
- Run this command `firebase target:apply hosting listen sworld-prod`
- Inside the folder `apps/listen` run `pnpm run build`, then `firebase deploy --only hosting`
- I forgot the target of deploy command, it should be `firebase deploy --only hosting:listen`, so it deployed into main site.

### Problem

Now it deployed into the main site, but also:

- Default domain `*.web.app` from Google is working fine, ~but custom domain does not work~
- AH it worked after few minutes, but still have problem with SSL certificates, according [this answer](https://stackoverflow.com/a/53100101/8270395) so I think I need to wait for few hours
- According [this answer](https://stackoverflow.com/a/45462518/8270395) it seems the "Needs setup" is due to propagation time.
- It show the data from the dev environment, because I didn't setup database on production yet. Because I deploy from my local machine, it will take environment variables from the `.env` file that contained the dev environment values.
- I can not use PWA feature (pin as a desktop app), I will try again later

## Firebase Authentication

Enable only Google provider

## Firestore database

I got this message: "This project is set up to use Cloud Firestore in Datastore mode...." , I want to use the native mode, follow the answer [here](https://stackoverflow.com/a/63009696/8270395). Firestore need some setup:

- Security rules
- Export data

### Export, import and backup data

For export and import data, follow the guide in the Google Cloud Console, create a new bucket just for database backup.

- Choose an unique name for bucket
- Choose regional location type, see the docs: https://cloud.google.com/storage/docs/locations, choose the same region with default GCP resource location
- Choose Autoclass for the storage class, see the docs: https://cloud.google.com/storage/docs/storage-classes
- For access control, tick to "Enforce public access prevention on this bucket", and choose "Uniform" access control, see docs here: https://cloud.google.com/storage/docs/public-access-prevention
- For object protection, for now, can just go with simple "None", otherwise, see the docs here: https://cloud.google.com/storage/docs/object-versioning

BAD THING! At this moment, there are no feature for export and import via Google Cloud Console, we should do manually via scripts, or using Cloud Shell (script actually)

So export to a new bucket is useless in this case because we can not import from bucket across different GCP project

## Firebase Cloud Functions

Nothing to do

## CI

Setup CI to deploy production for some scenarios:

- Deploy to Firebase hosting preview channels on Pull Requests
- Deploy to Firebase hosting live channel on merge
- Custom deployment for Firebase Cloud Functions

IMPORTANT: Before make any changes to the CI, need to make sure all secrets were set in the github environment variables
Github action requires a service account in order to run build, deploy, etc. Simplest way just go with `firebase init hosting:github`, it will:

- Create a new service account for github actions with minimum permissions
- Automatically put a new github secrets for the Firebase service account key
