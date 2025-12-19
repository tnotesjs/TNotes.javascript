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
