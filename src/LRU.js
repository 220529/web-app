class LRUCache {
  constructor(parameters) {
    this.nodes = [];
  }
  set() {}
  get() {}
}

const lruCache = new LRUCache(2); // 最大缓存长度 2
lruCache.set(1, 1); // 缓存是 {1=1}
lruCache.set(2, 2); // 缓存是 {1=1, 2=2}
lruCache.get(1); // 返回 1
lruCache.set(3, 3); // 该操作会使得关键字 2 作废，缓存是 {1=1, 3=3}
lruCache.get(2); // 返回 null
lruCache.set(4, 4); // 该操作会使得关键字 1 作废，缓存是 {4=4, 3=3}
lruCache.get(1); // 返回 null
lruCache.get(3); // 返回 3
lruCache.get(4); // 返回 4
