import { Mutation } from '../mutation';
import { of, throwError, timer } from 'rxjs';

describe('Mutation', () => {
  it('should run executor', () => {
    const action = jasmine.createSpy().and.returnValue(of(1));
    const mutation = new Mutation([1], action);
    mutation.execute();
    expect(action.calls.any()).toBeTrue();
  });
  it('should change status to loading', () => {
    const action = jasmine.createSpy().and.returnValue(timer(1000));
    const mutation = new Mutation([1], action);
    expect(mutation.isLoading).toBeFalse();
    mutation.execute();
    expect(mutation.isLoading).toBeTrue();
  });
  it('should change status to error', () => {
    const action = jasmine
      .createSpy()
      .and.returnValue(throwError(() => new Error()));
    const mutation = new Mutation([1], action);
    expect(mutation.isError).toBeFalse();
    mutation.execute();
    expect(mutation.isError).toBeTrue();
    expect(mutation.isSuccess).toBeFalse();
  });
  it('should change status to success', () => {
    const action = jasmine.createSpy().and.returnValue(of(1));
    const mutation = new Mutation([1], action);
    expect(mutation.isSuccess).toBeFalse();
    mutation.execute();
    expect(mutation.isSuccess).toBeTrue();
  });

  it('should show isUsed if there are active subscribers', () => {
    const action = jasmine.createSpy().and.returnValue(of(1));
    const mutation = new Mutation([1], action);

    expect(mutation.isUsed).toBeFalse();
    const sb = mutation.subscribe();
    expect(mutation.isUsed).toBeTrue();
    sb.unsubscribe();
    expect(mutation.isUsed).toBeFalse();
  });
});
