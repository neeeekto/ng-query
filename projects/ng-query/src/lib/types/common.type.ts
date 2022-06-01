export type ArgumentTypes<F> = F extends (...args: infer A) => any ? A : never;

export type FunctionType<TArgs = any, TResult = any> = (
  ...args: TArgs[]
) => TResult;
