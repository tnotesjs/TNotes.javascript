// 清空输出
function clearOutput() {
  document.getElementById('output').innerHTML = '点击按钮运行示例...'
}

// 输出帮助函数
function addOutput(text, isDone = false) {
  const output = document.getElementById('output')
  const div = document.createElement('div')
  div.className = isDone ? 'done' : 'chunk'
  div.textContent = text
  output.appendChild(div)
}

// 示例 1：数字流
async function demo1() {
  clearOutput()
  addOutput('📦 示例 1：创建数字流并读取')
  addOutput('代码：const stream = ReadableStream.from([1, 2, 3, 4, 5])', false)

  // 三行核心代码
  const stream = ReadableStream.from([1, 2, 3, 4, 5])
  const reader = stream.getReader()

  while (true) {
    const { done, value } = await reader.read()
    if (done) {
      addOutput('✅ 流读取完成', true)
      break
    }
    // 添加延迟，让用户看清读取过程
    await new Promise((r) => setTimeout(r, 300))
    addOutput(`读取到值：${value}`)
  }
}

// 示例 2：字符串流
async function demo2() {
  clearOutput()
  addOutput('📦 示例 2：创建字符串流')
  addOutput(
    '代码：const stream = ReadableStream.from(["Hello", "Web", "Streams"])',
    false
  )

  // 三行核心代码
  const stream = ReadableStream.from(['Hello', 'Web', 'Streams'])
  const reader = stream.getReader()

  let result = []
  while (true) {
    const { done, value } = await reader.read()
    if (done) {
      addOutput(`✅ 完整句子：${result.join(' ')}`, true)
      break
    }
    await new Promise((r) => setTimeout(r, 300))
    result.push(value)
    addOutput(`读取到：${value}`)
  }
}

// 示例 3：自定义对象流
async function demo3() {
  clearOutput()
  addOutput('📦 示例 3：自定义对象流')

  // 创建自定义流
  const stream = new ReadableStream({
    start(controller) {
      // 模拟实时数据生成
      const data = [
        { type: 'user', name: 'Alice' },
        { type: 'message', text: 'Hello!' },
        { type: 'user', name: 'Bob' },
        { type: 'message', text: 'Hi there!' },
      ]

      let index = 0
      const interval = setInterval(() => {
        if (index < data.length) {
          controller.enqueue(data[index++])
        } else {
          clearInterval(interval)
          controller.close()
        }
      }, 500)
    },
  })

  // 读取流
  const reader = stream.getReader()

  while (true) {
    const { done, value } = await reader.read()
    if (done) {
      addOutput('✅ 对话结束', true)
      break
    }

    if (value.type === 'user') {
      addOutput(`👤 ${value.name} 加入对话`)
    } else {
      addOutput(`💬 消息：${value.text}`)
    }
  }
}

// 页面加载提示
console.log(`
🎯 三行代码创建并消费流：

1️⃣ 创建流：
   const stream = ReadableStream.from([1, 2, 3])

2️⃣ 获取读取器：
   const reader = stream.getReader()

3️⃣ 读取数据：
   while (true) {
     const {done, value} = await reader.read()
     if (done) break
     console.log(value)
   }

💡 关键点：
- ReadableStream.from() 可以从任意可迭代对象创建流
- getReader() 获取读取器并锁定流
- read() 返回 Promise，异步读取下一个数据块

🚀 点击按钮查看不同示例！
`)
