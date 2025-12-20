/* 
语法：

const ts1 = new TransformStream()
const ts2 = new TransformStream(transformer)
const ts3 = new TransformStream(transformer, writableStrategy)
const ts4 = new TransformStream(transformer, writableStrategy, readableStrategy)


参数说明：

transformer - 可选
  一个定义转换流式数据逻辑的对象
  如果未提供，则生成的流将是一个恒等转换流，它将所有写入可写端的分块转发到可读端，不会有任何改变
  transformer 对象可以包含以下任何方法 - 每个方法的 controller 都是一个 TransformStreamDefaultController 实例 
    start(controller) - 可选
      当 TransformStream 被构造时调用
      它通常用于使用 TransformStreamDefaultController.enqueue() 对分块进行排队
    transform(chunk, controller) - 可选
      当一个写入可写端的分块准备好转换时调用，并且执行转换流的工作
      如果没有提供 transform() 方法，则使用恒等变换，并且分块将在没有更改的情况下排队
    flush(controller) - 可选
      当所有写入可写端的分块成功转换后被调用，并且可写端将会关闭

writableStrategy - 可选
  一个定义了队列策略的可选对象 
  它需要两个参数：
    highWaterMark - 可选
      一个非负整数
      它定义了在应用背压之前内部队列包含的分块的总数 
    size(chunk) - 可选
      一个包含参数 chunk 的方法
      它表示用于每一个块的大小，以字节为单位 

readableStrategy - 可选
  一个定义了队列策略的可选对象
  它需要两个参数：
    highWaterMark - 可选
      一个非负整数
      它定义了在应用背压之前内部队列包含的分块的总数 
    size(chunk) - 可选
      一个包含参数 chunk 的方法
      它表示用于每一个块的大小，以字节为单位 
*/

// 示例：
const ts5 = new TransformStream(
  {
    // 初始化阶段 - 当 TransformStream 被构造时调用
    start(controller) {
      // 初始化状态或资源
    },
    // 转换每个分块 - 可同步或异步
    transform(chunk, controller) {
      // controller.enqueue 输出转换后的分块
    },
    // 流结束时调用一次 适合输出缓冲尾块或做最后清理
    flush(controller) {
      // 若有残余缓冲 可在此输出
    },
  },
  // 写入端队列策略
  // 影响上游背压
  {
    highWaterMark: 1,
    size() {
      return 1
    },
  },
  // 读取端队列策略
  // 影响下游背压
  {
    highWaterMark: 1,
    size() {
      return 1
    },
  }
)
// 注意事项：
// flush 仅在正常结束时调用 当上游发生错误时不会触发 flush 需要在上游或管道处统一处理错误
// 异步 transform 的返回链路会参与背压传播 较慢的转换会自动抑制上游生产速度
