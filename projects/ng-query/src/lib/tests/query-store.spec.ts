import { TestBed } from '@angular/core/testing';

import { QueryStore } from '../query-store';
import { KeyComparator } from '../key-comparator';
import { Query } from '../query';

describe('QueryStore', () => {
  const comparator = new KeyComparator();
  it('should be created', () => {
    expect(new QueryStore(comparator)).toBeTruthy();
  });

  it('can store query', () => {
    const query1 = { key: [1] } as Query;
    const query2 = { key: [2] } as Query;
    const store = new QueryStore(comparator);
    store.add(query1);
    store.add(query2);
    expect(store.get(query1.key)).toBe(query1);
    expect(store.get(query2.key)).toBe(query2);
  });

  it('can return queries', () => {
    const query1 = { key: [1] } as Query;
    const query2 = { key: [2] } as Query;
    const store = new QueryStore(comparator);
    store.add(query1);
    store.add(query2);
    const queries = store.getAll();
    expect(queries.includes(query1)).toBeTrue();
    expect(queries.includes(query2)).toBeTrue();
  });

  it('throw error if query with same key exists', () => {
    const query1 = { key: [1] } as Query;
    const query2 = { key: [1] } as Query;
    const store = new QueryStore(comparator);
    store.add(query1);
    expect(() => store.add(query2)).toThrow();
  });

  it('throw error if query key is empty', () => {
    const query1 = { key: [] as any } as Query;
    const query2 = { key: null as any } as Query;
    const query3 = { key: undefined as any } as Query;
    const store = new QueryStore(comparator);
    expect(() => store.add(query1)).toThrow();
    expect(() => store.add(query2)).toThrow();
    expect(() => store.add(query3)).toThrow();
  });

  it('can remove exists query', () => {
    const query = { key: [1] } as Query;
    const store = new QueryStore(comparator);
    store.add(query);
    store.delete(query.key);
    expect(store.get([1])).toBeFalsy();
  });
  it('can remove not exists query', () => {
    const query1 = { key: [1] } as Query;
    const query2 = { key: [2] } as Query;
    const store = new QueryStore(comparator);
    store.add(query1);
    store.delete(query2.key);
    expect(store.get(query1.key)).toBeTruthy();
  });
});
