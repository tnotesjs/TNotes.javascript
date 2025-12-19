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
