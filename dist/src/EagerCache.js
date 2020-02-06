"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const NodeCache_1 = require("./NodeCache");
const CacheReplacementPolicy_1 = require("./CacheReplacementPolicy");
class EagerCache extends NodeCache_1.default {
    constructor(expiryCleranceCycle) {
        super(CacheReplacementPolicy_1.default.Eager, expiryCleranceCycle);
    }
    static getInstance(expiryCleranceCycle = 1000) {
        if (!EagerCache.instance) {
            EagerCache.instance = new EagerCache(expiryCleranceCycle);
        }
        return EagerCache.instance;
    }
}
exports.default = EagerCache;
//# sourceMappingURL=EagerCache.js.map