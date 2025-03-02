const childWindow = window.open('childWindow.html');
const channel = new MessageChannel();

channel.port1.onmessage = (event) => {
  console.log('【来自子窗口的消息】', event.data);
};

document.getElementById('btn').addEventListener('click', () => {
  console.log('btn clicked')
  channel.port1.postMessage('red')
})

// 等待子窗口加载完毕再发送消息
let checkLoad = setInterval(function () {
  if (childWindow.document.readyState === 'complete') {
    clearInterval(checkLoad)
    console.log('子窗口已加载')
    childWindow.postMessage('初始化通信', '*', [channel.port2])
  }
}, 100) // 每100毫秒检查一次