import * as logger from "@ylz/logger";

import NodeCache from "./NodeCache";
import CacheReplacementPolicy from "./CacheReplacementPolicy";

interface CacheHit {
  key: string;
  count: number;
}
/**
 * Least Frequently Used Caching Policy
 * It uses parent cache for important items.
 * The standard characteristics of this method involve the system keeping track of
 * the number of times a block is referenced in memory.
 * When the cache is full and requires more room the system will purge the item with the lowest reference frequency (HIT_COUNT).
 * There is a default cache clearence job coming from NodeCache.
 */
export default class LfuCache extends NodeCache {
  private static instance: LfuCache;
  private unImportantCache: Map<string, any>;
  private unImportantCacheLimit: number;
  private unImportantCacheHits: CacheHit[];

  private constructor(unImportantCacheLimit: number, expiryCleranceCycle: number) {
    super(CacheReplacementPolicy.LFU, expiryCleranceCycle);
    this.unImportantCache = new Map<string, any>();
    this.unImportantCacheLimit = unImportantCacheLimit;
    this.unImportantCacheHits = [];
  }

  /**
   * Creates the singleton instance.
   * @param unImportantCacheLimit
   * @param expiryCleranceCycle Cache clearance cycle for expired cache items.
   */
  public static getInstance(unImportantCacheLimit: number = 100, expiryCleranceCycle: number = 1000) {
    if (!LfuCache.instance) {
      LfuCache.instance = new LfuCache(expiryCleranceCycle, expiryCleranceCycle);
    }

    return LfuCache.instance;
  }

  public get(key: string): any {
    logger.debug("LfuCache - Get:", key);

    // importantCache
    const importantCache = super.get(key);

    if (importantCache !== undefined) {
      return importantCache;
    }

    // unImportantCache
    const obj = this.unImportantCache.get(key);

    this.hitAndReorder(key);

    if (obj === undefined) {
      return undefined;
    }

    if (obj._ex && obj._ex < Date.now()) {
      this.delete(key);
      return undefined;
    }

    return obj._value;
  }
  public set(key: string, value: any, expiryInSeconds?: number, isImportant: boolean = false): void {
    logger.debug("LfuCache - Set:", key, JSON.stringify(value), expiryInSeconds, isImportant);

    if (isImportant) {
      // delete first
      super.set(key, value, expiryInSeconds);
      return;
    }

    // TODO: if it is in the cache already we should update the cache
    // TODO: if the count goes out of the limit, we should replace with the LFU cache item
    if (this.unImportantCache.size < this.unImportantCacheLimit) {
      this.unImportantCache.set(key, {
        _value: value,
        ...(expiryInSeconds && { _ex: Date.now() + expiryInSeconds * 1000 })
      });
    }

    this.hitAndReorder(key);
  }
  public delete(key: string) {
    logger.debug("LfuCache - Delete:", key);

    super.delete(key);
    this.unImportantCache.delete(key);

    const index = this.unImportantCacheHits.findIndex(x => x.key === key);
    if (index > -1) {
      this.unImportantCacheHits.splice(index, 1);
    }
  }
  public clear() {
    logger.debug("LfuCache - Clear:");

    super.clear();
    this.unImportantCacheHits = [];
  }
  protected clearExpiredCache() {
    logger.debug("LfuCache - ClearExpiredCache:");

    super.clearExpiredCache();

    this.unImportantCache.forEach((value: any, key: string, map) => {
      if (value._ex && value._ex < Date.now()) {
        this.unImportantCache.delete(key);
      }
    });
  }
  private hitAndReorder(key: string) {
    const index = this.unImportantCacheHits.findIndex(x => x.key === key);

    if (index === -1) {
      this.unImportantCacheHits.push({ key, count: 1 });
    } else {
      this.unImportantCacheHits[index].count++;

      for (let i = index - 1; i >= 0; i--) {
        const itemAtI = this.unImportantCacheHits[i];
        const itemAtIPlus1 = this.unImportantCacheHits[i + 1];

        if (itemAtI.count <= itemAtIPlus1.count) {
          [this.unImportantCacheHits[i], this.unImportantCacheHits[i + 1]] = [this.unImportantCacheHits[i + 1], this.unImportantCacheHits[i]];
        }
      }
    }
  }

  public getSize() {
    return [super.size, this.unImportantCache.size];
  }
}
