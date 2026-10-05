import { analyzeAndGenerateTests, parseTestCases } from '../analyzer';
import { PageData } from '../scraper';

const pageData: PageData = {
  url: 'https://example.com',
  title: 'Example Domain',
  forms: [],
  buttons: ['Submit'],
  links: [],
  headings: ['Welcome'],
  inputs: []
};

const sampleCases = [
  {
    name: 'Submit button is visible',
    description: 'Checks the submit button renders',
    steps: ['Open the page', 'Look for the button'],
    expectedResult: 'Button is visible',
    priority: 'high'
  }
];

describe('parseTestCases', () => {
  test('parses a plain JSON array', () => {
    expect(parseTestCases(JSON.stringify(sampleCases))).toEqual(sampleCases);
  });

  test('strips markdown code fences', () => {
    const raw = '```json\n' + JSON.stringify(sampleCases) + '\n```';
    expect(parseTestCases(raw)).toEqual(sampleCases);
  });

  test('tolerates trailing commas', () => {
    const raw = '[{"name":"a","description":"b","steps":["c",],"expectedResult":"d","priority":"low",},]';
    const result = parseTestCases(raw);
    expect(result).toHaveLength(1);
    expect(result[0].steps).toEqual(['c']);
  });

  test('extracts the array when the model adds surrounding text', () => {
    const raw = 'Here are your tests:\n' + JSON.stringify(sampleCases) + '\nHope that helps!';
    expect(parseTestCases(raw)).toEqual(sampleCases);
  });

  test('throws when no array can be recovered', () => {
    expect(() => parseTestCases('Sorry, I cannot help with that.')).toThrow(
      'AI returned invalid response'
    );
  });

  test('throws when the extracted array is malformed', () => {
    expect(() => parseTestCases('[ { "name": ')).toThrow('AI returned invalid response');
  });
});

describe('analyzeAndGenerateTests provider routing', () => {
  const originalEnv = { ...process.env };
  let fetchMock: jest.SpyInstance;

  const mockResponse = (body: unknown, ok = true) =>
    ({
      ok,
      statusText: ok ? 'OK' : 'Internal Server Error',
      json: async () => body
    }) as Response;

  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
    fetchMock = jest.spyOn(global, 'fetch');
  });

  afterEach(() => {
    jest.restoreAllMocks();
    process.env = { ...originalEnv };
  });

  test('uses Ollama by default', async () => {
    delete process.env.AI_PROVIDER;
    fetchMock.mockResolvedValue(mockResponse({ response: JSON.stringify(sampleCases) }));

    const result = await analyzeAndGenerateTests(pageData);

    expect(result).toEqual(sampleCases);
    expect(fetchMock.mock.calls[0][0]).toBe('http://localhost:11434/api/generate');
  });

  test('calls the Anthropic API when configured', async () => {
    process.env.AI_PROVIDER = 'anthropic';
    process.env.ANTHROPIC_API_KEY = 'test-key';
    fetchMock.mockResolvedValue(
      mockResponse({ content: [{ type: 'text', text: JSON.stringify(sampleCases) }] })
    );

    const result = await analyzeAndGenerateTests(pageData);

    expect(result).toEqual(sampleCases);
    expect(fetchMock.mock.calls[0][0]).toBe('https://api.anthropic.com/v1/messages');
    const headers = (fetchMock.mock.calls[0][1] as RequestInit).headers as Record<string, string>;
    expect(headers['x-api-key']).toBe('test-key');
  });

  test('calls the OpenAI API when configured', async () => {
    process.env.AI_PROVIDER = 'openai';
    process.env.OPENAI_API_KEY = 'test-key';
    fetchMock.mockResolvedValue(
      mockResponse({ choices: [{ message: { content: JSON.stringify(sampleCases) } }] })
    );

    const result = await analyzeAndGenerateTests(pageData);

    expect(result).toEqual(sampleCases);
    expect(fetchMock.mock.calls[0][0]).toBe('https://api.openai.com/v1/chat/completions');
  });

  test('surfaces provider errors', async () => {
    process.env.AI_PROVIDER = 'ollama';
    fetchMock.mockResolvedValue(mockResponse({}, false));

    await expect(analyzeAndGenerateTests(pageData)).rejects.toThrow('Ollama error');
  });
});
