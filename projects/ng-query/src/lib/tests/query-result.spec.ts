import { QueryResult } from '../query-result';
import { QueryBaseConfig } from '../types/query-config.type';

describe('QueryResult', () => {
  const DefaulQueryConfig: QueryBaseConfig = {
    cacheTime: 5 * 60 * 1000,
    refetchInterval: false,
    refetchIntervalInBackground: false,
    refetchOnArgumentChange: true,
    refetchOnReconnect: true,
    refetchOnSubscribe: true,
    refetchOnWindowFocus: true,
    retry: 3,
    retryDelay: 1000,
    staleTime: 10000,
  };

  it('should be created', () => {
    const result = new QueryResult(DefaulQueryConfig, { refecth() {} });
    expect(result).toBeTruthy();
  });

  it('can have idle status', () => {
    const result = new QueryResult(DefaulQueryConfig, { refecth() {} });
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
    expect(value.isStale).toBeTrue();
    expect(value.isSuccess).toBeFalse();
    expect(value.isLoading).toBeFalse();
    expect(value.isLoadingError).toBeFalse();
    expect(value.isRefetchError).toBeFalse();
    expect(value.isRefetching).toBeFalse();
  });

  it('can have loading status', () => {
    const result = new QueryResult(DefaulQueryConfig, { refecth() {} });
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
    expect(value.isStale).toBeTrue();
    expect(value.isSuccess).toBeFalse();
    expect(value.isLoading).toBeTrue();
    expect(value.isLoadingError).toBeFalse();
    expect(value.isRefetchError).toBeFalse();
    expect(value.isRefetching).toBeFalse();
  });

  it('can have success status', () => {
    const result = new QueryResult(DefaulQueryConfig, { refecth() {} });
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
    expect(value.isStale).toBeFalse();
    expect(value.isSuccess).toBeTrue();
    expect(value.isLoading).toBeFalse();
    expect(value.isLoadingError).toBeFalse();
    expect(value.isRefetchError).toBeFalse();
    expect(value.isRefetching).toBeFalse();
  });

  it('can have error status', () => {
    const result = new QueryResult(DefaulQueryConfig, { refecth() {} });
    const now = Date.now();
    const error = new Error();
    result.toError(error);
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
    expect(value.isStale).toBeTrue();
    expect(value.isSuccess).toBeFalse();
    expect(value.isLoading).toBeFalse();
    expect(value.isLoadingError).toBeTrue();
    expect(value.isRefetchError).toBeFalse();
    expect(value.isRefetching).toBeFalse();
  });

  describe('transitions', () => {
    it('idle -> loading', () => {
      // TODO
    });

    it('loading -> success', () => {
      // TODO
    });

    it('loading -> error', () => {
      // TODO
    });

    it('loading -> error -> error', () => {
      // TODO
    });
    it('loading -> error -> success', () => {
      // TODO
    });
  });

  describe('configs', () => {
    it('can created with init data', () => {
      const initData: any[] = [1, 2, 3];
      const result = new QueryResult(
        {
          ...DefaulQueryConfig,
          initialData: initData,
        },
        { refecth() {} }
      );
      result.toIdle();
      const value = result.getValue();
      expect(value.data).toBe(initData);
    });

    it('can created with init data fn', () => {
      const initData: any[] = [1, 2, 3];
      const result = new QueryResult(
        {
          ...DefaulQueryConfig,
          initialData: () => initData,
        },
        { refecth() {} }
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
          ...DefaulQueryConfig,
          initialData: initData,
          initialDataUpdatedAt: now,
        },
        { refecth() {} }
      );
      result.toIdle();
      const value = result.getValue();
      expect(value.dataUpdatedAt).toBe(now);
    });

    it('should not have init data update if init data is empty', () => {
      const now = Date.now();
      const result = new QueryResult(
        {
          ...DefaulQueryConfig,
          initialDataUpdatedAt: now,
        },
        { refecth() {} }
      );
      result.toIdle();
      const value = result.getValue();
      expect(value.dataUpdatedAt).not.toBe(now);
    });

    it('can have placeholder data', () => {
      // TODO
    });
  });
});
