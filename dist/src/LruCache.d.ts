import NodeCache from "./NodeCache";
export default class LruCache extends NodeCache {
    private static instance;
    private unImportantCacheLimit;
    private unImportantCacheHits;
    private constructor();
    static getInstance(unImportantCacheLimit?: number, expiryCleranceCycle?: number): LruCache;
    get(key: string): any;
    set(key: string, value: any, expiryInSeconds?: number, isImportant?: boolean): void;
    delete(key: string): void;
    clear(): void;
    getSize(): number[];
}
