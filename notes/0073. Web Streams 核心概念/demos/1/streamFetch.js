// ✅ 流式处理：边接收边处理
async function streamFetch() {
  const output = document.getElementById('stream-output')
  const stats = document.getElementById('stream-stats')

  output.textContent = '请求中...\n'
  const startTime = performance.now()
  let firstDataTime = null
  let chunkCount = 0
  let totalBytes = 0

  try {
    const response = await fetch(API_URL)

    // 获取可读流
    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    output.textContent = '开始接收数据流...\n\n'

    while (true) {
      const { done, value } = await reader.read()

      if (done) {
        output.textContent += `\n✅ 流读取完成`
        break
      }

      // 记录第一次数据到达时间
      if (firstDataTime === null) {
        firstDataTime = performance.now()
      }

      chunkCount++
      totalBytes += value.length

      // 解码数据块
      buffer += decoder.decode(value, { stream: true })

      // 更新输出（显示接收到的字节数）
      output.textContent += `📦 Chunk ${chunkCount}：${value.length} bytes\n`

      // 实时更新统计
      stats.innerHTML = `
        <strong>实时统计：</strong><br>
        ⚡ 首次数据到达：<span class="highlight">${
          firstDataTime ? (firstDataTime - startTime).toFixed(2) : '等待中'
        }ms</span><br>
        📦 已接收 Chunk：${chunkCount} 个<br>
        📊 累计字节数：${totalBytes} bytes<br>
        ✅ 特点：边接收边显示
      `

      // 模拟延迟，让用户看清流式接收过程
      await new Promise((resolve) => setTimeout(resolve, 100))
    }

    // 解析完整数据
    const data = JSON.parse(buffer)
    const endTime = performance.now()

    output.textContent += `\n\n解析到 ${data.length} 条数据（前 5 条）：\n\n`

    // 渲染前 5 条数据示例
    data.slice(0, 5).forEach((item, i) => {
      output.textContent += `${i + 1}. ${item.body.slice(0, 20)}...\n`
    })

    stats.innerHTML += `<br>⏱️ 总耗时：${(endTime - startTime).toFixed(2)}ms`
  } catch (error) {
    output.textContent = `错误：${error.message}`
    stats.textContent = '请求失败'
  }
}
