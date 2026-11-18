import { existsSync } from 'node:fs';
import { defineConfig } from '@playwright/test';

const systemChromium = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
].find((path) => existsSync(path));
const executablePath = process.env['PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH'] ?? systemChromium;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  timeout: 60_000,
  reporter: 'list',
  use: {
    baseURL: 'http://127.0.0.1:3000',
    headless: true,
    launchOptions: executablePath ? { executablePath } : {},
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'npm run dev -- --host 127.0.0.1 --port 3000 --strictPort',
    url: 'http://127.0.0.1:3000',
    reuseExistingServer: !process.env['CI'],
    timeout: 60_000,
  },
});
