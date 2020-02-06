import NodeCache from "./NodeCache";
export default class MemoryUsageCache extends NodeCache {
    private static instance;
    private memoryUsagePercentLimit;
    private constructor();
    static getInstance(memoryUsagePercentLimit?: number, expiryCleranceCycle?: number): MemoryUsageCache;
    get(key: string): any;
    set(key: string, value: any, expiryInSeconds?: number, isImportant?: boolean): void;
    delete(key: string): void;
    clear(): void;
}
