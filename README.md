# AI Test Case Generator

An AI-powered test case generator that automatically analyzes web pages 
and generates comprehensive test cases using Claude AI, Playwright, 
and axe-core.

## Purpose

Manual test case creation is time-consuming and often incomplete. 
This tool analyzes any web page and generates structured, actionable 
test cases covering functional testing, accessibility compliance, 
UI validation, edge cases, and API testing.

Built to improve software quality for government, healthcare, and 
insurance web applications serving millions of Americans.

## Features

- AI-powered page analysis using Claude API for intelligent test generation
- Integrated axe-core scanning for WCAG 2.1 and Section 508 compliance
- Playwright automation for capturing page structure and interactions
- Multiple output formats: JSON, Markdown, and Playwright test scripts
- Tested against US federal government websites and USWDS components

## Tech Stack

- Claude API (Anthropic)
- Playwright
- axe-core
- Node.js / TypeScript

## Installation

```bash
git clone https://github.com/ravitejapioneerblaze-code/ai-test-case-generator.git
cd ai-test-case-generator
npm install
```

## Configuration

Create a `.env` file in the root directory:

```env
ANTHROPIC_API_KEY=your_claude_api_key_here
```

## Usage

```bash
# Generate test cases for any URL
npm run generate -- --url https://example.com

# Generate with accessibility focus
npm run generate -- --url https://example.com --mode accessibility

# Output as Playwright test script
npm run generate -- --url https://example.com --output playwright
```

## Output Example

```json
{
  "url": "https://example.com",
  "generated_at": "2026-05-23",
  "test_cases": [
    {
      "id": "TC001",
      "category": "Functional",
      "title": "Verify navigation menu is accessible via keyboard",
      "steps": [
        "Navigate to the page",
        "Press Tab key to focus on navigation",
        "Verify all menu items are reachable via keyboard"
      ],
      "expected_result": "All navigation items accessible via keyboard",
      "wcag_criteria": "2.1.1"
    }
  ]
}
```

## Target Applications

- US federal government websites (USWDS, VA.gov, CMS, Login.gov)
- Healthcare and insurance portals
- Any public-facing web application

## Contributing

Contributions are welcome. Please submit a pull request with a 
clear description of the change and any relevant test coverage.

## License

MIT

## Author

Raviteja Doppalapudi  
Senior QA Automation and AI Engineer  
github.com/ravitejapioneerblaze-code