import * as fs from 'fs';
import * as path from 'path';
import { TestCase } from './analyzer';
import { PageData } from './scraper';

export function generatePlaywrightTests(
  testCases: TestCase[],
  pageData: PageData
): string {
  const testBlocks = testCases.map(tc => `
  test('[${tc.priority.toUpperCase()}] ${tc.name}', async ({ page }) => {
    // ${tc.description}
    // Expected: ${tc.expectedResult}

    await page.goto('${pageData.url}');

    ${tc.steps.map(step => `// ${step}`).join('\n    ')}
    // TODO: Add assertions based on expected result
  });`).join('\n');
    

  return `import { test, expect } from '@playwright/test';

  /**
 * AI-Generated Test Suite
 * URL: ${pageData.url}
 * Generated: ${new Date().toISOString()}
 * AI Provider: ${process.env.AI_PROVIDER || 'ollama'}
 */

test.describe('Generated tests for: ${pageData.title}', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('${pageData.url}');
  });
${testBlocks}
});
`;
}

export function saveTestFile(content: string, pageData: PageData): string {
  const outputDir = path.join(process.cwd(), 'output');

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const safeName = pageData.url
    .replace(/https?:\/\//, '')
    .replace(/[^a-zA-Z0-9]/g, '_')
    .substring(0, 50);

  const fileName = `${safeName}.spec.ts`;
  const filePath = path.join(outputDir, fileName);

  fs.writeFileSync(filePath, content, 'utf-8');
  return filePath;
}