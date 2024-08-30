console.log("convert-to-tree ------------");
const arr = [
  { id: 1, name: "部门A", parentId: 0 }, // 0 代表顶级节点，无父节点
  { id: 2, name: "部门B", parentId: 1 },
  { id: 3, name: "部门C", parentId: 1 },
  { id: 4, name: "部门D", parentId: 2 },
  { id: 5, name: "部门E", parentId: 2 },
  { id: 6, name: "部门F", parentId: 3 },
];

function convert(arr) {
  let root = null;
  const obj = {};
  for (let i = 0; i < arr.length; i++) {
    const item = arr[i];
    obj[item.id] = item;
    const parent = obj[item.parentId];
    if (parent) {
      parent.children = parent.children || [];
      parent.children.push(item);
    }
    if (item.parentId === 0) {
      root = obj[item.id];
    }
  }
  return root;
}
const tree = convert(arr);
console.info(tree);
// console.info(JSON.stringify(tree));
