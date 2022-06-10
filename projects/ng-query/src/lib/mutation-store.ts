import { Injectable } from '@angular/core';
import { Key } from './types/key.type';
import { Mutation } from './mutation';
import { Query } from './query';
import { KeyComparator } from './key-comparator';

@Injectable()
export class MutationStore {
  private mutations: Mutation[] = [];
  constructor(private readonly keyComparator: KeyComparator) {}

  public get(key: Key): Mutation | undefined {
    return this.mutations.find((q) => this.keyComparator.isEqual(q.key, key));
  }
  public add(mutation: Mutation) {
    if (!Array.isArray(mutation.key) || mutation.key.length === 0) {
      throw new Error(`Mutation key must be array`);
    }
    if (this.get(mutation.key)) {
      throw new Error(`Mutation with key ${mutation.key} already exist`);
    }
    this.mutations.push(mutation);
  }
  public delete(...keys: Key[]) {
    this.mutations = this.mutations.filter(
      (q) => !keys.some((key) => this.keyComparator.isEqual(q.key, key))
    );
  }
}
