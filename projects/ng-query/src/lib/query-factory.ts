import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Key } from './types/key.type';
import { QueryConfig } from './types/query-config.type';
import { Query } from './query';
import { QueryTrigger } from './query-trigger';
import { GlobalTriggers } from './global-triggers';
import { QueryStore } from './query-store';
import { ArgumentTypes, FunctionType } from './types/common.type';
import { QueryConfigFactory } from './query-config-factory';
import { GcPlanner } from './gc-planner';

@Injectable()
export class QueryFactory {
  constructor(
    private readonly queryConfigFactory: QueryConfigFactory,
    private readonly globalTriggers: GlobalTriggers,
    private readonly queryStore: QueryStore,
    private readonly gcPlanner: GcPlanner
  ) {}

  public make<
    TSrcFactory extends FunctionType<any, Observable<TRes>>,
    TRes,
    TData = TRes,
    TError = unknown
  >(
    srcFactory: TSrcFactory,
    keyFactory: (...args: ArgumentTypes<TSrcFactory>) => Key,
    config?: Partial<QueryConfig<TRes, TData>>
  ) {
    return (...args: ArgumentTypes<TSrcFactory>) => {
      const key = keyFactory(...args);
      let exist: Query<TRes, TError, TData> | undefined =
        this.queryStore.get(key);
      if (!exist) {
        const queryConfig = this.queryConfigFactory.make(config);
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
          trigger,
          this.gcPlanner
        );
        this.queryStore.add(exist);
      }
      exist.setArg(args);
      return exist;
    };
  }
}
