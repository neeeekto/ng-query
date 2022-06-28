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

  public build<TRes>(executor: () => Observable<TRes>, key: Key) {
    let mutation = this.store.get(key) as Mutation<TRes>;
    if (mutation === undefined) {
      mutation = new Mutation<TRes>(key, executor);
      this.gcPlanner.schedule(() => {
        if (!mutation!.isUsed) {
          this.store.delete(key);
        }
        return !mutation!.isUsed;
      });
      this.store.add(mutation);
    }
    mutation.setExecutor(executor);
    return mutation;
  }
}
