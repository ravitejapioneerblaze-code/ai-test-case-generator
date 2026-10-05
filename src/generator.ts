import * as fs from 'fs';
import * as path from 'path';
import { TestCase } from './analyzer';
import { PageData } from './scraper';

/**
 * Escapes a value so it can be embedded in a single-quoted string literal
 * inside the generated spec file. AI output is untrusted text: names such as
 * "User's login" or values containing newlines would otherwise produce a
 * spec file that does not compile.
 */
export function escapeForSingleQuotes(value: string): string {
  return String(value)
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/\r?\n/g, ' ');
}

/**
 * Collapses a value to a single line so it is safe inside a `//` comment.
 */
export function toSingleLine(value: string): string {
  return String(value).replace(/\s*[\r\n]+\s*/g, ' ').trim();
}

export function generatePlaywrightTests(
  testCases: TestCase[],
  pageData: PageData
): string {
  const url = escapeForSingleQuotes(pageData.url);
  const title = escapeForSingleQuotes(pageData.title);

  const testBlocks = testCases.map(tc => `
  test('[${escapeForSingleQuotes(tc.priority.toUpperCase())}] ${escapeForSingleQuotes(tc.name)}', async ({ page }) => {
    // ${toSingleLine(tc.description)}
    // Expected: ${toSingleLine(tc.expectedResult)}

    await page.goto('${url}');

    ${tc.steps.map(step => `// ${toSingleLine(step)}`).join('\n    ')}
    // TODO: Add assertions based on expected result
  });`).join('\n');

  return `import { test, expect } from '@playwright/test';

/**
 * AI-Generated Test Suite
 * URL: ${toSingleLine(pageData.url)}
 * Generated: ${new Date().toISOString()}
 * AI Provider: ${process.env.AI_PROVIDER || 'ollama'}
 */

test.describe('Generated tests for: ${title}', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('${url}');
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
