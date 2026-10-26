import { assertProviderConfigured, validateUrl } from '../validation';

describe('validateUrl', () => {
  test.each([
    'https://example.com',
    'http://example.com',
    'https://example.com/path?q=1#section',
    'http://localhost:3000',
    '  https://example.com  '
  ])('accepts %s', input => {
    expect(validateUrl(input)).toBe(true);
  });

  test('asks for an address when the input is empty', () => {
    expect(validateUrl('')).toBe('Please enter a website address');
    expect(validateUrl('   ')).toBe('Please enter a website address');
  });

  test.each(['httpfoo', 'http:/bad', 'example.com', 'not a url'])(
    'rejects malformed address %s',
    input => {
      expect(validateUrl(input)).toContain('valid website address');
    }
  );

  test.each(['ftp://example.com', 'file:///etc/passwd', 'javascript:alert(1)'])(
    'rejects non-web protocol %s',
    input => {
      expect(validateUrl(input)).toContain('http:// or https://');
    }
  );
});

describe('assertProviderConfigured', () => {
  test('does not require a key for Ollama, including the default provider', () => {
    expect(() => assertProviderConfigured({ AI_PROVIDER: 'ollama' })).not.toThrow();
    expect(() => assertProviderConfigured({})).not.toThrow();
  });

  test.each([
    ['anthropic', 'ANTHROPIC_API_KEY'],
    ['openai', 'OPENAI_API_KEY'],
    ['gemini', 'GEMINI_API_KEY']
  ])('requires %s to have %s', (provider, keyName) => {
    expect(() => assertProviderConfigured({ AI_PROVIDER: provider })).toThrow(keyName);
    expect(() =>
      assertProviderConfigured({ AI_PROVIDER: provider, [keyName]: '   ' })
    ).toThrow(keyName);
  });

  test('treats the .env.example placeholder as missing', () => {
    expect(() =>
      assertProviderConfigured({ AI_PROVIDER: 'openai', OPENAI_API_KEY: 'your_key_here' })
    ).toThrow('OPENAI_API_KEY');
  });

  test('accepts a configured key and ignores provider name casing', () => {
    expect(() =>
      assertProviderConfigured({ AI_PROVIDER: 'Anthropic', ANTHROPIC_API_KEY: 'sk-test' })
    ).not.toThrow();
  });
});
