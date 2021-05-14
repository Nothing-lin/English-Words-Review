//调用初始化函数init
$(function() {
  init();
})

//初始化函数init
function init() {
  console.log(textNodesUnder(document.body))
}


//捕获页面中的节点
function textNodesUnder(el) {
  var n, a = [],
    walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, mygoodfilter, false);
  //n=walk.nextNode()作为条件表示如果n被walk.nextNode()进行赋值的话就执行
  //不是表示n等于walk.nextNode()的时候执行，表示等于的符号是==，而=是赋值的意思

  // while (n = walk.nextNode()) {
  //   a.push(n);
  // }

  n = walk.nextNode();
  while (n) {
    n = walk.nextNode();
    a.push(n);
  }

  return a;
}

//过滤页面中的节点，提取文本节点
function mygoodfilter(node) {
  var good_tags_list = [
    "PRE",
    "A",
    "P",
    "H1",
    "H2",
    "H3",
    "H4",
    "H5",
    "H6",
    "B",
    "SMALL",
    "STRONG",
    "Q",
    "DIV",
    "SPAN",
    "LI",
    "TD",
    "OPTION",
    "I",
    "BUTTON",
    "UL",
    "CODE",
    "EM",
    "TH",
    "CITE",
  ];
  if (good_tags_list.indexOf(node.parentNode.tagName) !== -1) {
    return NodeFilter.FILTER_ACCEPT;
  }
  return NodeFilter.FILTER_SKIP;
}
