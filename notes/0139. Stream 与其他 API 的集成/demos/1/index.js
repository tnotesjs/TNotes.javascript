let selectedFile = null
let processedBlob = null
let selectedFormat = 'gzip'

// 元素引用
const uploadArea = document.getElementById('uploadArea')
const fileInput = document.getElementById('fileInput')
const compressBtn = document.getElementById('compressBtn')
const decompressBtn = document.getElementById('decompressBtn')
const downloadBtn = document.getElementById('downloadBtn')
const progress = document.getElementById('progress')
const progressFill = document.getElementById('progressFill')
const progressLabel = document.getElementById('progressLabel')

// 文件上传
uploadArea.addEventListener('click', () => fileInput.click())

uploadArea.addEventListener('dragover', (e) => {
  e.preventDefault()
  uploadArea.classList.add('dragging')
})

uploadArea.addEventListener('dragleave', () => {
  uploadArea.classList.remove('dragging')
})

uploadArea.addEventListener('drop', (e) => {
  e.preventDefault()
  uploadArea.classList.remove('dragging')

  const files = e.dataTransfer.files
  if (files.length > 0) {
    handleFileSelect(files[0])
  }
})

fileInput.addEventListener('change', (e) => {
  if (e.target.files.length > 0) {
    handleFileSelect(e.target.files[0])
  }
})

function handleFileSelect(file) {
  selectedFile = file
  processedBlob = null

  document.getElementById('originalSize').textContent = (
    file.size / 1024
  ).toFixed(2)
  document.getElementById('compressedSize').textContent = '-'
  document.getElementById('compressionRatio').textContent = '-'
  document.getElementById('duration').textContent = '-'

  compressBtn.disabled = false
  decompressBtn.disabled = false
  downloadBtn.disabled = true

  const uploadText = document.querySelector('.upload-text')
  uploadText.textContent = `已选择: ${file.name}`
}

// 格式选择
document.querySelectorAll('.format-option').forEach((option) => {
  option.addEventListener('click', () => {
    document
      .querySelectorAll('.format-option')
      .forEach((o) => o.classList.remove('selected'))
    option.classList.add('selected')
    selectedFormat = option.dataset.format
  })
})

// 压缩文件
compressBtn.addEventListener('click', async () => {
  if (!selectedFile) return

  compressBtn.disabled = true
  decompressBtn.disabled = true
  progress.classList.add('show')
  progressLabel.textContent = '正在压缩...'

  const startTime = performance.now()

  try {
    const stream = selectedFile.stream()
    const compressedStream = stream.pipeThrough(
      new CompressionStream(selectedFormat)
    )

    let compressedSize = 0
    const chunks = []
    const reader = compressedStream.getReader()

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      chunks.push(value)
      compressedSize += value.byteLength

      const percent = ((compressedSize / selectedFile.size) * 100).toFixed(0)
      progressFill.style.width = `${Math.min(percent, 100)}%`
      progressFill.textContent = `${Math.min(percent, 100)}%`
    }

    processedBlob = new Blob(chunks, { type: 'application/octet-stream' })
    const duration = performance.now() - startTime

    const compressionRatio = (
      (1 - processedBlob.size / selectedFile.size) *
      100
    ).toFixed(2)

    document.getElementById('compressedSize').textContent = (
      processedBlob.size / 1024
    ).toFixed(2)
    document.getElementById('compressionRatio').textContent = compressionRatio
    document.getElementById('duration').textContent = duration.toFixed(0)

    downloadBtn.disabled = false
    progressLabel.textContent = '压缩完成！'
  } catch (error) {
    alert('压缩失败: ' + error.message)
  } finally {
    compressBtn.disabled = false
    decompressBtn.disabled = false
    setTimeout(() => {
      progress.classList.remove('show')
    }, 2000)
  }
})

// 解压文件
decompressBtn.addEventListener('click', async () => {
  if (!selectedFile) return

  compressBtn.disabled = true
  decompressBtn.disabled = true
  progress.classList.add('show')
  progressLabel.textContent = '正在解压...'

  const startTime = performance.now()

  try {
    const stream = selectedFile.stream()
    const decompressedStream = stream.pipeThrough(
      new DecompressionStream(selectedFormat)
    )

    let decompressedSize = 0
    const chunks = []
    const reader = decompressedStream.getReader()

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      chunks.push(value)
      decompressedSize += value.byteLength

      const percent = Math.min(
        (decompressedSize / selectedFile.size) * 100,
        100
      ).toFixed(0)
      progressFill.style.width = `${percent}%`
      progressFill.textContent = `${percent}%`
    }

    processedBlob = new Blob(chunks, { type: 'application/octet-stream' })
    const duration = performance.now() - startTime

    document.getElementById('compressedSize').textContent = (
      processedBlob.size / 1024
    ).toFixed(2)
    document.getElementById('compressionRatio').textContent = '0.00'
    document.getElementById('duration').textContent = duration.toFixed(0)

    downloadBtn.disabled = false
    progressLabel.textContent = '解压完成！'
  } catch (error) {
    alert('解压失败: ' + error.message)
  } finally {
    compressBtn.disabled = false
    decompressBtn.disabled = false
    setTimeout(() => {
      progress.classList.remove('show')
    }, 2000)
  }
})

// 下载结果
downloadBtn.addEventListener('click', () => {
  if (!processedBlob) return

  const url = URL.createObjectURL(processedBlob)
  const a = document.createElement('a')
  a.href = url
  a.download = `processed_${selectedFile.name}`
  a.click()

  URL.revokeObjectURL(url)
})
