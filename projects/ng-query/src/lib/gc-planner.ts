import { Inject, Injectable, NgZone } from '@angular/core';
import { NG_GC_DEFAULT_CACHE_TIMER } from './di-tokens';
import { IGcPlaner } from './types/gc.type';

@Injectable()
export class GcPlanner implements IGcPlaner {
  constructor(
    private readonly ngZone: NgZone,

    @Inject(NG_GC_DEFAULT_CACHE_TIMER)
    private readonly defaultCacheTime: number
  ) {}
  public schedule(cb: () => boolean, cacheTime?: number) {
    this.ngZone.runOutsideAngular(() => {
      const interval = setInterval(() => {
        if (cb()) {
          clearInterval(interval);
        }
      }, cacheTime || this.defaultCacheTime);
    });
  }
}
