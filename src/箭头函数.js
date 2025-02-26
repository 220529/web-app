// const obj = {
//   name: "双越",
//   getName: () => {
//     return this.name;
//   },
// };
// console.log(obj.getName());

// const obj = {
//   name: "双越",
// };
// obj.__proto__.getName = () => {
//   return this.name;
// };
// console.log(obj.getName());

const Foo = (name, age) => {
  this.name = name;
  this.age = age;
};
const f = new Foo("张三", 20);
