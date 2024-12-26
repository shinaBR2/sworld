# Go live

## Environment variables

These only capable for private repository in Github
Required github secrets

- `DOCKERHUB_TOKEN`
- `GH_ACTIONS_MY_WORLD_DEV` service account for dev
- `GH_ACTIONS_SWORLD` service account for prod

Enviornment variables will be set by GCP Console in the first time deploy Cloud Run

- `NOCODB_IP`
- `DATABASE_URL`
- `NOCODB_WEBHOOK_SIGNATURE`
- `GCP_STORAGE_BUCKET`

## Service account

For deploy Cloud Run, github action service account requires following roles

- `Service Account User`
- `Cloud Run Admin`

For run time of Cloud Run, the Cloud Run service account requires following roles

- `Service Account User`
