function changeArg(x) {
  x = 200;
}

let num = 100;
changeArg(num);
console.log("changeArg num", num); // 100

let obj = { name: "双越" };
changeArg(obj);
console.log("changeArg obj", obj); // obj

function changeArgProp(x) {
  x.name = "张三";
}
changeArgProp(obj);
console.log("changeArgProp obj", obj);
