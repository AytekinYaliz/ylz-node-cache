"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logger = require("@dan/dan-logger");
const NodeCache_1 = require("./NodeCache");
const CacheReplacementPolicy_1 = require("./CacheReplacementPolicy");
class LfuCache extends NodeCache_1.default {
    constructor(unImportantCacheLimit, expiryCleranceCycle) {
        super(CacheReplacementPolicy_1.default.LFU, expiryCleranceCycle);
        this.unImportantCache = new Map();
        this.unImportantCacheLimit = unImportantCacheLimit;
        this.unImportantCacheHits = [];
    }
    static getInstance(unImportantCacheLimit = 100, expiryCleranceCycle = 1000) {
        if (!LfuCache.instance) {
            LfuCache.instance = new LfuCache(expiryCleranceCycle, expiryCleranceCycle);
        }
        return LfuCache.instance;
    }
    get(key) {
        logger.debug("LfuCache - Get:", key);
        const importantCache = super.get(key);
        if (importantCache !== undefined) {
            return importantCache;
        }
        const obj = this.unImportantCache.get(key);
        this.hitAndReorder(key);
        if (obj === undefined) {
            return undefined;
        }
        if (obj._ex && obj._ex < Date.now()) {
            this.delete(key);
            return undefined;
        }
        return obj._value;
    }
    set(key, value, expiryInSeconds, isImportant = false) {
        logger.debug("LfuCache - Set:", key, JSON.stringify(value), expiryInSeconds, isImportant);
        if (isImportant) {
            super.set(key, value, expiryInSeconds);
            return;
        }
        if (this.unImportantCache.size < this.unImportantCacheLimit) {
            this.unImportantCache.set(key, Object.assign({ _value: value }, (expiryInSeconds && { _ex: Date.now() + expiryInSeconds * 1000 })));
        }
        this.hitAndReorder(key);
    }
    delete(key) {
        logger.debug("LfuCache - Delete:", key);
        super.delete(key);
        this.unImportantCache.delete(key);
        const index = this.unImportantCacheHits.findIndex(x => x.key === key);
        if (index > -1) {
            this.unImportantCacheHits.splice(index, 1);
        }
    }
    clear() {
        logger.debug("LfuCache - Clear:");
        super.clear();
        this.unImportantCacheHits = [];
    }
    clearExpiredCache() {
        logger.debug("LfuCache - ClearExpiredCache:");
        super.clearExpiredCache();
        this.unImportantCache.forEach((value, key, map) => {
            if (value._ex && value._ex < Date.now()) {
                this.unImportantCache.delete(key);
            }
        });
    }
    hitAndReorder(key) {
        const index = this.unImportantCacheHits.findIndex(x => x.key === key);
        if (index === -1) {
            this.unImportantCacheHits.push({ key, count: 1 });
        }
        else {
            this.unImportantCacheHits[index].count++;
            for (let i = index - 1; i >= 0; i--) {
                const itemAtI = this.unImportantCacheHits[i];
                const itemAtIPlus1 = this.unImportantCacheHits[i + 1];
                if (itemAtI.count <= itemAtIPlus1.count) {
                    [this.unImportantCacheHits[i], this.unImportantCacheHits[i + 1]] = [this.unImportantCacheHits[i + 1], this.unImportantCacheHits[i]];
                }
            }
        }
    }
    getSize() {
        return [super.size, this.unImportantCache.size];
    }
}
exports.default = LfuCache;
//# sourceMappingURL=LfuCache.js.map