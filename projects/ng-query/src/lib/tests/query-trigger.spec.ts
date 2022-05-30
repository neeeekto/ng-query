import { QueryTrigger } from '../query-trigger';
import { discardPeriodicTasks, fakeAsync, tick } from '@angular/core/testing';
import { makeTriggerManager } from './seed-work/make-trigger-manager';

describe('QueryTrigger', () => {
  it('refetchInterval', fakeAsync(() => {
    const triggerManager = makeTriggerManager({ refetchInterval: 50 });
    tick(100);
    const val = triggerManager.getLastValue();
    expect(val?.type).toBe('interval');
    discardPeriodicTasks();
  }));
  it('refetchOnWindowFocus: true', fakeAsync(() => {
    const triggerManager = makeTriggerManager();
    triggerManager.focus$.next(null);
    tick(10);
    const val = triggerManager.getLastValue();
    expect(val?.type).toBe('focus');
  }));
  it('refetchOnWindowFocus: false', fakeAsync(() => {
    const triggerManager = makeTriggerManager({
      refetchInterval: 50,
      refetchOnWindowFocus: false,
    });
    tick(61);
    expect(triggerManager.getLastValues().length).toBe(1);
    triggerManager.blur$.next(null);
    tick(120);
    expect(triggerManager.getLastValues().length).toBe(1);
    triggerManager.focus$.next(null);
    tick(50);
    expect(triggerManager.getLastValues().length).toBe(2);
    discardPeriodicTasks();
  }));

  it('refetchOnWindowFocus: true', fakeAsync(() => {
    const triggerManager = makeTriggerManager({
      refetchInterval: 50,
      refetchOnWindowFocus: false,
      refetchIntervalInBackground: true,
    });
    tick(61);
    expect(triggerManager.getLastValues().length).toBe(1);
    triggerManager.blur$.next(null);
    tick(61);
    expect(triggerManager.getLastValues().length).toBe(2);
    triggerManager.focus$.next(null);
    tick(60);
    expect(triggerManager.getLastValues().length).toBe(3);
    discardPeriodicTasks();
  }));

  it('refetchOnWindowFocus: false', () => {
    const triggerManager = makeTriggerManager({
      refetchOnWindowFocus: false,
    });
    expect(triggerManager.getLastValues().length).toBe(0);
    triggerManager.focus$.next(null);
    expect(triggerManager.getLastValues().length).toBe(0);
  });

  it('refetchOnReconnect: true', fakeAsync(() => {
    const triggerManager = makeTriggerManager();
    triggerManager.online$.next(null);
    tick(10);
    const val = triggerManager.getLastValue();
    expect(val?.type).toBe('online');
  }));

  it('refetchOnReconnect: false', fakeAsync(() => {
    const triggerManager = makeTriggerManager({ refetchOnReconnect: false });
    triggerManager.online$.next(null);
    tick(10);
    const val = triggerManager.getLastValue();
    expect(val).toBeUndefined();
  }));
});
