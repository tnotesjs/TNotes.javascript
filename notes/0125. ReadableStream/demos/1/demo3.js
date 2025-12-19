// 示例3：尝试多个 reader
async function demo3() {
  clear()
  log('示例3：尝试获取多个 reader')

  const stream = createArrayStream(['A', 'B', 'C'])

  const reader1 = stream.getReader()
  log('✅ 成功获取 reader1')
  const { value } = await reader1.read()
  log(`reader1 读取到: ${value}`)
  log(`流是否被锁定: ${stream.locked}`)

  try {
    const reader2 = stream.getReader()
    log('✅ 成功获取 reader2')
  } catch (error) {
    log(`❌ 获取 reader2 失败: ${error.message}`)
  }

  // 释放锁后可以获取新的 reader
  reader1.releaseLock()
  log('释放 reader1 的锁')

  try {
    const reader2 = stream.getReader()
    log('✅ 释放锁后成功获取 reader2')
    const { value } = await reader2.read()
    log(`reader2 读取到: ${value}`)
  } catch (error) {
    log(`❌ 错误: ${error.message}`)
  }
}
/* 输出：
示例3：尝试获取多个 reader
✅ 成功获取 reader1
reader1 读取到: A
流是否被锁定: true
❌ 获取 reader2 失败: Failed to execute 'getReader' on 'ReadableStream': ReadableStreamDefaultReader constructor can only accept readable streams that are not yet locked to a reader
释放 reader1 的锁
✅ 释放锁后成功获取 reader2
reader2 读取到: B
*/
