import { reportFatalError } from '../errors';

describe('reportFatalError', () => {
  let errorSpy: jest.SpyInstance;
  const originalExitCode = process.exitCode;

  beforeEach(() => {
    errorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    process.exitCode = undefined;
  });

  afterEach(() => {
    errorSpy.mockRestore();
    process.exitCode = originalExitCode;
  });

  test('sets a non-zero exit code', () => {
    reportFatalError(new Error('boom'));
    expect(process.exitCode).toBe(1);
  });

  test('prints the error message without a stack trace', () => {
    reportFatalError(new Error('Could not connect to Ollama'));
    const output = errorSpy.mock.calls[0][0] as string;
    expect(output).toContain('Could not connect to Ollama');
    expect(output).not.toContain('at ');
  });

  test('handles values that are not Error objects', () => {
    reportFatalError('plain string failure');
    expect(errorSpy.mock.calls[0][0]).toContain('plain string failure');
    expect(process.exitCode).toBe(1);
  });
});
