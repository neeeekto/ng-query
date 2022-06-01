import { GlobalTriggers } from '../../global-triggers';
import { BehaviorSubject, Observable } from 'rxjs';

export class GlobalTriggersMock implements GlobalTriggers {
  public readonly focus$ = new BehaviorSubject(1);
  public readonly online$ = new BehaviorSubject(1);
  public readonly blur$ = new BehaviorSubject(1);
}
