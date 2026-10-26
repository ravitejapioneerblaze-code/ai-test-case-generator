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
