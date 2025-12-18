let currentFileHandle = null

const openFileBtn = document.getElementById('openFileBtn')
const streamReadBtn = document.getElementById('streamReadBtn')
const saveFileBtn = document.getElementById('saveFileBtn')
const appendFileBtn = document.getElementById('appendFileBtn')
const fileInfo = document.getElementById('fileInfo')
const fileContent = document.getElementById('fileContent')
const writeContent = document.getElementById('writeContent')
const progress = document.getElementById('progress')
const progressFill = document.getElementById('progressFill')
const progressLabel = document.getElementById('progressLabel')
const logEl = document.getElementById('log')

function addLog(message) {
  const time = new Date().toLocaleTimeString()
  const entry = document.createElement('div')
  entry.className = 'log-entry'
  entry.innerHTML = `<span class="log-time">[${time}]</span>${message}`
  logEl.insertBefore(entry, logEl.firstChild)
}

function formatBytes(bytes) {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
  return (bytes / 1024 / 1024).toFixed(2) + ' MB'
}

// 打开并读取文件
openFileBtn.addEventListener('click', async () => {
  try {
    const [fileHandle] = await window.showOpenFilePicker()
    currentFileHandle = fileHandle
    const file = await fileHandle.getFile()

    fileInfo.innerHTML = `
      <strong>文件名:</strong> ${file.name}<br>
      <strong>大小:</strong> ${formatBytes(file.size)}<br>
      <strong>类型:</strong> ${file.type || '未知'}<br>
      <strong>最后修改:</strong> ${new Date(file.lastModified).toLocaleString()}
    `

    const text = await file.text()
    fileContent.value = text

    streamReadBtn.disabled = false
    appendFileBtn.disabled = false

    addLog(`✅ 成功读取文件: ${file.name}`)
  } catch (error) {
    addLog(`❌ 读取失败: ${error.message}`)
  }
})

// 流式读取文件
streamReadBtn.addEventListener('click', async () => {
  if (!currentFileHandle) return

  try {
    const file = await currentFileHandle.getFile()

    progress.classList.add('show')
    progressLabel.textContent = '正在流式读取...'

    const stream = file.stream()
    const decoder = new TextDecoderStream()
    const textStream = stream.pipeThrough(decoder)

    const reader = textStream.getReader()
    let content = ''
    let bytesRead = 0

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      content += value
      bytesRead += new TextEncoder().encode(value).byteLength

      const percent = ((bytesRead / file.size) * 100).toFixed(0)
      progressFill.style.width = `${percent}%`
      progressFill.textContent = `${percent}%`

      fileContent.value = content
    }

    addLog(`✅ 流式读取完成: ${formatBytes(bytesRead)}`)

    setTimeout(() => {
      progress.classList.remove('show')
    }, 1000)
  } catch (error) {
    addLog(`❌ 流式读取失败: ${error.message}`)
    progress.classList.remove('show')
  }
})

// 保存新文件
saveFileBtn.addEventListener('click', async () => {
  try {
    const fileHandle = await window.showSaveFilePicker({
      suggestedName: 'new-file.txt',
      types: [
        {
          description: '文本文件',
          accept: { 'text/plain': ['.txt'] },
        },
      ],
    })

    const writable = await fileHandle.createWritable()
    const content = writeContent.value

    progress.classList.add('show')
    progressLabel.textContent = '正在写入文件...'

    const encoder = new TextEncoderStream()
    const encodedStream = encoder.readable

    const writer = encoder.writable.getWriter()
    await writer.write(content)
    await writer.close()

    await encodedStream.pipeTo(writable)

    progressFill.style.width = '100%'
    progressFill.textContent = '100%'

    addLog(`✅ 文件保存成功: ${content.length} 字符`)

    setTimeout(() => {
      progress.classList.remove('show')
    }, 1000)
  } catch (error) {
    addLog(`❌ 保存失败: ${error.message}`)
    progress.classList.remove('show')
  }
})

// 追加到文件
appendFileBtn.addEventListener('click', async () => {
  if (!currentFileHandle) return

  try {
    const content = writeContent.value

    const writable = await currentFileHandle.createWritable({
      keepExistingData: true,
    })

    const file = await currentFileHandle.getFile()
    await writable.seek(file.size)

    await writable.write(new TextEncoder().encode('\n' + content))
    await writable.close()

    addLog(`✅ 成功追加 ${content.length} 字符到文件`)

    const newFile = await currentFileHandle.getFile()
    const text = await newFile.text()
    fileContent.value = text

    fileInfo.innerHTML = `
      <strong>文件名:</strong> ${newFile.name}<br>
      <strong>大小:</strong> ${formatBytes(newFile.size)}<br>
      <strong>类型:</strong> ${newFile.type || '未知'}<br>
      <strong>最后修改:</strong> ${new Date(
        newFile.lastModified
      ).toLocaleString()}
    `
  } catch (error) {
    addLog(`❌ 追加失败: ${error.message}`)
  }
})

// 检查 API 支持
if (!('showOpenFilePicker' in window)) {
  addLog('⚠️ 当前浏览器不支持 File System Access API')
  openFileBtn.disabled = true
  saveFileBtn.disabled = true
} else {
  addLog('✅ File System Access API 已就绪')
}
