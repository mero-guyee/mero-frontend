interface RetryOptions {
  retries?: number;
  delayMs?: number;
  timeoutMs?: number;
}

export default async function retryAsync(
  asyncFunc: () => Promise<any>,
  retryOptions: RetryOptions = {}
): Promise<any> {
  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
  const { retries = 5, delayMs = 500, timeoutMs } = retryOptions;

  let lastError: unknown;
  let lastAttemptStart = 0;

  for (let attempt = 1; attempt <= retries; attempt++) {
    lastAttemptStart = Date.now();
    try {
      const result = timeoutMs
        ? await Promise.race([
            asyncFunc(),
            new Promise<never>((_, reject) =>
              setTimeout(() => reject(new Error('retryAsync: timeout')), timeoutMs)
            ),
          ])
        : await asyncFunc();
      return result;
    } catch (error) {
      lastError = error;

      if (attempt < retries) {
        await sleep(delayMs);
      }
    }
  }

  if (timeoutMs) {
    const elapsed = Date.now() - lastAttemptStart;
    if (elapsed < timeoutMs) await sleep(timeoutMs - elapsed);
  }

  throw lastError;
}
