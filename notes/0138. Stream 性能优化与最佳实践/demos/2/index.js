class ChunkSizeBenchmark {
  constructor(totalSizeMB, rounds) {
    this.totalSize = totalSizeMB * 1024 * 1024
    this.rounds = rounds
    this.chunkSizes = [
      { size: 4 * 1024, label: '4 KB' },
      { size: 16 * 1024, label: '16 KB' },
      { size: 64 * 1024, label: '64 KB' },
      { size: 256 * 1024, label: '256 KB' },
      { size: 1024 * 1024, label: '1 MB' },
      { size: 5 * 1024 * 1024, label: '5 MB' },
    ]
    this.results = []
  }

  async run(onProgress) {
    this.results = []
    const totalTests = this.chunkSizes.length * this.rounds

    for (let i = 0; i < this.chunkSizes.length; i++) {
      const { size, label } = this.chunkSizes[i]
      const roundResults = []

      for (let round = 0; round < this.rounds; round++) {
        const testNum = i * this.rounds + round + 1
        const progress = (testNum / totalTests) * 100

        onProgress({
          progress,
          label: `测试 ${label} (轮次 ${round + 1}/${this.rounds})`,
        })

        const result = await this.testChunkSize(size)
        roundResults.push(result)

        await new Promise((resolve) => setTimeout(resolve, 100))
      }

      const avgResult = this.averageResults(roundResults, label)
      this.results.push(avgResult)
    }

    return this.results
  }

  async testChunkSize(chunkSize) {
    const start = performance.now()
    let chunkCount = 0
    let totalBytes = 0
    const latencies = []

    const stream = this.createDataStream(chunkSize)

    await stream
      .pipeThrough(
        new TransformStream({
          transform(chunk, controller) {
            const chunkStart = performance.now()

            chunkCount++
            totalBytes += chunk.byteLength

            controller.enqueue(chunk)

            const chunkLatency = performance.now() - chunkStart
            latencies.push(chunkLatency)
          },
        })
      )
      .pipeTo(
        new WritableStream({
          write() {},
        })
      )

    const duration = performance.now() - start

    return {
      duration,
      throughput: (totalBytes / duration) * 1000,
      chunkCount,
      avgLatency: latencies.reduce((a, b) => a + b, 0) / latencies.length,
    }
  }

  createDataStream(chunkSize) {
    let sentBytes = 0

    return new ReadableStream({
      pull: (controller) => {
        if (sentBytes >= this.totalSize) {
          controller.close()
          return
        }

        const size = Math.min(chunkSize, this.totalSize - sentBytes)
        const chunk = new Uint8Array(size)
        controller.enqueue(chunk)
        sentBytes += size
      },
    })
  }

  averageResults(results, label) {
    const avg = (arr) => arr.reduce((a, b) => a + b, 0) / arr.length

    return {
      label,
      duration: avg(results.map((r) => r.duration)),
      throughput: avg(results.map((r) => r.throughput)),
      chunkCount: results[0].chunkCount,
      avgLatency: avg(results.map((r) => r.avgLatency)),
    }
  }
}

function renderResults(results) {
  const tbody = document.getElementById('resultsBody')
  tbody.innerHTML = ''

  const bestThroughput = Math.max(...results.map((r) => r.throughput))
  const worstThroughput = Math.min(...results.map((r) => r.throughput))

  results.forEach((result) => {
    const row = document.createElement('tr')

    if (result.throughput === bestThroughput) {
      row.classList.add('best')
    } else if (result.throughput === worstThroughput) {
      row.classList.add('worst')
    }

    row.innerHTML = `
      <td>${result.label}</td>
      <td>${result.duration.toFixed(2)}</td>
      <td>${(result.throughput / 1024 / 1024).toFixed(2)}</td>
      <td>${result.chunkCount.toLocaleString()}</td>
      <td>${result.avgLatency.toFixed(4)}</td>
    `

    tbody.appendChild(row)
  })
}

function renderChart(canvasId, results, dataKey, label, color) {
  const canvas = document.getElementById(canvasId)
  const ctx = canvas.getContext('2d')

  canvas.width = canvas.offsetWidth
  canvas.height = 300

  ctx.clearRect(0, 0, canvas.width, canvas.height)

  const padding = 60
  const width = canvas.width - padding * 2
  const height = canvas.height - padding * 2

  const values = results.map((r) => r[dataKey])
  const maxValue = Math.max(...values)
  const minValue = Math.min(...values)
  const range = maxValue - minValue || 1

  // 绘制Y轴标签
  ctx.fillStyle = '#666'
  ctx.font = '12px sans-serif'
  ctx.textAlign = 'right'

  for (let i = 0; i <= 5; i++) {
    const y = padding + (height / 5) * i
    const value = maxValue - (range / 5) * i

    ctx.strokeStyle = '#e0e0e0'
    ctx.beginPath()
    ctx.moveTo(padding, y)
    ctx.lineTo(canvas.width - padding, y)
    ctx.stroke()

    ctx.fillText(value.toFixed(2), padding - 10, y + 4)
  }

  // 绘制柱状图
  const barWidth = width / results.length - 20

  results.forEach((result, index) => {
    const value = result[dataKey]
    const barHeight = ((value - minValue) / range) * height

    const x = padding + (width / results.length) * index + 10
    const y = padding + height - barHeight

    // 渐变填充
    const gradient = ctx.createLinearGradient(x, y, x, y + barHeight)
    gradient.addColorStop(0, color)
    gradient.addColorStop(1, color + '80')

    ctx.fillStyle = gradient
    ctx.fillRect(x, y, barWidth, barHeight)

    // 绘制数值
    ctx.fillStyle = '#333'
    ctx.font = '11px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(value.toFixed(2), x + barWidth / 2, y - 5)

    // 绘制X轴标签
    ctx.fillStyle = '#666'
    ctx.font = '12px sans-serif'
    ctx.save()
    ctx.translate(x + barWidth / 2, padding + height + 20)
    ctx.rotate(-Math.PI / 6)
    ctx.textAlign = 'right'
    ctx.fillText(result.label, 0, 0)
    ctx.restore()
  })

  // 绘制坐标轴
  ctx.strokeStyle = '#333'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(padding, padding)
  ctx.lineTo(padding, padding + height)
  ctx.lineTo(canvas.width - padding, padding + height)
  ctx.stroke()

  // 绘制标题
  ctx.fillStyle = '#333'
  ctx.font = 'bold 14px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText(label, canvas.width / 2, 20)
}

// UI 控制
const runTestBtn = document.getElementById('runTestBtn')
const progress = document.getElementById('progress')
const progressFill = document.getElementById('progressFill')
const progressLabel = document.getElementById('progressLabel')
const totalSizeInput = document.getElementById('totalSize')
const roundsInput = document.getElementById('rounds')

runTestBtn.addEventListener('click', async () => {
  const totalSize = parseInt(totalSizeInput.value)
  const rounds = parseInt(roundsInput.value)

  runTestBtn.disabled = true
  progress.classList.add('show')

  const benchmark = new ChunkSizeBenchmark(totalSize, rounds)

  const results = await benchmark.run((status) => {
    progressFill.style.width = `${status.progress}%`
    progressFill.textContent = `${status.progress.toFixed(0)}%`
    progressLabel.textContent = status.label
  })

  renderResults(results)
  renderChart(
    'throughputChart',
    results,
    'throughput',
    '吞吐量 (字节/秒)',
    '#667eea'
  )
  renderChart(
    'latencyChart',
    results,
    'avgLatency',
    '平均延迟 (毫秒)',
    '#764ba2'
  )

  progress.classList.remove('show')
  runTestBtn.disabled = false
})
