import { Injectable } from '@angular/core';
import { MutationStore } from './mutation-store';
import { ArgumentTypes, FunctionType } from './types/common.type';
import { Key } from './types/key.type';
import { Observable } from 'rxjs';
import { Mutation } from './mutation';
import { GcPlanner } from './gc-planner';

@Injectable()
export class MutationFactory {
  constructor(
    private readonly store: MutationStore,
    private gcPlanner: GcPlanner
  ) {}

  public make<TExecutorFn extends FunctionType<any, Observable<TRes>>, TRes>(
    executor: TExecutorFn,
    keyFactory: (...args: ArgumentTypes<TExecutorFn>) => Key
  ) {
    return (...args: ArgumentTypes<TExecutorFn>) => {
      const key = keyFactory(...args);
      const argHash = JSON.stringify(args);
      let mutation = this.store.get(key, argHash);
      if (mutation === undefined) {
        mutation = new Mutation(key, () => executor(args));
        this.gcPlanner.schedule(() => {
          if (!mutation!.isUsed) {
            this.store.delete(key, argHash);
          }
          return !mutation!.isUsed;
        });
        this.store.add(argHash, mutation);
      }
      return mutation;
    };
  }
}
