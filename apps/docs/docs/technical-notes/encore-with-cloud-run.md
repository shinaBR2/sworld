---
sidebar_position: 11
---

# Using encore-dev with Cloud Run

Few notes

- Cloud Run only allow to run API, does not support the dashboard because it's a serverless solution
- The dashboard is a tool build by encore platform with require a self-hosted infrastructure like VM or Kubernetes cluster

## Commands

```
# RUN AT THE ROOT FOLDER

docker buildx create --driver docker-container --use

# Build and push into dockerhub
# Support multiple platform Linux and Mac M2
docker buildx build --debug --platform linux/amd64,linux/arm64 --push -t shinabr2/sworld-backend:1.3.0 -f apps/backend/Dockerfile .
docker buildx build --progress=plain --no-cache --debug --platform linux/amd64,linux/arm64 --push -t shinabr2/sworld-backend:1.3.0 -f apps/backend/Dockerfile .

# DIDN'T WORK
docker buildx build --progress=plain --no-cache --debug --platform linux/amd64,linux/arm64 --push --load -t shinabr2/sworld-backend:1.3.0 -f apps/backend/Dockerfile .



# Test locally
docker pull shinabr2/sworld-backend:1.3.0

docker run -p 4000:4000 shinabr2/sworld-backend:1.3.0

gcloud run deploy sworld-backend \
  --image docker.io/shinabr2/sworld-backend:1.3.0 \
  --platform managed \
  --port 4000 \
  --region asia-southeast1 \
  --allow-unauthenticated
```

curl http://0.0.0.0:4000/videos/test-users
