import {
  discardPeriodicTasks,
  fakeAsync,
  tick,
  TestBed,
} from '@angular/core/testing';
import { makeTriggerManager } from './seed-work/make-trigger-manager';
import { Query } from '../query';
import { DefaulQueryConfigForTest } from './seed-work/query-config';
import { BehaviorSubject, Observable, of, throwError, timer } from 'rxjs';
import { IQueryResult } from '../types/query-result.type';
import { QueryConfig } from '../types/query-config.type';
import { GcPlanner } from '../gc-planner';
import { GcPlanerMock } from './seed-work/gc-planer-mock';

describe('Query', () => {
  const gcPlanner = new GcPlanerMock();

  it('should use src factory', fakeAsync(() => {
    const triggerMngr = makeTriggerManager();
    const result = 'test';
    const src = jasmine
      .createSpy('src')
      .and.returnValue(new BehaviorSubject(result));
    const query = new Query(
      [],
      DefaulQueryConfigForTest,
      src,
      triggerMngr.trigger,
      gcPlanner
    );
    let queryResult: IQueryResult<string, any, string>;
    query.subscribe((res) => {
      // Sync
      queryResult = res;
    });
    expect(queryResult!.data).toEqual(result);
    expect(src.calls.any()).toBeTrue();
    expect(src.calls.allArgs().some((x) => x[0] == null)).toBeTrue(); // Use correct intial arguments
    discardPeriodicTasks();
  }));
  it('can be re-fetched', fakeAsync(() => {
    const triggerMngr = makeTriggerManager();
    const src = () => new BehaviorSubject({ data: 1 });
    const query = new Query(
      [],
      DefaulQueryConfigForTest,
      src,
      triggerMngr.trigger,
      gcPlanner
    );
    query.subscribe((res) => {});
    const resultBeforeRefetch = query.lastResult;
    tick(1);
    query.refetch();
    const lastResult = query.lastResult;
    expect(resultBeforeRefetch).not.toEqual(lastResult);
    discardPeriodicTasks();
  }));
  it('should load data if subscribe', fakeAsync(() => {
    const triggerMngr = makeTriggerManager();
    const src = () => timer(10000);
    const query = new Query(
      [],
      DefaulQueryConfigForTest,
      src,
      triggerMngr.trigger,
      gcPlanner
    );
    let queryResult1: IQueryResult<any, any, any>;
    let queryResult2: IQueryResult<any, any, any>;
    query.subscribe((res) => {
      queryResult1 = res;
    });
    tick(1000);
    query.subscribe((res) => {
      queryResult2 = res;
    });

    expect(queryResult1!).toEqual(queryResult2!);
    tick(10000); // Emit src result (timer)
    expect(queryResult1!).toEqual(queryResult2!);
    discardPeriodicTasks();
  }));
  it('should use one request for many subscribers if data is not fetched', fakeAsync(() => {
    const triggerMngr = makeTriggerManager();
    const src = jasmine.createSpy('src').and.returnValue(timer(10000));
    const query = new Query(
      [],
      DefaulQueryConfigForTest,
      src,
      triggerMngr.trigger,
      gcPlanner
    );
    query.subscribe((res) => {});
    tick(1000);
    query.subscribe((res) => {});
    tick(10000);
    expect(src.calls.count()).toBe(1);
    discardPeriodicTasks();
  }));
  it('should not load data if query fresh', fakeAsync(() => {
    const triggerMngr = makeTriggerManager();
    const src = jasmine.createSpy('src').and.returnValue(timer(10000));
    const query = new Query(
      [],
      DefaulQueryConfigForTest,
      src,
      triggerMngr.trigger,
      gcPlanner
    );
    query.subscribe((res) => {});
    tick(10000);
    query.subscribe((res) => {});
    expect(src.calls.count()).toBe(1);
    discardPeriodicTasks();
  }));
  it('should load data if query is not fresh', fakeAsync(() => {
    const triggerMngr = makeTriggerManager();
    const src = jasmine
      .createSpy('src')
      .and.returnValue(new BehaviorSubject(1));
    const query = new Query(
      [],
      DefaulQueryConfigForTest,
      src,
      triggerMngr.trigger,
      gcPlanner
    );
    query.subscribe((res) => {});
    expect(src.calls.count()).toBe(1);
    tick(11000);
    query.subscribe((res) => {});
    expect(src.calls.count()).toBe(2);
    discardPeriodicTasks();
  }));
  it('should fetch data always if refetchOnReconnect is "always" and reconnect happened and query is fresh', fakeAsync(() => {
    const config: QueryConfig = {
      ...DefaulQueryConfigForTest,
      refetchOnReconnect: 'always',
    };
    const triggerMngr = makeTriggerManager(config);
    const src = jasmine
      .createSpy('src')
      .and.returnValue(new BehaviorSubject(1));
    const query = new Query([], config, src, triggerMngr.trigger, gcPlanner);
    query.subscribe((res) => {});
    expect(src.calls.count()).toBe(1);
    expect(query.lastResult.isStale()).toBeFalse();
    triggerMngr.online$.next(null);
    tick(100);
    expect(src.calls.count()).toBe(2);
    discardPeriodicTasks();
  }));
  it('should fetch data always if refetchOnReconnect is "always" and reconnect happened and query is not fresh', fakeAsync(() => {
    const config: QueryConfig = {
      ...DefaulQueryConfigForTest,
      refetchOnReconnect: 'always',
    };
    const triggerMngr = makeTriggerManager(config);
    const src = jasmine
      .createSpy('src')
      .and.returnValue(new BehaviorSubject(1));
    const query = new Query([], config, src, triggerMngr.trigger, gcPlanner);
    query.subscribe((res) => {});
    expect(src.calls.count()).toBe(1);
    expect(query.lastResult.isStale()).toBeFalse();
    triggerMngr.online$.next(null);
    tick(11000);
    expect(src.calls.count()).toBe(2);
    discardPeriodicTasks();
  }));
  it('should fetch data always if refetchOnWindowFocus is always and focus happened and query is fresh', fakeAsync(() => {
    const config: QueryConfig = {
      ...DefaulQueryConfigForTest,
      refetchOnWindowFocus: 'always',
    };
    const triggerMngr = makeTriggerManager(config);
    const src = jasmine
      .createSpy('src')
      .and.returnValue(new BehaviorSubject(1));
    const query = new Query([], config, src, triggerMngr.trigger, gcPlanner);
    query.subscribe((res) => {});
    expect(src.calls.count()).toBe(1);
    expect(query.lastResult.isStale()).toBeFalse();
    triggerMngr.focus$.next(null);
    tick(100);
    expect(src.calls.count()).toBe(2);
    discardPeriodicTasks();
  }));
  it('should fetch data always if refetchOnWindowFocus is always and focus happened and query is not fresh', fakeAsync(() => {
    const config: QueryConfig = {
      ...DefaulQueryConfigForTest,
      refetchOnWindowFocus: 'always',
    };
    const triggerMngr = makeTriggerManager(config);
    const src = jasmine
      .createSpy('src')
      .and.returnValue(new BehaviorSubject(1));
    const query = new Query([], config, src, triggerMngr.trigger, gcPlanner);
    query.subscribe((res) => {});
    expect(src.calls.count()).toBe(1);
    expect(query.lastResult.isStale()).toBeFalse();
    triggerMngr.focus$.next(null);
    tick(11000);
    expect(src.calls.count()).toBe(2);
    discardPeriodicTasks();
  }));

  it('should re-fetch data if there is new subscriber and refetchOnSubscribe is true and query is stale', fakeAsync(() => {
    const triggerMngr = makeTriggerManager();
    const src = jasmine
      .createSpy('src')
      .and.returnValue(new BehaviorSubject(1));
    const query = new Query(
      [],
      { ...DefaulQueryConfigForTest, refetchOnSubscribe: true },
      src,
      triggerMngr.trigger,
      gcPlanner
    );
    query.subscribe((res) => {});
    expect(src.calls.count()).toBe(1);
    expect(query.lastResult.isStale()).toBeFalse();
    tick(11000);
    query.subscribe((res) => {});
    expect(src.calls.count()).toBe(2);
    discardPeriodicTasks();
  }));
  it('should not re-fetch data if there is new subscriber and refetchOnSubscribe is true and query is fresh', fakeAsync(() => {
    const triggerMngr = makeTriggerManager();
    const src = jasmine
      .createSpy('src')
      .and.returnValue(new BehaviorSubject(1));
    const query = new Query(
      [],
      { ...DefaulQueryConfigForTest, refetchOnSubscribe: true },
      src,
      triggerMngr.trigger,
      gcPlanner
    );
    query.subscribe((res) => {});
    expect(src.calls.count()).toBe(1);
    expect(query.lastResult.isStale()).toBeFalse();
    tick(100);
    query.subscribe((res) => {});
    expect(src.calls.count()).toBe(1);
    discardPeriodicTasks();
  }));
  it('should not re-fetch data if there is new subscriber and refetchOnSubscribe is false', fakeAsync(() => {
    const triggerMngr = makeTriggerManager();
    const src = jasmine
      .createSpy('src')
      .and.returnValue(new BehaviorSubject(1));
    const query = new Query(
      [],
      { ...DefaulQueryConfigForTest, refetchOnSubscribe: false },
      src,
      triggerMngr.trigger,
      gcPlanner
    );
    query.subscribe((res) => {
      console.log(res.data);
    });
    expect(src.calls.count()).toBe(1);
    expect(query.lastResult.isStale()).toBeFalse();
    tick(11000);
    query.subscribe((res) => {});
    expect(src.calls.count()).toBe(1);
    discardPeriodicTasks();
  }));
  it('should re-fetch data if there is new subscriber and refetchOnSubscribe is always', fakeAsync(() => {
    const triggerMngr = makeTriggerManager();
    const src = jasmine.createSpy('src').and.returnValue(timer(1000));
    const query = new Query(
      [],
      { ...DefaulQueryConfigForTest, refetchOnSubscribe: 'always' },
      src,
      triggerMngr.trigger,
      gcPlanner
    );
    query.subscribe((res) => {});
    expect(src.calls.count()).toBe(1);
    tick(1100);
    query.subscribe((res) => {});
    expect(src.calls.count()).toBe(2);
    discardPeriodicTasks();
  }));
  it('should try fetch while retry count is not reached', fakeAsync(() => {
    const triggerMngr = makeTriggerManager();
    const src = jasmine
      .createSpy('src')
      .and.returnValue(throwError(() => new Error('')));
    const query = new Query(
      [],
      { ...DefaulQueryConfigForTest, refetchOnSubscribe: 'always' },
      src,
      triggerMngr.trigger,
      gcPlanner
    );
    query.subscribe((res) => {});
    tick(1000);
    expect(query.lastResult.failureCount).toBe(1);
    tick(1000);
    expect(query.lastResult.failureCount).toBe(2);
    tick(1000);
    expect(query.lastResult.failureCount).toBe(3);
    tick(1000);
    expect(query.lastResult.failureCount).toBe(3);

    discardPeriodicTasks();
  }));
  it('can have dynamic retry delay', fakeAsync(() => {
    const triggerMngr = makeTriggerManager();
    const src = jasmine
      .createSpy('src')
      .and.returnValue(throwError(() => new Error('')));
    const query = new Query(
      [],
      {
        ...DefaulQueryConfigForTest,
        retryDelay: (failureCount) => failureCount * 1000,
      },
      src,
      triggerMngr.trigger,
      gcPlanner
    );
    query.subscribe((res) => {});
    tick(1000);
    expect(query.lastResult.failureCount).toBe(1);
    tick(2000);
    expect(query.lastResult.failureCount).toBe(2);
    tick(3000);
    expect(query.lastResult.failureCount).toBe(3);
    discardPeriodicTasks();
  }));
  it('can have custom retry function', fakeAsync(() => {
    const triggerMngr = makeTriggerManager();
    const src = jasmine
      .createSpy('src')
      .and.returnValue(throwError(() => new Error('')));
    const retry = jasmine.createSpy('retry').and.returnValue(true);

    const query = new Query(
      [],
      {
        ...DefaulQueryConfigForTest,
        retry,
      },
      src,
      triggerMngr.trigger,
      gcPlanner
    );
    query.subscribe((res) => {});
    tick(1000);
    expect(retry.calls.any()).toBeTrue();
    discardPeriodicTasks();
  }));
  it('can have re-fetch fn in result', fakeAsync(() => {
    const triggerMngr = makeTriggerManager();
    const src = jasmine.createSpy('src').and.returnValue(of(true));

    const query = new Query(
      [],
      DefaulQueryConfigForTest,
      src,
      triggerMngr.trigger,
      gcPlanner
    );
    query.subscribe((res) => {});
    query.lastResult.query.refetch();
    expect(src.calls.count()).toBe(2);
    discardPeriodicTasks();
  }));
  it('should set cancel state if prev state was loading and not subscribers', fakeAsync(() => {
    const triggerMngr = makeTriggerManager();
    const src = jasmine.createSpy('src').and.returnValue(timer(1000));
    const query = new Query(
      [],
      DefaulQueryConfigForTest,
      src,
      triggerMngr.trigger,
      gcPlanner
    );
    const subsc = query.subscribe((res) => {});
    expect(query.lastResult.isLoading).toBeTrue();
    subsc.unsubscribe();
    expect(query.lastResult.status).toBe('canceled');
    discardPeriodicTasks();
  }));
  it('should use prev data if isDataEqual return true', fakeAsync(() => {
    const triggerMngr = makeTriggerManager();
    const src = () => of({ a: 1 });
    const query = new Query(
      [],
      DefaulQueryConfigForTest,
      src,
      triggerMngr.trigger,
      gcPlanner
    );
    query.subscribe((res) => {});
    const prevData = query.lastResult.data;
    query.refetch();
    tick(11000);
    const curData = query.lastResult.data;
    expect(curData).toEqual(prevData);
    discardPeriodicTasks();
  }));
  it('should clear after cacheTimeout', fakeAsync(() => {
    const gcPlanner = new GcPlanerMock();
    const triggerMngr = makeTriggerManager();
    const src = () => of({ a: 1 });
    const query = new Query(
      [],
      DefaulQueryConfigForTest,
      src,
      triggerMngr.trigger,
      gcPlanner
    );
    const subscription = query.subscribe((res) => {});
    subscription.unsubscribe();
    expect(query.lastResult.status).toBe('success');
    tick(DefaulQueryConfigForTest.cacheTime + 1);
    gcPlanner.run();
    expect(query.lastResult.status).toBe('idle');
    discardPeriodicTasks();
  }));
  it('should not clear if there are subscribers', fakeAsync(() => {
    const gcPlanner = new GcPlanerMock();
    const triggerMngr = makeTriggerManager();
    const src = () => of({ a: 1 });
    const query = new Query(
      [],
      DefaulQueryConfigForTest,
      src,
      triggerMngr.trigger,
      gcPlanner
    );
    const subscription = query.subscribe((res) => {});
    expect(query.lastResult.status).toBe('success');
    tick(DefaulQueryConfigForTest.cacheTime + 1);
    gcPlanner.run();
    expect(query.lastResult.status).toBe('success');
    discardPeriodicTasks();
  }));
  it('should not clear if was not reached cache timeout', fakeAsync(() => {
    const gcPlanner = new GcPlanerMock();
    const triggerMngr = makeTriggerManager();
    const src = () => of({ a: 1 });
    const query = new Query(
      [],
      DefaulQueryConfigForTest,
      src,
      triggerMngr.trigger,
      gcPlanner
    );
    query.subscribe((res) => {});
    expect(query.lastResult.status).toBe('success');
    gcPlanner.run();
    expect(query.lastResult.status).toBe('success');
    discardPeriodicTasks();
  }));
});
