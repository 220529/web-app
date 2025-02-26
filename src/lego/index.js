import res from "./h5.json";

// console.log("res", res);

const nodeTree = JSON.parse(res.content.nodeTree);

console.log("nodeTree", nodeTree);

const animations = [
  {
    delay: 3,
    duration: 10,
    infinite: true,
    interationCount: 17,
    label: "闪烁",
    type: "flash",
  },
];
