export type ProviderEnv = Record<string, string | undefined>;

const PROVIDER_KEYS: Record<string, string> = {
  anthropic: 'ANTHROPIC_API_KEY',
  openai: 'OPENAI_API_KEY',
  gemini: 'GEMINI_API_KEY'
};

// Value shipped in .env.example. Anyone who copies the file without editing it
// would otherwise send a request that is guaranteed to be rejected.
const PLACEHOLDER_KEY = 'your_key_here';

/**
 * Validates the website address typed at the prompt.
 * Returns `true` when valid, otherwise a message to show the user.
 */
export function validateUrl(input: string): true | string {
  const value = (input ?? '').trim();
  if (!value) return 'Please enter a website address';

  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    return 'Please enter a valid website address, for example https://example.com';
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return 'Please enter a website address starting with http:// or https://';
  }

  // new URL() accepts "http:/example.com" and silently rewrites it, so the
  // double slash has to be checked on the text the user actually typed.
  if (!/^https?:\/\//i.test(value)) {
    return 'Please enter a valid website address, for example https://example.com';
  }
  return true;
}

/**
 * Throws a descriptive error when the selected AI provider needs an API key
 * that is missing, so the run fails before a browser is launched.
 */
export function assertProviderConfigured(env: ProviderEnv = process.env): void {
  const provider = (env.AI_PROVIDER || 'ollama').toLowerCase();
  const keyName = PROVIDER_KEYS[provider];
  if (!keyName) return;

  const key = (env[keyName] ?? '').trim();
  if (!key || key === PLACEHOLDER_KEY) {
    throw new Error(
      `AI_PROVIDER=${provider} requires ${keyName}. Add it to your .env file and try again.`
    );
  }
}
