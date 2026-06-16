/**
 * TanStack Router only runs `clientLoader` on client navigations unless `hydrate` is set.
 * Without it, SSR/hard-refresh shows empty server loader data until the user interacts.
 */
export function clientLoaderWithHydrate<T extends (...args: never[]) => Promise<unknown>>(fn: T): T {
  return Object.assign(fn, { hydrate: true }) as T;
}

/** Server loader stub; real data loads via hydrated `clientLoader` in the browser. */
export function ssrEmptyLoader<T>(empty: T, load: () => Promise<T>): () => Promise<T> {
  return async () => {
    if (typeof window === "undefined") return empty;
    return load();
  };
}
