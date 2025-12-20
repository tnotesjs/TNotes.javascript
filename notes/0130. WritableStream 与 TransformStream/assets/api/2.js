// 写入器 writer 是一个 WritableStreamDefaultWriter 实例对象，也就是 WritableStream.getWriter() 的返回结果
const writable = new WritableStream({
  // ...
})
const writer = writable.getWriter()
// 这个 writer 就是写入器
// 它是一个 WritableStreamDefaultWriter 实例对象

/* 
实例属性：
  WritableStreamDefaultWriter.closed
    只读
    允许你编写当流结束时执行的代码
    返回一个流关闭时兑现的 promise，或者在抛出错误或者 writer 的锁释放时被拒绝
  WritableStreamDefaultWriter.desiredSize
    只读
    返回填充满流的内部队列所需要的大小
  WritableStreamDefaultWriter.ready
    只读
    返回一个 Promise
    当流填充内部队列的所需大小从非正数变为正数时兑现，表明它不再应用背压
*/

/* 
实例方法：
  WritableStreamDefaultWriter.abort()
    中止流
    表示生产者不能再向流写入数据（会立刻返回一个错误状态），并丢弃所有已入队的数据
  WritableStreamDefaultWriter.close()
    关闭关联的可写流
  WritableStreamDefaultWriter.releaseLock()
    释放 writer 对相应流的锁定
    释放锁后，writer 将不再处于锁定状态
    如果释放锁时关联流出错，writer 随后也会以同样的方式发生错误；此外，writer 将关闭
  WritableStreamDefaultWriter.write()
    将传递的数据块写入 WritableStream 和它的底层接收器，然后返回一个 Promise
    Promise 的状态由写入操作是否成功来决定
*/
