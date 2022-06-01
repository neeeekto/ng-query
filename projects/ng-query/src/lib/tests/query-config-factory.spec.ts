import { QueryConfigFactory } from '../query-config-factory';
import { QueryBaseConfig } from '../types/query-config.type';

describe('QueryConfigFactory', () => {
  it('should be created', () => {
    expect(new QueryConfigFactory([])).toBeTruthy();
  });

  it('should use global configs ', () => {
    const globalConfig: Partial<QueryBaseConfig>[] = [
      { cacheTime: 10 },
      { retry: 0 },
    ];
    const factory = new QueryConfigFactory(globalConfig);
    const result = factory.make();
    expect(result.retry).toBe(0);
    expect(result.cacheTime).toBe(10);
  });
  it('should override exists fields', () => {
    const globalConfig: Partial<QueryBaseConfig>[] = [
      { cacheTime: 10 },
      { cacheTime: -1 },
    ];
    const factory = new QueryConfigFactory(globalConfig);
    const result = factory.make();
    expect(result.cacheTime).toBe(-1);
  });
  it('should use configs from arg', () => {
    const globalConfig: Partial<QueryBaseConfig>[] = [{ cacheTime: 10 }];
    const factory = new QueryConfigFactory(globalConfig);
    const result = factory.make({ cacheTime: 100 });
    expect(result.cacheTime).toBe(100);
  });
});
