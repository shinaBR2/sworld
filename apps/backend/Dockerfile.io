# Build context is the MONOREPO ROOT, not apps/backend:
#   docker build -f apps/backend/Dockerfile.io .
FROM --platform=linux/amd64 node:24.18.0-slim

# Install procps package to provide the 'ps' command
# (required for the PlaywrightCrawler)
RUN apt-get update && \
    apt-get install -y procps && \
    rm -rf /var/lib/apt/lists/*

# pnpm at the exact version pinned in the root package.json `packageManager`.
ENV PNPM_HOME="/pnpm" \
    PATH="/pnpm:$PATH"
RUN corepack enable

WORKDIR /app

# Manifests first so the install layer is only rebuilt when a dependency changes.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/backend/package.json apps/backend/
COPY packages/core/package.json packages/core/
COPY packages/tsconfig/package.json packages/tsconfig/

RUN pnpm install --frozen-lockfile --filter backend...

# Install the chromium build Playwright expects, plus its system libraries.
RUN pnpm --filter backend exec playwright install --with-deps chromium

# There is no build step: the service runs `tsx` over TypeScript SOURCE, and the
# backend tsconfig maps `core`/`core/*` to ../../packages/core/src — so core's
# source must sit at its workspace-relative path inside the image.
COPY apps/backend apps/backend
COPY packages/core packages/core

WORKDIR /app/apps/backend

EXPOSE 4000
CMD ["npm", "run", "start-io", "--", "--listen", "0.0.0.0"]
