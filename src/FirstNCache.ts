import * as logger from "@ylz/logger";

import NodeCache from "./NodeCache";
import CacheReplacementPolicy from "./CacheReplacementPolicy";

/**
 * First-N Caching Policy
 * It uses parent cache for important items.
 * This algorithm stores the first-N of unImportant cache items (important ones are saved regardless of N).
 * If the cache limit is full it discards new cache items. Items in the cache are cleared by cache clearance job.
 * There is a default cache clearence job coming from NodeCache.
 */
export default class FirstNCache extends NodeCache {
  private static instance: FirstNCache;
  private cacheLimit: number;
  private unImportantCacheHits: Set<string>;

  private constructor(cacheLimit: number, expiryCleranceCycle: number) {
    super(CacheReplacementPolicy.LRU, expiryCleranceCycle);
    this.cacheLimit = cacheLimit;
    this.unImportantCacheHits = new Set<string>();
  }

  /**
   * Creates the singleton instance.
   * @param cacheLimit Limit for the unImportant cache items.
   * @param expiryCleranceCycle Cache clearance cycle for expired cache items.
   */
  public static getInstance(cacheLimit: number = 1000, expiryCleranceCycle: number = 1000) {
    if (!FirstNCache.instance) {
      FirstNCache.instance = new FirstNCache(cacheLimit, expiryCleranceCycle);
    }

    return FirstNCache.instance;
  }

  public get(key: string): any {
    logger.debug("FirstNCache - Get:", key);

    return super.get(key);
  }
  public set(key: string, value: any, expiryInSeconds?: number, isImportant: boolean = false): void {
    logger.debug("FirstNCache - Set:", key, JSON.stringify(value), expiryInSeconds, isImportant);

    if (isImportant || super.hasKey(key)) {
      super.set(key, value, expiryInSeconds);
    }

    if (this.unImportantCacheHits.size < this.cacheLimit) {
      super.set(key, value, expiryInSeconds);
      this.unImportantCacheHits.add(key);
    } else {
      // No saving.
    }
  }
  public delete(key: string) {
    logger.debug("FirstNCache - Delete:", key);

    super.delete(key);
    this.unImportantCacheHits.delete(key);
  }
  public clear() {
    logger.debug("FirstNCache - Clear:");

    super.clear();
    this.unImportantCacheHits.clear();
  }
}
