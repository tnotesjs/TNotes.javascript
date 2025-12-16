let targetWindow
function openWin() {
  // 使用 window.open 打开的窗口对象。
  // 将窗口对象存储在 targetWindow 变量中，方便后续获取目标窗口，并给它传递消息。
  targetWindow = window.open('receive.html', '_blank')
}
function sendMessage() {
  const message = document.getElementById('message').value

  // 发送消息到目标窗口
  targetWindow.postMessage(
    {
      senderID: '__Tdahuyou__',
      message,
    },
    'http://127.0.0.1:5500/'
  )

  // * 表示所有域都 ok
  // targetWindow.postMessage(message, '*')
}
// 测试步骤：
// 通过 open with live server 插件来打开 send.html
// 假设打开的页面对应的域是 http://127.0.0.1:5500/
