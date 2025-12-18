// 创建文本转 Base64 的转换流
function createBase64Encoder() {
  return new TransformStream({
    transform(chunk, controller) {
      // 文本 → Uint8Array → Base64
      const encoder = new TextEncoder()
      const bytes = encoder.encode(chunk)
      const base64 = btoa(String.fromCharCode(...bytes))
      controller.enqueue(base64)
    },
  })
}

// 创建 Base64 转文本的转换流
function createBase64Decoder() {
  return new TransformStream({
    transform(chunk, controller) {
      try {
        // Base64 → Uint8Array → 文本
        const binaryString = atob(chunk)
        const bytes = new Uint8Array(binaryString.length)
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i)
        }
        const decoder = new TextDecoder()
        const text = decoder.decode(bytes)
        controller.enqueue(text)
      } catch (error) {
        controller.error(new Error('Base64 解码失败: ' + error.message))
      }
    },
  })
}

// 创建大写转换流
function createUpperCaseTransform() {
  return new TransformStream({
    transform(chunk, controller) {
      controller.enqueue(chunk.toUpperCase())
    },
  })
}

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
