export interface IGcPlaner {
  schedule(cb: () => boolean, cacheTime?: number): void;
}
