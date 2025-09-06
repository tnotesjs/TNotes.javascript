// 定义节流函数
const throttle = function (fn, delay) {
  let lastCall = 0
  return function (...args) {
    const now = Date.now()
    if (now - lastCall >= delay) {
      lastCall = now
      fn.apply(this, args)
    }
  }
}

// 使用节流函数包装的函数
const logWindowSize = throttle(() => {
  console.log(`Window size: ${window.innerWidth} x ${window.innerHeight}`)
}, 250) // 设置延迟时间为 250 毫秒

// 添加事件监听器
window.addEventListener('resize', logWindowSize)
