function log(id, message) {
  const logEl = document.getElementById(id)
  logEl.innerHTML += `${message}\n`
  logEl.scrollTop = logEl.scrollHeight
}

function clearLog(id) {
  document.getElementById(id).innerHTML = ''
  if (id === 'log3') {
    document.getElementById('hexDump').innerHTML = ''
  }
}

// Demo 1：基本字节流
async function demo1() {
  clearLog('log1')

  log('log1', '创建字节流...\n')

  let chunkCount = 0

  const byteStream = new ReadableStream({
    type: 'bytes',

    start(controller) {
      log('log1', '✅ 字节流已初始化')
      log('log1', `   初始 desiredSize: ${controller.desiredSize}\n`)
    },

    pull(controller) {
      chunkCount++

      if (chunkCount > 5) {
        controller.close()
        log('log1', '🔚 流已关闭\n')
        return
      }

      // 生成随机数据
      const size = 16
      const chunk = new Uint8Array(size)
      for (let i = 0; i < size; i++) {
        chunk[i] = Math.floor(Math.random() * 256)
      }

      log('log1', `📤 pull() #${chunkCount}:`)
      log('log1', `   生成 ${size} 字节数据`)
      log('log1', `   数据: [${Array.from(chunk.slice(0, 8)).join(', ')}...]`)

      controller.enqueue(chunk)

      log('log1', `   入队后 desiredSize: ${controller.desiredSize}\n`)
    },
  })

  log('log1', '开始读取（使用默认 Reader）...\n')

  const reader = byteStream.getReader()
  log('log1', `Reader 类型: ${reader.constructor.name}\n`)

  let totalBytes = 0

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    totalBytes += value.byteLength
    log('log1', `📥 读取到 ${value.byteLength} 字节`)
    log('log1', `   数据: [${Array.from(value.slice(0, 8)).join(', ')}...]\n`)
  }

  log('log1', `✅ 完成，共读取 ${totalBytes} 字节`)
}

// Demo 2：使用 BYOB Reader
async function demo2() {
  clearLog('log2')

  log('log2', '创建支持 BYOB 的字节流...\n')

  const byteStream = new ReadableStream({
    type: 'bytes',

    pull(controller) {
      const byobRequest = controller.byobRequest

      if (byobRequest) {
        log('log2', '🎯 检测到 BYOB Request:')
        log('log2', `   用户缓冲区大小: ${byobRequest.view.byteLength} 字节`)

        const view = byobRequest.view

        // 直接写入用户提供的缓冲区
        for (let i = 0; i < view.byteLength; i++) {
          view[i] = i % 256
        }

        log('log2', `   已填充 ${view.byteLength} 字节\n`)

        byobRequest.respond(view.byteLength)
      } else {
        log('log2', '⚠️ 没有 BYOB Request，使用默认方式\n')
        controller.enqueue(new Uint8Array(32))
      }
    },
  })

  log('log2', '使用 BYOB Reader 读取...\n')

  const reader = byteStream.getReader({ mode: 'byob' })
  log('log2', `Reader 类型: ${reader.constructor.name}\n`)

  // 第一次读取：提供 64 字节缓冲区
  log('log2', '📖 第一次读取（64 字节缓冲区）:')
  const buffer1 = new Uint8Array(64)
  const result1 = await reader.read(buffer1)

  log('log2', `   done: ${result1.done}`)
  log('log2', `   读取字节数: ${result1.value.byteLength}`)
  log('log2', `   缓冲区是否相同: ${result1.value.buffer === buffer1.buffer}`)
  log(
    'log2',
    `   数据样本: [${Array.from(result1.value.slice(0, 10)).join(', ')}...]\n`
  )

  // 第二次读取：提供 128 字节缓冲区
  log('log2', '📖 第二次读取（128 字节缓冲区）:')
  const buffer2 = new Uint8Array(128)
  const result2 = await reader.read(buffer2)

  log('log2', `   读取字节数: ${result2.value.byteLength}`)
  log(
    'log2',
    `   数据样本: [${Array.from(result2.value.slice(0, 10)).join(', ')}...]\n`
  )

  reader.cancel()
  log('log2', '✅ 完成')
}

// Demo 3：读取文件为字节流
async function demo3() {
  clearLog('log3')

  const fileInput = document.getElementById('fileInput')
  const file = fileInput.files[0]

  if (!file) {
    log('log3', '❌ 请先选择文件')
    return
  }

  log('log3', `文件信息:`)
  log('log3', `  名称: ${file.name}`)
  log('log3', `  大小: ${file.size} 字节`)
  log('log3', `  类型: ${file.type || '未知'}\n`)

  log('log3', '创建文件字节流...\n')

  const stream = file.stream()
  log('log3', `Stream 类型: ${stream.constructor.name}`)

  // 尝试使用 BYOB Reader
  try {
    const reader = stream.getReader({ mode: 'byob' })
    log('log3', `Reader 类型: ${reader.constructor.name}\n`)

    log('log3', '读取前 512 字节...\n')

    const buffer = new Uint8Array(512)
    const { value, done } = await reader.read(buffer)

    if (done) {
      log('log3', '⚠️ 文件为空')
      return
    }

    log('log3', `✅ 成功读取 ${value.byteLength} 字节\n`)

    // 生成十六进制转储
    const hexDump = createHexDump(value)
    document.getElementById('hexDump').textContent = hexDump

    // 检测文件类型
    const fileType = detectFileType(value)
    log('log3', `文件类型检测: ${fileType}`)

    reader.cancel()
  } catch (error) {
    log('log3', `❌ 错误: ${error.message}`)
  }
}

function createHexDump(bytes) {
  const maxBytes = Math.min(bytes.byteLength, 256)
  let dump = 'Offset  00 01 02 03 04 05 06 07 08 09 0A 0B 0C 0D 0E 0F  ASCII\n'
  dump +=
    '------  -----------------------------------------------  ----------------\n'

  for (let i = 0; i < maxBytes; i += 16) {
    const offset = i.toString(16).padStart(6, '0').toUpperCase()
    let hex = ''
    let ascii = ''

    for (let j = 0; j < 16; j++) {
      if (i + j < maxBytes) {
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

  if (bytes.byteLength > maxBytes) {
    dump += `\n... (剩余 ${bytes.byteLength - maxBytes} 字节)\n`
  }

  return dump
}

function detectFileType(bytes) {
  const signatures = {
    PNG: [0x89, 0x50, 0x4e, 0x47],
    JPEG: [0xff, 0xd8, 0xff],
    GIF: [0x47, 0x49, 0x46],
    PDF: [0x25, 0x50, 0x44, 0x46],
    ZIP: [0x50, 0x4b, 0x03, 0x04],
  }

  for (const [type, signature] of Object.entries(signatures)) {
    if (matchesSignature(bytes, signature)) {
      return type
    }
  }

  return '未知'
}

function matchesSignature(bytes, signature) {
  if (bytes.length < signature.length) return false
  return signature.every((byte, i) => bytes[i] === byte)
}
