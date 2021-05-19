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
  xhr.open('GET', words_file_path, true);

  xhr.onreadystatechange = function(){
    if(xhr.readyState == 4 && xhr.status == 200){
      var info = xhr.responseXML;
      var words = info.getElementsByTagName("word")[1].textContent;
      console.log(words);
    }
  }

  xhr.send();

}
