import { ModuleWithProviders, NgModule } from '@angular/core';
import {
  NG_GC_DEFAULT_CACHE_TIMER,
  NG_QUERY_DEFAULT_CONFIG,
} from './di-tokens';
import { DefaulQueryConfig } from './defaul-query-config';
import { QueryStore } from './query-store';
import { QueryFactory } from './query-factory';
import { QueryConfigFactory } from './query-config-factory';
import { GlobalTriggers } from './global-triggers';
import { GcPlanner } from './gc-planner';
import { KeyComparator } from './key-comparator';
import { MutationFactory } from './mutation-factory';
import { MutationStore } from './mutation-store';

@NgModule({
  declarations: [],
  imports: [],
})
export class NgQueryModule {
  public static forRoot(): ModuleWithProviders<NgQueryModule> {
    return {
      ngModule: NgQueryModule,
      providers: [
        {
          provide: NG_QUERY_DEFAULT_CONFIG,
          multi: true,
          useValue: DefaulQueryConfig,
        },
        {
          provide: NG_GC_DEFAULT_CACHE_TIMER,
          useValue: 5 * 60 * 1000,
        },
        QueryStore,
        QueryFactory,
        QueryConfigFactory,
        GlobalTriggers,
        GcPlanner,
        KeyComparator,
        MutationFactory,
        MutationStore,
      ],
    };
  }
}
