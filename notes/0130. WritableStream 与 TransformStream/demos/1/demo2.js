// 示例2：Base64 转文本
async function demo2() {
  const input = document.getElementById('input2').value
  const output = document.getElementById('output2')

  const readable = new ReadableStream({
    start(controller) {
      controller.enqueue(input)
      controller.close()
    },
  })

  try {
    const transformed = readable.pipeThrough(createBase64Decoder())

    const reader = transformed.getReader()
    const { value } = await reader.read()

    output.textContent = '解码结果: ' + value
  } catch (error) {
    output.textContent = '错误: ' + error.message
  }
}
