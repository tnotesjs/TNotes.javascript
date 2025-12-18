// 创建一个生成 1-10 数字的流
const numberStream = new ReadableStream({
  // start() 方法在流创建时立即被调用（只调用一次）
  // controller 是 ReadableStreamDefaultController 实例，用于控制流的状态
  start(controller) {
    for (let i = 1; i <= 10; i++) {
      // controller.enqueue(chunk) 将数据块添加到流的内部队列中
      // 此时数据还没有被读取，只是“入队”等待被消费
      controller.enqueue(i)
    }

    // controller.close() 关闭流，表示不会再有新数据
    // 关闭后，消费者读取完所有数据会收到 done: true 信号
    controller.close()
  },
})

// 读取流中的数据

// getReader() 获取一个读取器（reader）
// 此时流会被“锁定”到这个读取器，其他读取器无法访问
const reader = numberStream.getReader()
while (true) {
  // reader.read() 返回一个 Promise，resolve 后得到 { done, value }
  // - done: boolean - 流是否已结束
  // - value: any - 当前读取到的数据块（chunk）
  const { done, value } = await reader.read()

  // 如果 done 为 true，说明流已关闭且所有数据已读取完毕
  if (done) break

  console.log(value)
}
// 输出：
// 1
// 2
// 3
// 4
// 5
// 6
// 7
// 8
// 9
// 10
