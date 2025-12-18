class CSVStreamParser {
  constructor(file, options = {}) {
    this.file = file
    this.delimiter = options.delimiter || ','
    this.encoding = options.encoding || 'utf-8'
    this.validation = options.validation || 'none'
    this.previewLimit = options.previewLimit || 100
    this.onProgress = options.onProgress
    this.onStats = options.onStats
    this.onRow = options.onRow
    this.onLog = options.onLog

    this.headers = null
    this.totalRows = 0
    this.validRows = 0
    this.errorRows = 0
    this.processedBytes = 0
    this.startTime = null
    this.isPaused = false
    this.isStopped = false
    this.rows = []
  }

  createCSVParser() {
    let buffer = ''
    let lineNumber = 0

    return new TransformStream({
      transform: (chunk, controller) => {
        buffer += chunk

        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (!line.trim()) continue

          lineNumber++
          const values = line
            .split(this.delimiter)
            .map((v) => v.trim().replace(/^"|"$/g, ''))

          if (!this.headers) {
            this.headers = values
            controller.enqueue({ type: 'header', headers: values, lineNumber })
          } else {
            const row = {}
            this.headers.forEach((header, index) => {
              row[header] = values[index] || ''
            })
            controller.enqueue({
              type: 'row',
              data: row,
              lineNumber,
              raw: values,
            })
          }
        }
      },

      flush: (controller) => {
        if (buffer.trim() && this.headers) {
          const values = buffer
            .split(this.delimiter)
            .map((v) => v.trim().replace(/^"|"$/g, ''))
          const row = {}
          this.headers.forEach((header, index) => {
            row[header] = values[index] || ''
          })
          controller.enqueue({
            type: 'row',
            data: row,
            lineNumber: lineNumber + 1,
            raw: values,
          })
        }
      },
    })
  }

  createValidator() {
    return new TransformStream({
      transform: (item, controller) => {
        if (item.type === 'header') {
          controller.enqueue(item)
          return
        }

        const errors = []

        if (this.validation === 'basic' || this.validation === 'strict') {
          // 检查必填字段
          Object.entries(item.data).forEach(([key, value]) => {
            if (this.validation === 'strict' && !value) {
              errors.push(`字段 "${key}" 不能为空`)
            }
          })

          // 检查数据类型
          if (item.data.age && isNaN(Number(item.data.age))) {
            errors.push('age 必须是数字')
          }

          if (item.data.email && !/@/.test(item.data.email)) {
            errors.push('email 格式不正确')
          }
        }

        if (errors.length > 0) {
          controller.enqueue({ ...item, type: 'error', errors })
        } else {
          controller.enqueue(item)
        }
      },
    })
  }

  async parse() {
    this.startTime = Date.now()
    this.totalRows = 0
    this.validRows = 0
    this.errorRows = 0
    this.processedBytes = 0
    this.isStopped = false
    this.rows = []

    this.log(
      'info',
      `开始解析: ${this.file.name} (${this.formatSize(this.file.size)})`
    )

    const stream = this.file.stream()
    const decoder = new TextDecoderStream(this.encoding)

    try {
      await stream
        .pipeThrough(decoder)
        .pipeThrough(this.createCSVParser())
        .pipeThrough(this.createValidator())
        .pipeTo(
          new WritableStream({
            write: async (item) => {
              while (this.isPaused && !this.isStopped) {
                await new Promise((resolve) => setTimeout(resolve, 100))
              }

              if (this.isStopped) {
                throw new Error('解析已停止')
              }

              if (item.type === 'header') {
                this.log('info', `列名: ${item.headers.join(', ')}`)
                if (this.onRow) {
                  this.onRow(item)
                }
              } else if (item.type === 'row' || item.type === 'error') {
                this.totalRows++

                if (item.type === 'error') {
                  this.errorRows++
                  this.log(
                    'error',
                    `行 ${item.lineNumber} 错误: ${item.errors.join(', ')}`
                  )
                } else {
                  this.validRows++
                }

                if (this.rows.length < this.previewLimit) {
                  this.rows.push(item)
                }

                if (this.onRow) {
                  this.onRow(item)
                }

                if (this.totalRows % 1000 === 0) {
                  this.updateProgress()
                }
              }
            },
          })
        )

      const duration = ((Date.now() - this.startTime) / 1000).toFixed(1)
      const speed = Math.round(this.totalRows / parseFloat(duration))

      this.log(
        'success',
        `解析完成! 总行数: ${this.totalRows}, 耗时: ${duration}s, 速度: ${speed} 行/秒`
      )

      this.updateProgress(true)

      return {
        success: true,
        totalRows: this.totalRows,
        validRows: this.validRows,
        errorRows: this.errorRows,
        duration,
        speed,
      }
    } catch (error) {
      if (error.message === '解析已停止') {
        this.log('warning', '解析已停止')
      } else {
        this.log('error', `解析错误: ${error.message}`)
      }
      this.updateProgress(true)
      return { success: false, error: error.message }
    }
  }

  pause() {
    this.isPaused = true
    this.log('warning', '解析已暂停')
  }

  resume() {
    this.isPaused = false
    this.log('info', '解析已恢复')
  }

  stop() {
    this.isStopped = true
    this.log('warning', '正在停止解析...')
  }

  updateProgress(complete = false) {
    this.processedBytes = complete
      ? this.file.size
      : (this.totalRows / 100000) * this.file.size

    const progress = (this.processedBytes / this.file.size) * 100
    const elapsed = (Date.now() - this.startTime) / 1000
    const speed = Math.round(this.totalRows / elapsed)

    if (this.onProgress) {
      this.onProgress({ progress, complete })
    }

    if (this.onStats) {
      this.onStats({
        totalRows: this.totalRows,
        validRows: this.validRows,
        errorRows: this.errorRows,
        speed,
      })
    }
  }

  exportJSON() {
    const data = {
      headers: this.headers,
      rows: this.rows
        .filter((item) => item.type === 'row')
        .map((item) => item.data),
      stats: {
        totalRows: this.totalRows,
        validRows: this.validRows,
        errorRows: this.errorRows,
      },
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = this.file.name.replace('.csv', '.json')
    link.click()
    URL.revokeObjectURL(link.href)

    this.log('success', `已导出 JSON: ${link.download}`)
  }

  log(level, message) {
    if (this.onLog) {
      this.onLog(level, message)
    }
  }

  formatSize(bytes) {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }
}

// 生成测试 CSV
function generateTestCSV(rows = 100000) {
  const headers = ['id', 'name', 'email', 'age', 'city', 'score']
  const cities = [
    '北京',
    '上海',
    '广州',
    '深圳',
    '杭州',
    '成都',
    '西安',
    '武汉',
  ]
  const names = ['张三', '李四', '王五', '赵六', '钱七', '孙八', '周九', '吴十']

  let csv = headers.join(',') + '\n'

  for (let i = 1; i <= rows; i++) {
    const row = [
      i,
      names[Math.floor(Math.random() * names.length)],
      `user${i}@example.com`,
      Math.floor(Math.random() * 50) + 18,
      cities[Math.floor(Math.random() * cities.length)],
      Math.floor(Math.random() * 100),
    ]
    csv += row.join(',') + '\n'

    // 随机插入错误数据
    if (Math.random() < 0.05) {
      csv += `${i + 1},Test,,invalid,${cities[0]},abc\n`
      i++
    }
  }

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  return new File([blob], 'test-data.csv', { type: 'text/csv' })
}

// UI 控制
const uploadSection = document.getElementById('uploadSection')
const fileInput = document.getElementById('fileInput')
const generateBtn = document.getElementById('generateBtn')
const delimiterSelect = document.getElementById('delimiter')
const encodingSelect = document.getElementById('encoding')
const validationSelect = document.getElementById('validation')
const previewLimitInput = document.getElementById('previewLimit')
const parseBtn = document.getElementById('parseBtn')
const pauseBtn = document.getElementById('pauseBtn')
const stopBtn = document.getElementById('stopBtn')
const exportBtn = document.getElementById('exportBtn')
const statsGrid = document.getElementById('statsGrid')
const totalRowsSpan = document.getElementById('totalRows')
const validRowsSpan = document.getElementById('validRows')
const errorRowsSpan = document.getElementById('errorRows')
const processSpeedSpan = document.getElementById('processSpeed')
const progressSection = document.getElementById('progressSection')
const progressFill = document.getElementById('progressFill')
const dataPreview = document.getElementById('dataPreview')
const previewCount = document.getElementById('previewCount')
const tableHead = document.getElementById('tableHead')
const tableBody = document.getElementById('tableBody')
const log = document.getElementById('log')

let selectedFile = null
let parser = null

uploadSection.addEventListener('click', () => fileInput.click())

uploadSection.addEventListener('dragover', (e) => {
  e.preventDefault()
  uploadSection.classList.add('active')
})

uploadSection.addEventListener('dragleave', () => {
  uploadSection.classList.remove('active')
})

uploadSection.addEventListener('drop', (e) => {
  e.preventDefault()
  uploadSection.classList.remove('active')
  const files = e.dataTransfer.files
  if (files.length > 0 && files[0].name.endsWith('.csv')) {
    handleFileSelect(files[0])
  }
})

fileInput.addEventListener('change', (e) => {
  if (e.target.files.length > 0) {
    handleFileSelect(e.target.files[0])
  }
})

generateBtn.addEventListener('click', (e) => {
  e.stopPropagation()
  const file = generateTestCSV(100000)
  handleFileSelect(file)
  addLog('success', '已生成 10 万行测试 CSV 文件')
})

function handleFileSelect(file) {
  selectedFile = file
  parseBtn.disabled = false
  addLog('info', `已选择文件: ${file.name} (${formatSize(file.size)})`)
}

parseBtn.addEventListener('click', async () => {
  if (!selectedFile) return

  parser = new CSVStreamParser(selectedFile, {
    delimiter: delimiterSelect.value === '\\t' ? '\t' : delimiterSelect.value,
    encoding: encodingSelect.value,
    validation: validationSelect.value,
    previewLimit: parseInt(previewLimitInput.value),
    onProgress: updateProgress,
    onStats: updateStats,
    onRow: updatePreview,
    onLog: addLog,
  })

  parseBtn.disabled = true
  pauseBtn.disabled = false
  stopBtn.disabled = false
  statsGrid.style.display = 'grid'
  progressSection.style.display = 'block'
  dataPreview.style.display = 'block'

  tableBody.innerHTML = ''

  await parser.parse()

  parseBtn.disabled = false
  pauseBtn.disabled = true
  stopBtn.disabled = true
  exportBtn.disabled = false
})

pauseBtn.addEventListener('click', () => {
  if (parser) {
    parser.isPaused ? parser.resume() : parser.pause()
    pauseBtn.textContent = parser.isPaused ? '继续' : '暂停'
  }
})

stopBtn.addEventListener('click', () => {
  if (parser) {
    parser.stop()
  }
})

exportBtn.addEventListener('click', () => {
  if (parser) {
    parser.exportJSON()
  }
})

function updateProgress(data) {
  const { progress } = data
  progressFill.style.width = `${progress}%`
  progressFill.textContent = `${progress.toFixed(1)}%`
}

function updateStats(data) {
  totalRowsSpan.textContent = data.totalRows.toLocaleString()
  validRowsSpan.textContent = data.validRows.toLocaleString()
  errorRowsSpan.textContent = data.errorRows.toLocaleString()
  processSpeedSpan.textContent = data.speed.toLocaleString() + ' 行/秒'
}

function updatePreview(item) {
  if (item.type === 'header') {
    const headerRow = document.createElement('tr')
    item.headers.forEach((header) => {
      const th = document.createElement('th')
      th.textContent = header
      headerRow.appendChild(th)
    })
    const errorTh = document.createElement('th')
    errorTh.textContent = '错误'
    headerRow.appendChild(errorTh)
    tableHead.innerHTML = ''
    tableHead.appendChild(headerRow)
  } else if (tableBody.children.length < parseInt(previewLimitInput.value)) {
    const row = document.createElement('tr')
    if (item.type === 'error') {
      row.className = 'row-error'
    }

    item.raw.forEach((value) => {
      const td = document.createElement('td')
      td.textContent = value
      row.appendChild(td)
    })

    const errorTd = document.createElement('td')
    if (item.type === 'error') {
      errorTd.className = 'error-cell'
      errorTd.textContent = item.errors.join(', ')
    }
    row.appendChild(errorTd)

    tableBody.appendChild(row)
    previewCount.textContent = tableBody.children.length
  }
}

function addLog(level, message) {
  const entry = document.createElement('div')
  entry.className = `log-entry ${level}`
  const timestamp = new Date().toLocaleTimeString()
  entry.textContent = `[${timestamp}] ${message}`
  log.appendChild(entry)
  log.scrollTop = log.scrollHeight
}

function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}
