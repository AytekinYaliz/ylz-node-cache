"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logger = require("@dan/dan-logger");
const NodeCache_1 = require("./NodeCache");
const CacheReplacementPolicy_1 = require("./CacheReplacementPolicy");
class MemoryUsageCache extends NodeCache_1.default {
    constructor(memoryUsagePercentLimit, expiryCleranceCycle) {
        super(CacheReplacementPolicy_1.default.LRU, expiryCleranceCycle);
        this.memoryUsagePercentLimit = memoryUsagePercentLimit;
    }
    static getInstance(memoryUsagePercentLimit = 85, expiryCleranceCycle = 1000) {
        if (!MemoryUsageCache.instance) {
            MemoryUsageCache.instance = new MemoryUsageCache(memoryUsagePercentLimit, expiryCleranceCycle);
        }
        return MemoryUsageCache.instance;
    }
    get(key) {
        logger.debug("MemoryUsageCache - Get:", key);
        return super.get(key);
    }
    set(key, value, expiryInSeconds, isImportant = false) {
        const memoryUsage = Object.assign({}, process.memoryUsage(), { usage: (process.memoryUsage().heapUsed / process.memoryUsage().heapTotal).toFixed(2) });
        logger.debug("MemoryUsageCache - Set:", key, JSON.stringify(value), expiryInSeconds, isImportant, JSON.stringify(memoryUsage));
        if (isImportant) {
            super.set(key, value, expiryInSeconds);
        }
        if (memoryUsage.heapUsed / memoryUsage.heapTotal < this.memoryUsagePercentLimit / 100 || super.hasKey(key)) {
            super.set(key, value, expiryInSeconds);
        }
        else {
            logger.debug("!!! MEMORY IS GETTING FULL !!!", JSON.stringify(memoryUsage));
        }
    }
    delete(key) {
        logger.debug("MemoryUsageCache - Delete:", key);
        super.delete(key);
    }
    clear() {
        logger.debug("MemoryUsageCache - Clear:");
        super.clear();
    }
}
exports.default = MemoryUsageCache;
//# sourceMappingURL=MemoryUsageCache.js.map