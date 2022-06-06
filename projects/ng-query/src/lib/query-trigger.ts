import { interval, Observable, of, merge } from 'rxjs';
import { debounceTime, filter, map, mergeAll, startWith } from 'rxjs/operators';
import {
  FocusTriggerEvent,
  IntervalTriggerEvent,
  OnlineTriggerEvent,
  TriggerEvent,
} from './types/trigger-event.type';
import { QueryBaseConfig } from './types/query-config.type';
import { windowToggle } from 'rxjs/operators';

export class QueryTrigger extends Observable<TriggerEvent> {
  private readonly src$: Observable<TriggerEvent>;

  constructor(
    private readonly config: QueryBaseConfig,
    private readonly focus$: Observable<any>,
    private readonly blur$: Observable<any>,
    private readonly online$: Observable<any>
  ) {
    super((subscriber) => {
      return this.src$.subscribe(subscriber);
    });

    const triggers: Array<Observable<any>> = [of(null)];
    if (config.refetchInterval) {
      let src$ = interval(config.refetchInterval);
      if (!config.refetchIntervalInBackground) {
        src$ = src$.pipe(
          windowToggle(this.focus$.pipe(startWith(null)), (v) => this.blur$),
          mergeAll()
        );
      }
      triggers.push(
        src$.pipe(map((x) => ({ type: 'interval' } as IntervalTriggerEvent)))
      );
    }
    if (config.refetchOnWindowFocus) {
      triggers.push(
        this.focus$.pipe(map((x) => ({ type: 'focus' } as FocusTriggerEvent)))
      );
    }

    if (config.refetchOnReconnect) {
      triggers.push(
        this.online$.pipe(
          map((x) => ({ type: 'online' } as OnlineTriggerEvent))
        )
      );
    }

    this.src$ = merge(...triggers).pipe(debounceTime(10), filter(Boolean));
  }
}
