import LruCache from "../src/LruCache";

describe("LruCache", () => {
  let lruCache: LruCache;
  const defaultUnImportantCacheLimit = 10;

  beforeAll(() => {
    lruCache = LruCache.getInstance(defaultUnImportantCacheLimit);
  });
  afterAll(() => {});
  beforeEach(() => {
    lruCache.clear();
  });

  it("ImportantCache should be stored in NodeCache object", () => {
    const importantCacheCount = 5;

    for (let i = 0; i < importantCacheCount; i++) {
      lruCache.set(String(i), i, null, true);
    }

    for (let i = 0; i < importantCacheCount; i++) {
      expect(lruCache.get(String(i))).toBe(i);
    }

    expect(JSON.stringify(lruCache.getSize())).toBe(JSON.stringify([importantCacheCount, 0]));
  });

  it("UnImportantCache should be stored in LruCache object", () => {
    for (let i = 0; i < defaultUnImportantCacheLimit; i++) {
      lruCache.set(String(i), i, null, false);
    }

    for (let i = 0; i < defaultUnImportantCacheLimit; i++) {
      expect(lruCache.get(String(i))).toBe(i < defaultUnImportantCacheLimit ? i : undefined);
    }

    expect(JSON.stringify(lruCache.getSize())).toBe(JSON.stringify([defaultUnImportantCacheLimit, defaultUnImportantCacheLimit]));
  });

  it("Should work with first set then get in reverse order", () => {
    const unImportantCacheCount = 15;

    for (let i = 0; i < unImportantCacheCount; i++) {
      lruCache.set(String(i), i, null, false);
    }

    for (let i = unImportantCacheCount - 1; i >= 0; i--) {
      if (i >= unImportantCacheCount - defaultUnImportantCacheLimit) {
        expect(lruCache.get(String(i))).toBe(i);
      } else {
        expect(lruCache.get(String(i))).toBe(undefined);
      }
    }

    expect(JSON.stringify(lruCache.getSize())).toBe(JSON.stringify([10, defaultUnImportantCacheLimit]));
  });

  it("Should work with set & get ", () => {
    const unImportantCacheCount = 20;

    for (let i = 0; i < unImportantCacheCount; i++) {
      lruCache.set(String(i), i, null, false);
      expect(lruCache.get(String(i))).toBe(i);
    }

    expect(JSON.stringify(lruCache.getSize())).toBe(JSON.stringify([10, defaultUnImportantCacheLimit]));
  });

  it("Should work with first set & set some used items & set new items & get", () => {
    const unImportantCacheCount = 20;

    for (let i = 0; i < unImportantCacheCount; i++) {
      lruCache.set(String(i), i, null, false);
    }
    for (let i = 14; i < 16; i++) {
      lruCache.set(String(i), i, null, false);
    }
    for (let i = unImportantCacheCount + 1; i < unImportantCacheCount + 5; i++) {
      lruCache.set(String(i), i, null, false);
    }

    for (let i = 14; i < 16; i++) {
      expect(lruCache.get(String(i))).toBe(i);
    }

    expect(JSON.stringify(lruCache.getSize())).toBe(JSON.stringify([10, defaultUnImportantCacheLimit]));
  });

  it("Should work with first set & set just 1 used item & set 9 new items & get that 1 item", () => {
    const unImportantCacheCount = 20;

    for (let i = 0; i < unImportantCacheCount; i++) {
      lruCache.set(String(i), i, null, false);
    }
    lruCache.set(String(14), 14, null, false);
    for (let i = 1; i < 10; i++) {
      lruCache.set(String(i), i, null, false);
    }
    expect(lruCache.get(String(14))).toBe(14);
    lruCache.set(String(21), 21, null, false);
    for (let i = 1; i <= 10; i++) {
      lruCache.set(String(i), i, null, false);
    }
    expect(lruCache.get(String(14))).toBe(undefined);
    expect(JSON.stringify(lruCache.getSize())).toBe(JSON.stringify([10, defaultUnImportantCacheLimit]));
  });
});
