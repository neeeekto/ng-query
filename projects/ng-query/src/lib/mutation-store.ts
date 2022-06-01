import { Injectable } from '@angular/core';
import { Key } from './types/key.type';
import { Mutation } from './mutation';

@Injectable()
export class MutationStore {
  private readonly mutations = new Map<string, Mutation>();

  get(key: Key, argHash: string) {
    const stringKey = [...key, argHash].join('-');
    return this.mutations.get(stringKey);
  }

  add(argHash: string, mutation: Mutation) {
    const stringKey = [...mutation.key, argHash].join('-');
    if (this.mutations.has(stringKey)) {
      throw new Error(
        `Mutation with key ${mutation.key} and arg hash ${argHash} already exists`
      );
    }
    this.mutations.set(stringKey, mutation);
  }

  delete(key: Key, argHash: string) {
    const stringKey = [...key, argHash].join('-');
    this.mutations.delete(stringKey);
  }
}
