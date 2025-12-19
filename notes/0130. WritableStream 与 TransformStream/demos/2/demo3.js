// 示例3：自定义批量处理流
async function demo3() {
  const output = document.getElementById('output3')
  output.innerHTML = '开始批量处理...<br>'

  // 创建批量处理转换流
  const batchTransform = new TransformStream({
    batch: [],
    batchSize: 3,

    transform(chunk, controller) {
      this.batch.push(chunk)
      output.innerHTML += `收到数据块: ${chunk}<br>`

      // 每收集 3 个块就处理一次
      if (this.batch.length >= this.batchSize) {
        const combined = this.batch.join(', ')
        output.innerHTML += `📦 批量处理: [${combined}]<br>`
        controller.enqueue(combined)
        this.batch = []
      }
    },

    flush(controller) {
      // 处理剩余的数据
      if (this.batch.length > 0) {
        const combined = this.batch.join(', ')
        output.innerHTML += `📦 最后批次: [${combined}]<br>`
        controller.enqueue(combined)
      }
      output.innerHTML += '✅ 处理完成<br>'
    },
  })

  // 创建数据流
  const readable = new ReadableStream({
    start(controller) {
      const items = ['A', 'B', 'C', 'D', 'E', 'F', 'G']
      for (const item of items) {
        controller.enqueue(item)
      }
      controller.close()
    },
  })

  // 通过批处理流
  const processed = readable.pipeThrough(batchTransform)

  // 收集结果
  const results = []
  const reader = processed.getReader()
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    results.push(value)
  }

  output.innerHTML += '<br>最终输出:<br>'
  results.forEach((r, i) => {
    output.innerHTML += `批次 ${i + 1}: ${r}<br>`
  })
}
