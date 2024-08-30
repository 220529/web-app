var name = "kkk";
const obj = {
  name: "Alice",
  greet() {
    console.log("greet: ", this.name);
  },
  say: () => {
    console.log("say: ", this.name);
  },
};
obj.greet();
obj.say();
