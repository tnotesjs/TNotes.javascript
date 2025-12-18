const output = document.getElementById('output')

function log(msg) {
  output.innerHTML += msg + '<br>'
}

function clear() {
  output.innerHTML = ''
}

// 创建一个从数组生成的可读流
function createArrayStream(array) {
  return new ReadableStream({
    start(controller) {
      for (const item of array) {
        controller.enqueue(item)
      }
      controller.close()
    },
  })
}

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

// 示例2：使用 for await...of 读取
async function demo2() {
  clear()
  log('示例2：使用异步迭代器读取')

  const numbers = [1, 2, 3, 4, 5]
  const stream = createArrayStream(numbers)

  for await (const num of stream) {
    log(`读取到: ${num}`)
  }
  log('读取完成')
}
/* 输出：
示例2：使用异步迭代器读取
读取到: 1
读取到: 2
读取到: 3
读取到: 4
读取到: 5
读取完成
*/

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
