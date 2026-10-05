import { generatePlaywrightTests } from '../generator';
import { saveTestFile } from '../generator';
import { PageData } from '../scraper';

const mockPageData: PageData = {
  url: 'https://example.com',
  title: 'Example Domain',
  forms: [],
  buttons: ['Submit', 'Cancel'],
  links: ['https://example.com/about'],
  headings: ['Welcome', 'About Us'],
  inputs: [
    {
      type: 'text',
      name: 'username',
      placeholder: 'Enter username',
      required: true
    }
  ]
};

const mockTestCases = [
  {
    name: 'Button visibility test',
    description: 'Verify buttons are visible',
    steps: ['Navigate to page', 'Check button visibility'],
    expectedResult: 'All buttons are visible',
    priority: 'high' as const
  },
  {
    name: 'Input field validation',
    description: 'Verify input fields work',
    steps: ['Navigate to page', 'Fill input field'],
    expectedResult: 'Input accepts text',
    priority: 'medium' as const
  }
];

describe('generatePlaywrightTests', () => {
  test('should generate valid test content', () => {
    const content = generatePlaywrightTests(mockTestCases, mockPageData);
    expect(content).toContain('import { test, expect }');
    expect(content).toContain('https://example.com');
    expect(content).toContain('Button visibility test');
    expect(content).toContain('Input field validation');
  });

  test('should include all test cases', () => {
    const content = generatePlaywrightTests(mockTestCases, mockPageData);
    expect(content).toContain('[HIGH]');
    expect(content).toContain('[MEDIUM]');
  });

  test('should include beforeEach hook', () => {
    const content = generatePlaywrightTests(mockTestCases, mockPageData);
    expect(content).toContain('beforeEach');
  });
});
describe('generatePlaywrightTests with untrusted AI output', () => {
  const trickyCases = [
    {
      name: "User's login can't fail",
      description: 'Line one\nline two',
      steps: ['Open the page\nthen wait', "Click 'Sign in'"],
      expectedResult: 'Redirect happens\n// not a comment injection',
      priority: 'high' as const
    }
  ];

  test('escapes single quotes in test names', () => {
    const content = generatePlaywrightTests(trickyCases, mockPageData);
    expect(content).toContain("test('[HIGH] User\\'s login can\\'t fail'");
  });

  test('keeps multi-line text inside comments', () => {
    const content = generatePlaywrightTests(trickyCases, mockPageData);
    expect(content).toContain('// Line one line two');
    expect(content).toContain('// Expected: Redirect happens // not a comment injection');
  });

  test('escapes quotes in page titles and URLs', () => {
    const content = generatePlaywrightTests([], {
      ...mockPageData,
      title: "Bob's Page",
      url: "https://example.com/?q=it's"
    });
    expect(content).toContain("Generated tests for: Bob\\'s Page");
    expect(content).toContain("page.goto('https://example.com/?q=it\\'s')");
  });

  test('produces a spec file that parses as valid TypeScript', () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const ts = require('typescript');
    const content = generatePlaywrightTests(trickyCases, mockPageData);
    const result = ts.transpileModule(content, { reportDiagnostics: true });
    expect(result.diagnostics).toHaveLength(0);
  });
});
