import LfuCache from "../src/LfuCache";

describe("LfuCache", () => {
  let lfuCache: LfuCache;
  const defaultUnImportantCacheLimit = 10;

  beforeAll(() => {});
  afterAll(() => {});
  beforeEach(() => {
    lfuCache = LfuCache.getInstance(defaultUnImportantCacheLimit);
  });

  it("ImportantCache should be stored in NodeCache object", () => {
    const importantCacheCount = 5;

    for (let i = 0; i < importantCacheCount; i++) {
      lfuCache.set(String(i), i, null, true);
    }

    for (let i = 0; i < importantCacheCount; i++) {
      expect(lfuCache.get(String(i))).toBe(i);
    }

    expect(JSON.stringify(lfuCache.getSize())).toBe(JSON.stringify([importantCacheCount, 0]));
  });

  it.skip("UnImportantCache should be stored in LfuCache object", () => {
    const unImportantCacheCount = 15;

    for (let i = 0; i < unImportantCacheCount; i++) {
      lfuCache.set(String(i), i, null, false);
    }

    console.log(lfuCache.getItems());

    for (let i = 0; i < unImportantCacheCount; i++) {
      if (i < defaultUnImportantCacheLimit) {
        expect(lfuCache.get(String(i))).toBe(i);
      } else {
        expect(lfuCache.get(String(i))).toBe(undefined);
      }
    }

    expect(JSON.stringify(lfuCache.getSize())).toBe(JSON.stringify([0, defaultUnImportantCacheLimit]));
  });

  it.skip("UnImportantCache should be stored in NodeCache object", () => {
    const unImportantCacheCount = 15;

    for (let i = 0; i < unImportantCacheCount; i++) {
      lfuCache.set(String(i), i, null, false);
    }

    for (let i = 0; i < unImportantCacheCount; i++) {
      if (i < defaultUnImportantCacheLimit) {
        expect(lfuCache.get(String(i))).toBe(i);
      } else {
        expect(lfuCache.get(String(i))).toBe(undefined);
      }
    }

    expect(JSON.stringify(lfuCache.getSize())).toBe(JSON.stringify([0, defaultUnImportantCacheLimit]));
  });
});
