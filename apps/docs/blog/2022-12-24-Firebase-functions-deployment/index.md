---
slug: firebase-functions-deployment
title: Deploy Firebase Functions in monorepo with pnpm
authors: [ShinaBR2]
tags: [Firebase, monorepo, pnpm]
---

## Problem

I am a fan of serverless solution including Firebase Cloud Functions, but until now it still does not natively support monorepo and pnpm. This was a very frustrating development experience. After few hours research, try, fail and repeat the cycle, at least I can figure out a hack to solve this problem. See the problem here: https://github.com/firebase/firebase-tools/issues/653

Some references that I have read:

- https://github.com/pnpm/pnpm/issues/4073
- https://github.com/willviles/firebase-pnpm-workspaces
- https://github.com/firebase/firebase-functions/issues/172
- https://github.com/pnpm/pnpm/issues/2198
- https://github.com/pnpm/pnpm/issues/4073
- https://github.com/Madvinking/pnpm-isolate-workspace
- https://github.com/pnpm/pnpm/issues/4378
- https://github.com/pnpm/pnpm/discussions/4237

## Hacky solution

Solution: https://github.com/Madvinking/pnpm-isolate-workspace

The idea is, build all the dependency into one single workspace with some tweak in the `package.json` file since `firebase deploy` command does not support the pnpm `workspace:*` protocol.

In my case, the `api` (`apps/api` folder) is the name of the workspace I am working with the Firebase Cloud Functions, that has a dependency is the `core` (`packages/core` folder) workspace.

The folder structure should be like

```
root
  |- apps
    |  api
  |- packages
    |  core
  firebase.json
  pnpm-workspace.yaml
```

Steps:

- Change the `firebase.json` `source` field to `"source": "apps/api/_isolated_",` and remove the `predeploy` hook
- Build Cloud Functions locally, the output will be in `apps/api/dist`
- Run `pnpx pnpm-isolate-workspace api` at the root folder, it will create the folder name `_isolated_`.
- Copy build folder into new created folder `cp -r apps/api/dist apps/api/_isolated_`
- Go to the `apps/api/_isolated_` run `mv package.json package-dev.json`
- Go to the `apps/api/_isolated_` run `mv package-prod.json package.json`
- Go to the `apps/api/_isolated_` run `sed -i 's/"core\"\: \"workspace:\*\"/"core\"\: \"file\:workspaces\/packages\/core\"/g' package.json`, thanks to [this comment](https://github.com/firebase/firebase-tools/issues/653#issuecomment-827960976)
- Finally run `firebase deploy --only functions` at the root folder

## Other notes

In order to deploy the Cloud Functions, the service account need to have some specific roles, check out the official docs: https://firebase.google.com/docs/projects/iam/permissions#functions
