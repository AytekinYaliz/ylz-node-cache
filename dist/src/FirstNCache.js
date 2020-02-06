"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logger = require("@dan/dan-logger");
const NodeCache_1 = require("./NodeCache");
const CacheReplacementPolicy_1 = require("./CacheReplacementPolicy");
class FirstNCache extends NodeCache_1.default {
    constructor(cacheLimit, expiryCleranceCycle) {
        super(CacheReplacementPolicy_1.default.LRU, expiryCleranceCycle);
        this.cacheLimit = cacheLimit;
        this.unImportantCacheHits = new Set();
    }
    static getInstance(cacheLimit = 1000, expiryCleranceCycle = 1000) {
        if (!FirstNCache.instance) {
            FirstNCache.instance = new FirstNCache(cacheLimit, expiryCleranceCycle);
        }
        return FirstNCache.instance;
    }
    get(key) {
        logger.debug("FirstNCache - Get:", key);
        return super.get(key);
    }
    set(key, value, expiryInSeconds, isImportant = false) {
        logger.debug("FirstNCache - Set:", key, JSON.stringify(value), expiryInSeconds, isImportant);
        if (isImportant || super.hasKey(key)) {
            super.set(key, value, expiryInSeconds);
        }
        if (this.unImportantCacheHits.size < this.cacheLimit) {
            super.set(key, value, expiryInSeconds);
            this.unImportantCacheHits.add(key);
        }
        else {
        }
    }
    delete(key) {
        logger.debug("FirstNCache - Delete:", key);
        super.delete(key);
        this.unImportantCacheHits.delete(key);
    }
    clear() {
        logger.debug("FirstNCache - Clear:");
        super.clear();
        this.unImportantCacheHits.clear();
    }
}
exports.default = FirstNCache;
//# sourceMappingURL=FirstNCache.js.map