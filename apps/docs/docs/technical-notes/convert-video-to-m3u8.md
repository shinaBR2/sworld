---
sidebar_position: 10
---

# Convert mp4 to m3u8

## Challenges

- Fireabse Cloud Functions frustrated DX with development and deployment
- Migrate to use encore-dev
- Encore-dev can not be deployed to cloud functions, so we need to use Cloud Run
- Problem with Docker and encore-dev
  - TODO: add new docker login into the CI flow to push images into Docker hub
  - TODO: configure deploy Cloud Run in CI
  - Docker container MUST listen on 0.0.0.0, Cloud Run setup to run on port 4000 (default as encore-dev)
  - Deploy on Cloud Run make we lost the dashboard, only keep the core API
  - encore test is weird, must change all the `test` command into `unit-test` because `encore test` will trigger `test`
  - encore test won't run on CI because it require to install `encore` CLI, so we need to hack to install it and deal with environment variables
  - After that, we need to authentication with encore cloud account, we need one more environment variable in Github secret
  - Encore structure does not have any index.ts file, so when need to reference to environment variable, ideally to run `dotenv/config` once, but it cause more trouble, so I decided to put it into the top of each service
  - encode-dev does not allow to use `require` in the code base, so we need to promisify some legacy code
  - I called the local endpoint many times ngrok but the encore dashboard traces seems does not track the up-to-date data
  - Suddenly some native modules in nodejs does not work and I need to add this into .npmrc
    ```
    shamefully-hoist=true
    node-linker=hoisted
    ```
  - Suddenly the `x-forwarded-for` is undefined for request from nocodb
  - With encore new structure, the request payload, header are validated before service called, so it reduced a lots of validation code
- Problem with Firebase
  - Fireabase admin need to be initialized before anything
  - Suddenly, the `getStorage().bucket()` doesn't work anymore, it requires to provide the bucket name
  - Suddenly, we need to authorize the Firebase Admin SDK, so I need to run `gcloud auth application-default login` to using the default credentials for development
- Finally 1 day of code, finally it working, but not the end
- The code converted and upload files successfully but the files is not public accessible by default, we need to allow access to the bucket by allow `allUsers` role having the bucket viewer role
- Not only that, we need to consider `cors` header because Google does not allow cors by default.
- My main domain now still have problem with ssl certificate for unknown reasons.
- Suddenly the `vitest` failed again

## TODO list for deployment

- Check again ALL environment variable, for ALL apps
- Review the PR

## Deployment flow

For now, use a new `backend` branch for backend

- Build new docker and push to docker hub: https://github.com/marketplace/actions/build-and-push-docker-images
- Deploy Cloud Run using (see `apps/docs/docs/technical-notes/encore-with-cloud-run.md`)

  ```
  gcloud run deploy sworld-backend \
  --image docker.io/shinabr2/sworld-backend:1.2.0 \
  --platform managed \
  --port 4000 \
  --region asia-southeast1 \
  --allow-unauthenticated
  ```

- I removed 2 lines from `.npmrc` and `vitest` can run again
- CI running the test now it took forever, it seems the `encore test` is the root cause. When running locally, `encore test && vitest` or `vitest && encore test` will result the same behavior, it running forever
