// 从文件输入框读取文件内容
async function readFileAsStream(file) {
  const stream = file.stream() // File 对象的 stream() 方法返回 ReadableStream
  // console.log('stream:', stream)
  // stream: ReadableStream {locked: false}

  const reader = stream.getReader()
  const decoder = new TextDecoder()

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    // console.log('value:', value)
    // value: Uint8Array(1480) [60, 33, 68, 79, 67, 84 ... ]

    // value 是 Uint8Array，需要解码为文本
    const text = decoder.decode(value, { stream: true })
    console.log('text:', text)
    // text: <!DOCTYPE html>
    // <html lang="en">
    // ...
  }
}

// 可以选中当前入口文件 1.html 进行测试...
document.getElementById('fileInput').addEventListener('change', (e) => {
  const file = e.target.files[0]
  // console.log('file:', file)
  // file: {
  //   lastModified: 1765871776019
  //   lastModifiedDate: Tue Dec 16 2025 15:56:16 GMT+0800 (中国标准时间) {}
  //   name: "1.html"
  //   size: 1100
  //   type: "text/html"
  //   webkitRelativePath: ""
  // }

  if (file) {
    readFileAsStream(file)
  }
})
