window.onmessage = (event) => {
  const port = event.ports[0]

  port.onmessage = (event) => {
    console.log('【子窗口收到来自父窗口的消息】', event.data)

    document.getElementById('text').style.color = event.data

    port.postMessage('颜色已经修改成功了～')
  }
}
