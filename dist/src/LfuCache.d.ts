import NodeCache from "./NodeCache";
export default class LfuCache extends NodeCache {
    private static instance;
    private unImportantCache;
    private unImportantCacheLimit;
    private unImportantCacheHits;
    private constructor();
    static getInstance(unImportantCacheLimit?: number, expiryCleranceCycle?: number): LfuCache;
    get(key: string): any;
    set(key: string, value: any, expiryInSeconds?: number, isImportant?: boolean): void;
    delete(key: string): void;
    clear(): void;
    protected clearExpiredCache(): void;
    private hitAndReorder;
    getSize(): number[];
}
