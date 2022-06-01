import { Key } from './types/key.type';
import { Injectable } from '@angular/core';

@Injectable()
export class KeyComparator {
  public isEqual(key1: Key, key2: Key) {
    if (key1.length !== key2.length) {
      return false;
    }
    for (let i = 0; i < key1.length; i++) {
      if (key1[i] !== key2[i]) {
        return false;
      }
    }

    return true;
  }

  public partialEqual(fullKey: Key, partialKey: Key) {
    if (fullKey.length < partialKey.length) {
      return false;
    }
    for (let i = 0; i < partialKey.length; i++) {
      if (fullKey[i] !== partialKey[i]) {
        return false;
      }
    }
    return true;
  }
}
