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