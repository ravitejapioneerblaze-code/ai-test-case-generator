import { validateUrl } from '../validation';

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
