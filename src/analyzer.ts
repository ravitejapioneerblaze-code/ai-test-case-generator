import { PageData } from './scraper';
import * as dotenv from 'dotenv';

dotenv.config();

export interface TestCase {
  name: string;
  description: string;
  steps: string[];
  expectedResult: string;
  priority: 'high' | 'medium' | 'low';
}

const PROMPT = (pageData: PageData) => `You are a QA Functional and Automation engineer. Analyze this web page data and generate comprehensive test cases.

Page Data:
- URL: ${pageData.url}
- Title: ${pageData.title}
- Headings: ${pageData.headings.join(', ')}
- Forms: ${JSON.stringify(pageData.forms, null, 2)}
- Buttons: ${pageData.buttons.join(', ')}
- Inputs: ${JSON.stringify(pageData.inputs, null, 2)}
- Links count: ${pageData.links.length}

Generate test cases covering:
1. Functional testing (forms, buttons, navigation)
2. Validation testing (required fields, input types)
3. UI/UX testing (headings, layout)
4. Edge cases (empty inputs, special characters)

Respond ONLY with a valid JSON array of test cases. No markdown, no explanation.
Format:
[
  {
    "name": "test name",
    "description": "what is being tested",
    "steps": ["step 1", "step 2"],
    "expectedResult": "expected outcome",
    "priority": "high" | "medium" | "low"
  }
]`;

const OLLAMA_BASE_URL = 'http://localhost:11434';

async function callOllama(pageData: PageData): Promise<string> {
  const model = process.env.OLLAMA_MODEL || 'mistral';

  let response: Response;
  try {
    response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, prompt: PROMPT(pageData), stream: false })
    });
  } catch (error) {
    const reason = (error as { cause?: { code?: string } }).cause?.code
      ?? (error as Error).message;
    throw new Error(
      `Could not connect to Ollama at ${OLLAMA_BASE_URL} (${reason}).\n` +
      `Make sure Ollama is installed and running (open the Ollama app or run "ollama serve"), ` +
      `then download the model with "ollama pull ${model}".`
    );
  }

  if (response.status === 404) {
    throw new Error(
      `Ollama could not find the model "${model}". Run "ollama pull ${model}" and try again.`
    );
  }
  if (!response.ok) throw new Error(`Ollama error: ${response.statusText}`);
  const data = await response.json() as { response: string };
  return data.response;
}

async function callAnthropic(pageData: PageData): Promise<string> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY || '',
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-5',
      max_tokens: 2000,
      messages: [{ role: 'user', content: PROMPT(pageData) }]
    })
  });
  if (!response.ok) throw new Error(`Anthropic error: ${response.statusText}`);
  const data = await response.json() as { content: { type: string; text: string }[] };
  return data.content[0].text;
}

async function callOpenAI(pageData: PageData): Promise<string> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY || ''}`
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [{ role: 'user', content: PROMPT(pageData) }]
    })
  });
  if (!response.ok) throw new Error(`OpenAI error: ${response.statusText}`);
  const data = await response.json() as { choices: { message: { content: string } }[] };
  return data.choices[0].message.content;
}

export async function analyzeAndGenerateTests(pageData: PageData): Promise<TestCase[]> {
  const provider = (process.env.AI_PROVIDER || 'ollama').toLowerCase();

  console.log(`\n🤖 Using AI provider: ${provider.toUpperCase()}`);

  let raw: string;

  switch (provider) {
    case 'anthropic': raw = await callAnthropic(pageData); break;
    case 'openai':    raw = await callOpenAI(pageData);    break;
    case 'ollama':
    default:          raw = await callOllama(pageData);    break;
  }

  return parseTestCases(raw);
}

/**
 * Turns a raw model response into a list of test cases. Models often wrap the
 * JSON in markdown fences or leave trailing commas, so this cleans the text
 * first and falls back to extracting the first JSON array it can find.
 */
export function parseTestCases(raw: string): TestCase[] {
  const cleaned = raw
    .replace(/```json|```/g, '')
    .replace(/,\s*]/g, ']')
    .replace(/,\s*}/g, '}')
    .trim();

  try {
    return JSON.parse(cleaned) as TestCase[];
  } catch {
    const match = cleaned.match(/\[[\s\S]*\]/);
    if (match) {
      try {
        return JSON.parse(match[0]) as TestCase[];
      } catch {
        throw new Error('AI returned invalid response. Please try again.');
      }
    }
    throw new Error('AI returned invalid response. Please try again.');
  }
}
