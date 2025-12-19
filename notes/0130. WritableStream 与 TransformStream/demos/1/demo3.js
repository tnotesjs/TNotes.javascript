// 示例3：链式转换
async function demo3() {
  const input = document.getElementById('input3').value
  const output = document.getElementById('output3')
  output.innerHTML = ''

  const readable = new ReadableStream({
    start(controller) {
      controller.enqueue(input)
      controller.close()
    },
  })

  // 链式转换：大写 → Base64 → 解码
  const step1 = readable.pipeThrough(createUpperCaseTransform())

  const reader1 = step1.getReader()
  const { value: upperValue } = await reader1.read()
  output.innerHTML += '步骤1 (大写): ' + upperValue + '<br>'

  // 继续下一步
  const readable2 = new ReadableStream({
    start(controller) {
      controller.enqueue(upperValue)
      controller.close()
    },
  })

  const step2 = readable2.pipeThrough(createBase64Encoder())
  const reader2 = step2.getReader()
  const { value: base64Value } = await reader2.read()
  output.innerHTML += '步骤2 (Base64): ' + base64Value + '<br>'

  // 解码回来
  const readable3 = new ReadableStream({
    start(controller) {
      controller.enqueue(base64Value)
      controller.close()
    },
  })

  const step3 = readable3.pipeThrough(createBase64Decoder())
  const reader3 = step3.getReader()
  const { value: finalValue } = await reader3.read()
  output.innerHTML += '步骤3 (解码): ' + finalValue
}
