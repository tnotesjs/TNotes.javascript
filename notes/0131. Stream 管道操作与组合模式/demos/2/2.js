const mainOutput = document.getElementById('mainOutput')
const statsDiv = document.getElementById('stats')
const branch1 = document.getElementById('branch1')
const branch2 = document.getElementById('branch2')
const branch3 = document.getElementById('branch3')

function log(element, message) {
  const div = document.createElement('div')
  div.textContent = message
  element.appendChild(div)
  element.scrollTop = element.scrollHeight
}

function updateStats(data) {
  statsDiv.innerHTML = Object.entries(data)
    .map(([key, value]) => `${key}: ${value}`)
    .join('<br>')
}

// 创建数据源
function createDataSource(count = 10, delay = 100) {
  let index = 0

  return new ReadableStream({
    async pull(controller) {
      if (index < count) {
        await new Promise((resolve) => setTimeout(resolve, delay))
        const data = {
          id: index + 1,
          value: Math.random(),
          timestamp: Date.now(),
        }
        controller.enqueue(data)
        index++
      } else {
        controller.close()
      }
    },
  })
}

// 扇出演示：一个源流分发到多个目标
async function runFanOut() {
  log(mainOutput, '=== 开始扇出演示 ===')
  branch1.innerHTML = ''
  branch2.innerHTML = ''
  branch3.innerHTML = ''

  const source = createDataSource(8, 50)

  // tee() 多次实现三路分支
  const [stream1, temp] = source.tee()
  const [stream2, stream3] = temp.tee()

  const storage = []
  const stats = { count: 0, sum: 0, max: 0, min: Infinity }

  // 分支 1：保存数据
  const savePipeline = stream1.pipeTo(
    new WritableStream({
      write(data) {
        storage.push(data)
        log(branch1, `💾 保存: ID=${data.id}, value=${data.value.toFixed(3)}`)
      },
    })
  )

  // 分支 2：实时显示
  const displayPipeline = stream2.pipeTo(
    new WritableStream({
      write(data) {
        log(
          branch2,
          `📺 显示: [${data.id}] ${data.value.toFixed(3)} @ ${new Date(
            data.timestamp
          ).toLocaleTimeString()}`
        )
      },
    })
  )

  // 分支 3：统计分析
  const analysisPipeline = stream3.pipeTo(
    new WritableStream({
      write(data) {
        stats.count++
        stats.sum += data.value
        stats.max = Math.max(stats.max, data.value)
        stats.min = Math.min(stats.min, data.value)

        const avg = stats.sum / stats.count

        log(branch3, `📈 统计: count=${stats.count}, avg=${avg.toFixed(3)}`)
        updateStats({
          总数: stats.count,
          平均值: avg.toFixed(3),
          最大值: stats.max.toFixed(3),
          最小值: stats.min.toFixed(3),
        })
      },
    })
  )

  // 等待所有分支完成
  await Promise.all([savePipeline, displayPipeline, analysisPipeline])

  log(mainOutput, `✅ 扇出完成！存储了 ${storage.length} 条数据`)
  log(mainOutput, `最终统计: ${JSON.stringify(stats)}`)
}

// 扇入演示：多个源流合并到一个输出
async function runFanIn() {
  log(mainOutput, '=== 开始扇入演示 ===')
  branch1.innerHTML = ''
  branch2.innerHTML = ''
  branch3.innerHTML = ''

  // 创建三个不同的数据源
  const source1 = new ReadableStream({
    async start(controller) {
      for (let i = 0; i < 5; i++) {
        await new Promise((resolve) => setTimeout(resolve, 80))
        controller.enqueue({ source: 'A', value: i })
        log(branch1, `发送: A-${i}`)
      }
      controller.close()
    },
  })

  const source2 = new ReadableStream({
    async start(controller) {
      for (let i = 0; i < 5; i++) {
        await new Promise((resolve) => setTimeout(resolve, 120))
        controller.enqueue({ source: 'B', value: i })
        log(branch2, `发送: B-${i}`)
      }
      controller.close()
    },
  })

  const source3 = new ReadableStream({
    async start(controller) {
      for (let i = 0; i < 5; i++) {
        await new Promise((resolve) => setTimeout(resolve, 100))
        controller.enqueue({ source: 'C', value: i })
        log(branch3, `发送: C-${i}`)
      }
      controller.close()
    },
  })

  // 合并流的实现
  function mergeStreams(streams) {
    const readers = streams.map((s) => s.getReader())
    const pending = new Set(readers.map((_, i) => i))

    return new ReadableStream({
      async pull(controller) {
        if (pending.size === 0) {
          controller.close()
          return
        }

        const reads = Array.from(pending).map((index) =>
          readers[index].read().then((result) => ({ index, result }))
        )

        const { index, result } = await Promise.race(reads)

        if (result.done) {
          pending.delete(index)
          if (pending.size === 0) {
            controller.close()
          } else {
            return this.pull(controller)
          }
        } else {
          controller.enqueue(result.value)
        }
      },
    })
  }

  const merged = mergeStreams([source1, source2, source3])

  const results = []
  await merged.pipeTo(
    new WritableStream({
      write(data) {
        results.push(data)
        log(mainOutput, `🔗 接收: ${data.source}-${data.value}`)
      },
    })
  )

  log(mainOutput, `✅ 扇入完成！共接收 ${results.length} 条数据`)

  const groupedStats = {}
  results.forEach((item) => {
    groupedStats[item.source] = (groupedStats[item.source] || 0) + 1
  })
  updateStats(groupedStats)
}

// 竞态演示：最快的源流获胜
async function runRace() {
  log(mainOutput, '=== 开始竞态演示 ===')
  branch1.innerHTML = ''
  branch2.innerHTML = ''
  branch3.innerHTML = ''

  // 三个不同速度的源
  const fastSource = new ReadableStream({
    async start(controller) {
      log(branch1, '🚀 快速源启动')
      for (let i = 0; i < 3; i++) {
        await new Promise((resolve) => setTimeout(resolve, 50))
        controller.enqueue({ source: 'FAST', value: i })
        log(branch1, `发送: ${i}`)
      }
      controller.close()
      log(branch1, '✅ 快速源完成')
    },
  })

  const mediumSource = new ReadableStream({
    async start(controller) {
      log(branch2, '🐢 中速源启动')
      for (let i = 0; i < 3; i++) {
        await new Promise((resolve) => setTimeout(resolve, 150))
        controller.enqueue({ source: 'MEDIUM', value: i })
        log(branch2, `发送: ${i}`)
      }
      controller.close()
      log(branch2, '✅ 中速源完成')
    },
  })

  const slowSource = new ReadableStream({
    async start(controller) {
      log(branch3, '🐌 慢速源启动')
      for (let i = 0; i < 3; i++) {
        await new Promise((resolve) => setTimeout(resolve, 300))
        controller.enqueue({ source: 'SLOW', value: i })
        log(branch3, `发送: ${i}`)
      }
      controller.close()
      log(branch3, '✅ 慢速源完成')
    },
  })

  const sources = [fastSource, mediumSource, slowSource]
  const results = []

  const races = sources.map((stream, index) => {
    const sourceName = ['FAST', 'MEDIUM', 'SLOW'][index]
    return stream
      .pipeTo(
        new WritableStream({
          write(data) {
            results.push(data)
            log(mainOutput, `📥 ${sourceName}: ${data.value}`)
          },
        })
      )
      .then(() => {
        log(mainOutput, `🏆 ${sourceName} 完成！`)
        return { source: sourceName, completedAt: Date.now() }
      })
  })

  const winner = await Promise.race(races)
  log(mainOutput, `\n🥇 获胜者: ${winner.source}`)

  await Promise.all(races)
  log(mainOutput, `\n✅ 所有源完成！共 ${results.length} 条数据`)

  const stats = {}
  results.forEach((item) => {
    stats[item.source] = (stats[item.source] || 0) + 1
  })
  updateStats(stats)
}

// 事件监听
document.getElementById('runFanOut').addEventListener('click', runFanOut)
document.getElementById('runFanIn').addEventListener('click', runFanIn)
document.getElementById('runRace').addEventListener('click', runRace)
document.getElementById('clear').addEventListener('click', () => {
  mainOutput.innerHTML = ''
  branch1.innerHTML = ''
  branch2.innerHTML = ''
  branch3.innerHTML = ''
  statsDiv.textContent = '等待运行...'
})
