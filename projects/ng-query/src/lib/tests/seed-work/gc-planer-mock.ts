import { IGcPlaner } from '../../types/gc.type';

export class GcPlanerMock implements IGcPlaner {
  public cbs: Array<{ cb: () => boolean; cacheTime?: number }> = [];
  public schedule(cb: () => boolean, cacheTime?: number) {
    this.cbs.push({ cb, cacheTime });
  }

  public run() {
    this.cbs = this.cbs.filter((x) => x.cb());
  }
}
