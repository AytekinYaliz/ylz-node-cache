import * as logger from "@ylz/logger";

import NodeCache from "./NodeCache";
import CacheReplacementPolicy from "./CacheReplacementPolicy";
// import { Z_FIXED } from "zlib";

/**
 * Memory Usage Caching Policy
 * This algorithm keeps tracking of the memory usage  of what was used when,
 * which is expensive if one wants to make sure the algorithm always discards the least recently used item.
 * There is a default cache clearence job coming from NodeCache.
 *
 * process.memoryUsage() = {
 *   rss:       138944512,  // Resident Set Size, it is the total memory allocated for the process execution
 *   heapTotal: 112848896,  // the total size of the allocated heap
 *   heapUsed:  89431144,   // the actual memory used during the execution of our process
 *   external:  9117        // the memory used by “C++ objects bound to JavaScript objects managed by V8”
 * }
 */
export default class MemoryUsageCache extends NodeCache {
  private static instance: MemoryUsageCache;
  private memoryUsagePercentLimit: number;

  private constructor(memoryUsagePercentLimit: number, expiryCleranceCycle: number) {
    super(CacheReplacementPolicy.LRU, expiryCleranceCycle);
    this.memoryUsagePercentLimit = memoryUsagePercentLimit;
  }

  /**
   * Creates the singleton instance.
   * @param memoryUsagePercentLimit Limit of the memory usage percentage for unImportant cache items. Between [1-100]
   * @param expiryCleranceCycle Cache clearance cycle for expired cache items.
   */
  public static getInstance(memoryUsagePercentLimit: number = 85, expiryCleranceCycle: number = 1000) {
    if (!MemoryUsageCache.instance) {
      MemoryUsageCache.instance = new MemoryUsageCache(memoryUsagePercentLimit, expiryCleranceCycle);
    }

    return MemoryUsageCache.instance;
  }

  public get(key: string): any {
    logger.debug("MemoryUsageCache - Get:", key);

    return super.get(key);
  }
  public set(key: string, value: any, expiryInSeconds?: number, isImportant: boolean = false): void {
    const memoryUsage = {
      ...process.memoryUsage(),
      usage: (process.memoryUsage().heapUsed / process.memoryUsage().heapTotal).toFixed(2)
    };
    logger.debug("MemoryUsageCache - Set:", key, JSON.stringify(value), expiryInSeconds, isImportant, JSON.stringify(memoryUsage));

    if (isImportant) {
      super.set(key, value, expiryInSeconds);
    }

    if (memoryUsage.heapUsed / memoryUsage.heapTotal < this.memoryUsagePercentLimit / 100 || super.hasKey(key)) {
      super.set(key, value, expiryInSeconds);
    } else {
      // No saving.
      logger.debug("!!! MEMORY IS GETTING FULL !!!", JSON.stringify(memoryUsage));
    }
  }
  public delete(key: string) {
    logger.debug("MemoryUsageCache - Delete:", key);

    super.delete(key);
  }
  public clear() {
    logger.debug("MemoryUsageCache - Clear:");

    super.clear();
  }
}
