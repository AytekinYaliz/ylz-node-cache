import NodeCache from "./NodeCache";
export default class FirstNCache extends NodeCache {
    private static instance;
    private cacheLimit;
    private unImportantCacheHits;
    private constructor();
    static getInstance(cacheLimit?: number, expiryCleranceCycle?: number): FirstNCache;
    get(key: string): any;
    set(key: string, value: any, expiryInSeconds?: number, isImportant?: boolean): void;
    delete(key: string): void;
    clear(): void;
}
