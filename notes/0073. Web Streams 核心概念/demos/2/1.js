// 示例 - 字符串流和字节流的转换

// 创建流式编码器
const encoderStream = new TextEncoderStream('utf-8') // 可以指定编码格式，默认为 'utf-8'

// 创建解码器
const decoder = new TextDecoder('utf-8')

// 创建数据源 - 一个包含文本的 ReadableStream
const textStream = new ReadableStream({
  start(controller) {
    // 分块写入文本数据 - 此时是未编码的字符串
    controller.enqueue('aaa 111 222 333 bbb')
    controller.enqueue('foo foo foo bar bar bar')
    controller.enqueue(
      'Lorem ipsum dolor sit amet consectetur adipisicing elit. In, omnis.'
    )
    controller.close()
  },
})

// 将文本流通过编码器传输
let __chunkIndex = 0

textStream
  .pipeThrough(encoderStream) // 这里进行编码转换，将字符串转换为 Uint8Array 字节流数据
  .pipeTo(
    new WritableStream({
      write(chunk) {
        __chunkIndex += 1

        const isUint8Array = chunk instanceof Uint8Array
        const typeText = isUint8Array
          ? 'Uint8Array'
          : Object.prototype.toString.call(chunk)

        const hex = Array.from(chunk)
          .map((b) => '0x' + b.toString(16).padStart(2, '0'))
          .join(' ')

        const bytes = Array.from(chunk).join('，')

        console.group(`📦 第 ${__chunkIndex} 个分块`)
        console.log(`类型：${typeText}`)
        console.log(`字节长度：${chunk.byteLength ?? chunk.length ?? 0}`)
        console.log('数据对象：', chunk)
        console.log(`十六进制：${hex}`)
        console.log(`字节列表：${bytes}`)

        // 如果需要查看原始字符串，可以使用 TextDecoder 解码（流式解码）
        const decodedText = decoder.decode(chunk, { stream: true })
        console.log(`📝 解码文本：${decodedText}`)
        console.groupEnd()
      },
      close() {
        // 结束时刷新可能的未完成多字节字符
        const rest = decoder.decode()
        if (rest) {
          console.log(`🧹 解码剩余：${rest}`)
        }
      },
    })
  )

/* TextEncoderStream 简介
TextEncoderStream 是用于将字符串转换为Uint8Array字节流的TransformStream
常用于处理文本数据的流式编码

关键点总结：
1. TextEncoderStream 是 TransformStream，用于流式文本编码
2. 输入：字符串 → 输出：Uint8Array（字节数组）
3. 默认编码为 UTF-8，这是Web标准的推荐编码
4. 自动处理背压（backpressure），内存效率高
5. 适合处理大文件或流式数据，避免内存溢出
6. 常与 Fetch API、文件API、网络Socket等结合使用

使用场景：
- 大文件上传前的分块编码
- 实时文本传输（如WebSocket）
- 流式处理JSON或其他文本格式
- 将文本转换为二进制格式进行存储或传输
*/
