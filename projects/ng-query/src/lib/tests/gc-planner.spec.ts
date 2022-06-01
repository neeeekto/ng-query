import { GcPlanner } from '../gc-planner';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { NG_GC_DEFAULT_CACHE_TIMER } from '../di-tokens';

describe('GcPlanner', () => {
  let service: GcPlanner;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        GcPlanner,
        {
          provide: NG_GC_DEFAULT_CACHE_TIMER,
          useValue: 1000,
        },
      ],
    });
    service = TestBed.inject(GcPlanner);
  });

  it('should schedule fn', fakeAsync(() => {
    const cb = jasmine.createSpy().and.returnValue(true);
    service.schedule(cb);
    tick(1000);
    expect(cb.calls.any()).toBeTrue();
  }));
  it('should re-schedule fn if fn return false', fakeAsync(() => {
    const cb = jasmine.createSpy().and.returnValues(false, true);
    service.schedule(cb);
    tick(1000);
    tick(1000);
    tick(1000);
    expect(cb.calls.count()).toBe(2);
  }));
  it('should use cacheTimeout from arg if it is not empty', fakeAsync(() => {
    const cb = jasmine.createSpy().and.returnValues(true);
    service.schedule(cb, 10000);
    tick(1000);
    expect(cb.calls.count()).toBe(0);
    tick(9000);
    expect(cb.calls.count()).toBe(1);
  }));
  it('should use default cacheTimeout', fakeAsync(() => {
    const cb = jasmine.createSpy().and.returnValues(true);
    service.schedule(cb, 0);
    tick(1000);
    expect(cb.calls.count()).toBe(1);
  }));
});
