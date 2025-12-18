const output = document.getElementById('output')

function log(message, type = 'info') {
  const div = document.createElement('div')
  div.textContent = message
  if (type === 'error') div.className = 'error'
  if (type === 'success') div.className = 'success'
  output.appendChild(div)
  output.scrollTop = output.scrollHeight
}

// 模拟 CSV 数据源
function createCSVSource(data) {
  const lines = data.split('\n')
  let index = 0

  return new ReadableStream({
    pull(controller) {
      if (index < lines.length) {
        controller.enqueue(lines[index])
        index++
      } else {
        controller.close()
      }
    },
  })
}

// Extract：CSV 解析转换
function createCSVParser() {
  let isHeader = true
  let headers = []

  return new TransformStream({
    transform(line, controller) {
      if (!line.trim()) return

      const values = line.split(',').map((v) => v.trim())

      if (isHeader) {
        headers = values
        isHeader = false
        log(`📋 解析表头: ${headers.join(', ')}`)
      } else {
        const obj = {}
        headers.forEach((header, i) => {
          obj[header] = values[i]
        })
        controller.enqueue(obj)
      }
    },
  })
}

// Transform：数据清洗和验证
function createDataCleaner() {
  return new TransformStream({
    transform(record, controller) {
      try {
        // 验证必填字段
        if (!record.name || !record.age) {
          throw new Error('缺少必填字段')
        }

        // 数据转换
        const cleaned = {
          name: record.name.toUpperCase(),
          age: parseInt(record.age, 10),
          email: record.email?.toLowerCase() || 'N/A',
          valid: true,
        }

        // 验证年龄
        if (isNaN(cleaned.age) || cleaned.age < 0 || cleaned.age > 150) {
          throw new Error('年龄无效')
        }

        controller.enqueue(cleaned)
        log(`✅ 清洗成功: ${cleaned.name}, ${cleaned.age}岁`)
      } catch (error) {
        log(
          `❌ 清洗失败: ${error.message} - ${JSON.stringify(record)}`,
          'error'
        )
        // 发送错误标记而不是中断流
        controller.enqueue({ ...record, valid: false, error: error.message })
      }
    },
  })
}

// Transform：数据过滤
function createDataFilter() {
  return new TransformStream({
    transform(record, controller) {
      if (!record.valid) {
        log(`⚠️ 过滤无效数据: ${JSON.stringify(record)}`)
        return
      }

      if (record.age >= 18) {
        controller.enqueue(record)
      } else {
        log(`⚠️ 过滤未成年: ${record.name}`)
      }
    },
  })
}

// Load：数据加载
function createDataLoader(storage) {
  return new WritableStream({
    write(record) {
      storage.push(record)
      log(`💾 加载数据: ${record.name} - ${record.email}`, 'success')
    },
    close() {
      log(`🎉 ETL 完成！共加载 ${storage.length} 条记录`, 'success')
    },
  })
}

// 基础 ETL 管道
async function runBasicETL() {
  log('=== 开始基础 ETL 管道 ===')

  const csvData = `name,age,email
Alice,25,alice@example.com
Bob,30,BOB@EXAMPLE.COM
Charlie,17,charlie@example.com
Diana,28,diana@example.com`

  const storage = []

  try {
    await createCSVSource(csvData)
      .pipeThrough(createCSVParser())
      .pipeThrough(createDataCleaner())
      .pipeThrough(createDataFilter())
      .pipeTo(createDataLoader(storage))

    log(`\n最终存储: ${JSON.stringify(storage, null, 2)}`)
  } catch (error) {
    log(`管道错误: ${error.message}`, 'error')
  }
}

// 含错误数据的 ETL
async function runETLWithErrors() {
  log('=== 开始含错误数据的 ETL 管道 ===')

  const csvData = `name,age,email
Alice,25,alice@example.com
Bob,invalid,BOB@EXAMPLE.COM
,30,missing@example.com
Charlie,200,charlie@example.com
Diana,28,diana@example.com`

  const storage = []

  try {
    await createCSVSource(csvData)
      .pipeThrough(createCSVParser())
      .pipeThrough(createDataCleaner())
      .pipeThrough(createDataFilter())
      .pipeTo(createDataLoader(storage))

    log(`\n最终存储: ${JSON.stringify(storage, null, 2)}`)
  } catch (error) {
    log(`管道错误: ${error.message}`, 'error')
  }
}

// 并行处理多个数据源
async function runParallelETL() {
  log('=== 开始并行 ETL 管道 ===')

  const sources = [
    `name,age,email
Alice,25,alice@example.com
Bob,30,bob@example.com`,
    `name,age,email
Charlie,28,charlie@example.com
Diana,35,diana@example.com`,
    `name,age,email
Eve,22,eve@example.com
Frank,40,frank@example.com`,
  ]

  const allResults = []

  try {
    const pipelines = sources.map(async (csvData, index) => {
      log(`\n--- 处理数据源 ${index + 1} ---`)
      const storage = []

      await createCSVSource(csvData)
        .pipeThrough(createCSVParser())
        .pipeThrough(createDataCleaner())
        .pipeThrough(createDataFilter())
        .pipeTo(createDataLoader(storage))

      return storage
    })

    const results = await Promise.all(pipelines)
    results.forEach((storage, index) => {
      allResults.push(...storage)
    })

    log(`\n🎊 所有管道完成！总共加载 ${allResults.length} 条记录`, 'success')
    log(`合并结果: ${JSON.stringify(allResults, null, 2)}`)
  } catch (error) {
    log(`并行处理错误: ${error.message}`, 'error')
  }
}

// 事件监听
document.getElementById('runBasic').addEventListener('click', runBasicETL)
document
  .getElementById('runWithError')
  .addEventListener('click', runETLWithErrors)
document.getElementById('runParallel').addEventListener('click', runParallelETL)
document.getElementById('clear').addEventListener('click', () => {
  output.innerHTML = ''
})
