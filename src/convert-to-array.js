console.log("convert-to-array ------------");

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
// 该平台主要用于运营推广，可以搭建pc、h5长页、h5多页三种页面。平台提供了丰富的可组合组件，通过添加组件、编辑画布、修改属性配置，即可构建各种复杂的活动页，支持一键发布上线。
// 技术栈：vue2、vue-router、vuex、webpack、swiper、element

// 项目职责：
// 1. 
// 2. 设计编辑器组件的渲染流程，持续优页面响应速度
// 优化
// 3. 优化移动端适配方案，搭建一套可同时发布pc端、h5长页版
// 4. 设计开发h5多页版，通过缩放拖拽、配置动画、生成海报等功能，快速搭建活动
// 5. 属性面板可添加埋点采集、插入执行脚本，可快速完成紧急上线需求
// 6. 搭建nest.js项目，实现部分推广活动的后端功能，如：抽奖活动、薪资查询等

  // 优化架构设计、移动端适配方案，搭建项目
  // 优化代码结构、埋点采集

  // 设置面板可添加执行脚本、连续的动画、交互事件、埋点采集，可快速完成紧急上线需求

  const arr = [];
  const stack = [tree];
  while (stack.length) {
    const cur = stack.shift();
    const { id, name } = cur;
    const node = { id, name };
    node.parentId = cur.parentId || 0;
    arr.push(node);
    const children = cur.children;
    if (children?.length) {
      children.forEach(i => {
        i.parentId = cur.id;
        stack.push(i);
      });
    }
  }
  return arr;
}
const arr = convert(tree);
console.info(arr);
