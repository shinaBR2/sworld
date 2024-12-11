---
slug: firebase-functions-deployment
title: Deploy Firebase Functions in monorepo with pnpm
authors: [ShinaBR2]
tags: [Firebase, monorepo, pnpm, serverless]
---

## Problem

I am a fan of serverless solutions including Firebase Cloud Functions, but until now it still does not natively support monorepo and pnpm. This was a very frustrating development experience. After a few hours of research, trying, failing, and repeating the cycle, at least I can figure out a hack to solve this problem. See the problem here: https://github.com/firebase/firebase-tools/issues/653

Some references that I have read:

- https://github.com/pnpm/pnpm/issues/4073
- https://github.com/willviles/firebase-pnpm-workspaces
- https://github.com/firebase/firebase-functions/issues/172
- https://github.com/pnpm/pnpm/issues/2198
- https://github.com/pnpm/pnpm/issues/4073
- https://github.com/Madvinking/pnpm-isolate-workspace
- https://github.com/pnpm/pnpm/issues/4378
- https://github.com/pnpm/pnpm/discussions/4237

## Motivation

Thanks to the [community](https://github.com/firebase/firebase-tools/issues/653#issuecomment-1364543750), I hope this part will make more sense for the future readers and they can choose the right approach for the right situation.

The problem that I want to solve is deploying the Firebase Cloud Functions in the CI environment. Since we only set up the CI once and CI server will handle things automatically for us.

Some important parts to make things clearer to understand how things work.

The folder structure should be like

```
root
  |- apps
    |- api
  |- packages
    |- core
  firebase.json
  pnpm-workspace.yaml
```

The `apps/api/package.json` should look like this:

```
{
  "name": "api",
  "main": "dist/index.js",
  "dependencies": {
    "firebase-functions": "^4.1.1",
    "core": "workspace:*"
  }
}
```

Explanation:

- The `apps/api` folder contains the Cloud Functions code base
- The `packages/core` is a dependency that our Cloud Functions depend on as defined in the `dependencies` field of above `apps/api/package.json`. You can read more about the `workspace` protocol here: https://pnpm.io/workspaces#referencing-workspace-packages-through-aliases

The `apps/api/package.json` explanation:

- Field `name` is MUST since it defines how module resolution works. You may familiar with pnpm command for example `pnpm install -D --filter api". The `api`is the value of the`name` field.
- Field `main` describe how NodeJS resolve your code. Let's imagine when reading the code base, NodeJS won't know where to get started if you don't tell it. Set this `main` value `dist/index.js` means "Hey NodeJS, look for the file `dist/index.js` at the same level of the `package.json` file and run it".

Now let's go to the tricky part!

## Hacky solution

Solution: https://github.com/Madvinking/pnpm-isolate-workspace

The idea is, to build all the dependencies into one single workspace with some tweaks in the `package.json` file since `firebase deploy` command does not support the pnpm `workspace:*` protocol. I tested many times in both my local environment and CI server, and as long as the `package.json` file contains the `workspace:*` protocol, it will fail even if the code is already built.

Steps:

- Build Cloud Functions locally, the output will be in `apps/api/dist`
- Change the `firebase.json` `source` field to `"source": "apps/api/_isolated_",` and remove the `predeploy` hook. The `predeploy` define what command will run **BEFORE** deploying the Cloud Functions (using `firebase deploy` command). The reason why I remove this is I already build the code base in the previous step.
- Run `pnpx pnpm-isolate-workspace api` at the root folder, it will create the folder name `_isolated_`.
- Copy build folder into new created folder `cp -r apps/api/dist apps/api/_isolated_`
- Go to the `apps/api/_isolated_` run `mv package.json package-dev.json`
- Go to the `apps/api/_isolated_` run `mv package-prod.json package.json`
- Go to the `apps/api/_isolated_` run `sed -i 's/"core\"\: \"workspace:\*\"/"core\"\: \"file\:workspaces\/packages\/core\"/g' package.json`, thanks to [this comment](https://github.com/firebase/firebase-tools/issues/653#issuecomment-827960976)
- Finally, run `firebase deploy --only functions` at the root folder

Questions?

- Why do I need to rename two `package.json` files in the `apps/api/_isolated_` folder? The main reason is is removing the `devDependencies` to reduce manual work for the next step
  - Because the `package-prod.json` does **NOT** contains the `devDependencies` and we don't need `devDependencies` for the deployment. Other than that, the `devDependencies` may contain some other packages from my other workspaces.
  - I don't know yet how to let the `firebase deploy` command using the `package-prod.json` file instead of `package.json`
- What exactly `sed` command does? Why do I need that?
  - This is the most tricky part. The `sed` command will read the file, and replace some strings with others, which is a very low level, risky, and not easy to do for everyone. That means it only makes sense when doing this in the CI server since it is isolated to your code base. You never want to see these changes in your git repository.
- Why not install `firebase-tools` as a dependency and then run something like `pnpm exec firebase deploy` in the CI server?
  - It makes sense if you run the `firebase deploy` command **from your local machine**. In the CI server, please note that I use [this](https://github.com/w9jds/firebase-action).
- What actually `w9jds/firebase-action` does and **WHY** do I need to use that?
  - The most important part is the "authentication process". To deploy Firebase Cloud Functions, "you" need to have the right permissions. For example in your local machine, you need to run the command `firebase login` before doing anything, then you need to grant access. The same thing will happen on the CI server, we need to grant the right permissions to the Google Service Account through [the `GCP_SA_KEY` key](https://github.com/w9jds/firebase-action#environment-variables). In the CI environment, **there are no browsers to let you sign in**, that's the point. So instead of manually running the command `pnpm exec firebase deploy` in the CI server, the above `w9jds/firebase-action` will handle things for you.

## Other notes

There are some problems with this approach, please don't think it's a perfect solution, and make sure you fully understand it because it's likely you may touch it again in the future, unfortunately.

- Every time my `apps/api` require another new dependency from other workspaces, I need to manually do the same thing with the `packages/core`
- The https://github.com/Madvinking/pnpm-isolate-workspace support some CLI flags that may help you reduce the manual work, better to take a look.
- To deploy the Cloud Functions, the service account needs to have some specific roles, check out the official docs: https://firebase.google.com/docs/projects/iam/permissions#functions
