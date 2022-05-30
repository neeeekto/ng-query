import { QueryBaseConfig } from '../../types/query-config.type';
import { Subject } from 'rxjs';
import { QueryTrigger } from '../../query-trigger';
import { TriggerEvent } from '../../types/trigger-event.type';
import { DefaulQueryConfigForTest } from './query-config';

export const makeTriggerManager = (config: Partial<QueryBaseConfig> = {}) => {
  const blur$ = new Subject();
  const focus$ = new Subject();
  const online$ = new Subject();
  const trigger = new QueryTrigger(
    { ...DefaulQueryConfigForTest, ...config },
    focus$,
    blur$,
    online$
  );
  let lastValue: TriggerEvent | undefined = void 0;
  const lastValues: TriggerEvent[] = [];
  trigger.subscribe((x) => {
    lastValue = x;
    lastValues.push(x);
  });
  return {
    blur$,
    focus$,
    online$,
    trigger,
    getLastValue: () => lastValue,
    getLastValues: () => lastValues,
  };
};
