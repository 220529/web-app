const root = document.getElementById("root");
console.log("root", root);

/**
 * 访问节点
 * @param n node
 */
function visitNode(n) {
  if (n instanceof Comment) {
    // 注释
    console.info("Comment node ---", n.textContent);
  }
  if (n instanceof Text) {
    // 文本
    const t = n.textContent?.trim();
    if (t) {
      console.info("Text node ---", t);
    }
  }
  if (n instanceof HTMLElement) {
    // element
    console.info("Element node ---", `<${n.tagName.toLowerCase()}>`);
  }
}

const breadth = () => {
  const stack = [root];
  while (stack.length) {
    const target = stack.shift();
    visitNode(target);
    const children = [...target.childNodes];
    for (let i = 0; i < children.length; i++) {
      const element = children[i];
      stack.push(element);
    }
  }
};

breadth();
