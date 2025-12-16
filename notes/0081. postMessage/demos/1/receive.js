// 添加事件监听器以接收消息
window.addEventListener('message', function (event) {
  // 检查消息来源是否可信
  // 如果消息不是来自预期的源，则忽略
  // 相当于做了一个身份验证
  if (
    event.origin !== 'http://127.0.0.1:5500' ||
    event.data.senderID !== '__Tdahuyou__'
  ) {
    return
  }

  console.log('Received message:', event)
  // 处理接收到的消息
  const messageList = document.getElementById('messages')
  const newMessage = document.createElement('li')
  newMessage.textContent = event.data.message
  messageList.appendChild(newMessage)
})
