const tree = {
  id: 1,
  name: "部门A",
  // parentId: 0,
  children: [
    {
      id: 2,
      name: "部门B",
      // parentId: 1,
      children: [
        {
          id: 4,
          name: "部门D",
          // parentId: 2
        },
        {
          id: 5,
          name: "部门E",
          //  parentId: 2
        },
      ],
    },
    {
      id: 3,
      name: "部门C",
      // parentId: 1,
      children: [
        {
          id: 6,
          name: "部门F",
          //  parentId: 3
        },
      ],
    },
  ],
};

function convert(tree) {
  const arr = [];
  const stack = [tree];
  while (stack.length) {
    const target = stack.shift();
    const tamp = {};
    tamp.id = target.id;
    tamp.name = target.name;
    tamp.parentId = target.parentId || 0;
    arr.push(tamp);
    const chilren = target.children;
    if (chilren) {
      chilren.forEach(item => {
        stack.push({ ...item, parentId: target.id });
      });
    }
  }
  return arr;
}

const arr = convert(tree);
console.info(arr);
