// 示例1：使用内置 CompressionStream 压缩
async function demo1() {
  const input = document.getElementById('input1').value
  const output = document.getElementById('output1')

  const originalSize = new Blob([input]).size

  // 创建文本流
  const readable = new ReadableStream({
    start(controller) {
      controller.enqueue(input)
      controller.close()
    },
  })

  // 压缩管道：文本 → 字节 → 压缩
  const compressed = readable
    .pipeThrough(new TextEncoderStream())
    .pipeThrough(new CompressionStream('gzip'))

  // 收集压缩后的数据
  const chunks = []
  const reader = compressed.getReader()
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    chunks.push(value)
  }

  // 计算压缩后大小
  const compressedBlob = new Blob(chunks)
  const compressedSize = compressedBlob.size

  output.innerHTML = `
    <div class="stats">
      原始大小: ${originalSize} 字节<br>
      压缩后大小: ${compressedSize} 字节<br>
      压缩率: ${((1 - compressedSize / originalSize) * 100).toFixed(1)}%
    </div>
    <div>压缩后的数据（前 50 字节，十六进制）:</div>
    <div>${arrayToHex(chunks[0].slice(0, 50))}</div>
  `
}

// 示例2：压缩后解压
async function demo2() {
  const input = document.getElementById('input2').value
  const output = document.getElementById('output2')

  // 步骤1：压缩
  const readable1 = new ReadableStream({
    start(controller) {
      controller.enqueue(input)
      controller.close()
    },
  })

  const compressed = readable1
    .pipeThrough(new TextEncoderStream())
    .pipeThrough(new CompressionStream('gzip'))

  // 收集压缩数据
  const compressedChunks = []
  const reader1 = compressed.getReader()
  while (true) {
    const { done, value } = await reader1.read()
    if (done) break
    compressedChunks.push(value)
  }

  output.innerHTML = '压缩完成，开始解压...<br>'

  // 步骤2：解压
  const readable2 = new ReadableStream({
    start(controller) {
      for (const chunk of compressedChunks) {
        controller.enqueue(chunk)
      }
      controller.close()
    },
  })

  const decompressed = readable2
    .pipeThrough(new DecompressionStream('gzip'))
    .pipeThrough(new TextDecoderStream())

  const reader2 = decompressed.getReader()
  const { value: result } = await reader2.read()

  output.innerHTML += `
    <div class="stats">
      原始文本: ${input}<br>
      解压结果: ${result}<br>
      匹配: ${input === result ? '✅ 成功' : '❌ 失败'}
    </div>
  `
}

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

// 辅助函数：将字节数组转为十六进制字符串
function arrayToHex(array) {
  return Array.from(array)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join(' ')
}
