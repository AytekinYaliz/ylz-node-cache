import CacheReplacementPolicy from "./CacheReplacementPolicy";
export default abstract class NodeCache {
    private policy;
    private cache;
    private expiryCleranceCycle;
    private cacheHitCount;
    constructor(policy: CacheReplacementPolicy, expiryCleranceCycle?: number);
    get(key: string): any;
    set(key: string, value: any, expiryInSeconds?: number): void;
    delete(key: string): void;
    hasKey(key: string): boolean;
    protected clear(): void;
    protected clearExpiredCache(): void;
    protected readonly size: number;
    getItems(): IterableIterator<string>;
}
