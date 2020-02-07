import * as logger from "@ylz/logger";
import CacheReplacementPolicy from "./CacheReplacementPolicy";

interface CacheValue {
  _value: any;
  _ex?: number;
}
export default abstract class NodeCache {
  private policy: CacheReplacementPolicy;
  private cache: Map<string, CacheValue>;
  private expiryCleranceCycle: number;
  private cacheHitCount = 0;

  constructor(policy: CacheReplacementPolicy, expiryCleranceCycle: number = 1000) {
    this.policy = policy;
    this.cache = new Map<string, any>();
    this.expiryCleranceCycle = expiryCleranceCycle;
  }

  public get(key: string): any {
    logger.debug("NodeCache - Get:", key);

    this.cacheHitCount++;
    if (this.cacheHitCount % this.expiryCleranceCycle === 0) {
      this.clearExpiredCache();
    }

    const obj = this.cache.get(key);

    if (obj === undefined) {
      return undefined;
    }

    if (obj._ex && obj._ex < Date.now()) {
      this.delete(key);
      return undefined;
    }

    return obj._value;
  }
  public set(key: string, value: any, expiryInSeconds?: number): void {
    logger.debug("NodeCache - Set:", key, JSON.stringify(value), expiryInSeconds);

    this.cache.set(key, {
      _value: value,
      ...(expiryInSeconds && { _ex: Date.now() + expiryInSeconds * 1000 })
    });
  }
  public delete(key: string) {
    logger.debug("NodeCache - Delete:", key);

    this.cache.delete(key);
  }
  public hasKey(key: string) {
    logger.debug("NodeCache - HasKey:", key);

    const obj = this.cache.get(key);

    if (obj === undefined) {
      return false;
    }

    if (obj._ex && obj._ex < Date.now()) {
      this.delete(key);
      return false;
    }

    return true;
  }
  protected clear() {
    this.cache.clear();
  }
  protected clearExpiredCache() {
    logger.debug("NodeCache - ClearExpiredCache:");

    this.cacheHitCount = 0;
    this.cache.forEach((value: any, key: string) => {
      if (value._ex && value._ex < Date.now()) {
        this.delete(key);
      }
    });
  }

  protected get size() {
    return this.cache.size;
  }
  public getItems() {
    return this.cache.keys();
  }
}
