const arr = [
  { id: 1, name: "部门A", parentId: 0 }, // 0 代表顶级节点，无父节点
  { id: 2, name: "部门B", parentId: 1 },
  { id: 3, name: "部门C", parentId: 1 },
  { id: 4, name: "部门D", parentId: 2 },
  { id: 5, name: "部门E", parentId: 2 },
  { id: 6, name: "部门F", parentId: 3 },
];

function convert(arr) {
  const res = {};
  for (let i = 0; i < arr.length; i++) {
    const item = arr[i];
    res[item.id] = item;
    const target = res[item.parentId];
    if (target) {
      if (!target.children) {
        target.children = [];
      }
      target.children.push(item);
    }
  }
  return res[1];
}

const tree = convert(arr);
console.info(tree);
