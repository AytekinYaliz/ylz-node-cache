import NodeCache from "./NodeCache";
export default class EagerCache extends NodeCache {
    private static instance;
    private constructor();
    static getInstance(expiryCleranceCycle?: number): EagerCache;
}
