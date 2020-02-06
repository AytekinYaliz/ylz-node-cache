"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logger = require("@dan/dan-logger");
const NodeCache_1 = require("./NodeCache");
const CacheReplacementPolicy_1 = require("./CacheReplacementPolicy");
class LruCache extends NodeCache_1.default {
    constructor(unImportantCacheLimit, expiryCleranceCycle) {
        super(CacheReplacementPolicy_1.default.LRU, expiryCleranceCycle);
        this.unImportantCacheLimit = unImportantCacheLimit;
        this.unImportantCacheHits = [];
    }
    static getInstance(unImportantCacheLimit = 100, expiryCleranceCycle = 1000) {
        if (!LruCache.instance) {
            LruCache.instance = new LruCache(unImportantCacheLimit, expiryCleranceCycle);
        }
        return LruCache.instance;
    }
    get(key) {
        logger.debug("LruCache - Get:", key);
        const importantCache = super.get(key);
        if (importantCache !== undefined) {
            let hitItem = null;
            this.unImportantCacheHits.forEach((item, i, arr) => {
                if (!hitItem) {
                    if (item.key === key) {
                        hitItem = arr[i];
                    }
                }
                else {
                    if (i < arr.length) {
                        arr[i - 1] = arr[i];
                        if (i === arr.length - 1) {
                            arr[i] = Object.assign({}, hitItem, { lastHit: Date.now() });
                        }
                    }
                }
            });
        }
        return importantCache;
    }
    set(key, value, expiryInSeconds, isImportant = false) {
        logger.debug("LruCache - Set:", key, JSON.stringify(value), expiryInSeconds, isImportant);
        if (isImportant) {
            super.set(key, value, expiryInSeconds);
            return;
        }
        let hitItem = null;
        this.unImportantCacheHits.forEach((item, i, arr) => {
            if (!hitItem) {
                if (arr[i].key === key) {
                    hitItem = arr[i];
                }
            }
            else {
                if (i < arr.length) {
                    arr[i - 1] = arr[i];
                    if (i === arr.length - 1) {
                        arr[i] = Object.assign({}, hitItem, { lastHit: Date.now() });
                    }
                }
            }
        });
        if (!hitItem) {
            if (this.unImportantCacheHits.length < this.unImportantCacheLimit) {
                super.set(key, value, expiryInSeconds);
                this.unImportantCacheHits.push({ key, lastHit: Date.now() });
            }
            else {
                this.delete(key);
                super.set(key, value, expiryInSeconds);
                this.unImportantCacheHits.push({ key, lastHit: Date.now() });
                const deleted = this.unImportantCacheHits.shift();
                this.delete(deleted.key);
            }
        }
    }
    delete(key) {
        logger.debug("LruCache - Delete:", key);
        super.delete(key);
        const index = this.unImportantCacheHits.findIndex(x => x.key === key);
        if (index > -1) {
            this.unImportantCacheHits.splice(index, 1);
        }
    }
    clear() {
        logger.debug("LruCache - Clear:");
        super.clear();
        this.unImportantCacheHits = [];
    }
    getSize() {
        return [super.size, this.unImportantCacheHits.length];
    }
}
exports.default = LruCache;
//# sourceMappingURL=LruCache.js.map