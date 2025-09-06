window.onbeforeunload = function (event) {
  // 设置对话框中的消息（注意：现代浏览器可能忽略自定义消息）
  event.returnValue = '您确定要离开此页面吗？未保存的数据将会丢失。'
  // 返回相同的字符串也是必需的，以确保兼容性
  return event.returnValue
}
// 以 chrome 为例，我们配置的文案并不会生效，而是使用浏览器预设好的固定文案。

// 其实只需要让 window.onbeforeunload 绑定的函数返回一个字符串，它就能够正常工作。
window.onbeforeunload = () => ''
// 这么写，也会在页面被关闭或者刷新之前，触发一个确认对话框。
