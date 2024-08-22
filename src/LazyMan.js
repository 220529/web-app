// ```js
//     const me = new LazyMan('双越')
//     me.eat('苹果').eat('香蕉').sleep(5).eat('葡萄') // 打印结果如下：

//     // '双越 eat 苹果'
//     // '双越 eat 香蕉'
//     // （等待 5s）
//     // '双越 eat 葡萄'
// ```;
class Man {
  constructor(name) {
    this.name = name;
    this.tasks = [];
    this.run();
  }
  eat(log) {
    this.tasks.push(() => {
      console.log(`${this.name} eat ${log}`);
      this.next();
    });
    return this;
  }
  sleep(time) {
    this.tasks.push(() => {
      console.log(`等待${time}s`);
      setTimeout(() => {
        this.next();
      }, time * 1000);
    });
    return this;
  }
  next() {
    const target = this.tasks.shift();
    target && target();
  }
  run() {
    setTimeout(() => {
      this.next();
    }, 0);
  }
}
const me = new Man("kk");
me.eat("苹果").eat("香蕉").sleep(5).eat("葡萄");
