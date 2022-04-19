export interface TriggerEventBase<T extends string> {
  type: T;
}

export interface FocusTriggerEvent extends TriggerEventBase<'focus'> {}
export interface OnlineTriggerEvent extends TriggerEventBase<'online'> {}
export interface IntervalTriggerEvent extends TriggerEventBase<'interval'> {}

export type TriggerEvent =
  | FocusTriggerEvent
  | OnlineTriggerEvent
  | IntervalTriggerEvent;
