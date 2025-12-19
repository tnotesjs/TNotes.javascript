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
