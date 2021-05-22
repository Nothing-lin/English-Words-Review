//.on()方法：将一个或多个事件的事件处理程序功能附加到所选元素。
//-->$( "button" ).on( "click", notify );给button元素添加一个click事件
//这一个功能也就是说，当感应到input有文件输入时就触发下面功能
$("#file").on("change", function() {
  //FileReader()是web API
  //FileReader 对象允许Web应用程序异步读取存储在用户计算机上的文件（或原始数据缓冲区）的内容，使用 File 或 Blob 对象指定要读取的文件或数据。
  //https://developer.mozilla.org/zh-CN/docs/Web/API/FileReader
  //FileReader是表示加载输入的文件
  var reader = new FileReader()
  //onload在事件FileReader()读取操作完成时触发，执行对应的函数
  reader.onload = function() {
    //$.parseXML() 函数用于将字符串解析为对应的XML文档。
    //this.result是指传入对应input中传过来的xml文件
    //官方定义是说获取最后一次传入的值，也就是我们传入xml文件的时候，显示前一个处理程序的返回值
    var xml = $($.parseXML(this.result))
    //{}是指包含多个数组，一般使用{}是表示定义对象数组
    var wordInfos = {};
    //[]是指包含多个元素
    var transList = [];
    var phoneticList = [];
    //获取xml文件内的item标签，也就是选中xml中的item标签
    //each(function(i, val) {}是指有多少item就给我显示多少
    //i是index的意思，也就是说第1个或第2个item。
    //val是值的意思，也就是说第1个或第2个item的内容。
    xml.find("item").each(function(i, val) {
      //定义一个node变量来装载每一个item的值的内容
      var node = $(val)
      //定义一个word变量来装载一个item值内容中的word标签下的内容
      var word = node.find("word").text()
      //因为定义的wordInfos是数组对象，所以[]内是要填写对象数组，根据word具体值对应到具体数组对象中去
      wordInfos[word.toLowerCase()] = {
        //定义数组对象中的trans元素获取数组对象中的trans的文本值
        trans: node.find("trans").text(),
        //定义数组对象中的phonetic元素获取对应对象数组中的phonetic的文本值
        phonetic: node.find("phonetic").text()
      }
    })
    //chrome.storage.local.set()方法是将数组对象进行本地存储
    chrome.storage.local.set({
      //新增一个数组对象变量newWords来存储xml的单词数组对象
      //后面使用chrome.storage.local.get()来获取本地存储的数据
      newWords: {
        //这里的wordInfos对象数组经过上面的遍历之后，这个数组对象已经包含了全部XML文件中的生词内容
        wordInfos
      }
    })
    //获取具有指定属性的所有标签页，如果没有指定任何属性的话则获取所有标签页。
    //也就是说我的插件是在哪个页面生效，如果没特定标签页面的话，就全部页面都生效
    chrome.tabs.query({
      //标签页在窗口中是否为活动标签页
      active: true,
      currentWindow: true
    }, function(tabs) {
      //tabs[0].id是获取第一个标签页的id号，向标签页传送消息需要获取这个标签页id
      //然后向对应的标签页中传送一个对象数组，其中一个数组对象是type，它的值为importSuccess，输入成功
      //这个是在highlight.js文件中的监听xml是否成功导入成功的匹配值，本地存储成功之后便会传输type="importSuccess"
      chrome.tabs.sendMessage(tabs[0].id, {
        type: "importSuccess"
      });
    });
  }
  //使用readAsText(this.files[0])方法来读取输入的第一个文件内容
  reader.readAsText(this.files[0])
})
