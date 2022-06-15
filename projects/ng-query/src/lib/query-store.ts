import { Injectable } from '@angular/core';
import { Key } from './types/key.type';
import { Query } from './query';
import { KeyComparator } from './key-comparator';

@Injectable()
export class QueryStore {
  private queries: Query<any, any, any>[] = [];
  constructor(private readonly keyComparator: KeyComparator) {}

  public get(key: Key): Query<any, any, any> | undefined {
    return this.queries.find((q) => this.keyComparator.isEqual(q.key, key));
  }

  public find(key: Key): Query<any, any, any>[] {
    return this.queries.filter((q) =>
      this.keyComparator.partialEqual(q.key, key)
    );
  }

  public add(query: Query<any, any, any>) {
    if (!Array.isArray(query.key) || query.key.length === 0) {
      throw new Error(`Query key must be array`);
    }
    if (this.get(query.key)) {
      throw new Error(`Query with key ${query.key} already exist`);
    }
    this.queries.push(query);
  }
  public delete(...keys: Key[]) {
    this.queries = this.queries.filter(
      (q) => !keys.some((key) => this.keyComparator.isEqual(q.key, key))
    );
  }

  public getAll() {
    return [...this.queries] as ReadonlyArray<Query<any, any, any>>;
  }
}
