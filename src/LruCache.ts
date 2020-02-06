import * as logger from "@ylz/logger";

import NodeCache from "./NodeCache";
import CacheReplacementPolicy from "./CacheReplacementPolicy";

interface CacheHit {
  key: string;
  lastHit: number;
}
/**
 * Least Recently Used Caching Policy
 * It uses parent cache for important items.
 * This algorithm requires keeping track of what was used when,
 * which is expensive if one wants to make sure the algorithm always discards the least recently used item (LAST-HIT).
 * There is a default cache clearence job coming from NodeCache.
 */
export default class LruCache extends NodeCache {
  private static instance: LruCache;
  private unImportantCacheLimit: number;
  private unImportantCacheHits: CacheHit[];

  private constructor(unImportantCacheLimit: number, expiryCleranceCycle: number) {
    super(CacheReplacementPolicy.LRU, expiryCleranceCycle);
    this.unImportantCacheLimit = unImportantCacheLimit;
    this.unImportantCacheHits = [];
  }

  /**
   * Creates the singleton instance.
   * @param unImportantCacheLimit DDDD
   * @param expiryCleranceCycle Cache clearance cycle for expired cache items.
   */
  public static getInstance(unImportantCacheLimit: number = 100, expiryCleranceCycle: number = 1000) {
    if (!LruCache.instance) {
      LruCache.instance = new LruCache(unImportantCacheLimit, expiryCleranceCycle);
    }

    return LruCache.instance;
  }

  public get(key: string): any {
    logger.debug("LruCache - Get:", key);

    // importantCache
    const importantCache = super.get(key);

    if (importantCache !== undefined) {
      let hitItem: CacheHit = null;

      this.unImportantCacheHits.forEach((item, i, arr) => {
        if (!hitItem) {
          // Not a hit yet
          if (item.key === key) {
            hitItem = arr[i];
          }
        } else {
          // Hit already
          if (i < arr.length) {
            arr[i - 1] = arr[i];
            if (i === arr.length - 1) {
              arr[i] = { ...hitItem, lastHit: Date.now() };
            }
          }
        }
      });
    }

    return importantCache;
  }
  public set(key: string, value: any, expiryInSeconds?: number, isImportant: boolean = false): void {
    logger.debug("LruCache - Set:", key, JSON.stringify(value), expiryInSeconds, isImportant);

    if (isImportant) {
      super.set(key, value, expiryInSeconds);
      return;
    }

    let hitItem: CacheHit = null;

    this.unImportantCacheHits.forEach((item, i, arr) => {
      if (!hitItem) {
        // Not a hit yet
        if (arr[i].key === key) {
          hitItem = arr[i];
        }
      } else {
        // Hit already
        if (i < arr.length) {
          arr[i - 1] = arr[i];
          if (i === arr.length - 1) {
            arr[i] = { ...hitItem, lastHit: Date.now() };
          }
        }
      }
    });

    if (!hitItem) {
      // Not a hit in the list
      if (this.unImportantCacheHits.length < this.unImportantCacheLimit) {
        // There is space in CacheHits.
        super.set(key, value, expiryInSeconds);
        this.unImportantCacheHits.push({ key, lastHit: Date.now() });
      } else {
        // There is NO space in CacheHits.
        this.delete(key);
        super.set(key, value, expiryInSeconds);
        this.unImportantCacheHits.push({ key, lastHit: Date.now() });
        const deleted = this.unImportantCacheHits.shift();
        this.delete(deleted.key);
      }
    }
  }
  public delete(key: string) {
    logger.debug("LruCache - Delete:", key);

    super.delete(key);

    const index = this.unImportantCacheHits.findIndex(x => x.key === key);
    if (index > -1) {
      this.unImportantCacheHits.splice(index, 1);
    }
  }
  public clear() {
    logger.debug("LruCache - Clear:");

    super.clear();
    this.unImportantCacheHits = [];
  }

  public getSize() {
    return [super.size, this.unImportantCacheHits.length];
  }
}
