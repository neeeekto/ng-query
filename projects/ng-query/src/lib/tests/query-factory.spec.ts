import { QueryFactory } from '../query-factory';
import { KeyComparator } from '../key-comparator';
import { QueryStore } from '../query-store';
import { GlobalTriggersMock } from './seed-work/global-triggers-mock';
import { DefaulQueryConfigForTest } from './seed-work/query-config';
import { QueryBaseConfig } from '../types/query-config.type';
import { of } from 'rxjs';
import { QueryConfigFactory } from '../query-config-factory';
import { GcPlanerMock } from './seed-work/gc-planer-mock';

describe('QueryFactory', () => {
  const keyComparator = new KeyComparator();
  const queryStore = new QueryStore(keyComparator);
  const trigger = new GlobalTriggersMock();
  const gcCollector = new GcPlanerMock();

  afterEach(() => {
    queryStore.delete(...queryStore.getAll().map((x) => x.key));
  });

  const makeQueryFactory = (
    configs: Partial<QueryBaseConfig>[] = [DefaulQueryConfigForTest]
  ) =>
    new QueryFactory(
      new QueryConfigFactory(configs),
      trigger,
      queryStore,
      gcCollector as any
    );

  it('should be created', () => {
    expect(makeQueryFactory()).toBeTruthy();
  });

  it('should return query resolver', () => {
    const resolver = makeQueryFactory().make(
      () => of(1),
      () => [1]
    );
    expect(typeof resolver).toBe('function');
  });
  it('should use config factory with config from arg', () => {
    const configMaker = jasmine
      .createSpy()
      .and.returnValue(DefaulQueryConfigForTest);
    const factory = new QueryFactory(
      {
        make: configMaker,
      } as any,
      trigger,
      queryStore,
      gcCollector as any
    );
    const customConfig = { cacheTime: 1 };
    const resolver = factory.make(
      () => of(1),
      () => [1],
      customConfig
    );
    resolver();
    expect(configMaker.calls.any()).toBeTrue();
    expect(configMaker.calls.argsFor(0)[0]).toEqual(customConfig);
  });

  it('should create key', () => {
    const key = [1, 2, 3];
    const resolver = makeQueryFactory().make(
      () => of(1),
      () => key
    );
    const query = resolver();
    expect(keyComparator.isEqual(query.key, key)).toBeTrue();
  });
  it('should create query if query is not exists', () => {
    const resolver = makeQueryFactory().make(
      () => of(1),
      () => [1]
    );
    expect(queryStore.getAll().length).toBe(0);
    resolver();
    expect(queryStore.getAll().length).toBe(1);
  });
  it('should return exists query if query exists', () => {
    const resolver = makeQueryFactory().make(
      () => of(1),
      () => [1]
    );
    const query1 = resolver();
    const query2 = resolver();
    expect(query1).toBe(query2);
  });
  it('should change args if query exists', () => {
    const src = jasmine.createSpy().and.callFake((arg: number) => of(arg));
    const resolver = makeQueryFactory().make(src, () => [1]);
    resolver(1).subscribe();
    resolver(2).subscribe();
    expect(src.calls.count()).toBe(2);
    expect(src.calls.argsFor(0)[0]).toEqual([1]);
    expect(src.calls.argsFor(1)[0]).toEqual([2]);
  });
});
