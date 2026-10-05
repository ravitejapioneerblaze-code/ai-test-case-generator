# Contributing

Thanks for your interest in improving AI Test Generator. Bug reports, docs fixes, new AI providers and test coverage are all welcome.

## Ways to contribute

- **Report a bug.** Open an issue with the site you ran against (if it is public), the AI provider and model, and the full terminal output.
- **Suggest a feature.** Describe the problem first, then the change you have in mind.
- **Pick up an issue.** Issues labelled `good first issue` are scoped to be doable without deep knowledge of the codebase. Leave a comment before you start so work is not duplicated.
- **Improve the docs.** Setup steps that confused you are worth fixing for the next person.

## Development setup

You need Node.js 18 or later.

```bash
git clone https://github.com/ravitejapioneerblaze-code/ai-test-case-generator.git
cd ai-test-case-generator
npm install
npx playwright install chromium
cp .env.example .env
```

Ollama is the default provider and needs no API key. If you only want to work on the code, you do not need Ollama or Java: the unit tests mock every network call.

## Project layout

| Path | Purpose |
|------|---------|
| `src/scraper.ts` | Opens the page with Playwright and collects forms, inputs, buttons, headings and links |
| `src/analyzer.ts` | Builds the prompt, calls the selected AI provider and parses the response |
| `src/generator.ts` | Turns test cases into a Playwright spec file |
| `src/index.ts` | CLI entry point that wires the steps together |
| `src/tests/` | Jest unit tests |

## Running checks

```bash
npm run typecheck   # TypeScript, no emit
npm run test:unit   # Jest unit tests
```

CI runs both on every pull request. Please make sure they pass locally first.

## Pull requests

1. Fork the repo and create a branch from `main` (`fix/escape-test-names`, `feat/gemini-provider`).
2. Keep the change focused. Several small pull requests are easier to review than one large one.
3. Add or update tests for any behaviour you change.
4. Update the README or `.env.example` if you add configuration.
5. Use a clear commit message in the imperative mood, for example `Escape quotes in generated test names`.
6. Fill in the pull request template, including how you tested the change.

## Adding an AI provider

1. Add a `callYourProvider(pageData)` function in `src/analyzer.ts` that returns the raw text of the model response.
2. Register it in the `switch` inside `analyzeAndGenerateTests`.
3. Document the new environment variables in `.env.example` and the provider table in the README.
4. Add a test in `src/tests/analyzer.test.ts` that mocks `fetch` and checks the endpoint and headers.

Response parsing is shared, so you should not need to touch `parseTestCases`.

## Code style

- TypeScript with `strict` enabled.
- Treat AI output as untrusted text. Anything that ends up in a generated file must be escaped.
- Do not commit `.env`, API keys, generated output or reports.

## Conduct

By participating you agree to follow the [Code of Conduct](CODE_OF_CONDUCT.md).
