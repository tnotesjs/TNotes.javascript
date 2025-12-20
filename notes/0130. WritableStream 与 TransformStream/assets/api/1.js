// 语法：
// const writable = new WritableStream(underlyingSink)
// const writable = new WritableStream(underlyingSink, queuingStrategy)

// 两个参数都是可选的：
// 参数1：underlyingSink（可选）
// 参数2：queuingStrategy（可选）

// underlyingSink
// underlyingSink 是一个包含方法和属性的对象，这些方法和属性定义了构造的流的实例的具体行为
// underlyingSink 对象身上的所有成员都是可选的

// queuingStrategy
// queuingStrategy 是一个可选的定义流的队列策略的对象
// queuingStrategy 对象身上的所有成员都是可选的
// 你也可以只用 ByteLengthQueuingStrategy 或 CountQueuingStrategy 实例来作为 queuingStrategy
// 如果没有提供 queuingStrategy，则使用的默认值与 CountQueuingStrategy 相同，其 highWaterMark 为 1

// 示例：
const writable = new WritableStream(
  // underlyingSink
  {
    start(controller) {
      // start 在写入开始前调用一次
      // 可用于打开文件句柄或初始化网络连接
      // 通常用于做一些初始化操作
      // 比如分配资源或设置状态
    },
    write(chunk, controller) {
      // write 在每个分块到达时调用
      // 可返回 Promise 以配合背压与异步写入
      // 通常用于处理分块
      // 比如写入文件或推送到服务器
    },
    close(controller) {
      // close 在上游结束时调用
      // 通常用于正常收尾与资源释放
      // 比如关闭文件或连接
    },
    abort(reason) {
      // abort 在异常中止时调用
      // 通常用于异常情况下的清理
      // 比如：记录原因 + 释放资源
    },
  },

  // queuingStrategy
  {
    // highWaterMark
    // 非负整数
    // 这定义了在应用背压之前可以包含在内部队列中的分块的最大数量
    // 控制背压触发阈值
    highWaterMark: 3,

    size(chunk) {
      // size
      // 返回每个分块的体积估算值
      // 与高水位线共同决定背压
      return 1
    },
  }
)

// 获取写入器 独占锁定写入端
const writer = writable.getWriter()

// desiredSize 表示队列剩余容量 小于等于 0 表示应当等待
console.log(writer.desiredSize)
// writer.desiredSize 的取值边界说明：
// writer.desiredSize > 0     表示仍有空间 可以继续写入
// writer.desiredSize = 0     表示达到高水位线 建议等待 writer.ready
// writer.desiredSize < 0     表示队列超载 必须等待 writer.ready
// writer.desiredSize = null  表示写入端不可用 比如已关闭或出错

// 避免压垮下游
await writer.ready // 1. 先等待就绪
await writer.write('data') // 2. 再继续写入
