/**
 * Prints a fatal error in a readable form and marks the process as failed,
 * so scripts and CI can detect that the run did not succeed.
 */
export function reportFatalError(error: unknown): void {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`\n❌ ${message}`);
  process.exitCode = 1;
}
