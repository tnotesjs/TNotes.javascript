// ❌ 传统方式：一次性获取全部数据
async function traditionalFetch() {
  const output = document.getElementById('traditional-output')
  const stats = document.getElementById('traditional-stats')

  output.textContent = '请求中...'
  const startTime = performance.now()
  let firstDataTime = null

  try {
    // 必须等待完整响应
    const response = await fetch(API_URL)
    const data = await response.json()

    firstDataTime = performance.now()

    // 一次性显示所有数据
    output.textContent = `获取到 ${data.length} 条数据：\n\n`

    // 渲染前 5 条数据示例
    data.slice(0, 5).forEach((item, i) => {
      output.textContent += `${i + 1}. ${item.body.slice(0, 20)}...\n`
    })
    output.textContent += `\n... 还有 ${data.length - 5} 条数据`

    const endTime = performance.now()

    stats.innerHTML = `
      <strong>性能统计：</strong><br>
      📦 数据到达时间：<span class="highlight">${(
        firstDataTime - startTime
      ).toFixed(2)}ms</span><br>
      ⏱️ 总耗时：${(endTime - startTime).toFixed(2)}ms<br>
      📊 数据量：${data.length} 条<br>
      ⚠️ 特点：必须等待全部数据到达
    `
  } catch (error) {
    output.textContent = `错误：${error.message}`
    stats.textContent = '请求失败'
  }
}
