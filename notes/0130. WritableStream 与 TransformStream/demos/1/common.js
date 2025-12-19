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
