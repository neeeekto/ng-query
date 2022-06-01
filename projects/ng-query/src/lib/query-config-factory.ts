import { QueryBaseConfig, QueryConfig } from './types/query-config.type';
import { Inject, Injectable } from '@angular/core';
import { NG_QUERY_DEFAULT_CONFIG } from './di-tokens';

@Injectable()
export class QueryConfigFactory {
  constructor(
    @Inject(NG_QUERY_DEFAULT_CONFIG)
    private readonly defaultConfigs: Partial<QueryBaseConfig>[]
  ) {}

  public make<TRes, TData = TRes>(
    config?: Partial<QueryConfig<TRes, TData>>
  ): QueryConfig<TRes, TData> {
    return {
      ...this.defaultConfigs.reduce(
        (result, config) => ({ ...result, ...config }),
        {}
      ),
      ...(config || {}),
    } as QueryConfig<TRes, TData>;
  }
}
