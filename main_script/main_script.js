//初始化一些全局变量
var highlight_words;


//调用初始化函数init
$(function() {
  init();
})

//初始化函数init
function init() {
  //输出dom页面获取到的节点
  console.log(textNodesUnder(document.body))
  //chrome从本地缓存中获取对应的单词数据，然后通过控制台进行输出
  chrome.storage.local.get('words', function(result) {
    highlight_words = result.words;
    console.log(highlight_words);


    //捕获dom中的生词节点并且对其进行高亮显示
    do_hightlight(textNodeUnder(document.body));
  })

}



//-----------------------------------------------------------

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
  //如果匹配到上面的节点名的话就进入if语句中执行NodeFilter.FILTER_ACCEPT
  //如果没有的话就执行NodeFilter.FILTER_SKIP
  //区别在于 n = walk.nextNode(); 不会去识别 NodeFilter.FILTER_SKIP的节点
  if (good_tags_list.indexOf(node.parentNode.tagName) !== -1) {
    return NodeFilter.FILTER_ACCEPT;
  } else {
    return NodeFilter.FILTER_SKIP;
  }
}


//-----------------------------------------------------------
//nodes是传入进来的document.body中的全部节点，由textNodesUnder(el)来提取节点
function do_hightlight(nodes) {
  //使用for循环来遍历全部节点，在for循环的条件内进行有效节点的筛选
  for (var i = 0; i < nodes.length; i++) {
    //定义node变量来转载遍历到的当前节点
    //定义text变量来转载遍历出来的当前节点的文本内容
    var node = nodes[i];
    var text = node.textContent;

    //过滤有效文本，trim可以清除文本中的空格文本
    //如果消除掉空白文本之后的节点文本为空的话，那么就跳过这个节点处理
    if (text.trim() == "") {
      continue;
    }

    //定义一个newNodeChildrens变量来装载我们的新增的自定义的子节点内容
    //highlightNode方法可以根据传入的节点文本内容进行创建一个新的节点内容
    //parentNode是子节点的父节点，<div><p></p></div>,p的父节点就是div
    var highlight_text_Node_Childrens = highlightNode(text);
    var highlight_text_parent_node = node.parentNode;

    //过滤没有生词库单词的节点
    if (highlight_text_Node_Childrens.length == 0) {
      //跳过这一次的循环，继续下一次的循环
      continue;
    }

    //处理a标签的异常显示
    //tagName是指标签名
    if (highlight_text_parent_node.tagName.toLowerCase() == "a") {
      //a.style.display的意思,给处于a标签的高亮文本添加一个inline-block属性，避免高亮显示异常
      highlight_text_parent_node.style.display = "inline-block";
    }

    //在node节点中插入newNodeChildrens[j]内容，然后再删除原来的node节点进行节点内容的替换
    for (var j = 0; j < highlight_text_Node_Childrens.length; j++) {
      highlight_text_parent_node.insertBefore(highlight_text_Node_Childrens[j], node);
    }

    highlight_text_parent_node.removeChild(node);
  }
}


function highlightNode(texts) {
  //我们将传入的texts内容，根据一个空格符号为分界线进行划分，将texts内容分为多个数组
  //比如：“I am  ready to sleep”,于是split(" ")可以使它变为["I","am"," ready","to","sleep"]
  //words数组变量就是用来承接有效的元素，比如上面有个数组为“ ready”，ready前面还有个空格，所以就要对所有的数组元素进行去空格化

  var textsSplit = texts.split(" ");
  var words = [];

  for (i in textsSplit) {
    //定义一个临时文本变量tempTent来装载去空格化之后的数组元素内容
    //然后下面的if条件语句是用来判断去空格化之后的数组元素会不会为空，不为空的话就把数组元素放入words数组中
    //“I am   (三个空格)ready to sleep” --> ["I","am"," (一个空格)"," (一个空格)ready","to","sleep"]
    //像上面的数组中就有一个空格数组，如果进行trim()之后就会变为null,对于这些要进行过滤

    var tempText = textsSplit[i].trim();
    if (tempText != "") {
      words.push(tempText);
    }
  }

  //如果有获得到有效words数组元素的话，也就是有效文本内容的话就执行条件语句
  if (words.length >= 1) {
    //newNodeChildrens数组变量使用来装载新建的字节点的
    //因为我们要对传入的texts进行处理，定义一个已处理和未处理的变量texts_do和texts_not_do
    //“I am  ready to sleep”，我们要比对其中哪些单词是我们的生词，所以要一个一个比对
    //texts_do = "I am  "于是texts_not_do="ready to sleep"
    //因为我们要把这些内容中和生词库的单词匹配的进行处理，处理完后再重新组合为新的节点内容，把原来的节点删除，用这个进行替换

    var newNodeChildrens = [];
    var texts_not_checked = texts;
    var texts_checked = "";

    for (var i = 0; i < words.length; i++) {
      //word装载words数组元素中的单词文本
      //pos是表示我们的目的单词前面有几位？
      //pos="I am  ready to sleep".indexOf(am) = 2,a的前面有2位
      var word = words[i];
      var pos = texts_not_checked.indexOf(word);

      //这个条件过滤用来判断获取的word文本是不是在生词本中的
      if (highlight_words.hasOwnProperty(word.toLowerCase())) {
        //匹配成功

        //判断有没有识别了多个单词之后才匹配到生词库中的生词，如果前面有其他单词的话，就要把他变为普通文本插入newNodeChildrens节点数组中
        //比如ready是生词库中的词，texts_checked="I am ",texts_not_checked="ready to sleep"
        //要将texts_checked="I am "作为独立节点存入数组节点中，这样后面："I am "+"--ready--"+" to sleep"作为新的节点，替换掉之前的旧节点
        if (texts_checked != "") {
          //我们将texts_checked作为文本节点存储进newNodeChildrens节点数组中
          //每遇到一个生词，就重新开始，前面已经检查的部分就归零存入节点数组中，后面处理生词库中的单词，也再存储如节点数组中
          newNodeChildrens.push(document.createTextNode(texts_checked));
          texts_checked = "";
        }


        //如果是word类型就直接执行，如果是Xword类型或者wordXXX类型还要把前面或后面的X给处理
        if (pos == 0) {
          //将生词库中的生词进行高亮处理之后再存储节点数组中进行保存
          newNodeChildrens.push(hightlightText(word));
        } else {
          //如果是xxword的话，也就是pos!=0的话就要把前面的内容存入节点数组中并清除
        }

      } else {
        //匹配失败
        //下面将已经处理过的单词追加到已处理字符串texts_checked中
        //“I am  ready to sleep”,如果texts_checked="I",那么texts_not_checked=“ am  ready to sleep”
        texts_checked += texts_not_checked.slice(0, pos + word.length);
      }

      //删除texts中已经处理过的字符串到当前单词的位置
      //如果texts=“I am  ready to sleep”,如果texts_not_checked = texts_not_checked.slice(1)=“ am  ready to sleep”
      texts_not_checked = texts_not_checked.slice(pos + word.length);
    }

    //处理末尾,暂时不知道这段有没用，暂且先注释掉先
    // if (newNodeChildrens.length != 0) {
    //   if(texts_checked != ""){
    //     newNodeChildrens.push(document.createTextNode(checkedText));
    //   }
    //   newNodeChildrens.push(document.createTextNode(remainTexts));
    //
    // }
  }
  return newNodeChildrens;
}

//对生词库中的文本节点进行处理
function hightlightText(text) {
  return $("<highlight_word>").attr("class", "hightlightWord").text(text)[0]; //我还没想明白这里为什么要使用【0】
}
