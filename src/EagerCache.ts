import NodeCache from "./NodeCache";
import CacheReplacementPolicy from "./CacheReplacementPolicy";

/**
 * Eager Caching Policy
 * This algorithm does not do any tracking. It just saves the cache item.
 * There is a default cache clearence job coming from NodeCache.
 */
export default class EagerCache extends NodeCache {
  private static instance: EagerCache;

  private constructor(expiryCleranceCycle: number) {
    super(CacheReplacementPolicy.Eager, expiryCleranceCycle);
  }

  public static getInstance(expiryCleranceCycle: number = 1000) {
    if (!EagerCache.instance) {
      EagerCache.instance = new EagerCache(expiryCleranceCycle);
    }

    return EagerCache.instance;
  }
}
