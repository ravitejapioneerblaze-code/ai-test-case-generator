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

async function callOllama(pageData: PageData): Promise<string> {
  const model = process.env.OLLAMA_MODEL || 'mistral';
  const response = await fetch('http://localhost:11434/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, prompt: PROMPT(pageData), stream: false })
  });
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