export const SYNC_CONCURRENCY = 3;

export async function runWithConcurrency<T>(
  items: T[],
  limit: number,
  worker: (item: T) => Promise<void>
): Promise<void> {
  let index = 0;

  async function run() {
    while (index < items.length) {
      const item = items[index++];
      await worker(item);
    }
  }

  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, run));
}
