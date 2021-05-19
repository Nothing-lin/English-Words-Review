//初始化扩展插件
initialize_extension();

//定义初始化函数
function initialize_extension() {
  //获取本地xml文件下的英文单词集合
  load_english_words();
}

function load_english_words() {
  //获取单词样本xml文件的地址
  words_file_path = chrome.extension.getURL("resource/words_demo.xml");
  //定义异步数据请求
  var xhr = new XMLHttpRequest();
  //调用xml单词文件
  xhr.open('GET', words_file_path, true);
//如果成功调用xhr.open()函数的话就执行下面的函数
  xhr.onreadystatechange = function() {
    if (xhr.readyState == 4 && xhr.status == 200) {
      //info获取xml文件中的全部内容，并保存xml的全部内容和格式
      var info = xhr.responseXML;
      var words = [];
      //遍历循环word标签内容到数组words中
      for (var i = 0; i < 2; i++) {
        word = info.getElementsByTagName("word")[i].textContent;
        words[i] = word;
      }
      // var words = info.getElementsByTagName("word")[1].textContent;
      console.log(words);
    }
  }

  xhr.send();

}
