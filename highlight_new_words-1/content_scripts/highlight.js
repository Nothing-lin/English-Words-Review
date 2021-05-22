//生词本
var newWords;
//当前要显示的节点
var currNode
//鼠标节点（实时）
var mouseNode
//已经显示了的节点
var showedNode
//是否允许隐藏气泡
var isAllowHideBubble = true
//气泡显示/隐藏延迟时间(ms)
var delayed = 100
//生词信息列表


//调用初始化函数init()
$(function() {
  init()
})


/**
 * 初始化
 */
function init() {
  //从localstorege获取生词列表，高亮所有匹配的节点
  //在popup.js中已经使用chrome.storage.local.set()方法向本地中存储了数组对象newWords
  chrome.storage.local.get("newWords", function(result) {
    //定义一个before变量来存储调用单词所用的时间
    var before = new Date().getTime()
    //定义变量newWords来存储从本地中获取的数组对象newWords
    newWords = result.newWords;
    //这里调用下面定义的highlight函数，再向里面传入下面定义的textNodeUnder函数
    highlight(textNodesUnder(document.body))
    //在控制台输出获取本地单词所用的时间
    console.log("解析总耗时：" + (new Date().getTime() - before) + " ms")
    //在插入节点时修改
    //当监听到dom内容有东西假如时，触发onNodeInserted方法，不捕获变化事件
    //下面的监听是针对highlight(textNodesUnder(document.body))进行的，这个方法将会对dom插入内容
    // document.addEventListener("DOMNodeInserted", onNodeInserted, false);
  })

  //监听xml导入成功消息
  //这个是监听我们导入的XML生词本是否成功的函数
  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.type == "importSuccess") {
      alert("导入生词本成功")
    }
  })
}



/**
 *
 * @param nodes 高亮所有节点
 *
 */
function highlight(nodes) {
  for (var i = 0; i < nodes.length; i++) {
    var node = nodes[i]
    var text = node.textContent
    //如果这个节点没有内容存在的话就进入下一个节点
    if (text.trim() == "") {
      continue
    }
    //新节点的内容
    //newNodeChildrens这个变量是装载生词库中即将高亮的词
    var newNodeChildrens = highlightNode(text)
    var parent_node = node.parentNode
    //替换新节点
    if (newNodeChildrens.length == 0) {
      continue;
    }
    //处理a标签显示异常
    if (parent_node.tagName.toLowerCase() == "a") {
      //a.style.display的意思
      parent_node.style.display = "inline-block";
      // $(parent_node).css("display", "inline-block");
    }
    for (var j = 0; j < newNodeChildrens.length; j++) {
      //在node节点中插入newNodeChildrens[j]内容，然后再删除原来的node节点进行节点内容的替换
      parent_node.insertBefore(newNodeChildrens[j], node);
    }
    parent_node.removeChild(node);

  }


}

/**
 * 高亮单个节点
 * @param text
 */
function highlightNode(texts) {
  // return [$("<span>").css("background", "red").text(texts)[0]]
  //将句子解析成待检测单词列表
  var words = [];

  //使用split
  var tempTexts = texts.split(" ")
  for (i in tempTexts) {
    var tempText = tempTexts[i].trim()
    if (tempText != "") {
      words.push(tempText)
    }
  }

  if (words.length >= 1) {
    //处理后结果
    var newNodeChildrens = []
    //剩下未处理的字符串
    var remainTexts = texts
    //已处理部分字符串
    var checkedText = ""
    for (var i = 0; i < words.length; i++) {
      var word = words[i]
      //当前所处位置
      var pos2 = remainTexts.indexOf(word)
      //匹配单词
      // if (newWords.indexOf(word.toLowerCase()) !== -1) {
      if (newWords.wordInfos.hasOwnProperty(word.toLowerCase())) {
        //匹配成功
        //添加已处理部分到节点
        if (checkedText != "") {
          newNodeChildrens.push(document.createTextNode(checkedText))
          checkedText = ""
        }
        if (pos2 == 0) {
          // wordxx类型
          newNodeChildrens.push(hightlightText(word))
        } else {
          //xxwordxx类型
          // var preText = remainTexts.slice(0, pos2)
          // if (i == 0 && preText.trim() == " ") {
          //     //处理<xx> <xxx>之间的空格问题
          //     newNodeChildrens.push($("<span>").text(preText)[0])
          // } else {
          newNodeChildrens.push(document.createTextNode(remainTexts.slice(0, pos2)))
          // }
          newNodeChildrens.push(hightlightText(word))
        }
      } else {
        //匹配失败，追加到已处理字符串
        checkedText += remainTexts.slice(0, pos2 + word.length)
      }
      //删除已处理的字符(到当前单词的位置)
      remainTexts = remainTexts.slice(pos2 + word.length)
    }
    //处理最末尾
    if (newNodeChildrens.length != 0) {
      if (checkedText != "") {
        newNodeChildrens.push(document.createTextNode(checkedText))
      }
      newNodeChildrens.push(document.createTextNode(remainTexts))
    }
  }
  return newNodeChildrens
}


/**
 * 高亮单个单词
 * @param text
 * @returns {*}
 */
function hightlightText(text) {
  //注意jqury对象转为dom对象使用[0]或者.get(0),但是为什么这样？
  return $("<xqdd_highlight_new_word>").attr("class", "xqdd_highlight_new_word").text(text)[0];
}


/**
 * 过滤所有文本节点
 * @param el
 * @returns {Array}
 */
function textNodesUnder(el) {
  var n, a = [],
    walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, mygoodfilter, false);
    //n=walk.nextNode()作为条件表示如果n被walk.nextNode()进行赋值的话就执行
    //不是表示n等于walk.nextNode()的时候执行，表示等于的符号是==，而=是赋值的意思
  while (n = walk.nextNode()) {
    a.push(n);
  }
  return a;
}


/**
 * 节点过滤器
 * @param node
 * @returns {number}
 */
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

// /**
//  * 节点插入时判断高亮
//  * @param event
//  */
// function onNodeInserted(event) {
//   var inobj = event.target;
//   if (!inobj)
//     return;
//   var classattr = null;
//   if (typeof inobj.getAttribute !== 'function') {
//     return;
//   }
//   try {
//     classattr = inobj.getAttribute('class');
//   } catch (e) {
//     return;
//   }
//   if (!classattr || !classattr.startsWith("xqdd")) {
//     highlight(textNodesUnder(inobj))
//   }
// }
