class LRUCache {
  constructor(len) {
    this.len = len;
    this.map = new Map();
  }
  set(key, value) {
    const keys = this.map.keys();
    const first = keys.next().value;
    if (this.map.size === this.len) {
      this.map.delete(first);
    }
    if (this.map.get(key)) {
      this.map.delete(key);
    }
    this.map.set(key, value);
  }
  get(key) {
    const value = this.map.get(key);
    if (value) {
      this.map.delete(key);
      this.map.set(key, value);
    }
    return value;
  }
}

const lruCache = new LRUCache(2); // 最大缓存长度 2
lruCache.set(1, 1); // 缓存是 {1=1}
lruCache.set(2, 2); // 缓存是 {1=1, 2=2}
console.log(lruCache.get(1)); // 返回 1
lruCache.set(3, 3); // 该操作会使得关键字 2 作废，缓存是 {1=1, 3=3}
console.log(lruCache.get(2)); // 返回 null
// console.log("lruCache", lruCache);
lruCache.set(4, 4); // 该操作会使得关键字 1 作废，缓存是 {4=4, 3=3}
console.log(lruCache.get(1)); // 返回 null
console.log(lruCache.get(3)); // 返回 3
console.log(lruCache.get(4)); // 返回 4
