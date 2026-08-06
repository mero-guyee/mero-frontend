const mutationQueue = new Map<string, Promise<void>>();

export function enqueueMutation(id: string, task: () => Promise<void>): Promise<void> {
  const prev = mutationQueue.get(id) ?? Promise.resolve();
  const next = prev.then(task, task).finally(() => {
    const isLastTask = mutationQueue.get(id) === next;
    if (isLastTask) {
      mutationQueue.delete(id);
    }
  });

  mutationQueue.set(id, next);
  return next;
}
