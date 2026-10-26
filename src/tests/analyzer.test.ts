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
    delete process.env.OLLAMA_URL;
    fetchMock.mockResolvedValue(mockResponse({ response: JSON.stringify(sampleCases) }));

    const result = await analyzeAndGenerateTests(pageData);

    expect(result).toEqual(sampleCases);
    expect(fetchMock.mock.calls[0][0]).toBe('http://localhost:11434/api/generate');
  });

  test('uses OLLAMA_URL for the request when set', async () => {
    process.env.AI_PROVIDER = 'ollama';
    process.env.OLLAMA_URL = 'http://ollama.internal:8080';
    fetchMock.mockResolvedValue(mockResponse({ response: JSON.stringify(sampleCases) }));

    await analyzeAndGenerateTests(pageData);

    expect(fetchMock.mock.calls[0][0]).toBe('http://ollama.internal:8080/api/generate');
  });

  test('ignores a trailing slash in OLLAMA_URL', async () => {
    process.env.AI_PROVIDER = 'ollama';
    process.env.OLLAMA_URL = 'http://ollama.internal:8080/';
    fetchMock.mockResolvedValue(mockResponse({ response: JSON.stringify(sampleCases) }));

    await analyzeAndGenerateTests(pageData);

    expect(fetchMock.mock.calls[0][0]).toBe('http://ollama.internal:8080/api/generate');
  });

  test('falls back to the default address when OLLAMA_URL is blank', async () => {
    process.env.AI_PROVIDER = 'ollama';
    process.env.OLLAMA_URL = '   ';
    fetchMock.mockResolvedValue(mockResponse({ response: JSON.stringify(sampleCases) }));

    await analyzeAndGenerateTests(pageData);

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

  test('calls the Gemini API when configured', async () => {
    process.env.AI_PROVIDER = 'gemini';
    process.env.GEMINI_API_KEY = 'test-key';
    process.env.GEMINI_MODEL = 'gemini-test-model';
    fetchMock.mockResolvedValue(
      mockResponse({
        candidates: [{ content: { parts: [{ text: JSON.stringify(sampleCases) }] } }]
      })
    );

    const result = await analyzeAndGenerateTests(pageData);

    expect(result).toEqual(sampleCases);
    expect(fetchMock.mock.calls[0][0]).toBe(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-test-model:generateContent'
    );
    const headers = (fetchMock.mock.calls[0][1] as RequestInit).headers as Record<string, string>;
    expect(headers['x-goog-api-key']).toBe('test-key');
  });

  test('joins multiple Gemini response parts', async () => {
    process.env.AI_PROVIDER = 'gemini';
    process.env.GEMINI_API_KEY = 'test-key';
    const json = JSON.stringify(sampleCases);
    fetchMock.mockResolvedValue(
      mockResponse({
        candidates: [{ content: { parts: [{ text: json.slice(0, 20) }, { text: json.slice(20) }] } }]
      })
    );

    await expect(analyzeAndGenerateTests(pageData)).resolves.toEqual(sampleCases);
  });

  test('fails clearly when the Gemini API key is missing', async () => {
    process.env.AI_PROVIDER = 'gemini';
    delete process.env.GEMINI_API_KEY;

    await expect(analyzeAndGenerateTests(pageData)).rejects.toThrow('GEMINI_API_KEY is not set');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  test('reports an empty Gemini response', async () => {
    process.env.AI_PROVIDER = 'gemini';
    process.env.GEMINI_API_KEY = 'test-key';
    fetchMock.mockResolvedValue(mockResponse({ candidates: [] }));

    await expect(analyzeAndGenerateTests(pageData)).rejects.toThrow('Gemini returned an empty response');
  });

  test('explains how to start Ollama when the connection is refused', async () => {
    process.env.AI_PROVIDER = 'ollama';
    process.env.OLLAMA_MODEL = 'mistral';
    const networkError = Object.assign(new TypeError('fetch failed'), {
      cause: { code: 'ECONNREFUSED' }
    });
    fetchMock.mockRejectedValue(networkError);

    const promise = analyzeAndGenerateTests(pageData);

    await expect(promise).rejects.toThrow('Could not connect to Ollama');
    await expect(promise).rejects.toThrow('ECONNREFUSED');
    await expect(promise).rejects.toThrow('ollama pull mistral');
  });

  test('shows the configured Ollama address in the connection error', async () => {
    process.env.AI_PROVIDER = 'ollama';
    process.env.OLLAMA_URL = 'http://ollama.internal:8080';
    fetchMock.mockRejectedValue(new TypeError('fetch failed'));

    await expect(analyzeAndGenerateTests(pageData)).rejects.toThrow(
      'Could not connect to Ollama at http://ollama.internal:8080'
    );
  });

  test('tells the user to pull the model when Ollama returns 404', async () => {
    process.env.AI_PROVIDER = 'ollama';
    process.env.OLLAMA_MODEL = 'llama3';
    fetchMock.mockResolvedValue({ ...mockResponse({}, false), status: 404 } as Response);

    await expect(analyzeAndGenerateTests(pageData)).rejects.toThrow('ollama pull llama3');
  });

  test('surfaces provider errors', async () => {
    process.env.AI_PROVIDER = 'ollama';
    fetchMock.mockResolvedValue(mockResponse({}, false));

    await expect(analyzeAndGenerateTests(pageData)).rejects.toThrow('Ollama error');
  });
});
