---
sidebar_position: 9
---

# Setup Firebase with turbo repo

## Goal

- One Firebase project with multiple sites
- Two environments: dev and production
- Cloud Functions shared across apps
- Automated deployment via GitHub Actions

## First! Setup Firebase project

- Create a new Firebase project
- Create two project aliases:
  - dev: for development/testing
  - production: for live environment

## Project Structure

Simplified structure for demonstration

```plaintext
my-turborepo/
├── apps/
│   ├── listen/
│   └── admin/
├── packages/
│   └── core/
│   └── ui/
├── firebase.json
└── .firebaserc
```

## Configure .firebaserc

```json
{
  "projects": {
    "default": "my-world-dev",
    "dev": "my-world-dev",
    "prod": "sworld-prod"
  },
  "targets": {
    "my-world-dev": {
      "hosting": {
        "listen": ["shinabr2-listen-dev"],
        "admin": ["shinabr2-admin-dev"]
      }
    },
    "sworld-prod": {
      "hosting": {
        "listen": ["sworld-listen"],
        "admin": ["sworld-admin"]
      }
    }
  },
  "etags": {}
}
```

## Configure firebase.json

```json
{
  "functions": {
    "source": "apps/api",
    "runtime": "nodejs18",
    "ignore": [
      "node_modules",
      ".git",
      "firebase-debug.log",
      "firebase-debug.*.log"
    ]
  },
  "firestore": {
    "rules": "firestore.rules"
  },
  "hosting": [
    {
      "target": "listen",
      "public": "dist",
      "ignore": ["firebase.json", "**/.*", "**/node_modules/**"]
    },
    {
      "target": "admin",
      "public": "dist",
      "ignore": ["firebase.json", "**/.*", "**/node_modules/**"]
    }
  ],
  "emulators": {
    "auth": {
      "port": 9099
    },
    "functions": {
      "port": 5001
    },
    "database": {
      "port": 9000
    },
    "hosting": {
      "port": 5000
    },
    "storage": {
      "port": 9199
    },
    "ui": {
      "enabled": true
    },
    "firestore": {
      "port": 8080
    },
    "singleProjectMode": true
  },
  "storage": {
    "rules": "storage.rules"
  }
}
```

## GitHub Actions Deployment

### 1. Create Environment Secrets

Add these repository secrets:

- `FIREBASE_SERVICE_ACCOUNT_MY_WORLD_DEV`: Service account for dev environment
- `FIREBASE_SERVICE_ACCOUNT_SWORLD_PROD`: Service account for production environment

Add these Environment secrets (for each environment):

- `VITE_API_KEY`
- `VITE_APP_ID`
- `VITE_AUTH_DOMAIN`
- `VITE_MEASUREMENT_ID`
- `VITE_MESSAGING_SENDER_ID`
- `VITE_PROJECT_ID`
- `VITE_STORAGE_BUCKET`

### 2. Hack to deploy Firebase Cloud Functions via Github Action

The full workflow file at `.github/workflows/api-dev.yml`. The hack part is

```bash
- id: isolate_build
  name: Isolate build
  run: pnpx pnpm-isolate-workspace api

- id: copy_build_to_isolate_folder
  name: Copy build to isolate folder
  run: cp -r apps/api/dist apps/api/_isolated_

- id: fix_firebase_json
  name: Change firebase.json build to isolated
  run: |
    sed -i 's/"source\"\: \"apps\/api"/"source\"\: \"apps\/api\/_isolated_\"/g' firebase.json

- id: fix_package_json
  name: Fix package.json
  run: |
    mv apps/api/_isolated_/package.json apps/api/_isolated_/package-dev.json
    mv apps/api/_isolated_/package-prod.json apps/api/_isolated_/package.json
    sed -i 's/"core\"\: \"workspace:\*\"/"core\"\: \"file\:workspaces\/packages\/core\"/g' apps/api/_isolated_/package.json
```

Explanation:

- We put Cloud Functions code at `apps/api` folder
- At this moment, Firebase deploy does not support monorepo and PNPM
- Firebase deploy expect having `.firebaserc`, `firebase.json`
- Solution is build and copy the built into an `_isolated_` folder
- `pnpm` `workspace:*` protocol does not work, fixed by this hacky line

  ```
  sed -i 's/"core\"\: \"workspace:\*\"/"core\"\: \"file\:workspaces\/packages\/core\"/g' apps/api/_isolated_/package.json
  ```

- Done

### 3. Deploy other Firebase sites

#### The problem

When deploying multiple apps from a monorepo to Firebase Hosting, we encountered several challenges:

1. Firebase CLI expects configuration files (`.firebaserc` and `firebase.json`) to be in the same directory as the app being deployed
2. GitHub Actions deployment needs these files to be in the app directory when using `FirebaseExtended/action-hosting-deploy`
3. Different apps might need different Firebase configurations

#### Our Solution

We maintain Firebase configurations at both the root and app level

```plaintext
my-turborepo/
├── .firebaserc                # Root config (template)
├── firebase.json              # Root config (template)
├── apps/
│   ├── listen/
│   │   ├── .firebaserc       # Copied from root with web-specific configs
│   │   ├── firebase.json     # Copied from root with web-specific configs
│   │   └── src/
│   └── admin/
│       ├── .firebaserc       # Copied from root with admin-specific configs
│       ├── firebase.json     # Copied from root with admin-specific configs
│       └── src/
```

Put this inside each Github action workflow file for automation copy

```yml
- name: Copy .firebaserc file
  run: cp .firebaserc apps/admin/.firebaserc
- name: Copy firebase.json file
  run: cp firebase.json apps/admin/firebase.json
```

> **IMPORTANT!**
> In `firebase.json` file, the `public` should be relative to the `apps/*` folder, not the root folder

```json
"hosting": [
  {
    "target": "admin",
    "public": "dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ]
  },
  // other sites
],
```

#### Why This Approach?

Single source of truth for firebase configurations since all apps are only one Firebase project
