// 演示流的错误处理
const errorStream = new ReadableStream({
  start(controller) {
    controller.enqueue('正常数据1')
    controller.enqueue('正常数据2')
    // 模拟错误
    controller.error(new Error('流处理出错'))
  },
})

const reader = errorStream.getReader()
try {
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    console.log(value)
  }
} catch (error) {
  console.error('捕获到错误:', error.message)
}
// 输出：
// 正常数据1
// 正常数据2
// 捕获到错误: 流处理出错
