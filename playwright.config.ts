import { defineConfig } from '@playwright/test';
import * as dotenv from 'dotenv';

dotenv.config();

const aiProvider = process.env.AI_PROVIDER;
const aiModel = process.env.OLLAMA_MODEL || process.env.ANTHROPIC_MODEL || process.env.OPENAI_MODEL;

export default defineConfig({
  testDir: './output',
  reporter: [
    ['line'],
    ['allure-playwright', {
      detail: true,
      outputFolder: 'allure-results',
      suiteTitle: true,
      environmentInfo: {
        AI_Provider: aiProvider,
        AI_Model: aiModel,
        Framework: 'Playwright',
        Language: 'TypeScript',
        Node_Version: process.version,
        Platform: process.platform,
        Report: 'Test Run Report'
      }
    }]
  ],
  use: {
    screenshot: 'on',
    video: 'on',
    trace: 'on'
  }
});