"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logger = require("@dan/dan-logger");
class NodeCache {
    constructor(policy, expiryCleranceCycle = 1000) {
        this.cacheHitCount = 0;
        this.policy = policy;
        this.cache = new Map();
        this.expiryCleranceCycle = expiryCleranceCycle;
    }
    get(key) {
        logger.debug("NodeCache - Get:", key);
        this.cacheHitCount++;
        if (this.cacheHitCount % this.expiryCleranceCycle === 0) {
            this.clearExpiredCache();
        }
        const obj = this.cache.get(key);
        if (obj === undefined) {
            return undefined;
        }
        if (obj._ex && obj._ex < Date.now()) {
            this.delete(key);
            return undefined;
        }
        return obj._value;
    }
    set(key, value, expiryInSeconds) {
        logger.debug("NodeCache - Set:", key, JSON.stringify(value), expiryInSeconds);
        this.cache.set(key, Object.assign({ _value: value }, (expiryInSeconds && { _ex: Date.now() + expiryInSeconds * 1000 })));
    }
    delete(key) {
        logger.debug("NodeCache - Delete:", key);
        this.cache.delete(key);
    }
    hasKey(key) {
        logger.debug("NodeCache - HasKey:", key);
        const obj = this.cache.get(key);
        if (obj === undefined) {
            return false;
        }
        if (obj._ex && obj._ex < Date.now()) {
            this.delete(key);
            return false;
        }
        return true;
    }
    clear() {
        this.cache.clear();
    }
    clearExpiredCache() {
        logger.debug("NodeCache - ClearExpiredCache:");
        this.cacheHitCount = 0;
        this.cache.forEach((value, key) => {
            if (value._ex && value._ex < Date.now()) {
                this.delete(key);
            }
        });
    }
    get size() {
        return this.cache.size;
    }
    getItems() {
        return this.cache.keys();
    }
}
exports.default = NodeCache;
//# sourceMappingURL=NodeCache.js.map