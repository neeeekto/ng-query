import { Inject, Injectable, Optional } from '@angular/core';
import { fromEvent, Observable, Subject } from 'rxjs';
import { Key } from './types/key.type';
import { QueryBaseConfig, QueryConfig } from './types/query-config.type';
import { Query } from './query';
import { NG_QUERY_DEFAULT_CONFIG } from './di-tokens';
import { QueryResult } from './query-result';
import { QueryTrigger } from './query-trigger';
import { DOCUMENT } from '@angular/common';
import { GlobalTriggers } from './global-triggers';

@Injectable({
  providedIn: 'root',
})
export class QueryFactoryService {
  constructor(
    @Inject(NG_QUERY_DEFAULT_CONFIG)
    private readonly defaultConfigs: QueryBaseConfig[],
    private readonly globalTriggers: GlobalTriggers
  ) {}

  public make<TArg, TRes, TData = TRes, TError = unknown>(
    srcFactory: (args: TArg) => Observable<TRes>,
    keyFactory: (args: TArg) => Key[],
    config?: Partial<QueryConfig<TRes, TData>>
  ): (args: TArg) => Query<TRes, TError, TData> {
    return (args: TArg) => {
      const key = keyFactory(args);
      let exist: Query<TRes, TError, TData> | null = null;
      // this.registry.find<TRes, TError, TData>(key);
      if (!exist) {
        const queryConfig = this.makeConfig(config);
        const trigger = new QueryTrigger(
          queryConfig,
          this.globalTriggers.focus$,
          this.globalTriggers.blur$,
          this.globalTriggers.online$
        );
        exist = new Query<TRes, TError, TData>(
          key,
          queryConfig,
          srcFactory,
          args,
          trigger
        );
        //this.registry.add(exist);
      }
      exist.setArg(args);
      return exist;
    };
  }

  private makeConfig<TRes, TData = TRes>(
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
