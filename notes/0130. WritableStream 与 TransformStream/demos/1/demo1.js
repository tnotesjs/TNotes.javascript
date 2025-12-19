// 示例1：文本转 Base64
async function demo1() {
  const input = document.getElementById('input1').value
  const output = document.getElementById('output1')

  const readable = new ReadableStream({
    start(controller) {
      controller.enqueue(input)
      controller.close()
    },
  })

  const transformed = readable.pipeThrough(createBase64Encoder())

  const reader = transformed.getReader()
  const { value } = await reader.read()

  output.textContent = '编码结果: ' + value
}
