---
sidebar_position: 9
---

# Setup Firebase with turbo repo

## Goal

Create a Firebase deployment setup with:

- Single Firebase project
- Two environments (development and production)
- Multiple hosting sites in `apps/*` folders
- Cloud Functions in `apps/api` folder
- Streamlined development and CI/CD using GitHub Actions

## Challenges & Solutions

### 1. Project Structure Configuration

**Challenge:** Maintaining single source of truth for Firebase configuration files.

**Solution:**

- Keep `firebase.json` and `.firebaserc` in root folder as templates
- Copy these files to specific app folders during deployment

### 2. Firebase Cloud Functions Setup

**Challenge:** Firebase Cloud Functions lacks native monorepo support and doesn't work with pnpm's `workspace:*` protocol ([Issue #653](https://github.com/firebase/firebase-tools/issues/653)).

#### Local development

Configure `firebase.json`:

```json
{
  "functions": {
    "source": "apps/api/dist" // IMPORTANT! Points to TypeScript output
  }
}
```

#### Deployment Process

1. Create `firebase-for-deploy.json` in apps/api with `source": "."`
2. Process `apps/api/package.json`:

- Copy to `apps/api/dist`
- Build all dependencies
- Convert workspace dependencies:

  ```json
  // Before
  {
    "dependencies": {
      "core": "workspace:*"
    }
  }

  // After
  {
    "dependencies": {
      "core": "file:./core"
    }
  }
  ```

- Remove `devDependencies`
- Copy `firebase-for-deploy.json` to `dist/firebase.json`

### 3. Firebase Hosting Configuration

Project Structure:

```
my-turborepo/
├── .firebaserc                # Root template
├── firebase.json              # Root template
├── apps/
│   ├── listen/
│   │   ├── .firebaserc       # Copied for deployment
│   │   ├── firebase.json     # Copied for deployment
│   │   └── src/
│   └── admin/
│       ├── .firebaserc       # Copied for deployment
│       ├── firebase.json     # Copied for deployment
│       └── src/
```

**Important**: In firebase.json, use relative paths for public directory:

```json
{
  "hosting": [
    {
      "public": "dist" // Relative to apps/* folder
    }
  ]
}
```

GitHub Actions Configuration:

```
- name: Copy Firebase configs
  run: |
    cp .firebaserc apps/admin/.firebaserc
    cp firebase.json apps/admin/firebase.json
```

## Setup Instructions

### 1. Firebase Project Setup

- Create new Firebase project
- Set up project aliases:
  - `dev` for development/testing
  - `production` for live environment

### 2. GitHub Actions Configuration

#### Environment Secrets

1. Repository Secrets:

- `FIREBASE_SERVICE_ACCOUNT_MY_WORLD_DEV`: Service account for dev environment
- `FIREBASE_SERVICE_ACCOUNT_SWORLD_PROD`: Service account for production environment

2. Environment Secrets (per environment):

- `VITE_API_KEY`
- `VITE_APP_ID`
- `VITE_AUTH_DOMAIN`
- `VITE_MEASUREMENT_ID`
- `VITE_MESSAGING_SENDER_ID`
- `VITE_PROJECT_ID`
- `VITE_STORAGE_BUCKET`

### Deployment Strategy

- Independent deployments per site
- Triggered by changes in main branch
- Uses Firebase Hosting preview channels for pre-deployment testing
- Cloud Functions deployment handled via custom script (apps/api/scripts/prepare-deploy.ts). The deployment script avoids external dependencies for better long-term maintainability.
