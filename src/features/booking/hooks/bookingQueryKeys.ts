export const bookingQueryKeys = {
  all: (slug: string) => ["bookinger", slug] as const,
  slots: (slug: string, baneId: string, dato: string) =>
    [...bookingQueryKeys.all(slug), baneId, dato] as const,
  mine: (slug: string) => ["mineBookinger", slug] as const,
};
