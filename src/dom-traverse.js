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

function deep1(node) {
  visitNode(node);
  const children = node.childNodes;
  if (children.length) {
    children.forEach(item => {
      deep(item);
    });
  }
}

function deep2(node) {
  const stack = [node];
  while (stack.length) {
    const node = stack.pop();
    visitNode(node);
    let nodes = [...node.childNodes];
    if (nodes.length) {
      nodes.reverse().forEach(item => stack.push(item));
    }
  }
}

function deep(node) {
  const stack = [node];
  while (stack.length) {
    const cur = stack.pop();
    visitNode(cur);
    const children = cur.childNodes;
    if (children.length) {
      stack.push(...[...children].reverse());
    }
  }
}

function breadth(node) {
  const stack = [node];
  while (stack.length) {
    const cur = stack.shift();
    visitNode(cur);
    const children = cur.childNodes;
    if (children.length) {
      stack.push(...[...children]);
    }
  }
}
// deep(root);
breadth(root);
