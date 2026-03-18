export const tripKeys = {
  all: ['trips'] as const,
  detail: (id: string) => ['trips', id] as const,
};

export const memoKeys = {
  all: ['memos'] as const,
  byTrip: (tripId: string) => ['memos', tripId] as const,
  detail: (memoId: number) => ['memos', memoId] as const,
};
