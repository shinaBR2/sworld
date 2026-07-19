import { defineConfig, devices } from '@playwright/test';

const isCI = !!process.env.CI;
const port = 4000;
const baseURL = `http://localhost:${port}`;

// Runs against a locally-built, locally-served bundle (see the `build:e2e` /
// `preview:e2e` scripts) — no deployed environment and no real backend. The build
// bakes in fixed VITE_* values that the auth/API mocks in e2e/support match.
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 1 : undefined,
  reporter: isCI ? [['dot'], ['html', { open: 'never' }]] : [['list']],
  use: {
    baseURL,
    // Pinned so date rendering (formatDate) is deterministic across machines.
    timezoneId: 'UTC',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'pnpm run build:e2e && pnpm run preview:e2e',
    url: baseURL,
    reuseExistingServer: !isCI,
    timeout: 180_000,
  },
});
