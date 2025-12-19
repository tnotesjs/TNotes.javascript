// 示例1：使用 reader.read() 读取
async function demo1() {
  clear()
  log('示例1：使用 reader.read() 逐个读取')

  const fruits = ['🍎', '🍌', '🍇', '🍊', '🍓']
  const stream = createArrayStream(fruits)

  const reader = stream.getReader()
  log(`流是否被锁定: ${stream.locked}`)

  while (true) {
    const { done, value } = await reader.read()
    if (done) {
      log('读取完成')
      break
    }
    log(`读取到: ${value}`)
  }

  reader.releaseLock() // 释放锁
  log(`释放锁后，流是否被锁定: ${stream.locked}`)
}
/* 输出：
示例1：使用 reader.read() 逐个读取
流是否被锁定: true
读取到: 🍎
读取到: 🍌
读取到: 🍇
读取到: 🍊
读取到: 🍓
读取完成
释放锁后，流是否被锁定: false
*/
