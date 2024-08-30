// myInstance.js
class MyClass {
  constructor() {
    this.value = Math.random();
  }

  getValue() {
    return this.value;
  }
}

const instance = new MyClass();

export default instance;
