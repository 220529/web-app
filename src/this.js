var name = "kkk";
const obj = {
  name: "Alice",
  greet() {
    console.log("greet11: ", this.name);
  },
  say: () => {
    console.log("say12: ", this.name);
  },
};
obj.greet();
obj.say();
