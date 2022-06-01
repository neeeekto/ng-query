import { KeyComparator } from '../key-comparator';
import { Key } from '../types/key.type';

describe('KeyComparator', () => {
  it('should be created', () => {
    expect(new KeyComparator()).toBeTruthy();
  });

  describe('should compare two keys', () => {
    it('equal', () => {
      const comparator = new KeyComparator();
      const key1 = [1, 'test', 2];
      const key2 = [1, 'test', 2];
      expect(comparator.isEqual(key1, key2)).toBeTrue();
    });

    it('diff length', () => {
      const comparator = new KeyComparator();
      const key1 = [1, 'test'];
      const key2 = [1, 'test', 2];
      expect(comparator.isEqual(key1, key2)).toBeFalse();
    });
    it('diff items', () => {
      const comparator = new KeyComparator();
      const key1 = [1, 1, 'test'];
      const key2 = [1, 'test', 2];
      expect(comparator.isEqual(key1, key2)).toBeFalse();
    });
    it('diff items values but equal if use type conversion', () => {
      const comparator = new KeyComparator();
      const key1 = [1];
      const key2 = ['1'];
      expect(comparator.isEqual(key1, key2)).toBeFalse();
    });
    it('null key', () => {
      const comparator = new KeyComparator();
      const key1: Key = [null];
      const key2: Key = [null];
      expect(comparator.isEqual(key1, key2)).toBeTrue();
    });
  });
  describe('should compare partial keys.', () => {
    it('return true if keys equal', () => {
      const comparator = new KeyComparator();
      const key1: Key = [1];
      const key2: Key = [1];
      expect(comparator.partialEqual(key1, key2)).toBeTrue();
    });
    it('return true if second is part of first', () => {
      const comparator = new KeyComparator();
      const key1: Key = [1, 2];
      const key2: Key = [1];
      expect(comparator.partialEqual(key1, key2)).toBeTrue();
    });
    it('return false if second key is not part of first key', () => {
      const comparator = new KeyComparator();
      const key1: Key = [1, 2, 3];
      const key2: Key = [1, 3];
      expect(comparator.partialEqual(key1, key2)).toBeFalsy();
    });
    it('return false if second key is not part of first key', () => {
      const comparator = new KeyComparator();
      const key1: Key = [2];
      const key2: Key = [1];
      expect(comparator.partialEqual(key1, key2)).toBeFalsy();
    });
    it('return true if empty second key', () => {
      const comparator = new KeyComparator();
      const key1: Key = [2];
      const key2: Key = [];
      expect(comparator.partialEqual(key1, key2)).toBeTrue();
    });
  });
});
