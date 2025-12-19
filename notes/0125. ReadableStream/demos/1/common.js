const output = document.getElementById('output')

function log(msg) {
  output.innerHTML += msg + '<br>'
}

function clear() {
  output.innerHTML = ''
}

// 创建一个从数组生成的可读流
function createArrayStream(array) {
  return new ReadableStream({
    start(controller) {
      for (const item of array) {
        controller.enqueue(item)
      }
      controller.close()
    },
  })
}
