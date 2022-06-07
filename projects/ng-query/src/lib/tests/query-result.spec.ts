import { QueryResult } from '../query-result';
import { QueryBaseConfig } from '../types/query-config.type';
import { DefaulQueryConfigForTest } from './seed-work/query-config';
import { fakeAsync, tick } from '@angular/core/testing';

describe('QueryResult', () => {
  it('should be created', () => {
    const result = new QueryResult(DefaulQueryConfigForTest, { refetch() {} });
    expect(result).toBeTruthy();
  });

  it('can have idle status', () => {
    const result = new QueryResult(DefaulQueryConfigForTest, { refetch() {} });
    result.toIdle();
    const value = result.getValue();
    expect(value.data).toBeUndefined();
    expect(value.dataUpdatedAt).toBeLessThan(Date.now());
    expect(value.error).toBeUndefined();
    expect(value.errorUpdatedAt).toBeLessThan(Date.now());
    expect(value.failureCount).toBe(0);
    expect(value.status).toBe('idle');
    expect(value.isError).toBeFalse();
    expect(value.isIdle).toBeTrue();
    expect(value.isFetched).toBeFalse();
    expect(value.isSuccess).toBeFalse();
    expect(value.isLoading).toBeFalse();
    expect(value.isLoadingError).toBeFalse();
    expect(value.isRefetchError).toBeFalse();
    expect(value.isRefetching).toBeFalse();
    expect(value.isStale()).toBeTrue();
  });

  it('can have loading status', () => {
    const result = new QueryResult(DefaulQueryConfigForTest, { refetch() {} });
    result.toLoading();
    const value = result.getValue();
    expect(value.data).toBeUndefined();
    expect(value.dataUpdatedAt).toBeLessThan(Date.now());
    expect(value.error).toBeUndefined();
    expect(value.errorUpdatedAt).toBeLessThan(Date.now());
    expect(value.failureCount).toBe(0);
    expect(value.status).toBe('loading');
    expect(value.isError).toBeFalse();
    expect(value.isIdle).toBeFalse();
    expect(value.isFetched).toBeFalse();
    expect(value.isStale()).toBeTrue();
    expect(value.isSuccess).toBeFalse();
    expect(value.isLoading).toBeTrue();
    expect(value.isLoadingError).toBeFalse();
    expect(value.isRefetchError).toBeFalse();
    expect(value.isRefetching).toBeFalse();
  });

  it('can have success status', () => {
    const result = new QueryResult(DefaulQueryConfigForTest, { refetch() {} });
    const data = [1, 2, 3];
    const now = Date.now();
    result.toSuccess(data);
    const value = result.getValue();
    expect(value.data).toBe(data);
    expect(value.dataUpdatedAt).toBeGreaterThanOrEqual(now);
    expect(value.error).toBeUndefined();
    expect(value.errorUpdatedAt).toBeLessThan(Date.now());
    expect(value.failureCount).toBe(0);
    expect(value.status).toBe('success');
    expect(value.isError).toBeFalse();
    expect(value.isIdle).toBeFalse();
    expect(value.isFetched).toBeTrue();
    expect(value.isStale()).toBeFalse();
    expect(value.isSuccess).toBeTrue();
    expect(value.isLoading).toBeFalse();
    expect(value.isLoadingError).toBeFalse();
    expect(value.isRefetchError).toBeFalse();
    expect(value.isRefetching).toBeFalse();
  });

  it('can have error status', () => {
    const result = new QueryResult(DefaulQueryConfigForTest, { refetch() {} });
    const now = Date.now();
    const error = new Error();
    result.toError(error, true);
    const value = result.getValue();
    expect(value.data).toBeUndefined();
    expect(value.dataUpdatedAt).toBeLessThan(now);
    expect(value.error).toBe(error);
    expect(value.errorUpdatedAt).toBeGreaterThanOrEqual(now);
    expect(value.failureCount).toBe(1);
    expect(value.status).toBe('error');
    expect(value.isError).toBeTrue();
    expect(value.isIdle).toBeFalse();
    expect(value.isFetched).toBeFalse();
    expect(value.isStale()).toBeTrue();
    expect(value.isSuccess).toBeFalse();
    expect(value.isLoading).toBeFalse();
    expect(value.isLoadingError).toBeTrue();
    expect(value.isRefetchError).toBeFalse();
    expect(value.isRefetching).toBeFalse();
  });

  it('calculate correct isStale flag', fakeAsync(() => {
    const result = new QueryResult(DefaulQueryConfigForTest, { refetch() {} });
    result.toSuccess('test');
    tick(11000);
    const value = result.getValue();
    expect(value.isStale()).toBeTrue();
  }));

  describe('transitions', () => {
    it('idle -> loading', () => {
      const result = new QueryResult(DefaulQueryConfigForTest, {
        refetch() {},
      });
      result.toIdle();
      let value = result.getValue();
      expect(value.isLoading).toBeFalse();
      result.toLoading();
      value = result.getValue();
      expect(value.isLoading).toBeTrue();
    });

    it('loading -> success', () => {
      const result = new QueryResult(DefaulQueryConfigForTest, {
        refetch() {},
      });
      result.toLoading();
      let value = result.getValue();
      expect(value.isLoading).toBeTrue();
      expect(value.data).toBeUndefined();
      result.toSuccess([]);
      value = result.getValue();
      expect(value.isLoading).toBeFalse();
      expect(value.data).not.toBeUndefined();
    });

    it('loading -> error', () => {
      const result = new QueryResult(DefaulQueryConfigForTest, {
        refetch() {},
      });
      result.toLoading();
      let value = result.getValue();
      expect(value.isLoading).toBeTrue();
      expect(value.failureCount).toBe(0);
      result.toError(new Error(''), true);
      value = result.getValue();
      expect(value.isLoading).toBeFalse();
      expect(value.failureCount).toBe(1);
    });

    it('loading -> error -> error', () => {
      const result = new QueryResult(DefaulQueryConfigForTest, {
        refetch() {},
      });
      result.toLoading();
      let value = result.getValue();
      expect(value.isLoading).toBeTrue();
      expect(value.failureCount).toBe(0);
      result.toError(new Error(''), true);
      value = result.getValue();
      expect(value.isLoading).toBeFalse();
      expect(value.failureCount).toBe(1);
      result.toLoading();
      value = result.getValue();
      expect(value.failureCount).toBe(1);
      result.toError(new Error(''), true);
      value = result.getValue();
      expect(value.isLoading).toBeFalse();
      expect(value.failureCount).toBe(2);
    });
    it('loading -> error -> success', () => {
      const result = new QueryResult(DefaulQueryConfigForTest, {
        refetch() {},
      });
      result.toLoading();
      let value = result.getValue();
      expect(value.isLoading).toBeTrue();
      expect(value.failureCount).toBe(0);
      result.toError(new Error(''), true);
      value = result.getValue();
      expect(value.isLoading).toBeFalse();
      expect(value.failureCount).toBe(1);
      result.toSuccess([]);
      value = result.getValue();
      expect(value.failureCount).toBe(0);
      expect(value.data).not.toBeUndefined();
    });
    it('loading -> error -> success -> error', () => {
      const result = new QueryResult(DefaulQueryConfigForTest, {
        refetch() {},
      });
      result.toLoading();
      let value = result.getValue();
      expect(value.isLoading).toBeTrue();
      expect(value.failureCount).toBe(0);
      result.toError(new Error(''), true);
      value = result.getValue();
      expect(value.isLoading).toBeFalse();
      expect(value.failureCount).toBe(1);
      result.toSuccess([]);
      value = result.getValue();
      expect(value.failureCount).toBe(0);
      expect(value.data).not.toBeUndefined();
      result.toLoading();
      result.toError(new Error(), true);
      value = result.getValue();
      expect(value.failureCount).toBe(1);
      expect(value.data).not.toBeUndefined();
    });
  });

  describe('configs', () => {
    it('can created with init data', () => {
      const initData: any[] = [1, 2, 3];
      const result = new QueryResult(
        {
          ...DefaulQueryConfigForTest,
          initialData: initData,
        },
        { refetch() {} }
      );
      result.toIdle();
      const value = result.getValue();
      expect(value.data).toBe(initData);
    });

    it('can created with init data fn', () => {
      const initData: any[] = [1, 2, 3];
      const result = new QueryResult(
        {
          ...DefaulQueryConfigForTest,
          initialData: () => initData,
        },
        { refetch() {} }
      );
      result.toIdle();
      const value = result.getValue();
      expect(value.data).toBe(initData);
    });
    it('can created with init data update', () => {
      const initData: any[] = [1, 2, 3];
      const now = Date.now();
      const result = new QueryResult(
        {
          ...DefaulQueryConfigForTest,
          initialData: initData,
          initialDataUpdatedAt: now,
        },
        { refetch() {} }
      );
      result.toIdle();
      const value = result.getValue();
      expect(value.dataUpdatedAt).toBe(now);
    });

    it('should not have init data update if init data is empty', () => {
      const now = Date.now();
      const result = new QueryResult(
        {
          ...DefaulQueryConfigForTest,
          initialDataUpdatedAt: now,
        },
        { refetch() {} }
      );
      result.toIdle();
      const value = result.getValue();
      expect(value.dataUpdatedAt).not.toBe(now);
    });

    it('can have placeholder data', () => {
      const data = [1];
      const result = new QueryResult(
        {
          ...DefaulQueryConfigForTest,
          placeholderData: () => data,
        },
        { refetch() {} }
      );
      result.toLoading();
      const val = result.getValue();
      expect(val.isLoading).toBeTrue();
      expect(val.data).toBe(data);
    });
    it('cannot have placeholder data if have initial data', () => {
      const data = [1];
      const placeholder = [2];
      const result = new QueryResult(
        {
          ...DefaulQueryConfigForTest,
          initialData: data,
          placeholderData: placeholder,
        },
        { refetch() {} }
      );
      result.toLoading();
      const val = result.getValue();
      expect(val.isLoading).toBeTrue();
      expect(val.data).toBe(data);
      expect(val.data).not.toBe(placeholder);
    });
  });
});
