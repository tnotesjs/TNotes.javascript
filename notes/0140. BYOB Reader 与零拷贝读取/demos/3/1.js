// 文件头签名定义
const FILE_SIGNATURES = {
  PNG: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
  JPEG: [0xff, 0xd8, 0xff],
  GIF: [0x47, 0x49, 0x46, 0x38],
  PDF: [0x25, 0x50, 0x44, 0x46],
  ZIP: [0x50, 0x4b, 0x03, 0x04],
}

// 解析用户选择的文件
async function parseFile() {
  const fileInput = document.getElementById('fileInput')
  const file = fileInput.files[0]

  if (!file) {
    alert('请选择文件')
    return
  }

  const fileInfo = document.getElementById('fileInfo')
  fileInfo.innerHTML = `文件名：${file.name}<br>大小：${
    file.size
  } 字节<br>类型：${file.type || '未知'}`

  const output = document.getElementById('output')
  output.innerHTML = '<p>正在解析...</p>'

  try {
    const stream = file.stream()
    const reader = stream.getReader({ mode: 'byob' })

    const buffer = new Uint8Array(512)
    const { value, done } = await reader.read(buffer)

    if (done) {
      output.innerHTML = '<p>文件为空</p>'
      return
    }

    const fileType = detectFileType(value)
    const hexDump = createHexDump(value.slice(0, 128))

    output.innerHTML = `
      <h4>检测结果</h4>
      <p>文件类型：${fileType}</p>
      <h4>文件头（前 128 字节）</h4>
      <pre style="font-family: monospace; font-size: 12px;">${hexDump}</pre>
    `

    reader.cancel()
  } catch (error) {
    output.innerHTML = `<p style="color: red;">解析失败：${error.message}</p>`
  }
}

// 检测文件类型
function detectFileType(bytes) {
  for (const [type, signature] of Object.entries(FILE_SIGNATURES)) {
    if (matchesSignature(bytes, signature)) {
      return type
    }
  }
  return '未知格式'
}

// 检查签名是否匹配
function matchesSignature(bytes, signature) {
  if (bytes.length < signature.length) return false
  return signature.every((byte, i) => bytes[i] === byte)
}

// 创建十六进制转储
function createHexDump(bytes) {
  let dump = 'Offset  00 01 02 03 04 05 06 07 08 09 0A 0B 0C 0D 0E 0F  ASCII\n'
  dump +=
    '------  -----------------------------------------------  ----------------\n'

  for (let i = 0; i < bytes.length; i += 16) {
    const offset = i.toString(16).padStart(6, '0').toUpperCase()
    let hex = ''
    let ascii = ''

    for (let j = 0; j < 16; j++) {
      if (i + j < bytes.length) {
        const byte = bytes[i + j]
        hex += byte.toString(16).padStart(2, '0').toUpperCase() + ' '
        ascii += byte >= 32 && byte <= 126 ? String.fromCharCode(byte) : '.'
      } else {
        hex += '   '
        ascii += ' '
      }
    }

    dump += `${offset}  ${hex} ${ascii}\n`
  }

  return dump
}

// 模拟解析自定义格式的二进制数据
async function simulateParse() {
  const output = document.getElementById('simulateOutput')
  output.innerHTML = '<p>正在生成模拟数据...</p>'

  const mockData = createMockBinaryData()
  const stream = new ReadableStream({
    type: 'bytes',
    pull(controller) {
      controller.enqueue(mockData)
      controller.close()
    },
  })

  const reader = stream.getReader({ mode: 'byob' })
  const buffer = new Uint8Array(64)

  try {
    const { value } = await reader.read(buffer)
    const parsed = parseMockFormat(value)

    output.innerHTML = `
      <h4>模拟数据结构</h4>
      <pre>魔数（4字节）：标识符
版本（2字节）：主版本号.次版本号
宽度（4字节）：图片宽度
高度（4字节）：图片高度
通道数（1字节）：RGB通道数
数据（剩余）：像素数据</pre>
      <h4>解析结果</h4>
      <pre>${JSON.stringify(parsed, null, 2)}</pre>
      <h4>原始数据（十六进制）</h4>
      <pre style="font-family: monospace; font-size: 12px;">${createHexDump(
        value
      )}</pre>
    `
  } catch (error) {
    output.innerHTML = `<p style="color: red;">解析失败：${error.message}</p>`
  }
}

// 创建模拟的二进制数据（自定义图片格式）
function createMockBinaryData() {
  const buffer = new ArrayBuffer(64)
  const view = new DataView(buffer)

  view.setUint8(0, 0x4d) // 魔数 'M'
  view.setUint8(1, 0x49) // 魔数 'I'
  view.setUint8(2, 0x4d) // 魔数 'M'
  view.setUint8(3, 0x47) // 魔数 'G'

  view.setUint8(4, 1) // 主版本号
  view.setUint8(5, 0) // 次版本号

  view.setUint32(6, 1920, false) // 宽度（大端序）
  view.setUint32(10, 1080, false) // 高度（大端序）

  view.setUint8(14, 3) // 通道数（RGB）

  for (let i = 15; i < 64; i++) {
    view.setUint8(i, Math.floor(Math.random() * 256))
  }

  return new Uint8Array(buffer)
}

// 解析模拟格式
function parseMockFormat(bytes) {
  const view = new DataView(bytes.buffer)

  const magic = String.fromCharCode(bytes[0], bytes[1], bytes[2], bytes[3])
  const majorVersion = view.getUint8(4)
  const minorVersion = view.getUint8(5)
  const width = view.getUint32(6, false)
  const height = view.getUint32(10, false)
  const channels = view.getUint8(14)

  return {
    magic,
    version: `${majorVersion}.${minorVersion}`,
    dimensions: { width, height },
    channels,
    dataOffset: 15,
    dataLength: bytes.length - 15,
  }
}
